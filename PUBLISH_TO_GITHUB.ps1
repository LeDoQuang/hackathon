# PowerShell helper. FIRST create an EMPTY PUBLIC repo at https://github.com/new
# Example invocation: .\PUBLISH_TO_GITHUB.ps1 -RepoUrl 'https://github.com/YOUR_NAME/secondkey-unlocked.git'
param([Parameter(Mandatory=$true)][string]$RepoUrl)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if ($RepoUrl -notmatch '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?$') { throw 'Repo URL should be https://github.com/USER/REPO.git' }
if (Test-Path '.\public\tidecloak.json') { throw 'STOP: local Tide adapter exists in this folder. Do not publish it.' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is not installed, install Git for Windows.' }
if (-not (Test-Path '.git')) { git init; if ($LASTEXITCODE -ne 0) { throw 'git init failed' } }
git add .
if ($LASTEXITCODE -ne 0) { throw 'git add failed' }
$files = @(git diff --cached --name-only)
if ($files | Where-Object { $_ -match '(^|/)(tidecloak\.json|\.env|.*\.pem|.*\.key)$' }) { throw 'STOP: a potentially sensitive file has been staged.' }
git status --short
$confirm=Read-Host 'Review staged filenames above. Type UPLOAD to continue'
if ($confirm -cne 'UPLOAD') { Write-Host 'Cancelled'; exit 0 }
git commit -m 'SecondKey UNLOCKED prototype and captioned demo'
if ($LASTEXITCODE -ne 0) { Write-Host 'Commit not created: check git user.name and user.email (or nothing new to commit)' ; exit 1 }
git branch -M main
$remotes = @(git remote)
if ($remotes -contains 'origin') {
  $current = git remote get-url origin
  if ($current -ne $RepoUrl) { throw "An origin already exists: $current ; remove/update it manually." }
} else { git remote add origin $RepoUrl }
git push -u origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. See console output for GitHub authentication or remote error.' }
Write-Host 'Uploaded. Open your PUBLIC repository in an incognito browser and verify README + demo.mp4.'
