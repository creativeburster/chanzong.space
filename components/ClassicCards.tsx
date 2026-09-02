'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ScrollText, MessageCircle, Quote, Footprints,
  Globe, Landmark, BookOpen, ChevronDown, ChevronUp,
  Volume2, Square, Pause, Play,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { ExtractedCards, KoanItem, inferHistory } from '@/lib/extractCards';
import { ClassicItem } from '@/lib/data';
import { PersonItem, MethodItem } from '@/lib/taxonomy';

/* ===================== 通用可折叠卡片容器 ===================== */
const CollapsibleCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  count?: number;
  countLabel?: string;
  colorClass: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ icon, title, count, countLabel, colorClass, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-6 bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 sm:px-10 py-5 hover:bg-zinc-50/60 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          {icon}
          <span className="text-xl font-bold font-serif-zen text-zinc-900">{title}</span>
          {count !== undefined && (
            <span className="text-xs font-semibold text-zinc-400">
              共 {count} {countLabel || '条'}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 sm:px-10 pb-8">{children}</div>}
    </div>
  );
};

/* ===================== 1. 核心偈颂卡 ===================== */
export const VerseCard: React.FC<{ verses: string[] }> = ({ verses }) => {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  if (verses.length === 0) return null;

  const INITIAL_LIMIT = 6;
  const shouldLimit = verses.length > INITIAL_LIMIT;
  const visibleVerses = shouldLimit && !expanded ? verses.slice(0, INITIAL_LIMIT) : verses;

  return (
    <CollapsibleCard
      icon={<ScrollText className="w-5 h-5 text-amber-700" />}
      title={t('核心偈颂')}
      count={verses.length}
      countLabel={t('首')}
      colorClass="amber"
      defaultOpen={true}
    >
      <div className="space-y-4">
        {visibleVerses.map((verse, i) => {
          // 处理加粗格式
          const parts = verse.split(/\*\*/);
          return (
            <div key={i} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50">
              <p className="text-[15px] sm:text-[16px] leading-relaxed font-serif-zen text-amber-900">
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-amber-800">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            </div>
          );
        })}

        {shouldLimit && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-5 py-2 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-800 text-[13px] font-semibold hover:bg-amber-100 transition-all shadow-sm"
            >
              {expanded ? t('收起') : `${t('展开全部偈颂')} (${t('共')} ${verses.length} ${t('首')})`}
            </button>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 2. 公案精选卡 ===================== */
export const KoanCard: React.FC<{ koans: KoanItem[] }> = ({ koans }) => {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  if (koans.length === 0) return null;

  const INITIAL_LIMIT = 4;
  const shouldLimit = koans.length > INITIAL_LIMIT;
  const visibleKoans = shouldLimit && !expanded ? koans.slice(0, INITIAL_LIMIT) : koans;

  return (
    <CollapsibleCard
      icon={<MessageCircle className="w-5 h-5 text-violet-700" />}
      title={t('公案精选')}
      count={koans.length}
      countLabel={t('则')}
      colorClass="violet"
      defaultOpen={true}
    >
      <div className="space-y-4">
        {visibleKoans.map((koan, i) => (
          <div key={i} className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/50">
            <p className="text-[14px] font-semibold text-violet-800 mb-1">
              问：{koan.question}
            </p>
            <p className="text-[15px] sm:text-[16px] font-serif-zen text-violet-900">
              答：{koan.answer}
            </p>
          </div>
        ))}

        {shouldLimit && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-5 py-2 rounded-xl border border-violet-200 bg-violet-50/60 text-violet-800 text-[13px] font-semibold hover:bg-violet-100 transition-all shadow-sm"
            >
              {expanded ? t('收起') : `${t('展开全部公案')} (${t('共')} ${koans.length} ${t('则')})`}
            </button>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 3. 祖师名言卡 ===================== */
export const QuoteCard: React.FC<{ quotes: string[]; personNames: string[] }> = ({ quotes, personNames }) => {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  if (quotes.length === 0) return null;

  const INITIAL_LIMIT = 5;
  const shouldLimit = quotes.length > INITIAL_LIMIT;
  const visibleQuotes = shouldLimit && !expanded ? quotes.slice(0, INITIAL_LIMIT) : quotes;

  return (
    <CollapsibleCard
      icon={<Quote className="w-5 h-5 text-emerald-700" />}
      title={t('祖师名言')}
      count={quotes.length}
      countLabel={t('则')}
      colorClass="emerald"
    >
      <div className="space-y-3">
        {visibleQuotes.map((quote, i) => {
          const dashIdx = quote.indexOf('—');
          const text = dashIdx > 0 ? quote.substring(0, dashIdx).trim() : quote;
          const source = dashIdx > 0 ? quote.substring(dashIdx + 1).trim() : '';
          return (
            <div key={i} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/50">
              <p className="text-[15px] sm:text-[16px] leading-relaxed font-serif-zen text-emerald-900">
                {text}
              </p>
              {source && (
                <p className="mt-1.5 text-[12px] text-emerald-600 font-semibold">— {source}</p>
              )}
            </div>
          );
        })}

        {shouldLimit && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-5 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-[13px] font-semibold hover:bg-emerald-100 transition-all shadow-sm"
            >
              {expanded ? t('收起') : `${t('展开全部名言')} (${t('共')} ${quotes.length} ${t('则')})`}
            </button>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 4. 修行指南卡 ===================== */
export const PracticeCard: React.FC<{ practices: string[]; relMethods?: MethodItem[] }> = ({ practices, relMethods = [] }) => {
  const { t } = useLang();
  // 合并：相关法门的steps + 自动提取的practices
  const methodSteps = relMethods.flatMap(m => (m.steps || []).map(s => ({ method: m.title, step: s, id: m.id })));
  const hasContent = practices.length > 0 || methodSteps.length > 0;
  if (!hasContent) return null;
  return (
    <CollapsibleCard
      icon={<Footprints className="w-5 h-5 text-teal-700" />}
      title={t('实践指导')}
      count={methodSteps.length + practices.length}
      countLabel={t('条')}
      colorClass="teal"
      defaultOpen={true}
    >
      <div className="space-y-5">
        {/* 相关法门的步骤（参考ramanamaharshi.space的实践指导） */}
        {relMethods.map(m => m.steps && m.steps.length > 0 && (
          <div key={m.id}>
            <Link prefetch={false} href={`/methods/${m.id}`} className="inline-flex items-center space-x-1.5 mb-2 text-[14px] font-bold text-teal-800 hover:text-teal-600 transition-colors">
              <span>🧘 {t(m.title)}</span>
            </Link>
            <div className="space-y-2">
              {m.steps.map((step, i) => (
                <div key={i} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/50">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-700 text-white text-[12px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-teal-900">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* 自动提取的修行要点 */}
        {practices.length > 0 && (
          <div>
            {methodSteps.length > 0 && <p className="text-[13px] font-bold text-teal-700 mb-2">📌 {t('本文要点')}</p>}
            <div className="space-y-2">
              {practices.map((p, i) => (
                <div key={i} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-teal-50/40 border border-teal-200/40">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white text-[12px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-teal-900">{p}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 5. 现代应用卡 ===================== */
export const ModernAppCard: React.FC<{ apps: string[] }> = ({ apps }) => {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  if (apps.length === 0) return null;

  const INITIAL_LIMIT = 4;
  const shouldLimit = apps.length > INITIAL_LIMIT;
  const visibleApps = shouldLimit && !expanded ? apps.slice(0, INITIAL_LIMIT) : apps;

  return (
    <CollapsibleCard
      icon={<Globe className="w-5 h-5 text-indigo-700" />}
      title={t('现代启示')}
      count={apps.length}
      countLabel={t('条')}
      colorClass="indigo"
    >
      <div className="space-y-3">
        {visibleApps.map((app, i) => (
          <div key={i} className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/50">
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-indigo-900">{app}</p>
          </div>
        ))}

        {shouldLimit && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-800 text-[13px] font-semibold hover:bg-indigo-100 transition-all shadow-sm"
            >
              {expanded ? t('收起') : `${t('展开全部启示')} (${t('共')} ${apps.length} ${t('条')})`}
            </button>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 6. 历史背景卡 ===================== */
export const HistoryCard: React.FC<{ meta: ClassicItem; relPersons?: PersonItem[] }> = ({ meta, relPersons = [] }) => {
  const { t } = useLang();
  // 匹配作者对应的人物（作者字符串中包含人物名，或人物名包含在作者中）
  const matchedPerson = relPersons.find(p =>
    meta.author.includes(p.name) || p.name.includes(meta.author.replace(/\s*译\s*$/, '').trim())
  );
  const history = inferHistory(meta, matchedPerson?.era);
  return (
    <CollapsibleCard
      icon={<Landmark className="w-5 h-5 text-stone-700" />}
      title={t('历史背景')}
      colorClass="stone"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50 text-center">
            <p className="text-[11px] text-stone-500 font-semibold">{t('作者')}</p>
            {matchedPerson ? (
              <Link prefetch={false} href={`/persons/${matchedPerson.id}`}
                className="text-[14px] font-bold text-blue-800 mt-1 hover:text-blue-600 hover:underline transition-colors block"
              >
                {t(meta.author)}
              </Link>
            ) : (
              <p className="text-[14px] font-bold text-stone-800 mt-1">{t(meta.author)}</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50 text-center">
            <p className="text-[11px] text-stone-500 font-semibold">{t('分类')}</p>
            <p className="text-[14px] font-bold text-stone-800 mt-1">{t(meta.category)}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50 text-center">
            <p className="text-[11px] text-stone-500 font-semibold">{t('篇幅')}</p>
            <p className="text-[14px] font-bold text-stone-800 mt-1">
              {history.sizeLabel} · {meta.word_count >= 10000
                ? `${(meta.word_count / 10000).toFixed(1)}万字`
                : `${meta.word_count}字`}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/50 text-center">
            <p className="text-[11px] text-stone-500 font-semibold">{t('时代')}</p>
            <p className="text-[14px] font-bold text-stone-800 mt-1">{history.era || t('待考')}</p>
          </div>
        </div>
        {history.eraDesc && (
          <p className="text-[13px] text-stone-600 leading-relaxed">{history.eraDesc}</p>
        )}
        {matchedPerson && (
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/40">
            <p className="text-[12px] font-bold text-blue-700 mb-1">
              {t('关于')} {t(matchedPerson.name)} · {t(matchedPerson.title)}
            </p>
            <p className="text-[13px] text-blue-900/80 leading-relaxed line-clamp-3">
              {matchedPerson.teachings}
            </p>
            <Link prefetch={false} href={`/persons/${matchedPerson.id}`}
              className="inline-block mt-2 text-[12px] font-semibold text-blue-700 hover:text-blue-500 hover:underline"
            >
              {t('查看完整生平 →')}
            </Link>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

/* ===================== 8a. 语音朗读工具栏按钮（紧凑版，放在右上角） ===================== */
export const AudioToolbarButton: React.FC<{ rawContent: string }> = ({ rawContent }) => {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const utterRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const cleanText = rawContent
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*]\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[💡🗝️📌⚠️💬✅❌🔗]/g, '')
    .replace(/\n{2,}/g, '。')
    .replace(/\n/g, '，')
    .trim();

  const doSpeak = (r: number) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = 'zh-CN';
    utter.rate = r;
    utter.onend = () => { setPlaying(false); setPaused(false); };
    utter.onerror = () => { setPlaying(false); setPaused(false); };
    utterRef.current = utter;
    synth.speak(utter);
    setPlaying(true);
    setPaused(false);
  };

  const togglePlay = () => {
    const synth = window.speechSynthesis;
    if (playing && !paused) {
      synth.pause();
      setPaused(true);
      return;
    }
    if (paused) {
      synth.resume();
      setPaused(false);
      return;
    }
    doSpeak(rate);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  const changeRate = (r: number) => {
    setRate(r);
    if (playing && !paused) {
      doSpeak(r);
    }
  };

  if (!playing) {
    return (
      <button
        onClick={togglePlay}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-[13px] font-semibold text-zinc-700 hover:border-rose-700 hover:text-rose-700 transition-all"
      >
        <Volume2 className="w-4 h-4" />
        <span>{t('朗读全文')}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-0.5 bg-zinc-100 rounded-lg p-0.5">
        {[0.75, 1, 1.25, 1.5].map(r => (
          <button
            key={r}
            onClick={() => changeRate(r)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
              rate === r ? 'bg-rose-700 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
      <button
        onClick={togglePlay}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-700 text-white text-[13px] font-semibold hover:bg-rose-600 transition-all shadow-md"
      >
        {playing && !paused ? (
          <><Pause className="w-4 h-4" /><span>{t('暂停')}</span></>
        ) : (
          <><Play className="w-4 h-4" /><span>{t('继续')}</span></>
        )}
      </button>
      <button
        onClick={stop}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-200 text-zinc-700 text-[13px] font-semibold hover:bg-zinc-300 transition-all"
      >
        <Square className="w-3.5 h-3.5" />
        <span>{t('停止')}</span>
      </button>
    </div>
  );
};

/* ===================== 8b. 语音朗读卡（旧版独立卡片，保留兼容） ===================== */
export const AudioCard: React.FC<{ rawContent: string }> = ({ rawContent }) => {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const utterRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  // 清理文本：去掉markdown符号，只留正文
  const cleanText = rawContent
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*]\s*/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[💡🗝️📌⚠️💬✅❌🔗]/g, '')
    .replace(/\n{2,}/g, '。')
    .replace(/\n/g, '，')
    .trim();

  const speak = () => {
    const synth = window.speechSynthesis;
    if (playing && !paused) {
      synth.pause();
      setPaused(true);
      return;
    }
    if (paused) {
      synth.resume();
      setPaused(false);
      return;
    }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = 'zh-CN';
    utter.rate = rate;
    utter.onend = () => { setPlaying(false); setPaused(false); };
    utter.onerror = () => { setPlaying(false); setPaused(false); };
    utterRef.current = utter;
    synth.speak(utter);
    setPlaying(true);
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  return (
    <div className="mt-6 bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
      <div className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <Volume2 className="w-5 h-5 text-rose-700" />
          <span className="text-xl font-bold font-serif-zen text-zinc-900">{t('语音朗读')}</span>
          <span className="text-xs text-zinc-400">{t('免费 · 浏览器内置语音')}</span>
        </div>
        <div className="flex items-center space-x-2.5">
          {/* 语速选择 */}
          <div className="flex items-center space-x-1 bg-zinc-100 rounded-lg p-1">
            {[0.75, 1, 1.25, 1.5].map(r => (
              <button
                key={r}
                onClick={() => {
                  setRate(r);
                  if (playing) { stop(); }
                }}
                className={`px-2.5 py-1 rounded-md text-[12px] font-semibold transition-all ${
                  rate === r ? 'bg-rose-700 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
          {/* 播放/暂停 */}
          <button
            onClick={speak}
            className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all shadow-md ${
              playing && !paused
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-rose-700 text-white hover:bg-rose-600'
            }`}
          >
            {playing && !paused ? (
              <><Pause className="w-4 h-4" /><span>{t('暂停')}</span></>
            ) : paused ? (
              <><Play className="w-4 h-4" /><span>{t('继续')}</span></>
            ) : (
              <><Play className="w-4 h-4" /><span>{t('朗读全文')}</span></>
            )}
          </button>
          {/* 停止 */}
          {playing && (
            <button
              onClick={stop}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-200 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-300 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t('停止')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ===================== 7. 相关经典卡 ===================== */
export const RelatedBooksCard: React.FC<{ manifest: ClassicItem[]; currentId: string }> = ({ manifest, currentId }) => {
  const { t } = useLang();
  const current = manifest.find(m => m.id === currentId);
  if (!current) return null;
  // 同分类优先，再同作者
  const sameCategory = manifest.filter(m => m.id !== currentId && m.category === current.category);
  const sameAuthor = manifest.filter(m => m.id !== currentId && m.author === current.author && m.category !== current.category);
  const related = [...sameCategory, ...sameAuthor].slice(0, 6);
  if (related.length === 0) return null;
  return (
    <CollapsibleCard
      icon={<BookOpen className="w-5 h-5 text-orange-700" />}
      title={t('相关经典')}
      count={related.length}
      countLabel={t('部')}
      colorClass="orange"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {related.map(book => (
          <Link prefetch={false} key={book.id}
            href={`/classics/${book.id}`}
            className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/50 hover:border-orange-400 hover:shadow-md transition-all group"
          >
            <p className="text-[15px] font-bold font-serif-zen text-orange-900 group-hover:text-orange-700">
              {t(book.title)}
            </p>
            <p className="mt-1 text-[12px] text-orange-600">{t(book.author)}</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              {book.word_count >= 10000
                ? `${(book.word_count / 10000).toFixed(1)}万字`
                : `${book.word_count}字`}
            </p>
          </Link>
        ))}
      </div>
    </CollapsibleCard>
  );
};
