'use client';

import React from 'react';
import Link from 'next/link';
import { STATS } from '@/lib/stats';
import { useLang } from '@/context/LangContext';

const formatCount = (n: number) => {
  if (n >= 1000) {
    const v = (n / 1000).toFixed(1).replace(/\.0$/, '');
    return `${v}k`;
  }
  return `${n}`;
};

export const StatsOverview = () => {
  const { t, getHref } = useLang();

  const stats = [
    { num: `${STATS.classics}`, label: t('核心著作'), action: t('查看全部'), href: '/books' },
    { num: `${STATS.concepts}`, label: t('核心概念'), action: t('探索概念'), href: '/concepts' },
    { num: `${STATS.methods}`, label: t('修持法门'), action: t('修持法门'), href: '/methods' },
    { num: `${STATS.koans}`, label: t('公案'), action: t('参究公案'), href: '/koan' },
    { num: formatCount(STATS.faqs), label: t('经典问答'), action: t('阅读问答'), href: '/faq' },
    { num: `${STATS.persons}`, label: t('关键人物'), action: t('阅读传记'), href: '/persons' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 my-10 max-w-6xl mx-auto">
      {stats.map((item, idx) => (
        <Link
          key={idx}
          prefetch={false}
          href={getHref(item.href)}
          className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-600/50 transition-all text-center group"
        >
          <div className="text-[32px] sm:text-[40px] leading-none tracking-tight font-bold font-serif-zen text-slate-900 mb-3 group-hover:text-amber-800 transition-colors">
            {item.num}
          </div>
          <div className="text-xs text-slate-500 font-bold mb-3">
            {item.label}
          </div>
          <div className="inline-flex items-center text-[13px] font-semibold text-slate-700 group-hover:text-amber-800 transition-colors">
            <span>→ {item.action}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};
