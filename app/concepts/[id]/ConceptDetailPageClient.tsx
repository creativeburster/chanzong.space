'use client';

import { ReadingThemeBar } from '@/components/ReadingThemeBar';
import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Quote, Sparkles, Lightbulb, Users, Link as LinkIcon, Tag, Compass, MessageSquare } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
import { EntityMiniGraph } from '@/components/graph/EntityMiniGraph';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ConceptDetailPageClient({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(false);
  const { t, getHref } = useLang();

  const concept = ZEN_CONCEPTS.find((c) => c.id === params.id);
  if (!concept) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4"><Breadcrumb items={[{ label: t('概念'), href: '/concepts' }, { label: concept.title }]} /><ReadingThemeBar /></div>

          {/* 1. 概念概览卡片 */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {t(concept.category)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 mb-6">
              🏷️ {t(concept.title)}
            </h1>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <p className="text-lg text-slate-700 font-serif-zen leading-relaxed">
                {t(concept.summary)}
              </p>
              {concept.etymology && (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-bold mr-2">词源 / 别名:</span>
                  {t(concept.etymology)}
                </div>
              )}
            </div>
          </div>

          {/* 1.5 概念知识图谱微卡片 */}
          <EntityMiniGraph
            entityId={concept.id}
            entityName={concept.title}
            entityType="concept"
            title={concept.category}
            relatedPersons={concept.relatedPersons}
            relatedConcepts={concept.relatedConcepts}
            relatedBooks={concept.relatedBooks}
          />

          {/* 2. 参修指导 */}
          {concept.guidance && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                <span>{t('💡 参修指导与生活应用')}</span>
              </h2>
              <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
                {t(concept.guidance)}
              </p>
            </div>
          )}

          {/* 3. 祖师金句 */}
          {concept.quotes && concept.quotes.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('📜 祖师金句')}</span>
                <span className="text-xs text-rose-700/60">({t('共')} {concept.quotes.length} {t('则')})</span>
              </h2>
              <div className="space-y-3">
                {(concept.quotes.length > 5 && !quotesExpanded ? concept.quotes.slice(0, 5) : concept.quotes).map((quote, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-50 border-l-4 border-amber-500 text-[15px] font-serif-zen italic text-zinc-800"
                  >
                    “{t(quote)}”
                  </div>
                ))}
              </div>
              {concept.quotes.length > 5 && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setQuotesExpanded(!quotesExpanded)}
                    className="px-4 py-1.5 rounded-xl border border-rose-200 text-[13px] font-semibold text-rose-800 hover:bg-rose-50 transition-all shadow-sm"
                  >
                    {quotesExpanded ? t('收起') : `${t('展开全部金句')} (${t('共')} ${concept.quotes.length} ${t('则')})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. 相关人物 */}
          {concept.relatedPersons && concept.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 相关祖师')}</span>
              </h2>
              <LinkCardGrid
                items={concept.relatedPersons.map(pid => {
                  const rp = ZEN_PERSONS.find(p => p.id === pid);
                  return rp ? { id: rp.id, title: rp.name, summary: rp.title, href: `/persons/${pid}` } : null;
                }).filter(Boolean) as any[]}
                variant="blue"
              />
            </div>
          )}

          {/* 5. 相关概念 */}
          {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 相关概念')}</span>
              </h2>
              <LinkCardGrid
                items={concept.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  return rc ? { id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${cid}` } : null;
                }).filter(Boolean) as any[]}
                variant="purple"
              />
            </div>
          )}

          {/* 5b. 相关法门 */}
          {ZEN_METHODS.filter(m => m.relatedConcepts.includes(concept.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 相关修持法门')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_METHODS.filter(m => m.relatedConcepts.includes(concept.id)).map(m => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 5c. 相关公案 */}
          {ZEN_KOANS.filter(q => q.relatedConcepts.includes(concept.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <MessageSquare className="w-5 h-5 text-rose-700" />
                <span>{t('❓ 相关公案机锋')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_KOANS.filter(q => q.relatedConcepts.includes(concept.id)).map(q => ({
                  id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 6. 相关经典 */}
          {concept.relatedBooks && concept.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={concept.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 相关传世经典')}</span>
             </h2>

             <LinkCardGrid
               items={concept.relatedBooks.map(bookId => {
                 const book = manifest.find(m => m.id === bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 7. 相关问答 */}
          {ZEN_FAQS.filter(f => f.relatedBooks && concept.relatedBooks.some(b => f.relatedBooks!.includes(b))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_FAQS.filter(f => f.relatedBooks && concept.relatedBooks.some(b => f.relatedBooks!.includes(b))).slice(0, 6).map(f => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
                columns={3}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(() => {
            const idx = ZEN_CONCEPTS.findIndex(c => c.id === concept.id);
            const prev = idx > 0 ? { id: ZEN_CONCEPTS[idx - 1].id, title: ZEN_CONCEPTS[idx - 1].title, href: `/concepts/${ZEN_CONCEPTS[idx - 1].id}` } : null;
            const next = idx < ZEN_CONCEPTS.length - 1 ? { id: ZEN_CONCEPTS[idx + 1].id, title: ZEN_CONCEPTS[idx + 1].title, href: `/concepts/${ZEN_CONCEPTS[idx + 1].id}` } : null;
            return <PrevNextNav prev={prev} next={next} />;
          })()}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}