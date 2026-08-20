'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  BookOpen,
  Gem,
  Compass,
  MessageSquare,
  Users,
  GitFork,
  Info,
  ChevronDown,
  ChevronRight,
  X,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { STATS } from '@/lib/stats';
import sidebarConcepts from '@/lib/sidebar-concepts.json';
import manifest from '@/manifest.json';
import { useLang } from '@/context/LangContext';

const conceptIconMap: Record<string, string> = {
  'buddha-nature': '🪷',
  'prajna': '🔮',
  'emptiness': '🌫️',
  'non-duality': '☯️',
  'koan': '🧩',
  'samadhi': '🧘',
  'affliction-bodhi': '🌱',
  'no-abiding': '🌊',
  'mind-is-buddha': '🪷',
  'not-mind-not-buddha': '❓',
  'all-returns-to-one': '🎯',
  'direct-pointing': '👆',
  'mind-transmission': '📨',
  'beyond-words': '🤐',
  'originally-nothing': '∅',
  'self-nature': '💎',
  'instant-enlightenment': '⚡',
  'ordinary-mind': '🍵',
  'non-mind': '🚫',
  'real-mind': '❤️',
  'yinian-wusheng': '✨',
  'zixin-xianliang': '💡',
  'yixing-sanmei': '🪑',
  'sanlun-tikong': '🌀',
  'weishi-yixin': '👁️',
  'ying-wu-suo-zhu': '🕊️',
  'si-xiang': '🎭',
  'ru-meng-huan-pao-ying': '🎭',
  'wu-yun-jie-kong': '☁️',
  'se-ji-shi-kong': '🌈',
  'wu-gua-ai': '🔓',
  'zhi-huan-ji-li': '🔄',
  'yuanjue-qingjing-xinxing': '💠',
  'si-bing': '🩹',
  'tou-xin-wei-si': '🫀',
  'de-hua-li-zhi': '📜',
  'qi-chu-zheng-xin': '🔍',
  'ba-huan-bian-jian': '🪞',
  'wu-shi-yin-mo': '🧶',
  'xin-jing-ji-fo-tu-jing': '🗺️',
  'ru-bu-er-fa-men': '⚖️',
  'wei-xin-zao': '🎨',
  'wu-ran-jue-xing': '🌅',
  'po-xiang': '🔨',
};

const conceptIcon = (id: string) => conceptIconMap[id] ?? '💎';

// 40部经典差异化图标映射
const classicIconMap: Record<string, string> = {
  'qifo': '🪷',
  'juelin': '🕉️',
  'wenshu': '🗡️',
  'wuran': '🌅',
  'zhangzhi': '👆',
  'xuemaicong': '🩸',
  'wuxinglun': '💡',
  'poxianglun': '🔨',
  'wuxinlun': '🚫',
  'xixulun': '🤫',
  'sixingguan': '🚪',
  'xinxinming': '✉️',
  'fangcunlun': '📐',
  'anxin': '🧘',
  'zuishangcheng': '👑',
  'tanjing': '📜',
  'zhengdaoge': '🎵',
  'mazu': '🐎',
  'baizhang': '🌲',
  'huangbo': '🌿',
  'xiuxinjue': '🔑',
  'linji': '⚡',
  'dunwu': '⚡',
  'zhenxin': '❤️',
  'zhigong': '🎭',
  'xinwangming': '🫀',
  'shenhui': '💎',
  'jingangjing': '💎',
  'xinjing': '🪞',
  'yuanjuejing': '🔵',
  'chanlinbaoxun': '📚',
  'lengyanjing': '👁️',
  'weimojiejing': '🏠',
  'shiniutu': '🐂',
  'baojingsanmei': '🪞',
  'dongshanyulu': '⛰️',
  'yongjia': '🎵',
  'yunmen': '☁️',
  'bashiguijusong': '👁️',
  'wumenguan': '🚪',
};

const classicIcon = (id: string) => classicIconMap[id] ?? '📖';

