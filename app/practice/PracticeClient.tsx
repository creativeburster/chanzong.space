'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';
import manifest from '@/manifest.json';
import {
  Sparkles,
  Compass,
  Home,
  Flame,
  Wind,
  Bell,
  Layers,
  ArrowRight,
  BookOpen,
  Maximize2,
  Users,
  Feather,
} from 'lucide-react';
import { DailyKoanCard } from '@/components/practice/DailyKoanCard';
import { DigitalWoodenFish } from '@/components/practice/DigitalWoodenFish';
import { DigitalMalaBeads } from '@/components/practice/DigitalMalaBeads';
import { MeditationTimer } from '@/components/practice/MeditationTimer';
import { BreathPacer } from '@/components/practice/BreathPacer';
import { SingingBowl } from '@/components/practice/SingingBowl';
import { SutraCopying } from '@/components/practice/SutraCopying';
import { ZenSoundscapes } from '@/components/practice/ZenSoundscapes';
import { ZenSandGarden } from '@/components/practice/ZenSandGarden';
import { HuaTouInquiry } from '@/components/practice/HuaTouInquiry';
import { LetGoAffliction } from '@/components/practice/LetGoAffliction';
import { ZenPracticeLog } from '@/components/practice/ZenPracticeLog';
import { ZenFocusTimer } from '@/components/practice/ZenFocusTimer';
import { ZenBreathCounter } from '@/components/practice/ZenBreathCounter';
import { ZenMindfulnessBell } from '@/components/practice/ZenMindfulnessBell';
import { PracticeMethodPill } from '@/components/practice/PracticeMethodPill';
import { ZenImmersionModal } from '@/components/practice/ZenImmersionModal';
import { LinkCardGrid } from '@/components/InternalLinkCards';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { useLang } from '@/context/LangContext';

