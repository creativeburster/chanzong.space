'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { ClassicItem } from '@/lib/data';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClassicItem[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.author.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center space-x-3 bg-zinc-50">
          <Search className="w-5 h-5 text-amber-700 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索经典名称、作者（如：六祖坛经、马祖、血脉论...）"
            className="w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              未找到与“{query}”相关的典籍
            </div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={`/classics/${item.id}`}
                onClick={onClose}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 hover:border-amber-700/60 hover:bg-amber-50/40 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-900/10 text-amber-800 flex items-center justify-center font-serif-zen font-bold text-xs">
                    {item.idx}
                  </div>
                  <div>
                    <div className="text-sm font-bold font-serif-zen text-zinc-900 group-hover:text-amber-900 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium">
                      {item.author} · {item.category} · {Math.round(item.word_count / 1000)}k 字
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
          <span>共收录 40 部核心禅宗典籍</span>
          <span>按 ESC 退出</span>
        </div>
      </div>
    </div>
  );
};
