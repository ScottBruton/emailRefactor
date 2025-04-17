# Create a temporary file to store the password
$tempFile = [System.IO.Path]::GetTempFileName()
"mypass123" | Set-Content $tempFile

# Generate the key pair
Write-Host "Generating key pair..."
$keyOutput = cmd /c "type $tempFile | type $tempFile | tauri signer generate 2>&1"
Remove-Item $tempFile  # Clean up the temp file

# Split the output into lines
$lines = $keyOutput -split "`n" | ForEach-Object { $_.Trim() }
Write-Host "Key generation output:"
$lines | ForEach-Object { Write-Host $_ }

# Extract the private key (it's the longer base64 string)
$privateKey = $lines | Where-Object { 
  $_ -match "^[A-Za-z0-9+/=]+" -and 
  $_ -notmatch "untrusted comment" -and
  $_.Length -gt 100  # Private key is longer than public key
} | Select-Object -First 1

# Extract the public key (it's the shorter base64 string)
$publicKey = $lines | Where-Object { 
  $_ -match "^[A-Za-z0-9+/=]+" -and 
  $_ -notmatch "untrusted comment" -and
  $_.Length -lt 100  # Public key is shorter than private key
} | Select-Object -First 1

if (-not $privateKey -or -not $publicKey) {
  Write-Error "❌ Failed to extract valid keys. Key output: $keyOutput"
  exit 1
}

# Save private key with proper format
@(
  "untrusted comment: rsign encrypted secret key",
  $privateKey.Trim()
) | Set-Content -Encoding ASCII ".tauri-key.private"
Write-Host "✅ .tauri-key.private generated successfully."

# Update tauri.conf.json with the new public key
$tauriConfig = Get-Content "src-tauri\tauri.conf.json" -Raw | ConvertFrom-Json
$tauriConfig.plugins.updater.pubkey = $publicKey.Trim()
$tauriConfig | ConvertTo-Json -Depth 10 | Set-Content "src-tauri\tauri.conf.json"
Write-Host "✅ Public key updated in tauri.conf.json"

Write-Host "`nKey generation complete. You can now run the release script." 