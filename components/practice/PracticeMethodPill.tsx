'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Compass, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export interface PracticeMethodLink {
  label: string; // 如 "六妙门"、"看话禅"、"默照禅"、"坐禅仪"
  href: string; // 路由如 "/methods/liumiaomen" 或 "/classics/liumiaomen"
  type: 'method' | 'classic' | 'person' | 'concept' | 'koan';
  desc?: string; // 简短导语
}

interface PracticeMethodPillProps {
  originTitle: string; // 如 "天台智者大师《六妙门》"
  summary?: string; // 渊源提炼
  links: PracticeMethodLink[];
  className?: string;
}

export const PracticeMethodPill: React.FC<PracticeMethodPillProps> = ({
  originTitle,
  summary,
  links,
  className = '',
}) => {
  const { t, getHref } = useLang();

  const getIcon = (type: PracticeMethodLink['type']) => {
    switch (type) {
      case 'method':
        return <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      case 'classic':
        return <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />;
      case 'person':
        return <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-stone-700 dark:text-stone-300 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md font-bold bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 text-[11px]">
            {t('📜 宗门渊源')}
          </span>
          <span className="font-semibold font-serif-zen text-stone-900 dark:text-stone-100">
            {t(originTitle)}
          </span>
          {summary && (
            <span className="text-stone-500 dark:text-stone-400 hidden md:inline">
              · {t(summary)}
            </span>
          )}
        </div>

        {/* 互链跳转徽章 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {links.map((link, i) => (
            <Link
              key={i}
              prefetch={false}
              href={getHref(link.href)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 border border-amber-900/10 dark:border-amber-700/30 hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-all text-[11px] font-semibold group shadow-2xs"
              title={link.desc ? t(link.desc) : undefined}
            >
              {getIcon(link.type)}
              <span>{t(link.label)}</span>
              <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
