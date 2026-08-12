'use client';

import React, { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { STATS } from '@/lib/stats';
import { ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS, ZEN_CONCEPTS } from '@/lib/taxonomy';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';

const GraphCanvas = lazy(() => import('@/components/GraphCanvas').then(m => ({ default: m.GraphCanvas })));

export default function GraphPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

  const featuredClassics = ['tanjing', 'huangbo', 'wumenguan', 'linji', 'xinxinming', 'changuancejin']
    .map(id => manifest.find(m => m.id === id))
    .filter(Boolean) as typeof manifest;
  const featuredConcepts = ZEN_CONCEPTS.slice(0, 6);
  const featuredMethods = ZEN_METHODS.slice(0, 6);
  const featuredKoans = ZEN_KOANS.slice(0, 6);
  const featuredPersons = ZEN_PERSONS.filter(p => ['bodhidharma', 'huineng', 'mazu', 'huangbo', 'linji', 'yongjia'].includes(p.id));
  const featuredFaqs = ZEN_FAQS.slice(0, 6);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-12">
          <div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('知识图谱')} ({STATS.concepts} {t('概念')} · {STATS.classics} {t('著作')} · {STATS.persons} {t('祖师')} · {STATS.koans} {t('公案')})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('鼠标悬停节点查看关联线与关系语义，单击直达详情研读页。右上角可按类型筛选节点，左上角支持缩放与重置。')}
            </p>
          </div>

          {/* Interactive Force Graph */}
          <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">加载中…</div>}>
            <GraphCanvas />
          </Suspense>

          {/* 六大板块精华链接 */}
          {/* 1. 经典著作 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-amber-800">{t('经典著作精华')}</span>
              <Link href="/books" className="text-xs text-amber-800 font-bold hover:underline">{t('查看全部')} {STATS.classics} {t('部')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredClassics.map((b) => (
                <Link key={b.id} href={`/classics/${b.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors">
                  {t(b.title)}
                </Link>
              ))}
            </div>
          </div>

          {/* 2. 核心概念 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-emerald-700">{t('核心概念精华')}</span>
              <Link href="/concepts" className="text-xs text-emerald-700 font-bold hover:underline">{t('查看全部')} {STATS.concepts} {t('个')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredConcepts.map((c) => (
                <Link key={c.id} href={`/concepts/${c.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  {t(c.title)}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. 修持法门 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-sky-700">{t('修持法门精华')}</span>
              <Link href="/methods" className="text-xs text-sky-700 font-bold hover:underline">{t('查看全部')} {STATS.methods} {t('个')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredMethods.map((m) => (
                <Link key={m.id} href={`/methods/${m.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
                  {t(m.title)}
                </Link>
              ))}
            </div>
          </div>

          {/* 4. 公案 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-rose-700">{t('公案精华')}</span>
              <Link href="/koan" className="text-xs text-rose-700 font-bold hover:underline">{t('查看全部')} {STATS.koans} {t('则')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredKoans.map((k) => (
                <Link key={k.id} href={`/koan/${k.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
                  {t(k.question)}
                </Link>
              ))}
            </div>
          </div>

          {/* 5. 祖师人物 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-purple-700">{t('祖师人物精华')}</span>
              <Link href="/persons" className="text-xs text-purple-700 font-bold hover:underline">{t('查看全部')} {STATS.persons} {t('位')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredPersons.map((p) => (
                <Link key={p.id} href={`/persons/${p.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors">
                  {t(p.name)}
                </Link>
              ))}
            </div>
          </div>

          {/* 6. 经典问答 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-semibold text-amber-700">{t('经典问答精华')}</span>
              <Link href="/faq" className="text-xs text-amber-700 font-bold hover:underline">{t('查看全部')} {STATS.faqs} {t('条')} →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredFaqs.map((f) => (
                <Link key={f.id} href={`/faq#${f.id}`} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors max-w-xs truncate">
                  {t(f.question)}
                </Link>
              ))}
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
