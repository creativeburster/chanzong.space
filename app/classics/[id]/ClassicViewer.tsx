'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import { TranslationCard } from '@/components/TranslationCard';
import { GlossaryCard } from '@/components/GlossaryCard';
import {
  VerseCard,
  KoanCard,
  QuoteCard,
  PracticeCard,
  ModernAppCard,
  HistoryCard,
  RelatedBooksCard,
  AudioToolbarButton,
} from '@/components/ClassicCards';
import { InlineGlossaryTooltip, injectGlossaryMarkups } from '@/components/InlineGlossaryTooltip';
import { BilingualReader } from '@/components/BilingualReader';
import { ClassicItem } from '@/lib/data';
import type { PersonItem, ConceptItem, MethodItem, KoanItem, FAQItem } from '@/lib/taxonomy';
import { ZEN_GLOSSARY } from '@/lib/glossary';
import { getCollectionByClassicId } from '@/lib/collections';
import { splitClassicVolumes, ClassicVolume } from '@/lib/splitVolumes';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Sparkles,
  Copy,
  Check,
  Share2,
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

import { ExtractedCards, extractCards, extractAudioText, extractOriginalParagraphs, extractGuidesAndQuotes } from '@/lib/extractCards';

interface ClassicViewerProps {
  meta: ClassicItem;
  manifest: ClassicItem[];
  prevItem: ClassicItem | null;
  nextItem: ClassicItem | null;
  extracted?: ExtractedCards;
  audioText?: string;
  originalParagraphs?: string[];
  summaryInfo?: { guide?: string; quotes?: string; gist?: string };
  volumesMeta?: { index: number; title: string }[];
  guideHtml?: string;
  children?: React.ReactNode;
  relPersons?: PersonItem[];
  relConcepts?: ConceptItem[];
  relMethods?: MethodItem[];
  relQas?: KoanItem[];
  relFaqs?: FAQItem[];
  // 保留可选 rawContent/htmlContent 仅作兜底兼容
  rawContent?: string;
  htmlContent?: string;
}

export type ReadingTheme = 'paper' | 'bamboo' | 'night';
export type ClassicViewMode = 'original' | 'bilingual' | 'modern';

export const THEME_STYLES: Record<
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
    accentColor: string;
  }
> = {
  paper: {
    label: '宣纸',
    icon: Sun,
    pageBg: 'bg-[#FAF9F6]',
    bannerBg: 'bg-white',
    bannerText: 'text-slate-900',
    cardBg: 'bg-white',
    cardBorder: 'border-amber-900/10',
    proseText: 'text-stone-800',
    secondaryText: 'text-stone-500',
    accentColor: 'text-amber-800',
  },
  bamboo: {
    label: '竹青',
    icon: Leaf,
    pageBg: 'bg-[#DFEAE0]',
    bannerBg: 'bg-[#EBF3EC]',
    bannerText: 'text-[#0E2512]',
    cardBg: 'bg-[#EBF3EC]',
    cardBorder: 'border-[#BDD2BD]',
    proseText: 'text-[#122E16]',
    secondaryText: 'text-[#3D6144]',
    accentColor: 'text-[#1B4D22]',
  },
  night: {
    label: '暗夜',
    icon: Moon,
    pageBg: 'bg-[#090E17]',
    bannerBg: 'bg-[#0F172A]',
    bannerText: 'text-slate-100',
    cardBg: 'bg-[#0F172A]',
    cardBorder: 'border-slate-800',
    proseText: 'text-slate-200',
    secondaryText: 'text-slate-400',
    accentColor: 'text-amber-400',
  },
};

