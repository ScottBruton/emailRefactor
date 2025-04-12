const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the version from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

// Path to the installer directory
const installerDir = path.join(__dirname, 'src-tauri', 'target', 'release', 'bundle', 'nsis');

// Function to find and rename the installer
function renameInstaller() {
  try {
    // Check if the directory exists
    if (!fs.existsSync(installerDir)) {
      console.error('Installer directory not found. Make sure the build completed successfully.');
      return;
    }

    // Find the installer file (it should be the only .exe file in the directory)
    const files = fs.readdirSync(installerDir);
    const installerFile = files.find(file => file.endsWith('.exe'));

    if (!installerFile) {
      console.error('No installer file found in the directory.');
      return;
    }

    // Create the new filename
    const newFileName = `ScoBro-Mail-Refactor_${version}_x64-setup.exe`;
    const oldPath = path.join(installerDir, installerFile);
    const newPath = path.join(installerDir, newFileName);

    // Rename the file
    fs.renameSync(oldPath, newPath);
    console.log(`Installer renamed to: ${newFileName}`);
  } catch (error) {
    console.error('Error renaming installer:', error);
  }
}

// Run the rename function
renameInstaller(); 