interface SidebarProps {
  onOpenSearch: () => void;
  classicsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSearch,
  classicsCount = 33,
}) => {
  const pathname = usePathname();
  const { t } = useLang();
  const [coreOpen, setCoreOpen] = useState(true);
  const [classicsOpen, setClassicsOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [moreClassicsOpen, setMoreClassicsOpen] = useState(false);
  const [moreConceptsOpen, setMoreConceptsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // 监听顶栏汉堡按钮派发的开关事件
  useEffect(() => {
    const handler = () => setMobileOpen((v) => !v);
    window.addEventListener('zen:toggle-sidebar', handler);
    return () => window.removeEventListener('zen:toggle-sidebar', handler);
  }, []);

  // 路由切换后自动收起抽屉
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleDesktopSidebar = () => {
    setDesktopCollapsed((v) => {
      const next = !v;
      localStorage.setItem('zen:sidebar-collapsed', String(next));
      return next;
    });
  };

  const isActive = (path: string) => pathname === path;

  const sidebarContent = (
    <>
      {/* Brand Header（点击回到主页） */}
      <Link href="/" className="p-6 border-b border-slate-800 flex items-center space-x-3.5 bg-slate-950/60 hover:bg-slate-900/60 transition-colors group">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/60 shrink-0 shadow-md bg-[#0F172A]">
          <Image src="/logo-nianhua.png" alt="拈花微笑" width={64} height={64} className="w-full h-full object-cover" priority />
        </div>
        <div>
          <div className="font-serif-zen text-lg font-bold text-white tracking-wide leading-snug whitespace-nowrap">
            {t('禅宗知识库')}
          </div>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans mt-0.5 inline-block">
            ChanZong Knowledge Base
          </span>
        </div>
      </Link>

      {/* Quick Search Bar */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onOpenSearch}
          className="w-full px-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-300 text-[13px] font-medium flex items-center justify-between hover:border-amber-500 hover:text-white transition-all shadow-md"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-amber-400" />
            <span className="truncate">{t('搜索标题或内容...')}</span>
          </div>
          <kbd className="px-2 py-0.5 text-xs bg-slate-900 rounded-md border border-slate-700 font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 py-5 px-4 space-y-7 text-[13px] font-medium">
        {/* Section 1: 核心索引 (Core Indexes) */}
        <div>
          <button
            onClick={() => setCoreOpen(!coreOpen)}
            className="w-full flex items-center justify-between text-slate-300 font-semibold tracking-wide px-2 mb-3 hover:text-white text-[13px]"
          >
            <span>📍 {t('核心索引')}</span>
            {coreOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {coreOpen && (
            <div className="space-y-1.5">
              <Link
                href="/books"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/books')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>{t('书籍总览')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {classicsCount}
                </span>
              </Link>

              <Link
                href="/concepts"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/concepts')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Gem className="w-5 h-5 text-emerald-400" />
                  <span>{t('核心概念')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {STATS.concepts}
                </span>
              </Link>

              <Link
                href="/methods"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/methods')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Compass className="w-5 h-5 text-sky-400" />
                  <span>{t('修持法门')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {STATS.methods}
                </span>
              </Link>

              <div className="relative group">
                <Link
                  href="/koan"
                  className={`relative flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                    isActive('/koan') || pathname.startsWith('/koan')
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-rose-400" />
                    <span>{t('禅宗公案')}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                    {STATS.koans}
                  </span>
                </Link>

                <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 hover:block">
                  <Link
                    href="/koan"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                      isActive('/koan')
                        ? 'text-amber-300 font-semibold bg-amber-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MessageSquare className="w-4 h-4 text-rose-400" />
                      <span>{t('公案原案')}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{STATS.koans}</span>
                  </Link>
                  <Link
                    href="/faq"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                      isActive('/faq')
                        ? 'text-amber-300 font-semibold bg-amber-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>{t('参究 FAQ')}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{STATS.faqs}</span>
                  </Link>
                </div>
              </div>

              <Link
                href="/faq"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/faq')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>{t('经典问答')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {STATS.faqs}
                </span>
              </Link>

              <Link
                href="/persons"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/persons')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>{t('祖师人物')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {STATS.persons}
                </span>
              </Link>

              <Link
                href="/graph"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/graph')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GitFork className="w-5 h-5 text-amber-400" />
                  <span>{t('知识图谱')}</span>
                </div>
              </Link>

              <Link
                href="/about"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/about')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-amber-400" />
                  <span>{t('关于本站')}</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Section 2: 经典著作 Submenu */}
        <div>
          <button
            onClick={() => setClassicsOpen(!classicsOpen)}
            className="w-full flex items-center justify-between text-slate-300 font-semibold tracking-wide px-2 mb-3 hover:text-white text-[13px]"
          >
            <span>📖 {t('经典著作')}</span>
            {classicsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {classicsOpen && (
            <div className="space-y-1 pl-2">
              {(manifest as any[]).slice(0, 5).map((book) => (
                <Link
                  key={book.id}
                  href={`/classics/${book.id}`}
                  className={`block px-3 py-2 rounded-xl truncate transition-colors text-sm font-semibold ${
                    pathname === `/classics/${book.id}`
                      ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                  }`}
                >
                  {classicIcon(book.id)} {t(book.title)}
                </Link>
              ))}
              {(manifest as any[]).length > 5 && (
                <button
                  onClick={() => setMoreClassicsOpen(!moreClassicsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition-colors"
                >
                  <span>{moreClassicsOpen ? t('收起') : `${t('展开其余')} ${(manifest as any[]).length - 5} ${t('部')}`}</span>
                  {moreClassicsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
              {moreClassicsOpen && (manifest as any[]).slice(5).map((book) => (
                <Link
                  key={book.id}
                  href={`/classics/${book.id}`}
                  className={`block px-3 py-2 rounded-xl truncate transition-colors text-sm font-semibold ${
                    pathname === `/classics/${book.id}`
                      ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                  }`}
                >
                  {classicIcon(book.id)} {t(book.title)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: 核心概念 Submenu */}
        <div>
          <button
            onClick={() => setConceptsOpen(!conceptsOpen)}
            className="w-full flex items-center justify-between text-slate-300 font-semibold tracking-wide px-2 mb-3 hover:text-white text-[13px]"
          >
            <span>💎 {t('核心概念')}</span>
            {conceptsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {conceptsOpen && (
            <div className="space-y-1 pl-2">
              {sidebarConcepts.slice(0, 5).map((concept) => (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className={`block px-3 py-2 rounded-xl truncate transition-colors text-sm font-semibold ${
                    pathname === `/concepts/${concept.id}`
                      ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
                  }`}
                >
                  {conceptIcon(concept.id)} {t(concept.title)}
                </Link>
              ))}
              {sidebarConcepts.length > 5 && (
                <button
                  onClick={() => setMoreConceptsOpen(!moreConceptsOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-colors"
                >
                  <span>{moreConceptsOpen ? t('收起') : `${t('展开其余')} ${sidebarConcepts.length - 5} ${t('个')}`}</span>
                  {moreConceptsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
              {moreConceptsOpen && sidebarConcepts.slice(5).map((concept) => (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className={`block px-3 py-2 rounded-xl truncate transition-colors text-sm font-semibold ${
                    pathname === `/concepts/${concept.id}`
                      ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
                  }`}
                >
                  {conceptIcon(concept.id)} {t(concept.title)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端固定侧边栏 */}
      {!desktopCollapsed && (
        <aside className="hidden md:flex w-72 bg-[#0F172A] text-slate-200 flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 shadow-2xl overflow-y-auto overflow-x-visible scrollbar-none z-30">
          {/* 右上角折叠按钮 */}
          <button
            onClick={toggleDesktopSidebar}
            className="absolute top-[-3.5px] right-[-6px] z-40 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
            aria-label="收起侧边栏"
          >
            <PanelLeftClose className="w-6 h-6" />
          </button>
          {sidebarContent}
        </aside>
      )}

      {/* 桌面端折叠后的展开按钮 */}
      {desktopCollapsed && (
        <button
          onClick={toggleDesktopSidebar}
          className="hidden md:flex fixed -left-2 top-0 z-30 w-12 h-12 bg-[#0F172A] border-r border-t border-b border-slate-800 rounded-r-2xl items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all shadow-lg"
          aria-label="展开侧边栏"
        >
          <PanelLeftOpen className="w-6 h-6" />
        </button>
      )}

      {/* 移动端抽屉菜单 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[#0F172A] text-slate-200 flex flex-col overflow-y-auto shadow-2xl animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="关闭菜单"
              className="absolute top-7 right-4 text-slate-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
