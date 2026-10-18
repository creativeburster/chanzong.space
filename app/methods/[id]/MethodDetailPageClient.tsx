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
import { BookOpen, Route, AlertTriangle, Users, Tag, Compass, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
const EntityMiniGraph = dynamic(
  () => import('@/components/graph/EntityMiniGraph').then((m) => m.EntityMiniGraph),
  { ssr: false }
);
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

interface PageProps {
  params: {
    id: string;
  };
  initialMethod?: any;
  otherMethods?: any[];
  relatedKoans?: any[];
  relatedPersonsData?: any[];
  relatedConceptsData?: any[];
  relatedFaqsData?: any[];
  prevMethod?: { id: string; title: string } | null;
  nextMethod?: { id: string; title: string } | null;
}

export default function MethodDetailPageClient({
  params,
  initialMethod,
  otherMethods: propOtherMethods = [],
  relatedKoans: propRelatedKoans = [],
  relatedPersonsData = [],
  relatedConceptsData = [],
  relatedFaqsData = [],
  prevMethod = null,
  nextMethod = null,
}: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [pitfallsExpanded, setPitfallsExpanded] = useState(false);
  const { t, getHref } = useLang();

  const method = initialMethod;
  if (!method) {
    notFound();
  }

  const otherMethods = propOtherMethods;
  const relatedKoans = propRelatedKoans;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <Breadcrumb items={[{ label: t('修行法门'), href: '/methods' }, { label: method.title }]} />
            <ReadingThemeBar />
          </div>

          {/* 1. 法门概览卡片 */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                {t('实修心法')}
              </span>
              {method.classicRef && (
                <span className="text-xs text-slate-500 font-bold">
                  {t('依凭:')} {t(method.classicRef)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif-zen text-slate-900 mb-6">
              🧘 {t(method.title)}
            </h1>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <p className="text-lg text-slate-700 font-serif-zen leading-relaxed">
                {t(method.summary)}
              </p>
              {method.origin && (
                <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-bold mr-2">{t('法门源流:')}</span>
                  {t(method.origin)}
                </div>
              )}
            </div>
          </div>

          {/* 1.1 法门知识实体档案 (Entity Semantic Infobox - 原生HTML三元组，极速索引) */}
          <section aria-label="法门实体关系档案" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Compass className="w-5 h-5 text-sky-600" />
                <span className="text-base">{t('📊 修持法门与知识实体档案')}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Method & Semantic Infobox</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-100">
                <tbody>
                  <tr className="hover:bg-slate-50/60">
                    <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                      {t('法门名称')}
                    </th>
                    <td className="py-2.5 px-4 font-serif-zen font-semibold text-sky-900">
                      🧘 {t(method.title)}
                    </td>
                  </tr>
                  {method.origin && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('法门源流')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-slate-700">
                        {t(method.origin)}
                      </td>
                    </tr>
                  )}
                  {method.classicRef && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('所依经论')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-amber-800 font-medium">
                        📖 {t(method.classicRef)}
                      </td>
                    </tr>
                  )}
                  {relatedPersonsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('传授祖师')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-blue-800">
                        <div className="flex flex-wrap gap-2">
                          {relatedPersonsData.map((p: any) => (
                            <Link
                              key={p.id}
                              prefetch={false}
                              href={getHref(`/persons/${p.id}`)}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 text-xs"
                            >
                              👤 {t(p.name)}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {relatedConceptsData.length > 0 && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('核心义理')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-purple-800">
                        <div className="flex flex-wrap gap-2">
                          {relatedConceptsData.map((c: any) => (
                            <Link
                              key={c.id}
                              prefetch={false}
                              href={getHref(`/concepts/${c.id}`)}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 text-xs"
                            >
                              🏷️ {t(c.title)}
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {method.steps && (
                    <tr className="hover:bg-slate-50/60">
                      <th scope="row" className="py-2.5 px-3 font-semibold text-slate-500 w-28 whitespace-nowrap bg-slate-50/50 rounded-l-lg">
                        {t('参修次第')}
                      </th>
                      <td className="py-2.5 px-4 font-serif-zen text-green-800">
                        {t('全')} {method.steps.length} {t('个循序要诀步骤')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 1.5 法门知识图谱微卡片 */}
          <EntityMiniGraph
            entityId={method.id}
            entityName={method.title}
            entityType="method"
            title={method.summary?.slice(0, 30)}
            relatedPersons={method.relatedPersons}
            relatedConcepts={method.relatedConcepts}
            relatedBooks={method.relatedBooks}
          />

          {/* 2. 修行步骤 */}
          {method.steps && method.steps.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-green-900">
                <Route className="w-5 h-5 text-green-700" />
                <span>{t('🛤️ 参修步骤与下手处')}</span>
                <span className="text-xs text-green-700/60">({t('共')} {method.steps.length} {t('步')})</span>
              </h2>
              <div className="space-y-3 pl-4">
                {method.steps.map((step: any, idx: number) => {
                  const isHidden = method.steps.length > 5 && !stepsExpanded && idx >= 5;
                  return (
                    <div
                      key={idx}
                      className={`${
                        isHidden ? 'hidden' : 'block'
                      } relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-500 before:rounded-full`}
                    >
                      <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed">
                        {t(step)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {method.steps.length > 5 && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setStepsExpanded(!stepsExpanded)}
                    className="px-4 py-1.5 rounded-xl border border-green-200 text-[13px] font-semibold text-green-800 hover:bg-green-50 transition-all shadow-sm"
                  >
                    {stepsExpanded ? t('收起') : `${t('展开全部步骤')} (${t('共')} ${method.steps.length} ${t('步')})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. 修行误区 */}
          {method.pitfalls && method.pitfalls.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
                <span>{t('⚠️ 常见禅病与警惕防范')}</span>
                <span className="text-xs text-rose-700/60">({t('共')} {method.pitfalls.length} {t('条')})</span>
              </h2>
              <div className="space-y-3">
                {method.pitfalls.map((pitfall: any, idx: number) => {
                  const isHidden = method.pitfalls.length > 4 && !pitfallsExpanded && idx >= 4;
                  return (
                    <div
                      key={idx}
                      className={`${
                        isHidden ? 'hidden' : 'block'
                      } p-5 rounded-2xl bg-rose-50 border-l-4 border-rose-500 text-[15px] font-serif-zen text-rose-800`}
                    >
                      {t(pitfall)}
                    </div>
                  );
                })}
              </div>
              {method.pitfalls.length > 4 && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setPitfallsExpanded(!pitfallsExpanded)}
                    className="px-4 py-1.5 rounded-xl border border-rose-200 text-[13px] font-semibold text-rose-800 hover:bg-rose-50 transition-all shadow-sm"
                  >
                    {pitfallsExpanded ? t('收起') : `${t('展开全部误区')} (${t('共')} ${method.pitfalls.length} ${t('条')})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. 代表祖师与门风传人 */}
          {relatedPersonsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 传授祖师与门风领袖')}</span>
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

          {/* 5. 核心关联概念 */}
          {relatedConceptsData.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 依凭之核心义理概念')}</span>
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

          {/* 6. 契合此法门的机锋公案 */}
          {relatedKoans.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                  <MessageSquare className="w-5 h-5 text-rose-700" />
                  <span>{t('❓ 契合此法门的公案机锋')}</span>
                  <span className="text-xs text-rose-700/60 font-mono">({relatedKoans.length})</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/koan`)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('公案库全集')}</span>
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

          {/* 7. 同宗修持法要推荐 */}
          {otherMethods.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                  <Compass className="w-5 h-5 text-sky-700" />
                  <span>{t('🧘 更多相应修持法门')}</span>
                </h2>
                <Link
                  prefetch={false}
                  href={getHref(`/methods`)}
                  className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>{t('全部法门')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <LinkCardGrid
                items={otherMethods.map(m => ({
                  id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}`
                }))}
                variant="sky"
              />
            </div>
          )}

          {/* 8. 载录此法门的传世经典 */}
          {method.relatedBooks && method.relatedBooks.length > 0 && (
             <>
             <GlossaryCard sourceIds={method.relatedBooks} />
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 载述此法门的传世经典')}</span>
             </h2>

             <LinkCardGrid
               items={method.relatedBooks.map((bookId: string) => {
                 const book = manifest.find(m => m.id === bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
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
                items={relatedFaqsData.map(f => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
                columns={3}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(prevMethod || nextMethod) && (
            <PrevNextNav
              prev={prevMethod ? { id: prevMethod.id, title: prevMethod.title, href: `/methods/${prevMethod.id}` } : null}
              next={nextMethod ? { id: nextMethod.id, title: nextMethod.title, href: `/methods/${nextMethod.id}` } : null}
            />
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
