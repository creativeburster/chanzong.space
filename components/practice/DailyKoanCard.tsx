'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, RefreshCw, Share2, BookOpen, Check, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { ZEN_KOANS } from '@/lib/taxonomy/koans';
import { useLang } from '@/context/LangContext';
import ZenQuoteCardModal from '@/components/ZenQuoteCardModal';

export const DailyKoanCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, getHref } = useLang();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // 根据当前日期计算默认今日机锋
  const todaySeed = useMemo(() => {
    const now = new Date();
    const str = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % ZEN_KOANS.length;
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(todaySeed);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const koan = ZEN_KOANS[currentIndex] || ZEN_KOANS[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % ZEN_KOANS.length);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `【禅宗知识库 · 每日机锋】\n公案：${koan.question}\n机锋：${koan.master} · 《${koan.source}》\n参修：${koan.interpretation}\n来自：https://chanzong.space/koan/${koan.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-2xl p-5 border border-amber-200/80 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('今日机锋 · 灵签')}</span>
          </div>
          <button
            onClick={handleNext}
            title={t('参悟下一则')}
            className="text-xs text-amber-800 hover:text-amber-950 flex items-center space-x-1 hover:bg-amber-100/60 px-2 py-1 rounded-md transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{t('换一则')}</span>
          </button>
        </div>

        <h3 className="text-base font-bold font-serif-zen text-slate-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
          {t(koan.question)}
        </h3>
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {t(koan.context || koan.interpretation || '')}
        </p>

        <div className="mt-3.5 pt-3 border-t border-amber-900/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {t(koan.master)} · {t(koan.source || '')}
          </span>
          <Link
            prefetch={false}
            href={getHref(`/koan/${koan.id}`)}
            className="inline-flex items-center space-x-1 font-bold text-amber-800 hover:text-amber-950 hover:underline"
          >
            <span>{t('参究破关')}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 签文卡片外框 */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer select-none bg-[#FCFAF6] rounded-3xl p-6 sm:p-8 border-2 border-amber-900/15 shadow-md hover:shadow-xl hover:border-amber-700/40 transition-all duration-300 relative overflow-hidden group"
      >
        {/* 背景禅意水墨暗纹装饰 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-amber-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-radial from-orange-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* 顶栏小标签 */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-900 text-amber-100 text-xs font-bold tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('今日禅门机锋签')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 rounded-xl bg-white/80 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-amber-200/60 shadow-xs transition-colors flex items-center gap-1"
              title={t('生成禅语卡片海报')}
            >
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-medium text-amber-900 hidden sm:inline">{t('做海报')}</span>
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/80 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-amber-200/60 shadow-xs transition-colors"
              title={t('重新摇签 / 参下一则')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 签文正面 / 反面切换内容 */}
        <div className="relative z-10">
          {!isFlipped ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center py-4">
                <div className="text-xs uppercase tracking-widest text-amber-800 font-bold mb-2">
                  — {t('破迷解执 · 直指自性')} —
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-zen text-slate-900 leading-snug tracking-wide">
                  "{t(koan.question)}"
                </h2>
              </div>

              {koan.context && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif-zen">
                  <span className="font-bold text-amber-900 mr-1.5">{t('【公案因缘】')}</span>
                  {t(koan.context)}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>
                  {t(koan.master)} · 《{t(koan.source || '')}》
                </span>
                <span className="text-amber-800 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  {t('点击翻开解签参悟')} →
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center py-2 border-b border-amber-900/10 pb-4">
                <div className="text-xs uppercase tracking-widest text-emerald-800 font-bold mb-1">
                  — {t('宗门玄旨 · 破关点拨')} —
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif-zen text-slate-900">
                  {t(koan.question)}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif-zen">
                <span className="font-bold text-emerald-900 mr-1.5">{t('【参修要旨】')}</span>
                {t(koan.interpretation || '')}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {t('点击任意处翻回签文')}
                </span>
                <Link
                  prefetch={false}
                  href={getHref(`/koan/${koan.id}`)}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-bold shadow-sm transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('深度研读此则公案')}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ZenQuoteCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        quote={`问：“${koan.question}”\n答：“${koan.answer}”`}
        interpretation={koan.interpretation}
        sourceTitle={koan.source}
        author={koan.master}
      />
    </div>
  );
};