export default function PracticeClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [immersionOpen, setImmersionOpen] = useState(false);
  const { t, getHref } = useLang();
  const [activeTab, setActiveTab] = useState<
    | 'all'
    | 'focus'
    | 'breath_counter'
    | 'bell'
    | 'koan'
    | 'muyu'
    | 'mala'
    | 'bowl'
    | 'meditation'
    | 'breath'
    | 'huatou'
    | 'sand'
    | 'letgo'
    | 'sutra'
    | 'log'
    | 'soundscape'
  >('all');

  const tabs = [
    { id: 'all', label: '全景禅房' },
    { id: 'focus', label: '禅门番茄' },
    { id: 'breath_counter', label: '止观数息' },
    { id: 'bell', label: '觉醒钟' },
    { id: 'bowl', label: '颂钵音浴' },
    { id: 'soundscape', label: '古刹天籁' },
    { id: 'muyu', label: '电子木鱼' },
    { id: 'mala', label: '菩提念珠' },
    { id: 'koan', label: '每日机锋' },
    { id: 'meditation', label: '坐禅入定' },
    { id: 'breath', label: '调息律动' },
    { id: 'huatou', label: '参看话头' },
    { id: 'letgo', label: '万缘放下' },
    { id: 'sand', label: '枯山水沙盘' },
    { id: 'sutra', label: '指尖抄经' },
    { id: 'log', label: '修持印谱' },
  ];

  // 推荐核心实修法门
  const practiceMethods = ZEN_METHODS.filter((m) =>
    ['kanhuatou', 'mozhao', 'zuochan', 'liumiaomen', 'nianfo-chan', 'daily-zen'].includes(m.id)
  );

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      <Sidebar
        onOpenSearch={() => setSearchOpen(true)}
        classicsCount={manifest.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          {/* 面包屑导航与沉浸开关 */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Breadcrumb
              items={[
                { label: t('首页'), href: '/' },
                { label: t('禅修静心工坊') },
              ]}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setImmersionOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs bg-amber-900 text-amber-100 font-bold px-3.5 py-1.5 rounded-xl hover:bg-amber-800 transition-all shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{t('进入全屏沉浸禅房')}</span>
              </button>
              <Link
                prefetch={false}
                href={getHref('/')}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-800 font-bold hover:underline bg-white px-3 py-1.5 rounded-xl border border-amber-900/10 shadow-2xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('返回首页')}</span>
              </Link>
            </div>
          </div>

          <div className="space-y-10">
            {/* 页头 Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold shadow-2xs">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>{t('理行合一 · 十五大数字修持法宝')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-zen text-slate-900 tracking-wide">
                {t('禅修静心工坊')}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {t('狂心顿歇，歇即菩提。以禅门正宗法门为规矩，融通止观数息、参看话头、坐禅入定、颂钵音浴与古刹天籁，借事修显理悟，依行证真。')}
              </p>

              {/* 选项卡导航 */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-4 flex-wrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-900 text-amber-100 shadow-md scale-105'
                        : 'bg-white text-slate-700 border border-amber-900/10 hover:bg-amber-50'
                    }`}
                  >
                    {t(tab.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* 新增：宗门实修总纲与三大阶次导引 */}
            {activeTab === 'all' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-900/10 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-900/10">
                  <div className="flex items-center space-x-2.5">
                    <Layers className="w-5 h-5 text-amber-800" />
                    <h2 className="text-lg sm:text-xl font-bold font-serif-zen text-slate-900">
                      {t('🏛️ 宗门实修总纲 · 三大行持阶次')}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {t('从息入心 · 从定入慧')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* 初阶：初机调心 */}
                  <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-900 text-white text-xs flex items-center justify-center font-mono">
                          1
                        </span>
                        <span>{t('初阶 · 初机调心')}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t('心如野马散乱，首重调身调息。借数息之规与清脆法器收摄六根，使粗浮尘劳渐归澄澈。')}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-900/10 flex items-center justify-between text-xs">
                      <span className="text-stone-500">{t('推荐下手')}</span>
                      <button
                        onClick={() => setActiveTab('breath_counter')}
                        className="text-amber-800 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>{t('止观数息')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 中阶：正修入定 */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs flex items-center justify-center font-mono">
                          2
                        </span>
                        <span>{t('中阶 · 正修入定')}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t('调息既稳，进修坐禅入定与音色三昧。外息诸缘、内心无喘，体会能所双亡之清净境界。')}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-between text-xs">
                      <span className="text-stone-500">{t('推荐下手')}</span>
                      <button
                        onClick={() => setActiveTab('meditation')}
                        className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>{t('坐禅入定')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 高阶：宗门破关 */}
                  <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200/50 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-800 text-white text-xs flex items-center justify-center font-mono">
                          3
                        </span>
                        <span>{t('高阶 · 宗门破关')}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t('定力坚固后，当向话头深处起大疑情。虚空粉碎、绝后再苏，彻见本来面目！')}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-purple-900/10 flex items-center justify-between text-xs">
                      <span className="text-stone-500">{t('推荐下手')}</span>
                      <button
                        onClick={() => setActiveTab('huatou')}
                        className="text-purple-800 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>{t('参看话头')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 核心修持内容网格（每项配备理法渊源胶囊） */}
            <div className="space-y-12">
              {/* 1. 深度专注力双雄：禅门深度番茄钟 & 止观数息专注室 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'focus') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="丛林香檠禅时制 · 一炷香的工夫"
                      summary="坐一炷香、参一炷香，定相续不乱"
                      links={[
                        { label: '坐禅法', href: '/methods/zuochan', type: 'method' },
                        { label: '六祖坛经', href: '/classics/tanjing', type: 'classic' },
                      ]}
                    />
                    <ZenFocusTimer />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'breath_counter') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="天台智者大师《六妙法门》"
                      summary="数、随、止、观、还、净之初门基石"
                      links={[
                        { label: '六妙门', href: '/methods/liumiaomen', type: 'method' },
                        { label: '六妙法门原典', href: '/classics/liumiaomen', type: 'classic' },
                      ]}
                    />
                    <ZenBreathCounter />
                  </section>
                )}
              </div>

              {/* 2. 颂钵音浴殿 & 正念觉醒钟 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'bowl') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="《首楞严经》观世音菩萨耳根圆通章"
                      summary="初于闻中，入流亡所，动静二相，了然不生"
                      links={[
                        { label: '耳根圆通', href: '/methods/ergen-yuantong', type: 'method' },
                        { label: '首楞严经', href: '/classics/lengyanjing', type: 'classic' },
                      ]}
                    />
                    <SingingBowl />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'bell') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="禅门钟板警策清规"
                      summary="闻钟声，烦恼轻，智慧长，菩提生"
                      links={[
                        { label: '正念', href: '/concepts/zhengnian', type: 'concept' },
                        { label: '日常生活禅', href: '/methods/daily-zen', type: 'method' },
                      ]}
                    />
                    <ZenMindfulnessBell />
                  </section>
                )}
              </div>

              {/* 3. 古刹天籁十四大白噪音混音器 */}
              {(activeTab === 'all' || activeTab === 'soundscape') && (
                <section className="space-y-4">
                  <PracticeMethodPill
                    originTitle="苏轼参东林常总禅师悟道偈"
                    summary="溪声便是广长舌，山色岂非清净身。夜来八万四千偈，他日如何举似人"
                    links={[
                      { label: '苏轼', href: '/persons/su-shi', type: 'person' },
                      { label: '自然禅', href: '/methods/daily-zen', type: 'method' },
                    ]}
                  />
                  <ZenSoundscapes />
                </section>
              )}

              {/* 4. 每日机锋卡片 */}
              {(activeTab === 'all' || activeTab === 'koan') && (
                <section className="space-y-4">
                  <PracticeMethodPill
                    originTitle="禅宗千七百则公案机锋宝库"
                    summary="不涉言诠，直下承当，电光石火中剿绝情识"
                    links={[
                      { label: '公案全库 (205则)', href: '/koan', type: 'koan' },
                      { label: '禅宗无门关', href: '/classics/wumenguan', type: 'classic' },
                    ]}
                  />
                  <DailyKoanCard />
                </section>
              )}

              {/* 5. 电子木鱼与菩提念珠 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'muyu') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="丛林百丈清规木鱼法器制"
                      summary="木鱼昼夜不合目，以此警策学者不可放逸懈怠"
                      links={[
                        { label: '止观法门', href: '/methods/liumiaomen', type: 'method' },
                        { label: '百丈怀海', href: '/persons/baizhang', type: 'person' },
                      ]}
                    />
                    <DigitalWoodenFish />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'mala') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="百八数珠断烦恼真诠"
                      summary="掐珠提撕自性佛，一声佛号一声心"
                      links={[
                        { label: '念佛禅', href: '/methods/nianfo-chan', type: 'method' },
                        { label: '永嘉证道歌', href: '/classics/zhengdaoge', type: 'classic' },
                      ]}
                    />
                    <DigitalMalaBeads />
                  </section>
                )}
              </div>

              {/* 6. 参看话头疑情室 与 坐禅入定 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'huatou') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="宋代大慧宗杲看话禅心要"
                      summary="单提狗子无佛性，如咬铁酸馅，疑情爆发即是悟门"
                      links={[
                        { label: '看话禅法门', href: '/methods/kanhuatou', type: 'method' },
                        { label: '赵州狗子公案', href: '/koan/koan-1', type: 'koan' },
                        { label: '大慧宗杲', href: '/persons/dahui-zonggao', type: 'person' },
                      ]}
                    />
                    <HuaTouInquiry />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'meditation') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="菩提达摩面壁与长芦宗赜《坐禅仪》"
                      summary="端身正坐，息诸妄缘，心同虚空，不挂一缕"
                      links={[
                        { label: '正宗坐禅仪', href: '/methods/zuochan', type: 'method' },
                        { label: '菩提达摩', href: '/persons/bodhidharma', type: 'person' },
                      ]}
                    />
                    <MeditationTimer />
                  </section>
                )}
              </div>

              {/* 7. 枯山水沙盘与万缘放下化烬池 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'sand') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="一砂一极乐 · 枯山水虚空境界"
                      summary="无水而见浩渺江河，无山而现巍峨须弥"
                      links={[
                        { label: '不二法门', href: '/concepts/buer', type: 'concept' },
                        { label: '日常生活禅', href: '/methods/daily-zen', type: 'method' },
                      ]}
                    />
                    <ZenSandGarden />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'letgo') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="三祖僧璨大师《信心铭》"
                      summary="得失是非，一时放却。二由一有，一亦莫守"
                      links={[
                        { label: '信心铭原文', href: '/classics/xinxinming', type: 'classic' },
                        { label: '无住生心', href: '/concepts/wuzhu', type: 'concept' },
                      ]}
                    />
                    <LetGoAffliction />
                  </section>
                )}
              </div>

              {/* 8. 指尖抄经阁与修持印谱 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'sutra') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="受持读诵 · 书写流通功德"
                      summary="一笔一画专注安住，经文入心即是熏修法身"
                      links={[
                        { label: '般若波罗蜜多心经', href: '/classics/xinjing', type: 'classic' },
                        { label: '金刚般若波罗蜜经', href: '/classics/jingangjing', type: 'classic' },
                      ]}
                    />
                    <SutraCopying />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'log') && (
                  <section className="space-y-4">
                    <PracticeMethodPill
                      originTitle="宗门印可与功德回向"
                      summary="日日精进，工夫成片，历历分明"
                      links={[
                        { label: '日常行持', href: '/methods/daily-zen', type: 'method' },
                        { label: '知识图谱', href: '/graph', type: 'concept' },
                      ]}
                    />
                    <ZenPracticeLog />
                  </section>
                )}
              </div>

              {/* 9. 经典调息律动盘 */}
              {(activeTab === 'all' || activeTab === 'breath') && (
                <section className="space-y-4">
                  <PracticeMethodPill
                    originTitle="调身、调息、调心三调秘钥"
                    summary="息调则心宁，心宁则神寂，入道之前阶"
                    links={[
                      { label: '六妙门', href: '/methods/liumiaomen', type: 'method' },
                    ]}
                  />
                  <BreathPacer />
                </section>
              )}
            </div>

            {/* 新增：底部实修相应 · 全局法门与经典网络推荐卡片 */}
            <div className="pt-8 border-t border-amber-900/10 space-y-6">
              <div className="flex items-center space-x-2 text-slate-900 font-bold font-serif-zen text-lg">
                <Compass className="w-5 h-5 text-sky-600" />
                <h2>{t('🔗 实修相应 · 宗门法门网络')}</h2>
              </div>
              <LinkCardGrid
                items={practiceMethods.map((m) => ({
                  id: m.id,
                  title: m.title,
                  summary: m.summary?.slice(0, 60),
                  href: `/methods/${m.id}`,
                }))}
                variant="sky"
                columns={3}
              />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      {/* 全屏沉浸定境禅房弹窗 */}
      <ZenImmersionModal
        isOpen={immersionOpen}
        onClose={() => setImmersionOpen(false)}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={manifest}
      />
    </div>
  );
}
