'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Maximize2, Minimize2, Sparkles, BookOpen } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const MeditationTimer: React.FC = () => {
  const { t } = useLang();

  const [presetMinutes, setPresetMinutes] = useState<number>(15);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<'body' | 'breath' | 'mind'>('body');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 切换预设时长
  const selectPreset = (mins: number) => {
    setIsRunning(false);
    setPresetMinutes(mins);
    setTimeLeft(mins * 60);
  };

  // 倒计时逻辑
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            zenAudio.playSingingBowl(0.9); // 出定引磬清越三声
            setTimeout(() => zenAudio.playSingingBowl(0.7), 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(presetMinutes * 60);
    }
    if (!isRunning) {
      zenAudio.playSingingBowl(0.85); // 入定起板引磬
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(presetMinutes * 60);
  };

  // 格式化时间
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (presetMinutes * 60 || 1);

  return (
    <div
      className={`transition-all duration-500 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto'
          : 'max-w-xl mx-auto bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm text-slate-900'
      }`}
    >
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-700 font-bold">
            {t('调身 · 调息 · 调心')}
          </div>
          <h3 className={`text-xl font-bold font-serif-zen ${isFullScreen ? 'text-amber-100' : 'text-slate-900'}`}>
            {t('坐禅数息 · 入定室')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              isFullScreen
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50'
            }`}
            title={isFullScreen ? t('退出全屏') : t('全屏沉浸坐禅')}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 预设时长选择 */}
      {!isFullScreen && (
        <div className="flex items-center justify-center gap-2 my-4">
          {[5, 15, 30, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => selectPreset(m)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                presetMinutes === m
                  ? 'bg-amber-900 text-amber-100 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-50'
              }`}
            >
              {m} {t('分钟')}
            </button>
          ))}
        </div>
      )}

      {/* 计时器圆环主体 */}
      <div className="relative my-8 flex items-center justify-center">
        <svg className="w-56 h-56 sm:w-64 sm:h-64" viewBox="0 0 200 200">
          {/* 背景轨 */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={isFullScreen ? '#334155' : '#E2E8F0'}
            strokeWidth="6"
          />
          {/* 进度弧线 */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#B45309"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 85}
            strokeDashoffset={2 * Math.PI * 85 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* 居中倒计时读数 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-1">
            {isRunning ? t('安住当下 · 息妄显真') : timeLeft === 0 ? t('坐禅圆满 · 引磬开静') : t('整肃身心 · 准备入定')}
          </div>
        </div>
      </div>

      {/* 控制操作按钮 */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          className="px-8 py-3 rounded-2xl bg-amber-900 hover:bg-amber-950 text-amber-100 font-bold text-sm shadow-md hover:shadow-lg flex items-center space-x-2 transition-all transform active:scale-95"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? t('暂停') : timeLeft === 0 ? t('重新开始') : t('开始坐禅')}</span>
        </button>

        <button
          onClick={resetTimer}
          className={`p-3 rounded-2xl border text-xs font-semibold transition-colors ${
            isFullScreen
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-50'
          }`}
          title={t('重置')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 坐禅三要要领切换指南 */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
        isFullScreen ? 'bg-slate-800/70 border-slate-700 text-slate-300' : 'bg-amber-50/70 border-amber-200/60 text-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold font-serif-zen text-amber-800 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('《修心诀》坐禅三要')}</span>
          </span>
          <div className="flex space-x-1">
            {(['body', 'breath', 'mind'] as const).map((step) => (
              <button
                key={step}
                onClick={() => setGuidedStep(step)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  guidedStep === step ? 'bg-amber-900 text-amber-100' : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                {step === 'body' ? t('调身') : step === 'breath' ? t('调息') : t('调心')}
              </button>
            ))}
          </div>
        </div>

        {guidedStep === 'body' && (
          <p>{t('【调身】：端身正坐，双盘或单盘，脊柱自然竖直，含胸拔背，双手结定印置于丹田，舌抵上腭，双目微垂垂视鼻端。')}</p>
        )}
        {guidedStep === 'breath' && (
          <p>{t('【调息】：鼻吸鼻呼，气沉丹田，呼吸勿粗、勿喘、勿急，令出入息绵绵若存，数息观照从一至十，不起妄杂。')}</p>
        )}
        {guidedStep === 'mind' && (
          <p>{t('【调心】：莫思善，莫思恶，一念不生，前后际断。若妄念忽起，只管觉照，念起即觉，觉之即无，莫随莫制。')}</p>
        )}
      </div>
    </div>
  );
};
