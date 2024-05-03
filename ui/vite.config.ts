import million from 'million/compiler';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [million.vite({ auto: true }), react()],
  base: './',
  publicDir: 'public',
  build: {
    minify: 'esbuild',
    outDir: 'build',
    target: 'esnext'
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  define: {
    'process.env': {},
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  }
})
