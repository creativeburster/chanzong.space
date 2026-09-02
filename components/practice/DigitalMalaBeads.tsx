'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const DigitalMalaBeads: React.FC = () => {
  const { t } = useLang();
  const [count, setCount] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(0); // 108颗为一圈
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [wish, setWish] = useState<string>('阿弥陀佛');
  const [offset, setOffset] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const startYRef = useRef<number>(0);

  const wishes = ['阿弥陀佛', '嗡嘛呢叭咪吽', '照见五蕴皆空', '南无本师释迦牟尼佛', '自性清净'];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zen_mala_count');
      if (saved) {
        const val = parseInt(saved, 10) || 0;
        setCount(val);
        setRoundCount(Math.floor(val / 108));
      }
    } catch {}
  }, []);

  const handleBeadPass = useCallback(() => {
    if (soundEnabled) {
      zenAudio.playBeadClick(0.7);
    }
    setCount((prev) => {
      const next = prev + 1;
      setRoundCount(Math.floor(next / 108));
      try {
        localStorage.setItem('zen_mala_count', String(next));
      } catch {}
      return next;
    });
  }, [soundEnabled]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = y;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPulling) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = y - startYRef.current;
    if (diff > 0) {
      setOffset(Math.min(diff, 60));
    }
  };

  const handleTouchEnd = () => {
    if (offset > 25) {
      handleBeadPass();
    }
    setIsPulling(false);
    setOffset(0);
  };

  const resetCount = () => {
    setCount(0);
    setRoundCount(0);
    try {
      localStorage.setItem('zen_mala_count', '0');
    } catch {}
  };

  // 生成垂直呈现的念珠串节点
  const beadIndexes = [-2, -1, 0, 1, 2];

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-stone-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm select-none">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('指尖持念 · 捻珠净心')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('菩提念珠 · 电子佛珠')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
            title={soundEnabled ? t('静音') : t('开启声音')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={resetCount}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 text-xs transition-colors"
            title={t('清零计数')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 统计计数 */}
      <div className="flex items-center justify-around py-3 bg-amber-900/5 rounded-2xl mb-6">
        <div className="text-center">
          <div className="text-3xl font-extrabold font-serif-zen text-amber-950">
            {count.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{t('总持念数')}</div>
        </div>
        <div className="h-8 w-px bg-amber-900/15" />
        <div className="text-center">
          <div className="text-3xl font-extrabold font-serif-zen text-amber-900">
            {count % 108} <span className="text-xs font-normal text-slate-500 font-sans">/ 108</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {t('当前圈数')}: <span className="font-bold text-amber-800">{roundCount}</span> {t('圈')}
          </div>
        </div>
      </div>

      {/* 念珠拨动操作区 */}
      <div
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative h-64 bg-radial from-amber-100/40 to-transparent rounded-3xl border border-amber-200/60 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden group shadow-inner"
      >
        {/* 穿线绳 */}
        <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-700 via-amber-900 to-amber-700 opacity-60" />

        {/* 垂直移动的珠串 */}
        <div
          style={{ transform: `translateY(${offset}px)` }}
          className="relative flex flex-col items-center space-y-3 transition-transform duration-75"
        >
          {beadIndexes.map((idx) => {
            const isCenter = idx === 0;
            return (
              <div
                key={idx}
                className={`rounded-full transition-all duration-100 flex items-center justify-center shadow-md relative ${
                  isCenter
                    ? 'w-20 h-20 bg-gradient-to-br from-[#A25F2A] via-[#7B3F1D] to-[#451F0B] ring-4 ring-amber-400/40 scale-105'
                    : 'w-14 h-14 bg-gradient-to-br from-[#8C4F22] via-[#653114] to-[#3B1907] opacity-75 scale-90'
                }`}
              >
                {/* 佛珠实木温润反光高光点 */}
                <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full blur-[1px] transform -rotate-45" />
                {isCenter && (
                  <span className="text-amber-200/90 text-xs font-serif-zen font-bold tracking-wider drop-shadow-sm pointer-events-none">
                    {t(wish)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 交互提示 */}
        <div className="absolute bottom-3 text-[11px] text-amber-900/60 font-semibold tracking-wider pointer-events-none animate-pulse">
          ↓ {t('向下滑动或点击拨动佛珠')} ↓
        </div>
      </div>

      {/* 快捷按钮与持念誓愿切换 */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {wishes.map((w) => (
            <button
              key={w}
              onClick={() => setWish(w)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                wish === w
                  ? 'bg-amber-900 text-amber-100 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t(w)}
            </button>
          ))}
        </div>

        <button
          onClick={handleBeadPass}
          className="w-full py-3 rounded-2xl bg-amber-900 hover:bg-amber-950 text-amber-100 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('拨动一珠 (或点击此处)')}</span>
        </button>
      </div>
    </div>
  );
};
