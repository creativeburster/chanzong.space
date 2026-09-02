'use client';

import React, { useState } from 'react';
import { Sparkles, Disc, Waves, Volume2 } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const SingingBowl: React.FC = () => {
  const { t } = useLang();
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [strikeCount, setStrikeCount] = useState<number>(0);

  const handleStrike = () => {
    zenAudio.playSingingBowlDeep(0.85);
    setIsStriking(true);
    setStrikeCount((v) => v + 1);
    setTimeout(() => setIsStriking(false), 200);
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl select-none">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            {t('声频疗愈 · 432Hz共振')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-amber-100">
            {t('古铜藏式颂钵')}
          </h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          {t('音浴静心')}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        {t('点击重击青铜大钵，激发沉笃绵长的 432Hz 疗愈谐波泛音，平息大脑杂念波段，瞬间回归内在宁静。')}
      </p>

      {/* 颂钵视觉主体 */}
      <div className="relative flex items-center justify-center my-6 py-6">
        {/* 扩散热能震波光环 */}
        <div
          className={`absolute w-48 h-48 rounded-full border border-amber-400/30 transition-all duration-1000 ${
            isStriking ? 'scale-150 opacity-0' : 'scale-100 opacity-60 animate-ping'
          }`}
        />
        <div
          className={`absolute w-60 h-60 rounded-full border border-amber-300/20 transition-all duration-1000 delay-150 ${
            isStriking ? 'scale-175 opacity-0' : 'scale-100 opacity-40 animate-pulse'
          }`}
        />

        {/* 颂钵 SVG 拟物 */}
        <button
          onClick={handleStrike}
          className={`relative p-4 rounded-full outline-none transition-all duration-200 active:scale-95 ${
            isStriking ? 'scale-95' : 'hover:scale-105'
          }`}
        >
          <svg className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-2xl" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="30%" stopColor="#D97706" />
                <stop offset="70%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
              <radialGradient id="bowlInner" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="80%" stopColor="#451A03" />
                <stop offset="100%" stopColor="#1E0B04" />
              </radialGradient>
            </defs>

            {/* 颂钵底座暗影 */}
            <ellipse cx="100" cy="165" rx="55" ry="12" fill="#000000" opacity="0.6" />

            {/* 颂钵外弧身 */}
            <path
              d="M30 75 C30 145, 60 165, 100 165 C140 165, 170 145, 170 75 C170 70, 160 65, 100 65 C40 65, 30 70, 30 75 Z"
              fill="url(#bronzeGrad)"
              stroke="#B45309"
              strokeWidth="2"
            />

            {/* 颂钵钵口内圈 */}
            <ellipse cx="100" cy="72" rx="70" ry="22" fill="url(#bowlInner)" stroke="#FBBF24" strokeWidth="2.5" />
            
            {/* 钵内底心 */}
            <ellipse cx="100" cy="74" rx="40" ry="12" fill="#291107" opacity="0.8" />
            <circle cx="100" cy="74" r="5" fill="#D97706" opacity="0.6" />

            {/* 钵口边缘手打锤纹光感 */}
            <path d="M45 80 Q100 95, 155 80" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" fill="none" />
          </svg>
        </button>
      </div>

      {/* 底部操作与疗愈次数 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Waves className="w-4 h-4 text-amber-400" />
          <span>{t('沉浸敲钵共振')}: <strong className="text-amber-300 font-mono">{strikeCount}</strong> {t('次')}</span>
        </div>

        <button
          onClick={handleStrike}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center space-x-1.5"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t('敲击起音')}</span>
        </button>
      </div>
    </div>
  );
};
