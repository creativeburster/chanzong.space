'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import dynamic from 'next/dynamic';
const SearchModal = dynamic(
  () => import('@/components/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS } from '@/lib/taxonomy';
import { Gem, Search, ChevronDown, ChevronRight, BookOpen, User, Tag, X, RotateCcw } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ConceptsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // 下拉菜单与内联搜索
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const catRef = useRef<HTMLDivElement>(null);

  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const bookRef = useRef<HTMLDivElement>(null);

  const [personDropdownOpen, setPersonDropdownOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const personRef = useRef<HTMLDivElement>(null);

  const { t, toSimp, toTrad, getHref } = useLang();

  // 典籍映射
  const bookMap = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const item of manifest) {
      map.set(item.id, { id: item.id, title: item.title });
    }
    return map;
  }, []);

  // 祖师映射
  const personMap = useMemo(() => {
    const map = new Map<string, typeof ZEN_PERSONS[0]>();
    for (const p of ZEN_PERSONS) {
      map.set(p.id, p);
    }
    return map;
  }, []);

  // 1. 范畴选项列表（按概念数量降序）
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of ZEN_CONCEPTS) {
      if (c.category) {
        counts.set(c.category, (counts.get(c.category) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const filteredCategoryOptions = useMemo(() => {
    if (!catSearch.trim()) return categoryOptions;
    const q = catSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return categoryOptions.filter((c) => {
      const n = c.name.toLowerCase();
      return n.includes(q) || n.includes(qSimp) || n.includes(qTrad);
    });
  }, [categoryOptions, catSearch, toSimp, toTrad]);

  // 2. 典籍选项列表（按概念数量降序）
  const bookOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of ZEN_CONCEPTS) {
      if (c.relatedBooks) {
        for (const bid of c.relatedBooks) {
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

  // 3. 祖师选项列表（按概念数量降序）
  const personOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of ZEN_CONCEPTS) {
      if (c.relatedPersons) {
        for (const pid of c.relatedPersons) {
          counts.set(pid, (counts.get(pid) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        name: personMap.get(id)?.name || id,
        count,
      }))
      .filter((p) => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [personMap]);

  const filteredPersonOptions = useMemo(() => {
    if (!personSearch.trim()) return personOptions;
    const q = personSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return personOptions.filter((p) => {
      const n = p.name.toLowerCase();
      return n.includes(q) || n.includes(qSimp) || n.includes(qTrad);
    });
  }, [personOptions, personSearch, toSimp, toTrad]);

  // 复合交集过滤
  const filtered = useMemo(() => {
    let result = ZEN_CONCEPTS;

    // 1. 范畴过滤
    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 2. 典籍过滤
    if (selectedBook) {
      const bTitle = bookMap.get(selectedBook)?.title;
      result = result.filter((c) => {
        if (c.relatedBooks && c.relatedBooks.includes(selectedBook)) return true;
        if (bTitle && c.classicRef && c.classicRef.includes(bTitle)) return true;
        return false;
      });
    }

    // 3. 祖师过滤
    if (selectedPerson) {
      const pName = personMap.get(selectedPerson)?.name;
      result = result.filter((c) => {
        if (c.relatedPersons && c.relatedPersons.includes(selectedPerson)) return true;
        if (pName && ((c.summary && c.summary.includes(pName)) || (c.guidance && c.guidance.includes(pName)))) return true;
        return false;
      });
    }

    // 4. 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter((c) => {
        const tLower = (c.title || '').toLowerCase();
        const sLower = (c.summary || '').toLowerCase();
        const rLower = (c.classicRef || '').toLowerCase();
        return kwList.some((k) => tLower.includes(k) || sLower.includes(k) || rLower.includes(k));
      });
    }

    return result;
  }, [selectedCategory, selectedBook, selectedPerson, keyword, bookMap, personMap, toSimp, toTrad]);

  const visibleConcepts = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  const handleResetAll = () => {
    setSelectedCategory(null);
    setSelectedBook(null);
    setSelectedPerson(null);
    setKeyword('');
    setDisplayCount(12);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
      if (personRef.current && !personRef.current.contains(e.target as Node)) setPersonDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [selectedCategory, selectedBook, selectedPerson, keyword]);

  const selectedBookTitle = selectedBook ? (bookMap.get(selectedBook)?.title || selectedBook) : null;
  const selectedPersonName = selectedPerson ? (personMap.get(selectedPerson)?.name || selectedPerson) : null;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: t('核心概念') }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center">
              <Gem className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('核心概念')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_CONCEPTS.length} 条 · {t('涵盖自性、顿悟、平常心是道等核心宗旨')}
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
                placeholder={t('搜索概念名称、义理或出处…')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600/60 focus:ring-2 focus:ring-emerald-600/10 transition-all"
              />
            </div>

            {/* 筛选器按钮组 */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* 1. 义理范畴筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={catRef}>
                <button
                  onClick={() => {
                    setCatDropdownOpen((o) => !o);
                    setBookDropdownOpen(false);
                    setPersonDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedCategory
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600/60 hover:text-emerald-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <Tag className="w-4 h-4 shrink-0" />
                    {selectedCategory ? t(selectedCategory) : t('全部类别')}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {catDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          placeholder={t('搜索义理类别…')}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedCategory(null); setCatDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedCategory ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部类别')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_CONCEPTS.length})</span>
                        </span>
                      </button>
                      {filteredCategoryOptions.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => { setSelectedCategory(c.name); setCatDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedCategory === c.name ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(c.name)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{c.count}</span>
                          </span>
                        </button>
                      ))}
                      {filteredCategoryOptions.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">{t('未找到匹配类别')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 相关典籍筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={bookRef}>
                <button
                  onClick={() => {
                    setBookDropdownOpen((o) => !o);
                    setCatDropdownOpen(false);
                    setPersonDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedBook
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600/60 hover:text-emerald-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {selectedBookTitle ? t(selectedBookTitle) : t('相关典籍')}
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
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedBook(null); setBookDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedBook ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部典籍')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_CONCEPTS.length})</span>
                        </span>
                      </button>
                      {filteredBookOptions.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBook(b.id); setBookDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedBook === b.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

              {/* 3. 倡导祖师筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={personRef}>
                <button
                  onClick={() => {
                    setPersonDropdownOpen((o) => !o);
                    setCatDropdownOpen(false);
                    setBookDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedPerson
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600/60 hover:text-emerald-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-36">
                    <User className="w-4 h-4 shrink-0" />
                    {selectedPersonName ? t(selectedPersonName) : t('倡导祖师')}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${personDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {personDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-hidden flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={personSearch}
                          onChange={(e) => setPersonSearch(e.target.value)}
                          placeholder={t('搜索祖师姓名…')}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedPerson(null); setPersonDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedPerson ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部祖师')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_CONCEPTS.length})</span>
                        </span>
                      </button>
                      {filteredPersonOptions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPerson(p.id); setPersonDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedPerson === p.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            <span className="truncate">{t(p.name)}</span>
                            <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{p.count}</span>
                          </span>
                        </button>
                      ))}
                      {filteredPersonOptions.length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">{t('未找到匹配祖师')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Tags & Count Summary */}
          {(keyword.trim() || selectedCategory || selectedBook || selectedPerson) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-500 font-medium">
                {t('筛选结果')}（{filtered.length} {t('条')}）：
              </span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-medium">
                  <Tag className="w-3 h-3 text-emerald-700" />
                  <span>{t(selectedCategory)}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:bg-emerald-200/60 rounded-full p-0.5 transition-colors"
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

              {selectedPersonName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-medium">
                  <User className="w-3 h-3 text-indigo-600" />
                  <span>{t(selectedPersonName)}</span>
                  <button
                    onClick={() => setSelectedPerson(null)}
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
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-800 transition-colors ml-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('重置所有筛选')}</span>
              </button>
            </div>
          )}

          {/* Concept List */}
          <div className="space-y-4">
            {visibleConcepts.map((concept) => (
              <Link prefetch={false} key={concept.id}
                href={getHref(`/concepts/${concept.id}`)}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {t(concept.title)}
                    </h2>
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t(concept.category)}
                    </span>
                  </div>

                  <p className="text-[15px] text-slate-700 font-serif-zen leading-relaxed mb-3">
                    {t(concept.summary)}
                  </p>
                </div>

                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {concept.classicRef && (
                      <span>{t('典籍出处')}：<strong className="text-slate-800">{t(concept.classicRef)}</strong></span>
                    )}

                    {concept.relatedPersons && concept.relatedPersons.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{t('相关宗师')}：</span>
                        {concept.relatedPersons.slice(0, 3).map((pid) => {
                          const p = personMap.get(pid);
                          if (!p) return null;
                          return (
                            <span key={pid} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {t(p.name)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <span className="text-[13px] font-semibold text-emerald-800 flex items-center group-hover:translate-x-1 transition-transform ml-auto">
                    {t('深入探讨')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Gem className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的概念')}</p>
              <button
                onClick={handleResetAll}
                className="mt-3 text-emerald-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-emerald-700 text-white text-[14px] font-semibold hover:bg-emerald-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('条概念')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
