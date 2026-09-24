'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, ChevronDown, BookOpen, Layers, Library } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { isTraditional, toggleLang, t, getHref } = useLang();

  const isBooksActive =
    pathname.startsWith('/books') ||
    pathname.startsWith('/zh-tw/books') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/zh-tw/categories') ||
    pathname.startsWith('/collections') ||
    pathname.startsWith('/zh-tw/collections');

  const otherNavLinks = [
    { href: getHref('/concepts'), label: t('概念'), active: pathname.startsWith('/concepts') || pathname.startsWith('/zh-tw/concepts') },
    { href: getHref('/methods'), label: t('法门'), active: pathname.startsWith('/methods') || pathname.startsWith('/zh-tw/methods') },
    { href: getHref('/koan'), label: t('公案'), active: pathname.startsWith('/koan') || pathname.startsWith('/zh-tw/koan') },
    { href: getHref('/faq'), label: t('问答'), active: pathname.startsWith('/faq') || pathname.startsWith('/zh-tw/faq') },
    { href: getHref('/persons'), label: t('人物'), active: pathname.startsWith('/persons') || pathname.startsWith('/zh-tw/persons') },
    { href: getHref('/graph'), label: t('图谱'), active: pathname.startsWith('/graph') || pathname.startsWith('/zh-tw/graph') },
    { href: getHref('/practice'), label: t('禅修'), active: pathname.startsWith('/practice') || pathname.startsWith('/zh-tw/practice') },
  ];

  return (
    <header className="h-16 bg-[#0B1120] text-slate-200 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-lg">
      {/* 移动端汉堡按钮：派发事件给 Sidebar 抽屉 */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('zen:toggle-sidebar'))}
        aria-label="打开菜单"
        className="md:hidden p-2 -ml-1 mr-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link prefetch={true} href={getHref('/')} className="text-[15px] font-semibold text-slate-300 font-serif-zen italic hidden lg:block tracking-wide hover:text-white transition-colors">
        "{t('直指人心，见性成佛；教外别传，不立文字。')}"
      </Link>

      {/* Top Nav Links */}
      <nav className="hidden md:flex items-center space-x-5 text-[14px] font-medium ml-auto">
        {/* 首页 */}
        <Link
          prefetch={true}
          href={getHref('/')}
          className={`transition-all py-1.5 px-1 ${
            pathname === '/' || pathname === '/zh-tw'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400 scale-105'
              : 'hover:text-white text-slate-300 hover:scale-105'
          }`}
        >
          {t('首页')}
        </Link>

        {/* 书籍（带迅速响应的下拉菜单） */}
        <div className="relative group py-2">
          <Link
            prefetch={true}
            href={getHref('/books')}
            className={`flex items-center gap-1 transition-all py-1.5 px-1 ${
              isBooksActive
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400 scale-105'
                : 'hover:text-white text-slate-300 hover:scale-105'
            }`}
          >
            <span>{t('书籍')}</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-amber-400" />
          </Link>

          {/* 下拉浮层卡片 */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 hidden group-hover:block z-50">
            <div className="w-52 p-1.5 bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl space-y-1">
              <Link
                prefetch={true}
                href={getHref('/books')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">{t('典籍总览')}</div>
                  <div className="text-[10px] text-slate-400">{t('167部经典全景检索')}</div>
                </div>
              </Link>
              <Link
                prefetch={true}
                href={getHref('/categories')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors"
              >
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">{t('经藏分类')}</div>
                  <div className="text-[10px] text-slate-400">{t('11大正统经藏门类')}</div>
                </div>
              </Link>
              <Link
                prefetch={true}
                href={getHref('/collections')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors"
              >
                <Library className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">{t('典籍合集')}</div>
                  <div className="text-[10px] text-slate-400">{t('14大宗师专题法脉')}</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 其余主导航项 */}
        {otherNavLinks.map((link) => (
          <Link
            key={link.href}
            prefetch={true}
            href={link.href}
            className={`transition-all py-1.5 px-1 ${
              link.active
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400 scale-105'
                : 'hover:text-white text-slate-300 hover:scale-105'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Traditional / Simplified Toggle Button */}
      <button
        onClick={toggleLang}
        title={isTraditional ? '切换为简体中文' : '切換為繁體中文'}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[13px] font-semibold hover:bg-amber-500/20 hover:text-amber-100 transition-all ml-auto md:ml-3 shadow-sm"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-serif-zen">{isTraditional ? '簡體' : '繁體'}</span>
      </button>
    </header>
  );
};
