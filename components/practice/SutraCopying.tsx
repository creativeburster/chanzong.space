'use client';

import React, { useState } from 'react';
import { PenTool, CheckCircle, RefreshCw, Sparkles, Share2 } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

const SUTRA_PASSAGES = [
  {
    title: '般若波罗蜜多心经',
    source: '观自在菩萨',
    text: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。舍利子，色不异空，空不异色，色即是空，空即是色，受想行识亦复如是。',
  },
  {
    title: '信心铭',
    source: '三祖僧璨',
    text: '至道无难，唯嫌拣择。但莫憎爱，洞然明白。毫厘有差，天地悬隔。欲得现前，莫存顺逆。违顺相争，是为心病。',
  },
  {
    title: '达摩二入四行观',
    source: '初祖菩提达摩',
    text: '夫入道多途，要而言之，不出二种：一是理入，二是行入。理入者，谓藉教悟宗，深信含生凡圣同一真性，但为客尘妄想所覆，不能显了。',
  },
  {
    title: '六祖坛经无相颂',
    source: '六祖惠能',
    text: '心平何劳持戒，行直何用修禅。恩则孝养父母，义则上下相怜。让则尊卑和睦，忍则众恶无喧。',
  },
];

export const SutraCopying: React.FC = () => {
  const { t } = useLang();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentSutra = SUTRA_PASSAGES[selectedIdx];
  const fullText = currentSutra.text;

  const handleNextChar = () => {
    if (charIndex >= fullText.length) return;
    zenAudio.playQinPluck(0.6);
    const next = charIndex + 1;
    setCharIndex(next);
    if (next >= fullText.length) {
      setIsCompleted(true);
      setTimeout(() => zenAudio.playSingingBowl(0.8), 300);
    }
  };

  const handleReset = () => {
    setCharIndex(0);
    setIsCompleted(false);
  };

  const switchSutra = (idx: number) => {
    setSelectedIdx(idx);
    setCharIndex(0);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-amber-900/20 shadow-md relative overflow-hidden select-none">
      {/* 宣纸水墨背景装饰 */}
      <div className="flex items-center justify-between mb-4 border-b border-amber-900/15 pb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('写经摄心 · 墨印自性')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('指尖抄经静心阁')}
          </h3>
        </div>

        <div className="flex space-x-1.5 overflow-x-auto">
          {SUTRA_PASSAGES.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => switchSutra(idx)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedIdx === idx
                  ? 'bg-amber-900 text-amber-100'
                  : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
              }`}
            >
              {t(s.title.slice(0, 4))}
            </button>
          ))}
        </div>
      </div>

      {/* 经文题目与出处 */}
      <div className="text-center my-4">
        <h4 className="text-lg font-bold font-serif-zen text-slate-900 tracking-wide">
          《{t(currentSutra.title)}》
        </h4>
        <div className="text-xs text-amber-800 font-medium mt-0.5">
          — {t(currentSutra.source)} —
        </div>
      </div>

      {/* 抄经临摹区 */}
      <div
        onClick={handleNextChar}
        className="p-6 sm:p-8 bg-white/80 rounded-2xl border border-amber-200/80 shadow-inner my-4 min-h-[160px] cursor-pointer relative group flex flex-wrap gap-x-1.5 gap-y-2.5 items-center justify-center font-serif-zen text-lg sm:text-xl leading-relaxed tracking-wider"
      >
        {fullText.split('').map((char, i) => {
          const isWritten = i < charIndex;
          const isCurrent = i === charIndex;
          return (
            <span
              key={i}
              className={`transition-all duration-200 rounded px-0.5 ${
                isWritten
                  ? 'text-slate-900 font-bold border-b border-amber-600/40'
                  : isCurrent
                  ? 'text-amber-500 bg-amber-100/80 font-bold animate-pulse'
                  : 'text-slate-300 font-normal'
              }`}
            >
              {t(char)}
            </span>
          );
        })}

        {/* 抄写圆满朱红闲章 */}
        {isCompleted && (
          <div className="absolute right-4 bottom-4 p-2.5 rounded-xl border-2 border-red-700 text-red-700 bg-red-50/90 font-serif-zen font-extrabold text-xs tracking-widest shadow-md rotate-[-6deg] animate-in zoom-in-75">
            {t('【功德圆满】')}
          </div>
        )}
      </div>

      {/* 进度与交互按钮 */}
      <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
        <span className="font-mono">
          {t('进度')}: {charIndex} / {fullText.length} ({Math.round((charIndex / fullText.length) * 100)}%)
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-slate-700 font-semibold transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('重抄')}</span>
          </button>
          <button
            onClick={handleNextChar}
            className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 font-bold shadow-sm transition-all active:scale-95 flex items-center space-x-1.5"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isCompleted ? t('已圆满') : t('点击落笔')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
