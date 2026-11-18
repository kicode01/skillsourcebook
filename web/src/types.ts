export type ResourceKind = 'skill' | 'workflow' | 'mcp';

export interface CatalogItem {
  id: string;
  kind: ResourceKind;
  name: string;
  pathSlug: string;
  source: string;
  category: string;
  topics: string[];
  description: string;
  install?: string;
  configSnippet?: string;
  rawUrl?: string;
  url: string;
}

export interface StackCombo {
  id: string;
  name: string;
  goal: string;
  coreModules: string[];
  upstreamSkills: string[];
  conflictNote: string;
}

export interface CatalogStats {
  total: number;
  coreModules: number;
  workflows: number;
  mcps: number;
  upstreamSkills: number;
  combos: number;
}

export interface CatalogPayload {
  generatedAt: string;
  stats: CatalogStats;
  combos: StackCombo[];
  items: CatalogItem[];
}
