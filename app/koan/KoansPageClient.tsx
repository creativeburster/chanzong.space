'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_KOANS } from '@/lib/taxonomy';
import { MessageCircle, Search, ChevronDown, User } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function KoansPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [activeMaster, setActiveMaster] = useState('全部');
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(false);
  const masterRef = useRef<HTMLDivElement>(null);
  const { t, toSimp, toTrad, getHref } = useLang();

  const masters = useMemo(
    () => ['全部', ...Array.from(new Set(ZEN_KOANS.map((k) => k.master)))],
    []
  );

  const filtered = useMemo(() => {
    let result = activeMaster === '全部' ? ZEN_KOANS : ZEN_KOANS.filter((k) => k.master === activeMaster);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter(
        (k) => {
          const qLower = k.question.toLowerCase();
          const aLower = k.answer.toLowerCase();
          const mLower = k.master.toLowerCase();
          const sLower = k.source.toLowerCase();
          return kwList.some(key => qLower.includes(key) || aLower.includes(key) || mLower.includes(key) || sLower.includes(key));
        }
      );
    }
    return result;
  }, [activeMaster, keyword, toSimp, toTrad]);

  const visibleKoans = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (masterRef.current && !masterRef.current.contains(e.target as Node)) setMasterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [activeMaster, keyword]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: '禅宗公案' }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('禅宗公案')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_KOANS.length} 则 · {t('达摩、六祖、马祖、赵州等历代禅师机锋因缘')}
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
                placeholder="搜索公案内容、禅师或出处…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600/60 focus:ring-2 focus:ring-rose-600/10 transition-all"
              />
            </div>

            <div className="relative" ref={masterRef}>
              <button
                onClick={() => setMasterDropdownOpen((o) => !o)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeMaster !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-rose-600/60 hover:text-rose-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  {activeMaster === '全部' ? '全部禅师' : activeMaster}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${masterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {masterDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-56 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {masters.map((m) => (
                    <button
                      key={m}
                      onClick={() => { setActiveMaster(m); setMasterDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        activeMaster === m
                          ? 'bg-rose-50 text-rose-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {m === '全部' ? '全部禅师' : m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(keyword.trim() || activeMaster !== '全部') && (
            <p className="text-[13px] text-slate-500 mb-4">
              {t('共找到')} {filtered.length} {t('条公案')}
            </p>
          )}

          {/* Koan List */}
          <div className="space-y-6">
            {visibleKoans.map((qa) => (
              <Link href={getHref(`/koan/${qa.id}`)} key={qa.id} className="block group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm group-hover:border-rose-600/50 group-hover:shadow-md transition-all space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs shrink-0">
                      {t('问')}
                    </span>
                    <h2 className="text-xl font-bold font-serif-zen text-slate-900 leading-snug group-hover:text-rose-700 transition-colors">
                      {t(qa.question)}
                    </h2>
                  </div>

                  <div className="flex items-start space-x-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-900 text-white font-bold text-xs shrink-0">
                      {t('答')}
                    </span>
                    <p className="text-[15px] font-serif-zen text-slate-800 leading-relaxed">
                      {t(qa.answer)}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 font-medium pt-2 flex items-center justify-between">
                    <span>{t('回答禅师：')}<strong className="text-slate-800">{t(qa.master)}</strong></span>
                    <span>{t('出处：')}{t(qa.source)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的公案')}</p>
              <button
                onClick={() => { setKeyword(''); setActiveMaster('全部'); }}
                className="mt-3 text-rose-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-rose-700 text-white text-[14px] font-semibold hover:bg-rose-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('条公案')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
