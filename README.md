# NoSlop

**NoSlop** is a unified, cross-agent engineering skill system, curated resource directory, and web hub (`https://noslop-hub.web.app`) for building production-grade frontend and backend software without AI-generated clichés.

## What's Inside

- **`skills/noslop/`** — One compact router `SKILL.md` + 6 non-conflicting `references/*.md` playbooks using Progressive Disclosure so all agents and subagents share a single high-craft standard without exhausting context budgets.
- **`catalog/`** — Searchable multi-domain resource index (`catalog/index.json`) combining the [UI Skills](https://www.ui-skills.com) registry with curated backend, database, security, testing, MCP, and workflow entries.
- **`workflows/`** — Repeatable engineering runbooks (`new-feature.md`, `redesign-audit.md`, `production-ship-check.md`).
- **`web/`** — Static web directory and interactive skill/MCP/workflow explorer deployed to Firebase Hosting (`noslop-hub.web.app`).
- **`plugin.json`** — Antigravity plugin manifest for one-unit management.

## Quick Setup Across Agents

### Antigravity
Register via plugin or symlink `skills/noslop` into `~/.gemini/config/skills/noslop` (or point `~/.gemini/config/skills.json` at `./skills`).

### Claude Code / Cursor / Codex
Run the installer script from the repository root:

```powershell
# Windows PowerShell
.\scripts\install-links.ps1
```

```bash
# macOS / Linux
./scripts/install-links.sh
```

### Sync the Live Catalog & Build the Web App

```bash
node scripts/sync-catalog.mjs
cd web && npm install && npm run build
```

## License & Attribution

Custom synthesis, web application, and glue scripts are MIT-licensed. Upstream community skills linked or indexed in `catalog/` retain their respective authors' licenses; see [CREDITS.md](./CREDITS.md).
