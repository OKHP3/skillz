import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useComposer } from '../../contexts/ComposerContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { copyToClipboard } from '../../utils/clipboard';
import { buildMarkdownBrief, buildJsonManifest, getStackIntegrityReport, COMPOSER_MAX_ITEMS } from '../../utils/composer';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Global, persistent local stack composer. Mounted once in App.tsx so it is
 *  reachable from every page (Explore, skill detail, family detail, Compare)
 *  per the Release 2 brief — browser-only, no account or server involved. */
export default function ComposerDrawer() {
  const { items, removeItem, toggleOptional, setNote, moveItem, clearAll, announcement, announce } = useComposer();
  const catalog = useCatalog();
  const [open, setOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const integrity = getStackIntegrityReport(items, catalog.skills);

  // Move focus into the panel on open, and back to the toggle on close, so
  // keyboard/screen-reader users land somewhere sensible rather than having
  // focus silently stay on (or vanish from) a button that just changed state.
  // Skipped on first mount (isFirstRender) so page load doesn't steal focus.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (open) {
      closeButtonRef.current?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [open]);

  // True modal behavior: Escape and backdrop clicks dismiss, and Tab/Shift+Tab
  // are trapped inside the panel rather than leaking focus to the page behind
  // it (which is also marked `inert` below).
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Background inertness: while the panel is open, every top-level sibling
  // of the composer (the routed page content, footer, skip link) is marked
  // `inert` so assistive tech and keyboard navigation can't reach it —
  // matching the backdrop's visual "this is behind a modal" cue.
  useEffect(() => {
    if (!open) return;
    const appRoot = document.getElementById('app');
    const composerEl = rootRef.current;
    if (!appRoot || !composerEl) return;
    const siblings = Array.from(appRoot.children).filter(el => el !== composerEl) as HTMLElement[];
    siblings.forEach(el => el.setAttribute('inert', ''));
    return () => siblings.forEach(el => el.removeAttribute('inert'));
  }, [open]);

  function handleExportMarkdown() {
    downloadTextFile('skillz-forge-stack.md', buildMarkdownBrief(items, catalog.skills), 'text/markdown');
    announce('Markdown brief saved.');
  }
  function handleExportJson() {
    downloadTextFile('skillz-forge-stack.json', JSON.stringify(buildJsonManifest(items, catalog.skills), null, 2), 'application/json');
    announce('JSON manifest saved.');
  }
  async function handleCopyJson() {
    const ok = await copyToClipboard(JSON.stringify(buildJsonManifest(items, catalog.skills), null, 2));
    announce(ok ? 'JSON manifest copied to clipboard.' : 'Could not copy to clipboard.');
  }
  function handleClearAll() {
    if (confirmingClear) {
      clearAll();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
    }
  }
  function handleToggleOpen() {
    setConfirmingClear(false);
    setOpen(o => !o);
  }

  const hasIntegrityFindings =
    integrity.unresolvedItems.length > 0 ||
    integrity.companionSuggestions.length > 0 ||
    integrity.maturityWarnings.length > 0;

  return (
    <div className="composer-root" ref={rootRef}>
      <button
        type="button"
        ref={toggleButtonRef}
        className="composer-toggle"
        onClick={handleToggleOpen}
        aria-expanded={open}
        aria-controls="composer-panel"
      >
        My stack
        {items.length > 0 && <span className="composer-toggle-count">{items.length}</span>}
      </button>

      {/* Single polite live region for the whole composer, kept mounted even
          while the panel is closed — "Add to stack" buttons live on Explore,
          skill detail, family detail, and Compare pages, and their outcome
          should be announced whether or not this panel happens to be open. */}
      <div aria-live="polite" role="status" className="sr-only">{announcement}</div>

      {open && <div className="composer-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />}

      {open && (
        <div
          id="composer-panel"
          className="composer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Local stack composer"
          ref={panelRef}
        >
          <div className="composer-panel-header">
            <h2>My stack</h2>
            <button type="button" ref={closeButtonRef} className="composer-close" onClick={() => setOpen(false)} aria-label="Close stack panel">
              ✕
            </button>
          </div>
          <p className="composer-panel-hint">
            Built entirely in your browser — nothing here is installed or sent anywhere until you export it.
            {' '}{items.length}/{COMPOSER_MAX_ITEMS} skills.
          </p>

          {items.length === 0 ? (
            <p className="meta-pending">No skills yet. Use "Add to stack" on any skill, family, or Compare page.</p>
          ) : (
            <ul className="composer-item-list">
              {items.map((item, i) => {
                const skill = catalog.skills.find(s => s.name === item.name);
                return (
                  <li key={item.name} className="composer-item">
                    <div className="composer-item-head">
                      <div className="composer-item-identity">
                        {skill ? (
                          <Link to={`/skills/${skill.family}/${skill.name}`} className="composer-item-name">
                            {skill.displayName || skill.name}
                          </Link>
                        ) : (
                          <span className="composer-item-name composer-item-name--unresolved">
                            {item.name} (no longer in catalog)
                          </span>
                        )}
                        {skill && <span className="composer-item-family">{skill.family}</span>}
                      </div>
                      <div className="composer-item-controls">
                        <button type="button" onClick={() => moveItem(item.name, -1)} disabled={i === 0} aria-label={`Move ${item.name} up`}>↑</button>
                        <button type="button" onClick={() => moveItem(item.name, 1)} disabled={i === items.length - 1} aria-label={`Move ${item.name} down`}>↓</button>
                        <button type="button" onClick={() => removeItem(item.name)} aria-label={`Remove ${item.name} from stack`}>✕</button>
                      </div>
                    </div>
                    <label className="composer-item-optional">
                      <input type="checkbox" checked={item.optional} onChange={() => toggleOptional(item.name)} />
                      Optional
                    </label>
                    <label className="composer-item-note-label">
                      Note
                      <textarea
                        className="composer-item-note"
                        value={item.note}
                        onChange={e => setNote(item.name, e.target.value)}
                        placeholder="Why this skill is in the stack…"
                        rows={2}
                        maxLength={500}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && (
            <div className="composer-integrity">
              <h3>Stack integrity</h3>
              <p className="composer-integrity-hint">
                This checks what's declared or on file for each skill individually — it does not validate
                the stack as a whole, and it never certifies these skills work together.
              </p>

              {!hasIntegrityFindings ? (
                <p className="composer-integrity-clean">No missing companions, unresolved references, or maturity/evidence warnings found.</p>
              ) : (
                <>
                  {integrity.unresolvedItems.length > 0 && (
                    <div className="composer-integrity-group">
                      <h4>Unresolved references</h4>
                      <ul>
                        {integrity.unresolvedItems.map(name => (
                          <li key={name}><code>{name}</code> is no longer present in the catalog.</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {integrity.companionSuggestions.length > 0 && (
                    <div className="composer-integrity-group">
                      <h4>Declared companions not in this stack</h4>
                      <ul>
                        {integrity.companionSuggestions.map(s => (
                          <li key={s.companion}>
                            <code>{s.from}</code> pairs with <code>{s.companion}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {integrity.maturityWarnings.length > 0 && (
                    <div className="composer-integrity-group">
                      <h4>Maturity / evidence warnings</h4>
                      <ul>
                        {integrity.maturityWarnings.map(w => (
                          <li key={w.name}><code>{w.name}</code>: {w.note}.</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="composer-actions">
            <button type="button" className="btn btn-outline" onClick={handleExportMarkdown} disabled={items.length === 0}>
              Export Markdown brief
            </button>
            <button type="button" className="btn btn-outline" onClick={handleExportJson} disabled={items.length === 0}>
              Export JSON manifest
            </button>
            <button type="button" className="btn-ghost" onClick={handleCopyJson} disabled={items.length === 0}>
              Copy JSON to clipboard
            </button>
            <button
              type="button"
              className={`btn-ghost composer-clear${confirmingClear ? ' composer-clear--confirm' : ''}`}
              onClick={handleClearAll}
              disabled={items.length === 0}
            >
              {confirmingClear ? 'Click again to confirm' : 'Clear all'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
