'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Layers,
  ListChecks,
  MessageCircle,
  Quote,
  RotateCcw,
  Search,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ReadingThemeBar } from '@/components/ReadingThemeBar';
import { SiteFooter } from '@/components/SiteFooter';
import manifest from '@/manifest.json';
import { useLang } from '@/context/LangContext';
import {
  WANGXIANGLU_ALL_29_CATALOG,
  WXL_BOOKS_NOTES,
  WXL_DISCUSSIONS,
  WXL_LAST_UPDATED,
  type WxlBookProgress,
  type WxlDiscussion,
  type WxlQuote,
  type WxlSection,
} from '@/lib/wangxianglu-notes';

const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);

type ViewMode = 'translations' | 'discussions' | 'quotes' | 'catalog';
type BrowseStyle = 'pager' | 'feed';
type FontSizeMode = 'sm' | 'md' | 'lg';

interface FlatSectionItem {
  book: WxlBookProgress;
  sec: WxlSection;
  globalIndex: number;
}

interface FlatQuoteItem {
  id: string;
  bookIndex: number;
  bookTitle: string;
  sectionTitle: string;
  sectionId: string;
  quote: WxlQuote;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlighted(text: string, query: string, keyPrefix: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={`${keyPrefix}-m-${i}`}
        className="bg-amber-200/80 text-amber-950 px-0.5 rounded-xs font-semibold"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>
    )
  );
}

function renderInlineFormatting(text: string, query: string, keyPrefix: string): React.ReactNode {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const segments = text.split(tokenRegex);
  return segments.map((seg, i) => {
    const k = `${keyPrefix}-${i}`;
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      return (
        <strong key={k} className="font-bold text-slate-900">
          {renderHighlighted(seg.slice(2, -2), query, k)}
        </strong>
      );
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length >= 2) {
      return (
        <em key={k} className="font-semibold text-amber-900 not-italic">
          {renderHighlighted(seg.slice(1, -1), query, k)}
        </em>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length >= 2) {
      return (
        <span
          key={k}
          className="font-serif-zen text-amber-900 bg-amber-50/90 border border-amber-200/80 px-1.5 py-0.5 rounded-md text-[0.94em]"
        >
          {renderHighlighted(seg.slice(1, -1), query, k)}
        </span>
      );
    }
    return <React.Fragment key={k}>{renderHighlighted(seg, query, k)}</React.Fragment>;
  });
}

function RichParagraph({
  raw,
  query,
  t,
  fontSizeClass,
}: {
  raw: string;
  query: string;
  t: (s: string) => string;
  fontSizeClass: string;
}) {
  const text = t(raw);

  if (text.startsWith('#### ')) {
    const heading = text.replace(/^####\s+/, '');
    return (
      <h4 className="text-base sm:text-lg font-bold font-serif-zen text-amber-900 pt-3 pb-1 border-b border-amber-900/10">
        {renderInlineFormatting(heading, query, 'h4')}
      </h4>
    );
  }

  const lines = text.split('\n');

  return (
    <div className={`space-y-2 ${fontSizeClass} text-slate-700 leading-relaxed`}>
      {lines.map((ln, idx) => {
        const trimmed = ln.trim();
        const k = `p-${idx}`;
        if (!trimmed) {
          return <div key={k} className="h-1.5" />;
        }

        // 匹配有序编号列表：如 "1. "、"2. "
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          return (
            <div key={k} className="flex items-start gap-2.5 my-1 pl-1 leading-relaxed">
              <span className="select-none font-bold text-amber-800 text-xs mt-1 w-5 shrink-0 text-right">
                {orderedMatch[1]}.
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineFormatting(orderedMatch[2], query, `ol-${idx}`)}
              </div>
            </div>
          );
        }

        // 匹配无序列表：如 "- "、"* "
        const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={k} className="flex items-start gap-2.5 my-1 pl-1 leading-relaxed">
              <span className="select-none text-amber-700/80 font-bold text-sm shrink-0 mt-0.5 leading-none">
                •
              </span>
              <div className="flex-1 leading-relaxed">
                {renderInlineFormatting(bulletMatch[1], query, `ul-${idx}`)}
              </div>
            </div>
          );
        }

        // 普通正文行
        return (
          <p key={k} className="leading-[1.9]">
            {renderInlineFormatting(ln, query, k)}
          </p>
        );
      })}
    </div>
  );
}

const SECTION_FEED_STEP = 2;
const QA_FEED_STEP = 2;
const QUOTES_STEP = 8;
const CATALOG_PAGE_SIZE = 10;

