'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { isTraditional, toggleLang, t, getHref } = useLang();

  const navLinks = [
    { href: getHref('/'), label: t('首页') },
    { href: getHref('/books'), label: t('书籍') },
    { href: getHref('/concepts'), label: t('概念') },
    { href: getHref('/methods'), label: t('法门') },
    { href: getHref('/koan'), label: t('公案') },
    { href: getHref('/faq'), label: t('问答') },
    { href: getHref('/persons'), label: t('人物') },
    { href: getHref('/graph'), label: t('图谱') },
    { href: getHref('/practice'), label: t('禅修') },
  ];

  return (
    <header className="h-16 bg-[#0B1120] text-slate-200 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-lg">
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
        {navLinks.map((link) => (
          <Link
            key={link.href}
            prefetch={true}
            href={link.href}
            className={`transition-all py-1.5 px-1 ${
              pathname === link.href
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
