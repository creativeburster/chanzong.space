'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { TranslationCard } from '@/components/TranslationCard';
import { GlossaryCard } from '@/components/GlossaryCard';
import { VerseCard, KoanCard, QuoteCard, PracticeCard, ModernAppCard, HistoryCard, RelatedBooksCard, AudioToolbarButton } from '@/components/ClassicCards';
import { extractCards } from '@/lib/extractCards';
import { ClassicItem } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Users,
  Gem,
  Compass,
  MessageSquare,
  HelpCircle,
  ListOrdered,
  Sun,
  Moon,
  Leaf,
  BookmarkCheck,
  X,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { LinkCardGrid } from '@/components/InternalLinkCards';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

interface ClassicViewerProps {
  meta: ClassicItem;
  htmlContent: string;
  rawContent: string;
  manifest: ClassicItem[];
  prevItem: ClassicItem | null;
  nextItem: ClassicItem | null;
}

type ReadingTheme = 'paper' | 'bamboo' | 'night';

const THEME_STYLES: Record<
  ReadingTheme,
  {
    label: string;
    icon: any;
    pageBg: string;
    bannerBg: string;
    bannerText: string;
    cardBg: string;
    cardBorder: string;
    proseText: string;
    secondaryText: string;
  }
> = {
  paper: {
    label: '宣纸',
    icon: Sun,
    pageBg: 'bg-[#FAF9F6]',
    bannerBg: 'bg-white',
    bannerText: 'text-zinc-900',
    cardBg: 'bg-white',
    cardBorder: 'border-zinc-200',
    proseText: 'text-zinc-800',
    secondaryText: 'text-zinc-500',
  },
  bamboo: {
    label: '竹青',
    icon: Leaf,
    pageBg: 'bg-[#F2F6F0]',
    bannerBg: 'bg-[#F9FCF7]',
    bannerText: 'text-[#1E3020]',
    cardBg: 'bg-[#FCFDFB]',
    cardBorder: 'border-[#DEE7DB]',
    proseText: 'text-[#2C3E2D]',
    secondaryText: 'text-[#5C725E]',
  },
  night: {
    label: '暗夜',
    icon: Moon,
    pageBg: 'bg-[#0B1329]',
    bannerBg: 'bg-[#0F1A38]',
    bannerText: 'text-slate-100',
    cardBg: 'bg-[#131F42]',
    cardBorder: 'border-slate-800',
    proseText: 'text-slate-200',
    secondaryText: 'text-slate-400',
  },
};

function getSafeHtmlChunk(html: string, ratio: number): string {
  if (ratio >= 1 || html.length < 3000) return html;
  const targetLen = Math.ceil(html.length * ratio);
  const closingTags = ['</p>', '</h2>', '</h3>', '</div>', '</blockquote>', '</ul>', '</ol>', '</li>'];
  let bestPos = -1;
  for (const tag of closingTags) {
    const pos = html.indexOf(tag, targetLen);
    if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
      bestPos = pos + tag.length;
    }
  }
  if (bestPos !== -1 && bestPos <= html.length) {
    return html.slice(0, bestPos);
  }
  return html;
}

