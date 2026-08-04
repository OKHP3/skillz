import { useComposer } from '../../contexts/ComposerContext';

interface AddToStackButtonProps {
  skillName: string;
  className?: string;
}

/** Reusable "Add to stack" affordance used on Explore cards, skill detail,
 *  family detail, and Compare — every surface the PRD calls out as a place a
 *  visitor should be able to start or extend a local stack from. */
export default function AddToStackButton({ skillName, className = 'btn-ghost' }: AddToStackButtonProps) {
  const { isInStack, addItem, canAdd } = useComposer();
  const inStack = isInStack(skillName);

  return (
    <button
      type="button"
      className={className}
      onClick={() => { if (!inStack) addItem(skillName); }}
      disabled={!inStack && !canAdd}
      aria-pressed={inStack}
      data-action="add-to-stack"
      title={!inStack && !canAdd ? 'Your stack already has the maximum of 8 skills' : undefined}
    >
      {inStack ? 'In stack' : 'Add to stack'}
    </button>
  );
}
