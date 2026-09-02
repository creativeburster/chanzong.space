'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Award, CheckCircle, Share2, Sparkles } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const ZenPracticeLog: React.FC = () => {
  const { t } = useLang();
  const [muyuCount, setMuyuCount] = useState<number>(0);
  const [malaCount, setMalaCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const muyu = parseInt(localStorage.getItem('zen_muyu_count') || '0', 10);
      const mala = parseInt(localStorage.getItem('zen_mala_count') || '0', 10);
      setMuyuCount(muyu);
      setMalaCount(mala);

      // 计算连续修行天数
      const today = new Date().toISOString().split('T')[0];
      const last = localStorage.getItem('zen_last_practice_date');
      const savedStreak = parseInt(localStorage.getItem('zen_streak_days') || '1', 10);

      if (last !== today) {
        localStorage.setItem('zen_last_practice_date', today);
        localStorage.setItem('zen_streak_days', String(savedStreak + 1));
        setStreakDays(savedStreak + 1);
      } else {
        setStreakDays(savedStreak);
      }
    } catch {}
  }, []);

  const handleShare = () => {
    const text = `【禅宗知识库 · 修行功课印谱】\n📅 今日修持：第 ${streakDays} 天\n🪷 电子木鱼：${muyuCount} 声\n📿 菩提念珠：${malaCount} 颗\n愿以此功德，普及于一切。我等与众生，皆共成佛道。\n来自：https://chanzong.space/practice`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-amber-50/60 via-white to-stone-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-900/20 shadow-md select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('一期一会 · 功不唐捐')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('每日修持印谱 · 回向卡')}
          </h3>
        </div>

        <button
          onClick={handleShare}
          className="px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? t('已复制') : t('复制印谱')}</span>
        </button>
      </div>

      {/* 印谱卡片 */}
      <div className="p-6 bg-white rounded-2xl border border-amber-200/80 shadow-sm space-y-4 font-serif-zen relative">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
          <span className="text-sm font-bold text-slate-800">
            {t('今日禅行纪录')}
          </span>
          <span className="text-xs text-amber-800 font-mono font-bold">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center py-2">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-2xl font-extrabold text-amber-950">{streakDays}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{t('连续修行天')}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-2xl font-extrabold text-amber-950">{muyuCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{t('木鱼功德数')}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <div className="text-2xl font-extrabold text-amber-950">{malaCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{t('捻珠持念颗')}</div>
          </div>
        </div>

        {/* 经典回向偈 */}
        <div className="text-xs text-slate-700 text-center leading-relaxed pt-2 border-t border-amber-900/10">
          {t('愿以此功德，普及于一切。我等与众生，皆共成佛道。')}
        </div>

        {/* 右下角红印 */}
        <div className="absolute right-4 bottom-3 border-2 border-red-700 text-red-700 p-1.5 rounded-lg text-[10px] font-bold tracking-widest rotate-[-10deg] opacity-80">
          {t('如法回向')}
        </div>
      </div>
    </div>
  );
};
