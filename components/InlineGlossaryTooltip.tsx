'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, X, BookOpen } from 'lucide-react';
import { GlossaryEntry } from '@/lib/glossary';
export { injectGlossaryMarkups } from '@/lib/glossaryMarkup';

interface ActiveTooltipState {
  char: string;
  pinyin: string;
  meaning: string;
  rect: DOMRect;
  pinned: boolean; // 是否点击固定
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

  const scheduleClose = (delay = 350) => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActive((prev) => {
        // 如果已被点击固定，则不自动关闭
        if (prev?.pinned) return prev;
        return null;
      });
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
          setActive(() => ({ char, pinyin, meaning, rect, pinned: false }));
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.zen-glossary-term');
      if (target) {
        scheduleClose(350);
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
          // 点击切换固定状态
          setActive({ char, pinyin, meaning, rect, pinned: true });
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
  const tooltipWidth = 320;
  const tooltipHeight = 175;
  const margin = 12;

  let top = active.rect.top - tooltipHeight - margin;
  let placement: 'top' | 'bottom' = 'top';

  if (top < 10) {
    top = active.rect.bottom + margin;
    placement = 'bottom';
  }

  let left = active.rect.left + active.rect.width / 2 - tooltipWidth / 2;
  if (left < 12) left = 12;
  if (typeof window !== 'undefined' && left + tooltipWidth > window.innerWidth - 12) {
    left = window.innerWidth - tooltipWidth - 12;
  }

  return (
    <div
      ref={tooltipRef}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={() => scheduleClose(250)}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 99999,
      }}
      className="bg-white/95 dark:bg-slate-900/95 border-2 border-amber-500/70 dark:border-amber-500/50 rounded-2xl shadow-2xl p-4 animate-fade-in text-left pointer-events-auto backdrop-blur-xl ring-4 ring-amber-500/10"
    >
      {/* 头部：字形大字、拼音音标、朗读与关闭 */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-200/60 dark:border-amber-900/60">
        <div className="flex items-baseline space-x-2.5">
          <span className="text-2xl font-bold font-serif-zen text-amber-950 dark:text-amber-300">
            {active.char}
          </span>
          <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-300/80 dark:border-amber-700/60">
            [ {active.pinyin} ]
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => speakChar(active.char)}
            className={`p-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 transition-all ${
              isPlayingAudio ? 'animate-pulse text-amber-600' : ''
            }`}
            title="真人语音朗读"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActive(null)}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="关闭浮层"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 内容：字词释义 */}
      <div className="text-[13.5px] text-stone-700 dark:text-stone-200 leading-relaxed font-serif-zen">
        <p>{active.meaning}</p>
      </div>

      {/* 底部功能栏 */}
      <div className="mt-3 pt-2 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          禅宗典籍字词注音
        </span>
        <span className="text-amber-600/80 dark:text-amber-400/80">
          {active.pinned ? '📌 已固定卡片' : '轻触可固定'}
        </span>
      </div>
    </div>
  );
};
