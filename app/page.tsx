'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { StatsOverview } from '@/components/StatsOverview';
import { QuickEntryGrid } from '@/components/QuickEntryGrid';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS } from '@/lib/taxonomy';
import { ChevronRight, Gem, Users, BookOpen } from 'lucide-react';

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      {/* 1. Left Dark Sidebar (Exact ramanamaharshi.space style) */}
      <Sidebar
        onOpenSearch={() => setSearchOpen(true)}
        classicsCount={manifest.length}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header Navigation Bar */}
        <TopHeader />

        {/* 3. Center Warm Paper Canvas */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          {/* Header Tagline & Hero */}
          <div className="text-center mb-10">
            <p className="text-sm text-slate-500 font-serif-zen tracking-wide mb-3">
              千载祖师心印 · 顿悟见性之道
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 tracking-tight flex items-center justify-center space-x-3 mb-2">
              <span>🙏 禅宗知识库</span>
            </h1>

            <p className="text-sm text-slate-600 font-serif-zen max-w-lg mx-auto">
              传承自西天二十八祖与东土达摩、六祖、马祖至高丽普照知呐禅师 · 自我了悟见性之道
            </p>
          </div>

          {/* 4 Large Stat Counters Grid */}
          <StatsOverview />

          {/* Quick Entry Cards Grid */}
          <QuickEntryGrid />

          {/* Section: 核心概念精选 (Featured Concepts) */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <Gem className="w-4 h-4 text-emerald-600" />
                <span>核心概念精选</span>
              </div>
              <Link href="/concepts" className="text-xs text-amber-800 font-bold hover:underline">
                查看全部 {ZEN_CONCEPTS.length} 概念 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ZEN_CONCEPTS.slice(0, 4).map((concept) => (
                <div
                  key={concept.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-600/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold font-serif-zen text-slate-900">
                      💎 {concept.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {concept.category}
                    </span>
                  </div>
                  <p className="text-[15px] text-slate-600 leading-relaxed font-normal mb-3">
                    {concept.summary}
                  </p>
                  <div className="text-xs text-slate-400 font-medium border-t border-slate-100 pt-2">
                    出处：{concept.classicRef}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: 核心著作典籍精选 (Featured Classics) */}
          <div className="my-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>核心著作典籍精选</span>
              </div>
              <Link href="/books" className="text-xs text-amber-800 font-bold hover:underline">
                查看全部 {manifest.length} 典籍 →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                manifest.find((m) => m.id === 'weimojiejing'),
                manifest.find((m) => m.id === 'lengyanjing'),
                manifest.find((m) => m.id === 'chanlinbaoxun'),
                manifest.find((m) => m.id === 'yuanjuejing'),
                manifest.find((m) => m.id === 'xinjing'),
                manifest.find((m) => m.id === 'jingangjing'),
              ]
                .filter((item): item is NonNullable<typeof item> => Boolean(item))
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/classics/${item.id}`}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{item.idx}</span>
                      </div>

                      <h4 className="text-base font-bold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors mb-1">
                        {item.title}
                      </h4>

                      <p className="text-[13px] text-slate-500 mb-3">
                        作者：{item.author}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800 font-bold">
                      <span>研读原文</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800 py-8 text-xs text-center">
          © {new Date().getFullYear()} 禅宗知识库 (chanzong.space) · 传承顿悟见性之道
        </footer>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={manifest}
      />
    </div>
  );
}
