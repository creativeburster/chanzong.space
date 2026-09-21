'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Copy, Check, Volume2, Sparkles, Compass, HelpCircle, Layers, Quote } from 'lucide-react';
import { ZEN_TRANSLATIONS } from '@/lib/translations';
import { ZEN_GLOSSARY } from '@/lib/glossary';
import { injectGlossaryMarkups } from './InlineGlossaryTooltip';
import { useLang } from '@/context/LangContext';

interface BilingualReaderProps {
  classicId: string;
  rawContent?: string;
  originalParagraphs?: string[];
  summaryInfo?: { guide?: string; quotes?: string; gist?: string };
  viewMode: 'bilingual' | 'modern';
  fontSize: 'normal' | 'large';
  currentTheme: {
    pageBg: string;
    bannerBg: string;
    bannerText: string;
    cardBg: string;
    cardBorder: string;
    proseText: string;
    secondaryText: string;
    accentColor: string;
  };
}

// 从 markdown 源码中提取原文段落
function extractOriginalParagraphs(raw: string): string[] {
  const match = raw.match(/##\s*📜?\s*典籍原文([\s\S]*)/);
  if (!match) return [];
  const body = match[1].trim();
  const rawParas = body.split(/\n\s*\n/);
  const result: string[] = [];
  for (const p of rawParas) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (/^---+$/.test(trimmed)) continue;
    // 过滤掉开头的纯标题行（如 ### 序）
    if (trimmed.startsWith('###') && trimmed.length < 20 && !trimmed.includes('\n')) {
      continue;
    }
    result.push(trimmed);
  }
  return result;
}

