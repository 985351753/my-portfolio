// サイトメタデータの型定義
export type SiteMeta = {
  // 基本情報
  title: string;
  description: string;
  siteUrl: string;
  locale: string;

  // OGP
  ogType: string;
  ogImage: string;

  // Twitter Card
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;

  // Favicon
  favicon: string;
  appleTouchIcon?: string;

  // その他
  themeColor?: string;
  author?: string;
  keywords?: string[];
};

// ページごとのメタデータの型定義
export type PageMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  canonical?: string;
};

// デフォルトのサイトメタデータ
export const siteMeta: SiteMeta = {
  // 基本情報
  title: 'Astro Basics',
  description: 'Astro で構築されたウェブサイト',
  siteUrl: 'https://example.com/htdocs', // baseUrlを含む完全なURL
  locale: 'ja_JP',

  // OGP
  ogType: 'website',
  ogImage: '/og.jpg',

  // Twitter Card
  twitterCard: 'summary_large_image',

  // Favicon
  favicon: '/favicon.svg',
  appleTouchIcon: '/apple-touch-icon.png',
} as const;

// ページメタデータを生成するヘルパー関数
export function generatePageMeta(pageMeta?: PageMeta) {
  return {
    title: pageMeta?.title ? `${pageMeta.title} | ${siteMeta.title}` : siteMeta.title,
    description: pageMeta?.description || siteMeta.description,
    ogImage: pageMeta?.ogImage || siteMeta.ogImage,
    ogType: pageMeta?.ogType || siteMeta.ogType,
    noindex: pageMeta?.noindex || false,
    canonical: pageMeta?.canonical,
  };
}
