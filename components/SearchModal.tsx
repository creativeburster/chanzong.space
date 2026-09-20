'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  BookOpen,
  Users,
  Gem,
  Compass,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  CornerDownLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { ClassicItem } from '@/lib/data';
import type {
  PersonItem,
  ConceptItem,
  MethodItem,
  KoanItem,
  FAQItem,
} from '@/lib/taxonomy';
import { STATS } from '@/lib/stats';
import { useLang } from '@/context/LangContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClassicItem[];
}

type SearchCategory = 'all' | 'book' | 'person' | 'concept' | 'method' | 'koan' | 'faq';

interface SearchResultItem {
  id: string;
  type: 'book' | 'person' | 'concept' | 'method' | 'koan' | 'faq';
  title: string;
  subtitle: string;
  snippet?: string;
  href: string;
  score: number;
}

const CATEGORY_TABS: { key: SearchCategory; label: string; icon: any }[] = [
  { key: 'all', label: '全部', icon: SlidersHorizontal },
  { key: 'book', label: '经典', icon: BookOpen },
  { key: 'person', label: '祖师', icon: Users },
  { key: 'concept', label: '概念', icon: Gem },
  { key: 'method', label: '法门', icon: Compass },
  { key: 'koan', label: '公案', icon: MessageSquare },
  { key: 'faq', label: '问答', icon: HelpCircle },
];

