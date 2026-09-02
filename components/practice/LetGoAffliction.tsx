'use client';

import React, { useState } from 'react';
import { Flame, Wind, Sparkles, Check } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const LetGoAffliction: React.FC = () => {
  const { t } = useLang();
  const [inputText, setInputText] = useState<string>('');
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [burnedCount, setBurnedCount] = useState<number>(0);
  const [wisdomQuote, setWisdomQuote] = useState<string>('');

  const quotes = [
    '菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。——六祖惠能',
    '狂心若歇，歇即菩提。妄念本空，随起随灭。——《楞严经》',
    '万事无如退步人，孤云野鹤自由身。——慈受怀深',
    '若得心中无一事，八万四千法门尽在其中。——黄檗希运',
  ];

  const handleLetGo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBurning) return;

    zenAudio.playWhooshFire(0.5);
    setIsBurning(true);

    setTimeout(() => {
      setBurnedCount((v) => v + 1);
      setInputText('');
      setIsBurning(false);
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setWisdomQuote(randomQuote);
      zenAudio.playSingingBowl(0.7);
    }, 1400);
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-stone-900 via-[#1C1917] to-black text-stone-200 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-orange-400 font-bold">
            {t('狂心顿歇 · 断舍离')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-stone-100">
            {t('万缘放下 · 烦恼化烬池')}
          </h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs font-bold font-mono">
          {t('已放下')}: {burnedCount}
        </div>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed mb-6">
        {t('写下当下困扰您的执念、烦恼、焦虑或妄想，点击“万缘放下”，观其化作青烟余烬散入虚空。')}
      </p>

      {/* 输入与化烬表单 */}
      <form onSubmit={handleLetGo} className="space-y-4">
        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBurning}
            placeholder={t('在此输入您心中的烦恼或执念（如：焦虑、执着、悔恨、攀缘）...')}
            className={`w-full p-4 rounded-2xl bg-stone-950 border border-stone-700 text-sm text-stone-100 focus:outline-none focus:border-orange-500 transition-all ${
              isBurning ? 'opacity-0 scale-95 duration-1000' : 'opacity-100'
            }`}
          />

          {isBurning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 rounded-2xl border border-orange-500/50 animate-in fade-in duration-300">
              <Flame className="w-10 h-10 text-orange-500 animate-bounce" />
              <span className="text-sm font-bold font-serif-zen text-orange-300 mt-2">
                {t('万缘放下 · 妄念化烬...')}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isBurning}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-800 to-amber-900 hover:from-orange-700 hover:to-amber-800 disabled:opacity-40 text-orange-100 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>{t('万缘放下 · 销归自性')}</span>
        </button>
      </form>

      {/* 祖师开示法语反馈 */}
      {wisdomQuote && (
        <div className="mt-6 p-4 rounded-2xl bg-stone-950/80 border border-amber-900/30 text-xs text-amber-200/90 font-serif-zen leading-relaxed text-center animate-in fade-in duration-500">
          <Sparkles className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
          {t(wisdomQuote)}
        </div>
      )}
    </div>
  );
};
