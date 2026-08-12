import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { STATS } from '@/lib/stats';

export const StatsOverview = () => {
  const stats = [
    { num: `${STATS.classics}`, label: '核心著作', action: '查看全部', href: '/books' },
    { num: `${STATS.concepts}`, label: '核心概念', action: '探索概念', href: '/concepts' },
    { num: `${STATS.methods}`, label: '修持法门', action: '修持法门', href: '/methods' },
    { num: `${STATS.koans}`, label: '公案', action: '参究公案', href: '/koan' },
    { num: `${STATS.faqs}`, label: '经典问答', action: '阅读问答', href: '/faq' },
    { num: `${STATS.persons}`, label: '关键人物', action: '阅读传记', href: '/persons' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 my-10 max-w-6xl mx-auto">
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