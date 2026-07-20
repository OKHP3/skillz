export type Maturity = 'placeholder' | 'skeleton' | 'draftable' | 'usable' | 'validated' | 'published';

export interface Skill {
  name: string;
  displayName: string;
  family: string;
  skillDir: string;
  path: string;
  description: string;
  version: string | null;
  license: string;
  category: string;
  origin: string | null;
  author: string | null;
  homepage: string | null;
  maturity: Maturity;
  status: string | null;
  tags: string[];
  topics: string[];
  triggers: string[];
  avoid: string[];
  companions: string[];
  examples: string[];
  inputs: string[];
  outputs: string[];
  tools: string[];
  runtimes: string[];
  boundaries: string[];
  rawUrl: string;
  githubUrl: string;
  lastModified: string | null;
  commitSha: string | null;
}

export interface Family {
  name: string;
  skillCount: number;
  skills: string[];
}

export interface Catalog {
  generatedAt: string;
  sourceRepository: string;
  sourceRef: string;
  sourceCommit: string | null;
  skillCount: number;
  familyCount: number;
  families: Family[];
  skills: Skill[];
}

export interface StackStep {
  label: string;
  skillNames: string[];
  purpose: string;
  inputs?: string;
  outputs?: string;
  optional?: boolean;
}

export interface Stack {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  audience: string;
  steps: StackStep[];
  installNote?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  links?: Array<{ label: string; href: string }>;
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export interface SearchResult {
  skill: Skill;
  score: number;
  matchReason?: string;
}

export type SortKey = 'relevance' | 'alpha' | 'family' | 'maturity';

export interface FilterState {
  query: string;
  family: string;
  maturity: Maturity | '';
  sort: SortKey;
}
