'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_PERSONS } from '@/lib/taxonomy';
import { Users, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function PersonsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const { t } = useLang();

  const visiblePersons = ZEN_PERSONS.slice(0, displayCount);
  const hasMore = displayCount < ZEN_PERSONS.length;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-700 mb-2">
              <Users className="w-4 h-4" />
              <span>{t('历代宗师与海东巨擘')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('祖师人物')} ({ZEN_PERSONS.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('记载菩提达摩、六祖惠能、马祖道一、百丈怀海、黄檗希运、临济义玄与高丽国普照知呐禅师等传法履历。点击任意人物查看生平传记与关联著作。')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePersons.map((person) => (
              <Link
                key={person.id}
                href={`/persons/${person.id}`}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {t(person.title)}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{t(person.era)}</span>
                  </div>

                  <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-purple-800 transition-colors mb-2">
                    👤 {t(person.name)}
                  </h2>

                  <p className="text-[15px] text-slate-600 font-serif-zen leading-relaxed mb-4 line-clamp-3">
                    {t(person.teachings)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {person.classics.map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                        📖 {t(c)}
                      </span>
                    ))}
                  </div>
                  <span className="text-[13px] font-semibold text-purple-800 flex items-center group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                    {t('阅读生平传记')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / ZEN_PERSONS.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-purple-700 text-white text-[14px] font-semibold hover:bg-purple-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {ZEN_PERSONS.length})
              </button>
            </div>
          )}

          {!hasMore && ZEN_PERSONS.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-400">
              {t('已显示全部')} {ZEN_PERSONS.length} {t('位人物')}
            </p>
          )}
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
