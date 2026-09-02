'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind, Sparkles } from 'lucide-react';
import { useLang } from '@/context/LangContext';

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathPacer: React.FC = () => {
  const { t } = useLang();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [count, setCount] = useState<number>(4); // 当前阶段秒数
  const [cycleCount, setCycleCount] = useState<number>(1); // 数息观 1~10

  // 经典 4-4-6-2 禅修调息节奏
  const durations: Record<Phase, number> = {
    inhale: 4,
    hold: 4,
    exhale: 6,
    rest: 2,
  };

  const phaseNames: Record<Phase, { label: string; tip: string; color: string }> = {
    inhale: { label: '吸气', tip: '鼻吸绵绵 · 气沉丹田', color: 'from-amber-400 to-orange-500' },
    hold: { label: '止息', tip: '安住当下 · 觉照自性', color: 'from-amber-500 to-yellow-600' },
    exhale: { label: '呼气', tip: '徐徐吐尽 · 诸缘放下', color: 'from-emerald-400 to-teal-600' },
    rest: { label: '歇息', tip: '一念不生 · 空灵寂静', color: 'from-blue-400 to-indigo-500' },
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          // 切换下一阶段
          if (phase === 'inhale') {
            setPhase('hold');
            return durations.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return durations.exhale;
          } else if (phase === 'exhale') {
            setPhase('rest');
            return durations.rest;
          } else {
            setPhase('inhale');
            setCycleCount((c) => (c >= 10 ? 1 : c + 1));
            return durations.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(durations.inhale);
    setCycleCount(1);
  };

  const currentInfo = phaseNames[phase];

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-stone-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm text-center select-none">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4 text-left">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('六妙门 · 随息止观')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('呼吸调息律动盘')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
            {t('数息')}: {cycleCount} / 10
          </div>
          <button
            onClick={reset}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors"
            title={t('重置')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-6 text-left">
        {t('跟随光圈伸缩节奏调和气息：吸气 4s → 止息 4s → 呼气 6s → 歇止 2s，数息由一至十，若起妄念则重新数起。')}
      </p>

      {/* 呼吸光圈动画主体 */}
      <div className="relative h-64 flex items-center justify-center my-4">
        {/* 外圈水墨光晕 */}
        <div
          className={`absolute rounded-full transition-all duration-1000 bg-gradient-to-br ${currentInfo.color} opacity-20 blur-xl ${
            phase === 'inhale' || phase === 'hold' ? 'w-56 h-56 scale-110' : 'w-28 h-28 scale-90'
          }`}
        />

        {/* 核心动态圆盘 */}
        <div
          className={`relative rounded-full transition-all duration-1000 flex flex-col items-center justify-center shadow-lg bg-gradient-to-br ${currentInfo.color} text-white ${
            phase === 'inhale' || phase === 'hold' ? 'w-48 h-48 scale-105' : 'w-32 h-32 scale-90'
          }`}
        >
          <div className="text-2xl sm:text-3xl font-bold font-serif-zen tracking-wider drop-shadow-md">
            {t(currentInfo.label)}
          </div>
          <div className="text-3xl font-extrabold font-mono mt-1">
            {count}
          </div>
        </div>
      </div>

      {/* 阶段提示语 */}
      <div className="text-sm font-bold font-serif-zen text-amber-900 my-4">
        {t(currentInfo.tip)}
      </div>

      {/* 控制按钮 */}
      <button
        onClick={toggle}
        className="w-full py-3.5 rounded-2xl bg-amber-900 hover:bg-amber-950 text-amber-100 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
      >
        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        <span>{isActive ? t('暂停调息') : t('开始呼吸调息')}</span>
      </button>
    </div>
  );
};
