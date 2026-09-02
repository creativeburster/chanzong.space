'use client';

import React, { useState } from 'react';
import { Sparkles, HeartHandshake, Compass, Moon } from 'lucide-react';
import { DailyKoanCard } from '@/components/practice/DailyKoanCard';
import { DigitalWoodenFish } from '@/components/practice/DigitalWoodenFish';
import { MeditationTimer } from '@/components/practice/MeditationTimer';
import { useLang } from '@/context/LangContext';

export default function PracticeClient() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<'all' | 'koan' | 'muyu' | 'meditation'>('all');

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* 页头 Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold shadow-xs">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>{t('直指人心 · 当下即是')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-zen text-slate-900 tracking-wide">
            {t('禅修静心工坊')}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            {t('狂心顿歇，歇即菩提。在此通过今日机锋参究、电子木鱼静心、坐禅数息计时，在纷扰世间找回清净自性。')}
          </p>

          {/* 选项卡切换 */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: '全景禅房' },
              { id: 'koan', label: '每日机锋' },
              { id: 'muyu', label: '电子木鱼' },
              { id: 'meditation', label: '坐禅入定' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
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
              <div className="flex items-center justify-between max-w-2xl mx-auto px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{t('参究法门')}</span>
                </span>
              </div>
              <DailyKoanCard />
            </section>
          )}

          {/* 2. 电子木鱼与坐禅计时并排 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {(activeTab === 'all' || activeTab === 'muyu') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between max-w-xl mx-auto px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>{t('解压持念')}</span>
                  </span>
                </div>
                <DigitalWoodenFish />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'meditation') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between max-w-xl mx-auto px-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                    <Moon className="w-4 h-4 text-amber-600" />
                    <span>{t('息虑凝神')}</span>
                  </span>
                </div>
                <MeditationTimer />
              </section>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
