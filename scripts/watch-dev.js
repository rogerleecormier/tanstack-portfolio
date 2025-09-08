import chokidar from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';

const watchedDirs = [
  './portfolio/**/*.md',
  './blog/**/*.md',
  './projects/**/*.md'
];

console.log('🔍 Starting file watcher for content cache...');
console.log('Watching directories:', watchedDirs.map(dir => path.resolve(dir).replace(/\*\*\/*.md$/, '')));

const watcher = chokidar.watch(watchedDirs, {
  ignored: /^\./, // ignore dotfiles
  persistent: true,
  ignoreInitial: true // don't trigger on startup
});

let rebuildTimeout;

watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${filePath}`);
  clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(() => {
    console.log('🔄 Rebuilding content cache...');
    try {
      execSync('node scripts/rebuild-cache.js', { stdio: 'inherit' });
      console.log('✅ Cache rebuilt successfully!');
    } catch (error) {
      console.error('❌ Failed to rebuild cache:', error.message);
    }
  }, 1000); // Debounce: wait 1s after last change
});

watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});

console.log('👀 Watcher is active. Press Ctrl+C to stop.');