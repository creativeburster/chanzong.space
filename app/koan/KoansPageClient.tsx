'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_KOANS, ZEN_CONCEPTS } from '@/lib/taxonomy';
import { MessageCircle, Search, ChevronDown, User, BookOpen, Sparkles, X, RotateCcw } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function KoansPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');

  // 筛选状态
  const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  // 下拉菜单与内联搜索
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState('');
  const masterRef = useRef<HTMLDivElement>(null);

  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const bookRef = useRef<HTMLDivElement>(null);

  const [conceptDropdownOpen, setConceptDropdownOpen] = useState(false);
  const [conceptSearch, setConceptSearch] = useState('');
  const conceptRef = useRef<HTMLDivElement>(null);

  const { t, toSimp, toTrad, getHref } = useLang();

  // 典籍映射
  const bookMap = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const item of manifest) {
      map.set(item.id, { id: item.id, title: item.title });
    }
    return map;
  }, []);

  // 概念映射
  const conceptMap = useMemo(() => {
    const map = new Map<string, typeof ZEN_CONCEPTS[0]>();
    for (const c of ZEN_CONCEPTS) {
      map.set(c.id, c);
    }
    return map;
  }, []);

  // 1. 禅师选项列表（按公案数量降序）
  const masterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const k of ZEN_KOANS) {
      if (k.master) {
        counts.set(k.master, (counts.get(k.master) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const filteredMasterOptions = useMemo(() => {
    if (!masterSearch.trim()) return masterOptions;
    const q = masterSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return masterOptions.filter((m) => {
      const n = m.name.toLowerCase();
      return n.includes(q) || n.includes(qSimp) || n.includes(qTrad);
    });
  }, [masterOptions, masterSearch, toSimp, toTrad]);

  // 2. 典籍选项列表（按公案数量降序）
  const bookOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const k of ZEN_KOANS) {
      if (k.relatedBooks) {
        for (const bid of k.relatedBooks) {
          counts.set(bid, (counts.get(bid) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        title: bookMap.get(id)?.title || id,
        count,
      }))
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [bookMap]);

  const filteredBookOptions = useMemo(() => {
    if (!bookSearch.trim()) return bookOptions;
    const q = bookSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return bookOptions.filter((b) => {
      const titleLower = b.title.toLowerCase();
      return titleLower.includes(q) || titleLower.includes(qSimp) || titleLower.includes(qTrad);
    });
  }, [bookOptions, bookSearch, toSimp, toTrad]);

  // 3. 破关旨趣（概念）选项列表（按公案数量降序）
  const conceptOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const k of ZEN_KOANS) {
      if (k.relatedConcepts) {
        for (const cid of k.relatedConcepts) {
          counts.set(cid, (counts.get(cid) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        title: conceptMap.get(id)?.title || id,
        count,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [conceptMap]);

  const filteredConceptOptions = useMemo(() => {
    if (!conceptSearch.trim()) return conceptOptions;
    const q = conceptSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return conceptOptions.filter((c) => {
      const titleLower = c.title.toLowerCase();
      return titleLower.includes(q) || titleLower.includes(qSimp) || titleLower.includes(qTrad);
    });
  }, [conceptOptions, conceptSearch, toSimp, toTrad]);

  // 复合交集过滤
  const filtered = useMemo(() => {
    let result = ZEN_KOANS;

    // 1. 禅师过滤
    if (selectedMaster) {
      result = result.filter((k) => k.master === selectedMaster);
    }

    // 2. 典籍出处过滤
    if (selectedBook) {
      const bTitle = bookMap.get(selectedBook)?.title;
      result = result.filter((k) => {
        if (k.relatedBooks && k.relatedBooks.includes(selectedBook)) return true;
        if (bTitle && k.source && k.source.includes(bTitle)) return true;
        return false;
      });
    }

    // 3. 破关旨趣过滤
    if (selectedConcept) {
      result = result.filter((k) => k.relatedConcepts && k.relatedConcepts.includes(selectedConcept));
    }

    // 4. 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter((k) => {
        const qLower = k.question.toLowerCase();
        const aLower = k.answer.toLowerCase();
        const mLower = (k.master || '').toLowerCase();
        const sLower = (k.source || '').toLowerCase();
        return kwList.some((key) => qLower.includes(key) || aLower.includes(key) || mLower.includes(key) || sLower.includes(key));
      });
    }

    return result;
  }, [selectedMaster, selectedBook, selectedConcept, keyword, bookMap, toSimp, toTrad]);

  const visibleKoans = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  const handleResetAll = () => {
    setSelectedMaster(null);
    setSelectedBook(null);
    setSelectedConcept(null);
    setKeyword('');
    setDisplayCount(12);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (masterRef.current && !masterRef.current.contains(e.target as Node)) setMasterDropdownOpen(false);
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
      if (conceptRef.current && !conceptRef.current.contains(e.target as Node)) setConceptDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [selectedMaster, selectedBook, selectedConcept, keyword]);

  const selectedBookTitle = selectedBook ? (bookMap.get(selectedBook)?.title || selectedBook) : null;
  const selectedConceptTitle = selectedConcept ? (conceptMap.get(selectedConcept)?.title || selectedConcept) : null;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: t('禅宗公案') }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('禅宗公案')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_KOANS.length} 则 · {t('达摩、六祖、马祖、赵州等历代禅师机锋因缘')}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch gap-3 mb-6">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('搜索公案内容、禅师或出处…')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600/60 focus:ring-2 focus:ring-rose-600/10 transition-all"
              />
            </div>

            {/* 筛选器按钮组 */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* 1. 禅师筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={masterRef}>
                <button
                  onClick={() => {
                    setMasterDropdownOpen((o) => !o);
                    setBookDropdownOpen(false);
                    setConceptDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedMaster
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-600/60 hover:text-rose-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <User className="w-4 h-4 shrink-0" />
                    {selectedMaster ? t(selectedMaster) : t('全部禅师')}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${masterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {masterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={masterSearch}
                          onChange={(e) => setMasterSearch(e.target.value)}
                          placeholder={t('搜索禅师姓名…')}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedMaster(null); setMasterDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedMaster ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部禅师')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_KOANS.length})</span>
                        </span>
                      </button>
                      {filteredMasterOptions.map((m) => (
                        <button
                          key={m.name}
                          onClick={() => { setSelectedMaster(m.name); setMasterDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedMaster === m.name ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(m.name)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{m.count}</span>
                          </span>
                        </button>
                      ))}
                      {filteredMasterOptions.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">{t('未找到匹配禅师')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 典籍出处筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={bookRef}>
                <button
                  onClick={() => {
                    setBookDropdownOpen((o) => !o);
                    setMasterDropdownOpen(false);
                    setConceptDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedBook
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-600/60 hover:text-rose-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {selectedBookTitle ? t(selectedBookTitle) : t('出处典籍')}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${bookDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {bookDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          placeholder={t('搜索典籍…')}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedBook(null); setBookDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedBook ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部典籍')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_KOANS.length})</span>
                        </span>
                      </button>
                      {filteredBookOptions.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBook(b.id); setBookDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedBook === b.id ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(b.title)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{b.count}</span>
                          </span>
                        </button>
                      ))}
                      {filteredBookOptions.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">{t('未找到匹配典籍')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. 破关旨趣筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={conceptRef}>
                <button
                  onClick={() => {
                    setConceptDropdownOpen((o) => !o);
                    setMasterDropdownOpen(false);
                    setBookDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedConcept
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-600/60 hover:text-rose-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    {selectedConceptTitle ? t(selectedConceptTitle) : t('破关旨趣')}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${conceptDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {conceptDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={conceptSearch}
                          onChange={(e) => setConceptSearch(e.target.value)}
                          placeholder={t('搜索破关旨趣/概念…')}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedConcept(null); setConceptDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedConcept ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部旨趣')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_KOANS.length})</span>
                        </span>
                      </button>
                      {filteredConceptOptions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedConcept(c.id); setConceptDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedConcept === c.id ? 'bg-rose-50 text-rose-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(c.title)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{c.count}</span>
                          </span>
                        </button>
                      ))}
                      {filteredConceptOptions.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">{t('未找到匹配旨趣')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Tags & Count Summary */}
          {(keyword.trim() || selectedMaster || selectedBook || selectedConcept) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-500 font-medium">
                {t('筛选结果')}（{filtered.length} {t('则')}）：
              </span>

              {selectedMaster && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-900 text-xs font-medium">
                  <User className="w-3 h-3 text-rose-700" />
                  <span>{t(selectedMaster)}</span>
                  <button
                    onClick={() => setSelectedMaster(null)}
                    className="hover:bg-rose-200/60 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBookTitle && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
                  <BookOpen className="w-3 h-3 text-amber-700" />
                  <span>{t(selectedBookTitle)}</span>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="hover:bg-amber-200/60 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedConceptTitle && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-medium">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>{t(selectedConceptTitle)}</span>
                  <button
                    onClick={() => setSelectedConcept(null)}
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
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-800 transition-colors ml-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('重置所有筛选')}</span>
              </button>
            </div>
          )}

          {/* Koan List */}
          <div className="space-y-6">
            {visibleKoans.map((qa) => (
              <Link prefetch={false} href={getHref(`/koan/${qa.id}`)} key={qa.id} className="block group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm group-hover:border-rose-600/50 group-hover:shadow-md transition-all space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs shrink-0">
                      {t('问')}
                    </span>
                    <h2 className="text-xl font-bold font-serif-zen text-slate-900 leading-snug group-hover:text-rose-700 transition-colors">
                      {t(qa.question)}
                    </h2>
                  </div>

                  <div className="flex items-start space-x-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-900 text-white font-bold text-xs shrink-0">
                      {t('答')}
                    </span>
                    <p className="text-[15px] font-serif-zen text-slate-800 leading-relaxed">
                      {t(qa.answer)}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 font-medium pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span>{t('回答禅师：')}<strong className="text-slate-800">{t(qa.master)}</strong></span>
                      {qa.source && <span>{t('出处：')}{t(qa.source)}</span>}
                    </div>

                    {qa.relatedConcepts && qa.relatedConcepts.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {qa.relatedConcepts.slice(0, 3).map((cid) => {
                          const concept = conceptMap.get(cid);
                          if (!concept) return null;
                          return (
                            <span
                              key={cid}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100"
                            >
                              {t(concept.title)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的公案')}</p>
              <button
                onClick={handleResetAll}
                className="mt-3 text-rose-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-rose-700 text-white text-[14px] font-semibold hover:bg-rose-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('条公案')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
