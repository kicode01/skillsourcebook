$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$SkillSource = Join-Path $RepoRoot 'skills\noslop'

$Targets = @(
  @{ Name = 'Antigravity'; Dest = (Join-Path $env:USERPROFILE '.gemini\config\skills\noslop') },
  @{ Name = 'Claude Code'; Dest = (Join-Path $env:USERPROFILE '.claude\skills\noslop') },
  @{ Name = 'Cursor';      Dest = (Join-Path $env:USERPROFILE '.cursor\skills\noslop') },
  @{ Name = 'Codex / Open';Dest = (Join-Path $env:USERPROFILE '.agents\skills\noslop') }
)

foreach ($t in $Targets) {
  $parent = Split-Path -Parent $t.Dest
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
  if (Test-Path $t.Dest) {
    Remove-Item $t.Dest -Recurse -Force
  }
  New-Item -ItemType Junction -Path $t.Dest -Target $SkillSource | Out-Null
  Write-Host "Linked $($t.Name): $($t.Dest) -> $SkillSource"
}
