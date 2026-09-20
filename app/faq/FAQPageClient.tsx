'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import manifest from '@/manifest.json';
import { ZEN_FAQS, ZEN_PERSONS, ZEN_KOANS } from '@/lib/taxonomy';
import { Lightbulb, ChevronDown, ArrowRight, BookOpen, Search, Users, X, RotateCcw } from 'lucide-react';
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
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [displayCount, setDisplayCount] = useState(30);

  // 典籍下拉与内联搜索
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const bookRef = useRef<HTMLDivElement>(null);

  // 人物下拉与内联搜索
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const personRef = useRef<HTMLDivElement>(null);

  const { t, toSimp, toTrad, getHref } = useLang();

  const allFaqs: FAQEntry[] = useMemo(() => ZEN_FAQS.map(f => ({ ...f })), []);

  const bookMap = useMemo(() => {
    const map: Record<string, { id: string; title: string }> = {};
    for (const item of manifest) {
      map[item.id] = { id: item.id, title: item.title };
    }
    return map;
  }, []);

  const koanMap = useMemo(() => {
    const map = new Map<string, typeof ZEN_KOANS[0]>();
    ZEN_KOANS.forEach((k) => map.set(k.id, k));
    return map;
  }, []);

  const bookAuthorMap = useMemo(() => {
    const map = new Map<string, string>();
    manifest.forEach((b) => {
      if (b.author) map.set(b.id, b.author);
    });
    return map;
  }, []);

  // 判定某条问答是否与某位祖师相关联
  const checkFaqMatchPerson = useCallback(
    (faq: FAQEntry, personId: string, personName: string): boolean => {
      // 1. 问题或回答中直接提及祖师名讳
      if (faq.question.includes(personName) || faq.answer.includes(personName)) {
        return true;
      }
      // 2. 通过关联公案（relatedQa）的主角宗师或关联人物反查
      if (faq.relatedQa) {
        const koan = koanMap.get(faq.relatedQa);
        if (koan) {
          if (koan.master && (koan.master.includes(personName) || personName.includes(koan.master))) {
            return true;
          }
          if (koan.relatedPersons && koan.relatedPersons.includes(personId)) {
            return true;
          }
        }
      }
      // 3. 通过关联典籍的作者匹配
      if (faq.relatedBooks) {
        for (const bid of faq.relatedBooks) {
          const author = bookAuthorMap.get(bid);
          if (author && (author.includes(personName) || personName.includes(author))) {
            return true;
          }
        }
      }
      return false;
    },
    [koanMap, bookAuthorMap]
  );

  // 典籍选项列表与统计
  const booksWithFaqs = useMemo(() => {
    const ids = new Set<string>();
    for (const faq of allFaqs) {
      if (faq.relatedBooks) {
        for (const bid of faq.relatedBooks) ids.add(bid);
      }
    }
    return Array.from(ids)
      .map((id) => bookMap[id])
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  }, [allFaqs, bookMap]);

  const filteredBookOptions = useMemo(() => {
    if (!bookSearch.trim()) return booksWithFaqs;
    const q = bookSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return booksWithFaqs.filter((b) => {
      const tLow = b.title.toLowerCase();
      return tLow.includes(q) || tLow.includes(qSimp) || tLow.includes(qTrad);
    });
  }, [booksWithFaqs, bookSearch, toSimp, toTrad]);

  // 人物选项列表与统计
  const personsWithFaqs = useMemo(() => {
    return ZEN_PERSONS.map((p) => {
      const count = allFaqs.filter((f) => checkFaqMatchPerson(f, p.id, p.name)).length;
      return { id: p.id, name: p.name, title: p.title, count };
    })
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allFaqs, checkFaqMatchPerson]);

  const filteredPersonOptions = useMemo(() => {
    if (!personSearch.trim()) return personsWithFaqs;
    const q = personSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return personsWithFaqs.filter((p) => {
      const nLow = p.name.toLowerCase();
      const tLow = p.title.toLowerCase();
      return (
        nLow.includes(q) ||
        nLow.includes(qSimp) ||
        nLow.includes(qTrad) ||
        tLow.includes(q) ||
        tLow.includes(qSimp) ||
        tLow.includes(qTrad)
      );
    });
  }, [personsWithFaqs, personSearch, toSimp, toTrad]);

  const selectedPersonObj = useMemo(() => {
    if (!selectedPerson) return null;
    return ZEN_PERSONS.find((p) => p.id === selectedPerson) || null;
  }, [selectedPerson]);

  // 双重多维过滤：典籍 + 人物 + 关键词
  const filteredFaqs = useMemo(() => {
    let result = allFaqs;

    // 1. 典籍过滤
    if (selectedBook) {
      result = result.filter((faq) => faq.relatedBooks?.includes(selectedBook));
    }

    // 2. 人物过滤
    if (selectedPerson) {
      const pObj = ZEN_PERSONS.find((p) => p.id === selectedPerson);
      if (pObj) {
        result = result.filter((faq) => checkFaqMatchPerson(faq, pObj.id, pObj.name));
      }
    }

    // 3. 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter((f) => {
        const qLower = f.question.toLowerCase();
        const aLower = f.answer.toLowerCase();
        return kwList.some((k) => qLower.includes(k) || aLower.includes(k));
      });
    }

    return result;
  }, [allFaqs, selectedBook, selectedPerson, keyword, checkFaqMatchPerson, toSimp, toTrad]);

  const visibleFaqs = filteredFaqs.slice(0, displayCount);
  const hasMore = displayCount < filteredFaqs.length;

  const handleBookChange = (bookId: string | null) => {
    setSelectedBook(bookId);
    setDisplayCount(10);
    setOpenFaq(null);
  };

  const handlePersonChange = (personId: string | null) => {
    setSelectedPerson(personId);
    setDisplayCount(10);
    setOpenFaq(null);
  };

  const selectedBookTitle = selectedBook ? bookMap[selectedBook]?.title : null;
  const selectedPersonName = selectedPersonObj ? selectedPersonObj.name : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
      if (personRef.current && !personRef.current.contains(e.target as Node)) setPersonDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(10);
    setOpenFaq(null);
  }, [keyword, selectedBook, selectedPerson]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: t('禅宗问答') }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('禅宗解惑问答')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {allFaqs.length} 条 · {t('围绕公案、经典与禅宗义理的常见疑问解答')}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索问题或回答内容…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600/60 focus:ring-2 focus:ring-amber-600/10 transition-all"
              />
            </div>

            {/* Book Filter Dropdown */}
            <div className="relative" ref={bookRef}>
              <button
                onClick={() => {
                  setBookDropdownOpen((o) => !o);
                  setPersonDropdownOpen(false);
                }}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  selectedBook
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-600/60 hover:text-amber-800'
                }`}
              >
                <span className="flex items-center gap-2 truncate max-w-44">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {selectedBookTitle ? t(selectedBookTitle) : t('全部典籍')}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${bookDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {bookDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                  {/* 内联搜索 */}
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        placeholder={t('搜索典籍…')}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 选项列表 */}
                  <div className="overflow-y-auto flex-1 p-1">
                    <button
                      onClick={() => { handleBookChange(null); setBookDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        !selectedBook
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{t('全部典籍')}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({allFaqs.length})</span>
                      </span>
                    </button>
                    {filteredBookOptions.map((book) => {
                      const count = allFaqs.filter((f) => f.relatedBooks?.includes(book.id)).length;
                      return (
                        <button
                          key={book.id}
                          onClick={() => { handleBookChange(book.id); setBookDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedBook === book.id
                              ? 'bg-amber-50 text-amber-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(book.title)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{count}</span>
                          </span>
                        </button>
                      );
                    })}
                    {filteredBookOptions.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-400">
                        {t('未找到匹配典籍')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Person Filter Dropdown */}
            <div className="relative" ref={personRef}>
              <button
                onClick={() => {
                  setPersonDropdownOpen((o) => !o);
                  setBookDropdownOpen(false);
                }}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  selectedPerson
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-600/60 hover:text-amber-800'
                }`}
              >
                <span className="flex items-center gap-2 truncate max-w-44">
                  <Users className="w-4 h-4 shrink-0" />
                  {selectedPersonName ? t(selectedPersonName) : t('全部人物')}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${personDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {personDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                  {/* 内联搜索 */}
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={personSearch}
                        onChange={(e) => setPersonSearch(e.target.value)}
                        placeholder={t('搜索人物姓名…')}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* 选项列表 */}
                  <div className="overflow-y-auto flex-1 p-1">
                    <button
                      onClick={() => { handlePersonChange(null); setPersonDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        !selectedPerson
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{t('全部人物')}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({allFaqs.length})</span>
                      </span>
                    </button>
                    {filteredPersonOptions.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => { handlePersonChange(person.id); setPersonDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                          selectedPerson === person.id
                            ? 'bg-amber-50 text-amber-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="truncate">{t(person.name)}</span>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{person.count}</span>
                        </span>
                      </button>
                    ))}
                    {filteredPersonOptions.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-400">
                        {t('未找到匹配人物')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Tags & Count Summary */}
          {(keyword.trim() || selectedBook || selectedPerson) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-500 font-medium">
                {t('筛选结果')}（{filteredFaqs.length} {t('条')}）：
              </span>

              {selectedBookTitle && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
                  <BookOpen className="w-3 h-3 text-amber-700" />
                  <span>{t(selectedBookTitle)}</span>
                  <button
                    onClick={() => handleBookChange(null)}
                    className="hover:bg-amber-200/60 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPersonName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-medium">
                  <Users className="w-3 h-3 text-indigo-600" />
                  <span>{t(selectedPersonName)}</span>
                  <button
                    onClick={() => handlePersonChange(null)}
                    className="hover:bg-indigo-200/60 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {keyword.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                  <Search className="w-3 h-3 text-slate-500" />
                  <span>&quot;{keyword}&quot;</span>
                  <button
                    onClick={() => setKeyword('')}
                    className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setKeyword('');
                  handleBookChange(null);
                  handlePersonChange(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber-800 transition-colors ml-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('重置所有筛选')}</span>
              </button>
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-3">
            {visibleFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`rounded-2xl bg-white border shadow-sm transition-all scroll-mt-24 ${
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

                  <div className={`px-5 pb-5 -mt-1 space-y-3 ${isOpen ? 'block' : 'hidden'}`}>
                    <p className="text-[15px] font-serif-zen text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                      {t(faq.answer)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {faq.relatedQa && (
                        <Link prefetch={false} href={getHref(`/koan/${faq.relatedQa}`)}
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
                              <Link prefetch={false} key={bid}
                                href={getHref(`/classics/${bid}`)}
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
              <p className="text-[15px]">{t('未找到匹配的问答')}</p>
              <button
                onClick={() => { setKeyword(''); handleBookChange(null); handlePersonChange(null); }}
                className="mt-3 text-amber-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
