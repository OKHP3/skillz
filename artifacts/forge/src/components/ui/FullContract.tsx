import { Fragment, createElement } from 'react';
import { parseMarkdownSubset, sanitizeHref, type InlineNode, type BlockNode } from '../../utils/markdown';
import { focusAndScrollToId, getRouteAnchorId } from '../../utils/routeAnchors';

function renderInline(nodes: InlineNode[], keyPrefix: string) {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (node.kind) {
      case 'text':
        return <Fragment key={key}>{node.value}</Fragment>;
      case 'bold':
        return <strong key={key}>{renderInline(node.children, key)}</strong>;
      case 'italic':
        return <em key={key}>{renderInline(node.children, key)}</em>;
      case 'code':
        return <code key={key}>{node.value}</code>;
      case 'link': {
        const safeHref = sanitizeHref(node.href);
        const isExternal = /^https?:\/\//i.test(safeHref);
        const fragmentTarget = getRouteAnchorId(safeHref);
        let hostname: string | null = null;
        if (isExternal) {
          try { hostname = new URL(safeHref).hostname; } catch { hostname = null; }
        }
        return (
          <a
            key={key}
            href={safeHref}
            onClick={fragmentTarget ? event => {
              event.preventDefault();
              focusAndScrollToId(fragmentTarget);
            } : undefined}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {renderInline(node.children, key)}
            {hostname && <span className="full-contract-link-domain"> ({hostname})</span>}
          </a>
        );
      }
      default:
        return null;
    }
  });
}

function renderBlock(block: BlockNode, key: string) {
  switch (block.kind) {
    case 'heading': {
      const depth = Math.min(Math.max(block.depth, 1), 6);
      const tagName = `h${depth}`;
      return createElement(tagName, { key, id: block.id, tabIndex: -1 }, renderInline(block.children, key));
    }
    case 'paragraph':
      return <p key={key}>{renderInline(block.children, key)}</p>;
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag key={key} className="full-contract-list">
          {block.items.map((item, i) => <li key={i}>{renderInline(item, `${key}-${i}`)}</li>)}
        </ListTag>
      );
    }
    case 'code':
      return (
        <pre key={key} className="full-contract-code">
          <code>{block.value}</code>
        </pre>
      );
    case 'quote':
      return <blockquote key={key} className="full-contract-quote">{renderInline(block.children, key)}</blockquote>;
    case 'rule':
      return <hr key={key} />;
    default:
      return null;
  }
}

interface FullContractProps {
  rawBody: string;
}

/** Renders a skill's full SKILL.md body as a safe Markdown subset — no raw
 *  HTML is ever interpreted, only React elements built from a parsed block
 *  tree (see utils/markdown.ts). Includes a heading-based table of contents
 *  and renders outbound links with their visible destination domain. */
export default function FullContract({ rawBody }: FullContractProps) {
  const { blocks, toc } = parseMarkdownSubset(rawBody);

  if (blocks.length === 0) {
    return <p className="meta-pending">No contract body available.</p>;
  }

  return (
    <div className="full-contract">
      {toc.length > 1 && (
        <nav className="full-contract-toc" aria-label="Full contract table of contents">
          <p className="full-contract-toc-label">On this page</p>
          <ul>
            {toc.map(entry => (
              <li key={entry.id} data-depth={entry.depth}>
                <button
                  type="button"
                  className="full-contract-toc-link"
                  onClick={() => focusAndScrollToId(entry.id)}
                >
                  {entry.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="full-contract-body">
        {blocks.map((block, i) => renderBlock(block, `b${i}`))}
      </div>
    </div>
  );
}
