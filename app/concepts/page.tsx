'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';
import { Gem, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function ConceptsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const { t } = useLang();

  const visibleConcepts = ZEN_CONCEPTS.slice(0, displayCount);
  const hasMore = displayCount < ZEN_CONCEPTS.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-700 mb-2">
              <Gem className="w-4 h-4" />
              <span>{t('禅门心法与旨趣概念')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('核心概念')} ({ZEN_CONCEPTS.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('涵盖自性、顿悟、平常心是道、无心无念、公案机锋等核心实相宗旨。点击任意概念进入专属详情页与参修指南。')}
            </p>
          </div>

          <div className="space-y-4">
            {visibleConcepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-emerald-800 transition-colors">
                      💎 {t(concept.title)}
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

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / ZEN_CONCEPTS.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-emerald-700 text-white text-[14px] font-semibold hover:bg-emerald-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {ZEN_CONCEPTS.length})
              </button>
            </div>
          )}

          {!hasMore && ZEN_CONCEPTS.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-400">
              {t('已显示全部')} {ZEN_CONCEPTS.length} {t('条概念')}
            </p>
          )}
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
