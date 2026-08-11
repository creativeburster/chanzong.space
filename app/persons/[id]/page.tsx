'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { ArrowLeft, BookOpen, Quote, Sparkles, Compass, ShieldCheck, Users, Share2, Tag } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { useLang } from '@/context/LangContext';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PersonDetailPage({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

  const person = ZEN_PERSONS.find((p) => p.id === params.id);
  if (!person) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <Link
            href="/persons"
            className="inline-flex items-center space-x-1.5 text-[13px] font-semibold text-slate-500 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('返回祖师人物列表')}</span>
          </Link>

          {/* 1. 祖师概览卡片 */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                {t(person.title)}
              </span>
              <span className="text-xs text-slate-500 font-bold">{t(person.era)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 mb-6">
              👤 {t(person.name)}
            </h1>
            
            {/* 7. 师承法嗣 */}
            {person.relatedPersons && person.relatedPersons.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-[15px] font-semibold text-slate-600 mr-2">法脉关联:</span>
                {person.relatedPersons.map(rid => {
                  const rp = ZEN_PERSONS.find(p => p.id === rid);
                  if (!rp) return null;
                  return (
                    <Link key={rid} href={`/persons/${rid}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors">
                      {t(rp.name)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. 生平与求法历程 */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
              <Compass className="w-5 h-5 text-purple-700" />
              <span>{t('📌 祖师生平与求法历程')}</span>
            </div>
            <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed whitespace-pre-wrap">
              {t(person.lifeStory)}
            </p>
          </div>

          {/* 3. 核心教风 */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <span>{t('💡 核心教风与宗理玄旨')}</span>
            </div>
            <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
              {t(person.teachings)}
            </p>
          </div>

          {/* 4. 名言警策 */}
          {person.quotes && person.quotes.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('📜 祖师名言警策与机锋开示')}</span>
              </div>
              <div className="space-y-3">
                {person.quotes.map((quote, idx) => (
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

          {/* 6. 相关概念 */}
          {person.relatedConcepts && person.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🏷️ 相关核心概念')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {person.relatedConcepts.map(cid => {
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

          {/* 6b. 相关法门 */}
          {person.relatedMethods && person.relatedMethods.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 相关修持法门')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {person.relatedMethods.map(mid => {
                  const rm = ZEN_METHODS.find(m => m.id === mid);
                  if (!rm) return null;
                  return (
                    <Link key={mid} href={`/methods/${mid}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors">
                      {t(rm.title)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6c. 相关公案 */}
          {ZEN_KOANS.filter(q => q.relatedPersons.includes(person.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('❓ 相关公案机锋')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ZEN_KOANS.filter(q => q.relatedPersons.includes(person.id)).map(q => (
                  <Link key={q.id} href={`/koan/${q.id}`} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors">
                    {t(q.question)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 5. 传世经典 */}
          {person.classics && person.classics.length > 0 && (
             <>
             {person.relatedBooks && person.relatedBooks.length > 0 && <GlossaryCard sourceIds={person.relatedBooks} />}
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 传世经典与开示法要')}</span>
             </div>
 
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {person.classics.map((classicName, idx) => {
                 const bookId = person.relatedBooks?.[idx];
                 const book = bookId ? manifest.find(m => m.id === bookId) : undefined;
                 const inner = (
                   <>
                     <span className="text-[15px] font-semibold font-serif-zen text-slate-900">
                       📖 {t(classicName)}
                     </span>
                     {book && (
                       <span className="text-[13px] font-semibold text-amber-800">
                         {t('研读原文')} →
                       </span>
                     )}
                   </>
                 );
                 return book ? (
                   <Link
                     key={idx}
                     href={`/classics/${book.id}`}
                     className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                   >
                     {inner}
                   </Link>
                 ) : (
                   <div
                     key={idx}
                     className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between"
                   >
                     {inner}
                   </div>
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
