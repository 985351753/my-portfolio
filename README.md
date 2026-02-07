# nebulous-nebula

Astro + Preactを使用したWebプロジェクトです。

## 技術スタック

- **Astro** - 静的サイトジェネレーター
- **Preact** - UIコンポーネント
- **Sass/SCSS** - スタイリング（ITCSS構造）
- **GSAP** - アニメーション
- **TypeScript** - 型安全性

## プロジェクト構造

```text
/
├── public/                # 静的ファイル
├── scripts/              # ビルドスクリプト
├── src/
│   ├── components/       # コンポーネント
│   │   ├── features/    # ドメイン固有コンポーネント
│   │   ├── pages/       # ページ固有コンポーネント
│   │   │   ├── about/
│   │   │   └── top/
│   │   └── ui/          # 再利用可能なUIコンポーネント
│   │       └── picture/
│   ├── data/            # データファイル
│   ├── layouts/         # レイアウトテンプレート
│   ├── pages/           # ページ（ルーティング）
│   ├── scripts/         # クライアントサイドスクリプト
│   │   ├── base/
│   │   ├── components/
│   │   ├── constants/
│   │   └── utils/
│   └── styles/          # スタイル（ITCSS構造）
│       ├── Settings/    # 変数・設定
│       ├── Tools/       # ミックスイン・関数
│       ├── Generic/     # リセット・ノーマライズ
│       ├── Base/        # 要素セレクタ
│       ├── Objects/     # レイアウトパターン
│       ├── Components/  # UIコンポーネント
│       ├── Pages/       # ページ固有のスタイル
│       └── Trumps/      # ユーティリティ・オーバーライド
└── package.json
```

## コマンド

プロジェクトのルートディレクトリで以下のコマンドを実行します：

| コマンド | 説明 |
| :------------------------ | :----------------------------------------------- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動（`localhost:4321`） |
| `npm run build` | 本番用ビルド（`./dist/`に出力） |
| `npm run preview` | ビルドのプレビュー |
| `npm run lint:css` | CSSのLint |
| `npm run lint:css:fix` | CSSのLint（自動修正） |
| `npm run lint:js` | JavaScriptのLint |
| `npm run lint:js:fix` | JavaScriptのLint（自動修正） |

## 開発

### パスエイリアス

`@` を使用してsrcディレクトリを参照できます：

```typescript
import Component from '@/components/ui/Component';
import '@/styles/main.scss';
```

### ビルド設定

- ベースパス: `/htdocs`
- アセット出力先: `dist/assets/`
  - スクリプト: `assets/scripts/`
  - スタイル: `assets/styles/`
  - チャンク: `assets/chunk/`

### スタイルガイド

- ITCSS（Inverted Triangle CSS）アーキテクチャを採用
- BEM命名規則を推奨
- コンポーネント固有のスタイルは各コンポーネントディレクトリ内に配置

#### CSS接頭辞ルール

| 分類 | 接頭辞 | 説明 |
| :--- | :----- | :--- |
| ui (Base/Atomic) | `c-` | 再利用可能なUIコンポーネント |
| features | `f-` | ドメイン固有のコンポーネント |
| pages | `p-` | ページ固有のコンポーネント |
