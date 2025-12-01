# ╔══════════════════════════════════════════╗
# ║   PocketBase Auto-Download & Start       ║
# ║   Windows – PowerShell (7+ or 5.1)       ║
# ╚══════════════════════════════════════════╝

# ────── CONFIGURATION (change only these lines) ──────
$Port    = 10000                     # ← Change your desired port here
$Version = "0.22.17"                 # ← Update only when a newer release exists
$InstallFolder = ".\pocketbase"   # Where PocketBase will live
# ─────────────────────────────────────────────────────

# Do not edit below this line unless you know what you are doing
$zipUrl      = "https://github.com/pocketbase/pocketbase/releases/download/v$Version/pocketbase_${Version}_windows_amd64.zip"
$zipPath     = "$env:TEMP\pocketbase_$Version.zip"
$exePath     = "$InstallFolder\pocketbase.exe"

Write-Host "PocketBase Starter" -ForegroundColor Cyan
Write-Host "Version : $Version" -ForegroundColor White
Write-Host "Port    : $Port"     -ForegroundColor White
Write-Host "Folder  : $InstallFolder`n" -ForegroundColor White

# Create installation folder if needed
if (-not (Test-Path $InstallFolder)) {
    New-Item -ItemType Directory -Path $InstallFolder -Force | Out-Null
}

# Download
Write-Host "Downloading PocketBase v$Version ..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

# Extract (overwrite existing files)
Write-Host "Extracting to $InstallFolder ..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $InstallFolder -Force

# Cleanup zip
Remove-Item $zipPath -Force

# Unblock the executable (Windows sometimes marks downloaded exe as unsafe)
if (Test-Path $exePath) {
    Unblock-File -Path $exePath -ErrorAction SilentlyContinue
}

# Final confirmation
Write-Host "`nPocketBase is ready!" -ForegroundColor Green
Write-Host "→ Server will be available at: http://localhost:$Port" -ForegroundColor Yellow
Write-Host "→ Admin UI: http://127.0.0.1:$Port/_/`n" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Gray

# Start PocketBase with the chosen port
& $exePath serve --http="0.0.0.0:$Port"