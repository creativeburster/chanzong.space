'use client';

import React, { createContext, useContext, useState } from 'react';

// Common Simplified to Traditional Mapping Dictionary
const SIMP_TO_TRAD_MAP: Record<string, string> = {
  禅: '禪',
  宗: '宗',
  正: '正',
  法: '法',
  心: '心',
  传: '傳',
  知: '知',
  识: '識',
  库: '庫',
  典: '典',
  籍: '籍',
  书: '書',
  观: '觀',
  觉: '覺',
  性: '性',
  经: '經',
  问: '問',
  答: '答',
  修: '修',
  行: '行',
  祖: '祖',
  师: '師',
  体: '體',
  用: '用',
  门: '門',
  显: '顯',
  无: '無',
  染: '染',
  自: '自',
  解: '解',
  脱: '脫',
  图: '圖',
  谱: '譜',
  佛: '佛',
  说: '說',
  处: '處',
  宝: '寶',
  录: '錄',
  万: '萬',
  应: '應',
  对: '對',
  随: '隨',
  缘: '緣',
  报: '報',
  冤: '冤',
  极: '極',
  速: '速',
  搜: '搜',
  索: '索',
  点: '點',
  击: '擊',
  关: '關',
  系: '系',
  网: '網',
  络: '絡',
};

export function convertToTrad(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += SIMP_TO_TRAD_MAP[char] || char;
  }
  return result;
}

interface LangContextType {
  isTraditional: boolean;
  toggleLang: () => void;
  t: (text: string) => string;
}

const LangContext = createContext<LangContextType>({
  isTraditional: false,
  toggleLang: () => {},
  t: (text: string) => text,
});

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTraditional, setIsTraditional] = useState(false);

  const toggleLang = () => setIsTraditional((prev) => !prev);

  const t = (text: string) => {
    if (!isTraditional) return text;
    return convertToTrad(text);
  };

  return (
    <LangContext.Provider value={{ isTraditional, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
