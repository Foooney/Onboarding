// GitHub Pages has no server-side rewrites: any URL it can't find (e.g. a
// deep link like /journeys/xyz) is served straight from 404.html. Copying the
// built index.html there lets react-router take over client-side once it
// loads, so deep links and reloads work instead of showing a real 404.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'));
console.log('Copied dist/index.html -> dist/404.html for SPA routing on GitHub Pages.');
