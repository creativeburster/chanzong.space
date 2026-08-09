'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { TranslationCard } from '@/components/TranslationCard';
import { ClassicItem } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_QAS } from '@/lib/taxonomy';
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check, Users, Gem, Compass, MessageSquare } from 'lucide-react';
import { useLang } from '@/context/LangContext';

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
  const { t } = useLang();

  const relPersons = ZEN_PERSONS.filter((p) => p.relatedBooks.includes(meta.id));
  const relConcepts = ZEN_CONCEPTS.filter((c) => c.relatedBooks.includes(meta.id));
  const relMethods = ZEN_METHODS.filter((m) => m.relatedBooks.includes(meta.id));
  const relQas = ZEN_QAS.filter((q) => q.relatedBooks.includes(meta.id));

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
            <Link
              href="/books"
              className="inline-flex items-center space-x-1.5 text-[13px] font-semibold text-slate-500 hover:text-amber-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('返回典籍大库')}</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 inline-block mb-3">
                  {t(meta.category)}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-zinc-900 leading-tight">
                  {t(meta.title)}
                </h1>
                <p className="mt-2 text-xs text-zinc-500 font-bold">
                  {t('作者')}：{t(meta.author)} · {t('出处：《正法心传》')} · {Math.round(meta.word_count / 1000 * 10) / 10}k {t('字')}
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-[13px] font-semibold text-zinc-700 hover:border-amber-700 transition-all"
                >
                  {fontSize === 'normal' ? t('大号字体') : t('标准字体')}
                </button>

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
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </article>

          {/* 白话今译（分页） */}
          <TranslationCard classicId={meta.id} />

          {/* 延伸阅读：交叉引用 */}
          {(relPersons.length > 0 || relConcepts.length > 0 || relMethods.length > 0 || relQas.length > 0) && (
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
                  <div className="flex flex-wrap gap-2">
                    {relPersons.map((p) => (
                      <Link key={p.id} href={`/persons/${p.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors">
                        {t(p.name)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relConcepts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                    <Gem className="w-5 h-5 text-purple-700" />
                    <span>{t('相关概念')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relConcepts.map((c) => (
                      <Link key={c.id} href={`/concepts/${c.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors">
                        {t(c.title)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relMethods.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                    <Compass className="w-5 h-5 text-sky-700" />
                    <span>{t('相关法门')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relMethods.map((m) => (
                      <Link key={m.id} href={`/methods/${m.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
                        {t(m.title)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relQas.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                    <MessageSquare className="w-5 h-5 text-rose-700" />
                    <span>{t('相关公案')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relQas.map((q) => (
                      <Link key={q.id} href={`/qa/${q.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
                        {t(q.question)}
                      </Link>
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

        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800 py-8 text-xs text-center">
          © {new Date().getFullYear()} 禅宗知识库 (chanzong.space)
        </footer>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
};
