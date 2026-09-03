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
import { useLang } from '@/context/LangContext';

export default function PracticeClient() {
  const [searchOpen, setSearchOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      <Sidebar
        onOpenSearch={() => setSearchOpen(true)}
        classicsCount={manifest.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          {/* 面包屑导航 */}
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb
              items={[
                { label: t('首页'), href: '/' },
                { label: t('禅修静心工坊') },
              ]}
            />
            <Link
              prefetch={false}
              href={getHref('/')}
              className="inline-flex items-center space-x-1.5 text-xs text-amber-800 font-bold hover:underline bg-white px-3 py-1.5 rounded-xl border border-amber-900/10 shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('返回知识库首页')}</span>
            </Link>
          </div>

          <div className="space-y-10">
            {/* 页头 Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold shadow-xs">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>{t('直指人心 · 十五大数字禅修法宝')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-zen text-slate-900 tracking-wide">
                {t('禅修静心工坊')}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {t('狂心顿歇，歇即菩提。集结禅门番茄钟、止观数息专注室、梅村觉醒钟、五行脉轮颂钵、十四大古刹天籁、仿真木鱼念珠、机锋灵签、看话头、枯山水与指尖抄经。')}
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

            {/* 核心内容网格 */}
            <div className="space-y-12">
              {/* 1. 深度专注力双雄：禅门深度番茄钟 & 止观数息专注室 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'focus') && (
                  <section className="space-y-4">
                    <ZenFocusTimer />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'breath_counter') && (
                  <section className="space-y-4">
                    <ZenBreathCounter />
                  </section>
                )}
              </div>

              {/* 2. 颂钵音浴殿 & 正念觉醒钟 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'bowl') && (
                  <section className="space-y-4">
                    <SingingBowl />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'bell') && (
                  <section className="space-y-4">
                    <ZenMindfulnessBell />
                  </section>
                )}
              </div>

              {/* 3. 古刹天籁十四大白噪音混音器 */}
              {(activeTab === 'all' || activeTab === 'soundscape') && (
                <section className="space-y-4">
                  <ZenSoundscapes />
                </section>
              )}

              {/* 4. 每日机锋卡片 */}
              {(activeTab === 'all' || activeTab === 'koan') && (
                <section className="space-y-4">
                  <DailyKoanCard />
                </section>
              )}

              {/* 5. 电子木鱼与菩提念珠 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'muyu') && (
                  <section className="space-y-4">
                    <DigitalWoodenFish />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'mala') && (
                  <section className="space-y-4">
                    <DigitalMalaBeads />
                  </section>
                )}
              </div>

              {/* 6. 参看话头疑情室 与 坐禅入定 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'huatou') && (
                  <section className="space-y-4">
                    <HuaTouInquiry />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'meditation') && (
                  <section className="space-y-4">
                    <MeditationTimer />
                  </section>
                )}
              </div>

              {/* 7. 枯山水沙盘与万缘放下化烬池 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'sand') && (
                  <section className="space-y-4">
                    <ZenSandGarden />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'letgo') && (
                  <section className="space-y-4">
                    <LetGoAffliction />
                  </section>
                )}
              </div>

              {/* 8. 指尖抄经阁与修持印谱 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {(activeTab === 'all' || activeTab === 'sutra') && (
                  <section className="space-y-4">
                    <SutraCopying />
                  </section>
                )}

                {(activeTab === 'all' || activeTab === 'log') && (
                  <section className="space-y-4">
                    <ZenPracticeLog />
                  </section>
                )}
              </div>

              {/* 9. 经典调息律动盘 */}
              {(activeTab === 'all' || activeTab === 'breath') && (
                <section className="space-y-4">
                  <BreathPacer />
                </section>
              )}
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
