import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'functions');
const destDir = path.join(__dirname, '..', 'dist', 'functions');

console.log('🔄 Copying Pages Functions to dist...');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`📁 Created directory: ${destDir}`);
}

// Function to copy directory recursively
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Create subdirectory and recurse
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      // Only copy TypeScript files (Pages Functions)
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Copied: ${entry.name}`);
    }
  }
}

try {
  copyDir(srcDir, destDir);
  console.log('✅ Pages Functions copied successfully!');
  console.log(`📍 Functions deployed to: ${destDir}`);
} catch (error) {
  console.error('❌ Error copying functions:', error.message);
  process.exit(1);
}
