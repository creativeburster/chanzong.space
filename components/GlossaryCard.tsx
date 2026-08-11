'use client';

import React, { useState } from 'react';
import { BookMarked, ChevronDown } from 'lucide-react';
import { ZEN_GLOSSARY } from '@/lib/glossary';
import { useLang } from '@/context/LangContext';

export const GlossaryCard: React.FC<{ sourceIds: string[] }> = ({ sourceIds }) => {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const seen = new Set<string>();
  const entries = sourceIds
    .flatMap((id) => ZEN_GLOSSARY[id] ?? [])
    .filter((e) => {
      if (seen.has(e.char)) return false;
      seen.add(e.char);
      return true;
    });

  if (entries.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 sm:px-10 py-5 hover:bg-emerald-50/40 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <BookMarked className="w-5 h-5 text-emerald-700" />
          <span className="text-xl font-bold font-serif-zen text-zinc-900">{t('生僻字解释')}</span>
          <span className="text-xs font-semibold text-zinc-400">
            {t('共')} {entries.length} {t('字')}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-6 sm:px-10 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/50"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <span className="text-xl font-bold font-serif-zen text-emerald-800">
                    {entry.char.length <= 2 ? entry.char : entry.char[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[15px] font-bold font-serif-zen text-zinc-900">{entry.char}</span>
                    <span className="text-[12px] text-emerald-600 font-semibold">{entry.pinyin}</span>
                  </div>
                  <p className="text-[13px] text-zinc-600 mt-0.5 leading-relaxed">{entry.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
