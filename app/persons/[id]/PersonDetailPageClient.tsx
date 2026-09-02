'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Quote, Sparkles, Compass, ShieldCheck, Users, Share2, Tag, Lightbulb } from 'lucide-react';
import { GlossaryCard } from '@/components/GlossaryCard';
import { LinkCardGrid, PrevNextNav } from '@/components/InternalLinkCards';
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
}

export default function PersonDetailPageClient({ params }: PageProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [lifeStoryExpanded, setLifeStoryExpanded] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(false);
  const [faqsExpanded, setFaqsExpanded] = useState(false);
  const { t, getHref } = useLang();

  const person = ZEN_PERSONS.find((p) => p.id === params.id);
  if (!person) {
    notFound();
  }

  const isLongStory = person.lifeStory && person.lifeStory.length > 280;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
          <Breadcrumb items={[{ label: '人物', href: '/persons' }, { label: person.name }]} />

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
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-[15px] font-semibold text-slate-600 mr-2">法脉关联:</span>
                {person.relatedPersons.map(rid => {
                  const rp = ZEN_PERSONS.find(p => p.id === rid);
                  if (!rp) return null;
                  return (
                    <Link prefetch={false} key={rid} href={getHref(`/persons/${rid}`)} className="inline-flex px-3 py-1.5 rounded-full text-[13px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors">
                      {t(rp.name)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

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
                {(person.quotes.length > 5 && !quotesExpanded ? person.quotes.slice(0, 5) : person.quotes).map((quote, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-50 border-l-4 border-amber-500 text-[15px] font-serif-zen italic text-zinc-800"
                  >
                    “{t(quote)}”
                  </div>
                ))}
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

          {/* 6. 相关概念 */}
          {person.relatedConcepts && person.relatedConcepts.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
               <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-purple-900">
                <Tag className="w-5 h-5 text-purple-700" />
                <span>{t('🏷️ 相关核心概念')}</span>
              </h2>
              <LinkCardGrid
                items={person.relatedConcepts.map(cid => {
                  const rc = ZEN_CONCEPTS.find(c => c.id === cid);
                  return rc ? { id: rc.id, title: rc.title, summary: rc.summary?.slice(0, 60), href: `/concepts/${cid}` } : null;
                }).filter(Boolean) as any[]}
                variant="purple"
              />
            </div>
          )}

          {/* 6b. 相关法门 */}
          {person.relatedMethods && person.relatedMethods.length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-sky-900">
                <Compass className="w-5 h-5 text-sky-700" />
                <span>{t('🧘 相关修持法门')}</span>
              </h2>
              <LinkCardGrid
                items={person.relatedMethods.map(mid => {
                  const rm = ZEN_METHODS.find(m => m.id === mid);
                  return rm ? { id: rm.id, title: rm.title, summary: rm.summary?.slice(0, 60), href: `/methods/${mid}` } : null;
                }).filter(Boolean) as any[]}
                variant="sky"
              />
            </div>
          )}

          {/* 6c. 相关公案 */}
          {ZEN_KOANS.filter(q => q.relatedPersons.includes(person.id)).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-rose-900">
                <Quote className="w-5 h-5 text-rose-700" />
                <span>{t('❓ 相关公案机锋')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_KOANS.filter(q => q.relatedPersons.includes(person.id)).map(q => ({
                  id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}`
                }))}
                variant="rose"
                columns={3}
              />
            </div>
          )}

          {/* 5. 传世经典 */}
          {person.classics && person.classics.length > 0 && (
             <>
             {person.relatedBooks && person.relatedBooks.length > 0 && <GlossaryCard sourceIds={person.relatedBooks} />}
             <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
             <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-slate-900">
               <BookOpen className="w-5 h-5 text-amber-700" />
               <span>{t('📚 传世经典与开示法要')}</span>
             </h2>

             <LinkCardGrid
               items={person.classics.map((classicName, idx) => {
                 // 按书名匹配取链接（修复按下标配对导致的串链）；
                 // 经典名也可能直接是 manifest id（部分旧数据用拼音 slug）
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
               }).filter(item => item.href !== '#')}
               variant="amber"
             />
           </div>
             </>
          )}

          {/* 相关问答 */}
          {ZEN_FAQS.filter(f => f.relatedBooks && person.relatedBooks && f.relatedBooks.some(b => person.relatedBooks!.includes(b))).length > 0 && (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-4">
              <h2 className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-900">
                <Lightbulb className="w-5 h-5 text-emerald-700" />
                <span>{t('💡 相关参究问答')}</span>
              </h2>
              <LinkCardGrid
                items={ZEN_FAQS.filter(f => f.relatedBooks && person.relatedBooks && f.relatedBooks.some(b => person.relatedBooks!.includes(b))).map(f => ({
                  id: f.id, title: f.question, summary: f.answer?.slice(0, 60), href: `/faq`
                }))}
                variant="emerald"
                columns={3}
                initialLimit={6}
              />
            </div>
          )}

          {/* 上下篇导航 */}
          {(() => {
            const idx = ZEN_PERSONS.findIndex(p => p.id === person.id);
            const prev = idx > 0 ? { id: ZEN_PERSONS[idx - 1].id, title: ZEN_PERSONS[idx - 1].name, href: `/persons/${ZEN_PERSONS[idx - 1].id}` } : null;
            const next = idx < ZEN_PERSONS.length - 1 ? { id: ZEN_PERSONS[idx + 1].id, title: ZEN_PERSONS[idx + 1].name, href: `/persons/${ZEN_PERSONS[idx + 1].id}` } : null;
            return <PrevNextNav prev={prev} next={next} />;
          })()}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
