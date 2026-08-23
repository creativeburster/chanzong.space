'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { BookOpen, ChevronRight, Search, ChevronDown, Library } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function BooksClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [displayCount, setDisplayCount] = useState(12);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(manifest.map((item) => item.category)))],
    []
  );

  const filtered = useMemo(() => {
    let result = activeCategory === '全部' ? manifest : manifest.filter((item) => item.category === activeCategory);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.author.toLowerCase().includes(kw) ||
          item.summary.toLowerCase().includes(kw)
      );
    }
    return result;
  }, [activeCategory, keyword]);

  const visibleBooks = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
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

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <Breadcrumb items={[{ label: '禅宗典籍藏经阁' }]} />

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-[13px] font-semibold mb-5">
              <Library className="w-3.5 h-3.5" />
              <span>全量典籍 · 共 {manifest.length} 部</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 tracking-tight mb-3">
              禅宗典籍藏经阁
            </h1>
            <p className="text-base text-slate-600 font-serif-zen max-w-xl mx-auto leading-relaxed">
              自七佛传法偈、达摩四论、《六祖坛经》，至《碧岩录》《禅关策进》——历代祖师心要，尽藏于此
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="relative flex-1">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeCategory !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-600/60 hover:text-amber-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {activeCategory}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 sm:left-0 top-full mt-2 w-full sm:w-52 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setDropdownOpen(false);
                      }}
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
            <p className="text-center text-[13px] text-slate-500 mb-6">
              共找到 {filtered.length} 部经典
            </p>
          )}

          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleBooks.map((item) => (
              <Link
                key={item.id}
                href={`/classics/${item.id}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">#{item.idx}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors mb-1">
                      {item.title}
                    </h3>
                    {(item as any).translation_note && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300/60 whitespace-nowrap shrink-0">
                        精选译
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-slate-500 mb-3">
                    作者：{item.author}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                  <span>研读全文</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">未找到匹配的经典</p>
              <button
                onClick={() => {
                  setKeyword('');
                  setActiveCategory('全部');
                }}
                className="mt-3 text-amber-800 text-[13px] font-semibold hover:underline"
              >
                清除筛选条件
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
                加载更多 ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              已显示全部 {filtered.length} 部经典
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
