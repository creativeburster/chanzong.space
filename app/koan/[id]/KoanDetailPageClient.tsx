'use client';

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
import { ZEN_KOANS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Sparkles, MessageCircle, HelpCircle, Users, Tag, Compass, Lightbulb, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import ZenQuoteCardModal from '@/components/ZenQuoteCardModal';

interface PageProps {
  params: {
    id: string;
  };
}

export default function KoanDetailPageClient({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const { t, getHref } = useLang();

  const qa = ZEN_KOANS.find((q) => q.id === params.id);
  if (!qa) {
    notFound();
  }

  // 典籍映射
  const bookMap = useMemo(() => {
    const map = new Map<string, typeof manifest[0]>();
    manifest.forEach(b => map.set(b.id, b));
    return map;
  }, []);

  // 1. 同一禅师的其他经典机锋公案
  const sameMasterKoans = useMemo(() => {
    if (!qa.master) return [];
    return ZEN_KOANS.filter(k => k.id !== qa.id && (k.master === qa.master || (k.master && qa.master && (k.master.includes(qa.master) || qa.master.includes(k.master))))).slice(0, 6);
  }, [qa]);

  // 2. 出自同一部典籍的更多公案
  const sameBookKoans = useMemo(() => {
    return ZEN_KOANS.filter(k => {
      if (k.id === qa.id) return false;
      if (qa.relatedBooks && qa.relatedBooks.length > 0 && k.relatedBooks) {
        if (k.relatedBooks.some(b => qa.relatedBooks!.includes(b))) return true;
      }
      if (qa.source && k.source && (k.source.includes(qa.source) || qa.source.includes(k.source))) {
        return true;
      }
      return false;
    }).slice(0, 6);
  }, [qa]);

  // 3. 共享破关旨趣/核心概念的其他公案
  const sameConceptKoans = useMemo(() => {
    if (!qa.relatedConcepts || qa.relatedConcepts.length === 0) return [];
    const masterIds = new Set(sameMasterKoans.map(k => k.id));
    const bookIds = new Set(sameBookKoans.map(k => k.id));
    return ZEN_KOANS.filter(k => {
      if (k.id === qa.id || masterIds.has(k.id) || bookIds.has(k.id)) return false;
      return k.relatedConcepts && k.relatedConcepts.some(c => qa.relatedConcepts.includes(c));
    }).slice(0, 6);
  }, [qa, sameMasterKoans, sameBookKoans]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <Breadcrumb items={[{ label: t('公案机锋'), href: '/koan' }, { label: qa.question }]} />

          {/* 1. 公案概览卡片 */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  {t(qa.master)}
                </span>
                {qa.source && (
                  <span className="text-xs text-slate-500 font-bold">
                    {t('出处:')} {t(qa.source)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCardModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                title={t('生成禅语卡片海报')}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('生成禅语海报')}</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 mb-6">
              ❓ {t(qa.question)}
            </h1>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <MessageCircle className="w-5 h-5 text-rose-700" />
                <span>{t('💭 祖师作答')}</span>
              </h2>
              <p className="text-2xl text-rose-700 font-serif-zen font-bold italic">
                “{t(qa.answer)}”
              </p>
            </div>
          </div>

          {/* 2. 背景故事 */}
          {qa.context && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <BookOpen className="w-5 h-5 text-slate-700" />
                <span>{t('📜 背景故事与机缘')}</span>
              </h2>
              <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed whitespace-pre-wrap">
                {t(qa.context)}
              </p>
            </div>
          )}

          {/* 3. 白话解读 */}
          {qa.interpretation && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <span>{t('💡 白话解读与参究要旨')}</span>
              </h2>
              <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
                {t(qa.interpretation)}
              </p>
            </div>
          )}

          {/* 4. 相关人物 */}
          {qa.relatedPersons && qa.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 相关祖师')}</span>
              </h2>
              <LinkCardGrid
                items={qa.relatedPersons.map(pid => {
                  const rp = ZEN_PERSONS.find(p => p.id === pid);
                  return rp ? { id: rp.id, title: rp.name, summary: rp.title, href: `/persons/${pid}` } : null;
                }).filter(Boolean) as any[]}
                variant="blue"
              />
            </div>
          )}

          {/* 5. 核心关联概念 / 破关旨趣 */}
          {qa.relatedConcepts && qa.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 核心破关旨趣与义理')}</span>
              </h2>
              <LinkCardGrid
                items={qa.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  return rc ? { id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${cid}` } : null;
                }).filter(Boolean) as any[]}
                variant="purple"
              />
            </div>
          )}

          {/* 5b. 同位禅师的其他经典机锋 */}
          {sameMasterKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                  <MessageCircle className="w-5 h-5 text-rose-700" />
                  <span>{t('🗣️')} {t(qa.master)} {t('的其他经典机锋')}</span>
                  <span className="text-xs text-rose-700/60 font-mono">({sameMasterKoans.length})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/koan`)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('浏览更多机锋')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={sameMasterKoans.map(k => ({
                  id: k.id,
                  title: k.question,
                  summary: k.answer,
                  href: `/koan/${k.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 5c. 出自同一部典籍的更多公案 */}
          {sameBookKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  <span>{t('📖 出自同典籍的机锋公案')}</span>
                  <span className="text-xs text-amber-700/60 font-mono">({sameBookKoans.length})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/koan`)}
                  className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('全部公案')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={sameBookKoans.map(k => ({
                  id: k.id,
                  title: k.question,
                  summary: `【${k.master}】${k.answer}`,
                  href: `/koan/${k.id}`
                }))}
                variant="amber"
                columns={3}
              />
            </div>
          )}

          {/* 5d. 同旨趣参修公案 */}
          {sameConceptKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-indigo-900">
                <Sparkles className="w-5 h-5 text-indigo-700" />
                <span>{t('✨ 类似破关旨趣的公案参修')}</span>
                <span className="text-xs text-indigo-700/60 font-mono">({sameConceptKoans.length})</span>
              </h2>
              <LinkCardGrid
                items={sameConceptKoans.map(k => ({
                  id: k.id,
                  title: k.question,
                  summary: `【${k.master}】${k.answer}`,
                  href: `/koan/${k.id}`
                }))}
                variant="purple"
                columns={3}
              />
            </div>
          )}

          {/* 5e. 相关法门 */}
          {ZEN_METHODS.filter(m => m.relatedConcepts.some(c => qa.relatedConcepts.includes(c))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 破关对治与修持法门')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_METHODS.filter(m => m.relatedConcepts.some(c => qa.relatedConcepts.includes(c))).map(m => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 6. 相关经典 */}
          {qa.relatedBooks && qa.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={qa.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 相关传世经典')}</span>
             </h2>

             <LinkCardGrid
               items={qa.relatedBooks.map(bookId => {
                 const book = bookMap.get(bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 相关问答 */}
          {ZEN_FAQS.filter(f => f.relatedBooks && qa.relatedBooks && f.relatedBooks.some(b => qa.relatedBooks!.includes(b))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_FAQS.filter(f => f.relatedBooks && qa.relatedBooks && f.relatedBooks.some(b => qa.relatedBooks!.includes(b))).slice(0, 6).map(f => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
                columns={3}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(() => {
            const idx = ZEN_KOANS.findIndex(q => q.id === qa.id);
            const prev = idx > 0 ? { id: ZEN_KOANS[idx - 1].id, title: ZEN_KOANS[idx - 1].question, href: `/koan/${ZEN_KOANS[idx - 1].id}` } : null;
            const next = idx < ZEN_KOANS.length - 1 ? { id: ZEN_KOANS[idx + 1].id, title: ZEN_KOANS[idx + 1].question, href: `/koan/${ZEN_KOANS[idx + 1].id}` } : null;
            return <PrevNextNav prev={prev} next={next} />;
          })()}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />

      <ZenQuoteCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        quote={`问：“${qa.question}”\n答：“${qa.answer}”`}
        interpretation={qa.interpretation || qa.context}
        sourceTitle={qa.source}
        author={qa.master}
      />
    </div>
  );
}
