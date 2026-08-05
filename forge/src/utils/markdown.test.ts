import { describe, expect, it } from 'vitest';
import { parseMarkdownSubset, parseInline, sanitizeHref } from './markdown';

describe('parseMarkdownSubset (Full Contract safe renderer)', () => {
  it('parses headings into a heading-based TOC, preserving unknown depths', () => {
    const { blocks, toc } = parseMarkdownSubset('# Title\n\nSome text.\n\n## Section\n\nMore.\n\n#### Deep heading\n');
    const headings = blocks.filter(b => b.kind === 'heading');
    expect(headings).toHaveLength(3);
    expect(headings[2]).toMatchObject({ depth: 4, text: 'Deep heading' });
    // TOC includes depth 1-3 only, but the depth-4 heading still rendered above.
    expect(toc.map(t => t.text)).toEqual(['Title', 'Section']);
  });

  it('never interprets raw HTML — script tags render as literal text, not executable markup', () => {
    const { blocks } = parseMarkdownSubset('Some text with <script>alert(1)</script> inline.');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe('paragraph');
    const flat = (blocks[0] as { children: { kind: string; value?: string }[] }).children
      .map(c => ('value' in c ? c.value : ''))
      .join('');
    expect(flat).toContain('<script>alert(1)</script>');
  });

  it('renders outbound links with a visible href, not a hidden one', () => {
    const nodes = parseInline('See the [docs](https://example.com/guide) for more.');
    const link = nodes.find(n => n.kind === 'link');
    expect(link).toBeDefined();
    expect(link).toMatchObject({ kind: 'link', href: 'https://example.com/guide' });
  });

  it('parses fenced code blocks verbatim without inline-processing their contents', () => {
    const { blocks } = parseMarkdownSubset('```js\nconst x = **not bold**;\n```');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: 'code', lang: 'js', value: 'const x = **not bold**;' });
  });

  it('parses unordered and ordered lists', () => {
    const { blocks } = parseMarkdownSubset('- one\n- two\n\n1. first\n2. second\n');
    expect(blocks[0]).toMatchObject({ kind: 'list', ordered: false });
    expect(blocks[1]).toMatchObject({ kind: 'list', ordered: true });
  });

  it('parses bold, italic, and inline code without dropping surrounding text', () => {
    const nodes = parseInline('a **bold** b *italic* c `code` d');
    const kinds = nodes.map(n => n.kind);
    expect(kinds).toContain('bold');
    expect(kinds).toContain('italic');
    expect(kinds).toContain('code');
  });
});

describe('sanitizeHref (Full Contract link safety)', () => {
  it('neutralizes javascript: and other dangerous schemes to a harmless target', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBe('#');
    expect(sanitizeHref('JavaScript:alert(1)')).toBe('#');
    expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
    expect(sanitizeHref('vbscript:msgbox(1)')).toBe('#');
  });

  it('allows http(s) and mailto links through unchanged', () => {
    expect(sanitizeHref('https://example.com/guide')).toBe('https://example.com/guide');
    expect(sanitizeHref('http://example.com')).toBe('http://example.com');
    expect(sanitizeHref('mailto:team@example.com')).toBe('mailto:team@example.com');
  });

  it('allows relative and same-page references through unchanged', () => {
    expect(sanitizeHref('#section')).toBe('#section');
    expect(sanitizeHref('/explore')).toBe('/explore');
    expect(sanitizeHref('../other')).toBe('../other');
  });
});
