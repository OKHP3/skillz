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