export default function WangXiangluClient() {
  const { t } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('translations');
  const [browseStyle, setBrowseStyle] = useState<BrowseStyle>('pager');
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [sectionPageIdx, setSectionPageIdx] = useState<number>(0);
  const [sectionFeedCount, setSectionFeedCount] = useState<number>(SECTION_FEED_STEP);
  const [qaPageIdx, setQaPageIdx] = useState<number>(0);
  const [qaFeedCount, setQaFeedCount] = useState<number>(QA_FEED_STEP);
  const [quotesCount, setQuotesCount] = useState<number>(QUOTES_STEP);
  const [catalogPage, setCatalogPage] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState<FontSizeMode>('md');
  const contentTopRef = useRef<HTMLDivElement | null>(null);

  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-[14.5px]'
      : fontSize === 'lg'
        ? 'text-[18px]'
        : 'text-[16px]';

  const normalizedQuery = query.trim().toLowerCase();

  const matchesText = (text?: string | null) => {
    if (!normalizedQuery) return true;
    if (!text) return false;
    const rawLower = text.toLowerCase();
    const localizedLower = t(text).toLowerCase();
    return rawLower.includes(normalizedQuery) || localizedLower.includes(normalizedQuery);
  };

  // Reset pagination indices whenever query or book filter changes
  useEffect(() => {
    setSectionPageIdx(0);
    setSectionFeedCount(SECTION_FEED_STEP);
    setQaPageIdx(0);
    setQaFeedCount(QA_FEED_STEP);
    setQuotesCount(QUOTES_STEP);
    setCatalogPage(0);
  }, [normalizedQuery, selectedBookId]);

  const scrollToContentTop = () => {
    contentTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const flatSections = useMemo<FlatSectionItem[]>(() => {
    const items: FlatSectionItem[] = [];
    let gIdx = 0;
    for (const book of WXL_BOOKS_NOTES) {
      if (selectedBookId !== 'all' && book.id !== selectedBookId) continue;
      for (const sec of book.sections) {
        const matched =
          !normalizedQuery ||
          matchesText(book.title) ||
          matchesText(sec.title) ||
          matchesText(sec.sutraText) ||
          matchesText(sec.originalExcerpt) ||
          sec.translationParagraphs.some((p) => matchesText(p)) ||
          sec.summaryPoints.some((sp) => matchesText(sp)) ||
          sec.quotes.some((q) => matchesText(q.original) || matchesText(q.insight));
        if (matched) {
          gIdx += 1;
          items.push({ book, sec, globalIndex: gIdx });
        }
      }
    }
    return items;
  }, [normalizedQuery, selectedBookId, t]);

  const filteredDiscussions = useMemo<WxlDiscussion[]>(() => {
    if (!normalizedQuery) return WXL_DISCUSSIONS;
    return WXL_DISCUSSIONS.filter((qa) => {
      if (matchesText(qa.title) || matchesText(qa.userQuestion)) return true;
      if (qa.tags.some((tg) => matchesText(tg))) return true;
      return qa.contentBlocks.some(
        (blk) =>
          matchesText(blk.heading) ||
          matchesText(blk.quote) ||
          blk.paragraphs.some((p) => matchesText(p))
      );
    });
  }, [normalizedQuery, t]);

  const allQuotes = useMemo<FlatQuoteItem[]>(() => {
    const items: FlatQuoteItem[] = [];
    for (const book of WXL_BOOKS_NOTES) {
      for (const sec of book.sections) {
        sec.quotes.forEach((q, idx) => {
          items.push({
            id: `${sec.id}-q-${idx + 1}`,
            bookIndex: book.index,
            bookTitle: book.title,
            sectionTitle: sec.title,
            sectionId: sec.id,
            quote: q,
          });
        });
      }
    }
    if (!normalizedQuery) return items;
    return items.filter(
      (item) =>
        matchesText(item.quote.original) ||
        matchesText(item.quote.insight) ||
        matchesText(item.sectionTitle) ||
        matchesText(item.bookTitle)
    );
  }, [normalizedQuery, t]);

  const filteredCatalog = useMemo(() => {
    if (!normalizedQuery) return WANGXIANGLU_ALL_29_CATALOG;
    return WANGXIANGLU_ALL_29_CATALOG.filter(
      (c) => matchesText(c.title) || String(c.index).includes(normalizedQuery)
    );
  }, [normalizedQuery, t]);

  const safeSectionIdx = Math.min(sectionPageIdx, Math.max(0, flatSections.length - 1));
  const safeQaIdx = Math.min(qaPageIdx, Math.max(0, filteredDiscussions.length - 1));
  const totalCatalogPages = Math.max(1, Math.ceil(filteredCatalog.length / CATALOG_PAGE_SIZE));
  const safeCatalogPage = Math.min(catalogPage, totalCatalogPages - 1);

  const visibleSections =
    browseStyle === 'pager'
      ? flatSections.slice(safeSectionIdx, safeSectionIdx + 1)
      : flatSections.slice(0, sectionFeedCount);

  const visibleDiscussions =
    browseStyle === 'pager'
      ? filteredDiscussions.slice(safeQaIdx, safeQaIdx + 1)
      : filteredDiscussions.slice(0, qaFeedCount);

  const visibleQuotes = allQuotes.slice(0, quotesCount);
  const visibleCatalog = filteredCatalog.slice(
    safeCatalogPage * CATALOG_PAGE_SIZE,
    (safeCatalogPage + 1) * CATALOG_PAGE_SIZE
  );

  const totalTranslatedSections = WXL_BOOKS_NOTES.reduce((acc, b) => acc + b.sections.length, 0);
  const totalQuotesCount = WXL_BOOKS_NOTES.reduce(
    (acc, b) => acc + b.sections.reduce((sAcc, s) => sAcc + s.quotes.length, 0),
    0
  );
  const completedBookIndices = WXL_BOOKS_NOTES.filter((b) => b.status === 'completed').map(
    (b) => b.index
  );
  const readingBook = WXL_BOOKS_NOTES.find((b) => b.status === 'reading');
  const totalBooksCount = WANGXIANGLU_ALL_29_CATALOG.length || 29;
  const completedBookWeight = WXL_BOOKS_NOTES.reduce((acc, b) => {
    if (b.status === 'completed') return acc + 1;
    if (b.status === 'reading' && b.totalSections > 0) {
      return acc + b.completedSections / b.totalSections;
    }
    return acc;
  }, 0);
  const progressPercent = Math.max(
    1,
    Math.round((completedBookWeight / totalBooksCount) * 100)
  );
  const progressSummaryText = [
    completedBookIndices.length > 0
      ? `第 ${completedBookIndices.join('、')} 册已读完`
      : null,
    readingBook
      ? `正在共读第 ${readingBook.index} 册（第 ${readingBook.completedSections} / ${readingBook.totalSections} 小节）`
      : null,
  ]
    .filter(Boolean)
    .join('，');

  const viewTabs: {
    id: ViewMode;
    tabId: string;
    panelId: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'translations',
      tabId: 'wxl-tab-translations',
      panelId: 'wxl-panel-translations',
      label: `正篇白话精译（${totalTranslatedSections}节）`,
      icon: BookOpen,
    },
    {
      id: 'discussions',
      tabId: 'wxl-tab-discussions',
      panelId: 'wxl-panel-discussions',
      label: `共读问答备忘（${WXL_DISCUSSIONS.length}篇）`,
      icon: MessageCircle,
    },
    {
      id: 'quotes',
      tabId: 'wxl-tab-quotes',
      panelId: 'wxl-panel-quotes',
      label: `原典金句速查（${totalQuotesCount}句）`,
      icon: Quote,
    },
    {
      id: 'catalog',
      tabId: 'wxl-tab-catalog',
      panelId: 'wxl-panel-catalog',
      label: '全集29册进度表',
      icon: ListChecks,
    },
  ];

  const handleJumpToSection = (sectionId: string) => {
    setViewMode('translations');
    setSelectedBookId('all');
    const targetIdx = WXL_BOOKS_NOTES.flatMap((b) => b.sections).findIndex((s) => s.id === sectionId);
    if (targetIdx !== -1) {
      if (browseStyle === 'pager') {
        setSectionPageIdx(targetIdx);
        scrollToContentTop();
      } else {
        setSectionFeedCount((c) => Math.max(c, targetIdx + 1));
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    }
  };

  const renderSectionPagerBar = (position: 'top' | 'bottom') => {
    if (flatSections.length <= 1) return null;
    const prevItem = safeSectionIdx > 0 ? flatSections[safeSectionIdx - 1] : null;
    const nextItem =
      safeSectionIdx < flatSections.length - 1 ? flatSections[safeSectionIdx + 1] : null;

    return (
      <div className="bg-white rounded-2xl border border-amber-900/15 shadow-xs p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={!prevItem}
          onClick={() => {
            if (prevItem) {
              setSectionPageIdx(safeSectionIdx - 1);
              if (position === 'bottom') scrollToContentTop();
            }
          }}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            prevItem
              ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {prevItem ? t(`上一节：${prevItem.sec.title}`) : t('已是第一小节')}
          </span>
        </button>

        {/* Direct section selector + page indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            {safeSectionIdx + 1} / {flatSections.length}
          </span>
          <select
            aria-label={t('选择跳转小节')}
            value={safeSectionIdx}
            onChange={(e) => {
              setSectionPageIdx(Number(e.target.value));
              if (position === 'bottom') scrollToContentTop();
            }}
            className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-amber-600 max-w-[200px] sm:max-w-[280px]"
          >
            {flatSections.map((item, idx) => (
              <option key={item.sec.id} value={idx}>
                {`${String(idx + 1).padStart(2, '0')}. [${t(`第${item.book.index}册`)}] ${t(item.sec.title)}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!nextItem}
          onClick={() => {
            if (nextItem) {
              setSectionPageIdx(safeSectionIdx + 1);
              if (position === 'bottom') scrollToContentTop();
            }
          }}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            nextItem
              ? 'bg-amber-900 text-amber-100 hover:bg-amber-800 shadow-xs'
              : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {nextItem ? t(`下一节：${nextItem.sec.title}`) : t('已到最新一节')}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    );
  };

  const renderQaPagerBar = (position: 'top' | 'bottom') => {
    if (filteredDiscussions.length <= 1) return null;
    const prevQa = safeQaIdx > 0 ? filteredDiscussions[safeQaIdx - 1] : null;
    const nextQa =
      safeQaIdx < filteredDiscussions.length - 1 ? filteredDiscussions[safeQaIdx + 1] : null;

    return (
      <div className="bg-white rounded-2xl border border-amber-900/15 shadow-xs p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={!prevQa}
          onClick={() => {
            if (prevQa) {
              setQaPageIdx(safeQaIdx - 1);
              if (position === 'bottom') scrollToContentTop();
            }
          }}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            prevQa
              ? 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
              : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {prevQa
              ? t(`上一篇：专题 ${String(prevQa.index).padStart(2, '0')}`)
              : t('已是第一篇')}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            {safeQaIdx + 1} / {filteredDiscussions.length}
          </span>
          <select
            aria-label={t('选择跳转问答专题')}
            value={safeQaIdx}
            onChange={(e) => {
              setQaPageIdx(Number(e.target.value));
              if (position === 'bottom') scrollToContentTop();
            }}
            className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-amber-600 max-w-[200px] sm:max-w-[280px]"
          >
            {filteredDiscussions.map((qa, idx) => (
              <option key={qa.id} value={idx}>
                {`${t('专题')} ${String(qa.index).padStart(2, '0')}：${t(qa.title)}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!nextQa}
          onClick={() => {
            if (nextQa) {
              setQaPageIdx(safeQaIdx + 1);
              if (position === 'bottom') scrollToContentTop();
            }
          }}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            nextQa
              ? 'bg-amber-900 text-amber-100 hover:bg-amber-800 shadow-xs'
              : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {nextQa
              ? t(`下一篇：专题 ${String(nextQa.index).padStart(2, '0')}`)
              : t('已是最后一篇')}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    );
  };

  const renderSectionCard = (book: WxlBookProgress, sec: WxlSection) => (
    <section
      key={sec.id}
      id={sec.id}
      tabIndex={-1}
      className="scroll-mt-24 focus:outline-none"
    >
      <article className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-5 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-amber-900/10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800 font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200/80">
                {t(`第 ${String(book.index).padStart(2, '0')} 册`)} · {t(book.title)}
              </span>
              <span className="text-slate-500 font-normal">
                {t(sec.pdfPageRange)} / {t(sec.mergedPageRange)}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
              {renderHighlighted(t(sec.title), query, `${sec.id}-title`)}
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-slate-600 font-mono">
            {sec.dateAdded}
          </span>
        </div>

        {/* Sutra Text if present */}
        {sec.sutraText && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-l-4 border-amber-600 space-y-1">
            <div className="text-xs font-bold text-amber-800 tracking-wider uppercase">
              {t('【本节经文】')}
            </div>
            <p className="font-serif-zen text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {renderHighlighted(t(sec.sutraText), query, `${sec.id}-sutra`)}
            </p>
          </div>
        )}

        {/* Modern Chinese Translation */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <FileText className="w-3.5 h-3.5" />
            <span>{t('纯现代汉语精译')}</span>
          </div>
          <div className="space-y-4">
            {sec.translationParagraphs.map((para, pIdx) => (
              <RichParagraph
                key={`${sec.id}-p-${pIdx}`}
                raw={para}
                query={query}
                t={t}
                fontSizeClass={fontSizeClass}
              />
            ))}
          </div>
        </div>

        {/* Summary Points */}
        {sec.summaryPoints.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('本节精要总结')}</span>
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-sm sm:text-[15px] text-slate-700 leading-relaxed">
              {sec.summaryPoints.map((sp, sIdx) => (
                <li key={sIdx}>{renderInlineFormatting(t(sp), query, `${sec.id}-sp-${sIdx}`)}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Original Quotes */}
        {sec.quotes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Quote className="w-4 h-4 text-amber-700" />
              <span>{t('原典金句与白话点睛')}</span>
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {sec.quotes.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2"
                >
                  <blockquote className="font-serif-zen text-[15px] sm:text-base font-semibold text-amber-950 leading-relaxed">
                    “{renderInlineFormatting(t(q.original), query, `${sec.id}-qo-${qIdx}`)}”
                  </blockquote>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-amber-800">{t('点睛：')}</span>
                    {renderInlineFormatting(t(q.insight), query, `${sec.id}-qi-${qIdx}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Native HTML <details> for original text (accessible & Ctrl+F searchable) */}
        {sec.originalExcerpt && (
          <details className="group rounded-2xl border border-zinc-200 bg-zinc-50/70">
            <summary className="cursor-pointer select-none px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-800 flex items-center justify-between list-none">
              <span className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>{t('展开查看本节半文言原典对照')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-zinc-200/80 font-serif-zen text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {renderInlineFormatting(t(sec.originalExcerpt), query, `${sec.id}-orig`)}
            </div>
          </details>
        )}
      </article>
    </section>
  );

  const renderDiscussionCard = (qa: WxlDiscussion) => (
    <section
      key={qa.id}
      id={qa.id}
      tabIndex={-1}
      className="scroll-mt-24 focus:outline-none"
    >
      <article className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-5 sm:p-8 space-y-5">
        <div className="space-y-3 pb-4 border-b border-amber-900/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t(`心要问答 · 专题 ${String(qa.index).padStart(2, '0')}`)}</span>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-slate-600 font-mono">
              {qa.dateAdded}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
            {renderHighlighted(t(qa.title), query, `${qa.id}-t`)}
          </h3>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">{t('共读缘起提问：')}</span>
            {renderInlineFormatting(t(qa.userQuestion), query, `${qa.id}-uq`)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {qa.tags.map((tg) => (
              <span
                key={tg}
                className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80"
              >
                #{t(tg)}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {qa.contentBlocks.map((blk, bIdx) => (
            <div key={bIdx} className="space-y-3">
              {blk.heading && (
                <h4 className="text-base sm:text-lg font-bold font-serif-zen text-amber-900 pt-1">
                  {renderInlineFormatting(t(blk.heading), query, `${qa.id}-bh-${bIdx}`)}
                </h4>
              )}
              {blk.quote && (
                <blockquote className="p-4 rounded-2xl bg-amber-50/70 border-l-4 border-amber-600 font-serif-zen text-sm sm:text-[15px] text-amber-950 whitespace-pre-wrap leading-relaxed">
                  {renderInlineFormatting(t(blk.quote), query, `${qa.id}-bq-${bIdx}`)}
                </blockquote>
              )}
              {blk.paragraphs.map((para, pIdx) => (
                <RichParagraph
                  key={`${qa.id}-bp-${bIdx}-${pIdx}`}
                  raw={para}
                  query={query}
                  t={t}
                  fontSizeClass={fontSizeClass}
                />
              ))}
            </div>
          ))}
        </div>
      </article>
    </section>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 selection:bg-amber-900 selection:text-white">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-8 md:py-10">
          {/* Top Breadcrumb + Theme/Font Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Breadcrumb
              items={[
                { label: t('书籍总览'), href: '/books' },
                { label: t('王骧陆全集共读精译札记') },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-amber-900/10 shadow-xs space-x-1">
                <Type className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
                {([
                  { id: 'sm', label: '紧凑' },
                  { id: 'md', label: '标准' },
                  { id: 'lg', label: '大字' },
                ] as { id: FontSizeMode; label: string }[]).map((fs) => (
                  <button
                    key={fs.id}
                    type="button"
                    onClick={() => setFontSize(fs.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      fontSize === fs.id
                        ? 'bg-amber-900 text-amber-100 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t(fs.label)}
                  </button>
                ))}
              </div>
              <ReadingThemeBar />
            </div>
          </div>

          {/* Hero Banner */}
          <article className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-6 sm:p-8 mb-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold">
                  <BookMarked className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('个人精读归档专栏 · 持续连载更新')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-zen text-slate-900 tracking-wide">
                  {t('《王骧陆居士全集》现代白话精译与共读札记')}
                </h1>
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  {t(
                    '按原书册目逐节精译为纯现代汉语，收录原典金句、半文言对照及实修讨论备忘。支持单节翻页阅读与加载更多两种模式。'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 shrink-0 w-full sm:w-auto">
                <div className="px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
                  <div className="text-xl font-extrabold font-mono text-amber-900">
                    {totalTranslatedSections}
                  </div>
                  <div className="text-[11px] text-slate-600">{t('已译小节')}</div>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-sky-50 border border-sky-200/80 text-center">
                  <div className="text-xl font-extrabold font-mono text-sky-900">
                    {WXL_DISCUSSIONS.length}
                  </div>
                  <div className="text-[11px] text-slate-600">{t('心要问答')}</div>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                  <div className="text-xl font-extrabold font-mono text-emerald-900">
                    {totalQuotesCount}
                  </div>
                  <div className="text-[11px] text-slate-600">{t('原典金句')}</div>
                </div>
              </div>
            </div>

            {/* Progress bar & Search + Mode Tabs */}
            <div className="space-y-4 pt-2 border-t border-amber-900/10">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>{t(`当前阅读进度：${progressSummaryText}`)}</span>
                <span className="font-mono text-slate-500">
                  {t('最近更新')}：{WXL_LAST_UPDATED}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-amber-700 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    '在本页精译、原典、金句与问答中实时检索（例如：实体、水晶玻璃、森田疗法、一念、船）...'
                  )}
                  aria-label={t('在本页精译与共读札记中搜索')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label={t('清空搜索关键词')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Single-row scrollable Tablist + Browse Style Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  role="tablist"
                  aria-label={t('共读专栏板块切换')}
                  className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full"
                >
                  {viewTabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = viewMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={tab.tabId}
                        role="tab"
                        aria-selected={active}
                        type="button"
                        onClick={() => setViewMode(tab.id)}
                        className={`relative flex-none inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
                          active
                            ? 'bg-amber-900 text-amber-100 shadow-xs after:content-[""] after:absolute after:inset-x-3 after:bottom-0 after:border-b-2 after:border-amber-300'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{t(tab.label)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Browse style switcher: Pager vs Load More Feed */}
                {(viewMode === 'translations' || viewMode === 'discussions') && (
                  <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBrowseStyle('pager')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        browseStyle === 'pager'
                          ? 'bg-white text-amber-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('单篇翻页')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowseStyle('feed')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        browseStyle === 'feed'
                          ? 'bg-white text-amber-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t('列表加载更多')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>

          <div ref={contentTopRef} className="scroll-mt-20" />

          {/* Main Grid: Content + Sticky TOC Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-9 min-w-0">
              {/* TAB PANEL 1: Translations */}
              <div
                id="wxl-panel-translations"
                role="tabpanel"
                aria-labelledby="wxl-tab-translations"
                hidden={viewMode !== 'translations'}
              >
                <div className="space-y-6">
                  {/* Book Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      {t('按册筛选：')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBookId('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedBookId === 'all'
                          ? 'bg-amber-900 text-amber-100 shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {t(`全部已译（${totalTranslatedSections}节）`)}
                    </button>
                    {WXL_BOOKS_NOTES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBookId(b.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedBookId === b.id
                            ? 'bg-amber-900 text-amber-100 shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        {t(`第${String(b.index).padStart(2, '0')}册《${b.title}》（${b.sections.length}节）`)}
                      </button>
                    ))}
                  </div>

                  {flatSections.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
                      <p className="text-sm text-slate-500">
                        {t('正篇精译中未检索到匹配关键词的内容。')}
                      </p>
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t('清空搜索词')}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {browseStyle === 'pager' && renderSectionPagerBar('top')}

                      <div className="space-y-6">
                        {visibleSections.map(({ book, sec }) => renderSectionCard(book, sec))}
                      </div>

                      {browseStyle === 'pager' ? (
                        renderSectionPagerBar('bottom')
                      ) : (
                        <div className="pt-2 flex flex-col items-center gap-3">
                          <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-700 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round((visibleSections.length / flatSections.length) * 100))}%`,
                              }}
                            />
                          </div>
                          {visibleSections.length < flatSections.length ? (
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setSectionFeedCount((c) =>
                                    Math.min(flatSections.length, c + SECTION_FEED_STEP)
                                  )
                                }
                                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-amber-900 text-amber-100 text-sm font-bold hover:bg-amber-800 transition-all shadow-sm"
                              >
                                <ChevronDown className="w-4 h-4" />
                                <span>
                                  {t('加载更多小节')} ({visibleSections.length} / {flatSections.length})
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSectionFeedCount(flatSections.length)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-amber-50 transition-all"
                              >
                                {t(`展开全部 ${flatSections.length} 节`)}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>
                                {t(`已显示全部 ${flatSections.length} 节精译`)}
                              </span>
                              {flatSections.length > SECTION_FEED_STEP && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSectionFeedCount(SECTION_FEED_STEP);
                                    scrollToContentTop();
                                  }}
                                  className="text-amber-800 font-bold hover:underline"
                                >
                                  {t('收起至前 2 节')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* TAB PANEL 2: Discussions */}
              <div
                id="wxl-panel-discussions"
                role="tabpanel"
                aria-labelledby="wxl-tab-discussions"
                hidden={viewMode !== 'discussions'}
              >
                <div className="space-y-6">
                  {filteredDiscussions.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-sm text-slate-500">
                      {t('问答备忘录中未检索到匹配关键词的专题。')}
                    </div>
                  ) : (
                    <>
                      {browseStyle === 'pager' && renderQaPagerBar('top')}

                      <div className="space-y-6">
                        {visibleDiscussions.map((qa) => renderDiscussionCard(qa))}
                      </div>

                      {browseStyle === 'pager' ? (
                        renderQaPagerBar('bottom')
                      ) : (
                        <div className="pt-2 flex flex-col items-center gap-3">
                          <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-700 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round((visibleDiscussions.length / filteredDiscussions.length) * 100))}%`,
                              }}
                            />
                          </div>
                          {visibleDiscussions.length < filteredDiscussions.length ? (
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setQaFeedCount((c) =>
                                    Math.min(filteredDiscussions.length, c + QA_FEED_STEP)
                                  )
                                }
                                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-amber-900 text-amber-100 text-sm font-bold hover:bg-amber-800 transition-all shadow-sm"
                              >
                                <ChevronDown className="w-4 h-4" />
                                <span>
                                  {t('加载更多问答专题')} ({visibleDiscussions.length} /{' '}
                                  {filteredDiscussions.length})
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setQaFeedCount(filteredDiscussions.length)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-amber-50 transition-all"
                              >
                                {t(`展开全部 ${filteredDiscussions.length} 篇`)}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>
                                {t(`已显示全部 ${filteredDiscussions.length} 篇心要问答`)}
                              </span>
                              {filteredDiscussions.length > QA_FEED_STEP && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQaFeedCount(QA_FEED_STEP);
                                    scrollToContentTop();
                                  }}
                                  className="text-amber-800 font-bold hover:underline"
                                >
                                  {t('收起至前 2 篇')}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* TAB PANEL 3: Quotes Library */}
              <div
                id="wxl-panel-quotes"
                role="tabpanel"
                aria-labelledby="wxl-tab-quotes"
                hidden={viewMode !== 'quotes'}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-amber-700/30">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                      {t('原典金句速查库')}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {t(`当前显示 ${visibleQuotes.length} / ${allQuotes.length} 条原典金句`)}
                    </span>
                  </div>

                  {allQuotes.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t('未检索到匹配的原典金句。')}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {visibleQuotes.map((item) => (
                          <article
                            key={item.id}
                            className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-5 space-y-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-amber-800">
                                {t(`第 ${String(item.bookIndex).padStart(2, '0')} 册`)} ·{' '}
                                {t(item.bookTitle)} · {t(item.sectionTitle)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleJumpToSection(item.sectionId)}
                                className="text-amber-700 hover:underline font-semibold"
                              >
                                {t('跳转阅读该小节')}
                              </button>
                            </div>
                            <blockquote className="font-serif-zen text-base sm:text-lg font-semibold text-amber-950 leading-relaxed border-l-4 border-amber-600 pl-3.5 py-1 bg-amber-50/50 rounded-r-xl">
                              “{renderInlineFormatting(t(item.quote.original), query, `${item.id}-o`)}”
                            </blockquote>
                            <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                              <span className="font-bold text-amber-800">{t('白话点睛：')}</span>
                              {renderInlineFormatting(t(item.quote.insight), query, `${item.id}-i`)}
                            </p>
                          </article>
                        ))}
                      </div>

                      {allQuotes.length > QUOTES_STEP && (
                        <div className="pt-2 flex flex-col items-center gap-3">
                          <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-700 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.round((visibleQuotes.length / allQuotes.length) * 100))}%`,
                              }}
                            />
                          </div>
                          {visibleQuotes.length < allQuotes.length ? (
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuotesCount((c) => Math.min(allQuotes.length, c + QUOTES_STEP))
                                }
                                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-amber-900 text-amber-100 text-sm font-bold hover:bg-amber-800 transition-all shadow-sm"
                              >
                                <ChevronDown className="w-4 h-4" />
                                <span>
                                  {t('加载更多金句')} ({visibleQuotes.length} / {allQuotes.length})
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuotesCount(allQuotes.length)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-amber-50 transition-all"
                              >
                                {t(`显示全部 ${allQuotes.length} 条`)}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setQuotesCount(QUOTES_STEP);
                                scrollToContentTop();
                              }}
                              className="text-xs font-bold text-amber-800 hover:underline"
                            >
                              {t('收起至前 8 条金句')}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* TAB PANEL 4: 29-Book Catalog with Pagination */}
              <div
                id="wxl-panel-catalog"
                role="tabpanel"
                aria-labelledby="wxl-tab-catalog"
                hidden={viewMode !== 'catalog'}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-amber-700/30">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                      {t('《王骧陆居士全集》全 29 册共读进度总表')}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {t(`第 ${safeCatalogPage + 1} / ${totalCatalogPages} 页 · 合订本总计 1238 页`)}
                    </span>
                  </div>

                  <article className="bg-white rounded-3xl border border-amber-900/15 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase">
                            <th className="py-3 px-4 font-bold">{t('序号')}</th>
                            <th className="py-3 px-4 font-bold">{t('书名')}</th>
                            <th className="py-3 px-4 font-bold">{t('状态')}</th>
                            <th className="py-3 px-4 font-bold">{t('页数')}</th>
                            <th className="py-3 px-4 font-bold">{t('合订本页码')}</th>
                            <th className="py-3 px-4 font-bold">{t('在线原典')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {visibleCatalog.map((row) => (
                            <tr key={row.index} className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {String(row.index).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                {renderHighlighted(t(row.title), query, `cat-${row.index}`)}
                              </td>
                              <td className="py-3 px-4">
                                {row.status === 'completed' ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {t('已精读完')}
                                  </span>
                                ) : row.status === 'reading' ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    {t('精读中')}
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-slate-500">
                                    {t('待读')}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-600">{row.pages}</td>
                              <td className="py-3 px-4 font-mono text-slate-600">
                                {row.mergedPageRange}
                              </td>
                              <td className="py-3 px-4">
                                <a
                                  href={row.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800 hover:underline"
                                >
                                  <span>{t('原文')}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  {totalCatalogPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        disabled={safeCatalogPage === 0}
                        onClick={() => setCatalogPage((p) => Math.max(0, p - 1))}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                          safeCatalogPage > 0
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                            : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {t('上一页')}
                      </button>
                      {Array.from({ length: totalCatalogPages }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCatalogPage(idx)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold ${
                            safeCatalogPage === idx
                              ? 'bg-amber-900 text-amber-100'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={safeCatalogPage >= totalCatalogPages - 1}
                        onClick={() =>
                          setCatalogPage((p) => Math.min(totalCatalogPages - 1, p + 1))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                          safeCatalogPage < totalCatalogPages - 1
                            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                            : 'bg-zinc-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {t('下一页')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sticky Interactive Directory Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-20">
              <div className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    {viewMode === 'discussions' ? t('心要问答目录') : t('已译章节目录')}
                  </span>
                  <span className="text-[11px] font-mono text-amber-800">
                    {viewMode === 'discussions'
                      ? `${safeQaIdx + 1}/${filteredDiscussions.length || 1}`
                      : `${safeSectionIdx + 1}/${flatSections.length || 1}`}
                  </span>
                </div>

                {viewMode === 'discussions' ? (
                  <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                    {filteredDiscussions.map((qa, idx) => {
                      const isCurrent =
                        browseStyle === 'pager' ? idx === safeQaIdx : idx < qaFeedCount;
                      return (
                        <button
                          key={qa.id}
                          type="button"
                          onClick={() => {
                            if (browseStyle === 'pager') {
                              setQaPageIdx(idx);
                              scrollToContentTop();
                            } else {
                              setQaFeedCount((c) => Math.max(c, idx + 1));
                              setTimeout(() => {
                                document
                                  .getElementById(qa.id)
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }, 50);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start gap-2 ${
                            browseStyle === 'pager' && idx === safeQaIdx
                              ? 'bg-amber-900 text-amber-100 font-bold shadow-xs'
                              : isCurrent
                                ? 'text-slate-800 hover:bg-amber-50 font-medium'
                                : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono shrink-0">
                            {String(qa.index).padStart(2, '0')}.
                          </span>
                          <span className="line-clamp-2">{t(qa.title)}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                    {flatSections.map((item, idx) => {
                      const isActive =
                        browseStyle === 'pager' &&
                        viewMode === 'translations' &&
                        idx === safeSectionIdx;
                      return (
                        <button
                          key={item.sec.id}
                          type="button"
                          onClick={() => {
                            setViewMode('translations');
                            if (browseStyle === 'pager') {
                              setSectionPageIdx(idx);
                              scrollToContentTop();
                            } else {
                              setSectionFeedCount((c) => Math.max(c, idx + 1));
                              setTimeout(() => {
                                document
                                  .getElementById(item.sec.id)
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }, 50);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start gap-2 ${
                            isActive
                              ? 'bg-amber-900 text-amber-100 font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          <span className="font-mono shrink-0 opacity-75">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">{t(item.sec.title)}</div>
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-amber-200' : 'text-slate-400'
                              }`}
                            >
                              {t(`第 ${String(item.book.index).padStart(2, '0')} 册 · ${item.book.title}`)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={manifest}
      />
    </div>
  );
}
