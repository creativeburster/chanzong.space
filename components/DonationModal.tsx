'use client';

import React, { useEffect } from 'react';
import { useLang } from '@/context/LangContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLang();

  useEffect(() => {
    if (!isOpen) return;

    // 禁用背景滚动
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 监听 Esc 键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="donationBackdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <style jsx global>{`
        @keyframes donationSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .donation-card-anim {
          animation: donationSlideUp 0.25s ease-out forwards;
        }
      `}</style>

      <div
        className="donation-card-anim relative w-full max-w-[400px] rounded-2xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          aria-label={t('关闭')}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-lg text-lg leading-none"
        >
          ✕
        </button>

        {/* 标题 */}
        <h3 className="text-stone-800 text-lg font-bold mb-2 flex items-center justify-center gap-1.5">
          <span>🙏</span>
          <span>{t('支持本站')}</span>
        </h3>

        {/* 说明文字 */}
        <p className="text-stone-500 text-xs sm:text-[13px] leading-relaxed mb-5">
          {t('本站纯属公益，不以盈利为目的，亦不设置任何商业变现。')}
          <br />
          {t('如对您有所帮助，欢迎随心打赏，支持服务器、域名费用及作者的持续维护。感恩 ❤️')}
        </p>

        {/* 二维码区域 */}
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {/* 支付宝 */}
          <div className="flex flex-col items-center gap-2 p-3 border border-stone-200 rounded-xl bg-stone-50/60 shadow-sm hover:shadow-md transition-shadow">
            <img
              src="/images/alipay_qr.jpg"
              alt={t('支付宝收款码')}
              className="w-[120px] h-[120px] object-cover rounded-lg block border border-stone-100"
            />
            <span className="text-[11px] font-semibold bg-[#E8F4FF] text-[#0070e0] px-3 py-0.5 rounded-full">
              {t('支付宝')}
            </span>
          </div>

          {/* 微信支付 */}
          <div className="flex flex-col items-center gap-2 p-3 border border-stone-200 rounded-xl bg-stone-50/60 shadow-sm hover:shadow-md transition-shadow">
            <img
              src="/images/wechat_qr.jpg"
              alt={t('微信收款码')}
              className="w-[120px] h-[120px] object-cover rounded-lg block border border-stone-100"
            />
            <span className="text-[11px] font-semibold bg-[#E8F9EE] text-[#07c160] px-3 py-0.5 rounded-full">
              {t('微信支付')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
