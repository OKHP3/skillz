import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { STACKS } from '../data/stacks';
import { shareStack, copyToClipboard } from '../utils/clipboard';
import catalogData from '../data/catalog.json';
import type { Catalog } from '../types/catalog';
import Nav from '../components/layout/Nav';

const catalog = catalogData as Catalog;

function getSkillsForStack(skillNames: string[]) {
  return skillNames
    .map(n => catalog.skills.find(s => s.name === n))
    .filter(Boolean);
}

export default function Stacks() {
  useEffect(() => {
    document.title = 'Stacks | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopyAll(stackId: string, skillNames: string[]) {
    const allNames = [...new Set(skillNames)];
    const skills = allNames.map(n => catalog.skills.find(s => s.name === n)).filter(Boolean);
    const text = skills.map(s => s!.rawUrl).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(stackId); setTimeout(() => setCopied(null), 2000); }
  }

  return (
    <div data-page="stacks">
      <Nav />
      <main className="container">
        <div className="page-header">
          <h1>Stacks</h1>
          <p>Curated combinations of skills for complete workflows. Each stack is a recipe — ordered steps, defined inputs and outputs, and a shareable URL.</p>
        </div>

        <ul className="stack-list" style={{ paddingBottom: 'var(--space-16)' }}>
          {STACKS.map(stack => {
            const allSkillNames = stack.steps.flatMap(s => s.skillNames);
            const allSkills = getSkillsForStack([...new Set(allSkillNames)]);
            return (
              <li key={stack.id} className="stack-card">
                <div>
                  <h2><Link to={`/stacks/${stack.id}`}>{stack.name}</Link></h2>
                  <p className="stack-tagline">{stack.tagline}</p>
                </div>
                <p style={{ color: 'var(--color-text-muted-dark)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  <strong>For:</strong> {stack.audience}
                </p>
                
                <div className="stack-steps">
                  {stack.steps.map((step, i) => (
                    <span key={i} className="step-pill" style={{ borderLeft: step.optional ? '2px solid var(--color-border-dark)' : '2px solid var(--color-copper)' }}>
                      {i + 1}. {step.label}
                    </span>
                  ))}
                </div>
                
                <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-steel)' }}>
                  {allSkills.length} skill{allSkills.length !== 1 ? 's' : ''} in stack
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-dark)' }}>
                  <Link to={`/stacks/${stack.id}`} className="btn">View stack</Link>
                  <button
                    onClick={() => handleCopyAll(stack.id, allSkillNames)}
                    className="btn btn-outline"
                  >
                    {copied === stack.id ? 'Copied!' : 'Copy all installs'}
                  </button>
                  <button
                    onClick={() => shareStack(stack.id, stack.name)}
                    className="btn-ghost"
                  >
                    Share
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
