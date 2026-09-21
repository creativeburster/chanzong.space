'use client';

import React, { useState } from 'react';
import { BookText, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';

const PAGE_SIZE = 4;

interface TranslationCardProps {
  classicId: string;
  translations?: string[];
}

export const TranslationCard: React.FC<TranslationCardProps> = ({ classicId, translations }) => {
  const { t } = useLang();
  const paragraphs = translations;
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);

  const totalPages = paragraphs ? Math.ceil(paragraphs.length / PAGE_SIZE) : 0;
  const pageItems = paragraphs?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];

  return (
    <div className="mt-10 bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 sm:px-10 py-5 hover:bg-amber-50/40 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <BookText className="w-5 h-5 text-amber-800" />
          <span className="text-xl font-bold font-serif-zen text-zinc-900">{t('白话今译')}</span>
          {paragraphs && (
            <span className="text-xs font-semibold text-zinc-400">
              {t('共')} {paragraphs.length} {t('段')}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-6 sm:px-10 pb-8">
          {paragraphs ? (
            <>
              <div className="space-y-4">
                {pageItems.map((p, i) => (
                  <p
                    key={page * PAGE_SIZE + i}
                    className="text-[16px] font-serif-zen text-zinc-700 leading-loose bg-amber-50/50 px-5 py-4 rounded-2xl border border-amber-200/50"
                  >
                    <span className="text-xs font-bold text-amber-700 mr-2">{page * PAGE_SIZE + i + 1}.</span>
                    {t(p)}
                  </p>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setPage((v) => Math.max(0, v - 1))}
                    disabled={page === 0}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-zinc-200 text-[13px] font-semibold text-zinc-600 hover:border-amber-700 hover:text-amber-800 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('上一页')}</span>
                  </button>
                  <span className="text-xs font-bold text-zinc-400">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-zinc-200 text-[13px] font-semibold text-zinc-600 hover:border-amber-700 hover:text-amber-800 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600 transition-all"
                  >
                    <span>{t('下一页')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-400 font-serif-zen py-4 text-center">
              {t('本篇白话今译整理中，敬请期待。')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
