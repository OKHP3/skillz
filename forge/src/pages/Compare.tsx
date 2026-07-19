import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import catalogData from '../data/catalog.json';
import type { Catalog, Skill } from '../types/catalog';
import Nav from '../components/layout/Nav';
import { copyToClipboard, shareCompare } from '../utils/clipboard';
import { trackCompareOpen } from '../utils/analytics';

const catalog = catalogData as unknown as Catalog;

const COMPARE_FIELDS: Array<{ key: keyof Skill; label: string; render?: (v: unknown, s: Skill) => React.ReactNode }> = [
  { key: 'description', label: 'Purpose' },
  { key: 'family', label: 'Family', render: (v) => <code className="mono-tag">{String(v)}</code> },
  { key: 'maturity', label: 'Maturity', render: (v, s) => <span data-maturity={s.maturity}>{String(v)}</span> },
  { key: 'triggers', label: 'Use when', render: (v) => {
    const items = v as string[];
    if (!items?.length) return <span className="meta-pending">—</span>;
    return <ul className="compare-list">{items.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}</ul>;
  }},
  { key: 'avoid', label: 'Do not use when', render: (v) => {
    const items = v as string[];
    if (!items?.length) return <span className="meta-pending">—</span>;
    return <ul className="compare-list">{items.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}</ul>;
  }},
  { key: 'examples', label: 'Examples', render: (v) => {
    const items = v as string[];
    if (!items?.length) return <span className="meta-pending">Metadata pending</span>;
    return <ul className="compare-list">{items.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}</ul>;
  }},
  { key: 'companions', label: 'Companion skills', render: (v) => {
    const items = v as string[];
    if (!items?.length) return <span className="meta-pending">—</span>;
    return <div className="compare-companions">{items.map(c => (
      <Link key={c} to={`/explore?q=${encodeURIComponent(c)}`} className="tag-link">{c}</Link>
    ))}</div>;
  }},
  { key: 'license', label: 'License' },
  { key: 'version', label: 'Version', render: (v) => v ? String(v) : <span className="meta-pending">Unclassified</span> },
  { key: 'commitSha', label: 'Last commit', render: (v) => v ? <code className="mono-tag">{String(v).slice(0, 7)}</code> : <span className="meta-pending">Metadata pending</span> },
];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [addQuery, setAddQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const skillNames = (searchParams.get('skills') || '').split(',').filter(Boolean);
  const skills = skillNames
    .map(n => catalog.skills.find(s => s.name === n))
    .filter((s): s is Skill => Boolean(s));

  const MAX = 4;

  useEffect(() => {
    if (skills.length > 0) {
      trackCompareOpen(skills.length);
      document.title = `Compare Skills | Skillz Forge`;
    }
  }, [skills.length]);

  function addSkill(name: string) {
    if (skills.length >= MAX || skillNames.includes(name)) return;
    const next = [...skillNames, name].filter(Boolean);
    setSearchParams({ skills: next.join(',') });
    setAddQuery('');
  }

  function removeSkill(name: string) {
    const next = skillNames.filter(n => n !== name);
    setSearchParams(next.length ? { skills: next.join(',') } : {});
  }

  const suggestions = addQuery.length >= 2
    ? catalog.skills
        .filter(s => !skillNames.includes(s.name) && (
          s.name.includes(addQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(addQuery.toLowerCase())
        ))
        .slice(0, 8)
    : [];

  async function handleShare() {
    await shareCompare(skillNames);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div data-page="compare">
      <Nav />
      <main className="container">
        <div className="page-header">
          <h1>Compare Skills</h1>
          <p>Select two to four skills to compare purpose, triggers, boundaries, and source metadata side by side.</p>
        </div>

        <div className="compare-controls">
          <div className="compare-add">
            <input
              type="search"
              className="input-text"
              placeholder="Add a skill to compare…"
              value={addQuery}
              onChange={e => setAddQuery(e.target.value)}
              aria-label="Add skill to comparison"
              disabled={skills.length >= MAX}
            />
            {suggestions.length > 0 && (
              <ul className="compare-suggestions" role="listbox" aria-label="Skill suggestions">
                {suggestions.map(s => (
                  <li key={s.name}>
                    <button
                      role="option"
                      aria-selected={false}
                      onClick={() => addSkill(s.name)}
                      className="compare-suggestion-btn"
                    >
                      <span className="suggest-name">{s.name}</span>
                      <span className="suggest-family">{s.family}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {skills.length >= 2 && (
            <button className="btn btn-outline" onClick={handleShare}>
              {copied ? 'Copied!' : 'Copy compare URL'}
            </button>
          )}
        </div>

        {skills.length === 0 && (
          <div className="compare-empty">
            <p>No skills selected. Search above or <Link to="/explore">browse the catalog</Link> and use the Compare action on any skill.</p>
          </div>
        )}

        {skills.length === 1 && (
          <p className="compare-hint">Add at least one more skill to compare.</p>
        )}

        {skills.length >= 2 && (
          <div className="compare-table-wrap">
            <table className="compare-table" aria-label="Skill comparison">
              <thead>
                <tr>
                  <th scope="col" className="compare-row-label">Field</th>
                  {skills.map(s => (
                    <th key={s.name} scope="col">
                      <div className="compare-skill-head">
                        <Link to={`/skills/${s.family}/${s.name}`} className="compare-skill-name">{s.name}</Link>
                        <button
                          className="compare-remove"
                          onClick={() => removeSkill(s.name)}
                          aria-label={`Remove ${s.name} from comparison`}
                        >✕</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_FIELDS.map(field => (
                  <tr key={field.key}>
                    <td className="compare-row-label">{field.label}</td>
                    {skills.map(s => (
                      <td key={s.name} className="compare-cell">
                        {field.render
                          ? field.render(s[field.key], s)
                          : (s[field.key] != null && String(s[field.key]) !== ''
                              ? String(s[field.key])
                              : <span className="meta-pending">Unclassified</span>)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="compare-row-label">Install</td>
                  {skills.map(s => (
                    <td key={s.name} className="compare-cell">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                          await copyToClipboard(s.rawUrl);
                        }}
                        aria-label={`Copy install URL for ${s.name}`}
                      >
                        Copy URL
                      </button>
                      <a
                        href={s.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="compare-github-link"
                      >
                        GitHub ↗
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
