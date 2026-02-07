// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';
import preact from '@astrojs/preact';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = 'assets';

// https://astro.build/config
export default defineConfig({
  base: '/',
  compressHTML: false,
  outDir: './dist',
  build: {
    assets: `${assetsDir}/chunk`,
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      emptyOutDir: true,
      minify: true,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: (info) => {
            let fileName = 'index';
            if (info.facadeModuleId) {
              const match = info.facadeModuleId?.toLowerCase().match(/\/([^\/]+)\.astro/);
              if (match && match[1]) {
                fileName = match[1];
              }
            }
            return `${assetsDir}/scripts/${fileName}.js`;
          },
          chunkFileNames: `${assetsDir}/chunk/[name].[hash].js`,
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return `${assetsDir}/[name][extname]`;
            const ext = assetInfo.name.split('.').pop();
            if (ext === 'css') {
              const baseName = assetInfo.name.replace(/\.css$/, '');
              return `${assetsDir}/styles/${baseName}[extname]`;
            }
            return `${assetsDir}/${assetInfo.name}`;
          },
        },
      },
    },
  },
  integrations: [preact()],
});
