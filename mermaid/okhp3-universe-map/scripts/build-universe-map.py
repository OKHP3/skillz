#!/usr/bin/env python3
"""Generate bounded Mermaid maps from local search indexes. Standard library only."""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlsplit

VERSION = "0.1.4"
ASSETS = Path(__file__).resolve().parents[1] / "assets"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def label(value):
    # Numeric Mermaid entities prevent quotes, directives, and HTML injection.
    return "".join(c if c.isalnum() or c in " .,:/_-()" else f"#{ord(c)};"
                   for c in " ".join(str(value).split()))


def canonical_origin(raw):
    if not isinstance(raw, str) or any(c.isspace() for c in raw):
        raise ValueError(f"Invalid site origin: {raw!r}")
    parsed = urlsplit(raw)
    if (parsed.scheme != "https" or not parsed.hostname or parsed.path
            or parsed.query or parsed.fragment or parsed.username or parsed.password):
        raise ValueError("Site origin must be an HTTPS origin without a path")
    # URL schemes and hostnames are case-insensitive; 443 is HTTPS's default port.
    authority = parsed.netloc.lower()
    if parsed.port == 443:
        authority = authority.rsplit(":", 1)[0]
    return "https://" + authority


def safe_url(raw, origin):
    if not isinstance(raw, str) or not raw or any(c.isspace() for c in raw):
        raise ValueError(f"Invalid URL: {raw!r}")
    if any(c in raw for c in '\\"<>'):
        raise ValueError(f"Unsafe URL: {raw!r}")
    result = urljoin(origin + "/", raw)
    parsed = urlsplit(result)
    if (parsed.scheme != "https" or canonical_origin(f"{parsed.scheme}://{parsed.netloc}") != origin
            or parsed.username or parsed.password or parsed.query):
        raise ValueError(f"URL outside configured origin or contains query: {raw!r}")
    return parsed._replace(scheme="https", netloc=urlsplit(origin).netloc,
                           path=parsed.path or "/").geturl()


