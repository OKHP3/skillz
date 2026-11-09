#!/usr/bin/env python3
"""Build a LinkedIn document carousel (PNG pages, PDF, contact sheet) from a JSON spec.

Local-only and deterministic. Every text field is HTML-escaped; the spec cannot
inject markup, scripts, remote fonts, or remote images. Rendering runs with page
JavaScript disabled and aborts every request that is not inline content. Files
are written only inside --out, with fixed names plus the validated slug.

Outputs in --out: NN.html and NN.png per page, <slug>.pdf, contact-sheet.jpg,
pages-text.md (the accessible text outline, because the PDF is image-only), and
build-report.json.

Usage:
  build_carousel.py SPEC.json --out DIR            # validate, render, write report
  build_carousel.py SPEC.json --check              # validate the spec only (no browser)
  build_carousel.py SPEC.json --out DIR --html-only  # write per-page HTML, no browser

Exit codes: 0 ok, 1 spec or lint errors, 2 missing runtime (Playwright or Pillow).
"""
from __future__ import annotations

import argparse
import html
import json
import pathlib
import re
import sys

WIDTH, HEIGHT = 1080, 1350
MIN_PAGES, MAX_PAGES, ADVISED_MAX = 2, 20, 12
MIN_BODY_PX = 24
HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
BLOCK_TYPES = {"text", "compare", "steps", "panel", "bullets", "stat"}

