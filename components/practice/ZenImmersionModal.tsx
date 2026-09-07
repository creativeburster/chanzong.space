'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Leaf,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';

interface ZenImmersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ZEN_QUOTES = [
  { quote: '狂心顿歇，歇即菩提。', author: '《楞严经》' },
  { quote: '外息诸缘，内心无喘，心如墙壁，可以入道。', author: '菩提达摩' },
  { quote: '平常心是道。行住坐卧，触目遇缘，皆是佛性。', author: '马祖道一' },
  { quote: '大道体宽，无易无难。不二则一切皆同，无不包容。', author: '僧璨《信心铭》' },
  { quote: '菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。', author: '六祖惠能' },
  { quote: '莫向外求，求即是病。眼前听法底无依道人，当下即是。', author: '临济义玄' },
  { quote: '虚明自照，不劳心力。非思量处，识情难测。', author: '四祖道信' },
  { quote: '行到水穷处，坐看云起时。随缘任运，去留无碍。', author: '禅门佳话' },
];

export const ZenImmersionModal: React.FC<ZenImmersionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLang();
  const [theme, setTheme] = useState<'paper' | 'bamboo' | 'night'>('paper');
  const [isRunning, setIsRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'吸气' | '持息' | '呼气'>('吸气');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. 计时器
  useEffect(() => {
    let timer: any;
    if (isOpen && isRunning) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isRunning]);

  // 2. 呼吸节律循环：吸气4s -> 持息4s -> 呼气6s (共14s)
  useEffect(() => {
    if (!isOpen || !isRunning) return;
    let breathTimer: any;
    let step = 0;
    const cycle = () => {
      const secInCycle = step % 14;
      if (secInCycle < 4) {
        setBreathPhase('吸气');
      } else if (secInCycle < 8) {
        setBreathPhase('持息');
      } else {
        setBreathPhase('呼气');
      }
      step++;
    };
    cycle();
    breathTimer = setInterval(cycle, 1000);
    return () => clearInterval(breathTimer);
  }, [isOpen, isRunning]);

  // 3. 祖师名言平滑轮播（每9秒切换）
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % ZEN_QUOTES.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // 4. 监听 ESC 键一键退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 5. Web Audio API 鸣磬音效
  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // 磬声基础频率 432Hz，微带泛音
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(216, ctx.currentTime + 3.5);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.5);
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  // 主题配色映射
  const themeMap = {
    paper: {
      bg: 'bg-[#FAF9F6] text-stone-800',
      panelBg: 'bg-white/80 border-amber-900/10',
      circleRing: 'border-amber-600/40 bg-amber-500/10',
      circleCore: 'bg-amber-800 text-amber-100',
      subText: 'text-stone-500',
    },
    bamboo: {
      bg: 'bg-[#DFEAE0] text-[#122E16]',
      panelBg: 'bg-[#EBF3EC]/80 border-[#BDD2BD]',
      circleRing: 'border-emerald-600/40 bg-emerald-500/10',
      circleCore: 'bg-[#1B4D22] text-emerald-100',
      subText: 'text-[#3D6144]',
    },
    night: {
      bg: 'bg-[#090E17] text-slate-200',
      panelBg: 'bg-[#0F172A]/80 border-slate-800',
      circleRing: 'border-amber-500/30 bg-amber-500/5',
      circleCore: 'bg-amber-500/20 border border-amber-400/40 text-amber-300',
      subText: 'text-slate-400',
    },
  };

  const curTheme = themeMap[theme];
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 ${curTheme.bg} transition-colors duration-700 animate-fade-in select-none backdrop-blur-xl`}
    >
      {/* 顶部极简控制栏 */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold font-serif-zen tracking-widest uppercase">
            {t('沉浸定境 · 净心止念')}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 鸣磬 */}
          <button
            onClick={playChime}
            className={`p-2 rounded-xl border ${curTheme.panelBg} hover:border-amber-600 transition-all text-xs font-semibold flex items-center gap-1.5`}
            title="敲响静心磬"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">{t('鸣磬')}</span>
          </button>

          {/* 主题切换 */}
          <div className={`flex items-center p-1 rounded-xl border ${curTheme.panelBg}`}>
            <button
              onClick={() => setTheme('paper')}
              className={`p-1.5 rounded-lg text-xs ${
                theme === 'paper' ? 'bg-amber-900 text-white' : curTheme.subText
              }`}
              title="宣纸主题"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('bamboo')}
              className={`p-1.5 rounded-lg text-xs ${
                theme === 'bamboo' ? 'bg-emerald-900 text-white' : curTheme.subText
              }`}
              title="竹青主题"
            >
              <Leaf className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('night')}
              className={`p-1.5 rounded-lg text-xs ${
                theme === 'night' ? 'bg-amber-500 text-black' : curTheme.subText
              }`}
              title="暗夜主题"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 退出按钮 */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-red-500/20 bg-red-50/20 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 hover:border-red-500/50 transition-all text-xs font-bold flex items-center gap-1"
            title="退出全屏定境 (ESC)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t('退出 (ESC)')}</span>
          </button>
        </div>
      </div>

      {/* 核心中央：呼吸律动光晕与静心定盘 */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-8">
        {/* 动态呼吸光晕环 */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 ${curTheme.circleRing} transition-all duration-1000 flex items-center justify-center ${
              breathPhase === '吸气'
                ? 'scale-110 shadow-2xl shadow-amber-500/20'
                : breathPhase === '持息'
                ? 'scale-105'
                : 'scale-90 shadow-sm'
            }`}
          >
            <div
              className={`w-48 h-48 sm:w-60 sm:h-60 rounded-full ${curTheme.circleCore} flex flex-col items-center justify-center p-6 shadow-xl transition-transform duration-700`}
            >
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight">
                {formatTime(seconds)}
              </span>
              <span className="text-base sm:text-lg font-bold font-serif-zen mt-2 tracking-widest">
                {t(breathPhase)}
              </span>
              <span className="text-[11px] opacity-75 mt-1 font-mono">
                {breathPhase === '吸气'
                  ? '心随气入 · 澄澈安详'
                  : breathPhase === '持息'
                  ? '安住中道 · 寂照现前'
                  : '缘虑尽空 · 狂心止歇'}
              </span>
            </div>
          </div>
        </div>

        {/* 悬停微调控制器 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-5 py-2.5 rounded-2xl bg-amber-900 text-white font-bold text-xs sm:text-sm hover:bg-amber-800 transition-all shadow-md flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{t('暂停参修')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{t('继续定境')}</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setSeconds(0);
              playChime();
            }}
            className={`p-2.5 rounded-2xl border ${curTheme.panelBg} ${curTheme.subText} hover:text-amber-700 transition-colors`}
            title="重置计时"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 底部祖师法语流转 */}
      <div className="w-full max-w-2xl mx-auto text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('历代祖师警策金句')}</span>
        </div>
        <div className="h-14 flex flex-col justify-center animate-fade-in">
          <p className="text-base sm:text-lg font-bold font-serif-zen tracking-wide leading-relaxed">
            “{t(ZEN_QUOTES[quoteIdx].quote)}”
          </p>
          <span className={`text-xs ${curTheme.subText} mt-1 font-serif-zen`}>
            —— {t(ZEN_QUOTES[quoteIdx].author)}
          </span>
        </div>
      </div>
    </div>
  );
};
