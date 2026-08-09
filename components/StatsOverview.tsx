'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_QAS, ZEN_PERSONS } from '@/lib/taxonomy';

export const StatsOverview: React.FC = () => {
  const stats = [
    { num: `${manifest.length}`, label: '核心著作', action: '查看全部', href: '/books' },
    { num: `${ZEN_CONCEPTS.length}`, label: '核心概念', action: '探索概念', href: '/concepts' },
    { num: `${ZEN_QAS.length}`, label: '精选问答', action: '研读问答', href: '/qa' },
    { num: `${ZEN_PERSONS.length}`, label: '关键人物', action: '阅读传记', href: '/persons' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-10 max-w-6xl mx-auto">
      {stats.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
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
