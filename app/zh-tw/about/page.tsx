import type { Metadata } from 'next';
import AboutClient from '@/app/about/AboutClient';

export const metadata: Metadata = {
  title: '關於本站',
  description: '禪宗知識庫（chanzong.space）的編輯原則、文本來源、版權聲明與聯繫方式。本站收錄120部禪宗核心典籍，文本源自CBETA電子佛典集成與大正藏，經人工校對與白話翻譯。',
  alternates: {
    canonical: '/zh-tw/about',
    languages: {
      'zh-Hans': '/about',
      'zh-Hant': '/zh-tw/about',
    },
  },
  openGraph: {
    type: 'website',
    title: '關於本站 | 禪宗知識庫 ChanZong.space',
    description: '禪宗知識庫的編輯原則、文本來源與版權聲明。',
    url: 'https://chanzong.space/zh-tw/about',
    locale: 'zh_TW',
  },
};

export default function TradAboutPage() {
  return <AboutClient />;
}
