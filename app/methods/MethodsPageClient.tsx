'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { Compass, ChevronRight, Search } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function MethodsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');
  const { t } = useLang();

  const filtered = useMemo(() => {
    if (!keyword.trim()) return ZEN_METHODS;
    const kw = keyword.trim().toLowerCase();
    return ZEN_METHODS.filter(
      (m) =>
        m.title.toLowerCase().includes(kw) ||
        m.summary.toLowerCase().includes(kw) ||
        m.steps.some((s) => s.toLowerCase().includes(kw))
    );
  }, [keyword]);

  const visibleMethods = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: '修行方法' }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('修行方法')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_METHODS.length} 种 · {t('参究公案、看话头、默照禅、二入四行等实修法门')}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setDisplayCount(12); }}
                placeholder="搜索法门名称、要领或描述…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/10 transition-all"
              />
            </div>
          </div>

          {keyword.trim() && (
            <p className="text-[13px] text-slate-500 mb-4">
              {t('共找到')} {filtered.length} {t('种法门')}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMethods.map((method) => (
              <Link
                key={method.id}
                href={`/methods/${method.id}`}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-sky-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-sky-800 transition-colors mb-2">
                    {t(method.title)}
                  </h2>
                  <p className="text-[15px] text-slate-600 font-serif-zen leading-relaxed mb-4">
                    {t(method.summary)}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">{t('关键要领')}：</div>
                    <div className="flex flex-wrap gap-2">
                      {method.steps.map((step, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                          {idx + 1}. {t(step)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span>{t('依凭典籍')}：<strong className="text-slate-800">{t(method.classicRef)}</strong></span>
                  <span className="text-[13px] font-semibold text-sky-800 flex items-center group-hover:translate-x-1 transition-transform">
                    {t('研读细节')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的法门')}</p>
              <button
                onClick={() => setKeyword('')}
                className="mt-3 text-sky-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除搜索')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-sky-700 text-white text-[14px] font-semibold hover:bg-sky-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('种法门')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
