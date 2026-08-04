import { describe, expect, it } from 'vitest';
import type { Skill } from '../types/catalog';
import { buildWorkflowPath, type ResolvedPathNode } from './search';

// Minimal fixture builder — buildWorkflowPath only reads `name`, `family`,
// `companions`, `displayName`, and `maturity` off a Skill, but the type
// requires the full Foundry-baseline shape, so fill the rest with inert
// defaults rather than `as any`-ing past the type check.
function makeSkill(overrides: Partial<Skill> & { name: string }): Skill {
  return {
    displayName: overrides.name,
    family: 'test-family',
    skillDir: overrides.name,
    path: `test-family/${overrides.name}/SKILL.md`,
    description: '',
    version: '1.0.0',
    license: 'MIT',
    category: 'test',
    origin: null,
    author: null,
    homepage: null,
    maturity: 'usable',
    evidenceStatus: 'none',
    evidenceNote: '',
    status: null,
    tags: [],
    topics: [],
    triggers: [],
    avoid: [],
    companions: [],
    examples: [],
    inputs: [],
    outputs: [],
    tools: [],
    runtimes: [],
    boundaries: [],
    bodyText: '',
    rawUrl: '',
    githubUrl: '',
    lastModified: null,
    commitSha: null,
    createdAt: null,
    packageMetadata: {
      author: null, category: null, origin: null, homepage: null,
      authorGithub: null, inScope: null, outOfScope: null,
    },
    evidence: {
      status: 'not-run', evaluatedSkillVersion: null, evalCount: 0, benchmarkCount: 0,
      testCount: 0, referenceCount: 0, scriptCount: 0, lastEvidenceDate: null,
      reviewDecision: null, blockers: [],
    },
    maturitySource: 'fallback-structure',
    maturityReviewedAt: null,
    releaseReadiness: 'ready-for-supervised-use',
    ...overrides,
  };
}

function resolvedNames(nodes: ReturnType<typeof buildWorkflowPath>): string[] {
  return nodes
    .filter((n): n is ResolvedPathNode => n.kind === 'resolved')
    .map(n => n.skill.name);
}

describe('buildWorkflowPath', () => {
  it('includes the current skill when it has two inbound predecessors, ' +
     'preferring the predecessor that declares it as their first companion as the chain root', () => {
    // A lists C as its *second* companion (not the direct chain link).
    // B lists C as its *first* companion — that's the real chain: B -> C.
    // findRoot(C) must therefore walk up through B (and further, from B's
    // own predecessors), not get stuck choosing A as the root.
    const start = makeSkill({ name: 'start', companions: ['b'] });
    const a = makeSkill({ name: 'a', companions: ['other', 'c'] });
    const b = makeSkill({ name: 'b', companions: ['c'] });
    const c = makeSkill({ name: 'c', companions: [] });
    const other = makeSkill({ name: 'other', companions: [] });
    const all = [start, a, b, c, other];

    const nodes = buildWorkflowPath(c, all);
    const names = resolvedNames(nodes);

    // The current skill must be in the chain.
    expect(names).toContain('c');
    // The chain root should be found by walking the direct b -> c link
    // (start -> b -> c), not by way of `a`, which only references `c` as
    // a secondary companion.
    expect(names).toEqual(['start', 'b', 'c']);

    const cNode = nodes.find(n => n.kind === 'resolved' && n.skill.name === 'c') as ResolvedPathNode;
    expect(cNode.isCurrent).toBe(true);
    // Both `a` and `b` list `c` as a companion, so it has two predecessors —
    // one of which (`a`) is not on the displayed chain, i.e. a real branch.
    expect(cNode.incomingBranches).toBe(1);
  });

  it('always includes the current skill in the result, even in a branch not on the main chain', () => {
    // `leaf` is only reachable as `hub`'s *second* companion — the main
    // chain forward from `hub` follows `main` instead. Calling
    // buildWorkflowPath directly on `leaf` must still surface `leaf` itself.
    const hub = makeSkill({ name: 'hub', companions: ['main', 'leaf'] });
    const main = makeSkill({ name: 'main', companions: [] });
    const leaf = makeSkill({ name: 'leaf', companions: [] });
    const all = [hub, main, leaf];

    const nodes = buildWorkflowPath(leaf, all);
    const current = nodes.find(n => n.kind === 'resolved' && n.isCurrent);
    expect(current).toBeDefined();
    expect((current as ResolvedPathNode).skill.name).toBe('leaf');
  });

  it('terminates without infinite recursion on a circular companion loop', () => {
    // a -> b -> c -> a (a 3-cycle). Both findRoot's backward walk and
    // walkForward's forward walk must stop via their `visited` sets /
    // depth caps instead of looping forever.
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const b = makeSkill({ name: 'b', companions: ['c'] });
    const c = makeSkill({ name: 'c', companions: ['a'] });
    const all = [a, b, c];

    const run = () => buildWorkflowPath(b, all);
    expect(run).not.toThrow();

    const nodes = run();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.length).toBeLessThanOrEqual(10); // MAX_TOTAL cap
    expect(nodes.some(n => n.kind === 'resolved' && n.isCurrent)).toBe(true);

    // A 2-cycle (mutual companions) is the tightest possible loop; make
    // sure it doesn't hang either.
    const x = makeSkill({ name: 'x', companions: ['y'] });
    const y = makeSkill({ name: 'y', companions: ['x'] });
    const pairNodes = buildWorkflowPath(x, [x, y]);
    expect(pairNodes.length).toBeGreaterThan(0);
    expect(pairNodes.length).toBeLessThanOrEqual(10);
  });

  it('returns a single resolved node for a skill with no companion links in either direction', () => {
    const lonely = makeSkill({ name: 'lonely', companions: [] });
    const unrelated = makeSkill({ name: 'unrelated', companions: [] });
    const all = [lonely, unrelated];

    const nodes = buildWorkflowPath(lonely, all);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].kind).toBe('resolved');
    const node = nodes[0] as ResolvedPathNode;
    expect(node.skill.name).toBe('lonely');
    expect(node.isCurrent).toBe(true);
    expect(node.incomingBranches).toBe(0);
    expect(node.outgoingBranches).toBe(0);
    expect(node.unresolvedCompanions).toEqual([]);
  });

  it('marks a declared companion that does not resolve to any catalog skill as unresolved, not silently dropped', () => {
    const withTypo = makeSkill({ name: 'withTypo', companions: ['okhp3-does-not-exist'] });
    const nodes = buildWorkflowPath(withTypo, [withTypo]);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].kind).toBe('resolved');
    expect((nodes[0] as ResolvedPathNode).unresolvedCompanions).toEqual(['okhp3-does-not-exist']);
    expect(nodes[1]).toEqual({ kind: 'unresolved', name: 'okhp3-does-not-exist' });
  });
});
