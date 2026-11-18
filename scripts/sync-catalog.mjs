#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const catalogDir = path.join(rootDir, 'catalog');
const webPublicDataDir = path.join(rootDir, 'web', 'public', 'data');

const UI_SKILLS_REGISTRY_URL = 'https://www.ui-skills.com/skills/registry.json';

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const curated = readJson(path.join(catalogDir, 'curated.json'), []);
  const combos = readJson(path.join(catalogDir, 'combos.json'), []);

  console.log(`Fetching ${UI_SKILLS_REGISTRY_URL}...`);
  const res = await fetch(UI_SKILLS_REGISTRY_URL, {
    signal: AbortSignal.timeout(15000),
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch registry: HTTP ${res.status}`);
  }
  const upstream = await res.json();
  const rawSkills = Array.isArray(upstream.registry) ? upstream.registry : [];

  const normalizedUpstream = rawSkills.map((item) => ({
    id: `ui-skills/${item.pathSlug}`,
    kind: 'skill',
    name: item.name || item.slug,
    pathSlug: item.pathSlug,
    source: item.sourceLabel || item.user || 'ui-skills',
    category: 'Community Skill',
    topics: Array.isArray(item.topics) ? item.topics : [],
    description: item.description || '',
    install: `npx ui-skills get ${item.pathSlug}`,
    rawUrl: item.rawUrl || '',
    url: item.githubUrl || `https://www.ui-skills.com/skills/${item.pathSlug}`,
  }));

  const items = [...curated, ...normalizedUpstream];

  const payload = {
    generatedAt: new Date().toISOString(),
    stats: {
      total: items.length,
      coreModules: curated.filter((i) => i.source === 'skillsourcebook' && i.kind === 'skill').length,
      workflows: items.filter((i) => i.kind === 'workflow').length,
      mcps: items.filter((i) => i.kind === 'mcp').length,
      upstreamSkills: normalizedUpstream.length,
      combos: combos.length,
    },
    combos,
    items,
  };

  fs.mkdirSync(catalogDir, { recursive: true });
  fs.writeFileSync(path.join(catalogDir, 'index.json'), JSON.stringify(payload, null, 2));

  fs.mkdirSync(webPublicDataDir, { recursive: true });
  fs.writeFileSync(path.join(webPublicDataDir, 'catalog.json'), JSON.stringify(payload));

  console.log(
    `Synced ${payload.stats.total} entries (${payload.stats.coreModules} core modules, ${payload.stats.mcps} MCPs, ${payload.stats.workflows} workflows, ${payload.stats.upstreamSkills} upstream skills, ${payload.stats.combos} combos).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
