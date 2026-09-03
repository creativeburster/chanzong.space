'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Wind,
  Sparkles,
  AlertCircle,
  Award,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { zenAudio } from '@/lib/audio';

// 呼吸模式定义
type BreathPatternId = 'box' | 'calm_478' | 'coherence_55' | 'free';

interface BreathPattern {
  id: BreathPatternId;
  name: string;
  desc: string;
  badge: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'calm_478',
    name: '4-7-8 安神息',
    desc: '吸4·留7·呼8，深层舒缓中枢神经与焦虑',
    badge: '舒压入定',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 1,
  },
  {
    id: 'coherence_55',
    name: '5-5 调和均等息',
    desc: '吸5·呼5，建立心脑相干节律，凝神静虑',
    badge: '平心调气',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
  },
  {
    id: 'box',
    name: '4-4-4-4 箱式呼吸',
    desc: '吸4·持4·呼4·空4，禅门与极客深度专注法',
    badge: '极速专注',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  {
    id: 'free',
    name: '自然随息观',
    desc: '不限秒数，纯观鼻端一呼一吸，呼尽记数',
    badge: '纯正止观',
    inhale: 0,
    holdIn: 0,
    exhale: 0,
    holdOut: 0,
  },
];

type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

// 水墨大写汉字数息
const CHINESE_NUMS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export const ZenBreathCounter: React.FC = () => {
  const { t } = useLang();

  // 模式与运行状态
  const [selectedPatternId, setSelectedPatternId] = useState<BreathPatternId>('calm_478');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 呼吸阶段与倒数秒数
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);

  // 数息互动：1~10
  const [breathCount, setBreathCount] = useState<number>(1);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [lastDistractedTime, setLastDistractedTime] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentPattern = BREATH_PATTERNS.find((p) => p.id === selectedPatternId) || BREATH_PATTERNS[0];

  // 从本地加载历史最高连贯
  useEffect(() => {
    try {
      const savedBest = parseInt(localStorage.getItem('zen_breath_best_streak') || '0', 10);
      setBestStreak(savedBest);
    } catch {
      // ignore
    }
  }, []);

  // 呼吸阶段信息
  const getPhaseDetails = (p: BreathPhase) => {
    switch (p) {
      case 'inhale':
        return {
          title: '鼻吸绵绵',
          tip: '虚灵顶劲 · 气沉丹田',
          color: 'from-amber-600 via-amber-500 to-yellow-500',
          ringColor: 'border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]',
          scale: 'scale-110 sm:scale-125',
        };
      case 'holdIn':
        return {
          title: '凝神安住',
          tip: '一念不起 · 照体独立',
          color: 'from-amber-700 via-stone-700 to-stone-800',
          ringColor: 'border-amber-700/60 shadow-[0_0_20px_rgba(180,83,9,0.2)]',
          scale: 'scale-110 sm:scale-125',
        };
      case 'exhale':
        return {
          title: '徐徐吐尽',
          tip: '尘劳尽放 · 身心轻安',
          color: 'from-emerald-700 via-teal-600 to-stone-700',
          ringColor: 'border-teal-600/50 shadow-[0_0_30px_rgba(20,184,166,0.2)]',
          scale: 'scale-90 sm:scale-95',
        };
      case 'holdOut':
        return {
          title: '澄然寂照',
          tip: '空无所碍 · 本来无物',
          color: 'from-stone-800 to-slate-900',
          ringColor: 'border-stone-500/40 shadow-none',
          scale: 'scale-90 sm:scale-95',
        };
    }
  };

  // 切换模式
  const selectPattern = (patternId: BreathPatternId) => {
    setIsActive(false);
    setSelectedPatternId(patternId);
    const p = BREATH_PATTERNS.find((item) => item.id === patternId) || BREATH_PATTERNS[0];
    setPhase('inhale');
    setPhaseSecondsLeft(p.inhale > 0 ? p.inhale : 4);
  };

  // 呼吸主节律定时器
  useEffect(() => {
    if (!isActive || currentPattern.id === 'free') return;

    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // 阶段切换
          if (phase === 'inhale') {
            if (currentPattern.holdIn > 0) {
              setPhase('holdIn');
              return currentPattern.holdIn;
            } else {
              setPhase('exhale');
              if (soundEnabled) zenAudio.playWoodenFish(0.4);
              return currentPattern.exhale;
            }
          } else if (phase === 'holdIn') {
            setPhase('exhale');
            if (soundEnabled) zenAudio.playWoodenFish(0.4);
            return currentPattern.exhale;
          } else if (phase === 'exhale') {
            if (currentPattern.holdOut > 0) {
              setPhase('holdOut');
              return currentPattern.holdOut;
            } else {
              setPhase('inhale');
              return currentPattern.inhale;
            }
          } else {
            // holdOut -> inhale
            setPhase('inhale');
            return currentPattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, currentPattern, soundEnabled]);

  // 键盘空格键数息
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isActive) {
        e.preventDefault();
        countOneBreath();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, breathCount, streakCount, bestStreak]);

  // 手动数一息 (1 ~ 10 循环)
  const countOneBreath = useCallback(() => {
    if (soundEnabled) {
      zenAudio.playBeadClick(0.7);
    }

    const nextCount = breathCount >= 10 ? 1 : breathCount + 1;
    const nextStreak = streakCount + 1;

    setBreathCount(nextCount);
    setStreakCount(nextStreak);

    if (nextStreak > bestStreak) {
      setBestStreak(nextStreak);
      try {
        localStorage.setItem('zen_breath_best_streak', String(nextStreak));
      } catch {
        // ignore
      }
    }

    // 若正好数完第 10 息，敲一声清脆引磬加持
    if (breathCount === 10 && soundEnabled) {
      zenAudio.playYinQing(0.65);
    }
  }, [breathCount, streakCount, bestStreak, soundEnabled]);

  // 觉察妄念 · 归零重数（数息法核心修持）
  const markDistraction = () => {
    if (soundEnabled) {
      // 沉重木鱼微响，提撕正念
      zenAudio.playWoodenFish(0.8);
    }

    setDistractionCount((prev) => prev + 1);
    setStreakCount(0);
    setBreathCount(1);
    setLastDistractedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // 开始 / 暂停
  const togglePlay = () => {
    if (!isActive) {
      setIsActive(true);
      if (soundEnabled) zenAudio.playYinQing(0.6);
    } else {
      setIsActive(false);
    }
  };

  // 重置
  const resetAll = () => {
    setIsActive(false);
    setPhase('inhale');
    setPhaseSecondsLeft(currentPattern.inhale > 0 ? currentPattern.inhale : 4);
    setBreathCount(1);
    setStreakCount(0);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const currentDetails = getPhaseDetails(phase);

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-b from-[#FAF9F6] via-white to-stone-50 rounded-3xl border border-amber-900/15 shadow-sm p-6 sm:p-8 transition-all select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col justify-center bg-[#171614] text-stone-200 p-8 sm:p-16' : ''
      }`}
    >
      {/* 顶部标题与设置 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>{t('天台六妙门 · 止观数息')}</span>
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold font-serif-zen ${isFullscreen ? 'text-stone-100' : 'text-slate-900'}`}>
            {t('止观数息专注室')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs transition-colors ${
              soundEnabled
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            }`}
            title={soundEnabled ? t('静音') : t('开启音效')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors"
            title={isFullscreen ? t('退出全屏') : t('沉浸全屏')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 呼吸模式选择 */}
      {!isFullscreen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {BREATH_PATTERNS.map((p) => {
            const isSel = selectedPatternId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectPattern(p.id)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSel
                    ? 'bg-stone-900 text-stone-100 border-stone-950 shadow-sm scale-[1.02]'
                    : 'bg-white hover:bg-amber-50/60 text-slate-700 border-amber-900/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-serif-zen">{t(p.name)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSel ? 'bg-stone-700 text-amber-300' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <p className={`text-[11px] leading-tight line-clamp-1 ${isSel ? 'text-stone-300' : 'text-slate-500'}`}>
                  {t(p.desc)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* 核心光环律动区域 */}
      <div className="relative flex flex-col items-center justify-center my-6 sm:my-10">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* 外环呼吸光晕 */}
          <div
            className={`absolute inset-4 rounded-full border-4 transition-all duration-1000 ease-in-out ${
              isActive ? currentDetails.ringColor : 'border-stone-200'
            } ${isActive ? currentDetails.scale : 'scale-100'}`}
          />

          {/* 第二重玉石柔光环 */}
          <div
            className={`absolute inset-10 rounded-full border-2 border-dashed border-stone-300/60 transition-all duration-1000 ease-in-out ${
              isActive ? (phase === 'inhale' ? 'rotate-45 scale-105' : 'rotate-0 scale-95') : ''
            }`}
          />

          {/* 中央主体：点击即可数一息 */}
          <button
            onClick={countOneBreath}
            className={`relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b ${
              currentDetails.color
            } text-white shadow-xl flex flex-col items-center justify-center transition-all duration-700 transform active:scale-95 group focus:outline-none`}
          >
            {/* 阶段引导小标 */}
            <span className="text-xs font-serif-zen tracking-widest text-white/80 mb-1">
              {t(currentDetails.title)}
            </span>

            {/* 当前数息水墨大汉字 */}
            <div className="text-5xl sm:text-6xl font-serif-zen font-extrabold tracking-tight text-amber-100 group-hover:scale-105 transition-transform">
              {CHINESE_NUMS[breathCount]}
            </div>

            {/* 倒计时秒数或点击提示 */}
            <div className="mt-1 text-xs font-mono text-white/70">
              {currentPattern.id !== 'free' && isActive ? (
                <span>{phaseSecondsLeft}s</span>
              ) : (
                <span>{t('点击记一息')}</span>
              )}
            </div>

            {/* 底部提示小圆点 */}
            <div className="flex space-x-1 mt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i < breathCount ? 'bg-amber-300 shadow-xs' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </button>
        </div>

        {/* 阶段导引口诀 */}
        <p className="text-xs sm:text-sm font-serif-zen text-stone-600 mt-2">
          {t(currentDetails.tip)}
        </p>
      </div>

      {/* 核心操作按钮栏 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        {/* 启停按钮 */}
        <button
          onClick={togglePlay}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-900 text-stone-100 font-bold font-serif-zen shadow-md hover:bg-stone-800 active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>{t('暂停律动')}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>{t('随息起观')}</span>
            </>
          )}
        </button>

        {/* 关键正念功能：起妄念 · 归零重数 */}
        <button
          onClick={markDistraction}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-xs"
          title={t('当察觉自己胡思乱想走神时，如实承认，从一重数')}
        >
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{t('心起妄念 · 从头再数')}</span>
        </button>

        {/* 重置 */}
        <button
          onClick={resetAll}
          className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          title={t('重置所有')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 定力成就看板 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-900/10 text-center">
        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">{t('当前连贯')}</div>
          <div className="text-lg sm:text-xl font-mono font-bold text-amber-950">
            {streakCount} <span className="text-xs font-normal text-stone-500">{t('息')}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">{t('历史最高连贯')}</div>
          <div className="text-lg sm:text-xl font-mono font-bold text-emerald-800">
            {bestStreak} <span className="text-xs font-normal text-stone-500">{t('息')}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-500 mb-0.5">{t('觉察妄念次数')}</div>
          <div className="text-lg sm:text-xl font-mono font-bold text-rose-700">
            {distractionCount} <span className="text-xs font-normal text-stone-500">{t('次')}</span>
          </div>
        </div>
      </div>

      {/* 六妙门定力成就徽章 */}
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-[11px]">
        <span
          className={`px-2.5 py-1 rounded-full border transition-all ${
            bestStreak >= 10
              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
              : 'bg-stone-100 text-stone-400 border-stone-200'
          }`}
        >
          🏅 {t('初伏客尘 (10息)')}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full border transition-all ${
            bestStreak >= 30
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
              : 'bg-stone-100 text-stone-400 border-stone-200'
          }`}
        >
          🌟 {t('水清月现 (30息)')}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full border transition-all ${
            bestStreak >= 50
              ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
              : 'bg-stone-100 text-stone-400 border-stone-200'
          }`}
        >
          💎 {t('一念澄空 (50息)')}
        </span>
      </div>

      {/* 底部天台法义提示 */}
      <div className="mt-6 pt-3 border-t border-amber-900/10 text-center text-[11px] text-slate-400">
        {t('提示：电脑端可直接敲击【空格键】快速数息；妄念如浮云，见即消散，如实归零乃精进之始。')}
      </div>
    </div>
  );
};
