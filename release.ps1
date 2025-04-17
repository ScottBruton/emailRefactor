# Prompt user for version input
$Version = Read-Host "Enter the version to release (e.g. 1.1.0)"
$Notes = Read-Host "Enter release notes (single line)"

# Configuration
$AppName = "ScoBroMail-Refactor"
$ExeName = "$AppName" + "_" + $Version + "_x64-setup.exe"
$ExePath = "src-tauri\target\release\bundle\nsis\$ExeName"
$SigPath = "$ExePath.sig"
$LatestJsonPath = "latest.json"
$GitHubUser = "ScottBruton"
$Repo = "emailRefactor"
$ReleaseTag = "v$Version"
$DownloadURL = "https://github.com/$GitHubUser/$Repo/releases/download/$ReleaseTag/$ExeName"

# Check for required tools and files
Write-Host "→ Checking prerequisites..."

if (-not (Test-Path ".tauri-key.private")) {
  Write-Host "⚠️  Private key file not found. Generating one..."
  try {
    $env:TAURI_KEY_PASSWORD = "mypass123"
    $keyOutput = tauri signer generate 2>&1
    $lines = $keyOutput -split "`n"
    
    # Extract both private and public keys
    $privateKey = $lines | Where-Object { $_ -notmatch "^untrusted comment:" -and $_ -match "^[a-zA-Z0-9+/=]+$" } | Select-Object -First 1
    $publicKey = $lines | Where-Object { $_ -match "^[a-zA-Z0-9+/=]+$" } | Select-Object -Last 1
    
    if (-not $privateKey -or -not $publicKey) {
      Write-Error "❌ Failed to extract valid keys."
      exit 1
    }
    
    # Save private key
    $privateKey | Out-File -Encoding ascii ".tauri-key.private"
    Write-Host "✅ .tauri-key.private generated successfully."
    
    # Update tauri.conf.json with the new public key
    Write-Host "→ Updating public key in tauri.conf.json..."
    $tauriConfig = Get-Content "src-tauri\tauri.conf.json" | ConvertFrom-Json
    $tauriConfig.plugins.updater.pubkey = $publicKey
    $tauriConfig | ConvertTo-Json -Depth 10 | Set-Content "src-tauri\tauri.conf.json"
    Write-Host "✅ Public key updated in tauri.conf.json"
    
  } catch {
    Write-Error "❌ Failed to generate or write keys: $_"
    exit 1
  }
} else {
  Write-Host "✅ Found existing .tauri-key.private"
}

Write-Host "→ Verifying GitHub authentication..."
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ GitHub CLI is not authenticated. Please run: gh auth login"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "❌ npm not found. Please ensure Node.js is installed."
  exit 1
}

if (-not (Get-Command tauri -ErrorAction SilentlyContinue)) {
  Write-Error "❌ Tauri CLI not found. Please install it with: npm install -g @tauri-apps/cli"
  exit 1
}

$LogPath = "release-log-$Version.txt"
Start-Transcript -Path $LogPath -Append

Write-Host "`n=== ScoBroMail Automated Release v$Version ===`n"

# Step 0: Delete existing tag and release if they exist
Write-Host "→ Checking for existing release/tag..."
gh release view $ReleaseTag 2>$null
if ($LASTEXITCODE -eq 0) {
  try {
    Write-Host "→ Deleting existing release $ReleaseTag..."
    gh release delete $ReleaseTag --yes | Out-Null
    Start-Sleep -Seconds 2
    git tag -d $ReleaseTag | Out-Null
    git push --delete origin $ReleaseTag | Out-Null
    Start-Sleep -Seconds 2
  } catch {
    Write-Error "❌ Failed to delete existing release or tag: $_"
    Stop-Transcript
    exit 1
  }
}

