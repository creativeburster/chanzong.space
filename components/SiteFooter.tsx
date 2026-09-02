'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

export const SiteFooter = () => {
  const { t, getHref } = useLang();

  return (
    <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800 py-8 text-xs text-center">
      <div className="flex items-center justify-center space-x-3">
        <span>© {new Date().getFullYear()} {t('禅宗知识库 (chanzong.space) · 传承顿悟见性之道')}</span>
        <span className="text-slate-600">|</span>
        <Link prefetch={false} href={getHref('/sitemap')} className="text-slate-400 hover:text-amber-400 transition-colors">
          {t('站点地图')}
        </Link>
        <span className="text-slate-600">|</span>
        <Link prefetch={false} href={getHref('/about')} className="text-slate-400 hover:text-amber-400 transition-colors">
          {t('关于本站')}
        </Link>
      </div>
    </footer>
  );
};
