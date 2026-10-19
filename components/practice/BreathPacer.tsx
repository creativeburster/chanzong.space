'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  // 用 ref 保存状态机：避免在 setState 更新函数里再 setState / 触发副作用（严格模式下会被重复推进）
  const machineRef = useRef<{ phase: Phase; count: number }>({ phase: 'inhale', count: 4 });

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      const m = machineRef.current;
      if (m.count <= 1) {
        if (m.phase === 'inhale') {
          m.phase = 'hold';
        } else if (m.phase === 'hold') {
          m.phase = 'exhale';
        } else if (m.phase === 'exhale') {
          m.phase = 'rest';
        } else {
          m.phase = 'inhale';
          setCycleCount((c) => (c >= 10 ? 1 : c + 1));
        }
        m.count = durations[m.phase];
      } else {
        m.count -= 1;
      }
      setPhase(m.phase);
      setCount(m.count);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(durations.inhale);
    setCycleCount(1);
    machineRef.current = { phase: 'inhale', count: durations.inhale };
  };

  const currentInfo = phaseNames[phase];
  // 光圈伸缩时长与当前阶段秒数一致（吸气 4s 慢慢变大、呼气 6s 慢慢收拢），而不是固定 1 秒
  const breathMs = phase === 'inhale' || phase === 'exhale' ? `${durations[phase]}s` : '0.3s';

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
          style={{ transitionDuration: breathMs }}
          className={`absolute rounded-full transition-all ease-in-out bg-gradient-to-br ${currentInfo.color} opacity-20 blur-xl ${
            phase === 'inhale' || phase === 'hold' ? 'w-56 h-56 scale-110' : 'w-28 h-28 scale-90'
          }`}
        />

        {/* 核心动态圆盘 */}
        <div
          style={{ transitionDuration: breathMs }}
          className={`relative rounded-full transition-all ease-in-out flex flex-col items-center justify-center shadow-lg bg-gradient-to-br ${currentInfo.color} text-white ${
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
