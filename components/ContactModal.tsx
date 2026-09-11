'use client';

import React, { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { X, Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLang();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [type, setType] = useState('文本勘误');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage(t('请填写您的称呼'));
      setStatus('error');
      return;
    }
    if (!contact.trim()) {
      setErrorMessage(t('请填写您的联系方式（邮箱或微信），以便作者给您回信'));
      setStatus('error');
      return;
    }
    if (!message.trim()) {
      setErrorMessage(t('请填写留言内容'));
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          type,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        // 成功后清空表单并在 2 秒后关闭
        setTimeout(() => {
          setName('');
          setContact('');
          setMessage('');
          setStatus('idle');
          onClose();
        }, 2200);
      } else {
        setStatus('error');
        setErrorMessage(data.error || t('提交失败，请稍后重试'));
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(t('网络请求失败，请检查网络连接后重试'));
    }
  };

  return (
    <div
      id="contactBackdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'submitting') {
          onClose();
        }
      }}
    >
      <style jsx global>{`
        @keyframes contactSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .contact-card-anim {
          animation: contactSlideUp 0.22s ease-out forwards;
        }
      `}</style>

      <div
        className="contact-card-anim relative w-full max-w-[480px] my-6 rounded-2xl bg-white p-6 sm:p-7 text-left shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          disabled={status === 'submitting'}
          aria-label={t('关闭')}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-lg text-lg leading-none disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 头部标题 */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
            <Mail className="w-4 h-4" />
          </div>
          <h3 className="text-stone-900 text-lg font-bold font-serif-zen">
            {t('在线留言反馈')}
          </h3>
        </div>
        <p className="text-stone-500 text-xs sm:text-[13px] leading-relaxed mb-5">
          {t('您的留言将直接加密推送至作者私人邮箱，我们绝不会公开您的个人信息。感恩您的指正与交流！')}
        </p>

        {status === 'success' ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h4 className="text-stone-900 text-base font-bold">
              {t('留言已成功送达！')}
            </h4>
            <p className="text-stone-500 text-xs max-w-[320px] leading-relaxed">
              {t('作者将在邮箱查收您的反馈，并在收到后尽快与您联系。感恩同修支持！❤️')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && errorMessage && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 称呼 */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('您的称呼 / 昵称')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('例如：同修、读者')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === 'submitting'}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all text-stone-800 placeholder-stone-400"
                />
              </div>

              {/* 联系方式 */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('联系方式（回信途径）')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('您的邮箱或微信号')}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  disabled={status === 'submitting'}
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all text-stone-800 placeholder-stone-400"
                />
              </div>
            </div>

            {/* 反馈类型 */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t('反馈类型')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={status === 'submitting'}
                className="w-full text-xs sm:text-sm px-3 py-2 bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all text-stone-800 cursor-pointer"
              >
                <option value="文本勘误">{t('文本错字与标点勘误')}</option>
                <option value="白话翻译建议">{t('白话翻译与导读商榷')}</option>
                <option value="典籍收录建议">{t('经典与公案收录建议')}</option>
                <option value="功能与体验">{t('网站功能与使用体验建议')}</option>
                <option value="参学交流">{t('宗门参学与法义探讨')}</option>
                <option value="其他">{t('其他事项')}</option>
              </select>
            </div>

            {/* 留言内容 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  {t('留言内容')} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  {message.length}/2000
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={2000}
                placeholder={t('请详细描述您的宝贵建议、发现的错漏或想交流的内容...')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'submitting'}
                className="w-full text-xs sm:text-sm p-3 bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all text-stone-800 placeholder-stone-400 leading-relaxed resize-none"
              />
            </div>

            {/* 提交按钮 */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'submitting'}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {t('取消')}
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('正在提交...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('提交留言')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