def build(config_path):
    config = read_json(config_path)
    if not isinstance(config, dict) or config.get("schema") != 1 or not isinstance(config.get("sites"), list) or not config["sites"]:
        raise ValueError("Config requires schema: 1 and a nonempty sites array")
    maximum = config.get("max_children", 18)
    if not isinstance(maximum, int) or not 1 <= maximum <= 18:
        raise ValueError("max_children must be 1..18 (at most 19 nodes per diagram)")
    nodes, sources, excluded, origins = {}, [], [], set()
    for site in config["sites"]:
        if not isinstance(site, dict) or not isinstance(site.get("origin"), str) or not isinstance(site.get("title"), str) or not site["title"].strip():
            raise ValueError("Each site requires string origin and nonempty title")
        origin = canonical_origin(site["origin"].rstrip("/"))
        if origin in origins:
            raise ValueError("Duplicate site origin")
        origins.add(origin)
        index_path = site.get("index")
        if not isinstance(index_path, str) or not index_path.strip() or "://" in index_path:
            raise ValueError("Site index must be a nonempty local file path")
        source_path = (config_path.parent / index_path).resolve()
        data = read_json(source_path)
        if not isinstance(data, dict):
            raise ValueError("Index must be a JSON object")
        keys = [key for key in ("entries", "pages") if key in data]
        if len(keys) != 1 or not isinstance(data[keys[0]], list) or not data[keys[0]]:
            raise ValueError("Index requires exactly one nonempty entries or pages array")
        entries = data[keys[0]]
        sources.append({"origin": origin, "sha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
                        "records": len(entries)})
        for entry in entries:
            if not isinstance(entry, dict):
                raise ValueError("Each index record must be an object")
            url = safe_url(entry["url"], origin)
            if urlsplit(url).fragment and not config.get("include_sections", False):
                excluded.append({"url": url, "reason": "section-detail-disabled"})
                continue
            if not isinstance(entry.get("title"), str) or not entry["title"].strip():
                raise ValueError(f"Missing title: {url}")
            if url in nodes:
                raise ValueError(f"Duplicate canonical URL: {url}")
            nodes[url] = {"id": url, "url": url, "title": entry["title"],
                          "description": str(entry.get("description", "")), "origin": origin,
                          "status": "Published page", "indexed": True,
                          "parent": safe_url(entry["parent"], origin) if entry.get("parent") else None}
        root = origin + "/"
        nodes.setdefault(root, {"id": root, "url": None, "title": site["title"],
                               "description": "Site grouping", "origin": origin,
                               "status": "Grouping", "indexed": False, "parent": None})
    overlay = config.get("overlay", {})
    if not isinstance(overlay, dict) or not isinstance(overlay.get("pages", {}), dict) or not isinstance(overlay.get("concepts", []), list):
        raise ValueError("Overlay requires pages object and concepts array")
    def normalize_reference(reference):
        if not isinstance(reference, str) or not reference:
            raise ValueError("Overlay references must be nonempty strings")
        if any(c.isspace() for c in reference):
            raise ValueError(f"Invalid overlay reference: {reference!r}")
        if reference.startswith("concept:"):
            if not re.fullmatch(r"concept:[a-z0-9]+(?:-[a-z0-9]+)*", reference):
                raise ValueError(f"Invalid concept reference: {reference!r}")
            return reference
        parsed = urlsplit(reference)
        origin = canonical_origin(f"{parsed.scheme}://{parsed.netloc}")
        if origin not in origins:
            raise ValueError(f"Overlay URL requires a configured absolute origin: {reference}")
        return safe_url(reference, origin)

    overlay_keys = set()
    for key, values in overlay.get("pages", {}).items():
        key = normalize_reference(key)
        if key in overlay_keys:
            raise ValueError(f"Duplicate canonical overlay URL: {key}")
        overlay_keys.add(key)
        if not isinstance(values, dict) or any(not isinstance(v, str) or not v.strip() for v in values.values()):
            raise ValueError("Page overlay values must be nonempty strings")
        if key not in nodes or not nodes[key]["indexed"]:
            raise ValueError(f"Overlay page is absent from index: {key}")
        if set(values) - {"parent", "status"}:
            raise ValueError("Page overlays support only parent and status; titles stay index-owned")
        values = dict(values)
        if "parent" in values:
            values["parent"] = normalize_reference(values["parent"])
        nodes[key].update(values)
    for concept in overlay.get("concepts", []):
        if not isinstance(concept, dict):
            raise ValueError("Concept must be an object")
        concept = dict(concept)
        if "origin" in concept:
            concept["origin"] = canonical_origin(concept["origin"])
        key = concept["id"]
        if not re.fullmatch(r"concept:[a-z0-9]+(?:-[a-z0-9]+)*", key) or key in nodes:
            raise ValueError("Concept IDs must be unique concept:kebab-case identifiers")
        if concept["status"] not in {"Planned", "Shelved", "Retired"}:
            raise ValueError("Concept status must be explicit: Planned, Shelved, or Retired")
        if concept.get("url"):
            raise ValueError("Unpublished concepts cannot have links")
        if not concept.get("title") or concept.get("origin") not in origins:
            raise ValueError("Concept requires title and configured origin")
        concept = dict(concept)
        if concept.get("parent"):
            concept["parent"] = normalize_reference(concept["parent"])
        nodes[key] = {**concept, "url": None, "indexed": False,
                      "description": concept.get("description", "")}
    for key, node in nodes.items():
        root = node["origin"] + "/"
        if key == root:
            if node.get("parent"):
                raise ValueError("Site roots cannot have parents")
            continue
        if not node.get("parent"):
            path = urlsplit(key)
            candidate = key.split("#")[0] if path.fragment else None
            if path.fragment and candidate not in nodes:
                raise ValueError(f"Section has no indexed base page: {key}")
            if candidate not in nodes:
                candidate = None
                parts = path.path.strip("/").split("/")
                for count in range(len(parts) - 1, 0, -1):
                    possible = node["origin"] + "/" + "/".join(parts[:count])
                    matches = [url for url in (possible, possible + "/") if url in nodes]
                    if len(matches) > 1:
                        raise ValueError(f"Ambiguous indexed ancestors for {key}; set an explicit parent")
                    if matches:
                        candidate = matches[0]
                        break
            node["parent"] = candidate or root
        if node["parent"] not in nodes:
            raise ValueError(f"Missing parent for {key}: {node['parent']}")
    for key in nodes:
        seen, cursor = set(), key
        while cursor:
            if cursor in seen:
                raise ValueError(f"Parent cycle at {key}")
            seen.add(cursor)
            cursor = nodes[cursor].get("parent")
    template = (ASSETS / "map-template.mmd").read_text(encoding="utf-8")
    outputs, diagrams = {}, []
    for parent in sorted(nodes):
        children = sorted((n for n in nodes.values() if n.get("parent") == parent), key=lambda n: n["id"])
        # Include a singleton site root if its index has only a home page.
        if not children and parent != nodes[parent]["origin"] + "/":
            continue
        for offset in range(0, max(1, len(children)), maximum):
            group = [nodes[parent]] + children[offset:offset + maximum]
            lines = []
            for node in group:
                ident = "n" + digest(node["id"])[:16]
                title = label(node["title"] + " (" + node["status"] + ")")
                lines.append(f'  {ident}["{title}"]')
                if not node["indexed"]:
                    lines.append(f"  class {ident} concept")
                if node["url"]:
                    lines.append(f'  click {ident} "{node["url"]}" "{label(node["description"])}" _self')
                if node["id"] != parent:
                    lines.append(f"  n{digest(parent)[:16]} --> {ident}")
            filename = f"universe-{digest(parent)[:12]}-detail-analyst-v1-{offset // maximum + 1}.mmd"
            outputs[filename] = template.replace("{{CONTENT}}", "\n".join(lines))
            diagrams.append({"file": filename, "parent": parent, "nodes": [n["id"] for n in group]})
    outline = ['<!-- AUTOGEN:UNIVERSE-MAP -->', '<section aria-label="Universe map">']
    for diagram in diagrams:
        outline.append('<details><summary>' + html.escape(nodes[diagram["parent"]]["title"]) + '</summary>')
        outline.append('<pre class="mermaid">' + html.escape(outputs[diagram["file"]]) + '</pre><ul>')
        for key in diagram["nodes"]:
            node = nodes[key]
            title = html.escape(node["title"])
            if node["url"]:
                title = '<a href="' + html.escape(node["url"], quote=True) + '">' + title + '</a>'
            outline.append('<li>' + title + ' (' + html.escape(node["status"]) + ') ' + html.escape(node["description"]) + '</li>')
        outline.append('</ul></details>')
    outline.extend(['</section>', '<!-- /AUTOGEN:UNIVERSE-MAP -->'])
    outputs["universe-map.html-fragment"] = "\n".join(outline) + "\n"
    report = {"schema": 1, "generator": VERSION, "config_sha256": digest(json.dumps(config, sort_keys=True)),
              "sources": sources, "nodes": [nodes[k] for k in sorted(nodes)],
              "excluded": excluded, "diagrams": diagrams, "render_status": "not-run"}
    outputs["universe-map.json"] = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    outputs["DIAGRAMS.md"] = ("# Generated universe diagram registry\n\n"
        "Audience: site visitors using an analyst-level navigation map. Status: draft until rendered and reviewed.\n\n"
        "| File | Parent | Family | Status |\n|---|---|---|---|\n" +
        "\n".join(f"| {d['file']} | {html.escape(d['parent']).replace('|', '&#124;')} | universe-map | draft |" for d in diagrams) + "\n")
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--output", type=Path, help="Dedicated generated-output directory")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--write", action="store_true", help="Write generated files; never delete stale files")
    mode.add_argument("--check", action="store_true", help="Fail on missing, stale, or extra files")
    args = parser.parse_args()
    try:
        outputs = build(args.config.resolve())
        if args.write or args.check:
            if not args.output:
                raise ValueError("--output required for --write or --check")
            target = args.output.resolve()
            sources = [(args.config.resolve().parent / s["index"]).resolve()
                       for s in read_json(args.config)["sites"]]
            package = Path(__file__).resolve().parents[1]
            if target == package or package in target.parents or target == Path(target.anchor) or any(p == target or target in p.parents for p in sources + [args.config.resolve(), Path(__file__).resolve()]):
                raise ValueError("Output must be a dedicated directory outside source/config/package paths")
            extra = {p.relative_to(target).as_posix() for p in target.rglob('*') if p.is_file()} - set(outputs) if target.exists() else set()
            if extra:
                raise ValueError("Unexpected/stale output files preserved; use a new output directory: " + ", ".join(sorted(extra)))
            if any((target / name).is_symlink() for name in outputs):
                raise ValueError("Refusing symlink output files")
            stale = [name for name, value in outputs.items()
                     if not (target / name).exists() or (target / name).read_bytes() != value.encode("utf-8")]
            if args.check and stale:
                raise ValueError("Stale generated output: " + ", ".join(stale))
            if args.write:
                target.mkdir(parents=True, exist_ok=True)
                for name in stale:
                    (target / name).write_bytes(outputs[name].encode("utf-8"))
        print(json.dumps({"status": "checked" if args.check else "written" if args.write else "preview",
                          "files": list(outputs)}, indent=2))
        return 0
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
