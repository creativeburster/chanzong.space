'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_FAQS } from '@/lib/taxonomy';
import { Lightbulb, ChevronDown, ArrowRight, BookOpen, Filter } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

type FAQEntry = {
  id: string;
  question: string;
  answer: string;
  relatedQa?: string;
  relatedBooks?: string[];
};

export default function FAQPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const { t } = useLang();

  const allFaqs: FAQEntry[] = useMemo(() => {
    return ZEN_FAQS.map(f => ({ ...f }));
  }, []);

  const bookMap = useMemo(() => {
    const map: Record<string, { id: string; title: string }> = {};
    for (const item of manifest) {
      map[item.id] = { id: item.id, title: item.title };
    }
    return map;
  }, []);

  const booksWithFaqs = useMemo(() => {
    const ids = new Set<string>();
    for (const faq of allFaqs) {
      if (faq.relatedBooks) {
        for (const bid of faq.relatedBooks) {
          ids.add(bid);
        }
      }
    }
    return Array.from(ids)
      .map((id) => bookMap[id])
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  }, [allFaqs, bookMap]);

  const filteredFaqs = useMemo(() => {
    if (!selectedBook) return allFaqs;
    return allFaqs.filter((faq) => faq.relatedBooks?.includes(selectedBook));
  }, [allFaqs, selectedBook]);

  const visibleFaqs = filteredFaqs.slice(0, displayCount);
  const hasMore = displayCount < filteredFaqs.length;

  const handleBookChange = (bookId: string | null) => {
    setSelectedBook(bookId);
    setDisplayCount(10);
    setOpenFaq(null);
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <Breadcrumb items={[{ label: '参究 FAQ' }]} />
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-700 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>{t('参究常见疑问与义理辨析')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('参究 FAQ')} ({allFaqs.length})
            </h1>
            <h2 className="text-lg font-bold font-serif-zen text-slate-800 mb-4">经典问答</h2>

            <p className="text-sm text-slate-500 mt-1">
              {t('围绕公案、经典与禅宗义理的常见疑问解答。可按书籍筛选，点击展开查看详细辨析。')}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-[13px] font-semibold text-slate-500">{t('按书籍筛选')}</span>
              {selectedBook && (
                <button
                  onClick={() => handleBookChange(null)}
                  className="text-[12px] text-amber-700 hover:text-amber-900 font-semibold ml-2"
                >
                  {t('清除筛选')}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBookChange(null)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all ${
                  !selectedBook
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                {t('全部')} ({allFaqs.length})
              </button>
              {booksWithFaqs.map((book) => {
                const count = allFaqs.filter((f) => f.relatedBooks?.includes(book.id)).length;
                const isActive = selectedBook === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookChange(book.id)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-700'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t(book.title)}</span>
                    <span className={`text-[11px] font-mono ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {visibleFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl bg-white border shadow-sm transition-all ${
                    isOpen ? 'border-amber-500/60 shadow-md' : 'border-slate-200/80 hover:border-amber-500/40'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-[15px] font-bold font-serif-zen text-slate-900 leading-snug">
                        {t(faq.question)}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-amber-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 -mt-1 space-y-3">
                      <p className="text-[15px] font-serif-zen text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                        {t(faq.answer)}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        {faq.relatedQa && (
                          <Link
                            href={`/koan/${faq.relatedQa}`}
                            className="inline-flex items-center space-x-1.5 text-[13px] font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                          >
                            <span>{t('参看相关公案')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {faq.relatedBooks && faq.relatedBooks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-auto">
                            {faq.relatedBooks.map((bid) => {
                              const book = bookMap[bid];
                              if (!book) return null;
                              return (
                                <Link
                                  key={bid}
                                  href={`/classics/${bid}`}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[11px] font-semibold hover:bg-amber-100 hover:text-amber-800 transition-colors"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{t(book.title)}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filteredFaqs.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 10)}
                className="px-6 py-3 rounded-xl bg-amber-700 text-white text-[14px] font-semibold hover:bg-amber-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filteredFaqs.length})
              </button>
            </div>
          )}

          {!hasMore && filteredFaqs.length > 10 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filteredFaqs.length} {t('条')}
            </p>
          )}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-[15px]">{t('该书籍暂无关联问答')}</p>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
