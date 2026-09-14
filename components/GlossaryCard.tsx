'use client';

import React, { useState, useCallback } from 'react';
import { BookMarked, ChevronDown, Volume2, LocateFixed, Sparkles } from 'lucide-react';
import { ZEN_GLOSSARY, GlossaryEntry } from '@/lib/glossary';
import { useLang } from '@/context/LangContext';

export const GlossaryCard: React.FC<{ sourceIds: string[] }> = ({ sourceIds }) => {
  const { t } = useLang();
  // 默认展开，让读者一眼看到生僻字注音矩阵
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [playingChar, setPlayingChar] = useState<string | null>(null);

  const seen = new Set<string>();
  const entries: GlossaryEntry[] = sourceIds
    .flatMap((id) => ZEN_GLOSSARY[id] ?? [])
    .filter((e) => {
      if (seen.has(e.char)) return false;
      seen.add(e.char);
      return true;
    });

  // 语音朗读
  const speakChar = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.85;
      utter.onstart = () => setPlayingChar(text);
      utter.onend = () => setPlayingChar(null);
      utter.onerror = () => setPlayingChar(null);
      window.speechSynthesis.speak(utter);
    } catch {
      setPlayingChar(null);
    }
  }, []);

  // 定位到正文中该生僻字首次出现的位置
  const locateInArticle = useCallback((char: string) => {
    if (typeof document === 'undefined') return;
    const charEnc = encodeURIComponent(char);
    const target = document.getElementById(`glossary-term-${charEnc}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 触发一次点击或添加临时脉冲动画
      target.classList.add('ring-4', 'ring-amber-500', 'bg-amber-300/40');
      setTimeout(() => {
        target.classList.remove('ring-4', 'ring-amber-500', 'bg-amber-300/40');
      }, 2000);
      // 触发该词的 popover
      target.click();
    }
  }, []);

  if (entries.length === 0) return null;

  const INITIAL_LIMIT = 8;
  const shouldLimit = entries.length > INITIAL_LIMIT;
  const visibleEntries = shouldLimit && !expanded ? entries.slice(0, INITIAL_LIMIT) : entries;

  return (
    <div className="mt-8 bg-white dark:bg-[#0F172A] rounded-3xl border border-emerald-900/15 dark:border-emerald-900/40 shadow-md overflow-hidden transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 sm:px-10 py-5 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shadow-2xs">
            🈳
          </div>
          <div className="text-left">
            <span className="text-xl font-bold font-serif-zen text-zinc-900 dark:text-zinc-100">
              {t('生僻字与难词注音释义')}
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t('共')} {entries.length} {t('词')}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-6 sm:px-10 pb-8 space-y-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('收录本篇经文之梵语音译、生僻难读与多音异读字词。点击小喇叭可试听读音，点击定位可直达正文。')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleEntries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 transition-all group"
              >
                {/* 汉字首字大标 */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shadow-2xs">
                  <span className="text-xl font-bold font-serif-zen text-emerald-800 dark:text-emerald-300">
                    {t(entry.char.length <= 2 ? entry.char : entry.char[0])}
                  </span>
                </div>

                {/* 词汇、拼音与操作 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[16px] font-bold font-serif-zen text-zinc-900 dark:text-zinc-100">
                        {t(entry.char)}
                      </span>
                      <span className="text-[12px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        [ {entry.pinyin} ]
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* 朗读发音 */}
                      <button
                        onClick={() => speakChar(entry.char)}
                        className={`p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors ${
                          playingChar === entry.char ? 'animate-pulse text-amber-600' : ''
                        }`}
                        title="朗读正音"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* 定位正文 */}
                      <button
                        onClick={() => locateInArticle(entry.char)}
                        className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                        title="在正文中定位此词"
                      >
                        <LocateFixed className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-serif-zen">
                    {t(entry.meaning)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {shouldLimit && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold hover:bg-emerald-100 transition-all shadow-2xs"
              >
                {expanded
                  ? t('收起')
                  : `${t('展开全部生僻字')} (${t('共')} ${entries.length} ${t('词')})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
