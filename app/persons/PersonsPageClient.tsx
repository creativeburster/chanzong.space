'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_PERSONS } from '@/lib/taxonomy';
import { Users, ChevronRight, Search, ChevronDown, Clock, BookOpen, X, RotateCcw } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function PersonsPageClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [activeEra, setActiveEra] = useState('全部');
  const [eraDropdownOpen, setEraDropdownOpen] = useState(false);
  const eraRef = useRef<HTMLDivElement>(null);

  // 书籍筛选状态
  const [activeBook, setActiveBook] = useState('全部');
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const bookRef = useRef<HTMLDivElement>(null);

  const { t, toSimp, toTrad, getHref } = useLang();

  const eras = useMemo(
    () => ['全部', ...Array.from(new Set(ZEN_PERSONS.map((p) => p.era)))],
    []
  );

  // 统计每部经典涉及的人物数量并排序
  const bookOptions = useMemo(() => {
    const bookMap = new Map<string, { id: string; title: string; author: string; count: number }>();

    manifest.forEach((b) => {
      bookMap.set(b.id, { id: b.id, title: b.title, author: b.author || '', count: 0 });
    });

    ZEN_PERSONS.forEach((p) => {
      const matched = new Set<string>();
      if (p.relatedBooks) {
        p.relatedBooks.forEach((bid) => {
          if (bookMap.has(bid)) matched.add(bid);
        });
      }
      if (p.classics) {
        p.classics.forEach((c) => {
          manifest.forEach((b) => {
            if (b.title.includes(c) || c.includes(b.title) || b.id === c) {
              matched.add(b.id);
            }
          });
        });
      }
      manifest.forEach((b) => {
        if (b.author && (b.author.includes(p.name) || p.name.includes(b.author))) {
          matched.add(b.id);
        }
      });
      matched.forEach((bid) => {
        const item = bookMap.get(bid);
        if (item) item.count++;
      });
    });

    return Array.from(bookMap.values())
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);

  // 下拉面板内对书籍标题的模糊搜索
  const filteredBookOptions = useMemo(() => {
    if (!bookSearch.trim()) return bookOptions;
    const q = bookSearch.trim().toLowerCase();
    const qSimp = toSimp(q);
    const qTrad = toTrad(q);
    return bookOptions.filter((b) => {
      const tLow = b.title.toLowerCase();
      return tLow.includes(q) || tLow.includes(qSimp) || tLow.includes(qTrad);
    });
  }, [bookOptions, bookSearch, toSimp, toTrad]);

  const selectedBookTitle = useMemo(() => {
    if (activeBook === '全部') return '';
    const b = manifest.find((item) => item.id === activeBook);
    return b ? b.title : activeBook;
  }, [activeBook]);

  // 核心过滤逻辑：支持朝代、书籍、关键词复合筛选
  const filtered = useMemo(() => {
    let result = ZEN_PERSONS;

    // 1. 朝代筛选
    if (activeEra !== '全部') {
      result = result.filter((p) => p.era === activeEra);
    }

    // 2. 书籍筛选：只要人物在该书籍中出现即匹配
    if (activeBook !== '全部') {
      const selectedBook = manifest.find((b) => b.id === activeBook);
      const bTitle = selectedBook?.title || '';
      const bAuthor = selectedBook?.author || '';

      result = result.filter((p) => {
        if (p.relatedBooks && p.relatedBooks.includes(activeBook)) return true;
        if (
          p.classics &&
          p.classics.some(
            (c) => c === activeBook || c === bTitle || bTitle.includes(c) || c.includes(bTitle)
          )
        )
          return true;
        if (bAuthor && (bAuthor.includes(p.name) || p.name.includes(bAuthor))) return true;
        return false;
      });
    }

    // 3. 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      const kwSimp = toSimp(kw);
      const kwTrad = toTrad(kw);
      const kwList = Array.from(new Set([kw, kwSimp, kwTrad]));
      result = result.filter((p) => {
        const nLower = p.name.toLowerCase();
        const tLower = p.title.toLowerCase();
        const teLower = p.teachings.toLowerCase();
        const eLower = p.era.toLowerCase();
        return kwList.some(
          (k) =>
            nLower.includes(k) ||
            tLower.includes(k) ||
            teLower.includes(k) ||
            eLower.includes(k)
        );
      });
    }

    return result;
  }, [activeEra, activeBook, keyword, toSimp, toTrad]);

  const visiblePersons = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (eraRef.current && !eraRef.current.contains(e.target as Node)) setEraDropdownOpen(false);
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDisplayCount(12);
  }, [activeEra, activeBook, keyword]);

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-10">
          <Breadcrumb items={[{ label: '禅门人物' }]} />

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif-zen text-slate-900 leading-tight">
                {t('禅门人物')}
              </h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                共 {ZEN_PERSONS.length} 位 · {t('历代禅师、护法、文人及公案中出现的各类人物')}
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
                placeholder="搜索人物名称、称号或关键词…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600/60 focus:ring-2 focus:ring-purple-600/10 transition-all"
              />
            </div>

            {/* 朝代筛选下拉框 */}
            <div className="relative" ref={eraRef}>
              <button
                onClick={() => { setEraDropdownOpen((o) => !o); setBookDropdownOpen(false); }}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeEra !== '全部'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-600/60 hover:text-purple-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  {activeEra === '全部' ? t('全部朝代') : t(activeEra)}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${eraDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {eraDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-48 max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                  {eras.map((era) => (
                    <button
                      key={era}
                      onClick={() => { setActiveEra(era); setEraDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        activeEra === era
                          ? 'bg-purple-50 text-purple-800'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {era === '全部' ? t('全部朝代') : t(era)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 典籍筛选下拉框 (支持搜索典籍与显示包含人物数) */}
            <div className="relative" ref={bookRef}>
              <button
                onClick={() => { setBookDropdownOpen((o) => !o); setEraDropdownOpen(false); }}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all border ${
                  activeBook !== '全部'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-600/60 hover:text-purple-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0 text-purple-400" />
                  <span className="max-w-[160px] truncate">
                    {activeBook === '全部' ? t('全部典籍') : t(selectedBookTitle)}
                  </span>
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${bookDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {bookDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-80 max-h-80 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {/* 下拉内快速搜索书籍输入框 */}
                  <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        placeholder={t('搜索典籍名称...')}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 text-slate-800"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {bookSearch && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setBookSearch(''); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 全部典籍选项 */}
                  <button
                    onClick={() => { setActiveBook('全部'); setBookDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors flex items-center justify-between ${
                      activeBook === '全部'
                        ? 'bg-purple-50 text-purple-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('全部典籍')}</span>
                    </span>
                    <span className="text-xs text-slate-400">{ZEN_PERSONS.length}</span>
                  </button>

                  {/* 典籍列表 */}
                  {filteredBookOptions.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setActiveBook(b.id); setBookDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors flex items-center justify-between gap-2 ${
                        activeBook === b.id
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{t(b.title)}</span>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 border border-purple-200 px-1.5 py-0.2 rounded-full shrink-0">
                        {b.count}
                      </span>
                    </button>
                  ))}

                  {filteredBookOptions.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400">
                      {t('未找到匹配的典籍')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 已选筛选标签栏与统计结果 */}
          {(keyword.trim() || activeEra !== '全部' || activeBook !== '全部') && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-500">
                {t('当前筛选')}:
              </span>

              {activeEra !== '全部' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-2xs">
                  <Clock className="w-3 h-3" />
                  <span>{t('朝代')}: {t(activeEra)}</span>
                  <button onClick={() => setActiveEra('全部')} className="hover:text-slate-300 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeBook !== '全部' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-800 text-white text-xs font-semibold shadow-2xs">
                  <BookOpen className="w-3 h-3" />
                  <span>{t('典籍')}: {t(selectedBookTitle)}</span>
                  <button onClick={() => setActiveBook('全部')} className="hover:text-purple-200 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {keyword.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                  <Search className="w-3 h-3" />
                  <span>"{keyword.trim()}"</span>
                  <button onClick={() => setKeyword('')} className="hover:text-amber-700 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() => { setActiveEra('全部'); setActiveBook('全部'); setKeyword(''); }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('重置所有筛选')}</span>
              </button>

              <span className="ml-auto text-xs text-slate-500 font-medium">
                {t('共找到')} <strong className="text-purple-700 font-bold">{filtered.length}</strong> {t('位人物')}
              </span>
            </div>
          )}

          {/* Person Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visiblePersons.map((person) => (
              <Link prefetch={false} key={person.id}
                href={getHref(`/persons/${person.id}`)}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-600 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {t(person.title)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{t(person.era)}</span>
                  </div>

                  <h2 className="text-xl font-bold font-serif-zen text-slate-900 group-hover:text-purple-800 transition-colors mb-2">
                    {t(person.name)}
                  </h2>

                  <p className="text-[15px] text-slate-600 font-serif-zen leading-relaxed mb-4 line-clamp-3">
                    {t(person.teachings)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {person.classics.map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-semibold">
                        {t(c)}
                      </span>
                    ))}
                  </div>
                  <span className="text-[13px] font-semibold text-purple-800 flex items-center group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                    {t('阅读生平')} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-[15px]">{t('未找到匹配的人物')}</p>
              <button
                onClick={() => { setKeyword(''); setActiveEra('全部'); setActiveBook('全部'); }}
                className="mt-3 text-purple-800 text-[13px] font-semibold hover:underline"
              >
                {t('清除筛选条件')}
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${Math.round((displayCount / filtered.length) * 100)}%` }} />
              </div>
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-purple-700 text-white text-[14px] font-semibold hover:bg-purple-800 transition-all shadow-md"
              >
                {t('加载更多')} ({displayCount} / {filtered.length})
              </button>
            </div>
          )}

          {!hasMore && filtered.length > 12 && (
            <p className="mt-6 text-center text-xs text-slate-500">
              {t('已显示全部')} {filtered.length} {t('位人物')}
            </p>
          )}
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
