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
        <main className="container sd-not-found-main">
          <div className="detail-article sd-not-found-article">
            <h1 className="sd-not-found-heading">Stack not found</h1>
            <Link to="/stacks" className="btn sd-not-found-link">Browse all stacks</Link>
          </div>
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
      <main className="container sd-main">
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/stacks">Stacks</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="sd-breadcrumb-current">{stack.name}</span>
        </div>

        <article className="detail-article sd-article">
          <header className="sd-header">
            <h1 className="sd-title">{stack.name}</h1>
            <p className="sd-tagline">{stack.tagline}</p>
          </header>

          <div className="sd-meta-grid">
            <div className="sd-meta-card sd-meta-card--problem">
              <h2 className="sd-meta-card-heading">The Problem</h2>
              <p className="sd-meta-card-body">{stack.problem}</p>
            </div>
            <div className="sd-meta-card sd-meta-card--audience">
              <h2 className="sd-meta-card-heading">Audience</h2>
              <p className="sd-meta-card-body">{stack.audience}</p>
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
            <p className="sd-install-note">
              <strong>Note:</strong> {stack.installNote}
            </p>
          )}

          <div className="sd-section">
            <h2>Steps</h2>
            <ol className="sd-steps-list">
              {stack.steps.map((step, i) => {
                const skills = step.skillNames.map(n => catalog.skills.find(s => s.name === n)).filter(Boolean);
                return (
                  <li key={i} className="sd-step">
                    <div className="sd-step-number">
                      {i + 1}
                    </div>
                    <div className="sd-step-body">
                      <div className="sd-step-header">
                        <h3 className="sd-step-title">{step.label}</h3>
                        {step.optional && <span className="sd-step-optional">optional</span>}
                      </div>
                      <p className="sd-step-purpose">{step.purpose}</p>

                      <div className="sd-step-io">
                        {step.inputs && <div><strong className="sd-step-io-in">In:</strong> {step.inputs}</div>}
                        {step.outputs && <div><strong className="sd-step-io-out">Out:</strong> {step.outputs}</div>}
                      </div>

                      <div className="sd-step-skills">
                        {skills.map(skill => (
                          <Link key={skill!.name} to={`/skills/${skill!.family}/${skill!.name}`} className="sd-step-skill-link">
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

          <div className="sd-section">
            <h2>All skills in this stack</h2>
            <ul className="sd-all-skills-list">
              {allSkills.map(skill => (
                <li key={skill!.name} className="sd-all-skill-item">
                  <Link to={`/skills/${skill!.family}/${skill!.name}`} className="sd-all-skill-link">{skill!.name}</Link>
                  <span data-maturity={skill!.maturity} className="sd-all-skill-maturity">{skill!.maturity}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>
    </div>
  );
}