export const ClassicViewer: React.FC<ClassicViewerProps> = ({
  meta,
  manifest,
  prevItem,
  nextItem,
  extracted: propExtracted,
  audioText: propAudioText,
  originalParagraphs: propOriginalParagraphs,
  summaryInfo: propSummaryInfo,
  volumesMeta: propVolumesMeta,
  guideHtml: propGuideHtml,
  relPersons = [],
  relConcepts = [],
  relMethods = [],
  relQas = [],
  relFaqs = [],
  children,
  htmlContent,
  rawContent,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [theme, setTheme] = useState<ReadingTheme>('paper');
  const [viewMode, setViewMode] = useState<ClassicViewMode>('original');
  const [tocOpen, setTocOpen] = useState(false);
  const [faqsExpanded, setFaqsExpanded] = useState(false);
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [showProgressBanner, setShowProgressBanner] = useState(false);
  const { t, tHtml, isTraditional, getHref } = useLang();

  // 分卷解析与状态（若传入 volumesMeta 则直接使用，避免客户端解析整书大 HTML）
  const parsedVolumes = useMemo(() => {
    if (propVolumesMeta) return null;
    return htmlContent ? splitClassicVolumes(htmlContent) : null;
  }, [htmlContent, propVolumesMeta]);

  const isMultiVolume = propVolumesMeta ? propVolumesMeta.length > 1 : Boolean(parsedVolumes?.isMultiVolume);
  const activeVolumesMeta = useMemo(() => {
    if (propVolumesMeta) return propVolumesMeta;
    if (parsedVolumes) return parsedVolumes.volumes.map(v => ({ index: v.index, title: v.title }));
    return [];
  }, [propVolumesMeta, parsedVolumes]);

  const [selectedVolumeIdx, setSelectedVolumeIdx] = useState(0);
  const [volumeMode, setVolumeMode] = useState<'single' | 'all'>('all');

  // 1. 初始化读取用户偏好主题、阅读进度与阅读模式
  useEffect(() => {
    const localTheme = localStorage.getItem('zen_reading_theme') as ReadingTheme;
    if (localTheme && THEME_STYLES[localTheme]) {
      setTheme(localTheme);
    }
    const localFontSize = localStorage.getItem('zen_font_size') as 'normal' | 'large';
    if (localFontSize) {
      setFontSize(localFontSize);
    }
    const localMode = localStorage.getItem('zen_classic_view_mode') as ClassicViewMode;
    if (localMode && ['original', 'bilingual', 'modern'].includes(localMode)) {
      setViewMode(localMode);
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


  const handleViewModeChange = (mode: ClassicViewMode) => {
    setViewMode(mode);
    localStorage.setItem('zen_classic_view_mode', mode);
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

  const parentCollection = useMemo(() => getCollectionByClassicId(meta.id), [meta.id]);

  // 自动提取卡片数据（优先使用服务端预提取轻量结构）
  const extracted = useMemo(() => {
    if (propExtracted) return propExtracted;
    if (rawContent) return extractCards(rawContent);
    return { verses: [], koans: [], practices: [], modernApp: [], keyQuotes: [] };
  }, [propExtracted, rawContent]);

  const activeAudioText = useMemo(() => {
    if (propAudioText) return propAudioText;
    if (rawContent) return extractAudioText(rawContent);
    return '';
  }, [propAudioText, rawContent]);

  const activeOriginalParagraphs = useMemo(() => {
    if (propOriginalParagraphs) return propOriginalParagraphs;
    if (rawContent) return extractOriginalParagraphs(rawContent).slice(0, 40);
    return [];
  }, [propOriginalParagraphs, rawContent]);

  const activeSummaryInfo = useMemo(() => {
    if (propSummaryInfo) return propSummaryInfo;
    if (rawContent) return extractGuidesAndQuotes(rawContent);
    return undefined;
  }, [propSummaryInfo, rawContent]);

  const relQuotes = relPersons.flatMap((p) => p.quotes || []);

  const handleCopyAttribution = () => {
    const selection = typeof window !== 'undefined' ? window.getSelection()?.toString()?.trim() : '';
    const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://chanzong.space/classics/${meta.id}`;
    let textToCopy = '';

    if (selection && selection.length > 0) {
      textToCopy = `“${selection}”\n\n————————————\n出处：《${meta.title}》（${meta.author} 著）\n链接：${pageUrl}\n来源：禅宗知识库 (chanzong.space)\n著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。`;
    } else {
      const summarySnippet = meta.summary || `${meta.title}，${meta.author}著，传承禅宗核心旨趣。`;
      textToCopy = `《${meta.title}》· ${meta.author} 著\n主旨：${summarySnippet}\n\n阅读全文：${pageUrl}\n来源：禅宗知识库 (chanzong.space)\n著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。`;
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentTheme = THEME_STYLES[theme];

  // 目录大纲项
  const tocItems = [
    { id: 'sec-article', title: t('📖 典籍导读与原文') },
    ...(extracted.verses.length > 0 ? [{ id: 'sec-verses', title: t('📿 核心偈颂') }] : []),
    ...(extracted.koans.length > 0 ? [{ id: 'sec-koans', title: t('⚡ 公案精选') }] : []),
    { id: 'sec-translations', title: t('💡 白话今译') },
    { id: 'sec-glossary', title: t('🈳 生僻字词注音') },
    ...(relQuotes.length > 0 ? [{ id: 'sec-quotes', title: t('💬 祖师法语') }] : []),
    ...(extracted.practices.length > 0 ? [{ id: 'sec-practices', title: t('🧘 实修要旨') }] : []),
    { id: 'sec-history', title: t('📜 传法背景') },
    { id: 'sec-network', title: t('🔗 知识网络与延伸') },
  ];

  // 生僻字标注与 HTML 转换（默认自然注音与解释）
  const classicGlossary = useMemo(() => ZEN_GLOSSARY[meta.id] || [], [meta.id]);

  // 渲染导读 HTML (仅多卷模式时独立渲染)
  const renderedGuideHtml = useMemo(() => {
    if (propGuideHtml) return propGuideHtml;
    if (!parsedVolumes || !parsedVolumes.isMultiVolume) return '';
    const withGlossary = injectGlossaryMarkups(parsedVolumes.guideHtml, classicGlossary, true);
    return isTraditional ? tHtml(withGlossary) : withGlossary;
  }, [propGuideHtml, parsedVolumes, isTraditional, tHtml, classicGlossary]);

  // 渲染正文 HTML (未传 children 时的兜底渲染逻辑，确保 100% 完整直出)
  const renderedVolumeHtml = useMemo(() => {
    if (children) return '';
    if (!htmlContent) return '';
    if (!parsedVolumes || !parsedVolumes.isMultiVolume) {
      const withGlossary = injectGlossaryMarkups(htmlContent, classicGlossary, true);
      return isTraditional ? tHtml(withGlossary) : withGlossary;
    }

    if (volumeMode === 'single') {
      const curVol = parsedVolumes.volumes[selectedVolumeIdx] || parsedVolumes.volumes[0];
      const withGlossary = injectGlossaryMarkups(curVol?.html || '', classicGlossary, true);
      return isTraditional ? tHtml(withGlossary) : withGlossary;
    } else {
      // 全卷展开模式
      const allVolHtml = parsedVolumes.volumes
        .map((v) => v.html)
        .join('\n\n<div class="my-8 border-b border-dashed border-amber-900/20"></div>\n\n');
      const withGlossary = injectGlossaryMarkups(allVolHtml, classicGlossary, true);
      return isTraditional ? tHtml(withGlossary) : withGlossary;
    }
  }, [children, parsedVolumes, volumeMode, selectedVolumeIdx, htmlContent, isTraditional, tHtml, classicGlossary]);

  return (
    <div data-theme={theme} className={`min-h-screen flex ${currentTheme.pageBg} transition-colors duration-300`}>
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        {/* Top Banner Header */}
        <div className={`${currentTheme.bannerBg} border-b ${currentTheme.cardBorder} py-6 sm:py-10 shadow-sm transition-colors duration-300`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Breadcrumb
              items={[
                { label: t('经典'), href: getHref('/books') },
                ...(parentCollection
                  ? [{ label: t(parentCollection.title), href: getHref(`/collections/${parentCollection.id}`) }]
                  : []),
                { label: t(meta.title) },
              ]}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-[12px] sm:text-[13px] font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 inline-block">
                    {t(meta.category)}
                  </span>
                  {parentCollection && (
                    <Link
                      href={getHref(`/collections/${parentCollection.id}`)}
                      className="text-[12px] sm:text-[13px] font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 hover:bg-amber-500/25 transition-all inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{t('合集')}：{t(parentCollection.title)}</span>
                    </Link>
                  )}
                </div>
                <h1 className={`text-2xl sm:text-4xl font-bold font-serif-zen ${currentTheme.bannerText} leading-tight`}>
                  {t(meta.title)}
                </h1>
                <p className={`mt-1.5 sm:mt-2 text-xs font-bold ${currentTheme.secondaryText}`}>
                  {t('作者')}：{t(meta.author)} · {t('分类')}：{t(meta.category)} · {Math.round(meta.word_count / 1000 * 10) / 10}k {t('字')}
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* 三档阅读模式分段切换 */}
                <div className={`flex items-center p-1 rounded-xl border ${currentTheme.cardBorder} bg-black/5 dark:bg-white/5`}>
                  {(
                    [
                      { id: 'original', label: '📖 原文', full: '原文优先' },
                      { id: 'bilingual', label: '⚖️ 对照', full: '文白对照' },
                      { id: 'modern', label: '💡 精读', full: '白话精读' },
                    ] as const
                  ).map((item) => {
                    const isActive = viewMode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewModeChange(item.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-amber-900 text-white shadow-sm'
                            : `${currentTheme.secondaryText} hover:text-amber-800 dark:hover:text-amber-300`
                        }`}
                        title={`切换为${item.full}模式`}
                      >
                        <span className="sm:hidden">{item.label}</span>
                        <span className="hidden sm:inline">{item.full}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 护眼主题选择器 */}
                <div className={`flex items-center p-1 rounded-xl border ${currentTheme.cardBorder} bg-black/5 dark:bg-white/5`}>
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
                            : `${currentTheme.secondaryText} hover:text-amber-800 dark:hover:text-amber-300`
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

                <AudioToolbarButton rawContent={rawContent} audioText={activeAudioText} />

                <button
                  onClick={handleCopyAttribution}
                  className="flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-900 text-white text-xs sm:text-[13px] font-semibold hover:bg-amber-800 transition-all shadow-md"
                  title="复制选中文字或本篇引文与出处链接"
                >
                  {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span>{copied ? t('已复制出处') : t('复制引文')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 恢复阅读进度横幅 */}
        {showProgressBanner && savedProgress !== null && (
          <div className="bg-amber-900/90 backdrop-blur-sm text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between sticky top-14 z-20 shadow-md">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="w-4 h-4 text-amber-300" />
              <span>
                {t('上次读到约')} <strong className="text-amber-200">{savedProgress}%</strong> {t('处')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resumeReading}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-xs transition-colors"
              >
                {t('继续阅读')}
              </button>
              <button
                onClick={() => setShowProgressBanner(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Reading Viewport */}
        <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-12 w-full">
          {/* 全局即时生僻字词悬浮气泡 */}
          <InlineGlossaryTooltip />

          {/* 模式 A：原文优先模式 */}
          {viewMode === 'original' && (
            <>
              <article
                id="sec-article"
                className={`${currentTheme.cardBg} p-4 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl border ${currentTheme.cardBorder} shadow-md sm:shadow-lg transition-colors duration-300`}
              >
                {isMultiVolume ? (
                  <>
                    {/* 现代白话导读与重点区域 */}
                    {renderedGuideHtml && (
                      <div
                        className={`prose prose-zinc max-w-none font-serif-zen ${currentTheme.proseText} leading-relaxed pb-8 border-b ${currentTheme.cardBorder} mb-8 ${
                          fontSize === 'large' ? 'text-[18px] sm:text-[21px] space-y-5 sm:space-y-6' : 'text-[16px] sm:text-[19px] space-y-3.5 sm:space-y-4'
                        }`}
                        dangerouslySetInnerHTML={{ __html: renderedGuideHtml }}
                      />
                    )}

                    {/* 卷级导航工具条 Volume Navigator */}
                    <div className={`p-4 sm:p-5 rounded-2xl border ${currentTheme.cardBorder} bg-amber-500/5 mb-8 space-y-3`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-900 text-white text-xs font-bold shrink-0">
                            {t('第')} {selectedVolumeIdx + 1} / {activeVolumesMeta.length} {t('卷')}
                          </span>
                          <h3 className={`text-base sm:text-lg font-bold font-serif-zen ${currentTheme.bannerText} truncate`}>
                            {t(activeVolumesMeta[selectedVolumeIdx]?.title || '')}
                          </h3>
                        </div>

                        {/* 翻卷与模式控制 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            disabled={selectedVolumeIdx <= 0}
                            onClick={() => {
                              setSelectedVolumeIdx(prev => Math.max(0, prev - 1));
                              setVolumeMode('single');
                              scrollToSection('sec-volume-content');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold disabled:opacity-30 hover:border-amber-700 transition-all flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>{t('上一卷')}</span>
                          </button>

                          {/* 卷次下拉快速跳转 */}
                          <select
                            value={selectedVolumeIdx}
                            onChange={(e) => {
                              setSelectedVolumeIdx(Number(e.target.value));
                              setVolumeMode('single');
                              scrollToSection('sec-volume-content');
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border ${currentTheme.cardBorder} bg-transparent text-xs font-semibold cursor-pointer max-w-[150px] sm:max-w-[220px] truncate`}
                          >
                            {activeVolumesMeta.map((v, i) => (
                              <option key={i} value={i} className="text-zinc-900">
                                {t(v.title)}
                              </option>
                            ))}
                          </select>

                          <button
                            disabled={selectedVolumeIdx >= activeVolumesMeta.length - 1}
                            onClick={() => {
                              setSelectedVolumeIdx(prev => Math.min(activeVolumesMeta.length - 1, prev + 1));
                              setVolumeMode('single');
                              scrollToSection('sec-volume-content');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold disabled:opacity-30 hover:border-amber-700 transition-all flex items-center gap-1"
                          >
                            <span>{t('下一卷')}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* 模式切换 */}
                          <button
                            onClick={() => setVolumeMode(m => m === 'single' ? 'all' : 'single')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              volumeMode === 'all'
                                ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                                : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                            }`}
                          >
                            {volumeMode === 'single' ? t('展开全卷') : t('单卷精读')}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 单卷模式下的隐藏/显示样式控制 */}
                    {volumeMode === 'single' && (
                      <style>{`
                        #sec-volume-content .volume-section { display: none !important; }
                        #sec-volume-content .volume-section[data-volume-idx="${selectedVolumeIdx + 1}"] { display: block !important; }
                      `}</style>
                    )}

                    {/* 卷正文区域 */}
                    <div
                      id="sec-volume-content"
                      className={`prose prose-zinc max-w-none font-serif-zen ${currentTheme.proseText} leading-relaxed ${
                        fontSize === 'large' ? 'text-[18px] sm:text-[21px] space-y-5 sm:space-y-6' : 'text-[16px] sm:text-[19px] space-y-3.5 sm:space-y-4'
                      }`}
                    >
                      {children ? children : <div dangerouslySetInnerHTML={{ __html: renderedVolumeHtml }} />}
                    </div>

                    {/* 单卷模式下的卷末引导翻页卡片 */}
                    {volumeMode === 'single' && activeVolumesMeta.length > 0 && (
                      <div className={`mt-10 p-5 sm:p-6 rounded-2xl border ${currentTheme.cardBorder} bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
                        <div className="text-center sm:text-left">
                          <p className="text-xs text-zinc-400 font-semibold">{t('本卷已阅毕')}</p>
                          <p className={`text-sm font-bold font-serif-zen ${currentTheme.bannerText}`}>
                            {t(activeVolumesMeta[selectedVolumeIdx]?.title || '')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedVolumeIdx > 0 && (
                            <button
                              onClick={() => {
                                setSelectedVolumeIdx(prev => prev - 1);
                                scrollToSection('sec-volume-content');
                              }}
                              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:border-amber-700 transition-all flex items-center gap-1.5"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>{t('上一卷')}</span>
                            </button>
                          )}
                          {selectedVolumeIdx < activeVolumesMeta.length - 1 && (
                            <button
                              onClick={() => {
                                setSelectedVolumeIdx(prev => prev + 1);
                                scrollToSection('sec-volume-content');
                              }}
                              className="px-5 py-2 rounded-xl bg-amber-900 text-white text-xs font-semibold hover:bg-amber-800 transition-all shadow-md flex items-center gap-1.5"
                            >
                              <span>{t('进入下一卷')}</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* 单篇传统渲染（100% 完整直出，彻底杜绝渐进式截断） */}
                    <div
                      className={`prose prose-zinc max-w-none font-serif-zen ${currentTheme.proseText} leading-relaxed ${
                        fontSize === 'large' ? 'text-[18px] sm:text-[21px] space-y-5 sm:space-y-6' : 'text-[16px] sm:text-[19px] space-y-3.5 sm:space-y-4'
                      }`}
                    >
                      {children ? children : <div dangerouslySetInnerHTML={{ __html: renderedVolumeHtml }} />}
                    </div>
                  </>
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
                <QuoteCard quotes={relQuotes} personNames={relPersons.map((p) => p.name)} />
              </div>

              {/* 实践指导 */}
              <div id="sec-practices">
                <PracticeCard practices={extracted.practices} relMethods={relMethods} />
              </div>

              {/* 现代启示 */}
              <div id="sec-modern">
                <ModernAppCard apps={extracted.modernApp} />
              </div>
            </>
          )}

          {/* 模式 B 与 C：文白双栏对照模式 & 白话精读模式 */}
          {(viewMode === 'bilingual' || viewMode === 'modern') && (
            <BilingualReader
              classicId={meta.id}
              rawContent={rawContent}
              originalParagraphs={activeOriginalParagraphs}
              summaryInfo={activeSummaryInfo}
              viewMode={viewMode}
              fontSize={fontSize}
              currentTheme={currentTheme}
            />
          )}

          {/* 历史背景（全模式共享） */}
          <div id="sec-history">
            <HistoryCard meta={meta} relPersons={relPersons} />
          </div>

          {/* 相关经典（全模式共享） */}
          <RelatedBooksCard manifest={manifest} currentId={meta.id} />

          {/* 延伸阅读：交叉引用（全模式共享） */}
          <div id="sec-network">
            {(relPersons.length > 0 || relConcepts.length > 0 || relMethods.length > 0 || relQas.length > 0 || relFaqs.length > 0) && (
              <div className={`mt-10 ${currentTheme.cardBg} p-6 sm:p-10 rounded-3xl border ${currentTheme.cardBorder} shadow-md space-y-6 transition-colors duration-300`}>
                <h2 className={`text-xl font-bold font-serif-zen ${currentTheme.bannerText}`}>
                  {t('🔗 延伸阅读 · 知识网络')}
                </h2>

                {relPersons.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-blue-800 dark:text-blue-400">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>{t('相关祖师')}</span>
                    </div>
                    <LinkCardGrid
                      items={relPersons.map((p) => ({ id: p.id, title: p.name, summary: p.title, href: `/persons/${p.id}` }))}
                      variant="blue"
                    />
                  </div>
                )}

                {relConcepts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-purple-800 dark:text-purple-400">
                      <Gem className="w-5 h-5 text-purple-600" />
                      <span>{t('相关概念')}</span>
                    </div>
                    <LinkCardGrid
                      items={relConcepts.map((c) => ({ id: c.id, title: c.title, summary: c.summary?.slice(0, 60), href: `/concepts/${c.id}` }))}
                      variant="purple"
                    />
                  </div>
                )}

                {relMethods.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-sky-800 dark:text-sky-400">
                      <Compass className="w-5 h-5 text-sky-600" />
                      <span>{t('相关法门')}</span>
                    </div>
                    <LinkCardGrid
                      items={relMethods.map((m) => ({ id: m.id, title: m.title, summary: m.summary?.slice(0, 60), href: `/methods/${m.id}` }))}
                      variant="sky"
                    />
                  </div>
                )}

                {relQas.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-800 dark:text-rose-400">
                      <MessageSquare className="w-5 h-5 text-rose-600" />
                      <span>{t('相关公案')}</span>
                    </div>
                    <LinkCardGrid
                      items={relQas.map((q) => ({ id: q.id, title: q.question, summary: q.answer?.slice(0, 60), href: `/koan/${q.id}` }))}
                      variant="rose"
                      columns={3}
                    />
                  </div>
                )}

                {relFaqs.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[15px] font-semibold text-emerald-800 dark:text-emerald-400">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span>{t('相关问答')}</span>
                      <span className="text-xs text-emerald-700/60 dark:text-emerald-400/60">({t('共')} {relFaqs.length} {t('条')})</span>
                    </div>
                    <div className="space-y-3">
                      {(relFaqs.length > 4 && !faqsExpanded ? relFaqs.slice(0, 4) : relFaqs).map((f) => (
                        <div key={f.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                          <div className="text-[14px] font-semibold text-emerald-900 dark:text-emerald-300 mb-1">{t(f.question)}</div>
                          <div className="text-[13px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">{t(f.answer).slice(0, 120)}{f.answer.length > 120 ? '...' : ''}</div>
                        </div>
                      ))}
                    </div>
                    {relFaqs.length > 4 && (
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={() => setFaqsExpanded(!faqsExpanded)}
                          className="px-4 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[13px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
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
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50 dark:border-zinc-800 mb-4">
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
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                      currentTheme.secondaryText
                    } hover:text-amber-700 hover:bg-amber-50/60 dark:hover:bg-amber-950/40`}
                  >
                    <span>{item.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
              </div>

              {/* 多卷专属分卷目录 */}
              {isMultiVolume && activeVolumesMeta.length > 0 && (
                <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-800">
                  <div className="flex items-center space-x-1.5 mb-2 px-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t('全书分卷目录')} ({activeVolumesMeta.length} {t('卷')})</span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {activeVolumesMeta.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedVolumeIdx(i);
                          setTocOpen(false);
                          scrollToSection('sec-volume-content');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                          selectedVolumeIdx === i
                            ? 'bg-amber-900 text-white font-bold'
                            : `${currentTheme.secondaryText} hover:bg-black/5 dark:hover:bg-white/5`
                        }`}
                      >
                        <span className="truncate pr-2">{t(v.title)}</span>
                        <span className="opacity-60 shrink-0">#{i + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
