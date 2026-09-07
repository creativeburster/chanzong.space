'use client';

import { ReadingThemeBar } from '@/components/ReadingThemeBar';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Route, AlertTriangle, Users, Tag, Compass, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';
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

export default function MethodDetailPageClient({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [pitfallsExpanded, setPitfallsExpanded] = useState(false);
  const { t, getHref } = useLang();

  const method = ZEN_METHODS.find((m) => m.id === params.id);
  if (!method) {
    notFound();
  }

  // 1. 同门其他修持法门推荐
  const otherMethods = useMemo(() => {
    return ZEN_METHODS.filter(m => {
      if (m.id === method.id) return false;
      // 共享概念或祖师
      const shareConcept = m.relatedConcepts && method.relatedConcepts && m.relatedConcepts.some(c => method.relatedConcepts.includes(c));
      const sharePerson = m.relatedPersons && method.relatedPersons && m.relatedPersons.some(p => method.relatedPersons.includes(p));
      return shareConcept || sharePerson;
    }).slice(0, 4);
  }, [method]);

  // 2. 契合此法门的机锋公案印证
  const relatedKoans = useMemo(() => {
    return ZEN_KOANS.filter(q => {
      const matchConcept = q.relatedConcepts && method.relatedConcepts && q.relatedConcepts.some(c => method.relatedConcepts.includes(c));
      const matchPerson = q.relatedPersons && method.relatedPersons && q.relatedPersons.some(p => method.relatedPersons.includes(p));
      const matchText = q.question.includes(method.title) || q.answer.includes(method.title);
      return matchConcept || matchPerson || matchText;
    }).slice(0, 6);
  }, [method]);

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
                {(method.steps.length > 5 && !stepsExpanded ? method.steps.slice(0, 5) : method.steps).map((step, idx) => (
                  <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-green-500 before:rounded-full">
                    <p className="text-[17px] text-slate-700 font-serif-zen leading-relaxed">
                      {t(step)}
                    </p>
                  </div>
                ))}
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
                {(method.pitfalls.length > 4 && !pitfallsExpanded ? method.pitfalls.slice(0, 4) : method.pitfalls).map((pitfall, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-rose-50 border-l-4 border-rose-500 text-[15px] font-serif-zen text-rose-800"
                  >
                    {t(pitfall)}
                  </div>
                ))}
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
          {method.relatedPersons && method.relatedPersons.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
                <Users className="w-5 h-5 text-blue-700" />
                <span>{t('👥 传授祖师与门风领袖')}</span>
              </h2>
              <LinkCardGrid
                items={method.relatedPersons.map(pid => {
                  const rp = ZEN_PERSONS.find(p => p.id === pid);
                  return rp ? { id: rp.id, title: rp.name, summary: rp.title, href: `/persons/${pid}` } : null;
                }).filter(Boolean) as any[]}
                variant="blue"
              />
            </div>
          )}

          {/* 5. 核心关联概念 */}
          {method.relatedConcepts && method.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🔗 依凭之核心义理概念')}</span>
              </h2>
              <LinkCardGrid
                items={method.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  return rc ? { id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${cid}` } : null;
                }).filter(Boolean) as any[]}
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
               items={method.relatedBooks.map(bookId => {
                 const book = manifest.find(m => m.id === bookId);
                 return { id: bookId, title: book ? book.title : bookId, summary: book?.author, href: `/classics/${bookId}` };
               })}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 9. 相关问答 */}
          {ZEN_FAQS.filter(f => f.relatedBooks && method.relatedBooks && f.relatedBooks.some(b => method.relatedBooks!.includes(b))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </h2>
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
