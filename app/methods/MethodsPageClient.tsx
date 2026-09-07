'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_METHODS, ZEN_PERSONS } from '@/lib/taxonomy';
import { Compass, Search, ChevronDown, ChevronRight, BookOpen, User, X, RotateCcw } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function MethodsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');

  // 筛选状态
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // 下拉菜单与内联搜索
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

  // 1. 典籍选项列表（按法门数量降序）
  const bookOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of ZEN_METHODS) {
      if (m.relatedBooks) {
        for (const bid of m.relatedBooks) {
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

  // 2. 传授祖师选项列表（按法门数量降序）
  const personOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of ZEN_METHODS) {
      if (m.relatedPersons) {
        for (const pid of m.relatedPersons) {
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
    let result = ZEN_METHODS;

    // 1. 典籍过滤
    if (selectedBook) {
      const bTitle = bookMap.get(selectedBook)?.title;
      result = result.filter((m) => {
        if (m.relatedBooks && m.relatedBooks.includes(selectedBook)) return true;
        if (bTitle && m.classicRef && m.classicRef.includes(bTitle)) return true;
        return false;
      });
    }

    // 2. 祖师过滤
    if (selectedPerson) {
      const pName = personMap.get(selectedPerson)?.name;
      result = result.filter((m) => {
        if (m.relatedPersons && m.relatedPersons.includes(selectedPerson)) return true;
        if (pName && ((m.origin && m.origin.includes(pName)) || (m.summary && m.summary.includes(pName)))) return true;
        return false;
      });
    }

    // 3. 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter((m) => {
        const tLower = (m.title || '').toLowerCase();
        const sLower = (m.summary || '').toLowerCase();
        const oLower = (m.origin || '').toLowerCase();
        const rLower = (m.classicRef || '').toLowerCase();
        const stepMatch = m.steps?.some((step) => kwList.some((k) => step.toLowerCase().includes(k)));
        return stepMatch || kwList.some((k) => tLower.includes(k) || sLower.includes(k) || oLower.includes(k) || rLower.includes(k));
      });
    }

    return result;
  }, [selectedBook, selectedPerson, keyword, bookMap, personMap, toSimp, toTrad]);

  const visibleMethods = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  const handleResetAll = () => {
    setSelectedBook(null);
    setSelectedPerson(null);
    setKeyword('');
    setDisplayCount(12);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
      if (personRef.current && !personRef.current.contains(e.target as Node)) setPersonDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [selectedBook, selectedPerson, keyword]);

  const selectedBookTitle = selectedBook ? (bookMap.get(selectedBook)?.title || selectedBook) : null;
  const selectedPersonName = selectedPerson ? (personMap.get(selectedPerson)?.name || selectedPerson) : null;

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: t('修行法门') }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('禅宗修行法门')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_METHODS.length} 种 · {t('参究公案、看话头、默照禅、二入四行等实修法门')}
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
                placeholder={t('搜索法门名称、要领或描述…')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/10 transition-all"
              />
            </div>

            {/* 筛选器按钮组 */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* 1. 记载典籍筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={bookRef}>
                <button
                  onClick={() => {
                    setBookDropdownOpen((o) => !o);
                    setPersonDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedBook
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-600/60 hover:text-sky-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-40">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    {selectedBookTitle ? t(selectedBookTitle) : t('记载典籍')}
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
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedBook(null); setBookDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedBook ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部典籍')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_METHODS.length})</span>
                        </span>
                      </button>
                      {filteredBookOptions.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => { setSelectedBook(b.id); setBookDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedBook === b.id ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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

              {/* 2. 传授祖师筛选下拉 */}
              <div className="relative flex-1 sm:flex-initial" ref={personRef}>
                <button
                  onClick={() => {
                    setPersonDropdownOpen((o) => !o);
                    setBookDropdownOpen(false);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                    selectedPerson
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-600/60 hover:text-sky-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate max-w-40">
                    <User className="w-4 h-4 shrink-0" />
                    {selectedPersonName ? t(selectedPersonName) : t('传授祖师')}
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
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      <button
                        onClick={() => { setSelectedPerson(null); setPersonDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                          !selectedPerson ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{t('全部祖师')}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({ZEN_METHODS.length})</span>
                        </span>
                      </button>
                      {filteredPersonOptions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPerson(p.id); setPersonDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                            selectedPerson === p.id ? 'bg-sky-50 text-sky-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
          {(keyword.trim() || selectedBook || selectedPerson) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-slate-500 font-medium">
                {t('筛选结果')}（{filtered.length} {t('种')}）：
              </span>

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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-900 text-xs font-medium">
                  <User className="w-3 h-3 text-sky-700" />
                  <span>{t(selectedPersonName)}</span>
                  <button
                    onClick={() => setSelectedPerson(null)}
                    className="hover:bg-sky-200/60 rounded-full p-0.5 transition-colors"
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
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-800 transition-colors ml-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('重置所有筛选')}</span>
              </button>
            </div>
          )}

          {/* Methods List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleMethods.map((method) => (
              <Link prefetch={false} key={method.id}
                href={getHref(`/methods/${method.id}`)}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-sky-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer block"
              >
                <div>
                  <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-sky-800 transition-colors mb-2">
                    {t(method.title)}
                  </h2>
                  <p className="text-[15px] text-slate-600 font-serif-zen leading-relaxed mb-4">
                    {t(method.summary)}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">{t('关键要领')}：</div>
                    <div className="flex flex-wrap gap-2">
                      {method.steps.map((step, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                          {idx + 1}. {t(step)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {method.classicRef && (
                      <span>{t('依凭典籍')}：<strong className="text-slate-800">{t(method.classicRef)}</strong></span>
                    )}

                    {method.relatedPersons && method.relatedPersons.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{t('传授祖师')}：</span>
                        {method.relatedPersons.slice(0, 2).map((pid) => {
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

                  <span className="text-[13px] font-semibold text-sky-800 flex items-center group-hover:translate-x-1 transition-transform ml-auto">
                    {t('研读细节')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的法门')}</p>
              <button
                onClick={handleResetAll}
                className="mt-3 text-sky-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-sky-700 text-white text-[14px] font-semibold hover:bg-sky-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('种法门')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
