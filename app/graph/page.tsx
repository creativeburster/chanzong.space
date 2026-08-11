'use client';

import React, { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { STATS } from '@/lib/stats';
import { GitFork, Quote, Gem, BookOpen } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const GraphCanvas = lazy(() => import('@/components/GraphCanvas').then(m => ({ default: m.GraphCanvas })));
const LineageGraph = lazy(() => import('@/components/LineageGraph').then(m => ({ default: m.LineageGraph })));

export default function GraphPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

  // 精选祖师金句
  const featuredQuotes: { master: string; masterId: string; quote: string }[] = [];

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-12">
          <div>
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-800 mb-2">
              <GitFork className="w-4 h-4 text-amber-600" />
              <span>{t('全景传法印心与概念图谱')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('知识图谱')} ({STATS.concepts} {t('概念')} · {STATS.classics} {t('著作')} · {STATS.persons} {t('祖师')} · {STATS.koans} {t('公案')})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('鼠标悬停节点查看关联线与关系语义，单击直达详情研读页。右上角可按类型筛选节点，左上角支持缩放与重置。')}
            </p>
          </div>

          {/* 禅宗传法世系图表 */}
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">加载中…</div>}>
            <LineageGraph />
          </Suspense>

          {/* Interactive Force Graph */}
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">加载中…</div>}>
            <GraphCanvas />
          </Suspense>

          {/* 核心语录 */}
          <div>
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-800 mb-4">
              <Quote className="w-4 h-4 text-rose-600" />
              <span>{t('核心语录')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredQuotes.length > 0 ? featuredQuotes.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <p className="text-sm font-serif-zen italic text-zinc-800 leading-relaxed mb-3">
                    “{t(item.quote)}”
                  </p>
                  <Link href={`/persons/${item.masterId}`} className="text-[13px] font-semibold text-amber-800 hover:underline">
                    — {t(item.master)}
                  </Link>
                </div>
              )) : (
                <p className="text-sm text-slate-400 col-span-2 text-center py-8">祖师语录加载中…</p>
              )}
            </div>
          </div>

          {/* 概念分类速查 */}
          <div>
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-700 mb-1">
              <Gem className="w-4 h-4 text-emerald-600" />
              <span>{t('概念分类速查')}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('点击任意概念跳转到详情页面')}</p>
            <p className="text-sm text-slate-400">{t('请在概念页面查看全部分类')}</p>
          </div>

          {/* 修持法门速查 */}
          <div>
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-700 mb-4">
              <GitFork className="w-4 h-4 text-sky-600" />
              <span>{t('修持法门速查')}</span>
            </div>
            <Link href="/methods" className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
              {t('查看全部')} {STATS.methods} {t('个法门')} →
            </Link>
          </div>

          {/* 核心著作速查 */}
          <div>
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-800 mb-4">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{t('核心著作速查')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {manifest.map((b) => (
                <Link
                  key={b.id}
                  href={`/classics/${b.id}`}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {t(b.title)}
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
