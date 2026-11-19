<#
.SYNOPSIS
  Build, version, privacy-check and publish the Fusion Manage partner academy to GitHub Pages.

.EXAMPLE
  .\publish.ps1 -Notes "Added Japanese edition"
  .\publish.ps1 -NoBump -Notes "README wording only"
  .\publish.ps1 -Notes "Fix estimator" -NoRelease

.NOTES
  - The version is a plain integer in VERSION. It bumps only when something under src/ changed since the last vN tag (unless -NoBump).
  - The latest build goes to docs/<lang>/index.html. Each version is also archived to docs/archive/vN/<lang>/index.html.
  - The privacy gate must report 0 hits, otherwise nothing is committed. The denylist stays OUTSIDE the repo.
#>
param(
  [string]$Notes = "",
  [switch]$NoBump,
  [switch]$NoRelease,
  [string]$Denylist = "D:\FM_Partner_Enablement\_work\denylist_publish.txt",
  [string[]]$Langs = @("ko")
)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Run($exe, [string[]]$a) { $old = $ErrorActionPreference; $ErrorActionPreference = "Continue"; & $exe @a 2>&1 | ForEach-Object { "$_" }; $code = $LASTEXITCODE; $ErrorActionPreference = $old; if ($code -ne 0) { throw "$exe $($a -join ' ') failed ($code)" } }

# 1. Version
$ver = [int](Get-Content VERSION -Raw).Trim()
$lastTag = (git tag --list "v*" --sort=-v:refname | Select-Object -First 1)
$bumped = $false
if ($lastTag) {
  $ErrorActionPreference = "Continue"; git diff --quiet $lastTag -- src; $changed = ($LASTEXITCODE -ne 0); $ErrorActionPreference = "Stop"
  if ($changed -and -not $NoBump) { $ver++; Set-Content VERSION "$ver" -NoNewline; $bumped = $true }
} else { $bumped = $true }   # first release keeps the current VERSION
if ($bumped -and -not $Notes) { throw "Give -Notes ""what changed"" for a new version." }
$date = Get-Date -Format "yyyy-MM-dd"
Write-Host "Version v$ver ($(if ($bumped) {'new'} else {'unchanged'})) $date"

# 2. Validate + build
foreach ($l in $Langs) {
  Run python @("-I", "tools/validate.py", $l)
  Run python @("-I", "tools/build.py", $l, "--date", $date)                                   # site/ (download copy)
  Run python @("-I", "tools/build.py", $l, "--pages", "--out", "docs/$l", "--date", $date)    # latest
  if ($bumped) { Run python @("-I", "tools/build.py", $l, "--pages", "--out", "docs/archive/v$ver/$l", "--date", $date) }
}
Run python @("-I", "tools/landing.py", "--date", $date)

# 3. Privacy gate
$scan = @("-I", "tools/scan_patterns.py", "src", "site", "docs", "README.md")
if (Test-Path $Denylist) { $scan += @("--denylist", $Denylist) } else { Write-Warning "Denylist not found: pattern checks only." }
Run python $scan

# 4. Changelog
if ($bumped) {
  $entry = "## v$ver - $date`n`n- $Notes`n`n"
  $cl = if (Test-Path CHANGELOG.md) { Get-Content CHANGELOG.md -Raw } else { "# Changelog`n`n" }
  $cl = $cl -replace "^# Changelog\s*", ("# Changelog`n`n" + $entry)
  Set-Content CHANGELOG.md $cl -NoNewline -Encoding utf8
}

# 5. Commit, tag, push, release
Run git @("add", "-A")
$ErrorActionPreference = "Continue"; git diff --cached --quiet; $staged = ($LASTEXITCODE -ne 0); $ErrorActionPreference = "Stop"
if ($staged) {
  $msg = if ($bumped) { "Release v$ver - $Notes" } else { "Update site ($date)$(if ($Notes) {' - ' + $Notes})" }
  Run git @("commit", "-q", "-m", $msg, "-m", "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>")
}
if ($bumped) { Run git @("tag", "v$ver") }
Run git @("push", "-q", "origin", "main", "--tags")
if ($bumped -and -not $NoRelease) {
  Run gh @("release", "create", "v$ver", "--title", "v$ver", "--notes", "$Notes`n`nLive: https://yjyoo122.github.io/fusion-manage-partner-academy/ · Unofficial reference, not Autodesk material.")
}
Write-Host "Done. Live in ~1 min: https://yjyoo122.github.io/fusion-manage-partner-academy/"
