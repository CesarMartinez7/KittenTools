import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'ReactMatter - Formateador de JSON',
    favicon: './src/public/react.svg',
    template: './src/public/index.html',        
  },
});
