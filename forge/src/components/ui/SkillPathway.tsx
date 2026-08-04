import { Link } from 'react-router-dom';
import type { PathNode } from '../../utils/search';
import type { Skill } from '../../types/catalog';

interface SkillPathwayProps {
  nodes: PathNode[];
}

/** Mini card for an alternate branch companion — always a link */
function BranchNode({ skill }: { skill: Skill }) {
  const name = skill.displayName || skill.name;
  return (
    <Link
      to={`/skills/${skill.family}/${skill.name}`}
      className="skill-pathway__fork-node"
      title={skill.description || name}
    >
      <span className="skill-pathway__node-name skill-pathway__fork-node-name">{name}</span>
      <span className="skill-pathway__node-family">{skill.family}</span>
      <span
        className="skill-pathway__node-maturity"
        data-maturity={skill.maturity}
      >
        {skill.maturity}
      </span>
    </Link>
  );
}

/**
 * Renders an ordered, visual workflow pathway for a skill's companion chain.
 * When a step has multiple outgoing companions the alternate branches are
 * shown as a fork lane hanging below that step — each branch links to its
 * skill detail page. Unresolved companion references (typos / renamed skills)
 * are surfaced as a terminal "not found" stop rather than silently dropped.
 */
export default function SkillPathway({ nodes }: SkillPathwayProps) {
  if (nodes.length === 0) return null;

  // A single-node "chain" (no real pathway) — fall back to simple card
  if (nodes.length === 1 && nodes[0].kind === 'resolved' && !nodes[0].isCurrent) return null;

  const hasUnresolved = nodes.some(
    n => n.kind === 'unresolved' ||
         (n.kind === 'resolved' && n.unresolvedCompanions.length > 0)
  );
  const hasBranches = nodes.some(
    n => n.kind === 'resolved' && (n.branchSkills.length > 0 || n.incomingBranches > 0)
  );

  return (
    <div className="skill-pathway" aria-label="Skill workflow pathway">
      <div className="skill-pathway__track" role="list">
        {nodes.map((node, idx) => {
          const isLast = idx === nodes.length - 1;

          // ── Unresolved (broken reference) stop ──────────────────────────
          if (node.kind === 'unresolved') {
            return (
              <div key={`unresolved-${node.name}-${idx}`} className="skill-pathway__step" role="listitem">
                <div className="skill-pathway__step-main">
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
              </div>
            );
          }

          // ── Resolved node ────────────────────────────────────────────────
          const name = node.skill.displayName || node.skill.name;
          const hasFork = node.branchSkills.length > 0;

          return (
            <div
              key={node.skill.name}
              className={[
                'skill-pathway__step',
                hasFork ? 'skill-pathway__step--forked' : '',
              ].join(' ').trim()}
              role="listitem"
            >
              {/* ── Main chain row: indicators + node card + arrow ── */}
              <div className="skill-pathway__step-main">
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
                    hasFork ? 'skill-pathway__node--has-fork' : '',
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

                {/* Arrow connector — not rendered after last node */}
                {!isLast && (
                  <span className="skill-pathway__arrow" aria-hidden>→</span>
                )}
              </div>

              {/* ── Fork lane: alternate branches hanging below ── */}
              {hasFork && (
                <div
                  className="skill-pathway__fork"
                  aria-label={`${node.branchSkills.length} alternate branch${node.branchSkills.length > 1 ? 'es' : ''} from this step`}
                >
                  {node.branchSkills.map(branch => (
                    <div key={branch.name} className="skill-pathway__fork-branch">
                      <span className="skill-pathway__fork-arm" aria-hidden>↳</span>
                      <BranchNode skill={branch} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="skill-pathway__hint">
        Steps follow each skill's declared companion sequence.
        {hasBranches && <> Forked steps (↳) show alternate companion paths.</>}
        {hasUnresolved && <> A greyed-out or ⚠ marked stop means a declared companion name doesn't match any skill in the catalog.</>}
      </p>
    </div>
  );
}
