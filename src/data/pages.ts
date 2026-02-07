import type { PageMeta } from './meta';

// ページスラッグの型（追加する場合はここに追加）
export type PageSlug =
  | 'home'
  | 'about'
  | 'about/test'
  | 'about/team'
  | 'contact'
  | 'news';

// ページメタデータの定義
export const pages: Record<PageSlug, PageMeta> = {
  home: {
    title: 'ホーム',
    description: 'Astro で構築されたウェブサイトのホームページ',
  },
  about: {
    title: '私たちについて',
    description: '私たちのサービスや会社について紹介します',
  },
  'about/test': {
    title: 'テストページ',
    description: 'aboutセクションのテストページです',
  },
  'about/team': {
    title: 'チーム紹介',
    description: '私たちのチームメンバーを紹介します',
  },
  contact: {
    title: 'お問い合わせ',
    description: 'お気軽にお問い合わせください',
  },
  news: {
    title: 'お知らせ',
    description: '最新のお知らせ・ニュースをお届けします',
  },
} as const;

// ページスラッグからメタデータを取得するヘルパー関数
export function getPageMeta(slug: PageSlug): PageMeta {
  return pages[slug];
}
