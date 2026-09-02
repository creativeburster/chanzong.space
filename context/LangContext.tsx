'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { convertToTrad, convertToSimp, convertHtmlToTrad, getLocalizedHref } from '@/lib/opencc';

export { convertToTrad, convertToSimp, convertHtmlToTrad, getLocalizedHref };

interface LangContextType {
  isTraditional: boolean;
  toggleLang: () => void;
  setLang: (trad: boolean) => void;
  t: (text: string) => string;
  tHtml: (html: string) => string;
  toTrad: (text: string) => string;
  toSimp: (text: string) => string;
  getHref: (href: string) => string;
}

const LangContext = createContext<LangContextType>({
  isTraditional: false,
  toggleLang: () => {},
  setLang: () => {},
  t: (text: string) => text,
  tHtml: (html: string) => html,
  toTrad: (text: string) => text,
  toSimp: (text: string) => text,
  getHref: (href: string) => href,
});

export const LangProvider: React.FC<{ children: React.ReactNode; initialTraditional?: boolean }> = ({
  children,
  initialTraditional,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isZhTwPath = pathname?.startsWith('/zh-tw') || initialTraditional;

  const [isTraditional, setIsTraditional] = useState<boolean>(Boolean(initialTraditional || isZhTwPath));

  // 初始化根据 URL 或 localStorage 读取用户偏好
  useEffect(() => {
    if (isZhTwPath || initialTraditional) {
      setIsTraditional(true);
      document.documentElement.lang = 'zh-Hant';
      return;
    }
    try {
      const saved = localStorage.getItem('zen_is_traditional');
      if (saved !== null) {
        const val = saved === 'true';
        setIsTraditional(val);
        document.documentElement.lang = val ? 'zh-Hant' : 'zh-Hans';
      }
    } catch {
      // 兼容非浏览器环境
    }
  }, [isZhTwPath, initialTraditional]);

  const toggleLang = useCallback(() => {
    setIsTraditional((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zen_is_traditional', String(next));
        document.documentElement.lang = next ? 'zh-Hant' : 'zh-Hans';
      } catch {
        // ignore
      }

      // 如果有对应的路由，执行平滑路由跳转以保证顶级 SEO
      if (next && !pathname.startsWith('/zh-tw')) {
        const target = pathname === '/' ? '/zh-tw' : `/zh-tw${pathname}`;
        router.push(target);
      } else if (!next && pathname.startsWith('/zh-tw')) {
        const target = pathname.replace(/^\/zh-tw/, '') || '/';
        router.push(target);
      }

      return next;
    });
  }, [pathname, router]);

  const setLang = useCallback((trad: boolean) => {
    setIsTraditional(trad);
    try {
      localStorage.setItem('zen_is_traditional', String(trad));
      document.documentElement.lang = trad ? 'zh-Hant' : 'zh-Hans';
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((text: string) => {
    if (!isTraditional || !text) return text;
    return convertToTrad(text);
  }, [isTraditional]);

  const tHtml = useCallback((html: string) => {
    if (!isTraditional || !html) return html;
    return convertHtmlToTrad(html);
  }, [isTraditional]);

  const getHref = useCallback((href: string) => {
    return getLocalizedHref(href, isTraditional);
  }, [isTraditional]);

  const value = useMemo(() => ({
    isTraditional,
    toggleLang,
    setLang,
    t,
    tHtml,
    toTrad: convertToTrad,
    toSimp: convertToSimp,
    getHref,
  }), [isTraditional, toggleLang, setLang, t, tHtml, getHref]);

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
