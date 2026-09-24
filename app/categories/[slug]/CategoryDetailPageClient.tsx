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
import { CategoryItem, getCategoriesByClassicId } from '@/lib/categories';
import { ZEN_CONCEPTS } from '@/lib/taxonomy/concepts';
import { ZEN_PERSONS } from '@/lib/taxonomy/persons';
import { useLang } from '@/context/LangContext';
import manifest from '@/manifest.json';
import {
  Layers,
  BookOpen,
  Scroll,
  ArrowRight,
  Compass,
  Users,
  Tag,
  CheckCircle2,
  Search,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

interface CategoryDetailPageClientProps {
  category: CategoryItem;
  allCategories: CategoryItem[];
}

export function CategoryDetailPageClient({
  category,
  allCategories,
}: CategoryDetailPageClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'words_desc' | 'words_asc'>('default');
  const { t, getHref } = useLang();

  // 典籍全量查找
  const manifestMap = useMemo(() => {
    const map = new Map<string, typeof manifest[0]>();
    manifest.forEach((m) => map.set(m.id, m));
    return map;
  }, []);

  // 当前分类的所有经典对象
  const rawBooks = useMemo(() => {
    return category.classicIds
      .map((cid) => manifestMap.get(cid))
      .filter((b): b is typeof manifest[0] => Boolean(b));
  }, [category.classicIds, manifestMap]);

  // 总字数统计
  const totalWords = useMemo(() => {
    return rawBooks.reduce((acc, b) => acc + (b.word_count || 0), 0);
  }, [rawBooks]);

  const wordCountStr =
    totalWords >= 10000
      ? `${(totalWords / 10000).toFixed(1)} 万字`
      : `${totalWords} 字`;

  // 搜索与排序
  const books = useMemo(() => {
    let list = rawBooks;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.summary && b.summary.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'words_desc') {
      return [...list].sort((a, b) => (b.word_count || 0) - (a.word_count || 0));
    }
    if (sortBy === 'words_asc') {
      return [...list].sort((a, b) => (a.word_count || 0) - (b.word_count || 0));
    }
    return list;
  }, [rawBooks, query, sortBy]);

  // 其他门类推荐（排除当前分类）
  const otherCategories = useMemo(() => {
    return allCategories.filter((c) => c.id !== category.id);
  }, [allCategories, category.id]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 md:py-10 space-y-8">
          <Breadcrumb
            items={[
              { label: t('首页'), href: getHref('/') },
              { label: t('书籍'), href: getHref('/books') },
              { label: t('经藏分类'), href: getHref('/categories') },
              { label: t(category.name) },
            ]}
          />

          {/* 专题 Header 英雄区 */}
          <header className="bg-gradient-to-br from-emerald-500/10 via-amber-500/5 to-transparent dark:from-emerald-950/20 dark:via-slate-900 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 md:p-10 backdrop-blur-sm relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                <Layers className="w-3.5 h-3.5" />
                {t('大藏经正统经藏门类')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t(`收录 ${rawBooks.length} 部典籍 · 约 ${wordCountStr}`)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl select-none" role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-emerald-100 tracking-tight">
                {t(category.name)}
              </h1>
            </div>

            <p className="mt-2 text-base sm:text-lg md:text-xl text-emerald-900/80 dark:text-emerald-200/80 font-medium">
              {t(category.subtitle)}
            </p>

            {/* 核心定位亮点 */}
            <div className="mt-4 p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">
                【{t('宗门修证定位')}】
              </span>
              {t(category.significance)}
            </div>

            {/* 深度现代白话导读 */}
            <div className="mt-4 pt-4 border-t border-emerald-500/15">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-400/80 mb-2">
                {t('💡 门类源流与参修旨趣')}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-5xl">
                {t(category.description)}
              </p>
            </div>
          </header>

          {/* 筛选与排序工具栏 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(`在 ${category.name} 中搜索经典名称、作者或摘要...`)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
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

            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-slate-400">{t('排序')}：</span>
              <button
                onClick={() => setSortBy('default')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'default'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                {t('经藏序')}
              </button>
              <button
                onClick={() => setSortBy('words_desc')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'words_desc'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                {t('字数多到少')}
              </button>
            </div>
          </div>

          {/* 典籍卡片多列自适应网格 */}
          {books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {books.map((b) => {
                // 计算该经典隶属的所有分类（展现多对多交叉关系）
                const classicCats = getCategoriesByClassicId(b.id);
                const otherCats = classicCats.filter((c) => c.id !== category.id);

                return (
                  <div
                    key={b.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* 卡片顶部：朝代作者 + 字数徽章 */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]">
                          {t(b.author)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {b.word_count ? `${Math.round(b.word_count / 1000 * 10) / 10}k 字` : ''}
                        </span>
                      </div>

                      {/* 标题 */}
                      <Link href={getHref(`/classics/${b.id}`)} className="block group/title">
                        <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors leading-snug">
                          {t(b.title)}
                        </h3>
                      </Link>

                      {/* 交叉次分类徽章（多对多互联） */}
                      {otherCats.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-slate-400">{t('兼属')}：</span>
                          {otherCats.map((oc) => (
                            <Link
                              key={oc.id}
                              href={getHref(`/categories/${oc.id}`)}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                            >
                              <span>{oc.icon}</span>
                              <span>{t(oc.name)}</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* 白话摘要 */}
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {t(b.summary || `${b.title}，${b.author}著，收录于禅宗知识库。`)}
                      </p>
                    </div>

                    {/* 底部操作栏 */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        idx: #{b.idx}
                      </span>
                      <Link
                        href={getHref(`/classics/${b.id}`)}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>{t('研读经典')}</span>
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
                {t('未找到匹配的典籍')}
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
              >
                {t('清空搜索关键词')}
              </button>
            </div>
          )}

          {/* 关联人物与概念交叉网络 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {t('本门代表祖师法脉')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.relatedPersons.map((pid) => {
                  const person = ZEN_PERSONS.find((p) => p.id === pid);
                  return (
                    <Link
                      key={pid}
                      href={getHref(`/persons/${pid}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-900 dark:text-emerald-200 hover:border-emerald-400 transition-colors"
                    >
                      {person ? t(person.name) : pid}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {t('本门核心宗义概念')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.relatedConcepts.map((cid) => {
                  const concept = ZEN_CONCEPTS.find((c) => c.id === cid);
                  return (
                    <Link
                      key={cid}
                      href={getHref(`/concepts/${cid}`)}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      {concept ? t(concept.title) : cid}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 探索其他经藏门类 */}
          <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                  {t('探索其他经藏分类')}
                </h3>
              </div>
              <Link
                href={getHref('/categories')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('查看全部 11 大分类 →')}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {otherCategories.slice(0, 5).map((oc) => (
                <Link
                  key={oc.id}
                  href={getHref(`/categories/${oc.id}`)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all hover:-translate-y-0.5 group"
                >
                  <div className="text-xl mb-1">{oc.icon}</div>
                  <div className="font-serif font-bold text-sm text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {t(oc.name)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t(`${oc.classicIds.length} 部典籍`)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
