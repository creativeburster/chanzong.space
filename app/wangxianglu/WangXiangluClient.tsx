'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  ListChecks,
  MessageCircle,
  Quote,
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

type ViewMode = 'all' | 'translations' | 'discussions' | 'quotes' | 'catalog';
type FontSizeMode = 'sm' | 'md' | 'lg';

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
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const segments = text.split(tokenRegex);
  return segments.map((seg, i) => {
    const k = `${keyPrefix}-${i}`;
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      return (
        <strong key={k} className="font-bold text-slate-900">
          {renderHighlighted(seg.slice(2, -2), query, k)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
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
        {renderHighlighted(heading, query, 'h4')}
      </h4>
    );
  }

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const allBullets = lines.length > 0 && lines.every((l) => /^(-|\d+\.)\s/.test(l.trim()));

  if (allBullets) {
    return (
      <ul className={`space-y-2.5 pl-4 border-l-2 border-amber-300/70 ${fontSizeClass} text-slate-700 leading-relaxed`}>
        {lines.map((ln, idx) => {
          const clean = ln.trim().replace(/^-\s+/, '');
          return (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatting(clean, query, `li-${idx}`)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <p className={`${fontSizeClass} text-slate-700 leading-[1.9]`}>
      {lines.map((ln, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <br />}
          {renderInlineFormatting(ln, query, `p-${idx}`)}
        </React.Fragment>
      ))}
    </p>
  );
}

interface FlatQuoteItem {
  id: string;
  bookIndex: number;
  bookTitle: string;
  sectionTitle: string;
  sectionId: string;
  quote: WxlQuote;
}

export default function WangXiangluClient() {
  const { t } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [query, setQuery] = useState('');
  const [fontSize, setFontSize] = useState<FontSizeMode>('md');
  const scrollNavRef = useRef<HTMLElement | null>(null);

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

  const filteredBooks = useMemo<WxlBookProgress[]>(() => {
    if (!normalizedQuery) return WXL_BOOKS_NOTES;
    return WXL_BOOKS_NOTES.map((book) => {
      const matchedSections = book.sections.filter((sec) => {
        if (matchesText(book.title) || matchesText(sec.title) || matchesText(sec.sutraText) || matchesText(sec.originalExcerpt)) {
          return true;
        }
        if (sec.translationParagraphs.some((p) => matchesText(p))) return true;
        if (sec.summaryPoints.some((sp) => matchesText(sp))) return true;
        if (sec.quotes.some((q) => matchesText(q.original) || matchesText(q.insight))) return true;
        return false;
      });
      return { ...book, sections: matchedSections };
    }).filter((b) => b.sections.length > 0);
  }, [normalizedQuery, t]);

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

  const tocItems = useMemo(() => {
    const items: { id: string; label: string; kind: 'book' | 'section' | 'qa' | 'other' }[] = [];
    if (viewMode === 'all' || viewMode === 'translations') {
      for (const book of filteredBooks) {
        items.push({
          id: book.id,
          label: `${String(book.index).padStart(2, '0')} · ${t(book.title)}`,
          kind: 'book',
        });
        for (const sec of book.sections) {
          items.push({
            id: sec.id,
            label: t(sec.title),
            kind: 'section',
          });
        }
      }
    }
    if (viewMode === 'all' || viewMode === 'discussions') {
      if (filteredDiscussions.length > 0) {
        items.push({
          id: 'discussions-area',
          label: t('共读问答备忘录'),
          kind: 'book',
        });
        for (const qa of filteredDiscussions) {
          items.push({
            id: qa.id,
            label: `${t('专题')} ${String(qa.index).padStart(2, '0')}：${t(qa.title)}`,
            kind: 'qa',
          });
        }
      }
    }
    if (viewMode === 'quotes') {
      items.push({ id: 'quotes-area', label: t('原典金句速查库'), kind: 'book' });
    }
    if (viewMode === 'catalog') {
      items.push({ id: 'catalog-area', label: t('全集 29 册共读进度表'), kind: 'book' });
    }
    return items;
  }, [viewMode, filteredBooks, filteredDiscussions, t]);

  useEffect(() => {
    const navEl = scrollNavRef.current;
    if (!navEl) return;
    const navLinks = Array.from(navEl.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    if (navLinks.length === 0) return;

    const supportsScrollTargetGroup =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('scroll-target-group: auto');

    if (supportsScrollTargetGroup) {
      const syncAriaCurrent = () => {
        const currentLink = navEl.querySelector('a:target-current');
        navLinks.forEach((link) => {
          link.setAttribute('aria-current', link === currentLink ? 'true' : 'false');
        });
      };
      syncAriaCurrent();
      document.addEventListener('scrollend', syncAriaCurrent);
      return () => {
        document.removeEventListener('scrollend', syncAriaCurrent);
      };
    }

    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute('href')?.slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const isActive = link.getAttribute('href') === `#${id}`;
              link.classList.toggle('target-current', isActive);
              link.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
          }
        });
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tocItems]);

  const totalTranslatedSections = WXL_BOOKS_NOTES.reduce((acc, b) => acc + b.sections.length, 0);
  const totalQuotesCount = WXL_BOOKS_NOTES.reduce(
    (acc, b) => acc + b.sections.reduce((sAcc, s) => sAcc + s.quotes.length, 0),
    0
  );

  const viewTabs: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: '全景共读（正篇 + 问答）', icon: Sparkles },
    { id: 'translations', label: `正篇白话精译（${totalTranslatedSections}节）`, icon: BookOpen },
    { id: 'discussions', label: `共读问答备忘录（${WXL_DISCUSSIONS.length}篇）`, icon: MessageCircle },
    { id: 'quotes', label: `原典金句速查库（${totalQuotesCount}句）`, icon: Quote },
    { id: 'catalog', label: '全集29册进度表', icon: ListChecks },
  ];

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
                    “{renderHighlighted(t(q.original), query, `${sec.id}-qo-${qIdx}`)}”
                  </blockquote>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-amber-800">{t('点睛：')}</span>
                    {renderHighlighted(t(q.insight), query, `${sec.id}-qi-${qIdx}`)}
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
                <span>{t('展开查看本节半文言原典对照（支持浏览器 Ctrl+F 页内直搜）')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-zinc-200/80 font-serif-zen text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {renderHighlighted(t(sec.originalExcerpt), query, `${sec.id}-orig`)}
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
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <span className="font-bold text-slate-900">{t('共读缘起提问：')}</span>
            {renderHighlighted(t(qa.userQuestion), query, `${qa.id}-uq`)}
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
                  {renderHighlighted(t(blk.heading), query, `${qa.id}-bh-${bIdx}`)}
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
          <article className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-6 sm:p-8 mb-8 space-y-5">
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
                    '按原书册目逐节精译为纯现代汉语，收录原典金句、半文言对照及实修讨论备忘，方便在电脑与手机随时检索重温。'
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
                <span>
                  {t('当前阅读进度：第 1、2 册已读完，正在共读第 3 册（第 1 / 8 小节）')}
                </span>
                <span className="font-mono text-slate-500">
                  {t('最近更新')}：{WXL_LAST_UPDATED}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-amber-700 rounded-full transition-all"
                  style={{ width: `${Math.round((2.125 / 29) * 100)}%` }}
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

              {/* View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {viewTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = viewMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setViewMode(tab.id)}
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                        active
                          ? 'bg-amber-900 text-amber-100 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t(tab.label)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Main Grid: Content + Sticky Scrollspy Nav */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-9 space-y-10 min-w-0">
              {/* Translations View */}
              {(viewMode === 'all' || viewMode === 'translations') && (
                <div className="space-y-8">
                  {filteredBooks.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t('正篇精译中未检索到匹配关键词的内容。')}
                    </div>
                  ) : (
                    filteredBooks.map((book) => (
                      <div key={book.id} className="space-y-5">
                        <section
                          id={book.id}
                          tabIndex={-1}
                          className="scroll-mt-24 focus:outline-none"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-amber-700/30">
                            <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                              {t(`第 ${String(book.index).padStart(2, '0')} 册：《${book.title}》`)}
                            </h2>
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                book.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {book.status === 'completed'
                                ? t(`已精读完 · ${book.completedSections}/${book.totalSections} 节`)
                                : t(`连载中 · 已读 ${book.completedSections}/${book.totalSections} 节`)}
                            </span>
                          </div>
                        </section>

                        <div className="space-y-6">
                          {book.sections.map((sec) => renderSectionCard(book, sec))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Discussions View */}
              {(viewMode === 'all' || viewMode === 'discussions') && (
                <div className="space-y-6">
                  <section
                    id="discussions-area"
                    tabIndex={-1}
                    className="scroll-mt-24 focus:outline-none"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-sky-700/30">
                      <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                        {t('共读问答与心要备忘录')}
                      </h2>
                      <span className="text-xs text-slate-500">
                        {t('收录共读期间针对关键概念与实修困惑的完整拆解')}
                      </span>
                    </div>
                  </section>

                  {filteredDiscussions.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t('问答备忘录中未检索到匹配关键词的专题。')}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredDiscussions.map((qa) => renderDiscussionCard(qa))}
                    </div>
                  )}
                </div>
              )}

              {/* Quotes Library View */}
              {viewMode === 'quotes' && (
                <section
                  id="quotes-area"
                  tabIndex={-1}
                  className="scroll-mt-24 focus:outline-none space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-amber-700/30">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                      {t('原典金句速查库')}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {t(`共匹配 ${allQuotes.length} 条原典金句`)}
                    </span>
                  </div>
                  {allQuotes.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                      {t('未检索到匹配的原典金句。')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {allQuotes.map((item) => (
                        <article
                          key={item.id}
                          className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-5 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-amber-800">
                              {t(`第 ${String(item.bookIndex).padStart(2, '0')} 册`)} · {t(item.bookTitle)} ·{' '}
                              {t(item.sectionTitle)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setViewMode('all');
                                setTimeout(() => {
                                  document
                                    .getElementById(item.sectionId)
                                    ?.scrollIntoView({ behavior: 'smooth' });
                                }, 80);
                              }}
                              className="text-amber-700 hover:underline font-semibold"
                            >
                              {t('定位到正文小节')}
                            </button>
                          </div>
                          <blockquote className="font-serif-zen text-base sm:text-lg font-semibold text-amber-950 leading-relaxed border-l-4 border-amber-600 pl-3.5 py-1 bg-amber-50/50 rounded-r-xl">
                            “{renderHighlighted(t(item.quote.original), query, `${item.id}-o`)}”
                          </blockquote>
                          <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                            <span className="font-bold text-amber-800">{t('白话点睛：')}</span>
                            {renderHighlighted(t(item.quote.insight), query, `${item.id}-i`)}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Catalog 29 Books View */}
              {viewMode === 'catalog' && (
                <section
                  id="catalog-area"
                  tabIndex={-1}
                  className="scroll-mt-24 focus:outline-none space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-2 border-b-2 border-amber-700/30">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-serif-zen text-slate-900">
                      {t('《王骧陆居士全集》全 29 册共读进度总表')}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {t('合订本总计 1238 页 · 数据源：印心书库')}
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
                          {filteredCatalog.map((row) => (
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
                </section>
              )}
            </div>

            {/* Right Sticky Scrollspy Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-20">
              <div className="bg-white rounded-3xl border border-amber-900/15 shadow-sm p-4 space-y-3">
                <div className="text-xs font-bold text-slate-500 tracking-wider uppercase px-2">
                  {t('本页快速目录')}
                </div>
                <nav
                  ref={scrollNavRef}
                  aria-label={t('本页目录导航')}
                  className="wxl-scrollspy-nav space-y-1 max-h-[calc(100vh-11rem)] overflow-y-auto pr-1"
                >
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block border-l-2 border-transparent rounded-r-lg transition-colors truncate ${
                        item.kind === 'book'
                          ? 'px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-amber-50/60 mt-1.5'
                          : 'pl-5 pr-2.5 py-1 text-xs text-slate-600 hover:text-amber-900 hover:bg-amber-50/40'
                      }`}
                      title={item.label}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
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
