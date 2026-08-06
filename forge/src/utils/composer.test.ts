import { describe, expect, it } from 'vitest';
import type { Skill } from '../types/catalog';
import {
  buildMarkdownBrief,
  buildJsonManifest,
  getCompanionSuggestions,
  getStackIntegrityReport,
  type ComposerItem,
} from './composer';

function makeSkill(overrides: Partial<Skill> & { name: string }): Skill {
  return {
    displayName: overrides.name,
    family: 'test-family',
    skillDir: overrides.name,
    path: `test-family/${overrides.name}/SKILL.md`,
    description: 'A test skill.',
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
    rawUrl: `https://raw.example/${overrides.name}/SKILL.md`,
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

describe('composer: getCompanionSuggestions', () => {
  it('suggests a declared companion that is not already in the stack', () => {
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const b = makeSkill({ name: 'b' });
    const items: ComposerItem[] = [{ name: 'a', optional: false, note: '' }];
    const suggestions = getCompanionSuggestions(items, [a, b]);
    expect(suggestions).toEqual([{ from: 'a', companion: 'b' }]);
  });

  it('does not suggest a companion that is already in the stack', () => {
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const b = makeSkill({ name: 'b' });
    const items: ComposerItem[] = [
      { name: 'a', optional: false, note: '' },
      { name: 'b', optional: false, note: '' },
    ];
    expect(getCompanionSuggestions(items, [a, b])).toEqual([]);
  });

  it('never fabricates a suggestion for a skill with no declared companions', () => {
    const a = makeSkill({ name: 'a', companions: [] });
    const items: ComposerItem[] = [{ name: 'a', optional: false, note: '' }];
    expect(getCompanionSuggestions(items, [a])).toEqual([]);
  });
});

describe('composer: buildMarkdownBrief', () => {
  it('includes each item, its install URL, and its note', () => {
    const a = makeSkill({ name: 'skill-a', description: 'Does A things.' });
    const items: ComposerItem[] = [{ name: 'skill-a', optional: false, note: 'Use this first.' }];
    const md = buildMarkdownBrief(items, [a]);
    expect(md).toContain('skill-a');
    expect(md).toContain('Does A things.');
    expect(md).toContain(a.rawUrl);
    expect(md).toContain('Use this first.');
  });

  it('marks an optional item without claiming it is required', () => {
    const a = makeSkill({ name: 'skill-a' });
    const items: ComposerItem[] = [{ name: 'skill-a', optional: true, note: '' }];
    const md = buildMarkdownBrief(items, [a]);
    expect(md).toContain('(optional)');
  });

  it('flags a stack item that no longer resolves in the catalog rather than fabricating its details', () => {
    const items: ComposerItem[] = [{ name: 'removed-skill', optional: false, note: '' }];
    const md = buildMarkdownBrief(items, []);
    expect(md).toContain('removed-skill');
    expect(md).toContain('no longer present in the catalog');
  });

  it('lists declared companions not currently in the stack under "Unresolved relationships"', () => {
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const items: ComposerItem[] = [{ name: 'a', optional: false, note: '' }];
    const md = buildMarkdownBrief(items, [a]);
    expect(md).toContain('Unresolved relationships');
    expect(md).toContain('`a`');
    expect(md).toContain('`b`');
  });

  it('includes a source URL, export timestamp, and caveats', () => {
    const a = makeSkill({ name: 'skill-a' });
    const items: ComposerItem[] = [{ name: 'skill-a', optional: false, note: '' }];
    const md = buildMarkdownBrief(items, [a]);
    expect(md).toMatch(/\*\*Source:\*\* /);
    expect(md).toMatch(/\*\*Exported:\*\* \d{4}-\d{2}-\d{2}T/);
    expect(md).toContain('not a validated bundle');
  });
});

describe('composer: getStackIntegrityReport', () => {
  it('flags a skill with weak evidence or low maturity without declaring the stack validated', () => {
    const a = makeSkill({ name: 'a', maturity: 'skeleton', evidence: {
      status: 'none', evaluatedSkillVersion: null, evalCount: 0, benchmarkCount: 0,
      testCount: 0, referenceCount: 0, scriptCount: 0, lastEvidenceDate: null,
      reviewDecision: null, blockers: [],
    } });
    const items: ComposerItem[] = [{ name: 'a', optional: false, note: '' }];
    const report = getStackIntegrityReport(items, [a]);
    expect(report.maturityWarnings).toHaveLength(1);
    expect(report.maturityWarnings[0].name).toBe('a');
    expect(report.maturityWarnings[0].note).toContain('maturity is "skeleton"');
    expect(report.maturityWarnings[0].note).toContain('evidence status is "none"');
  });

  it('does not flag a well-evidenced, mature skill', () => {
    const a = makeSkill({ name: 'a', maturity: 'validated', evidence: {
      status: 'live', evaluatedSkillVersion: '1.0.0', evalCount: 1, benchmarkCount: 0,
      testCount: 0, referenceCount: 0, scriptCount: 0, lastEvidenceDate: null,
      reviewDecision: null, blockers: [],
    } });
    const items: ComposerItem[] = [{ name: 'a', optional: false, note: '' }];
    expect(getStackIntegrityReport(items, [a]).maturityWarnings).toEqual([]);
  });

  it('surfaces unresolved catalog items alongside companion suggestions', () => {
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const items: ComposerItem[] = [
      { name: 'a', optional: false, note: '' },
      { name: 'gone', optional: false, note: '' },
    ];
    const report = getStackIntegrityReport(items, [a]);
    expect(report.unresolvedItems).toEqual(['gone']);
    expect(report.companionSuggestions).toEqual([{ from: 'a', companion: 'b' }]);
  });
});

describe('composer: buildJsonManifest', () => {
  it('marks resolved vs unresolved items accurately', () => {
    const a = makeSkill({ name: 'a' });
    const items: ComposerItem[] = [
      { name: 'a', optional: false, note: '' },
      { name: 'gone', optional: true, note: 'was here once' },
    ];
    const manifest = buildJsonManifest(items, [a]);
    expect(manifest.items).toEqual([
      { name: 'a', family: 'test-family', optional: false, note: '', installUrl: a.rawUrl, resolved: true },
      { name: 'gone', family: null, optional: true, note: 'was here once', installUrl: null, resolved: false },
    ]);
    expect(manifest.itemCount).toBe(2);
  });

  it('includes source URL, export timestamp, caveats, and unresolved relationships', () => {
    const a = makeSkill({ name: 'a', companions: ['b'] });
    const items: ComposerItem[] = [
      { name: 'a', optional: false, note: '' },
      { name: 'gone', optional: false, note: '' },
    ];
    const manifest = buildJsonManifest(items, [a]);
    expect(manifest.sourceUrl).toBeTruthy();
    expect(manifest.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(manifest.caveats).toContain('not a validated bundle');
    expect(manifest.unresolvedRelationships.unresolvedItems).toEqual(['gone']);
    expect(manifest.unresolvedRelationships.companionSuggestions).toEqual([{ from: 'a', companion: 'b' }]);
  });
});
