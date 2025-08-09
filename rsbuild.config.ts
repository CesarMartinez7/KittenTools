// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    favicon: './src/public/toby.svg',
    template: './src/public/index.html',
  },
  output: {
    assetPrefix: './', // 👈 rutas relativas
    distPath: {
      root: 'dist',
    },
  },
});
