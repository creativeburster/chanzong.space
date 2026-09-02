'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  HeartHandshake,
  Moon,
  Disc,
  Wind,
  PenTool,
  CloudRain,
  Flame,
} from 'lucide-react';
import { DailyKoanCard } from '@/components/practice/DailyKoanCard';
import { DigitalWoodenFish } from '@/components/practice/DigitalWoodenFish';
import { DigitalMalaBeads } from '@/components/practice/DigitalMalaBeads';
import { MeditationTimer } from '@/components/practice/MeditationTimer';
import { BreathPacer } from '@/components/practice/BreathPacer';
import { SingingBowl } from '@/components/practice/SingingBowl';
import { SutraCopying } from '@/components/practice/SutraCopying';
import { ZenSoundscapes } from '@/components/practice/ZenSoundscapes';
import { useLang } from '@/context/LangContext';

export default function PracticeClient() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<
    'all' | 'koan' | 'muyu' | 'mala' | 'meditation' | 'breath' | 'bowl' | 'sutra' | 'soundscape'
  >('all');

  const tabs = [
    { id: 'all', label: '全景禅房' },
    { id: 'koan', label: '每日机锋' },
    { id: 'muyu', label: '电子木鱼' },
    { id: 'mala', label: '菩提念珠' },
    { id: 'meditation', label: '坐禅入定' },
    { id: 'breath', label: '呼吸调息' },
    { id: 'bowl', label: '颂钵音浴' },
    { id: 'sutra', label: '指尖抄经' },
    { id: 'soundscape', label: '古刹天籁' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* 页头 Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold shadow-xs">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>{t('直指人心 · 行住坐卧皆是禅')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-zen text-slate-900 tracking-wide">
            {t('禅修静心工坊')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t('狂心顿歇，歇即菩提。集结八大数字禅修法宝：机锋灵签、仿真木鱼、菩提念珠、坐禅入定、六妙门调息、青铜颂钵、指尖抄经与古刹天籁，随时随地安住清净自性。')}
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
          {/* 1. 每日机锋 */}
          {(activeTab === 'all' || activeTab === 'koan') && (
            <section className="space-y-4">
              <DailyKoanCard />
            </section>
          )}

          {/* 2. 电子木鱼与菩提念珠 */}
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

          {/* 3. 坐禅入定与呼吸调息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {(activeTab === 'all' || activeTab === 'meditation') && (
              <section className="space-y-4">
                <MeditationTimer />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'breath') && (
              <section className="space-y-4">
                <BreathPacer />
              </section>
            )}
          </div>

          {/* 4. 颂钵音浴与古刹天籁 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {(activeTab === 'all' || activeTab === 'bowl') && (
              <section className="space-y-4">
                <SingingBowl />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'soundscape') && (
              <section className="space-y-4">
                <ZenSoundscapes />
              </section>
            )}
          </div>

          {/* 5. 指尖抄经阁 */}
          {(activeTab === 'all' || activeTab === 'sutra') && (
            <section className="space-y-4">
              <SutraCopying />
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
