import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../contexts/CatalogContext';
import AddToStackButton from './AddToStackButton';
import {
  getDiscoveryOutcomeOptions,
  getDiscoveryResult,
  DISCOVERY_CONTEXT_OPTIONS,
  type DiscoveryContext,
  type DiscoveryResult,
} from '../../utils/discovery';

type Step = 'outcome' | 'context' | 'result';

/** Optional, skippable 2-question aid that sits above Explore's normal
 *  filters. Grounded entirely in the 5 hand-authored curated stacks — never
 *  fabricates a taxonomy, a compatibility claim, or an evidence/maturity
 *  fact. A visitor can bail to ordinary Explore at any step. */
export default function DiscoveryAid() {
  const catalog = useCatalog();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<Step>('outcome');
  const [stackId, setStackId] = useState<string | null>(null);
  const [context, setContext] = useState<DiscoveryContext | null>(null);

  const outcomeOptions = getDiscoveryOutcomeOptions();

  if (dismissed) return null;

  let result: DiscoveryResult | null = null;
  if (step === 'result' && stackId && context) {
    result = getDiscoveryResult(stackId, context, catalog.skills);
  }

  function reset() {
    setStep('outcome');
    setStackId(null);
    setContext(null);
  }

  return (
    <section className="discovery-aid" aria-label="Guided discovery">
      <div className="discovery-aid-header">
        <h2>Not sure where to start?</h2>
        <button type="button" className="btn-ghost btn-ghost--small" onClick={() => setDismissed(true)}>
          Skip — go straight to Explore
        </button>
      </div>

      {step === 'outcome' && (
        <div className="discovery-aid-step">
          <p>What outcome are you working toward?</p>
          <ul className="discovery-aid-options">
            {outcomeOptions.map(opt => (
              <li key={opt.stackId}>
                <button
                  type="button"
                  className="discovery-aid-option"
                  onClick={() => { setStackId(opt.stackId); setStep('context'); }}
                >
                  <span className="discovery-aid-option-label">{opt.label}</span>
                  <span className="discovery-aid-option-desc">{opt.description}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="discovery-aid-fallback">
            None of these fit? <Link to="/explore">Browse everything on Explore</Link> — the family filter in the
            sidebar lets you narrow by family instead.
          </p>
        </div>
      )}

      {step === 'context' && (
        <div className="discovery-aid-step">
          <p>What's your working context?</p>
          <ul className="discovery-aid-options">
            {DISCOVERY_CONTEXT_OPTIONS.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  className="discovery-aid-option"
                  onClick={() => { setContext(opt.value); setStep('result'); }}
                >
                  <span className="discovery-aid-option-label">{opt.label}</span>
                  <span className="discovery-aid-option-desc">{opt.description}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-ghost btn-ghost--small" onClick={() => setStep('outcome')}>
            &larr; Back
          </button>
        </div>
      )}

      {step === 'result' && result && (
        <div className="discovery-aid-step">
          <p>
            Candidates from <Link to={`/stacks/${result.stackId}`}>{result.stackName}</Link>:
          </p>
          {result.candidates.length === 0 ? (
            <p className="meta-pending">None of this stack's skills currently resolve in the catalog.</p>
          ) : (
            <ul className="discovery-aid-candidates">
              {result.candidates.map(({ skill, note }) => (
                <li key={skill.name} className="discovery-aid-candidate">
                  <div>
                    <Link to={`/skills/${skill.family}/${skill.name}`} className="discovery-aid-candidate-name">
                      {skill.displayName || skill.name}
                    </Link>
                    <span className="discovery-aid-candidate-family">{skill.family}</span>
                    {note && <p className="discovery-aid-candidate-note">{note}</p>}
                  </div>
                  <AddToStackButton skillName={skill.name} className="btn-ghost btn-ghost--small" />
                </li>
              ))}
            </ul>
          )}
          {result.unresolvedNames.length > 0 && (
            <p className="meta-pending">
              {result.unresolvedNames.length} skill{result.unresolvedNames.length !== 1 ? 's' : ''} referenced by this stack
              {result.unresolvedNames.length !== 1 ? " aren't" : " isn't"} currently in the catalog.
            </p>
          )}
          <div className="discovery-aid-result-actions">
            <Link to={`/stacks/${result.stackId}`} className="btn btn-outline">View full stack</Link>
            <Link to="/explore" className="btn-ghost">Go to full Explore instead</Link>
            <button type="button" className="btn-ghost" onClick={reset}>Start over</button>
          </div>
        </div>
      )}
    </section>
  );
}
