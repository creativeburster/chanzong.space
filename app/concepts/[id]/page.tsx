'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { ArrowLeft, BookOpen, Quote, Sparkles, Lightbulb, Users, Link as LinkIcon, Tag, Compass, MessageSquare } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { useLang } from '@/context/LangContext';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ConceptDetailPage({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

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
          <Link
            href="/concepts"
            className="inline-flex items-center space-x-1.5 text-[13px] font-semibold text-slate-500 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('返回核心概念列表')}</span>
          </Link>

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

          {/* 2. 参修指导 */}
          {concept.guidance && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
                <Lightbulb className="w-5 h-5 text-amber-700" />
                <span>{t('💡 参修指导与生活应用')}</span>
              </div>
              <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
                {t(concept.guidance)}
              </p>
            </div>
          )}

          {/* 3. 祖师金句 */}
          {concept.quotes && concept.quotes.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('📜 祖师金句')}</span>
              </div>
              <div className="space-y-3">
                {concept.quotes.map((quote, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-50 border-l-4 border-amber-500 text-[15px] font-serif-zen italic text-zinc-800"
                  >
                    “{t(quote)}”
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 相关人物 */}
          {concept.relatedPersons && concept.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 相关祖师')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {concept.relatedPersons.map(pid => {
                  const rp = ZEN_PERSONS.find(p => p.id === pid);
                  if (!rp) return null;
                  return (
                    <Link key={pid} href={`/persons/${pid}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors">
                      {t(rp.name)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. 相关概念 */}
          {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 相关概念')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  if (!rc) return null;
                  return (
                    <Link key={cid} href={`/concepts/${cid}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors">
                      {t(rc.title)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5b. 相关法门 */}
          {ZEN_METHODS.filter(m => m.relatedConcepts.includes(concept.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 相关修持法门')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ZEN_METHODS.filter(m => m.relatedConcepts.includes(concept.id)).map(m => (
                  <Link key={m.id} href={`/methods/${m.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
                    {t(m.title)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 5c. 相关公案 */}
          {ZEN_KOANS.filter(q => q.relatedConcepts.includes(concept.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <MessageSquare className="w-5 h-5 text-rose-700" />
                <span>{t('❓ 相关公案机锋')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ZEN_KOANS.filter(q => q.relatedConcepts.includes(concept.id)).map(q => (
                  <Link key={q.id} href={`/koan/${q.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
                    {t(q.question)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 6. 相关经典 */}
          {concept.relatedBooks && concept.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={concept.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 相关传世经典')}</span>
             </div>
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {concept.relatedBooks.map((bookId, idx) => {
                 const book = manifest.find(m => m.id === bookId);
                 return (
                 <Link
                   key={idx}
                   href={`/classics/${bookId}`}
                   className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                 >
                   <span className="text-[15px] font-semibold font-serif-zen text-slate-900">
                     📖 {t(book ? book.title : bookId)}
                   </span>
                   <span className="text-[13px] font-semibold text-amber-800">
                     {t('研读原文')} →
                   </span>
                 </Link>
                 );
               })}
             </div>
           </div>
             </>
          )}
        </main>

        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800 py-8 text-xs text-center">
          © {new Date().getFullYear()} 禅宗知识库 (chanzong.space)
        </footer>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
