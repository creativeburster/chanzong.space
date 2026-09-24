'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CollectionItem } from '@/lib/collections';
import { ZEN_CONCEPTS } from '@/lib/taxonomy/concepts';
import { ZEN_PERSONS } from '@/lib/taxonomy/persons';
import { useLang } from '@/context/LangContext';
import manifest from '@/manifest.json';
import { BookOpen, Scroll, ArrowRight, Compass, Users, Tag, History, CheckCircle2 } from 'lucide-react';

interface CollectionDetailClientProps {
  collection: CollectionItem;
}

export function CollectionDetailClient({ collection }: CollectionDetailClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, getHref } = useLang();

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-10 space-y-8">
          <Breadcrumb
            items={[
              { label: t('书籍'), href: getHref('/books') },
              { label: t('典籍合集'), href: getHref('/collections') },
              { label: t(collection.title) }
            ]}
          />

          {/* 专题 Header 英雄区 */}
          <header className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-900/20 dark:via-slate-900 border border-amber-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-600/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Scroll className="w-3.5 h-3.5" />
                {t(collection.cbetaRef || '大藏经汇编')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {t(collection.period)} · {t(collection.author)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t(`共收录 ${collection.books.length} 部典籍`)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-amber-100 tracking-tight">
              {t(collection.title)}
            </h1>
            <p className="mt-2 text-base sm:text-lg text-amber-900/80 dark:text-amber-200/80 font-medium">
              {t(collection.subtitle)}
            </p>

            <p className="mt-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t(collection.summary)}
            </p>
          </header>

          {/* 考据要点 */}
          {collection.historicalNotes && collection.historicalNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  {t('考据与版本源流')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {collection.historicalNotes.map((note, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-amber-500/30 transition-colors">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t(note)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 六门法脉导览阵列 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  {t(`${collection.title} 典籍法脉`)}
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t(`共 ${collection.books.length} 篇修持典籍`)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {collection.books.map((b) => (
                <Link
                  key={b.gateNumber}
                  href={getHref(`/classics/${b.classicId}`)}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {t(b.gateName)}
                      </span>
                      <span className="text-xs text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1 font-medium transition-colors">
                        {t('研阅原文')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {t(b.title)}
                    </h3>

                    {b.quote && (
                      <blockquote className="my-3 pl-3 border-l-2 border-amber-500/40 text-xs sm:text-sm italic text-amber-900/80 dark:text-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 py-1.5 pr-2 rounded-r">
                        “{t(b.quote)}”
                      </blockquote>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {t(b.summary)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {t(collection.author)}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {t('进入精读 →')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 关联人物与概念 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {t('关联祖师法脉')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {collection.relatedPersons.map(pid => {
                  const person = ZEN_PERSONS.find(p => p.id === pid);
                  return (
                    <Link
                      key={pid}
                      href={getHref(`/persons/${pid}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-900 dark:text-amber-200 hover:border-amber-400 transition-colors"
                    >
                      {person ? t(person.name) : pid}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {t('核心宗门概念')}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {collection.relatedConcepts.map(cid => {
                  const concept = ZEN_CONCEPTS.find(c => c.id === cid);
                  return (
                    <Link
                      key={cid}
                      href={getHref(`/concepts/${cid}`)}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      {concept ? t(concept.title) : cid}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
