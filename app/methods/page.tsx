'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { Compass, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function MethodsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const { t } = useLang();

  const visibleMethods = ZEN_METHODS.slice(0, displayCount);
  const hasMore = displayCount < ZEN_METHODS.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <Breadcrumb items={[{ label: '修行方法' }]} />
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-700 mb-2">
              <Compass className="w-4 h-4" />
              <span>{t('禅门实修与方便法门')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('修行方法')} ({ZEN_METHODS.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('包含参究公案、看话头、默照禅、达摩二入四行观及无染觉性直观解脱。点击任意方法查看修修要领与步骤。')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMethods.map((method) => (
              <Link
                key={method.id}
                href={`/methods/${method.id}`}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-sky-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-sky-800 transition-colors mb-2">
                    🛣️ {t(method.title)}
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

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / ZEN_METHODS.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-sky-700 text-white text-[14px] font-semibold hover:bg-sky-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {ZEN_METHODS.length})
              </button>
            </div>
          )}

          {!hasMore && ZEN_METHODS.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {ZEN_METHODS.length} {t('种法门')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
