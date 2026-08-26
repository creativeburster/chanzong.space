'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { TranslationCard } from '@/components/TranslationCard';
import { GlossaryCard } from '@/components/GlossaryCard';
import { VerseCard, KoanCard, QuoteCard, PracticeCard, ModernAppCard, HistoryCard, RelatedBooksCard, AudioToolbarButton } from '@/components/ClassicCards';
import { extractCards } from '@/lib/extractCards';
import { ClassicItem } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ChevronLeft, ChevronRight, Copy, Check, Users, Gem, Compass, MessageSquare, HelpCircle } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { LinkCardGrid } from '@/components/InternalLinkCards';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

interface ClassicViewerProps {
  meta: ClassicItem;
  htmlContent: string;
  rawContent: string;
  manifest: ClassicItem[];
  prevItem: ClassicItem | null;
  nextItem: ClassicItem | null;
}

export const ClassicViewer: React.FC<ClassicViewerProps> = ({
  meta,
  htmlContent,
  rawContent,
  manifest,
  prevItem,
  nextItem,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [displayRatio, setDisplayRatio] = useState(0.15);
  const { t } = useLang();

  const relPersons = ZEN_PERSONS.filter((p) => p.relatedBooks.includes(meta.id));
  const relConcepts = ZEN_CONCEPTS.filter((c) => c.relatedBooks.includes(meta.id));
  const relMethods = ZEN_METHODS.filter((m) => m.relatedBooks.includes(meta.id));
  const relQas = ZEN_KOANS.filter((q) => q.relatedBooks.includes(meta.id));
  const relFaqs = ZEN_FAQS.filter((f) => f.relatedBooks && f.relatedBooks.includes(meta.id));

  // 自动提取卡片数据
  const extracted = extractCards(rawContent);
  const relQuotes = relPersons.flatMap((p) => p.quotes || []);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        {/* Top Banner Header */}
        <div className="bg-white border-b border-zinc-200 py-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6">
            <Breadcrumb items={[{ label: '经典', href: '/books' }, { label: meta.title }]} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 inline-block mb-3">
                  {t(meta.category)}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-zinc-900 leading-tight">
                  {t(meta.title)}
                </h1>
                <p className="mt-2 text-xs text-zinc-500 font-bold">
                  {t('作者')}：{t(meta.author)} · {t('分类')}：{t(meta.category)} · {Math.round(meta.word_count / 1000 * 10) / 10}k {t('字')}
                </p>
                {(meta as any).translation_note && (
                  <p className="mt-2 inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300/60">
                    📖 {(meta as any).translation_note}
                  </p>
                )}
                {(meta as any).tradition_note && (
                  <p className="mt-2 text-[11px] leading-relaxed font-medium px-2.5 py-1.5 rounded-lg bg-indigo-50/80 text-indigo-800 border border-indigo-200/60">
                    ℹ️ {(meta as any).tradition_note}
                  </p>
                )}
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center space-x-3 flex-wrap">
                <button
                  onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-[13px] font-semibold text-zinc-700 hover:border-amber-700 transition-all"
                >
                  {fontSize === 'normal' ? t('大号字体') : t('标准字体')}
                </button>

                <AudioToolbarButton rawContent={rawContent} />

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white text-[13px] font-semibold hover:bg-amber-800 transition-all shadow-md"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('已复制全文') : t('复制全文')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Reading Viewport */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12 w-full">
          <article className="bg-white p-8 sm:p-14 rounded-3xl border border-zinc-200 shadow-lg">
            <div
              className={`prose prose-zinc max-w-none font-serif-zen text-zinc-800 leading-relaxed ${
                fontSize === 'large' ? 'text-[19px] sm:text-[21px] space-y-6' : 'text-[17px] sm:text-[19px] space-y-4'
              }`}
              dangerouslySetInnerHTML={{ __html: htmlContent.slice(0, Math.ceil(htmlContent.length * displayRatio)) }}
            />

            {displayRatio < 1 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="w-full max-w-xs h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${Math.round(displayRatio * 100)}%` }} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDisplayRatio((r) => Math.min(1, r + 0.15))}
                    className="px-5 py-2.5 rounded-xl bg-amber-900 text-white text-[14px] font-semibold hover:bg-amber-800 transition-all shadow-md"
                  >
                    {t('加载更多')}
                  </button>
                  <button
                    onClick={() => setDisplayRatio(1)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-600 text-[14px] font-semibold hover:border-amber-700 hover:text-amber-800 transition-all"
                  >
                    {t('显示全部')}
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  {t('已显示')} {Math.round(displayRatio * 100)}% · {t('约')} {Math.round(rawContent.length * displayRatio)} / {rawContent.length} {t('字')}
                </p>
              </div>
            )}
          </article>

          {/* 核心偈颂 */}
          <VerseCard verses={extracted.verses} />

          {/* 公案精选 */}
          <KoanCard koans={extracted.koans} />

          {/* 白话今译（分页） */}
          <TranslationCard classicId={meta.id} />

          {/* 生僻字解释 */}
          <GlossaryCard sourceIds={[meta.id]} />

          {/* 祖师名言 */}
          <QuoteCard quotes={relQuotes} personNames={relPersons.map(p => p.name)} />

          {/* 实践指导 */}
          <PracticeCard practices={extracted.practices} relMethods={relMethods} />

          {/* 现代启示 */}
          <ModernAppCard apps={extracted.modernApp} />

          {/* 历史背景 */}
          <HistoryCard meta={meta} relPersons={relPersons} />

          {/* 相关经典 */}
          <RelatedBooksCard manifest={manifest} currentId={meta.id} />

          {/* 延伸阅读：交叉引用 */}
          {(relPersons.length > 0 || relConcepts.length > 0 || relMethods.length > 0 || relQas.length > 0 || relFaqs.length > 0) && (
            <div className="mt-10 bg-white p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-md space-y-6">
              <h2 className="text-xl font-bold font-serif-zen text-zinc-900">
                {t('🔗 延伸阅读 · 知识网络')}
              </h2>

              {relPersons.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-blue-900">
                    <Users className="w-5 h-5 text-blue-700" />
                    <span>{t('相关祖师')}</span>
                  </div>
                  <LinkCardGrid
                    items={relPersons.map(p => ({ id: p.id, title: p.name, summary: p.title, href: `/persons/${p.id}` }))}
                    variant="blue"
                  />
                </div>
              )}

              {relConcepts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                    <Gem className="w-5 h-5 text-purple-700" />
                    <span>{t('相关概念')}</span>
                  </div>
                  <LinkCardGrid
                    items={relConcepts.map(c => ({ id: c.id, title: c.title, summary: c.summary?.slice(0, 60), href: `/concepts/${c.id}` }))}
                    variant="purple"
                  />
                </div>
              )}

              {relMethods.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                    <Compass className="w-5 h-5 text-sky-700" />
                    <span>{t('相关法门')}</span>
                  </div>
                  <LinkCardGrid
                    items={relMethods.map(m => ({ id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}` }))}
                    variant="sky"
                  />
                </div>
              )}

              {relQas.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                    <MessageSquare className="w-5 h-5 text-rose-700" />
                    <span>{t('相关公案')}</span>
                  </div>
                  <LinkCardGrid
                    items={relQas.map(q => ({ id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}` }))}
                    variant="rose"
                    columns={3}
                  />
                </div>
              )}

              {relFaqs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                    <HelpCircle className="w-5 h-5 text-emerald-700" />
                    <span>{t('相关问答')}</span>
                  </div>
                  <div className="space-y-3">
                    {relFaqs.map(f => (
                      <div key={f.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <div className="text-[14px] font-semibold text-emerald-900 mb-1">{t(f.question)}</div>
                        <div className="text-[13px] text-emerald-800/80 leading-relaxed">{t(f.answer).slice(0, 120)}{f.answer.length > 120 ? '...' : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Pagination */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevItem ? (
              <Link
                href={`/classics/${prevItem.id}`}
                className="w-full sm:w-auto p-4 rounded-2xl bg-white border border-zinc-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center space-x-3 shadow-sm group"
              >
                <ChevronLeft className="w-5 h-5 text-amber-800 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('上一篇')}</div>
                  <div className="text-[15px] font-semibold font-serif-zen text-zinc-900 group-hover:text-amber-900">
                    {t(prevItem.title)}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {nextItem ? (
              <Link
                href={`/classics/${nextItem.id}`}
                className="w-full sm:w-auto p-4 rounded-2xl bg-white border border-zinc-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-end space-x-3 shadow-sm group text-right ml-auto"
              >
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('下一篇')}</div>
                  <div className="text-[15px] font-semibold font-serif-zen text-zinc-900 group-hover:text-amber-900">
                    {t(nextItem.title)}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-800 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
};
