'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Feather } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export const PWAInstallBanner: React.FC = () => {
  const { t } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
      }).catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });
    }

    // 检查是否已经点击过“关闭”或已经安装
    const isDismissed = localStorage.getItem('chanzong-pwa-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isDismissed || isStandalone) {
      return;
    }

    let timer: NodeJS.Timeout;

    // 监听 beforeinstallprompt 事件 (Chrome / Android / Windows)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 用户访问 2 分钟后才优雅提示安装，避免打扰首屏沉浸阅读
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 120000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari 特殊处理
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone && !isDismissed) {
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 120000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('chanzong-pwa-dismissed', 'true');
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS 情况
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('chanzong-pwa-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* 底部微型 PWA 安装横幅（非强制性弹出，支持永久关闭） */}
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-[#0F172A] border border-amber-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between space-x-4 animate-bounce-in">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Feather className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate font-serif-zen">
              {t('安装禅宗知识库 App')}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {t('支持离线阅读与快速桌面访问')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('安装')}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={t('不再显示')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS 指南弹窗 */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-serif-zen text-white">
              {t('添加到 iOS 主屏幕')}
            </h3>
            <div className="text-xs text-slate-300 text-left space-y-2 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <p>1. 点击 Safari 底部工具栏的 <strong className="text-amber-400">分享按钮 ⎋</strong></p>
              <p>2. 向上滑动菜单，找到并点击 <strong className="text-amber-400">添加到主屏幕</strong></p>
              <p>3. 点击右上角 <strong className="text-amber-400">添加</strong> 即可完成离线应用生成</p>
            </div>
            <button
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg"
            >
              {t('知道了')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
