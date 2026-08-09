'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  BookOpen,
  Gem,
  Compass,
  MessageSquare,
  Users,
  GitFork,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { ZEN_CONCEPTS, ZEN_METHODS, ZEN_QAS, ZEN_PERSONS } from '@/lib/taxonomy';
import { useLang } from '@/context/LangContext';

interface SidebarProps {
  onOpenSearch: () => void;
  classicsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSearch,
  classicsCount = 27,
}) => {
  const pathname = usePathname();
  const { t } = useLang();
  const [coreOpen, setCoreOpen] = useState(true);
  const [classicsOpen, setClassicsOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const isActive = (path: string) => pathname === path;

  const sidebarContent = (
    <>
      {/* Brand Header（点击回到主页） */}
      <Link href="/" className="p-6 border-b border-slate-800 flex items-center space-x-3.5 bg-slate-950/60 hover:bg-slate-900/60 transition-colors group">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/60 shrink-0 shadow-md bg-[#0F172A]">
          <img src="/logo-nianhua.png" alt="拈花微笑" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-serif-zen text-lg font-bold text-white tracking-wide leading-snug whitespace-nowrap">
            {t('禅宗知识库')}
          </h1>
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
                  {ZEN_CONCEPTS.length}
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
                  {ZEN_METHODS.length}
                </span>
              </Link>

              <Link
                href="/qa"
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] transition-all ${
                  isActive('/qa')
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                  <span>{t('禅宗公案')}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono font-bold">
                  {ZEN_QAS.length}
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
                  {ZEN_PERSONS.length}
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
              <Link
                href="/classics/xuemaicong"
                className="block px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
              >
                📖 菩提达摩血脉论
              </Link>
              <Link
                href="/classics/tanjing"
                className="block px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
              >
                📖 六祖法宝坛经
              </Link>
              <Link
                href="/classics/huangbo"
                className="block px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
              >
                📖 黄檗山传心法要
              </Link>
              <Link
                href="/classics/zhenxin"
                className="block px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
              >
                📖 普照知呐真心直说
              </Link>
              <Link
                href="/classics/xiuxinjue"
                className="block px-3 py-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
              >
                📖 普照知呐修心诀
              </Link>
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
              {ZEN_CONCEPTS.slice(0, 4).map((concept) => (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className="block px-3 py-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 truncate transition-colors text-sm font-semibold"
                >
                  💎 {t(concept.title)}
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
      <aside className="hidden md:flex w-72 bg-[#0F172A] text-slate-200 flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 shadow-2xl overflow-y-auto scrollbar-none z-30">
        {sidebarContent}
      </aside>

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
