import Link from 'next/link';
import { BookOpen, Gem, Compass, Users, MessageSquare, GitFork } from 'lucide-react';

export const QuickEntryGrid = () => {
  const entries = [
    { title: '书籍总览', desc: '全量 40+ 核心禅宗经典文库', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', href: '/books' },
    { title: '核心概念', desc: '自性、顿悟、平常心、无心等宗旨', icon: Gem, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/concepts' },
    { title: '修行方法', desc: '看话头、默照禅、四行观与直观解脱', icon: Compass, color: 'text-sky-600', bg: 'bg-sky-50', href: '/methods' },
    { title: '人物索引', desc: '达摩、六祖、马祖、黄檗至普照国师', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', href: '/persons' },
    { title: '公案', desc: '古德机锋对决与祖师开悟因缘', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', href: '/koan' },
    { title: '知识图谱', desc: '交互式全景法脉与概念网图', icon: GitFork, color: 'text-amber-700', bg: 'bg-amber-50', href: '/graph' },
  ];

  return (
    <div className="my-10 max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800 mb-4 px-1">
        <span>📍 快速入口</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-600/60 hover:shadow-md transition-all flex items-center space-x-4 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <div className="text-[15px] font-semibold font-serif-zen text-slate-900 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
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