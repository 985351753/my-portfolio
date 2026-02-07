module.exports = {
  extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
  overrides: [
    {
      files: ["*.scss", "**/*.scss"],
      customSyntax: "postcss-scss",
    },
  ],
  rules: {
    // SCSS固有のルール
    "scss/at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "apply", "layer"],
      },
    ],
    "custom-property-pattern": [
      "^(_?[a-z][a-z0-9]*)([-_][a-z0-9]+)*$|^--[a-z0-9_-]+$", 
      {
        message: "Expected custom property name to be kebab-case or allow underscores",
      },
    ],
    "scss/dollar-variable-pattern": null,
    "scss/at-mixin-pattern": null,
    "scss/at-function-pattern": null,

    // セレクタのルール
    "selector-class-pattern": null,
    "selector-id-pattern": null,

    // キーフレーム名のルール（すべての命名形式を許可）
    "keyframes-name-pattern": "^([a-z][a-zA-Z0-9]*|[a-z]+(-[a-z0-9]+)*)$",

    // 一般的なルール
    "max-nesting-depth": 4,
    "declaration-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "no-descending-specificity": null,

    // 値のルール
    "color-function-notation": "legacy",
    "alpha-value-notation": "number",

    // mixin内でメディアクエリを生成する場合に必要
    "no-invalid-position-declaration": null,
  },
};
