'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Compass, HelpCircle, ArrowRight, Image as ImageIcon, Save, Check } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';
import ZenQuoteCardModal from '@/components/ZenQuoteCardModal';

const HUATOU_LIST = [
  {
    topic: '念佛是谁？',
    master: '大慧宗杲 / 虚云老和尚',
    hint: '念佛的那一念从何而起？不在肉身，不在虚空，到底是谁在念？在不知处看！',
  },
  {
    topic: '父母未生前，如何是本来面目？',
    master: '六祖惠能 / 大珠慧海',
    hint: '不思善，不思恶，正与么时，哪个是明上座本来面目？切忌起心分别！',
  },
  {
    topic: '万法归一，一归何处？',
    master: '赵州从谂',
    hint: '青州作得一领布衫，重七斤。截断情识，于无缝处下锥！',
  },
  {
    topic: '狗子还有佛性也无？——无！',
    master: '赵州从谂 / 无门慧开',
    hint: '将三百六十骨节、八万四千毫窍，通身起个疑团，参个“无”字。昼夜提撕，莫作有无会！',
  },
];

export const HuaTouInquiry: React.FC = () => {
  const { t } = useLang();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [inquiryCount, setInquiryCount] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTiming, setIsTiming] = useState<boolean>(true);
  const [cardModalOpen, setCardModalOpen] = useState<boolean>(false);
  const [insightNote, setInsightNote] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const currentHuaTou = HUATOU_LIST[selectedIdx];

  // 从本地加载该话头保存的心悟笔记
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zen_huatou_note_${selectedIdx}`);
      setInsightNote(saved || '');
    } catch {}
  }, [selectedIdx]);

  useEffect(() => {
    let timer: any = null;
    if (isTiming) {
      timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTiming]);

  const handleInquire = () => {
    zenAudio.playSingingBowlDeep(0.7);
    setIsPulsing(true);
    setInquiryCount((c) => c + 1);
    setTimeout(() => setIsPulsing(false), 300);
  };

  const switchTopic = (idx: number) => {
    setSelectedIdx(idx);
    setInquiryCount(0);
    setTimerSeconds(0);
    setIsSaved(false);
  };

  const saveInsight = () => {
    try {
      localStorage.setItem(`zen_huatou_note_${selectedIdx}`, insightNote);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {}
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-[#0B1120] via-[#020617] to-black text-white rounded-3xl p-6 sm:p-8 border border-amber-600/30 shadow-2xl select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            {t('宗门顿悟 · 提撕疑情')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-amber-100">
            {t('看话头 · 参究疑情室')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCardModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            title={t('生成话头海报')}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('海报')}</span>
          </button>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-400">{t('定力')}:</span>
            <span className="text-amber-300 font-bold bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              {formatTime(timerSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 话头切换 */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-6">
        {HUATOU_LIST.map((h, idx) => (
          <button
            key={h.topic}
            onClick={() => switchTopic(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedIdx === idx
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {t(h.topic.slice(0, 5))}...
          </button>
        ))}
      </div>

      {/* 话头提撕主体 */}
      <div
        onClick={handleInquire}
        className="cursor-pointer py-10 my-4 text-center relative group rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 transition-all"
      >
        {/* 疑情震荡波纹 */}
        <div
          className={`absolute inset-0 rounded-2xl bg-amber-500/10 transition-all duration-700 ${
            isPulsing ? 'scale-110 opacity-100' : 'scale-100 opacity-0'
          }`}
        />

        <div className="text-xs text-amber-400 font-bold tracking-widest uppercase mb-3">
          — {t(currentHuaTou.master)} —
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-zen text-white tracking-wide group-hover:text-amber-200 transition-colors drop-shadow-md">
          "{t(currentHuaTou.topic)}"
        </h2>

        <div className="mt-4 text-xs text-slate-400 font-serif-zen max-w-md mx-auto px-4 leading-relaxed">
          {t(currentHuaTou.hint)}
        </div>

        <div className="mt-6 inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          <Eye className="w-3.5 h-3.5" />
          <span>{t('点击屏幕提撕疑情 (已参')} {inquiryCount} {t('次)')}</span>
        </div>
      </div>

      {/* 当下心悟笔记 */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('参究心悟 · 当下自记')}</span>
          </span>
          <button
            onClick={saveInsight}
            className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-medium transition flex items-center gap-1"
          >
            {isSaved ? <Check className="w-3 h-3 text-emerald-300" /> : <Save className="w-3 h-3" />}
            <span>{isSaved ? t('已存入印谱') : t('存悟境')}</span>
          </button>
        </div>
        <textarea
          value={insightNote}
          onChange={(e) => setInsightNote(e.target.value)}
          placeholder={t('于不知处起大疑情，若忽有所契，随手录于此处（自动保存在本地）...')}
          rows={2}
          className="w-full bg-slate-900/90 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700/60 focus:outline-none focus:border-amber-500/70 resize-none font-serif-zen placeholder:text-slate-600"
        />
      </div>

      {/* 话头海报弹窗 */}
      <ZenQuoteCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        quote={`“${currentHuaTou.topic}”\n${insightNote ? `\n【参究心悟】：${insightNote}` : ''}`}
        interpretation={currentHuaTou.hint}
        sourceTitle="宗门看话 · 祖师禅参究"
        author={currentHuaTou.master}
      />
    </div>
  );
};
