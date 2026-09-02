'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';
import { Gem, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ConceptsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const { t, toSimp, toTrad, getHref } = useLang();

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(ZEN_CONCEPTS.map((c) => c.category)))],
    []
  );

  const filtered = useMemo(() => {
    let result = activeCategory === '全部' ? ZEN_CONCEPTS : ZEN_CONCEPTS.filter((c) => c.category === activeCategory);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter(
        (c) => {
          const tLower = c.title.toLowerCase();
          const sLower = c.summary.toLowerCase();
          return kwList.some(k => tLower.includes(k) || sLower.includes(k));
        }
      );
    }
    return result;
  }, [activeCategory, keyword, toSimp, toTrad]);

  const visibleConcepts = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
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
          <Breadcrumb items={[{ label: '核心概念' }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center">
              <Gem className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('核心概念')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_CONCEPTS.length} 条 · {t('涵盖自性、顿悟、平常心是道等核心宗旨')}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索概念名称或描述…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/10 transition-all"
              />
            </div>

            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatDropdownOpen((o) => !o)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeCategory !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600/60 hover:text-emerald-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Gem className="w-4 h-4 shrink-0" />
                  {activeCategory === '全部' ? '全部类别' : activeCategory}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {catDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-48 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {cat === '全部' ? '全部类别' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(keyword.trim() || activeCategory !== '全部') && (
            <p className="text-[13px] text-slate-500 mb-4">
              {t('共找到')} {filtered.length} {t('条概念')}
            </p>
          )}

          {/* Concept List */}
          <div className="space-y-4">
            {visibleConcepts.map((concept) => (
              <Link prefetch={false} key={concept.id}
                href={getHref(`/concepts/${concept.id}`)}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {t(concept.title)}
                    </h2>
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t(concept.category)}
                    </span>
                  </div>

                  <p className="text-[15px] text-slate-700 font-serif-zen leading-relaxed mb-3">
                    {t(concept.summary)}
                  </p>
                </div>

                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span>{t('典籍出处')}：<strong className="text-slate-800">{t(concept.classicRef)}</strong></span>
                  <span className="text-[13px] font-semibold text-emerald-800 flex items-center group-hover:translate-x-1 transition-transform">
                    {t('深入探讨')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Gem className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的概念')}</p>
              <button
                onClick={() => { setKeyword(''); setActiveCategory('全部'); }}
                className="mt-3 text-emerald-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-emerald-700 text-white text-[14px] font-semibold hover:bg-emerald-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('条概念')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
