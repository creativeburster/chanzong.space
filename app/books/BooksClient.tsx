'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { BookOpen, ChevronRight } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function BooksClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [displayCount, setDisplayCount] = useState(12);

  const categories = ['全部', ...Array.from(new Set(manifest.map((item) => item.category)))];

  const filtered = activeCategory === '全部' ? manifest : manifest.filter((item) => item.category === activeCategory);
  const visibleBooks = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <Breadcrumb items={[{ label: '禅宗典籍藏经阁' }]} />
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-800 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>全量典籍藏经阁</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              禅宗典籍藏经阁 ({filtered.length})
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              汇聚从《七佛传法偈》、达摩祖师四论、《六祖坛经》，到高丽国普照知呐禅师《真心直说》《修心诀》全量经典。
            </p>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-600 hover:text-amber-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

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

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
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
