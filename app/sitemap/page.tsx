'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import { SiteFooter } from '@/components/SiteFooter';
import manifest from '@/manifest.json';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { BookOpen, Gem, Compass, MessageSquare, Users, Lightbulb, ChevronDown, ChevronRight, FileText } from 'lucide-react';

export default function SitemapPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    classics: false,
    concepts: false,
    methods: false,
    koans: false,
    persons: false,
    faqs: false,
  });

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = [
    {
      key: 'classics',
      title: '经典著作',
      icon: BookOpen,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      count: STATS.classics,
      href: '/books',
      items: manifest.map((m) => ({
        id: m.id,
        title: m.title,
        sub: m.author,
        href: `/classics/${m.id}`,
      })),
    },
    {
      key: 'concepts',
      title: '核心概念',
      icon: Gem,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      count: STATS.concepts,
      href: '/concepts',
      items: ZEN_CONCEPTS.map((c) => ({
        id: c.id,
        title: c.title,
        sub: c.category,
        href: `/concepts/${c.id}`,
      })),
    },
    {
      key: 'methods',
      title: '修持法门',
      icon: Compass,
      color: 'text-sky-700',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      count: STATS.methods,
      href: '/methods',
      items: ZEN_METHODS.map((m) => ({
        id: m.id,
        title: m.title,
        sub: '',
        href: `/methods/${m.id}`,
      })),
    },
    {
      key: 'koans',
      title: '禅宗公案',
      icon: MessageSquare,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      count: STATS.koans,
      href: '/koan',
      items: ZEN_KOANS.map((k) => ({
        id: k.id,
        title: k.question,
        sub: `${k.master} · ${k.source}`,
        href: `/koan/${k.id}`,
      })),
    },
    {
      key: 'persons',
      title: '祖师人物',
      icon: Users,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      count: STATS.persons,
      href: '/persons',
      items: ZEN_PERSONS.map((p) => ({
        id: p.id,
        title: p.name,
        sub: p.title,
        href: `/persons/${p.id}`,
      })),
    },
    {
      key: 'faqs',
      title: '经典问答',
      icon: Lightbulb,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      count: STATS.faqs,
      href: '/faq',
      items: ZEN_FAQS.map((f) => ({
        id: f.id,
        title: f.question,
        sub: '',
        href: `/faq#${f.id}`,
      })),
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-800 mb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>站点地图</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900 mb-2">
              禅宗知识库 · 全部页面索引
            </h1>
            <p className="text-sm text-slate-500">
              共 {STATS.classics + STATS.concepts + STATS.methods + STATS.koans + STATS.persons + STATS.faqs} 个页面，点击各组标题展开/收起
            </p>
          </div>

          {/* 静态页面 */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-slate-800 mb-3">
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span>主要页面</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { title: '首页', href: '/' },
                { title: '书籍总览', href: '/books' },
                { title: '核心概念', href: '/concepts' },
                { title: '修持法门', href: '/methods' },
                { title: '禅宗公案', href: '/koan' },
                { title: '祖师人物', href: '/persons' },
                { title: '经典问答', href: '/faq' },
                { title: '知识图谱', href: '/graph' },
              ].map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:text-amber-800 transition-colors"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>

          {/* 分组展开列表 */}
          <div className="space-y-3">
            {groups.map((group) => {
              const Icon = group.icon;
              const isOpen = expanded[group.key];
              return (
                <div key={group.key} className={`rounded-2xl border ${group.border} overflow-hidden`}>
                  {/* 组标题 */}
                  <button
                    onClick={() => toggle(group.key)}
                    className={`w-full flex items-center justify-between px-5 py-4 ${group.bg} hover:brightness-95 transition-all`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${group.color}`} />
                      <span className={`text-base font-bold font-serif-zen ${group.color}`}>
                        {group.title}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${group.color} border ${group.border}`}>
                        {group.count}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        href={group.href}
                        className={`text-xs font-bold ${group.color} hover:underline`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看全部 →
                      </Link>
                      {isOpen ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                    </div>
                  </button>

                  {/* 展开内容 */}
                  {isOpen && (
                    <div className="bg-white p-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 block truncate">
                                {item.title}
                              </span>
                              {item.sub && (
                                <span className="text-xs text-slate-500 block truncate">
                                  {item.sub}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 ml-2" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
