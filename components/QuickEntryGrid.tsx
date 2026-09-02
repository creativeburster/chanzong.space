'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Gem, Compass, Users, MessageSquare, Lightbulb } from 'lucide-react';
import { STATS } from '@/lib/stats';
import { useLang } from '@/context/LangContext';

export const QuickEntryGrid = () => {
  const { t, getHref } = useLang();

  const entries = [
    { title: t('书籍总览'), desc: `${t('全量')} ${STATS.classics} ${t('部核心禅宗经典文库')}`, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', href: '/books' },
    { title: t('核心概念'), desc: t('自性、顿悟、平常心、无心等宗旨'), icon: Gem, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/concepts' },
    { title: t('修持法门'), desc: t('看话头、默照禅、四行观与直观解脱'), icon: Compass, color: 'text-sky-600', bg: 'bg-sky-50', href: '/methods' },
    { title: t('禅宗公案'), desc: t('古德机锋对决与祖师开悟因缘'), icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', href: '/koan' },
    { title: t('经典问答'), desc: `${STATS.faqs} ${t('条问答，覆盖每部经典')}`, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', href: '/faq' },
    { title: t('祖师人物'), desc: t('达摩、六祖、马祖、黄檗至普照国师'), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', href: '/persons' },
  ];

  return (
    <div className="my-10 max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800 mb-4 px-1">
        <span>📍 {t('快速入口')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              prefetch={false}
              href={getHref(item.href)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex items-center space-x-4 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <div className="text-[15px] font-semibold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </div>
                <div className="text-sm text-slate-600 font-medium mt-0.5">
                  {item.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
