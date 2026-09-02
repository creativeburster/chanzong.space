'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { Compass, ChevronRight, Search, ChevronDown, BookOpen } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function MethodsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [activeRef, setActiveRef] = useState('全部');
  const [refDropdownOpen, setRefDropdownOpen] = useState(false);
  const refRef = useRef<HTMLDivElement>(null);
  const { t, toSimp, toTrad } = useLang();

  const classicRefs = useMemo(
    () => ['全部', ...Array.from(new Set(ZEN_METHODS.map((m) => m.classicRef)))],
    []
  );

  const filtered = useMemo(() => {
    let result = activeRef === '全部' ? ZEN_METHODS : ZEN_METHODS.filter((m) => m.classicRef === activeRef);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter(
        (m) => {
          const tLower = m.title.toLowerCase();
          const sLower = m.summary.toLowerCase();
          return kwList.some(k => tLower.includes(k) || sLower.includes(k) || m.steps.some((s) => s.toLowerCase().includes(k)));
        }
      );
    }
    return result;
  }, [keyword, activeRef, toSimp, toTrad]);

  const visibleMethods = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (refRef.current && !refRef.current.contains(e.target as Node)) setRefDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [activeRef, keyword]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: '法门' }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('法门')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_METHODS.length} 种 · {t('参究公案、看话头、默照禅、二入四行等实修法门')}
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
                placeholder="搜索法门名称、要领或描述…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/10 transition-all"
              />
            </div>

            <div className="relative" ref={refRef}>
              <button
                onClick={() => setRefDropdownOpen((o) => !o)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeRef !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-600/60 hover:text-sky-800'
                }`}
              >
                <span className="flex items-center gap-2 truncate max-w-48">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {activeRef === '全部' ? '全部出处' : activeRef}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${refDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {refDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-64 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {classicRefs.map((ref) => (
                    <button
                      key={ref}
                      onClick={() => { setActiveRef(ref); setRefDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        activeRef === ref
                          ? 'bg-sky-50 text-sky-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {ref === '全部' ? '全部出处' : ref}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(keyword.trim() || activeRef !== '全部') && (
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
                onClick={() => { setKeyword(''); setActiveRef('全部'); }}
                className="mt-3 text-sky-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
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
