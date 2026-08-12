'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_KOANS } from '@/lib/taxonomy';
import { MessageCircle } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';

export default function KoansPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const { t } = useLang();

  const visibleKoans = ZEN_KOANS.slice(0, displayCount);
  const hasMore = displayCount < ZEN_KOANS.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-700 mb-2">
              <MessageCircle className="w-4 h-4" />
              <span>{t('古德机锋对决与祖师开悟因缘')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('禅宗公案')} ({ZEN_KOANS.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('收录达摩、六祖、马祖、赵州、德山、临济等历代禅师经典公案与机锋因缘。')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 items-start">
            <section>
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-700 mb-4 px-1">
                <MessageCircle className="w-4 h-4" />
                <span>{t('公案原案')} ({ZEN_KOANS.length})</span>
              </div>

              <div className="space-y-6">
                {visibleKoans.map((qa) => (
                  <Link href={`/koan/${qa.id}`} key={qa.id} className="block group">
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

                      <div className="text-xs text-slate-400 font-medium pt-2 flex items-center justify-between">
                        <span>{t('回答禅师：')}<strong className="text-slate-800">{t(qa.master)}</strong></span>
                        <span>{t('出处：')}{t(qa.source)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / ZEN_KOANS.length) * 100)}%` }} />
                  </div>
                  <button
                    onClick={() => setDisplayCount((c) => c + 12)}
                    className="px-6 py-3 rounded-xl bg-rose-700 text-white text-[14px] font-semibold hover:bg-rose-800 transition-all shadow-md"
                  >
                    {t('加载更多')} ({displayCount} / {ZEN_KOANS.length})
                  </button>
                </div>
              )}

              {!hasMore && ZEN_KOANS.length > 12 && (
                <p className="mt-6 text-center text-xs text-slate-400">
                  {t('已显示全部')} {ZEN_KOANS.length} {t('条公案')}
                </p>
              )}
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
