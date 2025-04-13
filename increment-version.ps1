# Script to increment version by 0.0.1 from the latest GitHub release

Write-Host "`n=== Fetching latest release version from GitHub ===`n"

# Get the latest release version from GitHub
try {
  Write-Host "→ Fetching latest release version..."
  $latestRelease = gh release view --json tagName 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ No releases found on GitHub. Using current version from tauri.conf.json"
    $currentVersion = (Get-Content src-tauri\tauri.conf.json | Select-String -Pattern '"version":\s*"([^"]+)"').Matches.Groups[1].Value
  } else {
    $latestTag = $latestRelease | ConvertFrom-Json | Select-Object -ExpandProperty tagName
    $currentVersion = $latestTag -replace '^v', ''
    Write-Host "✅ Found latest release version: $currentVersion"
  }
} catch {
  Write-Error "❌ Failed to fetch latest release version: $_"
  Write-Host "⚠️ Using current version from tauri.conf.json"
  $currentVersion = (Get-Content src-tauri\tauri.conf.json | Select-String -Pattern '"version":\s*"([^"]+)"').Matches.Groups[1].Value
}

Write-Host "Current version: $currentVersion"

# Parse version components
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

# Increment patch version
$patch++
$newVersion = "$major.$minor.$patch"

Write-Host "`n=== Incrementing ScoBroMail version to $newVersion ===`n"

# Step 1: Update version numbers
try {
  Write-Host "→ Updating version numbers to $newVersion..."
  
  # Update version in tauri.conf.json
  (Get-Content src-tauri\tauri.conf.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$newVersion`"" | Set-Content src-tauri\tauri.conf.json
  Write-Host "✅ Updated tauri.conf.json"
  
  # Update only the package version in Cargo.toml, not dependency versions
  $cargoContent = Get-Content src-tauri\Cargo.toml
  $cargoContent = $cargoContent -replace '^version\s*=\s*"[^"]+"', "version = `"$newVersion`""
  $cargoContent | Set-Content src-tauri\Cargo.toml
  Write-Host "✅ Updated Cargo.toml"
  
  # Update version in package.json
  (Get-Content package.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$newVersion`"" | Set-Content package.json
  Write-Host "✅ Updated package.json"
  
} catch {
  Write-Error "❌ Failed to update version numbers: $_"
  exit 1
}

# Step 2: Build the app
Write-Host "`n→ Building the app with version $newVersion..."
npm run tauri build
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Build failed. Check the console above."
  exit 1
}

Write-Host "`n✅ Successfully incremented version to $newVersion and built the app"
Write-Host "→ You can now run the app to test the new version" 