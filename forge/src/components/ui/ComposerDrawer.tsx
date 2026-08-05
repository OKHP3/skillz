import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useComposer } from '../../contexts/ComposerContext';
import { useCatalog } from '../../contexts/CatalogContext';
import { buildMarkdownBrief, buildJsonManifest, getCompanionSuggestions, COMPOSER_MAX_ITEMS } from '../../utils/composer';

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
  const { items, removeItem, toggleOptional, setNote, moveItem, clearAll } = useComposer();
  const catalog = useCatalog();
  const [open, setOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const suggestions = getCompanionSuggestions(items, catalog.skills);

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

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handleExportMarkdown() {
    downloadTextFile('skillz-forge-stack.md', buildMarkdownBrief(items, catalog.skills), 'text/markdown');
  }
  function handleExportJson() {
    downloadTextFile('skillz-forge-stack.json', JSON.stringify(buildJsonManifest(items, catalog.skills), null, 2), 'application/json');
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

  return (
    <div className="composer-root">
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

      {open && (
        <div id="composer-panel" className="composer-panel" role="dialog" aria-label="Local stack composer">
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

          {suggestions.length > 0 && (
            <div className="composer-suggestions">
              <h3>Declared companions not in this stack</h3>
              <ul>
                {suggestions.map(s => (
                  <li key={s.companion}>
                    <code>{s.from}</code> pairs with <code>{s.companion}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="composer-actions">
            <button type="button" className="btn btn-outline" onClick={handleExportMarkdown} disabled={items.length === 0}>
              Export Markdown brief
            </button>
            <button type="button" className="btn btn-outline" onClick={handleExportJson} disabled={items.length === 0}>
              Export JSON manifest
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
