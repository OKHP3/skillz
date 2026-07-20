/**
 * analytics.ts — GA4 event helpers for Skillz Forge
 *
 * Measurement ID: G-VJ1BKXS27H (OverKill Hill P³™ shared property)
 *
 * Rules:
 * - Never send raw user-entered search text
 * - Never send credentials, tokens, or PII
 * - Use only safe aggregates: query_length_bucket, result_count_bucket, filter_type, etc.
 * - trackPageview() is called by AnalyticsTracker in App.tsx on every hash route change
 *
 * Event taxonomy (document changes here):
 *   skill_search         { query_length_bucket, result_count_bucket, filter_count }
 *   skill_filter_apply   { filter_type }
 *   skill_open           { skill_name, family, maturity }
 *   skill_copy_install   { skill_name, family }
 *   skill_copy_raw_url   { skill_name, family }
 *   skill_share          { skill_name }
 *   skill_save           { skill_name }
 *   stack_open           { stack_id }
 *   stack_compose        { action: 'add'|'remove'|'reorder' }
 *   stack_copy_all       { stack_id, skill_count }
 *   compare_open         { skill_count }
 *   faq_expand           { question_id }
 *   github_handoff       { destination_type, skill_name? }
 *   contribution_path_open { path_type }
 */

const MEASUREMENT_ID = 'G-VJ1BKXS27H';

type GtagArgs = [string, ...unknown[]];

function gtag(...args: GtagArgs): void {
  if (typeof window === 'undefined') return;
  const dl = ((window as Window & { dataLayer?: unknown[] }).dataLayer ??= []);
  dl.push(args);
}

export function trackPageview(path: string, title?: string): void {
  gtag('config', MEASUREMENT_ID, {
    page_path: path,
    ...(title ? { page_title: title } : {}),
  });
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  gtag('event', name, params ?? {});
}

// ─── Safe aggregates ──────────────────────────────────────────────────────────

function queryLengthBucket(len: number): string {
  if (len === 0) return '0';
  if (len <= 10) return '1-10';
  if (len <= 30) return '11-30';
  if (len <= 60) return '31-60';
  return '61+';
}

function resultCountBucket(n: number): string {
  if (n === 0) return '0';
  if (n <= 5) return '1-5';
  if (n <= 15) return '6-15';
  if (n <= 30) return '16-30';
  return '31+';
}

// ─── Typed event helpers ──────────────────────────────────────────────────────

export function trackSkillSearch(queryLength: number, resultCount: number, filterCount: number): void {
  trackEvent('skill_search', {
    query_length_bucket: queryLengthBucket(queryLength),
    result_count_bucket: resultCountBucket(resultCount),
    filter_count: filterCount,
  });
}

export function trackFilterApply(filterType: string): void {
  trackEvent('skill_filter_apply', { filter_type: filterType });
}

export function trackSkillOpen(skillName: string, family: string, maturity: string): void {
  trackEvent('skill_open', { skill_name: skillName, family, maturity });
}

export function trackSkillCopyInstall(skillName: string, family: string): void {
  trackEvent('skill_copy_install', { skill_name: skillName, family });
}

export function trackSkillCopyRawUrl(skillName: string, family: string): void {
  trackEvent('skill_copy_raw_url', { skill_name: skillName, family });
}

export function trackSkillShare(skillName: string): void {
  trackEvent('skill_share', { skill_name: skillName });
}

export function trackSkillSave(skillName: string): void {
  trackEvent('skill_save', { skill_name: skillName });
}

export function trackStackOpen(stackId: string): void {
  trackEvent('stack_open', { stack_id: stackId });
}

export function trackStackCompose(action: 'add' | 'remove' | 'reorder'): void {
  trackEvent('stack_compose', { action });
}

export function trackStackCopyAll(stackId: string, skillCount: number): void {
  trackEvent('stack_copy_all', { stack_id: stackId, skill_count: skillCount });
}

export function trackCompareOpen(skillCount: number): void {
  trackEvent('compare_open', { skill_count: skillCount });
}

export function trackFaqExpand(questionId: string): void {
  trackEvent('faq_expand', { question_id: questionId });
}

export function trackGitHubHandoff(destinationType: string, skillName?: string): void {
  trackEvent('github_handoff', {
    destination_type: destinationType,
    ...(skillName ? { skill_name: skillName } : {}),
  });
}

export function trackContributionPath(pathType: string): void {
  trackEvent('contribution_path_open', { path_type: pathType });
}
