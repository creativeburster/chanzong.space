'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { StatsOverview } from '@/components/StatsOverview';
import { QuickEntryGrid } from '@/components/QuickEntryGrid';
import { DailyKoanCard } from '@/components/practice/DailyKoanCard';
import { Sparkles, HeartHandshake, Moon, ArrowRight } from 'lucide-react';
import manifest from '@/manifest.json';
import { STATS } from '@/lib/stats';
import {
  FEATURED_CONCEPTS,
  FEATURED_METHODS,
  FEATURED_KOANS,
  FEATURED_PERSONS,
  FEATURED_FAQS,
} from '@/lib/featured';
import { ChevronRight, Gem, BookOpen, Compass, MessageSquare, Users, Lightbulb } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { useLang } from '@/context/LangContext';

const LineageGraph = dynamic(
  () => import('@/components/LineageGraph').then((m) => m.LineageGraph),
  {
    ssr: false,
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500 font-serif-zen">加载传法世系图…</div>,
  }
);

const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);

const formatCount = (n: number) => {
  if (n >= 1000) {
    const v = (n / 1000).toFixed(1).replace(/\.0$/, '');
    return v + 'k';
  }
  return String(n);
};

export default function HomeClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, getHref } = useLang();

  const featuredClassics = ['tanjing', 'huangbo', 'wumenguan', 'linji', 'xinxinming', 'changuancejin']
    .map(id => manifest.find(m => m.id === id))
    .filter(Boolean) as typeof manifest;

  const featuredMethods = FEATURED_METHODS;
  const featuredKoans = FEATURED_KOANS;
  const featuredPersons = FEATURED_PERSONS;
  const featuredFaqs = FEATURED_FAQS;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      <Sidebar
        onOpenSearch={() => setSearchOpen(true)}
        classicsCount={manifest.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          {/* Header Tagline & Hero */}
          <div className="text-center mb-10">
            <p className="text-base text-slate-800 font-serif-zen tracking-wide mb-4 leading-relaxed">
              {t('千载祖师心印 · 顿悟见性之道')}
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 tracking-tight flex items-center justify-center space-x-3 mb-3">
              <Image src="/favicon.png" alt="拈花微笑" width={48} height={48} className="w-12 h-12 object-contain" priority />
              <span>{t('禅宗知识库')}</span>
            </h1>

            <p className="text-base text-slate-800 font-serif-zen max-w-2xl mx-auto leading-relaxed">
              {t('传承自西天二十八祖与东土达摩、六祖、马祖、黄檗、永嘉诸祖 · 自我了悟见性之道')}
            </p>
          </div>

          {/* 6 Stat Counters */}
          <StatsOverview />

          {/* Quick Entry Cards */}
          <QuickEntryGrid />

          {/* Daily Koan & Zen Practice Entrance */}
          <div className="my-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            <div className="lg:col-span-2">
              <DailyKoanCard compact={true} />
            </div>

            <Link
              prefetch={false}
              href={getHref('/practice')}
              className="bg-gradient-to-br from-amber-900 via-[#1E293B] to-slate-950 text-white rounded-2xl p-5 border border-amber-800/30 shadow-sm hover:shadow-md hover:border-amber-500/60 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('禅修静心工坊')}</span>
                </div>
                <h3 className="text-lg font-bold font-serif-zen text-amber-100 group-hover:text-amber-300 transition-colors">
                  {t('电子木鱼 · 坐禅计时')}
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {t('纯原生空灵木鱼敲击音效、调身调息坐禅倒计时，于日常尘劳中歇下狂心。')}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>{t('进入禅房静心')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>


          {/* 1. 经典著作精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>{t('经典著作精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/books')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {STATS.classics} {t('部')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredClassics.map((item) => (
                <Link
                  key={item.id}
                  prefetch={false}
                  href={getHref(`/classics/${item.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                        {t(item.category)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">#{item.idx}</span>
                    </div>
                    <h3 className="text-lg font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors mb-1">
                      {t(item.title)}
                    </h3>
                    <p className="text-base text-slate-600 mb-3">{t(item.author)}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                    <span>{t('研读原文')}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 2. 核心概念精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <Gem className="w-4 h-4 text-emerald-600" />
                <span>{t('核心概念精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/concepts')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {STATS.concepts} {t('概念')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURED_CONCEPTS.map((concept) => (
                <Link
                  key={concept.id}
                  prefetch={false}
                  href={getHref(`/concepts/${concept.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-600/50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-lg font-bold font-serif-zen text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {t(concept.title)}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {t(concept.category)}
                    </span>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed font-normal mb-3 line-clamp-3">
                    {t(concept.summary)}
                  </p>
                  <div className="text-xs text-slate-500 font-medium border-t border-slate-100 pt-2">
                    {t('出处')}：{t(concept.classicRef)}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 3. 修持法门精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>{t('修行法门精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/methods')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {STATS.methods} {t('种法门')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredMethods.map((m) => (
                <Link
                  key={m.id}
                  prefetch={false}
                  href={getHref(`/methods/${m.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-600/50 hover:shadow-sm transition-all group"
                >
                  <h3 className="text-lg font-bold font-serif-zen text-slate-900 group-hover:text-sky-800 transition-colors mb-2">
                    {t(m.title)}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed line-clamp-3">
                    {t(m.summary)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* 4. 公案精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <MessageSquare className="w-4 h-4 text-rose-600" />
                <span>{t('公案机锋精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/koan')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {STATS.koans} {t('则公案机锋')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredKoans.map((k) => (
                <Link
                  key={k.id}
                  prefetch={false}
                  href={getHref(`/koan/${k.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-600/50 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold font-serif-zen text-slate-900 group-hover:text-rose-800 transition-colors">
                      {t(k.question)}
                    </h3>
                  </div>
                  <p className="text-base text-slate-500">
                    {t(k.master)} · {t(k.source)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* 5. 禅门人物精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{t('禅门人物精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/persons')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {STATS.persons} {t('位人物')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredPersons.map((p) => (
                <Link
                  key={p.id}
                  prefetch={false}
                  href={getHref(`/persons/${p.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-600/50 hover:shadow-sm transition-all group text-center"
                >
                  <h3 className="text-lg font-bold font-serif-zen text-slate-900 group-hover:text-purple-800 transition-colors mb-1">
                    {t(p.name)}
                  </h3>
                  <p className="text-xs text-slate-500">{t(p.title)}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* 6. 问答精选 */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>{t('问答精选')}</span>
              </h2>
              <Link prefetch={false} href={getHref('/faq')} className="text-xs text-amber-800 font-bold hover:underline">
                {t('查看全部')} {formatCount(STATS.faqs)} {t('条')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredFaqs.map((f) => (
                <Link
                  key={f.id}
                  prefetch={false}
                  href={getHref(`/faq#${f.id}`)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/50 hover:shadow-sm transition-all group"
                >
                  <h3 className="text-base font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors mb-2 leading-relaxed">
                    {t(f.question)}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed line-clamp-2">
                    {t(f.answer)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* 禅宗传法世系图表 */}
          <div className="my-16">
            <LineageGraph />
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={manifest}
      />
    </div>
  );
}
