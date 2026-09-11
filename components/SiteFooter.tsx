'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import { DonationModal } from '@/components/DonationModal';
import { STATS } from '@/lib/stats';

export const SiteFooter = () => {
  const { t, getHref } = useLang();
  const [showDonation, setShowDonation] = useState(false);

  // 挂载全局方法，支持任何地方通过 openDonation() 打开
  useEffect(() => {
    (window as any).openDonation = () => setShowDonation(true);
    (window as any).closeDonation = () => setShowDonation(false);
    return () => {
      delete (window as any).openDonation;
      delete (window as any).closeDonation;
    };
  }, []);

  return (
    <>
      <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800/80 py-10 px-4 text-xs text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* 第一行：传承标语 */}
          <div className="text-slate-300 font-medium text-[13px] tracking-wide">
            <span>{t('禅宗知识库')}</span>
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-slate-400">{t('传承东土西天·顿悟见性之道')}</span>
          </div>

          {/* 第二行：知识库整合体量 */}
          <p className="text-slate-500 text-[12px] leading-relaxed">
            {t('本知识库整合了')} {STATS.classics} {t('本核心著作，涵盖语录、公案、经论、清规等多种形式')}
          </p>

          {/* 第三行：版权信息 */}
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} {t('禅宗知识库 (chanzong.space). 保留所有权利.')}
          </p>

          {/* 第四行：导航与支持链接 */}
          <div className="pt-2 flex items-center justify-center flex-wrap gap-y-2 gap-x-3 text-slate-400">
            <Link
              prefetch={false}
              href={getHref('/sitemap')}
              className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
            >
              <span>🌐</span>
              <span>{t('网站地图')}</span>
            </Link>

            <span className="text-slate-700">|</span>

            <Link
              prefetch={false}
              href={getHref('/practice')}
              className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
            >
              <span>🧘</span>
              <span>{t('禅修工坊')}</span>
            </Link>

            <span className="text-slate-700">|</span>

            <Link
              prefetch={false}
              href={getHref('/about')}
              className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
            >
              <span>ℹ️</span>
              <span>{t('关于本站')}</span>
            </Link>

            <span className="text-slate-700">|</span>

            {/* 支持本站触发按钮 */}
            <button
              type="button"
              onClick={() => setShowDonation(true)}
              className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 underline underline-offset-4 font-medium transition-colors cursor-pointer"
            >
              <span>🙏</span>
              <span>{t('支持本站')}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 打赏弹窗组件 */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </>
  );
};
