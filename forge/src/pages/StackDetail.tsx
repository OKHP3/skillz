import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { STACKS } from '../data/stacks';
import { copyToClipboard, shareStack } from '../utils/clipboard';
import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;

export default function StackDetail() {
  const { stackId } = useParams();
  const stack = STACKS.find(s => s.id === stackId);
  const [copied, setCopied] = useState(false);

  if (!stack) {
    return (
      <div data-page="stack-detail">
        <Nav />
        <main className="container" style={{ padding: 'var(--space-24) var(--space-4)', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-4)' }}>Stack not found</h1>
          <p style={{ color: 'var(--color-text-muted-dark)', marginBottom: 'var(--space-8)' }}>No stack with that ID exists in the catalog.</p>
          <Link to="/stacks" className="btn">Browse all stacks</Link>
        </main>
      </div>
    );
  }

  const allSkillNames = [...new Set(stack.steps.flatMap(s => s.skillNames))];
  const allSkills = allSkillNames
    .map(n => catalog.skills.find(s => s.name === n))
    .filter(Boolean);

  async function handleCopyAll() {
    const text = allSkills.map(s => s!.rawUrl).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <div data-page="stack-detail">
      <Nav />
      <main className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/stacks">Stacks</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" style={{ color: 'var(--color-text-dark)' }}>{stack.name}</span>
        </div>

        <article className="detail-article" style={{ margin: '0 auto' }}>
          <header style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--space-4)' }}>{stack.name}</h1>
            <p style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-muted-light)' }}>{stack.tagline}</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div style={{ background: 'rgba(28, 58, 52, 0.12)', padding: 'var(--space-6)', borderLeft: '4px solid var(--color-copper)' }}>
              <h2 style={{ marginTop: 0, paddingBottom: 0, border: 'none', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Problem</h2>
              <p style={{ margin: 0 }}>{stack.problem}</p>
            </div>
            <div style={{ background: 'rgba(28, 58, 52, 0.12)', padding: 'var(--space-6)', borderLeft: '4px solid var(--color-steel)' }}>
              <h2 style={{ marginTop: 0, paddingBottom: 0, border: 'none', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audience</h2>
              <p style={{ margin: 0 }}>{stack.audience}</p>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn" onClick={handleCopyAll}>
              {copied ? 'Copied!' : `Copy all ${allSkills.length} install URLs`}
            </button>
            <button className="btn btn-outline" onClick={() => shareStack(stack.id, stack.name)}>
              Share this stack
            </button>
          </div>

          {stack.installNote && (
            <p style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', color: 'var(--color-copper-light)', fontSize: 'var(--text-sm)' }}>
              <strong>Note:</strong> {stack.installNote}
            </p>
          )}

          <div style={{ marginTop: 'var(--space-12)' }}>
            <h2>Steps</h2>
            <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {stack.steps.map((step, i) => {
                const skills = step.skillNames.map(n => catalog.skills.find(s => s.name === n)).filter(Boolean);
                return (
                  <li key={i} style={{ border: '1px solid var(--color-border-light)', padding: 'var(--space-6)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', background: 'var(--color-bg)', color: 'var(--color-copper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 'var(--text-h3)', fontWeight: 600 }}>
                      {i + 1}
                    </div>
                    <div style={{ marginLeft: 'var(--space-8)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-text-light)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{step.label}</h3>
                        {step.optional && <span style={{ fontSize: 'var(--text-xs)', background: 'var(--color-bg)', color: 'var(--color-text-muted-dark)', padding: '2px 8px', textTransform: 'uppercase' }}>optional</span>}
                      </div>
                      <p style={{ color: 'var(--color-text-muted-light)', marginBottom: 'var(--space-4)' }}>{step.purpose}</p>
                      
                      <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', background: 'rgba(28, 58, 52, 0.12)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        {step.inputs && <div><strong style={{ color: 'var(--color-steel)' }}>In:</strong> {step.inputs}</div>}
                        {step.outputs && <div><strong style={{ color: 'var(--color-copper)' }}>Out:</strong> {step.outputs}</div>}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {skills.map(skill => (
                          <Link key={skill!.name} to={`/skills/${skill!.family}/${skill!.name}`} style={{ fontSize: 'var(--text-sm)', background: 'var(--color-bg)', color: 'var(--color-text-dark)', padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--color-border-dark)' }}>
                            {skill!.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div style={{ marginTop: 'var(--space-12)' }}>
            <h2>All skills in this stack</h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {allSkills.map(skill => (
                <li key={skill!.name} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-bg)', border: '1px solid var(--color-border-dark)' }}>
                  <Link to={`/skills/${skill!.family}/${skill!.name}`} style={{ fontWeight: 500 }}>{skill!.name}</Link>
                  <span data-maturity={skill!.maturity} style={{ color: 'var(--color-text-muted-dark)' }}>{skill!.maturity}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>
    </div>
  );
}
