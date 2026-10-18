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
import { BookOpen, Quote, Sparkles, Lightbulb, Users, Tag, Compass, MessageSquare, ArrowRight } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
const EntityMiniGraph = dynamic(
  () => import('@/components/graph/EntityMiniGraph').then((m) => m.EntityMiniGraph),
  { ssr: false }
);
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

/* 书名变体别名：经典卡书名 → manifest id */
const CLASSIC_ALIAS: Record<string, string> = {
  '赵州禅师语录': 'zhaozhouyulu',
  '六祖法宝坛经': 'tanjing',
  '六祖坛经': 'tanjing',
  '杨岐方会禅师语录': 'yangqiyulu',
  '慈明禅师语录': 'shishuangchuyuan',
  '沩山语录': 'weishanyulu',
  '曹山语录': 'caoshanyulu',
  '金刚经': 'jingangjing',
  '肇论': 'zhaolun',
  '绝观论': 'jueguanlun',
  '无门关': 'wumenguan',
  '坐禅仪': 'zuochanyi',
  '禅苑清规': 'chanyuanqinggui',
  '普明十牛图颂': 'shiniutu',
  '云门匡真禅师广录': 'yunmen',
  '文殊师利所说摩诃般若波罗蜜经': 'wenshu',
  '七佛传法偈': 'qifo',
  '黄龙慧南禅师语录': 'huanglonghuinan',
  '筠州洞山悟本禅师语录': 'dongshanyulu',
  '维摩诘经': 'weimojiejing',
};

interface PageProps {
  params: {
    id: string;
  };
  initialConcept?: any;
  sameCategoryConcepts?: any[];
  relatedKoans?: any[];
  relatedMethods?: any[];
  relatedPersonsData?: any[];
  relatedCrossConceptsData?: any[];
  relatedFaqsData?: any[];
  prevConcept?: { id: string; title: string } | null;
  nextConcept?: { id: string; title: string } | null;
}

export default function ConceptDetailPageClient({
  params,
  initialConcept,
  sameCategoryConcepts: propSameCategory = [],
  relatedKoans: propRelatedKoans = [],
  relatedMethods: propRelatedMethods = [],
  relatedPersonsData = [],
  relatedCrossConceptsData = [],
  relatedFaqsData = [],
  prevConcept = null,
  nextConcept = null,
}: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(false);
  const { t, getHref } = useLang();

  const concept = initialConcept;
  if (!concept) {
    notFound();
  }

  const sameCategoryConcepts = propSameCategory;
  const relatedKoans = propRelatedKoans;
  const relatedMethods = propRelatedMethods;

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

          {/* 1.1 概念语义实体档案 (Entity Semantic Infobox - 原生HTML三元组，极速索引) */}
          <section aria-label="概念实体关系档案" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="text-base">{t('📊 概念义理与知识实体档案')}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Concept & Semantic Infobox</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                <tbody>
                  <tr className="hover:bg-slate-50/60">
                    <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                      {t('义理范畴')}
                    </th>
                    <td className="py-2.5 px-4 font-medium text-blue-800">
                      {t(concept.category)}
                    </td>
                  </tr>
                  {concept.etymology && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('词源别名')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-slate-600">
                        {t(concept.etymology)}
                      </td>
                    </tr>
                  )}
                  {concept.relatedBooks && concept.relatedBooks.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('出处典籍')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {concept.relatedBooks.map((bid: string) => {
                            const actualId = CLASSIC_ALIAS[bid] || bid;
                            const classic = (manifest as any[]).find((m: any) => m.id === actualId || m.title === bid);
                            const title = classic ? classic.title : bid;
                            return (
                              <Link
                                prefetch={false}
                                key={bid}
                                href={getHref(`/classics/${classic ? classic.id : actualId}`)}
                                className="text-emerald-700 hover:text-emerald-900 hover:underline bg-emerald-50/80 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3 inline" />
                                《{t(title)}》{classic?.cbeta_id ? `(${classic.cbeta_id})` : ''}
                              </Link>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedPersonsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('阐发宗师')}
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
                              {t(p.name)} {p.era ? `(${t(p.era)})` : ''}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedCrossConceptsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('关联概念')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedCrossConceptsData.map((c: any) => (
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
                  {relatedMethods.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('实修法门')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedMethods.map(m => (
                            <Link
                              prefetch={false}
                              key={m.id}
                              href={getHref(`/methods/${m.id}`)}
                              className="text-amber-800 hover:text-amber-950 hover:underline bg-amber-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(m.title)}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedKoans.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('载载公案')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedKoans.slice(0, 4).map(q => (
                            <Link
                              prefetch={false}
                              key={q.id}
                              href={getHref(`/koan/${q.id}`)}
                              className="text-rose-700 hover:text-rose-900 hover:underline bg-rose-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(q.question.slice(0, 24))}{q.question.length > 24 ? '...' : ''}
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
                {concept.quotes.map((quote: string, idx: number) => {
                  const isHidden = concept.quotes.length > 5 && !quotesExpanded && idx >= 5;
                  return (
                    <div
                      key={idx}
                      className={`${
                        isHidden ? 'hidden' : 'block'
                      } p-5 rounded-2xl bg-zinc-50 border-l-4 border-amber-500 text-[15px] font-serif-zen italic text-zinc-800`}
                    >
                      “{t(quote)}”
                    </div>
                  );
                })}
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
          {relatedPersonsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 阐发此概念的历代祖师')}</span>
              </h2>
              <LinkCardGrid
                items={relatedPersonsData.map((rp: any) => ({
                  id: rp.id,
                  title: rp.name,
                  summary: rp.title,
                  href: `/persons/${rp.id}`
                }))}
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
          {relatedCrossConceptsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Tag className="w-5 h-5 text-slate-700" />
                <span>{t('🔗 交叉互参概念')}</span>
              </h2>
              <LinkCardGrid
                items={relatedCrossConceptsData.map((rc: any) => ({
                  id: rc.id,
                  title: rc.title,
                  summary: rc.summary?.slice(0, 60),
                  href: `/concepts/${rc.id}`
                }))}
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
               items={concept.relatedBooks.map((bookId: string) => {
                 const book = manifest.find(m => m.id === bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 10. 相关问答 */}
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

          {/* 上下篇导航 */}
          {(prevConcept || nextConcept) && (
            <PrevNextNav
              prev={prevConcept ? { id: prevConcept.id, title: prevConcept.title, href: `/concepts/${prevConcept.id}` } : null}
              next={nextConcept ? { id: nextConcept.id, title: nextConcept.title, href: `/concepts/${nextConcept.id}` } : null}
            />
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