const TYPE_CONFIG = {
  book: { label: '经典', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: BookOpen },
  person: { label: '祖师', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users },
  concept: { label: '概念', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Gem },
  method: { label: '法门', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Compass },
  koan: { label: '公案', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: MessageSquare },
  faq: { label: '问答', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: HelpCircle },
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const { toSimp, toTrad } = useLang();
  if (!query.trim() || !text) return <>{text}</>;
  const trimmed = query.trim();
  const qSimp = toSimp(trimmed);
  const qTrad = toTrad(trimmed);
  const variants = Array.from(new Set([trimmed, qSimp, qTrad])).filter(Boolean);
  const regex = new RegExp(`(${variants.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        variants.some(v => v.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-amber-200/90 text-amber-950 font-bold rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t, toSimp, toTrad, getHref } = useLang();
  const router = useRouter();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const [taxonomyData, setTaxonomyData] = useState<{
    persons: PersonItem[];
    concepts: ConceptItem[];
    methods: MethodItem[];
    koans: KoanItem[];
    faqs: FAQItem[];
  } | null>(null);

  // 1. 全局快捷键与键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1.1 当模态框打开时，按需异步加载庞大的 taxonomy 知识图谱（拆包优化，首屏 0 负担）
  useEffect(() => {
    if (!isOpen || taxonomyData) return;
    let isMounted = true;
    import('@/lib/taxonomy').then((mod) => {
      if (isMounted) {
        setTaxonomyData({
          persons: mod.ZEN_PERSONS,
          concepts: mod.ZEN_CONCEPTS,
          methods: mod.ZEN_METHODS,
          koans: mod.ZEN_KOANS,
          faqs: mod.ZEN_FAQS,
        });
      }
    }).catch((err) => {
      console.error('Failed to load taxonomy asynchronously:', err);
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, taxonomyData]);

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // 2. 构造全量可检索数据池
  const allSearchData = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // 经典（manifest 立即就绪，零延迟）
    items.forEach((b) => {
      list.push({
        id: b.id,
        type: 'book',
        title: b.title,
        subtitle: `${b.author} · ${b.category}`,
        snippet: b.summary,
        href: `/classics/${b.id}`,
        score: 0,
      });
    });

    if (taxonomyData) {
      // 祖师
      taxonomyData.persons.forEach((p) => {
        list.push({
          id: p.id,
          type: 'person',
          title: p.name,
          subtitle: `${p.title} · ${p.era}`,
          snippet: p.lifeStory?.slice(0, 100),
          href: `/persons/${p.id}`,
          score: 0,
        });
      });

      // 概念
      taxonomyData.concepts.forEach((c) => {
        list.push({
          id: c.id,
          type: 'concept',
          title: c.title,
          subtitle: c.category,
          snippet: c.summary?.slice(0, 100),
          href: `/concepts/${c.id}`,
          score: 0,
        });
      });

      // 法门
      taxonomyData.methods.forEach((m) => {
        list.push({
          id: m.id,
          type: 'method',
          title: m.title,
          subtitle: m.summary?.slice(0, 50),
          snippet: m.steps ? m.steps.join(' · ').slice(0, 100) : '',
          href: `/methods/${m.id}`,
          score: 0,
        });
      });

      // 公案
      taxonomyData.koans.forEach((k) => {
        list.push({
          id: k.id,
          type: 'koan',
          title: k.question,
          subtitle: `${k.master} · ${k.source}`,
          snippet: k.answer?.slice(0, 100),
          href: `/koan/${k.id}`,
          score: 0,
        });
      });

      // 问答
      taxonomyData.faqs.forEach((f) => {
        list.push({
          id: f.id,
          type: 'faq',
          title: f.question,
          subtitle: '核心问答与解惑',
          snippet: f.answer?.slice(0, 100),
          href: `/faq#${f.id}`,
          score: 0,
        });
      });
    }

    return list;
  }, [items, taxonomyData]);

  // 3. 执行检索与打分排序（双向繁简智能匹配）
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allSearchData
        .filter((item) => activeCategory === 'all' || item.type === activeCategory)
        .slice(0, 20);
    }

    const qSimp = toSimp(q).toLowerCase();
    const qTrad = toTrad(q).toLowerCase();

    const scored = allSearchData
      .filter((item) => activeCategory === 'all' || item.type === activeCategory)
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const subLower = item.subtitle.toLowerCase();
        const snipLower = (item.snippet || '').toLowerCase();

        // 无论是原 query、简体 query 还是繁体 query，只要命中均加分
        const queries = Array.from(new Set([q, qSimp, qTrad]));

        for (const qKey of queries) {
          if (titleLower === qKey) score += 100;
          else if (titleLower.startsWith(qKey)) score += 50;
          else if (titleLower.includes(qKey)) score += 30;

          if (subLower.includes(qKey)) score += 15;
          if (snipLower.includes(qKey)) score += 5;
        }

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 40);
  }, [query, activeCategory, allSearchData, toSimp, toTrad]);

  // 4. 键盘上下切换与回车跳转
  const handleItemSelect = (href: string) => {
    onClose();
    router.push(getHref(href));
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleItemSelect(filteredResults[selectedIndex].href);
      }
    }
  };

  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-search-idx="${selectedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 flex items-center space-x-3 bg-zinc-50/90">
          <Search className="w-5 h-5 text-amber-700 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInInput}
            placeholder={t('搜索全站经典、祖师、概念、公案、问答（如：六祖、末那识、一颗明珠、野狐...）')}
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-400 hover:text-zinc-700 px-1.5 py-0.5 rounded bg-zinc-200/60"
            >
              {t('清空')}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-3 sm:px-4 py-2 border-b border-zinc-100 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(tab.label)}</span>
              </button>
            );
          })}
        </div>

        {/* Search Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-[#FAF9F6]/40"
        >
          {filteredResults.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm space-y-2">
              <p className="font-semibold">{t('未找到与')} “{query}” {t('相关的条目')}</p>
              <p className="text-xs text-zinc-400">{t('可尝试搜索其他关键词，或切换分类筛选')}</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.book;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  data-search-idx={idx}
                  onClick={() => handleItemSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group cursor-pointer flex items-start justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-amber-700/60 bg-amber-50/70 shadow-sm translate-x-1'
                      : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border shrink-0 mt-0.5 ${cfg.color}`}
                    >
                      {t(cfg.label)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm sm:text-base font-bold font-serif-zen text-zinc-900 group-hover:text-amber-900 transition-colors leading-snug">
                        <HighlightText text={t(item.title)} query={query} />
                      </div>
                      <div className="text-xs text-zinc-500 font-medium mt-0.5">
                        <HighlightText text={t(item.subtitle)} query={query} />
                      </div>
                      {item.snippet && (
                        <div className="text-xs text-zinc-600/80 mt-1 line-clamp-1 leading-relaxed">
                          <HighlightText text={t(item.snippet)} query={query} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2 mt-1">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center text-[10px] text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-mono">
                        <CornerDownLeft className="w-2.5 h-2.5 mr-0.5" /> Enter
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 transition-all ${
                        isSelected ? 'text-amber-700 translate-x-0.5' : 'text-zinc-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>
              {t('已检索')} <strong>{allSearchData.length}</strong> {t('条全站实体')}（{items.length} {t('经典')} · {STATS.persons} {t('祖师')} · {STATS.koans} {t('公案')} · {STATS.faqs} {t('问答')}）
            </span>
          </div>
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="hidden sm:inline">↑ ↓ {t('选择')}</span>
            <span className="hidden sm:inline">Enter {t('打开')}</span>
            <span>ESC {t('退出')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
