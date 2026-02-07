import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  // 除外するファイル・ディレクトリ
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.astro/',
      '*.min.js',
    ],
  },
  // Astro推奨設定
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // 必要に応じてルールをカスタマイズ
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];