// 提取导读与核心名句
function extractGuidesAndQuotes(raw: string) {
  const guideMatch = raw.match(/##\s*💡\s*现代白话导读与核心旨趣([\s\S]*?)(?=##|---|\n#|$)/);
  const quotesMatch = raw.match(/##\s*🗣️\s*名句白话解读([\s\S]*?)(?=##|---|\n#|$)/);
  const gistMatch = raw.match(/\*\*主旨\*\*[:：]([\s\S]*?)(?=\n\n|\n##|$)/);

  return {
    guide: guideMatch ? guideMatch[1].trim() : '',
    quotes: quotesMatch ? quotesMatch[1].trim() : '',
    gist: gistMatch ? gistMatch[1].trim() : '',
  };
}

export const BilingualReader: React.FC<BilingualReaderProps> = ({
  classicId,
  rawContent = '',
  originalParagraphs,
  summaryInfo,
  viewMode,
  fontSize,
  currentTheme,
}) => {
  const { t, isTraditional } = useLang();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const glossaries = useMemo(() => ZEN_GLOSSARY[classicId] || [], [classicId]);
  const originalParas = useMemo(() => {
    if (originalParagraphs && originalParagraphs.length > 0) return originalParagraphs;
    return rawContent ? extractOriginalParagraphs(rawContent) : [];
  }, [originalParagraphs, rawContent]);

  const translations = useMemo(() => ZEN_TRANSLATIONS[classicId] || [], [classicId]);
  const { guide, quotes, gist } = useMemo(() => {
    if (summaryInfo) return { guide: summaryInfo.guide || '', quotes: summaryInfo.quotes || '', gist: summaryInfo.gist || '' };
    return rawContent ? extractGuidesAndQuotes(rawContent) : { guide: '', quotes: '', gist: '' };
  }, [summaryInfo, rawContent]);

  // 对齐段落对
  const alignedPairs = useMemo(() => {
    const maxLen = Math.max(originalParas.length, translations.length);
    const list = [];
    for (let i = 0; i < maxLen; i++) {
      list.push({
        idx: i + 1,
        original: originalParas[i] || '',
        translation: translations[i] || '',
      });
    }
    return list;
  }, [originalParas, translations]);

  // 复制指定段落
  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // 朗读指定段落
  const handleSpeak = (text: string, idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (playingIdx === idx) {
        setPlayingIdx(null);
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.9;
      utter.onstart = () => setPlayingIdx(idx);
      utter.onend = () => setPlayingIdx(null);
      utter.onerror = () => setPlayingIdx(null);
      window.speechSynthesis.speak(utter);
    } catch {
      setPlayingIdx(null);
    }
  };

  // 白话精读模式视图
  if (viewMode === 'modern') {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* 顶部模式介绍横幅 */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-sm shadow-sm">
              💡
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold font-serif-zen ${currentTheme.bannerText}`}>
                {t('白话沉浸精读模式')}
              </h3>
              <p className={`text-xs ${currentTheme.secondaryText}`}>
                {t('去芜存菁，以现代通俗笔触融通宗门法语 · 共')} {translations.length} {t('个通释单元')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t('现代禅学研习特供')}</span>
          </div>
        </div>

        {/* 导读与核心旨趣 */}
        {guide && (
          <div className={`${currentTheme.cardBg} p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${currentTheme.cardBorder} shadow-sm space-y-3`}>
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 font-bold text-[15px]">
              <Compass className="w-4 h-4" />
              <span>{t('💡 现代白话导读与核心旨趣')}</span>
            </div>
            <p className={`text-[15px] sm:text-[16px] leading-relaxed font-serif-zen ${currentTheme.proseText} whitespace-pre-line`}>
              {t(guide)}
            </p>
            {gist && (
              <div className="mt-3 pt-3 border-t border-amber-900/10 dark:border-amber-900/40 text-[13px] text-amber-900 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 rounded-xl">
                <span className="font-bold mr-1.5">{t('核心主旨')}：</span>
                {t(gist)}
              </div>
            )}
          </div>
        )}

        {/* 名句白话解读 */}
        {quotes && (
          <div className={`${currentTheme.cardBg} p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${currentTheme.cardBorder} shadow-sm space-y-3`}>
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 font-bold text-[15px]">
              <Quote className="w-4 h-4" />
              <span>{t('🗣️ 名句白话精析')}</span>
            </div>
            <div className={`text-[14px] sm:text-[15px] leading-relaxed font-serif-zen ${currentTheme.secondaryText} whitespace-pre-line bg-black/5 dark:bg-white/5 p-4 rounded-xl`}>
              {t(quotes)}
            </div>
          </div>
        )}

        {/* 白话正文精读流 */}
        <div className="space-y-4 sm:space-y-5">
          {translations.map((para, i) => (
            <div
              key={i}
              className={`${currentTheme.cardBg} p-5 sm:p-7 rounded-2xl border ${currentTheme.cardBorder} shadow-sm hover:border-amber-600/40 transition-all group`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {t('第')} {i + 1} {t('则')}
                  </span>
                  <span className={`text-xs ${currentTheme.secondaryText}`}>
                    {t('通俗白话今释')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSpeak(para, i)}
                    className={`p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
                      playingIdx === i ? 'text-amber-600 animate-pulse' : ''
                    }`}
                    title="朗读本段白话"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(para, i)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    title="复制本段"
                  >
                    {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p
                className={`font-serif-zen ${currentTheme.proseText} leading-loose ${
                  fontSize === 'large' ? 'text-[18px] sm:text-[20px]' : 'text-[16px] sm:text-[17px]'
                }`}
              >
                {t(para)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 文白对照模式视图（bilingual）
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 顶部对照模式横幅 */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-600/10 via-amber-700/5 to-transparent border border-amber-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold text-sm shadow-sm">
            ⚖️
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-bold font-serif-zen ${currentTheme.bannerText}`}>
              {t('文白双栏对照研读模式')}
            </h3>
            <p className={`text-xs ${currentTheme.secondaryText}`}>
              {t('古文典籍与现代白话逐段对称映照 · 生僻字词实时悬浮注音 · 共')} {alignedPairs.length} {t('个对照段落')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>{t('大屏双栏并列 · 移动端上下对称')}</span>
        </div>
      </div>

      {/* 逐段对照卡片列表 */}
      <div className="space-y-6 sm:space-y-8">
        {alignedPairs.map((pair, i) => {
          const origMarked = pair.original
            ? injectGlossaryMarkups(
                pair.original
                  .split('\n')
                  .map((l) => `<p class="mb-2 leading-relaxed">${l.trim()}</p>`)
                  .join(''),
                glossaries
              )
            : '';

          return (
            <div
              key={pair.idx}
              className={`${currentTheme.cardBg} rounded-2xl sm:rounded-3xl border ${currentTheme.cardBorder} shadow-md overflow-hidden transition-all hover:border-amber-600/50`}
            >
              {/* 段落卡片头部 */}
              <div className="px-4 sm:px-6 py-3 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {pair.idx}
                  </span>
                  <span className={`text-xs font-bold ${currentTheme.bannerText}`}>
                    {t('第')} {pair.idx} {t('对照段')}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => handleSpeak(pair.translation || pair.original, pair.idx)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 ${
                      currentTheme.secondaryText
                    } hover:text-amber-700 hover:border-amber-600 transition-colors ${
                      playingIdx === pair.idx ? 'text-amber-600 animate-pulse border-amber-600' : ''
                    }`}
                    title="朗读本段"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t('朗读')}</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        `【原文】\n${pair.original}\n\n【白话】\n${pair.translation}`,
                        pair.idx
                      )
                    }
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 ${currentTheme.secondaryText} hover:text-amber-700 hover:border-amber-600 transition-colors`}
                    title="复制本对照段"
                  >
                    {copiedIdx === pair.idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t('已复制')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('复制段落')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 文白对照主体：大屏双栏并列，窄屏上下堆叠 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-amber-900/10 dark:divide-amber-900/30">
                {/* 左栏：古文原文（带生僻字悬浮标注） */}
                <div className="p-5 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-800 dark:text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                        {t('【古文原文】')}
                      </span>
                      <span className="text-[11px] font-normal opacity-70">
                        {t('虚线下划线支持悬浮/点击注音')}
                      </span>
                    </div>

                    {pair.original ? (
                      <div
                        className={`font-serif-zen ${currentTheme.proseText} ${
                          fontSize === 'large'
                            ? 'text-[18px] sm:text-[20px] leading-loose'
                            : 'text-[16px] sm:text-[18px] leading-relaxed'
                        }`}
                        dangerouslySetInnerHTML={{ __html: origMarked }}
                      />
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        {t('（此段为现代导师之深入解构与意蕴升华，无对应古文单句）')}
                      </p>
                    )}
                  </div>
                </div>

                {/* 右栏：现代白话通释 */}
                <div className="p-5 sm:p-7 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {t('【现代通解】')}
                      </span>
                      <span className="text-[11px] font-normal opacity-70">
                        {t('通俗白话 · 逐句融通')}
                      </span>
                    </div>

                    {pair.translation ? (
                      <p
                        className={`font-serif-zen text-stone-800 dark:text-stone-200 ${
                          fontSize === 'large'
                            ? 'text-[17px] sm:text-[19px] leading-loose'
                            : 'text-[15px] sm:text-[17px] leading-relaxed'
                        }`}
                      >
                        {t(pair.translation)}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic">
                        {t('（本段今释整理中，请参详左侧古文与文末白话今译）')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
