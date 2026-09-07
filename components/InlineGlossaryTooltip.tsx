'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, X, BookOpen } from 'lucide-react';
import { GlossaryEntry } from '@/lib/glossary';

/**
 * 将 HTML 文本中的生僻字/禅宗术语注入带 dataset 的 <mark> 标签
 * 确保绝不破坏 HTML 标签内部的属性和结构，且优先匹配长词避免嵌套
 */
export function injectGlossaryMarkups(html: string, entries: GlossaryEntry[]): string {
  if (!html || !entries || entries.length === 0) return html;

  // 1. 去重并按词长降序排列
  const map = new Map<string, GlossaryEntry>();
  for (const e of entries) {
    if (e.char && !map.has(e.char)) {
      map.set(e.char, e);
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.char.length - a.char.length);
  if (sorted.length === 0) return html;

  // 2. 正则转义
  const escapeRegExp = (s: string) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const pattern = new RegExp(sorted.map((e) => escapeRegExp(e.char)).join('|'), 'g');

  // 3. 按 HTML 标签拆分，只在纯文本段做替换
  const parts = html.split(/(<[^>]+>)/g);
  for (let i = 0; i < parts.length; i += 2) {
    let text = parts[i];
    if (!text) continue;

    parts[i] = text.replace(pattern, (match) => {
      const entry = map.get(match);
      if (!entry) return match;
      const charEnc = encodeURIComponent(entry.char);
      const pinyinEnc = encodeURIComponent(entry.pinyin);
      const meaningEnc = encodeURIComponent(entry.meaning);
      return `<mark class="zen-glossary-term cursor-help select-none font-medium px-1 py-0.5 rounded bg-amber-500/10 text-amber-900 dark:text-amber-300 border-b-2 border-dashed border-amber-500/60 hover:bg-amber-500/25 hover:border-amber-700 transition-colors" data-char="${charEnc}" data-pinyin="${pinyinEnc}" data-meaning="${meaningEnc}" title="点击或悬浮查看注音释义">${match}</mark>`;
    });
  }

  return parts.join('');
}

interface ActiveTooltipState {
  char: string;
  pinyin: string;
  meaning: string;
  rect: DOMRect;
}

export const InlineGlossaryTooltip: React.FC<{
  containerRef?: React.RefObject<HTMLElement>;
}> = ({ containerRef }) => {
  const [active, setActive] = useState<ActiveTooltipState | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = (delay = 250) => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActive(null);
    }, delay);
  };

  // 朗读当前词语发音
  const speakChar = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.85;
      utter.onstart = () => setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsPlayingAudio(false);
    }
  }, []);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.zen-glossary-term') as HTMLElement | null;
      if (target) {
        clearCloseTimer();
        const charEnc = target.getAttribute('data-char');
        const pinyinEnc = target.getAttribute('data-pinyin');
        const meaningEnc = target.getAttribute('data-meaning');
        if (charEnc && pinyinEnc && meaningEnc) {
          const char = decodeURIComponent(charEnc);
          const pinyin = decodeURIComponent(pinyinEnc);
          const meaning = decodeURIComponent(meaningEnc);
          const rect = target.getBoundingClientRect();
          setActive({ char, pinyin, meaning, rect });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.zen-glossary-term');
      if (target) {
        scheduleClose(300);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.zen-glossary-term') as HTMLElement | null;
      if (target) {
        clearCloseTimer();
        const charEnc = target.getAttribute('data-char');
        const pinyinEnc = target.getAttribute('data-pinyin');
        const meaningEnc = target.getAttribute('data-meaning');
        if (charEnc && pinyinEnc && meaningEnc) {
          const char = decodeURIComponent(charEnc);
          const pinyin = decodeURIComponent(pinyinEnc);
          const meaning = decodeURIComponent(meaningEnc);
          const rect = target.getBoundingClientRect();
          setActive({ char, pinyin, meaning, rect });
        }
      } else if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    };

    const host = containerRef?.current || document.body;
    host.addEventListener('mouseover', handleMouseOver);
    host.addEventListener('mouseout', handleMouseOut);
    host.addEventListener('click', handleClick);

    return () => {
      host.removeEventListener('mouseover', handleMouseOver);
      host.removeEventListener('mouseout', handleMouseOut);
      host.removeEventListener('click', handleClick);
      clearCloseTimer();
    };
  }, [containerRef]);

  if (!active) return null;

  // 计算屏幕定位：优先向上弹出，若上方空间不足则向下弹出
  const tooltipWidth = 300;
  const tooltipHeight = 160;
  const margin = 10;

  let top = active.rect.top - tooltipHeight - margin;
  let placement: 'top' | 'bottom' = 'top';

  if (top < 10) {
    top = active.rect.bottom + margin;
    placement = 'bottom';
  }

  let left = active.rect.left + active.rect.width / 2 - tooltipWidth / 2;
  if (left < 10) left = 10;
  if (typeof window !== 'undefined' && left + tooltipWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltipWidth - 10;
  }

  return (
    <div
      ref={tooltipRef}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={() => scheduleClose(200)}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 9999,
      }}
      className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-2xl p-4 animate-fade-in text-left pointer-events-auto backdrop-blur-md"
    >
      {/* 头部：字、拼音、朗读与关闭 */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-100 dark:border-amber-900/40">
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold font-serif-zen text-amber-900 dark:text-amber-400">
            {active.char}
          </span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
            {active.pinyin}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => speakChar(active.char)}
            className={`p-1.5 rounded-lg text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors ${
              isPlayingAudio ? 'animate-pulse text-amber-600' : ''
            }`}
            title="朗读读音"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActive(null)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="关闭气泡"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 内容：释义 */}
      <div className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed font-serif-zen">
        <p>{active.meaning}</p>
      </div>

      {/* 底部小标签 */}
      <div className="mt-2.5 pt-2 border-t border-amber-50 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-500" />
          禅宗典籍字词注音
        </span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">chanzong.space</span>
      </div>
    </div>
  );
};