export const ClassicViewer: React.FC<ClassicViewerProps> = ({
  meta,
  htmlContent,
  rawContent,
  manifest,
  prevItem,
  nextItem,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [theme, setTheme] = useState<ReadingTheme>('paper');
  const [tocOpen, setTocOpen] = useState(false);
  const [displayRatio, setDisplayRatio] = useState(0.15);
  const [faqsExpanded, setFaqsExpanded] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [showProgressBanner, setShowProgressBanner] = useState(false);
  const { t, tHtml, isTraditional, getHref } = useLang();

  // 1. 初始化读取用户偏好主题与阅读进度
  useEffect(() => {
    const localTheme = localStorage.getItem('zen_reading_theme') as ReadingTheme;
    if (localTheme && THEME_STYLES[localTheme]) {
      setTheme(localTheme);
    }
    const localFontSize = localStorage.getItem('zen_font_size') as 'normal' | 'large';
    if (localFontSize) {
      setFontSize(localFontSize);
    }

    const progKey = `zen_progress_${meta.id}`;
    const p = localStorage.getItem(progKey);
    if (p) {
      const num = parseFloat(p);
      if (num > 12 && num < 95) {
        setSavedProgress(Math.round(num));
        setShowProgressBanner(true);
      }
    }
  }, [meta.id]);

  const handleThemeChange = (newTheme: ReadingTheme) => {
    setTheme(newTheme);
    localStorage.setItem('zen_reading_theme', newTheme);
  };

  const handleFontSizeChange = () => {
    const next = fontSize === 'normal' ? 'large' : 'normal';
    setFontSize(next);
    localStorage.setItem('zen_font_size', next);
  };

  // 2. 监听滚动并自动存储阅读进度
  useEffect(() => {
    let timeoutId: any;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          const ratio = (window.scrollY / total) * 100;
          localStorage.setItem(`zen_progress_${meta.id}`, ratio.toFixed(1));
        }
      }, 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [meta.id]);

  const resumeReading = () => {
    if (savedProgress !== null) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (savedProgress / 100) * total;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setShowProgressBanner(false);
    }
  };

  const scrollToSection = (id: string) => {
    setTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const relPersons = ZEN_PERSONS.filter((p) => p.relatedBooks.includes(meta.id));
  const relConcepts = ZEN_CONCEPTS.filter((c) => c.relatedBooks.includes(meta.id));
  const relMethods = ZEN_METHODS.filter((m) => m.relatedBooks.includes(meta.id));
  const relQas = ZEN_KOANS.filter((q) => q.relatedBooks.includes(meta.id));
  const relFaqs = ZEN_FAQS.filter((f) => f.relatedBooks && f.relatedBooks.includes(meta.id));

  // 自动提取卡片数据
  const extracted = extractCards(rawContent);
  const relQuotes = relPersons.flatMap((p) => p.quotes || []);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTheme = THEME_STYLES[theme];

  // 目录大纲项
  const tocItems = [
    { id: 'sec-article', title: '📖 典籍导读与原文' },
    ...(extracted.verses.length > 0 ? [{ id: 'sec-verses', title: '📿 核心偈颂' }] : []),
    ...(extracted.koans.length > 0 ? [{ id: 'sec-koans', title: '⚡ 公案精选' }] : []),
    { id: 'sec-translations', title: '💡 白话今译' },
    { id: 'sec-glossary', title: '🈳 生僻字词注音' },
    ...(relQuotes.length > 0 ? [{ id: 'sec-quotes', title: '💬 祖师法语' }] : []),
    ...(extracted.practices.length > 0 ? [{ id: 'sec-practices', title: '🧘 实修要旨' }] : []),
    { id: 'sec-history', title: '📜 传法背景' },
    { id: 'sec-network', title: '🔗 知识网络与延伸' },
  ];

  const renderedHtml = useMemo(() => {
    const chunk = getSafeHtmlChunk(htmlContent, displayRatio);
    return isTraditional ? tHtml(chunk) : chunk;
  }, [htmlContent, displayRatio, isTraditional, tHtml]);

  return (
    <div className={`min-h-screen flex ${currentTheme.pageBg} transition-colors duration-300`}>
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        {/* Top Banner Header */}
        <div className={`${currentTheme.bannerBg} border-b ${currentTheme.cardBorder} py-6 sm:py-10 shadow-sm transition-colors duration-300`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Breadcrumb items={[{ label: '经典', href: '/books' }, { label: meta.title }]} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] sm:text-[13px] font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-block mb-2 sm:mb-3">
                  {t(meta.category)}
                </span>
                <h1 className={`text-2xl sm:text-4xl font-bold font-serif-zen ${currentTheme.bannerText} leading-tight`}>
                  {t(meta.title)}
                </h1>
                <p className={`mt-1.5 sm:mt-2 text-xs font-bold ${currentTheme.secondaryText}`}>
                  {t('作者')}：{t(meta.author)} · {t('分类')}：{t(meta.category)} · {Math.round(meta.word_count / 1000 * 10) / 10}k {t('字')}
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* 护眼主题选择器 */}
                <div className={`flex items-center p-1 rounded-xl border ${currentTheme.cardBorder} bg-black/5`}>
                  {(['paper', 'bamboo', 'night'] as ReadingTheme[]).map((thm) => {
                    const cfg = THEME_STYLES[thm];
                    const Icon = cfg.icon;
                    const isActive = theme === thm;
                    return (
                      <button
                        key={thm}
                        onClick={() => handleThemeChange(thm)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-900 text-white shadow-sm'
                            : `${currentTheme.secondaryText} hover:text-amber-800`
                        }`}
                        title={`切换为${cfg.label}主题`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 字号切换 */}
                <button
                  onClick={handleFontSizeChange}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border ${currentTheme.cardBorder} text-xs sm:text-[13px] font-semibold ${currentTheme.bannerText} hover:border-amber-700 transition-all`}
                >
                  {fontSize === 'normal' ? t('大号字体') : t('标准字体')}
                </button>

                {/* 目录大纲抽屉开关 */}
                <button
                  onClick={() => setTocOpen(true)}
                  className={`flex items-center space-x-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border ${currentTheme.cardBorder} text-xs sm:text-[13px] font-semibold ${currentTheme.bannerText} hover:border-amber-700 transition-all`}
                  title="查看目录大纲"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t('目录')}</span>
                </button>

                <AudioToolbarButton rawContent={rawContent} />

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-900 text-white text-xs sm:text-[13px] font-semibold hover:bg-amber-800 transition-all shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span>{copied ? t('已复制全文') : t('复制全文')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 续读浮动提示 Banner */}
        {showProgressBanner && savedProgress !== null && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-4 animate-fade-in">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm shadow-sm">
              <div className="flex items-center space-x-2">
                <BookmarkCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>您上次阅读至约 <strong>{savedProgress}%</strong> 位置</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resumeReading}
                  className="px-3 py-1 rounded-lg bg-amber-900 text-white font-semibold text-xs hover:bg-amber-800 transition-colors shadow-sm"
                >
                  继续阅读
                </button>
                <button
                  onClick={() => setShowProgressBanner(false)}
                  className="p-1 text-amber-700/60 hover:text-amber-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Reading Viewport */}
        <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-12 w-full">
          <article
            id="sec-article"
            className={`${currentTheme.cardBg} p-4 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border ${currentTheme.cardBorder} shadow-md sm:shadow-lg transition-colors duration-300`}
          >
            <div
              className={`prose prose-zinc max-w-none font-serif-zen ${currentTheme.proseText} leading-relaxed ${
                fontSize === 'large' ? 'text-[18px] sm:text-[21px] space-y-5 sm:space-y-6' : 'text-[16px] sm:text-[19px] space-y-3.5 sm:space-y-4'
              }`}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {displayRatio < 1 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="w-full max-w-xs h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${Math.round(displayRatio * 100)}%` }} />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDisplayRatio((r) => Math.min(1, r + 0.15))}
                    className="px-5 py-2.5 rounded-xl bg-amber-900 text-white text-[14px] font-semibold hover:bg-amber-800 transition-all shadow-md"
                  >
                    {t('加载更多')}
                  </button>
                  <button
                    onClick={() => setDisplayRatio(1)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-600 text-[14px] font-semibold hover:border-amber-700 hover:text-amber-800 transition-all"
                  >
                    {t('显示全部')}
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  {t('已显示')} {Math.round(displayRatio * 100)}% · {t('约')} {Math.round(rawContent.length * displayRatio)} / {rawContent.length} {t('字')}
                </p>
              </div>
            )}
          </article>

          {/* 核心偈颂 */}
          <div id="sec-verses">
            <VerseCard verses={extracted.verses} />
          </div>

          {/* 公案精选 */}
          <div id="sec-koans">
            <KoanCard koans={extracted.koans} />
          </div>

          {/* 白话今译（分页） */}
          <div id="sec-translations">
            <TranslationCard classicId={meta.id} />
          </div>

          {/* 生僻字解释 */}
          <div id="sec-glossary">
            <GlossaryCard sourceIds={[meta.id]} />
          </div>

          {/* 祖师名言 */}
          <div id="sec-quotes">
            <QuoteCard quotes={relQuotes} personNames={relPersons.map(p => p.name)} />
          </div>

          {/* 实践指导 */}
          <div id="sec-practices">
            <PracticeCard practices={extracted.practices} relMethods={relMethods} />
          </div>

          {/* 现代启示 */}
          <div id="sec-modern">
            <ModernAppCard apps={extracted.modernApp} />
          </div>

          {/* 历史背景 */}
          <div id="sec-history">
            <HistoryCard meta={meta} relPersons={relPersons} />
          </div>

          {/* 相关经典 */}
          <RelatedBooksCard manifest={manifest} currentId={meta.id} />

          {/* 延伸阅读：交叉引用 */}
          <div id="sec-network">
            {(relPersons.length > 0 || relConcepts.length > 0 || relMethods.length > 0 || relQas.length > 0 || relFaqs.length > 0) && (
              <div className={`mt-10 ${currentTheme.cardBg} p-6 sm:p-10 rounded-3xl border ${currentTheme.cardBorder} shadow-md space-y-6 transition-colors duration-300`}>
                <h2 className={`text-xl font-bold font-serif-zen ${currentTheme.bannerText}`}>
                  {t('🔗 延伸阅读 · 知识网络')}
                </h2>

                {relPersons.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-blue-800">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>{t('相关祖师')}</span>
                    </div>
                    <LinkCardGrid
                      items={relPersons.map(p => ({ id: p.id, title: p.name, summary: p.title, href: `/persons/${p.id}` }))}
                      variant="blue"
                    />
                  </div>
                )}

                {relConcepts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-800">
                      <Gem className="w-5 h-5 text-purple-600" />
                      <span>{t('相关概念')}</span>
                    </div>
                    <LinkCardGrid
                      items={relConcepts.map(c => ({ id: c.id, title: c.title, summary: c.summary?.slice(0, 60), href: `/concepts/${c.id}` }))}
                      variant="purple"
                    />
                  </div>
                )}

                {relMethods.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-800">
                      <Compass className="w-5 h-5 text-sky-600" />
                      <span>{t('相关法门')}</span>
                    </div>
                    <LinkCardGrid
                      items={relMethods.map(m => ({ id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}` }))}
                      variant="sky"
                    />
                  </div>
                )}

                {relQas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-800">
                      <MessageSquare className="w-5 h-5 text-rose-600" />
                      <span>{t('相关公案')}</span>
                    </div>
                    <LinkCardGrid
                      items={relQas.map(q => ({ id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}` }))}
                      variant="rose"
                      columns={3}
                    />
                  </div>
                )}

                {relFaqs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-800">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>{t('相关问答')}</span>
                      <span className="text-xs text-emerald-700/60">({t('共')} {relFaqs.length} {t('条')})</span>
                    </div>
                    <div className="space-y-3">
                      {(relFaqs.length > 4 && !faqsExpanded ? relFaqs.slice(0, 4) : relFaqs).map(f => (
                        <div key={f.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                          <div className="text-[14px] font-semibold text-emerald-900 mb-1">{t(f.question)}</div>
                          <div className="text-[13px] text-emerald-800/80 leading-relaxed">{t(f.answer).slice(0, 120)}{f.answer.length > 120 ? '...' : ''}</div>
                        </div>
                      ))}
                    </div>
                    {relFaqs.length > 4 && (
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={() => setFaqsExpanded(!faqsExpanded)}
                          className="px-4 py-1.5 rounded-xl border border-emerald-200 text-[13px] font-semibold text-emerald-800 hover:bg-emerald-50 transition-all"
                        >
                          {faqsExpanded ? t('收起') : `${t('展开全部问答')} (${t('共')} ${relFaqs.length} ${t('条')})`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Pagination */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevItem ? (
              <Link prefetch={false} href={getHref(`/classics/${prevItem.id}`)}
                className={`w-full sm:w-auto p-4 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.cardBorder} hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center space-x-3 shadow-sm group`}
              >
                <ChevronLeft className="w-5 h-5 text-amber-800 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('上一篇')}</div>
                  <div className={`text-[15px] font-semibold font-serif-zen ${currentTheme.bannerText} group-hover:text-amber-700`}>
                    {t(prevItem.title)}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {nextItem ? (
              <Link prefetch={false} href={getHref(`/classics/${nextItem.id}`)}
                className={`w-full sm:w-auto p-4 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.cardBorder} hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-end space-x-3 shadow-sm group text-right ml-auto`}
              >
                <div>
                  <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('下一篇')}</div>
                  <div className={`text-[15px] font-semibold font-serif-zen ${currentTheme.bannerText} group-hover:text-amber-700`}>
                    {t(nextItem.title)}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-800 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : <div />}
          </div>
        </main>

        <SiteFooter />
      </div>

      {/* 浮动目录大纲抽屉 (TOC Drawer) */}
      {tocOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setTocOpen(false)}
        >
          <div
            className={`w-full max-w-sm h-full ${currentTheme.cardBg} border-l ${currentTheme.cardBorder} shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-left`}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 mb-4">
                <div className="flex items-center space-x-2">
                  <ListOrdered className="w-5 h-5 text-amber-700" />
                  <span className={`font-bold font-serif-zen text-base ${currentTheme.bannerText}`}>
                    {t('目录大纲')}
                  </span>
                </div>
                <button
                  onClick={() => setTocOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {tocItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                      currentTheme.secondaryText
                    } hover:text-amber-700 hover:bg-amber-50/60`}
                  >
                    <span>{item.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
              </div>
            </div>

            <div className={`pt-4 border-t ${currentTheme.cardBorder} text-xs ${currentTheme.secondaryText} text-center`}>
              {meta.title} · {Math.round(meta.word_count / 1000 * 10) / 10}k 字
            </div>
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
};
