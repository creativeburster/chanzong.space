'use client';

import { ReadingThemeBar } from '@/components/ReadingThemeBar';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Quote, Sparkles, Lightbulb, Users, Tag, Compass, MessageSquare, ArrowRight } from 'lucide-react';
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

  // 1. 同一范畴的其他概念
  const sameCategoryConcepts = useMemo(() => {
    if (!concept.category) return [];
    return ZEN_CONCEPTS.filter(c => c.id !== concept.id && c.category === concept.category).slice(0, 6);
  }, [concept]);

  // 2. 阐发此概念的代表公案
  const relatedKoans = useMemo(() => {
    // 优先：显式关联
    const explicit = ZEN_KOANS.filter(q => q.relatedConcepts && q.relatedConcepts.includes(concept.id));
    if (explicit.length >= 6) return explicit.slice(0, 6);

    const explicitIds = new Set(explicit.map(q => q.id));
    // 补充：问答/解读中直接探讨该概念
    const implicit = ZEN_KOANS.filter(q => {
      if (explicitIds.has(q.id)) return false;
      return (
        q.question.includes(concept.title) ||
        q.answer.includes(concept.title) ||
        (q.interpretation && q.interpretation.includes(concept.title))
      );
    });

    return [...explicit, ...implicit].slice(0, 6);
  }, [concept]);

  // 3. 践行此概念的实修法门
  const relatedMethods = useMemo(() => {
    const explicit = ZEN_METHODS.filter(m => m.relatedConcepts && m.relatedConcepts.includes(concept.id));
    if (explicit.length >= 4) return explicit.slice(0, 4);

    const explicitIds = new Set(explicit.map(m => m.id));
    const implicit = ZEN_METHODS.filter(m => {
      if (explicitIds.has(m.id)) return false;
      return (
        m.title.includes(concept.title) ||
        m.summary.includes(concept.title) ||
        m.steps.some(s => s.includes(concept.title))
      );
    });

    return [...explicit, ...implicit].slice(0, 4);
  }, [concept]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <Breadcrumb items={[{ label: t('概念'), href: '/concepts' }, { label: concept.title }]} />
            <ReadingThemeBar />
          </div>

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
                  <span className="font-bold mr-2">{t('词源 / 别名:')}</span>
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

          {/* 4. 倡导此概念的历代祖师 */}
          {concept.relatedPersons && concept.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 阐发此概念的历代祖师')}</span>
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

          {/* 5. 深入阐发此概念的代表公案 */}
          {relatedKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                  <MessageSquare className="w-5 h-5 text-rose-700" />
                  <span>{t('❓ 阐发此概念的机锋公案')}</span>
                  <span className="text-xs text-rose-700/60 font-mono">({relatedKoans.length})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/koan`)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('在公案库中检索')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={relatedKoans.map(q => ({
                  id: q.id,
                  title: q.question,
                  summary: `【${q.master}】${q.answer}`,
                  href: `/koan/${q.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 6. 践行此概念的修持法门 */}
          {relatedMethods.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 践行此概念的修持法门')}</span>
                <span className="text-xs text-sky-700/60 font-mono">({relatedMethods.length})</span>
              </h2>
              <LinkCardGrid
                items={relatedMethods.map(m => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 7. 同一义理范畴的相关概念 */}
          {sameCategoryConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                  <Tag className="w-5 h-5 text-purple-700" />
                  <span>{t('🏷️')} 【{t(concept.category)}】 {t('范畴的更多概念')}</span>
                  <span className="text-xs text-purple-700/60 font-mono">({sameCategoryConcepts.length})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/concepts`)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('全部概念')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={sameCategoryConcepts.map(c => ({
                  id: c.id,
                  title: c.title,
                  summary: c.summary?.slice(0, 60),
                  href: `/concepts/${c.id}`
                }))}
                variant="purple"
                columns={3}
              />
            </div>
          )}

          {/* 8. 交叉关联概念 */}
          {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Tag className="w-5 h-5 text-slate-700" />
                <span>{t('🔗 交叉互参概念')}</span>
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

          {/* 9. 相关经典 */}
          {concept.relatedBooks && concept.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={concept.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 载述此概念的传世经典')}</span>
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

          {/* 10. 相关问答 */}
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
