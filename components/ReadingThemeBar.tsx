'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Leaf, Moon } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export type ReadingTheme = 'paper' | 'bamboo' | 'night';

export const ReadingThemeBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLang();
  const [theme, setTheme] = useState<ReadingTheme>('paper');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zen_reading_theme') as ReadingTheme;
      if (saved && (saved === 'paper' || saved === 'bamboo' || saved === 'night')) {
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
        if (saved === 'night') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('night');
          document.documentElement.setAttribute('data-theme', 'night');
          document.documentElement.classList.add('dark');
        }
      }
    } catch {}
  }, []);

  const changeTheme = (newTheme: ReadingTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('zen_reading_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'night') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  };

  const themes: { id: ReadingTheme; label: string; icon: any }[] = [
    { id: 'paper', label: '宣纸', icon: Sun },
    { id: 'bamboo', label: '竹青', icon: Leaf },
    { id: 'night', label: '暗夜', icon: Moon },
  ];

  return (
    <div className={`inline-flex items-center p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-900/10 dark:border-slate-800 shadow-xs space-x-1 ${className}`}>
      {themes.map((item) => {
        const Icon = item.icon;
        const isActive = theme === item.id;
        return (
          <button
            key={item.id}
            onClick={() => changeTheme(item.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-amber-900 text-amber-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(item.label)}</span>
          </button>
        );
      })}
    </div>
  );
};
