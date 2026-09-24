'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CategoryItem } from '@/lib/categories';
import { useLang } from '@/context/LangContext';
import manifest from '@/manifest.json';
import {
  Layers,
  BookOpen,
  Scroll,
  ArrowRight,
  Search,
  CheckCircle2,
  BookmarkCheck,
  Compass,
  FileText
} from 'lucide-react';

interface CategoriesPageClientProps {
  categories: CategoryItem[];
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { t, getHref } = useLang();

  // 构建典籍查找 Map，方便快速获取典籍标题与字数
  const manifestMap = useMemo(() => {
    const map = new Map<string, typeof manifest[0]>();
    manifest.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // 统计各分类的总字数
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { totalWords: number; books: typeof manifest }>();
    categories.forEach((cat) => {
      const books = cat.classicIds
        .map((cid) => manifestMap.get(cid))
        .filter((b): b is typeof manifest[0] => Boolean(b));
      const totalWords = books.reduce((acc, b) => acc + (b.word_count || 0), 0);
      stats.set(cat.id, { totalWords, books });
    });
    return stats;
  }, [categories, manifestMap]);

  // 搜索过滤
  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchName = cat.name.toLowerCase().includes(q);
      const matchSub = cat.subtitle.toLowerCase().includes(q);
      const matchDesc = cat.description.toLowerCase().includes(q);
      const matchSig = cat.significance.toLowerCase().includes(q);
      const st = categoryStats.get(cat.id);
      const matchBook = st?.books.some(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
      return matchName || matchSub || matchDesc || matchSig || matchBook;
    });
  }, [categories, query, categoryStats]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 md:py-10 space-y-8">
          <Breadcrumb
            items={[
              { label: t('首页'), href: getHref('/') },
              { label: t('经藏分类') }
            ]}
          />

          {/* Header 英雄区 */}
          <header className="bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-transparent dark:from-emerald-950/20 dark:via-slate-900 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-sm relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                <Layers className="w-3.5 h-3.5" />
                {t('大藏经宗门文献统系')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t(`十一大正统经藏门类 · 100% 覆盖全站 167 部典籍`)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-emerald-100 tracking-tight">
              {t('经藏分类大厅')}
            </h1>
            <p className="mt-2 text-base sm:text-lg md:text-xl text-emerald-900/80 dark:text-emerald-200/80 font-medium">
              {t('宗门语录 · 印心经藏 · 达摩根本 · 丛林清规 · 公案评唱 · 传灯史传 · 祖师铭颂 · 禅修心要 · 宗义经论 · 护法论辩 · 密乘直指')}
            </p>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-4xl">
              {t('严格遵照《大正新脩大藏经》诸宗部与历代宗门文献编纂传统，打破单一机械分类局限，建立多维多对多互联的十一大正统分类体系。无论探寻机锋语录、印心印契、制度清规还是唯识中观心性论典，皆可循门深入、总揽法海。')}
            </p>
          </header>

          {/* 即时搜索工具栏 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('搜索分类名称、副标题、所含经典名、作者或核心概念...')}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {t('清空')}
              </button>
            )}
          </div>

          {/* 11 大分类卡片网格 */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => {
                const stat = categoryStats.get(cat.id);
                const bookCount = cat.classicIds.length;
                const totalWords = stat ? stat.totalWords : 0;
                const wordCountStr =
                  totalWords >= 10000
                    ? `${(totalWords / 10000).toFixed(1)} 万字`
                    : `${totalWords} 字`;
                const previewBooks = (stat ? stat.books : []).slice(0, 5);

                return (
                  <div
                    key={cat.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* 卡片头部：图标 + 标题 + 统计徽章 */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl select-none" role="img" aria-label={cat.name}>
                            {cat.icon}
                          </span>
                          <div>
                            <Link href={getHref(`/categories/${cat.id}`)} className="group/name">
                              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 group-hover/name:text-emerald-600 dark:group-hover/name:text-emerald-400 transition-colors">
                                {t(cat.name)}
                              </h2>
                            </Link>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              /categories/{cat.id}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {t(`${bookCount} 部典籍`)}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {t(`约 ${wordCountStr}`)}
                          </div>
                        </div>
                      </div>

                      {/* 副标题 */}
                      <p className="text-xs sm:text-sm font-medium text-emerald-900/80 dark:text-emerald-200/80 line-clamp-1 mb-3">
                        {t(cat.subtitle)}
                      </p>

                      {/* 核心定位亮点 */}
                      <div className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-1">
                          【{t('宗门旨要')}】
                        </span>
                        {t(cat.significance)}
                      </div>

                      {/* 简介摘要 */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {t(cat.description)}
                      </p>

                      {/* 代表经典胶囊展示 */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-emerald-500" />
                            {t('收录核心典籍')}
                          </span>
                          <span className="text-[10px] font-mono">
                            {t(`共 ${bookCount} 部`)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {previewBooks.map((b) => (
                            <Link
                              key={b.id}
                              href={getHref(`/classics/${b.id}`)}
                              title={b.title}
                              className="inline-flex items-center px-2 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700/50"
                            >
                              <BookmarkCheck className="w-3 h-3 mr-1 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" />
                              <span className="truncate max-w-[120px]">{t(b.title)}</span>
                            </Link>
                          ))}
                          {bookCount > previewBooks.length && (
                            <Link
                              href={getHref(`/categories/${cat.id}`)}
                              className="inline-flex items-center px-2 py-1 rounded-md text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-500/20 transition-colors"
                            >
                              +{bookCount - previewBooks.length}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 卡片底部操作栏 */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {t('大正藏 / 续藏经')}
                      </span>
                      <Link
                        href={getHref(`/categories/${cat.id}`)}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{t('浏览全部经典')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Scroll className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                {t('未找到匹配的经藏分类')}
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
              >
                {t('清空搜索条件')}
              </button>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
