# Script to set versions back to 0.0.0 for testing the updater
$TestVersion = "0.0.0"

Write-Host "`n=== Setting ScoBroMail to version $TestVersion for updater testing ===`n"

# Step 1: Update version numbers
try {
  Write-Host "→ Updating version numbers to $TestVersion..."
  
  # Update version in tauri.conf.json
  (Get-Content src-tauri\tauri.conf.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$TestVersion`"" | Set-Content src-tauri\tauri.conf.json
  Write-Host "✅ Updated tauri.conf.json"
  
  # Update only the package version in Cargo.toml, not dependency versions
  $cargoContent = Get-Content src-tauri\Cargo.toml
  $cargoContent = $cargoContent -replace '^version\s*=\s*"[^"]+"', "version = `"$TestVersion`""
  $cargoContent | Set-Content src-tauri\Cargo.toml
  Write-Host "✅ Updated Cargo.toml"
  
  # Update version in package.json
  (Get-Content package.json) -replace '"version":\s*"[^"]+"', "`"version`": `"$TestVersion`"" | Set-Content package.json
  Write-Host "✅ Updated package.json"
  
} catch {
  Write-Error "❌ Failed to update version numbers: $_"
  exit 1
}

# Step 2: Build the app
Write-Host "`n→ Building the app with version $TestVersion..."
npm run tauri build
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Build failed. Check the console above."
  exit 1
}

Write-Host "`n✅ Successfully set version to $TestVersion and built the app"
Write-Host "→ You can now run the app to test the updater"
Write-Host "→ The updater should detect version 1.0.0 as available for download" 