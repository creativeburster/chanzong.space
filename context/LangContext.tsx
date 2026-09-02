'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as OpenCC from 'opencc-js';

// 初始化 OpenCC 高性能双向转换器
// 'twp': 包含台湾/传统繁体常用词汇习惯（如 打印->列印、软件->軟體、网络->網路、信息->資訊、默认->預設 等）
const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });
const t2sConverter = OpenCC.Converter({ from: 'twp', to: 'cn' });

// 内存 LRU 缓存，极大加速高频短文本（UI 按钮、标题、标签）转换
const tradCache = new Map<string, string>();
const simpCache = new Map<string, string>();
const MAX_CACHE_SIZE = 5000;

export function convertToTrad(text: string): string {
  if (!text) return text;
  if (tradCache.has(text)) {
    return tradCache.get(text)!;
  }
  const result = s2tConverter(text);
  if (tradCache.size > MAX_CACHE_SIZE) {
    tradCache.clear();
  }
  tradCache.set(text, result);
  return result;
}

export function convertToSimp(text: string): string {
  if (!text) return text;
  if (simpCache.has(text)) {
    return simpCache.get(text)!;
  }
  const result = t2sConverter(text);
  if (simpCache.size > MAX_CACHE_SIZE) {
    simpCache.clear();
  }
  simpCache.set(text, result);
  return result;
}

/**
 * 安全 HTML 繁简转换：
 * 仅转换 HTML 标签外侧的文本节点，完整保留所有标签名、class 类名、id、style 与 href 属性！
 */
export function convertHtmlToTrad(html: string): string {
  if (!html) return html;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) return tag;
    return convertToTrad(text);
  });
}

interface LangContextType {
  isTraditional: boolean;
  toggleLang: () => void;
  setLang: (trad: boolean) => void;
  t: (text: string) => string;
  tHtml: (html: string) => string;
  toTrad: (text: string) => string;
  toSimp: (text: string) => string;
}

const LangContext = createContext<LangContextType>({
  isTraditional: false,
  toggleLang: () => {},
  setLang: () => {},
  t: (text: string) => text,
  tHtml: (html: string) => html,
  toTrad: (text: string) => text,
  toSimp: (text: string) => text,
});

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTraditional, setIsTraditional] = useState(false);

  // 初始化从 localStorage 读取用户繁简偏好
  useEffect(() => {
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
  }, []);

  const toggleLang = useCallback(() => {
    setIsTraditional((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zen_is_traditional', String(next));
        document.documentElement.lang = next ? 'zh-Hant' : 'zh-Hans';
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

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

  const value = useMemo(() => ({
    isTraditional,
    toggleLang,
    setLang,
    t,
    tHtml,
    toTrad: convertToTrad,
    toSimp: convertToSimp,
  }), [isTraditional, toggleLang, setLang, t, tHtml]);

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

