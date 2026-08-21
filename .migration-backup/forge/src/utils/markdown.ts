// Safe Markdown-subset parser for the "Full Contract" section on skill
// detail pages. Deliberately NOT a general Markdown engine and NEVER
// produces raw HTML: it parses the fixed subset SKILL.md files actually
// use (headings, paragraphs, lists, fenced code, blockquotes, horizontal
// rules, and inline bold/italic/code/links) into a plain data tree that
// FullContract.tsx renders as real React elements. Anything that looks like
// raw HTML in the source (`<script>`, `<img onerror=...>`, etc.) is treated
// as literal text — there is no `dangerouslySetInnerHTML` anywhere in this
// path, so it cannot execute.
//
// Unknown/unhandled constructs are never silently dropped: a heading at any
// depth (1-6) still renders as a heading, and any line that doesn't match a
// known block type falls through to a paragraph rather than disappearing.

export interface InlineText { kind: 'text'; value: string }
export interface InlineBold { kind: 'bold'; children: InlineNode[] }
export interface InlineItalic { kind: 'italic'; children: InlineNode[] }
export interface InlineCode { kind: 'code'; value: string }
export interface InlineLink { kind: 'link'; href: string; children: InlineNode[] }
export type InlineNode = InlineText | InlineBold | InlineItalic | InlineCode | InlineLink;

export interface HeadingBlock { kind: 'heading'; depth: number; id: string; text: string; children: InlineNode[] }
export interface ParagraphBlock { kind: 'paragraph'; children: InlineNode[] }
export interface ListBlock { kind: 'list'; ordered: boolean; items: InlineNode[][] }
export interface CodeBlock { kind: 'code'; lang: string | null; value: string }
export interface QuoteBlock { kind: 'quote'; children: InlineNode[] }
export interface RuleBlock { kind: 'rule' }
export type BlockNode = HeadingBlock | ParagraphBlock | ListBlock | CodeBlock | QuoteBlock | RuleBlock;

export interface TocEntry { id: string; text: string; depth: number }

export interface ParsedContract {
  blocks: BlockNode[];
  toc: TocEntry[];
}

function slugify(text: string, seen: Map<string, number>): string {
  let base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!base) base = 'section';
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/** Parses a run of inline text into a mix of plain text, bold, italic,
 *  inline code, and link nodes. Link targets are kept as plain strings and
 *  rendered as real `<a>` hrefs by the caller — never interpreted as HTML. */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  // Order matters: links and inline code first (their contents must not be
  // re-processed for bold/italic), then bold before italic so `**x**`
  // isn't first consumed as two italics.
  const pattern = /\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push({ kind: 'text', value: text.slice(lastIndex, m.index) });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      nodes.push({ kind: 'link', href: m[2], children: parseInline(m[1]) });
    } else if (m[3] !== undefined) {
      nodes.push({ kind: 'code', value: m[3] });
    } else if (m[4] !== undefined || m[5] !== undefined) {
      nodes.push({ kind: 'bold', children: parseInline(m[4] ?? m[5]) });
    } else if (m[6] !== undefined || m[7] !== undefined) {
      nodes.push({ kind: 'italic', children: parseInline(m[6] ?? m[7]) });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push({ kind: 'text', value: text.slice(lastIndex) });
  }
  return nodes.length > 0 ? nodes : [{ kind: 'text', value: text }];
}

// Safety: a link target must never be allowed to execute as script. Only
// http(s), mailto, and same-page/relative references are rendered as real
// hrefs — anything else (javascript:, data:, vbscript:, etc.) is neutralized
// to a harmless "#" so a malicious or malformed SKILL.md can't produce a
// clickable script URL.
const SAFE_HREF_SCHEME = /^(https?:|mailto:)/i;
export function sanitizeHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed === '') return '#';
  // Relative/same-page references (no scheme at all) are safe by construction.
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }
  // Anything with an explicit scheme must be on the allow-list.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return SAFE_HREF_SCHEME.test(trimmed) ? trimmed : '#';
  }
  // No scheme and no leading path marker (e.g. "example.com/x") — treat as a
  // safe relative reference; browsers won't execute it.
  return trimmed;
}

function flattenText(children: InlineNode[]): string {
  return children.map(c => {
    if (c.kind === 'text' || c.kind === 'code') return c.value;
    return flattenText(c.children);
  }).join('');
}

/** Parses a SKILL.md body (post-frontmatter) into a safe block tree plus a
 *  table of contents built from H1-H3 headings (deeper headings still
 *  render, they're just left out of the nav to keep it scannable). */
export function parseMarkdownSubset(source: string): ParsedContract {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlockNode[] = [];
  const toc: TocEntry[] = [];
  const seenIds = new Map<string, number>();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    // Fenced code block — contents kept verbatim, never inline-parsed.
    const fenceMatch = line.match(/^(```|~~~)\s*(\S*)\s*$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2] || null;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ kind: 'code', lang, value: codeLines.join('\n') });
      continue;
    }

    // Horizontal rule
    if (/^([-*_])\1{2,}\s*$/.test(line.trim())) {
      blocks.push({ kind: 'rule' });
      i++;
      continue;
    }

    // Heading — any depth 1-6 is preserved as a heading, never dropped.
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugify(text, seenIds);
      blocks.push({ kind: 'heading', depth, id, text, children: parseInline(text) });
      if (depth <= 3) toc.push({ id, text, depth });
      i++;
      continue;
    }

    // Blockquote — consecutive `>`-prefixed lines merge into one block.
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ kind: 'quote', children: parseInline(quoteLines.join(' ')) });
      continue;
    }

    // List — consecutive bullet or numbered lines.
    const listItemMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
    if (listItemMatch) {
      const ordered = /\d+\./.test(listItemMatch[1]);
      const items: InlineNode[][] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
        if (!m) break;
        if (/\d+\./.test(m[1]) !== ordered) break;
        items.push(parseInline(m[2]));
        i++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }

    // Paragraph — consecutive plain lines until a blank line or new block.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(```|~~~)/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
      !/^([-*_])\1{2,}\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ kind: 'paragraph', children: parseInline(paraLines.join(' ')) });
    } else {
      // Safety valve: a line matched none of the above and none of the
      // paragraph loop either (shouldn't normally happen) — surface it as
      // plain text instead of looping forever or dropping it.
      blocks.push({ kind: 'paragraph', children: parseInline(line) });
      i++;
    }
  }

  return { blocks, toc };
}

export { flattenText };
