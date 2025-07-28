import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'ReactMatter - Formateador de JSON',
    favicon: './src/public/toby.svg',
    template: './src/public/index.html',
  },
});
