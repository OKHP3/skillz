import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import type { Skill } from '../types/catalog';
import Nav from '../components/layout/Nav';
import { copyToClipboard, shareCompare } from '../utils/clipboard';
import { trackCompareOpen } from '../utils/analytics';
import AddToStackButton from '../components/ui/AddToStackButton';
import {
  RELEASE_READINESS_LABELS,
  MATURITY_SOURCE_LABELS,
  MATURITY_DESCRIPTIONS,
  EVIDENCE_V2_LABELS,
  formatDate,
  isEvidenceStale,
} from '../utils/evidenceVocabulary';

function isEmptyValue(v: unknown): boolean {
  if (v == null || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function renderList(value: unknown) {
  const items = value as string[];
  if (!items?.length) return <span className="meta-pending">Metadata pending</span>;
  return <ul className="compare-list">{items.slice(0, 6).map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

interface CompareField {
  key: string;
  label: string;
  getValue: (s: Skill) => unknown;
  render?: (v: unknown, s: Skill) => React.ReactNode;
  /** Overrides the default emptiness check for row-suppression. Fields that
   *  should always show (e.g. maturity) return false unconditionally. */
  isEmpty?: (v: unknown) => boolean;
}

// Release 1: Compare is a release-decision surface, not just a metadata
// table — evidence freshness, release readiness, and blockers sit directly
// next to maturity so a visitor can judge "can I rely on this" without a
// separate trip to each skill's detail page. Rows that are empty across
// every selected skill are suppressed (see `visibleFields` below) instead
// of rendering a wall of "Metadata pending" cells.
// Evidence/maturity vocabulary policy (docs/PUBLISHING.md, "Evidence and
// maturity vocabulary policy"): Compare is a release-decision surface, so
// every field below reuses the same labels, descriptions, and stale-evidence
// logic as SkillDetail (via utils/evidenceVocabulary.ts) rather than
// hand-writing parallel copy that could drift and contradict the detail page
// for the same skill.
const COMPARE_FIELDS: CompareField[] = [
  { key: 'description', label: 'Purpose', getValue: s => s.description },
  { key: 'family', label: 'Family', getValue: s => s.family, render: v => <code className="mono-tag">{String(v)}</code>, isEmpty: () => false },
  {
    key: 'maturity', label: 'Maturity', getValue: s => s.maturity,
    render: (v, s) => (
      <>
        <span data-maturity={s.maturity} title={MATURITY_DESCRIPTIONS[s.maturity]}>{String(v)}</span>
        <p className="compare-field-note">{MATURITY_DESCRIPTIONS[s.maturity]}</p>
      </>
    ),
    isEmpty: () => false,
  },
  {
    key: 'maturitySource', label: 'Maturity source', getValue: s => s.maturitySource,
    render: (v, s) => MATURITY_SOURCE_LABELS[s.maturitySource] ?? String(v),
    isEmpty: () => false,
  },
  {
    key: 'releaseReadiness', label: 'Release readiness', getValue: s => s.releaseReadiness,
    render: (v, s) => RELEASE_READINESS_LABELS[s.releaseReadiness] ?? String(v),
    isEmpty: () => false,
  },
  {
    key: 'evidenceFreshness', label: 'Evidence', getValue: s => s.evidence,
    // The evidence-contract-v2 status is the ground truth for "what has
    // actually been recorded" for the current package version. `not-run`
    // (an eval is designed but hasn't executed) and `none` (no evaluation
    // of any kind exists) are distinct states with distinct labels here —
    // see the evidence status schema split — never collapsed into one
    // "no evidence" bucket.
    render: (_v, s) => {
      const ev = s.evidence;
      const stale = isEvidenceStale(s);
      return (
        <>
          <span data-evidence-status={ev.status}>{EVIDENCE_V2_LABELS[ev.status]}</span>
          {ev.lastEvidenceDate && <span className="compare-evidence-date"> · evaluated {formatDate(ev.lastEvidenceDate)}</span>}
          {stale && (
            <span className="evidence-chip evidence-chip--warn compare-evidence-stale" title={`Evaluated ${ev.evaluatedSkillVersion}, current is ${s.version}`}>
              stale evidence
            </span>
          )}
        </>
      );
    },
    isEmpty: () => false,
  },
  {
    key: 'evidenceCounts', label: 'Evidence counts', getValue: s => s.evidence,
    render: (_v, s) => {
      const ev = s.evidence;
      return (
        <ul className="compare-list compare-evidence-counts">
          <li>{ev.evalCount} eval{ev.evalCount !== 1 ? 's' : ''}</li>
          <li>{ev.benchmarkCount} benchmark run{ev.benchmarkCount !== 1 ? 's' : ''}</li>
          <li>{ev.testCount} test file{ev.testCount !== 1 ? 's' : ''}</li>
          <li>{ev.scriptCount} script{ev.scriptCount !== 1 ? 's' : ''}</li>
        </ul>
      );
    },
    isEmpty: () => false,
  },
  {
    key: 'blockers', label: 'Promotion blockers', getValue: s => s.evidence.blockers,
    render: v => {
      const items = v as string[];
      return <ul className="compare-list compare-list--blockers">{items.map((b, i) => <li key={i}>{b}</li>)}</ul>;
    },
  },
  {
    key: 'triggers', label: 'Use when', getValue: s => s.triggers,
    render: v => {
      const items = v as string[];
      return <ul className="compare-list">{items.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    },
  },
  {
    key: 'avoid', label: 'Do not use when', getValue: s => s.avoid,
    render: v => {
      const items = v as string[];
      return <ul className="compare-list">{items.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    },
  },
  {
    key: 'examples', label: 'Examples', getValue: s => s.examples,
    render: v => {
      const items = v as string[];
      return <ul className="compare-list">{items.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}</ul>;
    },
  },
  { key: 'inputs', label: 'Inputs', getValue: s => s.inputs, render: renderList },
  { key: 'outputs', label: 'Outputs', getValue: s => s.outputs, render: renderList },
  { key: 'tools', label: 'Tools', getValue: s => s.tools, render: renderList },
  { key: 'runtimes', label: 'Runtimes', getValue: s => s.runtimes, render: renderList },
  { key: 'boundaries', label: 'Boundaries', getValue: s => s.boundaries, render: renderList },
  {
    key: 'companions', label: 'Companion skills', getValue: s => s.companions,
    render: v => {
      const items = v as string[];
      return <div className="compare-companions">{items.map(c => (
        <Link key={c} to={`/explore?q=${encodeURIComponent(c)}`} className="tag-link">{c}</Link>
      ))}</div>;
    },
  },
  { key: 'license', label: 'License', getValue: s => s.license },
  { key: 'version', label: 'Version', getValue: s => s.version, render: v => v ? String(v) : <span className="meta-pending">Unclassified</span>, isEmpty: () => false },
  {
    key: 'commitSha', label: 'Last commit', getValue: s => s.commitSha,
    render: v => v ? <code className="mono-tag">{String(v).slice(0, 7)}</code> : <span className="meta-pending">Metadata pending</span>,
  },
];

export default function Compare() {
  const catalog = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addQuery, setAddQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const MAX = 4;

  const skillNames = (searchParams.get('skills') || '').split(',').filter(Boolean).slice(0, MAX);
  const skills = skillNames
    .map(n => catalog.skills.find(s => s.name === n))
    .filter((s): s is Skill => Boolean(s));

  useEffect(() => {
    document.title = 'Compare Skills | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  useEffect(() => {
    if (skills.length > 0) trackCompareOpen(skills.length);
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

  // Suppress rows that are empty for every selected skill — a wall of
  // "Metadata pending" cells is worse than not showing the row at all.
  const visibleFields = COMPARE_FIELDS.filter(field => {
    const check = field.isEmpty ?? isEmptyValue;
    return !skills.every(s => check(field.getValue(s)));
  });

  return (
    <div data-page="compare">
      <Nav />
      <main className="container" id="main-content" tabIndex={-1}>
        <div className="page-header">
          <h1>Compare Skills</h1>
          <p>Select two to four skills to compare release readiness, evidence, triggers, boundaries, and source metadata side by side.</p>
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
            <table className="compare-table compare-table--cards" aria-label="Skill comparison">
              <thead>
                <tr>
                  <th scope="col" className="compare-row-label">Field</th>
                  {skills.map(s => (
                    <th key={s.name} scope="col">
                      <div className="compare-skill-head">
                        <Link to={`/skills/${s.family}/${s.name}`} className="compare-skill-name">{s.name}</Link>
                        <div className="compare-skill-head-actions">
                          <AddToStackButton skillName={s.name} className="btn-ghost btn-ghost--small" />
                          <button
                            className="compare-remove"
                            onClick={() => removeSkill(s.name)}
                            aria-label={`Remove ${s.name} from comparison`}
                          >✕</button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleFields.map(field => (
                  <tr key={field.key}>
                    <td className="compare-row-label">{field.label}</td>
                    {skills.map(s => {
                      const value = field.getValue(s);
                      return (
                        <td key={s.name} className="compare-cell" data-label={field.label}>
                          {field.render
                            ? field.render(value, s)
                            : (value != null && String(value) !== ''
                                ? String(value)
                                : <span className="meta-pending">Unclassified</span>)
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="compare-row-label">Full contract</td>
                  {skills.map(s => (
                    <td key={s.name} className="compare-cell" data-label="Full contract">
                      <Link to={`/skills/${s.family}/${s.name}#full-contract`} className="compare-github-link">
                        Read full contract &rarr;
                      </Link>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="compare-row-label">Get skill</td>
                  {skills.map(s => (
                    <td key={s.name} className="compare-cell" data-label="Get skill">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                          await copyToClipboard(s.rawUrl);
                        }}
                        aria-label={`Copy skill URL for ${s.name}`}
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