# Step 1: Update version numbers
try {
  Write-Host "→ Updating version numbers..."
  (Get-Content src-tauri\tauri.conf.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$Version`"" | Set-Content src-tauri\tauri.conf.json
  $cargoContent = Get-Content src-tauri\Cargo.toml
  $cargoContent = $cargoContent -replace '^version\s*=\s*"[^"]+"', "version = `"$Version`""
  $cargoContent | Set-Content src-tauri\Cargo.toml
  (Get-Content package.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$Version`"" | Set-Content package.json
  Start-Sleep -Seconds 1
} catch {
  Write-Error "❌ Failed to update version numbers: $_"
  Stop-Transcript
  exit 1
}

# Step 2: Install dependencies
Write-Host "→ Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ npm install failed"
  Stop-Transcript
  exit 1
}

# Step 3: Commit and push changes
try {
    Write-Host "→ Syncing with remote repository..."
    git fetch origin
    git pull origin new_Update --rebase
    
    Write-Host "→ Committing version changes..."
    git add src-tauri\tauri.conf.json src-tauri\Cargo.toml package.json
    git commit -m "Release v$Version" | Out-Null
    
    Write-Host "→ Pushing changes..."
    git push origin new_Update
    
    Write-Host "→ Creating and pushing tag..."
    git tag -f $ReleaseTag
    git push -f origin $ReleaseTag
    
    Start-Sleep -Seconds 2
} catch {
    Write-Error "❌ Git operations failed: $_"
    Write-Host "Try running these commands manually:"
    Write-Host "git fetch origin"
    Write-Host "git pull origin new_Update --rebase"
    Write-Host "git push origin new_Update"
    Stop-Transcript
    exit 1
}

# Step 4: Build the app
Write-Host "→ Building the app..."
npm run tauri build
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Build failed. Check the console above."
  Stop-Transcript
  exit 1
}
Start-Sleep -Seconds 2

if (-not (Test-Path $ExePath)) {
  Write-Error "❌ Installer not found at expected path: $ExePath"
  Stop-Transcript
  exit 1
}

# Step 5: Verify the signature file exists
Write-Host "→ Verifying signature file..."
if (-not (Test-Path $SigPath)) {
  Write-Error "❌ Signature file not found at: $SigPath"
  Stop-Transcript
  exit 1
}
Write-Host "✅ Signature file verified."

# Step 6: Generate latest.json
try {
  Write-Host "→ Generating latest.json..."
  if (Test-Path $LatestJsonPath) {
    Copy-Item $LatestJsonPath "$LatestJsonPath.backup"
    Write-Host "→ Backed up existing latest.json to $LatestJsonPath.backup"
  }

  $SignatureValue = Get-Content "$SigPath" -Raw
  Write-Host "→ Signature value from file:"
  Write-Host $SignatureValue
  
  # Get public key from tauri.conf.json for verification
  $TauriConfig = Get-Content "src-tauri\tauri.conf.json" | ConvertFrom-Json
  Write-Host "→ Public key from tauri.conf.json:"
  Write-Host $TauriConfig.plugins.updater.pubkey
  
  $Date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

  # Create JSON object and convert to string
  $JsonObject = @{
    version = $Version
    notes = $Notes
    pub_date = $Date
    platforms = @{
      "windows-x86_64" = @{
        signature = $SignatureValue.Trim()
        url = $DownloadURL
      }
    }
  }

  # Convert to JSON with proper formatting
  $JsonContent = $JsonObject | ConvertTo-Json -Depth 10

  # Write to file without BOM and with UTF8 encoding
  [System.IO.File]::WriteAllText($LatestJsonPath, $JsonContent, [System.Text.UTF8Encoding]::new($false))
  Write-Host "✅ Clean latest.json written to $LatestJsonPath"
  
  # Verify JSON is valid
  try {
    $null = Get-Content $LatestJsonPath | ConvertFrom-Json
    Write-Host "✅ JSON validation successful"
  } catch {
    Write-Error "❌ Generated JSON is invalid: $_"
    exit 1
  }
  
  Start-Sleep -Seconds 1
} catch {
  Write-Error "❌ Failed to generate latest.json: $_"
  Stop-Transcript
  exit 1
}

# Step 7: Upload to GitHub
try {
  Write-Host "→ Uploading to GitHub release..."
  gh release create $ReleaseTag `
    $ExePath `
    $SigPath `
    $LatestJsonPath `
    --title "v$Version" `
    --notes "$Notes" `
    --latest | Out-Null
  Start-Sleep -Seconds 2
} catch {
  Write-Error "❌ GitHub release upload failed: $_"
  Stop-Transcript
  exit 1
}

# Verification section
Write-Host "`n=== Verification Checklist ===" -ForegroundColor Cyan
Write-Host "Checking release artifacts..." -ForegroundColor Yellow

$installerPath = $ExePath
$sigPath = $SigPath

# Check installer exists
if (Test-Path $installerPath) {
    Write-Host "✅ Installer found at: $installerPath" -ForegroundColor Green
} else {
    Write-Host "❌ Installer not found at: $installerPath" -ForegroundColor Red
    exit 1
}

# Check signature exists
if (Test-Path $sigPath) {
    Write-Host "✅ Signature found at: $sigPath" -ForegroundColor Green
} else {
    Write-Host "❌ Signature not found at: $sigPath" -ForegroundColor Red
    exit 1
}

# Check latest.json
if (Test-Path $LatestJsonPath) {
    Write-Host "✅ latest.json found and contains:" -ForegroundColor Green
    Write-Host "   - Version: $Version" -ForegroundColor Gray
    Write-Host "   - Download URL: $DownloadURL" -ForegroundColor Gray
} else {
    Write-Host "❌ latest.json not found at: $LatestJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Release v$Version completed and published!" -ForegroundColor Green
Write-Host "→ Release URL: https://github.com/$GitHubUser/$Repo/releases/tag/$ReleaseTag`n" -ForegroundColor Cyan

Stop-Transcript
