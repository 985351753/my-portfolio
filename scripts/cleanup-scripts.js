import { existsSync, rmSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');

// 削除対象のパス設定
const chunkDir = join(distDir, 'assets/chunk');
const entryFile = join(distDir, 'assets/scripts/index.js'); // 対象のファイル

try {
  // 1. chunkディレクトリを削除
  if (existsSync(chunkDir)) {
    rmSync(chunkDir, { recursive: true, force: true });
    console.log('✓ Removed chunk directory');
  }

  // 2. index.jsファイルを削除
  if (existsSync(entryFile)) {
    unlinkSync(entryFile);
    console.log('✓ Removed unused index.js');
  }

  console.log('✓ Cleanup complete');
} catch (error) {
  console.error('Cleanup error:', error.message);
}