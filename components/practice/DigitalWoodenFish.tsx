'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

interface FloatingWord {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const DigitalWoodenFish: React.FC = () => {
  const { t } = useLang();

  const [count, setCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1500); // 1.5s
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [wishType, setWishType] = useState<string>('gongde'); // gongde, fannao, zixing, pingan

  const wordsMap: Record<string, string> = {
    gongde: '功德 +1',
    fannao: '烦恼 -1',
    zixing: '自性现前',
    pingan: '心无挂碍',
  };

  // 读取本地存储
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zen_muyu_count');
      if (saved) setCount(parseInt(saved, 10) || 0);
    } catch {}
  }, []);

  // 敲击动作
  const handleStrike = useCallback((clientX?: number, clientY?: number) => {
    if (soundEnabled) {
      zenAudio.playWoodenFish(0.85);
    }
    setIsStriking(true);
    setTimeout(() => setIsStriking(false), 90);

    setCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('zen_muyu_count', String(next));
      } catch {}
      return next;
    });

    // 产生浮空文字特效
    const wordText = t(wordsMap[wishType] || '功德 +1');
    const newId = Date.now() + Math.random();
    const xOffset = (Math.random() - 0.5) * 60;
    const yOffset = -20 - Math.random() * 20;

    setFloatingWords((prev) => [...prev.slice(-10), { id: newId, text: wordText, x: xOffset, y: yOffset }]);

    setTimeout(() => {
      setFloatingWords((prev) => prev.filter((w) => w.id !== newId));
    }, 1200);
  }, [soundEnabled, wishType, t]);

  // 自动敲击定时器
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isAuto) {
      autoTimerRef.current = setInterval(() => {
        handleStrike();
      }, autoSpeed);
    } else if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isAuto, autoSpeed, handleStrike]);

  const resetCount = () => {
    setCount(0);
    try {
      localStorage.setItem('zen_muyu_count', '0');
    } catch {}
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-amber-50/50 via-white to-stone-50/60 rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm">
      {/* 顶栏控制 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('静心息妄 · 念兹在兹')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('电子木鱼')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-colors ${
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

      {/* 计数牌 */}
      <div className="text-center my-4">
        <span className="text-4xl sm:text-5xl font-extrabold font-serif-zen text-amber-950 tracking-tight">
          {count.toLocaleString()}
        </span>
        <div className="text-xs text-slate-500 mt-1 font-medium">
          {t('今日静心敲击次數')}
        </div>
      </div>

      {/* 木鱼敲击主体区域 */}
      <div className="relative flex items-center justify-center my-8 select-none py-4">
        {/* 浮空文字 */}
        {floatingWords.map((w) => (
          <div
            key={w.id}
            style={{ transform: `translate(${w.x}px, ${w.y}px)` }}
            className="absolute top-1/3 pointer-events-none font-serif-zen font-extrabold text-amber-800 text-lg sm:text-xl drop-shadow-sm animate-fade-up"
          >
            {w.text}
          </div>
        ))}

        {/* 木鱼 SVG 拟物 */}
        <button
          onClick={() => handleStrike()}
          className={`relative p-6 rounded-full outline-none transition-all duration-75 active:scale-90 ${
            isStriking ? 'scale-95' : 'hover:scale-105'
          }`}
        >
          {/* 水波涟漪光晕 */}
          <div
            className={`absolute inset-0 rounded-full bg-amber-500/15 transition-all duration-300 ${
              isStriking ? 'scale-125 opacity-100' : 'scale-90 opacity-0'
            }`}
          />

          <svg
            className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-lg text-amber-900"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 木鱼外壳底影 */}
            <circle cx="100" cy="108" r="70" fill="#78350F" fillOpacity="0.15" />
            
            {/* 木鱼主体实木质感 */}
            <path
              d="M100 30 C55 30, 25 65, 25 110 C25 155, 60 180, 100 180 C140 180, 175 155, 175 110 C175 65, 145 30, 100 30 Z"
              fill="url(#woodenGradient)"
              stroke="#5C240E"
              strokeWidth="4"
            />
            
            {/* 木鱼中缝鱼嘴开口 */}
            <path
              d="M45 115 C75 130, 125 130, 155 115 C145 125, 115 135, 100 135 C85 135, 55 125, 45 115 Z"
              fill="#3B1709"
            />
            
            {/* 木鱼头部雕花环 */}
            <circle cx="100" cy="72" r="14" fill="#92400E" stroke="#5C240E" strokeWidth="2.5" />
            <circle cx="100" cy="72" r="6" fill="#3B1709" />
            
            {/* 鳞纹雕刻修饰线 */}
            <path d="M60 85 Q75 75, 80 90" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M140 85 Q125 75, 120 90" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M55 105 Q70 95, 75 110" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M145 105 Q130 95, 125 110" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* 渐变定义 */}
            <defs>
              <linearGradient id="woodenGradient" x1="100" y1="30" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A16207" />
                <stop offset="0.4" stopColor="#854D0E" />
                <stop offset="1" stopColor="#5C240E" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>

      {/* 底部功能配置：文字愿景切换与自动敲击 */}
      <div className="space-y-4 pt-4 border-t border-amber-900/10">
        {/* 愿景选择 */}
        <div className="flex items-center justify-center gap-2">
          {Object.entries(wordsMap).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setWishType(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                wishType === key
                  ? 'bg-amber-900 text-amber-100 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>

        {/* 自动敲击与节奏设置 */}
        <div className="flex items-center justify-between bg-stone-100/70 p-3 rounded-2xl text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAuto(!isAuto)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
                isAuto
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAuto ? t('停止自动') : t('自动敲击')}</span>
            </button>
            <span className="text-slate-500 font-medium hidden sm:inline">
              {t('定心持念')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 mr-1">{t('间隔')}:</span>
            {[
              { ms: 2000, label: '2s' },
              { ms: 1500, label: '1.5s' },
              { ms: 1000, label: '1s' },
            ].map((s) => (
              <button
                key={s.ms}
                onClick={() => setAutoSpeed(s.ms)}
                className={`px-2 py-1 rounded-lg font-bold text-xs ${
                  autoSpeed === s.ms ? 'bg-amber-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
