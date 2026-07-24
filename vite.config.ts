import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from /Onboarding/, not the domain root —
// only apply that base path for production builds so local dev stays at /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Onboarding/' : '/',
}));
