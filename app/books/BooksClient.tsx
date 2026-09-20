'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import manifest from '@/manifest.json';
import { BookOpen, ChevronRight, Search, ChevronDown, Library, ArrowRight, Scroll, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useLang } from '@/context/LangContext';

export default function BooksClient() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [displayCount, setDisplayCount] = useState(12);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const { t, toSimp, toTrad, getHref } = useLang();

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(manifest.map((item) => item.category)))],
    []
  );

  const filtered = useMemo(() => {
    let result = activeCategory === '全部' ? manifest : manifest.filter((item) => item.category === activeCategory);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter(
        (item) => {
          const tLower = item.title.toLowerCase();
          const aLower = item.author.toLowerCase();
          const sLower = item.summary.toLowerCase();
          return kwList.some(k => tLower.includes(k) || aLower.includes(k) || sLower.includes(k));
        }
      );
    }
    return result;
  }, [activeCategory, keyword, toSimp, toTrad]);

  const visibleBooks = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [activeCategory, keyword]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: '禅宗典籍藏经阁' }]} />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center">
                <Library className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                  禅宗典籍藏经阁
                </h1>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  共 {manifest.length} 部经典 · 含原文、白话翻译与生僻字注音
                </p>
              </div>
            </div>
          </div>

          {/* 专题合集推荐横幅 */}
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Scroll className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-600/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    {t('专题合集')}
                  </span>
                  <h2 className="text-base font-bold font-serif-zen text-slate-900 dark:text-slate-100">
                    {t('少室六门 · 菩提达摩根本顿悟法门总汇')}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {t('收录心经颂、破相论、二种入、安心法门、悟性论、血脉论全六门，100% 完整收录并汇编法脉。')}
                </p>
              </div>
            </div>
            <Link
              href={getHref('/collections/shaoshiliumen')}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{t('浏览六门全景')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
            {/* Direct Book Picker */}
            <div className="relative" ref={bookRef}>
              <button
                onClick={() => { setBookDropdownOpen((o) => !o); setCatDropdownOpen(false); }}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-amber-700 text-white border border-amber-700 hover:bg-amber-800 transition-all shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  直达典籍
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${bookDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {bookDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-72 max-h-80 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {manifest.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(getHref(`/classics/${item.id}`))}
                      className="w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-amber-50 group/item"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700 group-hover/item:text-amber-800 truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          #{item.idx}
                        </span>
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                        {item.author} · {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索书名、作者或关键词…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/10 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => { setCatDropdownOpen((o) => !o); setBookDropdownOpen(false); }}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeCategory !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-600/60 hover:text-amber-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {activeCategory === '全部' ? '全部分类' : activeCategory}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {catDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-52 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-amber-50 text-amber-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Result count */}
          {(keyword.trim() || activeCategory !== '全部') && (
            <p className="text-[13px] text-slate-500 mb-4">
              {t('共找到')} {filtered.length} {t('部经典')}
            </p>
          )}

          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleBooks.map((item) => (
              <Link prefetch={false} key={item.id}
                href={getHref(`/classics/${item.id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                      {t(item.category)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">#{item.idx}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors mb-1">
                      {t(item.title)}
                    </h3>
                    {(item as any).translation_note && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300/60 whitespace-nowrap shrink-0">
                        {t('精选译')}
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-slate-500 mb-3">
                    {t('作者')}：{t(item.author)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                  <span>{t('研读全文')}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的经典')}</p>
              <button
                onClick={() => { setKeyword(''); setActiveCategory('全部'); }}
                className="mt-3 text-amber-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all"
                  style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }}
                />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-amber-700 text-white text-[14px] font-semibold hover:bg-amber-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('部经典')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
