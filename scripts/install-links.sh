#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_SOURCE="$REPO_ROOT/skills/skillsourcebook"

link_target() {
  local label="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  ln -s "$SKILL_SOURCE" "$dest"
  echo "Linked $label: $dest -> $SKILL_SOURCE"
}

link_target "Antigravity" "$HOME/.gemini/config/skills/skillsourcebook"
link_target "Claude Code" "$HOME/.claude/skills/skillsourcebook"
link_target "Cursor"      "$HOME/.cursor/skills/skillsourcebook"
link_target "Codex/Open"  "$HOME/.agents/skills/skillsourcebook"
