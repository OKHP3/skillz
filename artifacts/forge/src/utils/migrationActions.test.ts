import { afterEach, describe, expect, it, vi } from 'vitest';
import AddToStackButton from '../components/ui/AddToStackButton';
import { addComposerItem, useComposer } from '../contexts/ComposerContext';
import { shareSkill } from './clipboard';
import { skillMigration } from './skillMigrations';
import type { ComposerItem } from './composer';
import type { Skill } from '../types/catalog';

vi.mock('../contexts/ComposerContext', async importOriginal => {
  const actual = await importOriginal<typeof import('../contexts/ComposerContext')>();
  return { ...actual, useComposer: vi.fn() };
});

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

function mockComposer(items: ComposerItem[]) {
  const addItem = vi.fn();
  vi.mocked(useComposer).mockReturnValue({
    items, addItem, isInStack: name => items.some(item => item.name === name),
    canAdd: items.length < 8, removeItem: vi.fn(), toggleOptional: vi.fn(),
    setNote: vi.fn(), moveItem: vi.fn(), clearAll: vi.fn(), announcement: '', announce: vi.fn(),
  });
  return addItem;
}

describe('migration context on visitor actions', () => {
  it('passes brand guidance through the Add to stack click handler', () => {
    const migration = skillMigration('okhp3-askjamie-extract-chatgpt')!;
    const addItem = mockComposer([]);
    const button = AddToStackButton({ skillName: migration.to.name, context: migration.context });
    button.props.onClick();
    expect(addItem).toHaveBeenCalledWith(migration.to.name, migration.context);
    expect(addComposerItem([], ...addItem.mock.calls[0] as [string, string])).toEqual([
      { name: migration.to.name, optional: false, note: migration.context },
    ]);
  });

  it('adds missing guidance to an existing full stack without changing notes, flags, or order', () => {
    const migration = skillMigration('update-specification')!;
    const existing: ComposerItem[] = [
      { name: migration.to.name, optional: true, note: 'Keep AC-007 and the original owner.' },
      ...Array.from({ length: 7 }, (_, index) => ({ name: `other-${index}`, optional: false, note: '' })),
    ];
    const addItem = mockComposer(existing);
    const button = AddToStackButton({ skillName: migration.to.name, context: migration.context });
    expect(button.props.disabled).toBe(false);
    expect(button.props.children).toBe('Add guidance to stack');
    button.props.onClick();
    const result = addComposerItem(existing, ...addItem.mock.calls[0] as [string, string]);
    expect(result).toHaveLength(8);
    expect(result[0]).toEqual({ ...existing[0], note: `${existing[0].note}\n\n${migration.context}` });
    expect(result.slice(1)).toEqual(existing.slice(1));
    expect(addComposerItem(result, migration.to.name, migration.context)).toBe(result);
    expect(existing[0].note).toBe('Keep AC-007 and the original owner.');
  });

  it('does not append guidance again when the button is already satisfied', () => {
    const migration = skillMigration('okhp3-glee-fully-extract-claude')!;
    const addItem = mockComposer([{ name: migration.to.name, optional: false, note: `User note.\n\n${migration.context}` }]);
    const button = AddToStackButton({ skillName: migration.to.name, context: migration.context });
    expect(button.props.children).toBe('In stack');
    button.props.onClick();
    expect(addItem).not.toHaveBeenCalled();
  });

  it.each(['okhp3-askjamie-style-registry', 'update-specification'])('keeps %s context in the copied Share URL', async oldName => {
    const migration = skillMigration(oldName)!;
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('window', { isSecureContext: true, location: { hostname: 'okhp3.github.io', origin: 'https://okhp3.github.io' } });
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await shareSkill({ ...migration.to, description: 'Test workflow' } as Skill, oldName)).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(`https://okhp3.github.io/skillz/#/skills/${migration.to.family}/${migration.to.name}?from=${oldName}`);
  });

  it('keeps migration context in the native Share payload', async () => {
    const oldName = 'create-specification';
    const migration = skillMigration(oldName)!;
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { canShare: () => true, share });
    expect(await shareSkill({ ...migration.to, description: 'Test workflow' } as Skill, oldName)).toBe('shared');
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: expect.stringContaining(`?from=${oldName}`) }));
  });

  it('does not attach another skill or an undeclared alias to the Share URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('window', { isSecureContext: true, location: { hostname: 'okhp3.github.io', origin: 'https://okhp3.github.io' } });
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const skill = { family: 'universal', name: 'okhp3-repository-organizer', description: 'Test workflow' } as Skill;
    await shareSkill(skill, 'update-specification');
    await shareSkill(skill, 'not-an-alias');
    expect(writeText.mock.calls).toEqual([
      [`https://okhp3.github.io/skillz/#/skills/${skill.family}/${skill.name}`],
      [`https://okhp3.github.io/skillz/#/skills/${skill.family}/${skill.name}`],
    ]);
  });
});
