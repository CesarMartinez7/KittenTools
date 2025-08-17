// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './src/public/index.html',
  },
  output: {
    assetPrefix: './', // 👈 rutas relativas
    distPath: {
      root: 'dist',
    },
  },
});
