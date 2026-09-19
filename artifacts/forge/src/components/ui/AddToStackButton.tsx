import { hasComposerContext, useComposer } from '../../contexts/ComposerContext';

interface AddToStackButtonProps {
  skillName: string;
  context?: string;
  className?: string;
}

/** Reusable "Add to stack" affordance used on Explore cards, skill detail,
 *  family detail, and Compare — every surface the PRD calls out as a place a
 *  visitor should be able to start or extend a local stack from. */
export default function AddToStackButton({ skillName, context, className = 'btn-ghost' }: AddToStackButtonProps) {
  const { items, isInStack, addItem, canAdd } = useComposer();
  const inStack = isInStack(skillName);
  const needsContext = Boolean(context && !items.some(item => item.name === skillName && hasComposerContext(item.note, context)));

  return (
    <button
      type="button"
      className={className}
      onClick={() => { if (!inStack || needsContext) addItem(skillName, context); }}
      disabled={!inStack && !canAdd}
      aria-pressed={inStack}
      data-action="add-to-stack"
      title={!inStack && !canAdd ? 'Your stack already has the maximum of 8 skills' : undefined}
    >
      {inStack ? (needsContext ? 'Add guidance to stack' : 'In stack') : 'Add to stack'}
    </button>
  );
}
