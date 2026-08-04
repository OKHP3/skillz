import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { STACKS } from '../data/stacks';
import { shareStack, copyToClipboard } from '../utils/clipboard';
import { useCatalog } from '../contexts/CatalogContext';
import type { Skill } from '../types/catalog';
import Nav from '../components/layout/Nav';

export default function Stacks() {
  const catalog = useCatalog();
  function getSkillsForStack(skillNames: string[]): Skill[] {
    return skillNames
      .map(n => catalog.skills.find(s => s.name === n))
      .filter((s): s is Skill => Boolean(s));
  }

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

        <ul className="stack-list">
          {STACKS.map(stack => {
            const allSkillNames = stack.steps.flatMap(s => s.skillNames);
            const allSkills = getSkillsForStack([...new Set(allSkillNames)]);
            return (
              <li key={stack.id} className="stack-card">
                <div>
                  <h2><Link to={`/stacks/${stack.id}`}>{stack.name}</Link></h2>
                  <p className="stack-tagline">{stack.tagline}</p>
                </div>
                <p className="stack-audience">
                  <strong>For:</strong> {stack.audience}
                </p>

                <div className="stack-steps">
                  {stack.steps.map((step, i) => (
                    <span key={i} className={`step-pill ${step.optional ? 'step-pill--optional' : 'step-pill--required'}`}>
                      {i + 1}. {step.label}
                    </span>
                  ))}
                </div>

                <div className="stack-count">
                  {allSkills.length} skill{allSkills.length !== 1 ? 's' : ''} in stack
                </div>

                <div className="stack-card-footer">
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
