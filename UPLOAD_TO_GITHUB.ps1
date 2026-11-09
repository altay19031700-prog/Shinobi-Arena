$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = 'https://github.com/altay19031700-prog/Shinobi-Arena.git'
$work = Join-Path $env:TEMP ('ShinobiArenaUpload_' + [guid]::NewGuid().ToString('N'))
try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'Git is not installed. Install Git for Windows: https://git-scm.com/downloads/win'
    }
    if (-not (Test-Path (Join-Path $src 'app/src/main/AndroidManifest.xml'))) {
        throw 'Android project not found. Put this script in the extracted game folder next to the app directory.'
    }
    Write-Host 'Cloning repository...' -ForegroundColor Cyan
    & git clone $repo $work
    if ($LASTEXITCODE -ne 0) { throw 'Git clone failed. Check internet and GitHub authentication.' }
    Write-Host 'Copying game files...' -ForegroundColor Cyan
    foreach ($item in (Get-ChildItem -Force -LiteralPath $src)) {
        if ($item.Name -in @('.git', '.gradle', 'build', 'local.properties', '.idea')) { continue }
        if ($item.Name -eq 'README.md') { continue }
        if ($item.Name -eq '.github') { continue }
        Copy-Item -LiteralPath $item.FullName -Destination $work -Force -Recurse
    }
    & git -C $work add .
    if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
    $changes = & git -C $work status --porcelain
    if (-not $changes) {
        Write-Host 'No changes to upload. Files may already be present.' -ForegroundColor Yellow
    } else {
        $user = & git -C $work config user.name
        if (-not $user) { & git -C $work config user.name 'altay19031700-prog' }
        $mail = & git -C $work config user.email
        if (-not $mail) { & git -C $work config user.email 'altay19031700-prog@users.noreply.github.com' }
        & git -C $work commit -m 'Add Shinobi Arena 5.36 Android game and audio'
        if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
        Write-Host 'Uploading to GitHub...' -ForegroundColor Cyan
        & git -C $work push origin HEAD:main
        if ($LASTEXITCODE -ne 0) { throw 'Git push failed. Check GitHub authentication and write permissions.' }
        Write-Host 'Upload completed successfully!' -ForegroundColor Green
    }
    Write-Host 'Check APK build: https://github.com/altay19031700-prog/Shinobi-Arena/actions' -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    Write-Host ('Temporary clone: ' + $work) -ForegroundColor Yellow
    exit 1
}
