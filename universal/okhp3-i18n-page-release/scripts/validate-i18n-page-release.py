#!/usr/bin/env python3
"""Validate localized static HTML page-release metadata without writing files."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


VALID_STATES = {"indexable", "draft-noindex"}
BCP47_SYNTAX_RE = re.compile(r"^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$")


@dataclass
class PageMetadata:
    lang: str = ""
    canonicals: list[str] = field(default_factory=list)
    og_url: str = ""
    robots: str = ""
    alternates: dict[str, list[str]] = field(default_factory=dict)
    outside_head: list[str] = field(default_factory=list)

    @property
    def noindex(self) -> bool:
        return "noindex" in self.robots.lower()


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.metadata = PageMetadata()
        self.in_head = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "").strip() for key, value in attrs}
        tag = tag.lower()
        if tag == "html":
            self.metadata.lang = values.get("lang", "")
        elif tag == "head":
            self.in_head = True
        elif tag == "meta":
            if not self.in_head and (values.get("name", "").lower() == "robots" or values.get("property", "").lower() == "og:url"):
                self.metadata.outside_head.append("meta metadata")
                return
            if values.get("name", "").lower() == "robots":
                self.metadata.robots = values.get("content", "")
            if values.get("property", "").lower() == "og:url":
                self.metadata.og_url = values.get("content", "")
        elif tag == "link":
            rels = set(values.get("rel", "").lower().split())
            href = values.get("href", "")
            is_metadata_link = "canonical" in rels or ("alternate" in rels and values.get("hreflang"))
            if is_metadata_link and not self.in_head:
                self.metadata.outside_head.append("link metadata")
                return
            if "canonical" in rels:
                self.metadata.canonicals.append(href)
            if "alternate" in rels and values.get("hreflang") and href:
                self.metadata.alternates.setdefault(values["hreflang"], []).append(href)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "head":
            self.in_head = False


def parse_page(path: Path) -> PageMetadata:
    parser = MetadataParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser.metadata


def absolute_url(origin: str, route: str) -> str:
    return origin.rstrip("/") + "/" + route.lstrip("/")


def valid_tag(value: object) -> bool:
    return isinstance(value, str) and bool(BCP47_SYNTAX_RE.fullmatch(value))


def valid_route(value: object) -> bool:
    return isinstance(value, str) and value.startswith("/") and not value.startswith("//") and "\\" not in value and ".." not in value.split("/")


def valid_relative_path(value: object) -> bool:
    if not isinstance(value, str) or not value or "\\" in value:
        return False
    path = Path(value)
    return not path.is_absolute() and ".." not in path.parts


def load_registry(path: Path) -> dict:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("registry root must be an object")
    if payload.get("schema_version") != "1.0":
        raise ValueError("registry schema_version must be '1.0'")
    origin = payload.get("site_origin")
    parsed = urlparse(origin) if isinstance(origin, str) else None
    if not parsed or parsed.scheme != "https" or not parsed.netloc or origin.endswith("/"):
        raise ValueError("site_origin must be an HTTPS origin without a trailing slash")
    default = payload.get("default_locale")
    if not isinstance(default, dict) or not valid_tag(default.get("tag")):
        raise ValueError("default_locale.tag must use basic BCP-47 syntax")
    policy = payload.get("release_policy", {})
    if not isinstance(policy, dict):
        raise ValueError("release_policy must be an object when provided")
    require_x_default = policy.get("require_x_default", True)
    html_lang = policy.get("html_lang", "exact-locale")
    if not isinstance(require_x_default, bool):
        raise ValueError("release_policy.require_x_default must be boolean")
    if html_lang not in {"exact-locale", "primary-language"}:
        raise ValueError("release_policy.html_lang must be exact-locale or primary-language")
    x_default = default.get("x_default_url")
    if require_x_default and not valid_route(x_default):
        raise ValueError("default_locale.x_default_url is required when require_x_default is true")
    if x_default is not None and not valid_route(x_default):
        raise ValueError("default_locale.x_default_url must be an absolute site route when provided")
    payload["release_policy"] = {"require_x_default": require_x_default, "html_lang": html_lang}
    locales = payload.get("locales")
    if not isinstance(locales, dict) or not locales:
        raise ValueError("locales must be a non-empty object keyed by BCP-47 tag")
    for tag, entry in locales.items():
        if not valid_tag(tag) or not isinstance(entry, dict):
            raise ValueError("every locale key and entry must be valid")
        for key in ("root", "direction", "label", "translation_skill"):
            if not isinstance(entry.get(key), str) or not entry[key]:
                raise ValueError(f"locale {tag!r} requires non-empty {key!r}")
        if not valid_relative_path(entry["root"]):
            raise ValueError(f"locale {tag!r} root must be a relative in-site path")
    routes = payload.get("routes")
    if not isinstance(routes, list) or not routes:
        raise ValueError("routes must be a non-empty array")
    return payload


def validate_page(
    root: Path,
    path: str,
    expected_url: str,
    expected_lang: str,
    expected_alternates: dict[str, str],
    state: str,
    check_og: bool,
    errors: list[str],
) -> None:
    page_path = root / path
    if not page_path.is_file():
        errors.append(f"missing page: {path}")
        return
    metadata = parse_page(page_path)
    if metadata.lang != expected_lang:
        errors.append(f"{path}: html lang is {metadata.lang!r}, expected {expected_lang!r}")
    for item in metadata.outside_head:
        errors.append(f"{path}: {item} must be inside head")
    if len(metadata.canonicals) != 1:
        errors.append(f"{path}: requires exactly one canonical link in head")
    elif metadata.canonicals[0] != expected_url:
        errors.append(f"{path}: canonical is {metadata.canonicals[0]!r}, expected self URL {expected_url!r}")
    if check_og and metadata.og_url != expected_url:
        errors.append(f"{path}: og:url is {metadata.og_url!r}, expected {expected_url!r}")
    if state == "indexable" and metadata.noindex:
        errors.append(f"{path}: indexable page must not be noindex")
    if state == "draft-noindex":
        if not metadata.noindex:
            errors.append(f"{path}: draft-noindex page must declare noindex")
        if metadata.alternates:
            errors.append(f"{path}: draft-noindex page must not publish hreflang alternates")
        return
    for lang, href in expected_alternates.items():
        actual = metadata.alternates.get(lang, [])
        if len(actual) != 1:
            errors.append(f"{path}: requires exactly one hreflang={lang!r} link in head")
        elif actual[0] != href:
            errors.append(f"{path}: missing hreflang={lang!r} href={href!r}")
    unexpected = sorted(set(metadata.alternates) - set(expected_alternates))
    if unexpected:
        errors.append(f"{path}: contains alternates outside the public locale cluster: {', '.join(unexpected)}")


def validate(root: Path, registry: dict) -> list[str]:
    errors: list[str] = []
    origin = registry["site_origin"]
    default = registry["default_locale"]
    locales = registry["locales"]
    check_og = bool(registry.get("check_open_graph_url", False))
    policy = registry["release_policy"]
    for index, route in enumerate(registry["routes"], start=1):
        if not isinstance(route, dict) or not isinstance(route.get("source"), dict):
            errors.append(f"routes[{index}]: source must be an object")
            continue
        source = route["source"]
        if not valid_relative_path(source.get("path")) or not valid_route(source.get("url")):
            errors.append(f"routes[{index}]: source requires path and url")
            continue
        targets = route.get("targets", {})
        if not isinstance(targets, dict):
            errors.append(f"routes[{index}]: targets must be an object")
            continue
        public: dict[str, tuple[str, str, str]] = {
            default["tag"]: (source["path"], source["url"], "indexable")
        }
        for tag, target in targets.items():
            if tag not in locales:
                errors.append(f"routes[{index}]: target locale {tag!r} is not declared")
                continue
            if not isinstance(target, dict) or not valid_relative_path(target.get("path")) or not valid_route(target.get("url")):
                errors.append(f"routes[{index}]: target {tag!r} requires path and url")
                continue
            state = target.get("state")
            if state not in VALID_STATES:
                errors.append(f"routes[{index}]: target {tag!r} state must be indexable or draft-noindex")
                continue
            if state == "indexable":
                public[tag] = (target["path"], target["url"], state)
        expected_alternates = {tag: absolute_url(origin, item[1]) for tag, item in public.items()}
        if policy["require_x_default"]:
            expected_alternates["x-default"] = absolute_url(origin, default["x_default_url"])
        for tag, (path, url, state) in public.items():
            expected_lang = tag if policy["html_lang"] == "exact-locale" else tag.split("-", 1)[0]
            validate_page(root, path, absolute_url(origin, url), expected_lang, expected_alternates, state, check_og, errors)
        for tag, target in targets.items():
            if not isinstance(target, dict) or target.get("state") != "draft-noindex":
                continue
            if isinstance(target.get("path"), str) and isinstance(target.get("url"), str):
                expected_lang = tag if policy["html_lang"] == "exact-locale" else tag.split("-", 1)[0]
                validate_page(root, target["path"], absolute_url(origin, target["url"]), expected_lang, {}, "draft-noindex", check_og, errors)
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate localized static-page release metadata without writing files.")
    parser.add_argument("--root", default=".", help="site root containing the HTML files")
    parser.add_argument("--registry", required=True, help="locale registry JSON path, relative to --root unless absolute")
    parser.add_argument("--check", action="store_true", help="exit 1 when structural errors exist")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)
    root = Path(args.root).resolve()
    registry_path = Path(args.registry)
    if not registry_path.is_absolute():
        registry_path = root / registry_path
    try:
        registry = load_registry(registry_path)
        errors = validate(root, registry)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors = [str(exc)]
    result = {
        "registry": str(registry_path),
        "errors": errors,
        "scope": "static HTML metadata only; no translation, publication, rendered-body detection, native-review, or search-performance certification",
    }
    if args.format == "json":
        print(json.dumps(result, indent=2))
    elif errors:
        print("i18n page release validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
    else:
        print(f"i18n page release validation passed: {registry_path}")
    return 1 if args.check and errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
