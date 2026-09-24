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
import { CollectionItem, CollectionTier } from '@/lib/collections';
import { useLang } from '@/context/LangContext';
import manifest from '@/manifest.json';
import {
  Library,
  BookOpen,
  Scroll,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';

interface CollectionsPageClientProps {
  collections: CollectionItem[];
}

export function CollectionsPageClient({ collections }: CollectionsPageClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const { t, getHref } = useLang();

  const tiers: { id: string; label: string; count: number }[] = useMemo(() => {
    const canonicalCount = collections.filter(c => c.tier === 'canonical').length;
    const mastersCount = collections.filter(c => c.tier === 'masters').length;
    const treatisesCount = collections.filter(c => c.tier === 'treatises').length;

    return [
      { id: 'all', label: t('全部合集'), count: collections.length },
      { id: 'canonical', label: t('顶级典范 · 宗门法统'), count: canonicalCount },
      { id: 'masters', label: t('名家宗师 · 传世全录'), count: mastersCount },
      { id: 'treatises', label: t('大乘经论 · 根本论丛'), count: treatisesCount },
    ];
  }, [collections, t]);

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      // 梯队过滤
      if (selectedTier !== 'all' && c.tier !== selectedTier) {
        return false;
      }
      // 关键词过滤
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSub = c.subtitle.toLowerCase().includes(q);
        const matchAuthor = c.author.toLowerCase().includes(q);
        const matchSummary = c.summary.toLowerCase().includes(q);
        const matchBook = c.books.some(b => b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q));
        return matchTitle || matchSub || matchAuthor || matchSummary || matchBook;
      }
      return true;
    });
  }, [collections, selectedTier, query]);

  const totalBooksCount = useMemo(() => {
    return collections.reduce((acc, c) => acc + c.books.length, 0);
  }, [collections]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 md:py-10 space-y-8">
          <Breadcrumb
            items={[
              { label: t('首页'), href: getHref('/') },
              { label: t('典籍合集') }
            ]}
          />

          {/* Header 英雄区 */}
          <header className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-900/20 dark:via-slate-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-sm relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-600/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Library className="w-3.5 h-3.5" />
                {t('历代宗门著作宝库')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t(`共收录 ${collections.length} 部合集 · 涵盖 ${totalBooksCount} 部经典`)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-amber-100 tracking-tight">
              {t('典籍合集大厅')}
            </h1>
            <p className="mt-2 text-base sm:text-lg md:text-xl text-amber-900/80 dark:text-amber-200/80 font-medium">
              {t('宗门三部曲 · 历代名家全书 · 根本论丛专题汇编')}
            </p>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-4xl">
              {t('将同一祖师、法脉传绪或具有明确历史合刊源流的多部经典聚合为专题丛书，重现《少室六门》《传法正宗三书》《宗镜百卷大厦》等法脉体系，助行者系统通达宗门博大精深之理境与工夫。')}
            </p>
          </header>

          {/* 筛选与搜索工具栏 */}
          <div className="space-y-4">
            {/* 分类胶囊 */}
            <div className="flex flex-wrap items-center gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    selectedTier === tier.id
                      ? 'bg-amber-600 text-white shadow-sm font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  {tier.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                      selectedTier === tier.id
                        ? 'bg-amber-700/50 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tier.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 即时搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('搜索合集名称、作者、子经典、宗义关键词...')}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
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
          </div>

          {/* 合集卡片网格 */}
          {filteredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredCollections.map((col) => (
                <div
                  key={col.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* 卡片顶部元数据 */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {t(col.tierName)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {t(col.period)} · {t(col.author)}
                      </span>
                    </div>

                    {/* 标题与副标题 */}
                    <Link href={getHref(`/collections/${col.id}`)} className="block group/title">
                      <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 transition-colors">
                        {t(col.title)}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-amber-900/80 dark:text-amber-200/80 line-clamp-1">
                        {t(col.subtitle)}
                      </p>
                    </Link>

                    {/* 简介摘要 */}
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {t(col.summary)}
                    </p>

                    {/* 收录子经典胶囊横排 */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-500" />
                        {t(`收录经典 (${col.books.length} 部)`)}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {col.books.map((b) => (
                          <Link
                            key={b.classicId}
                            href={getHref(`/classics/${b.classicId}`)}
                            title={b.title}
                            className="inline-flex items-center px-2 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 transition-colors border border-transparent hover:border-amber-300 dark:hover:border-amber-700/50"
                          >
                            <BookmarkCheck className="w-3 h-3 mr-1 text-amber-600/70 dark:text-amber-400/70 shrink-0" />
                            <span className="truncate max-w-[130px]">{t(b.title)}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 卡片底部操作栏 */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-serif">
                      {t(col.cbetaRef || '大正藏汇编')}
                    </span>
                    <Link
                      href={getHref(`/collections/${col.id}`)}
                      className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>{t('研读合集')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Scroll className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                {t('未找到匹配的合集')}
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedTier('all');
                }}
                className="mt-3 text-xs text-amber-600 dark:text-amber-400 underline hover:text-amber-700"
              >
                {t('重置所有筛选条件')}
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
