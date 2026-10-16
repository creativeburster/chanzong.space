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
  initialQa?: any;
  sameMasterKoans?: any[];
  sameBookKoans?: any[];
  sameConceptKoans?: any[];
  relatedPersonsData?: any[];
  relatedConceptsData?: any[];
  relatedMethodsData?: any[];
  relatedFaqsData?: any[];
  prevKoan?: { id: string; title: string } | null;
  nextKoan?: { id: string; title: string } | null;
}

export default function KoanDetailPageClient({
  params,
  initialQa,
  sameMasterKoans: propSameMaster = [],
  sameBookKoans: propSameBook = [],
  sameConceptKoans: propSameConcept = [],
  relatedPersonsData = [],
  relatedConceptsData = [],
  relatedMethodsData = [],
  relatedFaqsData = [],
  prevKoan = null,
  nextKoan = null,
}: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const { t, getHref } = useLang();
  const bookMap = useMemo(() => new Map(manifest.map(m => [m.id, m])), []);

  const qa = initialQa;
  if (!qa) {
    notFound();
  }

  const sameMasterKoans = propSameMaster;
  const sameBookKoans = propSameBook;
  const sameConceptKoans = propSameConcept;

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

          {/* 1.1 公案法要与知识实体档案 (Entity Semantic Infobox - 原生HTML三元组，极速索引) */}
          <section aria-label="公案实体关系档案" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <HelpCircle className="w-5 h-5 text-rose-600" />
                <span className="text-base">{t('📊 公案机锋与知识实体档案')}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Koan & Semantic Infobox</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                <tbody>
                  {qa.master && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('主角宗师')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen font-semibold text-rose-800">
                        {relatedPersonsData.find(p => p.name === qa.master || (p.name && qa.master.includes(p.name))) ? (
                          <Link
                            prefetch={false}
                            href={getHref(`/persons/${relatedPersonsData.find(p => p.name === qa.master || (p.name && qa.master.includes(p.name)))!.id}`)}
                            className="hover:underline text-rose-800"
                          >
                            👤 {t(qa.master)}
                          </Link>
                        ) : (
                          <span>👤 {t(qa.master)}</span>
                        )}
                      </td>
                    </tr>
                  )}
                  {qa.source && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('出处载籍')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen">
                        {qa.relatedBooks && qa.relatedBooks.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {qa.relatedBooks.map((bid: string) => {
                              const b = (manifest as any[]).find(m => m.id === bid || m.title === bid);
                              const bTitle = b ? b.title : bid;
                              return (
                                <Link
                                  prefetch={false}
                                  key={bid}
                                  href={getHref(`/classics/${b ? b.id : bid}`)}
                                  className="text-amber-800 hover:text-amber-950 hover:underline bg-amber-50/80 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
                                >
                                  <BookOpen className="w-3 h-3 inline" />
                                  《{t(bTitle)}》{b?.cbeta_id ? `(${b.cbeta_id})` : ''}
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-600">📖 《{t(qa.source)}》</span>
                        )}
                      </td>
                    </tr>
                  )}
                  {relatedConceptsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('破关旨趣')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedConceptsData.map((c: any) => (
                            <Link
                              prefetch={false}
                              key={c.id}
                              href={getHref(`/concepts/${c.id}`)}
                              className="text-purple-700 hover:text-purple-900 hover:underline bg-purple-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(c.title)}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedPersonsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('关联祖师')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedPersonsData.map((p: any) => (
                            <Link
                              prefetch={false}
                              key={p.id}
                              href={getHref(`/persons/${p.id}`)}
                              className="text-blue-700 hover:text-blue-900 hover:underline bg-blue-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(p.name)} ({t(p.era)})
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedMethodsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('参究法门')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedMethodsData.map((m: any) => (
                            <Link
                              prefetch={false}
                              key={m.id}
                              href={getHref(`/methods/${m.id}`)}
                              className="text-sky-800 hover:text-sky-950 hover:underline bg-sky-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(m.title)}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

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
          {relatedPersonsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 相关祖师')}</span>
              </h2>
              <LinkCardGrid
                items={relatedPersonsData.map(rp => ({
                  id: rp.id,
                  title: rp.name,
                  summary: rp.title,
                  href: `/persons/${rp.id}`
                }))}
                variant="blue"
              />
            </div>
          )}

          {/* 5. 核心关联概念 / 破关旨趣 */}
          {relatedConceptsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 核心破关旨趣与义理')}</span>
              </h2>
              <LinkCardGrid
                items={relatedConceptsData.map(rc => ({
                  id: rc.id,
                  title: rc.title,
                  summary: rc.summary?.slice(0, 60),
                  href: `/concepts/${rc.id}`
                }))}
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
          {relatedMethodsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 破关对治与修持法门')}</span>
              </h2>
              <LinkCardGrid
                items={relatedMethodsData.map(m => ({
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
               items={qa.relatedBooks.map((bookId: string) => {
                 const book = bookMap.get(bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 相关问答 */}
          {relatedFaqsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </h2>
              <LinkCardGrid
                items={relatedFaqsData.map((f: any) => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
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
          {relatedMethodsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 破关对治与修持法门')}</span>
              </h2>
              <LinkCardGrid
                items={relatedMethodsData.map(m => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(prevKoan || nextKoan) && (
            <PrevNextNav
              prev={prevKoan ? { id: prevKoan.id, title: prevKoan.title, href: `/koan/${prevKoan.id}` } : null}
              next={nextKoan ? { id: nextKoan.id, title: nextKoan.title, href: `/koan/${nextKoan.id}` } : null}
            />
          )}
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
