'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2, GitFork, Network, Trees } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const LineageViewTabs: React.FC = () => {
  const pathname = usePathname();
  const { t, getHref } = useLang();

  const isLineage = pathname?.includes('/lineage');
  const isGraph = pathname?.includes('/graph');

  return (
    <div className="inline-flex items-center p-1 rounded-2xl bg-stone-200/70 dark:bg-slate-800/80 backdrop-blur-md border border-stone-300/60 dark:border-slate-700/60 shadow-inner">
      <Link
        prefetch={false}
        href={getHref('/graph')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          isGraph
            ? 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Network className="w-3.5 h-3.5" />
        <span>{t('全网知识图谱')}</span>
      </Link>

      <Link
        prefetch={false}
        href={getHref('/lineage')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          isLineage
            ? 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Trees className="w-3.5 h-3.5" />
        <span>{t('祖师法脉树')}</span>
      </Link>
    </div>
  );
};
