'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const { isTraditional, toggleLang, t } = useLang();

  const navLinks = [
    { href: '/', label: t('首页') },
    { href: '/books', label: t('书籍') },
    { href: '/concepts', label: t('概念') },
    { href: '/methods', label: t('法门') },
    { href: '/koan', label: t('公案') },
    { href: '/faq', label: t('问答') },
    { href: '/persons', label: t('人物') },
    { href: '/graph', label: t('图谱') },
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

      <Link href="/" className="text-[15px] font-semibold text-slate-300 font-serif-zen italic hidden lg:block tracking-wide hover:text-white transition-colors">
        "{t('直指人心，见性成佛；教外别传，不立文字。')}"
      </Link>

      {/* Top Nav Links */}
      <nav className="hidden md:flex items-center space-x-5 text-[14px] font-medium ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
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
        className="mr-1 flex items-center space-x-1.5 px-2 py-1.5 text-amber-300 text-[13px] font-semibold hover:text-amber-100 transition-all ml-auto md:ml-3"
      >
        <Globe className="w-4 h-4 text-amber-400" />
        <span>{isTraditional ? '简' : '繁'}</span>
      </button>
    </header>
  );
};