DEFAULT_THEME = {
    "bg": "#0f1724",
    "fg": "#ffffff",
    "body": "#c8d3e2",
    "muted": "#93a4bd",
    "accent": "#f5a524",
    "panel": "#162238",
    "border": "#2a3a55",
    "font": "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


# ---------- validation ----------

def _luminance(hex_color: str) -> float:
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a: str, b: str) -> float:
    la, lb = sorted((_luminance(a), _luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


DIGIT = re.compile(r"\d")


def _page_strings(page: dict) -> list[str]:
    out = [str(page.get("title", "")), str(page.get("title_accent", ""))]
    for block in page.get("blocks", []):
        for key in ("text", "value", "label", "left", "right"):
            out.append(str(block.get(key, "")))
        for item in block.get("items", []):
            out += [str(v) for v in (item.values() if isinstance(item, dict) else [item])]
        for row in block.get("rows", []):
            out += [str(v) for v in row]
    return out


def _looks_factual(page: dict) -> bool:
    if any(b.get("type") == "stat" for b in page.get("blocks", [])):
        return True
    return any(DIGIT.search(s) for s in _page_strings(page)[2:])


def validate(spec: dict) -> tuple[list[str], list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    theme = dict(DEFAULT_THEME)
    theme.update(spec.get("theme") or {})
    for key in ("bg", "fg", "body", "muted", "accent", "panel", "border"):
        if not HEX.match(str(theme.get(key, ""))):
            errors.append(f"theme.{key} must be a #rrggbb color")
    if not errors:
        for key, floor in (("fg", 4.5), ("body", 4.5), ("muted", 4.5), ("accent", 3.0)):
            ratio = contrast(theme[key], theme["bg"])
            if ratio < floor:
                errors.append(f"theme.{key} contrast {ratio:.2f}:1 on bg is below {floor}:1")
        for key in ("fg", "body", "muted"):
            ratio = contrast(theme[key], theme["panel"])
            if ratio < 4.5:
                errors.append(f"theme.{key} contrast {ratio:.2f}:1 on panel is below 4.5:1")
        ratio = contrast(theme["accent"], theme["panel"])
        if ratio < 3.0:
            errors.append(f"theme.accent contrast {ratio:.2f}:1 on panel is below 3:1")
    font = str(theme.get("font", ""))
    if any(c in font for c in "<>{};@\\") or "url(" in font.lower():
        errors.append("theme.font contains disallowed characters")

    slug = spec.get("slug", "")
    if not SLUG.match(str(slug)):
        errors.append("slug must be lowercase kebab-case (used for the PDF file name)")
    if not str(spec.get("document_title", "")).strip():
        errors.append("document_title is required (LinkedIn asks for it on upload)")
    elif len(str(spec["document_title"])) > 58:
        warnings.append("document_title is long; keep it under about 58 characters so it is not truncated")

    pages = spec.get("pages")
    if not isinstance(pages, list) or not (MIN_PAGES <= len(pages) <= MAX_PAGES):
        errors.append(f"pages must be a list of {MIN_PAGES} to {MAX_PAGES} pages")
        return errors, warnings, theme
    if len(pages) > ADVISED_MAX:
        warnings.append(f"{len(pages)} pages; most document carousels hold attention best at 6 to {ADVISED_MAX}")

    for i, page in enumerate(pages, 1):
        where = f"pages[{i}]"
        if not str(page.get("title", "")).strip():
            errors.append(f"{where}.title is required (one idea per page)")
        if len(str(page.get("title", ""))) > 90:
            warnings.append(f"{where}.title is over 90 characters; split the idea")
        has_source = bool(str(page.get("source", "")).strip())
        if page.get("claims") and not has_source:
            errors.append(f"{where} is marked claims=true but has no source footer")
        if not has_source and not page.get("claims") and _looks_factual(page):
            warnings.append(f"{where} contains a number, date, or stat but no source footer; add one or mark it as opinion")
        for j, block in enumerate(page.get("blocks", []), 1):
            kind = block.get("type")
            if kind not in BLOCK_TYPES:
                errors.append(f"{where}.blocks[{j}].type '{kind}' is not one of {sorted(BLOCK_TYPES)}")
            if kind == "compare":
                rows = block.get("rows", [])
                if not rows or any(len(r) != 3 for r in rows):
                    errors.append(f"{where}.blocks[{j}] compare rows must be [label, left, right]")
                if len(rows) > 5:
                    warnings.append(f"{where}.blocks[{j}] has {len(rows)} compare rows; 4 or fewer read best")
            if kind in {"steps", "bullets"} and len(block.get("items", [])) > 5:
                warnings.append(f"{where}.blocks[{j}] has more than 5 items")
    if pages[0].get("role") != "cover":
        warnings.append("pages[1] is not marked role=cover; the first page should carry the hook")
    if pages[-1].get("role") != "close":
        warnings.append("last page is not marked role=close; end on the takeaway or the post's question")
    return errors, warnings, theme


# ---------- rendering ----------

def css(t: dict) -> str:
    return f"""*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{WIDTH}px;height:{HEIGHT}px;background:{t['bg']};font-family:{t['font']};color:{t['body']};position:relative;overflow:hidden}}
.k{{position:absolute;top:64px;left:72px;right:72px;font:600 24px/1 {t['font']};letter-spacing:.14em;color:{t['muted']};text-transform:uppercase;display:flex;justify-content:space-between}}
#content{{position:absolute;top:130px;bottom:150px;left:72px;right:72px;overflow:hidden}}
.chip{{font:800 24px/1 {t['font']};letter-spacing:.12em;padding:12px 22px;border-radius:999px;display:inline-block;background:{t['accent']};color:{t['bg']};text-transform:uppercase;margin-bottom:30px}}
h1{{font:800 64px/1.08 {t['font']};letter-spacing:-.02em;color:{t['fg']}}}
h1 .acc,.acc{{color:{t['accent']}}}
.cover h1{{font-size:92px}}
p.t{{font:500 30px/1.42 {t['font']};margin-top:28px}}
.panel{{background:{t['panel']};border:1px solid {t['border']};border-radius:22px;padding:30px 36px;margin-top:28px}}
.panel b{{display:block;font:800 24px/1.2 {t['font']};letter-spacing:.12em;color:{t['accent']};text-transform:uppercase;margin-bottom:10px}}
.panel span{{font:500 28px/1.45 {t['font']}}}
.cmp{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border:1px solid {t['border']};border-radius:22px;overflow:hidden;margin-top:34px}}
.cmp>div{{min-width:0;overflow-wrap:anywhere;padding:18px 26px;border-bottom:1px solid {t['border']};font:600 26px/1.35 {t['font']}}}
.cmp .h{{font:800 24px/1.2 {t['font']};letter-spacing:.12em;background:{t['panel']};color:{t['muted']}}}
.cmp .h.r{{color:{t['accent']}}}
.cmp .r{{color:{t['fg']}}}
.cmp i{{display:block;font:800 24px/1.2 {t['font']};font-style:normal;letter-spacing:.12em;color:{t['muted']};margin-bottom:6px;text-transform:uppercase}}
.step{{display:flex;gap:24px;margin-top:30px}}
.num{{flex:none;width:58px;height:58px;border-radius:50%;background:{t['accent']};color:{t['bg']};font:800 30px/58px {t['font']};text-align:center}}
.step b{{display:block;font:800 34px/1.2 {t['font']};color:{t['fg']}}}
.step span{{font:500 27px/1.4 {t['font']}}}
ul.b{{margin-top:28px;padding-left:36px}}
ul.b li{{font:500 30px/1.45 {t['font']};margin-top:12px}}
.stat{{margin-top:34px}}
.stat b{{display:block;font:800 120px/1 {t['font']};letter-spacing:-.04em;color:{t['accent']}}}
.stat span{{font:600 30px/1.4 {t['font']};color:{t['fg']}}}
.foot{{position:absolute;bottom:56px;left:72px;right:72px;font:500 {MIN_BODY_PX}px/1.3 {t['font']};color:{t['muted']};display:flex;justify-content:space-between;gap:30px;border-top:1px solid {t['border']};padding-top:22px}}
.foot span:last-child{{text-align:right}}
"""


def title_html(page: dict) -> str:
    out = e(page["title"])
    if page.get("title_accent"):
        out += f"<br><span class='acc'>{e(page['title_accent'])}</span>"
    return f"<h1>{out}</h1>"


def block_html(block: dict) -> str:
    kind = block["type"]
    if kind == "text":
        return f"<p class='t'>{e(block.get('text', ''))}</p>"
    if kind == "panel":
        return f"<div class='panel'><b>{e(block.get('label', ''))}</b><span>{e(block.get('text', ''))}</span></div>"
    if kind == "bullets":
        return "<ul class='b'>" + "".join(f"<li>{e(i)}</li>" for i in block.get("items", [])) + "</ul>"
    if kind == "stat":
        return f"<div class='stat'><b>{e(block.get('value', ''))}</b><span>{e(block.get('label', ''))}</span></div>"
    if kind == "steps":
        out = ""
        for n, item in enumerate(block.get("items", []), 1):
            out += (f"<div class='step'><div class='num'>{n}</div><div><b>{e(item.get('title', ''))}</b>"
                    f"<span>{e(item.get('text', ''))}</span></div></div>")
        return out
    if kind == "compare":
        out = f"<div class='h'>{e(block.get('left', ''))}</div><div class='h r'>{e(block.get('right', ''))}</div>"
        for label, left, right in block.get("rows", []):
            out += f"<div><i>{e(label)}</i>{e(left)}</div><div class='r'><i>{e(label)}</i>{e(right)}</div>"
        return f"<div class='cmp'>{out}</div>"
    return ""


def page_html(spec: dict, theme: dict, index: int) -> str:
    page = spec["pages"][index]
    total = len(spec["pages"])
    chip = f"<span class='chip'>{e(page['chip'])}</span><br>" if page.get("chip") else ""
    body = "".join(block_html(b) for b in page.get("blocks", []))
    cls = "cover" if page.get("role") == "cover" else ""
    return (
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>"
        f"<style>{css(theme)}</style></head><body class='{cls}'>"
        f"<div class='k'><span>{e(page.get('kicker', spec.get('kicker', '')))}</span><span>{index + 1} / {total}</span></div>"
        f"<div id='content'>{chip}{title_html(page)}{body}</div>"
        f"<div class='foot'><span>{e(spec.get('series', ''))}</span><span>{e(page.get('source', ''))}</span></div>"
        "</body></html>"
    )


# Clipping can hide inside nested boxes (for example a comparison grid with
# overflow:hidden), so check every block-level box, not only #content.
FIT_CHECK = """(() => {
  const c = document.getElementById('content');
  const f = document.querySelector('.foot');
  const cr = c.getBoundingClientRect();
  const boxes = [c, ...c.querySelectorAll('*')].filter(e => e.clientWidth > 0);
  const h = boxes.some(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > cr.right + 1);
  return {v: c.scrollHeight > c.clientHeight + 1, h: h,
          f: f.scrollWidth > f.clientWidth + 1 || f.getBoundingClientRect().top < cr.bottom};
})()"""


def render(spec: dict, theme: dict, out: pathlib.Path, html_only: bool) -> list[str]:
    out.mkdir(parents=True, exist_ok=True)
    pages = [page_html(spec, theme, i) for i in range(len(spec["pages"]))]
    names = [f"{i + 1:02d}" for i in range(len(pages))]
    for name, doc in zip(names, pages):
        (out / f"{name}.html").write_text(doc, encoding="utf-8")
    if html_only:
        return []
    try:
        from playwright.sync_api import sync_playwright
        from PIL import Image
    except ImportError as exc:  # pragma: no cover - runtime dependent
        print(f"missing runtime: {exc}. Install Playwright (with Chromium) and Pillow, or use --html-only.", file=sys.stderr)
        sys.exit(2)
    overflow: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=1, java_script_enabled=False
        )
        # Local-only: abort every request that is not inline content.
        context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(("data:", "about:")) else route.abort())
        pg = context.new_page()
        for name, doc in zip(names, pages):
            pg.set_content(doc, wait_until="load")
            fit = pg.evaluate(FIT_CHECK)
            if fit["v"]:
                overflow.append(f"page {name}: content overflows the safe area vertically; cut text or split the page")
            if fit["h"]:
                overflow.append(f"page {name}: content overflows horizontally; break long tokens such as URLs")
            if fit["f"]:
                overflow.append(f"page {name}: footer text does not fit; shorten the source line")
            pg.screenshot(path=str(out / f"{name}.png"))
        browser.close()
    images = [Image.open(out / f"{n}.png").convert("RGB") for n in names]
    images[0].save(out / f"{spec['slug']}.pdf", save_all=True, append_images=images[1:], resolution=150)
    cols = 4
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (WIDTH + 30), rows * (HEIGHT + 30)), theme["bg"])
    for n, im in enumerate(images):
        sheet.paste(im, ((n % cols) * (WIDTH + 30), (n // cols) * (HEIGHT + 30)))
    sheet.thumbnail((2400, 2400))
    sheet.save(out / "contact-sheet.jpg", quality=85)
    return overflow


def text_outline(spec: dict) -> str:
    """Plain-text outline of every page. The PDF is raster, so this is the accessible text."""
    lines = [f"# {spec['document_title']}", ""]
    for i, page in enumerate(spec["pages"], 1):
        title = page["title"] + (f" {page['title_accent']}" if page.get("title_accent") else "")
        lines.append(f"## Page {i}: {title}")
        for block in page.get("blocks", []):
            kind = block.get("type")
            if kind == "text":
                lines.append(block.get("text", ""))
            elif kind == "panel":
                lines.append(f"{block.get('label', '')}: {block.get('text', '')}")
            elif kind in {"bullets"}:
                lines += [f"- {item}" for item in block.get("items", [])]
            elif kind == "steps":
                lines += [f"{n}. {it.get('title', '')}: {it.get('text', '')}" for n, it in enumerate(block.get("items", []), 1)]
            elif kind == "stat":
                lines.append(f"{block.get('value', '')} {block.get('label', '')}")
            elif kind == "compare":
                lines.append(f"{block.get('left', '')} vs {block.get('right', '')}")
                lines += [f"- {a}: {b} | {c}" for a, b, c in block.get("rows", [])]
        if page.get("source"):
            lines.append(f"Source: {page['source']}")
        lines.append("")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("spec", type=pathlib.Path)
    ap.add_argument("--out", type=pathlib.Path)
    ap.add_argument("--check", action="store_true", help="validate the spec only")
    ap.add_argument("--html-only", action="store_true", help="write HTML pages without rendering")
    args = ap.parse_args(argv)

    spec = json.loads(args.spec.read_text(encoding="utf-8"))
    errors, warnings, theme = validate(spec)
    report = {"spec": str(args.spec), "pages": len(spec.get("pages") or []), "errors": errors, "warnings": warnings}
    if errors or args.check:
        print(json.dumps(report, indent=2))
        return 1 if errors else 0
    if not args.out:
        ap.error("--out is required unless --check is used")
    overflow = render(spec, theme, args.out, args.html_only)
    (args.out / "pages-text.md").write_text(text_outline(spec), encoding="utf-8")
    report["errors"] += overflow
    report["outputs"] = sorted(p.name for p in args.out.iterdir())
    (args.out / "build-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
