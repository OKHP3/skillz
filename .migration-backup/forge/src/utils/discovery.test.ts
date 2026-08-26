import { describe, expect, it } from 'vitest';
import type { Skill } from '../types/catalog';
import { STACKS } from '../data/stacks';
import { getDiscoveryOutcomeOptions, getDiscoveryResult } from './discovery';

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

describe('discovery: getDiscoveryOutcomeOptions', () => {
  it('is grounded in the real curated STACKS, not an invented taxonomy', () => {
    const options = getDiscoveryOutcomeOptions();
    expect(options.length).toBe(STACKS.length);
    for (const opt of options) {
      const stack = STACKS.find(s => s.id === opt.stackId);
      expect(stack).toBeDefined();
      expect(opt.label).toBe(stack!.tagline);
      expect(opt.description).toBe(stack!.problem);
    }
  });
});

describe('discovery: getDiscoveryResult', () => {
  const stack = STACKS[0];
  const stackSkillNames = [...new Set(stack.steps.flatMap(s => s.skillNames))];

  it('returns null for an unknown stack id', () => {
    expect(getDiscoveryResult('not-a-real-stack', 'exploring', [])).toBeNull();
  });

  it('never fabricates a candidate for a skill name that does not resolve', () => {
    const result = getDiscoveryResult(stack.id, 'exploring', []);
    expect(result).not.toBeNull();
    expect(result!.candidates).toEqual([]);
    expect(result!.unresolvedNames).toEqual(stackSkillNames);
  });

  it('keeps authored order and adds no notes in "exploring" context', () => {
    const skills = stackSkillNames.map(name => makeSkill({ name, releaseReadiness: 'needs-contract-work' }));
    const result = getDiscoveryResult(stack.id, 'exploring', skills)!;
    expect(result.candidates.map(c => c.skill.name)).toEqual(stackSkillNames);
    expect(result.candidates.every(c => c.note === null)).toBe(true);
  });

  it('reorders toward release-ready first and annotates low-readiness skills in "production" context, without dropping any candidate', () => {
    const skills = [
      makeSkill({ name: stackSkillNames[0], releaseReadiness: 'needs-contract-work' }),
      ...stackSkillNames.slice(1).map(name => makeSkill({ name, releaseReadiness: 'published' })),
    ];
    const result = getDiscoveryResult(stack.id, 'production', skills)!;
    expect(result.candidates).toHaveLength(skills.length);
    // The needs-contract-work skill must rank behind the published ones...
    const lowIndex = result.candidates.findIndex(c => c.skill.name === stackSkillNames[0]);
    expect(lowIndex).toBe(result.candidates.length - 1);
    // ...and carry an explanatory note, never a claim that it's incompatible.
    const lowNote = result.candidates[lowIndex].note;
    expect(lowNote).toMatch(/needs contract work/);
    expect(lowNote).not.toMatch(/incompatible/i);
  });
});
