// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
    favicon: './src-tauri/icons/bolt-32x32.png',
  },
  output: {
    assetPrefix: './',
    distPath: {
      root: 'dist',
    },
  },
  resolve: {
    alias: {
      // Ignora las importaciones de las APIs de Tauri durante la construcción
      '@tauri-apps/api/fs': false,
      '@tauri-apps/api/dialog': false,
    },
  },
});
