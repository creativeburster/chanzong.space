'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, Maximize2, Minimize2, Sparkles, BookOpen, Volume2, VolumeX, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';
import ZenQuoteCardModal from '@/components/ZenQuoteCardModal';

export const MeditationTimer: React.FC = () => {
  const { t } = useLang();

  // 预设香别
  const presets = [
    { mins: 15, label: '歇心晨修', desc: '15分钟 · 调摄身心' },
    { mins: 25, label: '丛林正香', desc: '25分钟 · 番茄入定' },
    { mins: 45, label: '深入大坐', desc: '45分钟 · 息心绝虑' },
    { mins: 60, label: '一炷大香', desc: '60分钟 · 彻见本性' },
  ];

  const [presetMinutes, setPresetMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [guidedStep, setGuidedStep] = useState<'body' | 'breath' | 'mind'>('body');
  const [enableAwakeningChime, setEnableAwakeningChime] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [cardModalOpen, setCardModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef<number>(0);

  // 切换预设时长
  const selectPreset = (mins: number) => {
    setIsRunning(false);
    setIsCompleted(false);
    setPresetMinutes(mins);
    setTimeLeft(mins * 60);
    elapsedRef.current = 0;
  };

  // 倒计时逻辑
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;

        // 每5分钟木鱼轻点一声防昏沉
        if (enableAwakeningChime && elapsedRef.current > 0 && elapsedRef.current % 300 === 0) {
          zenAudio.playWoodenFish(0.65);
        }

        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            // 坐禅圆满：古刹沉雄大钟 7.5 秒余震
            zenAudio.playTempleBell(0.9);
            setTimeout(() => zenAudio.playYinQing(0.7), 2500);

            // 记录坐禅分钟数到本地修持印谱
            try {
              const currentMins = parseInt(localStorage.getItem('zen_meditation_minutes') || '0', 10);
              localStorage.setItem('zen_meditation_minutes', String(currentMins + presetMinutes));
            } catch {}

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
  }, [isRunning, presetMinutes, enableAwakeningChime]);

  const toggleTimer = () => {
    if (!isRunning && (timeLeft === 0 || isCompleted)) {
      setTimeLeft(presetMinutes * 60);
      setIsCompleted(false);
      elapsedRef.current = 0;
    }
    if (!isRunning) {
      // 起板入定：清越引磬连叩三通
      zenAudio.playYinQing(0.85);
      setTimeout(() => zenAudio.playYinQing(0.65), 1200);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(presetMinutes * 60);
    elapsedRef.current = 0;
  };

  // 格式化时间
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (presetMinutes * 60 || 1);

  return (
    <div
      className={`transition-all duration-500 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-[#0A0F1D] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto'
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
          {/* 提撕木鱼开关 */}
          <button
            onClick={() => setEnableAwakeningChime(!enableAwakeningChime)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 ${
              enableAwakeningChime
                ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                : isFullScreen
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
            title={enableAwakeningChime ? t('每5分钟轻叩木鱼提撕神志已开启') : t('木鱼提撕已静音')}
          >
            {enableAwakeningChime ? <Volume2 className="w-4 h-4 text-amber-800" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">{enableAwakeningChime ? t('5分提撕') : t('静音')}</span>
          </button>

          {/* 全屏沉浸切换 */}
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

      {/* 丛林香别预设选择 */}
      {!isFullScreen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
          {presets.map((p) => (
            <button
              key={p.mins}
              onClick={() => selectPreset(p.mins)}
              disabled={isRunning}
              className={`p-2.5 rounded-2xl text-center border transition-all ${
                presetMinutes === p.mins
                  ? 'bg-amber-900 text-amber-100 border-amber-950 shadow-xs'
                  : 'bg-white hover:bg-amber-50/60 text-slate-700 border-amber-200/60 disabled:opacity-50'
              }`}
            >
              <div className="text-xs font-bold font-serif-zen">{t(p.label)}</div>
              <div className={`text-[10px] mt-0.5 ${presetMinutes === p.mins ? 'text-amber-200' : 'text-slate-500'}`}>
                {p.mins} {t('分钟')}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 计时器圆环主体 */}
      <div className="relative my-8 flex items-center justify-center">
        {/* 呼吸微光光晕效果（入定时自然律动） */}
        {isRunning && (
          <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-amber-500/10 animate-pulse pointer-events-none" />
        )}

        <svg className="w-60 h-60 sm:w-68 sm:h-68" viewBox="0 0 220 220">
          {/* 背景轨 */}
          <circle
            cx="110"
            cy="110"
            r="95"
            fill="none"
            stroke={isFullScreen ? '#1E293B' : '#E2E8F0'}
            strokeWidth="8"
          />
          {/* 进度弧线 */}
          <circle
            cx="110"
            cy="110"
            r="95"
            fill="none"
            stroke="#B45309"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 95}
            strokeDashoffset={2 * Math.PI * 95 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* 居中倒计时读数 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <div className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight ${isFullScreen ? 'text-amber-50' : 'text-slate-900'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
            {isRunning ? t('安住当下 · 息妄显真') : isCompleted ? t('坐禅圆满 · 古刹钟鸣') : t('整肃身心 · 准备入定')}
          </div>
        </div>
      </div>

      {/* 坐禅圆满提示卡 */}
      {isCompleted && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('善哉！本次坐禅已圆满功德')}</span>
          </div>
          <p className="text-xs text-amber-800/80 mt-1">
            {t('狂心顿歇，歇即菩提。功德已自动录入本地印谱。')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setCardModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-semibold shadow-xs transition flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('制作坐禅心印海报')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 控制操作按钮 */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          className="px-8 py-3 rounded-2xl bg-amber-900 hover:bg-amber-950 text-amber-100 font-bold text-sm shadow-md hover:shadow-lg flex items-center space-x-2 transition-all transform active:scale-95"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? t('暂停') : isCompleted ? t('再坐一炷香') : t('起板入定')}</span>
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

      {/* 坐禅心印海报弹窗 */}
      <ZenQuoteCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        quote={`坐禅入定 ${presetMinutes} 分钟 · 狂心顿歇 · 歇即菩提`}
        interpretation="莫思善，莫思恶，正与么时，哪个是明上座本来面目？自性清净，心体虚明，任运寂照，万虑俱消。"
        sourceTitle="达摩祖师论集 · 禅林坐禅仪"
        author="禅门默照实修"
      />
    </div>
  );
};
