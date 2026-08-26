const REPO = 'https://github.com/OKHP3/skillz';

export function skillGitHubUrl(repoPath: string): string {
  return `${REPO}/blob/main/${repoPath}`;
}

export function skillRawUrl(repoPath: string): string {
  return `https://raw.githubusercontent.com/OKHP3/skillz/main/${repoPath}`;
}

export function familyDirUrl(family: string): string {
  return `${REPO}/tree/main/${family}`;
}

export function skillCommitHistoryUrl(repoPath: string): string {
  return `${REPO}/commits/main/${repoPath}`;
}

export function commitUrl(sha: string): string {
  return `${REPO}/commit/${sha}`;
}

export function issueUrl(opts: {
  title?: string;
  body?: string;
  labels?: string[];
}): string {
  const params = new URLSearchParams();
  if (opts.title) params.set('title', opts.title);
  if (opts.body) params.set('body', opts.body);
  if (opts.labels?.length) params.set('labels', opts.labels.join(','));
  return `${REPO}/issues/new?${params.toString()}`;
}

export function bugReportUrl(skillName: string): string {
  return issueUrl({
    title: `Bug: ${skillName}`,
    body: `**Skill:** \`${skillName}\`\n\n**Issue:**\n\n**Steps to reproduce:**\n\n**Expected behavior:**\n\n**Actual behavior:**`,
    labels: ['bug'],
  });
}

export function newSkillUrl(topic?: string): string {
  return issueUrl({
    title: topic ? `New skill: ${topic}` : 'New skill suggestion',
    body: `**Recurring task:**\n\n**Family:**\n\n**Why it should be a skill:**\n\n**Example invocation:**`,
    labels: ['new-skill'],
  });
}

export function improveSkillUrl(skillName: string, repoPath: string): string {
  return issueUrl({
    title: `Improve: ${skillName}`,
    body: `**Skill:** \`${skillName}\`\n**File:** \`${repoPath}\`\n\n**What to improve:**\n\n**Suggested change:**`,
    labels: ['enhancement'],
  });
}

export function companionIssueUrl(): string {
  return issueUrl({ title: 'Companion relationship: ', labels: ['companion'] });
}

export function securityAdvisoryUrl(): string {
  return `${REPO}/security/advisories/new`;
}

export function prUrl(): string {
  return `${REPO}/pulls`;
}

export function discussionsUrl(): string {
  return `${REPO}/discussions`;
}

export function repoUrl(): string {
  return REPO;
}

export function installCommand(skill: { rawUrl: string; name: string }): string {
  return `# Load in Claude Project or agent context:\n${skill.rawUrl}`;
}

/** Prefilled issue for suggesting an improvement to a curated stack — lists
 *  the stack's real, current skill names so a maintainer sees exactly what
 *  the reporter was looking at, without the reporter needing to type it. */
export function stackImproveIssueUrl(stackId: string, stackName: string, skillNames: string[]): string {
  const list = skillNames.map(n => `- \`${n}\``).join('\n');
  return issueUrl({
    title: `Stack: ${stackName}`,
    body: `**Stack:** \`${stackId}\` (${stackName})\n**Current skills:**\n${list}\n\n**What to improve:**\n\n**Suggested change:**`,
    labels: ['enhancement', 'stack'],
  });
}

/** Prefilled issue for a locally composed stack from the composer — the
 *  reporter's own selection, notes, and order, not the maintainers' curated
 *  stacks. Kept separate from `stackImproveIssueUrl` since one is about an
 *  authored stack and the other about ad-hoc visitor composition. */
export function composedStackIssueUrl(items: { name: string; optional: boolean; note: string }[]): string {
  const list = items
    .map((item, i) => `${i + 1}. \`${item.name}\`${item.optional ? ' (optional)' : ''}${item.note ? ` — ${item.note}` : ''}`)
    .join('\n');
  return issueUrl({
    title: 'New skill suggestion from a composed stack',
    body: `**Composed stack (${items.length} skill${items.length !== 1 ? 's' : ''}):**\n${list}\n\n**What's missing or should change:**`,
    labels: ['new-skill'],
  });
}
