'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

/* ===================== 通用卡片式链接网格 ===================== */
type LinkItem = {
  id: string;
  title: string;
  summary?: string;
  href: string;
};

export const LinkCardGrid: React.FC<{
  items: LinkItem[];
  variant?: 'blue' | 'purple' | 'sky' | 'rose' | 'amber' | 'emerald';
  columns?: 2 | 3;
}> = ({ items, variant = 'blue', columns = 2 }) => {
  const { t } = useLang();
  if (items.length === 0) return null;

  const colorMap = {
    blue: { bg: 'bg-blue-50/60', border: 'border-blue-200/50', hoverBorder: 'hover:border-blue-400', title: 'text-blue-900 group-hover:text-blue-700', desc: 'text-blue-700/70' },
    purple: { bg: 'bg-purple-50/60', border: 'border-purple-200/50', hoverBorder: 'hover:border-purple-400', title: 'text-purple-900 group-hover:text-purple-700', desc: 'text-purple-700/70' },
    sky: { bg: 'bg-sky-50/60', border: 'border-sky-200/50', hoverBorder: 'hover:border-sky-400', title: 'text-sky-900 group-hover:text-sky-700', desc: 'text-sky-700/70' },
    rose: { bg: 'bg-rose-50/60', border: 'border-rose-200/50', hoverBorder: 'hover:border-rose-400', title: 'text-rose-900 group-hover:text-rose-700', desc: 'text-rose-700/70' },
    amber: { bg: 'bg-amber-50/60', border: 'border-amber-200/50', hoverBorder: 'hover:border-amber-400', title: 'text-amber-900 group-hover:text-amber-700', desc: 'text-amber-700/70' },
    emerald: { bg: 'bg-emerald-50/60', border: 'border-emerald-200/50', hoverBorder: 'hover:border-emerald-400', title: 'text-emerald-900 group-hover:text-emerald-700', desc: 'text-emerald-700/70' },
  };
  const c = colorMap[variant];
  const colClass = columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-3`}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`p-4 rounded-2xl ${c.bg} border ${c.border} ${c.hoverBorder} hover:shadow-md transition-all group`}
        >
          <p className={`text-[15px] font-bold font-serif-zen ${c.title} transition-colors`}>
            {t(item.title)}
          </p>
          {item.summary && (
            <p className={`mt-1 text-[12px] leading-relaxed ${c.desc} line-clamp-2`}>
              {t(item.summary)}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
};

/* ===================== 上下篇导航 ===================== */
export const PrevNextNav: React.FC<{
  prev?: { id: string; title: string; href: string } | null;
  next?: { id: string; title: string; href: string } | null;
}> = ({ prev, next }) => {
  const { t } = useLang();
  if (!prev && !next) return null;

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="w-full sm:w-auto p-4 rounded-2xl bg-white border border-zinc-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center space-x-3 shadow-sm group"
        >
          <span className="text-amber-800 group-hover:-translate-x-1 transition-transform text-lg">‹</span>
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('上一篇')}</div>
            <div className="text-[15px] font-semibold font-serif-zen text-zinc-900 group-hover:text-amber-900">
              {t(prev.title)}
            </div>
          </div>
        </Link>
      ) : <div />}

      {next ? (
        <Link
          href={next.href}
          className="w-full sm:w-auto p-4 rounded-2xl bg-white border border-zinc-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all flex items-center justify-end space-x-3 shadow-sm group text-right ml-auto"
        >
          <div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase">{t('下一篇')}</div>
            <div className="text-[15px] font-semibold font-serif-zen text-zinc-900 group-hover:text-amber-900">
              {t(next.title)}
            </div>
          </div>
          <span className="text-amber-800 group-hover:translate-x-1 transition-transform text-lg">›</span>
        </Link>
      ) : <div />}
    </div>
  );
};
