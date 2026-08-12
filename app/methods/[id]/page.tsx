'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ArrowLeft, BookOpen, Route, AlertTriangle, Users, Tag, Compass, MessageSquare, Lightbulb } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';

interface PageProps {
  params: {
    id: string;
  };
}

export default function MethodDetailPage({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useLang();

  const method = ZEN_METHODS.find((m) => m.id === params.id);
  if (!method) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <Link
            href="/methods"
            className="inline-flex items-center space-x-1.5 text-[13px] font-semibold text-slate-500 hover:text-green-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('返回实修法门列表')}</span>
          </Link>

          {/* 1. 法门概览卡片 */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 mb-6">
              🧘 {t(method.title)}
            </h1>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <p className="text-lg text-slate-700 font-serif-zen leading-relaxed">
                {t(method.summary)}
              </p>
              {method.origin && (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-bold mr-2">法门源流:</span>
                  {t(method.origin)}
                </div>
              )}
            </div>
          </div>

          {/* 2. 修行步骤 */}
          {method.steps && method.steps.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-green-900">
                <Route className="w-5 h-5 text-green-700" />
                <span>{t('🛤️ 参修步骤与方法')}</span>
              </div>
              <div className="space-y-3 pl-4">
                {method.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-500 before:rounded-full">
                    <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed">
                      {t(step)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 修行误区 */}
          {method.pitfalls && method.pitfalls.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
                <span>{t('⚠️ 常见误区与警惕')}</span>
              </div>
              <div className="space-y-3">
                {method.pitfalls.map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-rose-50 border-l-4 border-rose-500 text-[15px] font-serif-zen text-rose-800"
                  >
                    {t(pitfall)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 相关人物 */}
          {method.relatedPersons && method.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 代表祖师')}</span>
              </div>
              <LinkCardGrid
                items={method.relatedPersons.map(pid => {
                  const rp = ZEN_PERSONS.find(p => p.id === pid);
                  return rp ? { id: rp.id, title: rp.name, summary: rp.title, href: `/persons/${pid}` } : null;
                }).filter(Boolean) as any[]}
                variant="blue"
              />
            </div>
          )}

          {/* 5. 相关概念 */}
          {method.relatedConcepts && method.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 核心关联概念')}</span>
              </div>
              <LinkCardGrid
                items={method.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  return rc ? { id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${cid}` } : null;
                }).filter(Boolean) as any[]}
                variant="purple"
              />
            </div>
          )}

          {/* 5b. 相关公案 */}
          {ZEN_KOANS.filter(q =>
            q.relatedConcepts.some(c => method.relatedConcepts.includes(c)) ||
            q.relatedPersons.some(p => method.relatedPersons.includes(p))
          ).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <MessageSquare className="w-5 h-5 text-rose-700" />
                <span>{t('❓ 相关公案机锋')}</span>
              </div>
              <LinkCardGrid
                items={ZEN_KOANS.filter(q =>
                  q.relatedConcepts.some(c => method.relatedConcepts.includes(c)) ||
                  q.relatedPersons.some(p => method.relatedPersons.includes(p))
                ).map(q => ({
                  id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 6. 相关经典 */}
          {method.relatedBooks && method.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={method.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 相关传世经典')}</span>
             </div>

             <LinkCardGrid
               items={method.relatedBooks.map(bookId => {
                 const book = manifest.find(m => m.id === bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 相关问答 */}
          {ZEN_FAQS.filter(f => f.relatedBooks && method.relatedBooks && f.relatedBooks.some(b => method.relatedBooks!.includes(b))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </div>
              <LinkCardGrid
                items={ZEN_FAQS.filter(f => f.relatedBooks && method.relatedBooks && f.relatedBooks.some(b => method.relatedBooks!.includes(b))).slice(0, 6).map(f => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
                columns={3}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(() => {
            const idx = ZEN_METHODS.findIndex(m => m.id === method.id);
            const prev = idx > 0 ? { id: ZEN_METHODS[idx - 1].id, title: ZEN_METHODS[idx - 1].title, href: `/methods/${ZEN_METHODS[idx - 1].id}` } : null;
            const next = idx < ZEN_METHODS.length - 1 ? { id: ZEN_METHODS[idx + 1].id, title: ZEN_METHODS[idx + 1].title, href: `/methods/${ZEN_METHODS[idx + 1].id}` } : null;
            return <PrevNextNav prev={prev} next={next} />;
          })()}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
