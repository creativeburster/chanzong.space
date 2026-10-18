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
import { BookOpen, Quote, Sparkles, Compass, Users, Tag, Lightbulb, MessageSquare, ArrowRight } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
const EntityMiniGraph = dynamic(
  () => import('@/components/graph/EntityMiniGraph').then((m) => m.EntityMiniGraph),
  { ssr: false }
);
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

/* 书名变体别名：经典卡书名 → manifest id（旧数据书名与现库题名不一致时使用） */
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
  initialPerson?: any;
  personKoans?: any[];
  personMethods?: any[];
  personConcepts?: any[];
  relatedPersonsData?: any[];
  relatedFaqsData?: any[];
  prevPerson?: { id: string; title: string } | null;
  nextPerson?: { id: string; title: string } | null;
}

export default function PersonDetailPageClient({
  params,
  initialPerson,
  personKoans: propPersonKoans = [],
  personMethods: propPersonMethods = [],
  personConcepts: propPersonConcepts = [],
  relatedPersonsData = [],
  relatedFaqsData = [],
  prevPerson = null,
  nextPerson = null,
}: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [lifeStoryExpanded, setLifeStoryExpanded] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(false);
  const { t, getHref } = useLang();

  const person = initialPerson;
  if (!person) {
    notFound();
  }

  const isLongStory = person.lifeStory && person.lifeStory.length > 280;
  const personKoans = propPersonKoans;
  const personMethods = propPersonMethods;
  const personConcepts = propPersonConcepts;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <Breadcrumb items={[{ label: t('人物'), href: '/persons' }, { label: t(person.name) }]} />
            <ReadingThemeBar />
          </div>

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

            {/* 法脉师承关联 */}
            {relatedPersonsData.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-[15px] font-semibold text-slate-600 mr-2">{t('法脉师承:')}</span>
                {relatedPersonsData.map((rp: any) => (
                  <Link prefetch={false} key={rp.id} href={getHref(`/persons/${rp.id}`)} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors">
                    {t(rp.name)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 1.1 祖师法脉与知识实体档案 (Entity Semantic Infobox - 原生HTML三元组，极速索引) */}
          <section aria-label="祖师实体关系档案" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-base">{t('📊 祖师法脉与知识实体档案')}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Lineage & Semantic Infobox</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                <tbody>
                  <tr className="hover:bg-slate-50/60">
                    <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                      {t('德号尊称')}
                    </th>
                    <td className="py-2.5 px-4 font-serif-zen">
                      {t(person.title)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                      {t('历史时期')}
                    </th>
                    <td className="py-2.5 px-4">
                      {t(person.era)}
                    </td>
                  </tr>
                  {relatedPersonsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('法脉师承')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {relatedPersonsData.map((rp: any) => (
                            <Link
                              prefetch={false}
                              key={rp.id}
                              href={getHref(`/persons/${rp.id}`)}
                              className="text-blue-700 hover:text-blue-900 hover:underline bg-blue-50/80 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {t(rp.name)} {rp.era ? `(${t(rp.era)})` : ''}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {person.relatedBooks && person.relatedBooks.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('传世经典')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {person.relatedBooks.map((bid: string) => {
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
                  {personConcepts.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('核心义理')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {personConcepts.slice(0, 8).map((c: any) => (
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
                  {personMethods.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('修持法门')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {personMethods.slice(0, 6).map((m: any) => (
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
                  {personKoans.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('代表公案')}
                      </th>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap gap-2">
                          {personKoans.slice(0, 5).map((q: any) => (
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

          {/* 1.5 祖师知识图谱微卡片 */}
          <EntityMiniGraph
            entityId={person.id}
            entityName={person.name}
            entityType="person"
            title={`${person.title} · ${person.era}`}
            relatedPersons={person.relatedPersons}
            relatedConcepts={person.relatedConcepts}
            relatedBooks={person.relatedBooks}
            relatedMethods={person.relatedMethods}
          />

          {/* 2. 生平与求法历程 */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
              <Compass className="w-5 h-5 text-purple-700" />
              <span>{t('📌 祖师生平与求法历程')}</span>
            </h2>
            <div className="relative">
              <p className={`text-[17px] text-slate-700 font-serif-zen leading-relaxed whitespace-pre-wrap transition-all ${
                isLongStory && !lifeStoryExpanded ? 'line-clamp-4' : ''
              }`}>
                {t(person.lifeStory)}
              </p>
              {isLongStory && !lifeStoryExpanded && (
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>
            {isLongStory && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => setLifeStoryExpanded(!lifeStoryExpanded)}
                  className="px-4 py-1.5 rounded-xl border border-purple-200 text-[13px] font-semibold text-purple-800 hover:bg-purple-50 transition-all shadow-sm"
                >
                  {lifeStoryExpanded ? t('收起生平') : t('展开完整生平')}
                </button>
              </div>
            )}
          </div>

          {/* 3. 核心教风 */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-amber-900">
              <Sparkles className="w-5 h-5 text-amber-700" />
              <span>{t('💡 核心教风与宗理玄旨')}</span>
            </h2>
            <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
              {t(person.teachings)}
            </p>
          </div>

          {/* 4. 名言警策 */}
          {person.quotes && person.quotes.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('📜 祖师名言警策与机锋开示')}</span>
                <span className="text-xs text-rose-700/60">({t('共')} {person.quotes.length} {t('则')})</span>
              </h2>
              <div className="space-y-3">
                {person.quotes.map((quote: string, idx: number) => {
                  const isHidden = person.quotes.length > 5 && !quotesExpanded && idx >= 5;
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
              {person.quotes.length > 5 && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setQuotesExpanded(!quotesExpanded)}
                    className="px-4 py-1.5 rounded-xl border border-rose-200 text-[13px] font-semibold text-rose-800 hover:bg-rose-50 transition-all shadow-sm"
                  >
                    {quotesExpanded ? t('收起') : `${t('展开全部名言')} (${t('共')} ${person.quotes.length} ${t('则')})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. 该祖师机锋公案合集 */}
          {personKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                  <MessageSquare className="w-5 h-5 text-rose-700" />
                  <span>{t('❓')} {t(person.name)} {t('机锋公案全集')}</span>
                  <span className="text-xs text-rose-700/60 font-mono">({personKoans.length} {t('则')})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/koan`)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('在公案库中筛选')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={personKoans.slice(0, 6).map((q: any) => ({
                  id: q.id,
                  title: q.question,
                  summary: q.answer,
                  href: `/koan/${q.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 6. 传授修行法门 */}
          {personMethods.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 倡导与传授之修行法门')}</span>
                <span className="text-xs text-sky-700/60 font-mono">({personMethods.length})</span>
              </h2>
              <LinkCardGrid
                items={personMethods.map((m: any) => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 7. 阐发核心概念 */}
          {personConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🏷️ 阐发之宗门核心概念')}</span>
                <span className="text-xs text-purple-700/60 font-mono">({personConcepts.length})</span>
              </h2>
              <LinkCardGrid
                items={personConcepts.slice(0, 6).map((rc: any) => ({
                  id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${rc.id}`
                }))}
                variant="purple"
                columns={3}
              />
            </div>
          )}

          {/* 8. 传世经典与开示法要 */}
          {person.classics && person.classics.length > 0 && (
             <>
             {person.relatedBooks && person.relatedBooks.length > 0 && <GlossaryCard sourceIds={person.relatedBooks} />}
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 传世经典与语录著述')}</span>
             </h2>

             <LinkCardGrid
               items={person.classics.map((classicName: string, idx: number) => {
                 const rel = person.relatedBooks ?? [];
                 const aliased = CLASSIC_ALIAS[classicName];
                 if (aliased) { const ab = manifest.find(m => m.id === aliased); return { id: aliased, title: classicName, summary: ab?.author, href: ab ? `/classics/${aliased}` : '#' }; }
                 const norm = (s: string) => s.replace(/[《》\s（）()]/g, '');
                 const cn = norm(classicName);
                 const book =
                   manifest.find(m => rel.includes(m.id) && (m.title === classicName || norm(m.title) === cn)) ||
                   manifest.find(m => rel.includes(m.id) && (m.title.includes(classicName) || classicName.includes(m.title) || norm(m.title).includes(cn) || cn.includes(norm(m.title)))) ||
                   manifest.find(m => rel.includes(m.id) && m.id === classicName);
                 const bookId = book?.id;
                 return { id: bookId || `c${idx}`, title: classicName, summary: book?.author, href: book ? `/classics/${book.id}` : '#' };
               }).filter((item: any) => item.href !== '#')}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 9. 相关问答 */}
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
                initialLimit={6}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(prevPerson || nextPerson) && (
            <PrevNextNav
              prev={prevPerson ? { id: prevPerson.id, title: prevPerson.title, href: `/persons/${prevPerson.id}` } : null}
              next={nextPerson ? { id: nextPerson.id, title: nextPerson.title, href: `/persons/${nextPerson.id}` } : null}
            />
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
