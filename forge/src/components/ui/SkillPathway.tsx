import { Link } from 'react-router-dom';
import type { PathNode } from '../../utils/search';

interface SkillPathwayProps {
  nodes: PathNode[];
}

/**
 * Renders an ordered, visual workflow pathway for a skill's companion chain.
 * Replaces the flat unordered "Companion skills" list with a step-by-step
 * lane showing position in the pipeline and directional flow.
 */
export default function SkillPathway({ nodes }: SkillPathwayProps) {
  if (nodes.length === 0) return null;

  // A single-node "chain" (no real pathway) — fall back to simple card
  if (nodes.length === 1 && nodes[0].kind === 'resolved' && !nodes[0].isCurrent) return null;

  const hasUnresolved = nodes.some(n => n.kind === 'unresolved' || (n.kind === 'resolved' && n.unresolvedCompanions.length > 0));
  const hasBranches = nodes.some(n => n.kind === 'resolved' && (n.incomingBranches > 0 || n.outgoingBranches > 0));

  return (
    <div className="skill-pathway" aria-label="Skill workflow pathway">
      <div className="skill-pathway__track" role="list">
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;

          if (node.kind === 'unresolved') {
            return (
              <div key={`unresolved-${node.name}-${idx}`} className="skill-pathway__step" role="listitem">
                <div
                  className="skill-pathway__node skill-pathway__node--unresolved"
                  title={`"${node.name}" is referenced as a companion but does not match any skill in the catalog — likely a misspelling or a rename that wasn't updated everywhere.`}
                >
                  <span className="skill-pathway__step-number" aria-hidden>{idx + 1}</span>
                  <div className="skill-pathway__node-body">
                    <span className="skill-pathway__node-name skill-pathway__node-name--unresolved">{node.name}</span>
                    <span className="skill-pathway__node-unresolved-label">Not found — check for a typo or renamed skill</span>
                  </div>
                </div>
                {!isLast && <span className="skill-pathway__arrow" aria-hidden>→</span>}
              </div>
            );
          }

          const name = node.skill.displayName || node.skill.name;

          return (
            <div key={node.skill.name} className="skill-pathway__step" role="listitem">
              {/* Branch-in indicator */}
              {node.incomingBranches > 0 && (
                <span
                  className="skill-pathway__branch skill-pathway__branch--in"
                  title={`${node.incomingBranches} other path${node.incomingBranches > 1 ? 's' : ''} also lead here`}
                  aria-label={`${node.incomingBranches} additional path${node.incomingBranches > 1 ? 's' : ''} merge here`}
                >
                  +{node.incomingBranches}
                </span>
              )}

              <div
                className={[
                  'skill-pathway__node',
                  node.isCurrent ? 'skill-pathway__node--current' : '',
                ].join(' ').trim()}
              >
                <span className="skill-pathway__step-number" aria-hidden>
                  {idx + 1}
                </span>
                {node.isCurrent ? (
                  <div className="skill-pathway__node-body">
                    <span className="skill-pathway__node-name">{name}</span>
                    <span className="skill-pathway__node-family">{node.skill.family}</span>
                    <span
                      className="skill-pathway__node-maturity"
                      data-maturity={node.skill.maturity}
                    >
                      {node.skill.maturity}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={`/skills/${node.skill.family}/${node.skill.name}`}
                    className="skill-pathway__node-body skill-pathway__node-body--link"
                  >
                    <span className="skill-pathway__node-name">{name}</span>
                    <span className="skill-pathway__node-family">{node.skill.family}</span>
                    <span
                      className="skill-pathway__node-maturity"
                      data-maturity={node.skill.maturity}
                    >
                      {node.skill.maturity}
                    </span>
                  </Link>
                )}
              </div>

              {/* Broken-companion indicator — this node declared at least one
                  companion name that isn't in the catalog, even if a valid
                  companion let the chain keep going past it. */}
              {node.unresolvedCompanions.length > 0 && (
                <span
                  className="skill-pathway__branch skill-pathway__branch--broken"
                  title={`Unresolved companion reference${node.unresolvedCompanions.length > 1 ? 's' : ''}: ${node.unresolvedCompanions.join(', ')}`}
                  aria-label={`${node.unresolvedCompanions.length} unresolved companion reference${node.unresolvedCompanions.length > 1 ? 's' : ''} on this skill: ${node.unresolvedCompanions.join(', ')}`}
                >
                  ⚠ {node.unresolvedCompanions.length}
                </span>
              )}

              {/* Branch-out indicator */}
              {node.outgoingBranches > 0 && (
                <span
                  className="skill-pathway__branch skill-pathway__branch--out"
                  title={`${node.outgoingBranches} alternate companion${node.outgoingBranches > 1 ? 's' : ''} not shown`}
                  aria-label={`${node.outgoingBranches} additional companion path${node.outgoingBranches > 1 ? 's' : ''} not shown`}
                >
                  +{node.outgoingBranches}
                </span>
              )}

              {/* Arrow connector — not rendered after last node */}
              {!isLast && (
                <span className="skill-pathway__arrow" aria-hidden>→</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="skill-pathway__hint">
        Steps follow each skill's declared companion sequence.
        {hasBranches && <> Branch counts (+N) mark where multiple paths converge or diverge.</>}
        {hasUnresolved && <> A greyed-out or ⚠ marked stop means a declared companion name doesn't match any skill in the catalog.</>}
      </p>
    </div>
  );
}
