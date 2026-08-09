'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { ZEN_QAS, ZEN_FAQS } from '@/lib/taxonomy';
import { MessageCircle, Lightbulb, ChevronDown, ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function QAsPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(ZEN_FAQS[0]?.id ?? null);
  const { t } = useLang();

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-700 mb-2">
              <MessageCircle className="w-4 h-4" />
              <span>{t('机锋决对与公案解惑')}</span>
            </div>
            <h1 className="text-3xl font-bold font-serif-zen text-slate-900">
              {t('禅宗公案与机锋问答')} ({ZEN_QAS.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('收录达摩、六祖、马祖、赵州、德山、临济、普照国师等历代禅师经典公案与机锋警策。')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* 左列：公案原案 */}
            <section>
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-rose-700 mb-4 px-1">
                <MessageCircle className="w-4 h-4" />
                <span>{t('公案原案')} ({ZEN_QAS.length})</span>
              </div>

              <div className="space-y-6">
                {ZEN_QAS.map((qa) => (
                  <Link href={`/qa/${qa.id}`} key={qa.id} className="block group">
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

                      <div className="text-xs text-slate-400 font-medium pt-2 flex items-center justify-between">
                        <span>{t('回答禅师：')}<strong className="text-slate-800">{t(qa.master)}</strong></span>
                        <span>{t('出处：')}{t(qa.source)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 右列：AI 阅读理解 FAQ */}
            <section className="lg:sticky lg:top-24">
              <div className="flex items-center space-x-2 text-[15px] font-semibold text-amber-800 mb-4 px-1">
                <Lightbulb className="w-4 h-4" />
                <span>{t('参究 FAQ')} ({ZEN_FAQS.length})</span>
              </div>

              <div className="space-y-3">
                {ZEN_FAQS.map((faq) => {
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
                        <span className="text-[15px] font-bold font-serif-zen text-slate-900 leading-snug">
                          {t(faq.question)}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-amber-700 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 -mt-1">
                          <p className="text-[15px] font-serif-zen text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                            {t(faq.answer)}
                          </p>
                          {faq.relatedQa && (
                            <Link
                              href={`/qa/${faq.relatedQa}`}
                              className="inline-flex items-center space-x-1.5 mt-3 text-[13px] font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                            >
                              <span>{t('参看相关公案')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
