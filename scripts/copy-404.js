import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
console.log('Created dist/404.html for GitHub Pages SPA routing.');
