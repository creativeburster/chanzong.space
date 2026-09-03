'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  Sparkles,
  Award,
  Sliders,
  Share2,
  Check,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { zenAudio, SoundscapeType } from '@/lib/audio';

// 禅门四大经典坐香时长预设
interface TimerPreset {
  id: string;
  name: string;
  minutes: number;
  desc: string;
  badge: string;
}

const PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    name: '正受一炷香',
    minutes: 25,
    desc: '标准番茄工序，收摄散乱，精进不怠',
    badge: '25 min',
  },
  {
    id: 'deep_study',
    name: '参研深思香',
    minutes: 45,
    desc: '深研典籍与极深专注，入于一境',
    badge: '45 min',
  },
  {
    id: 'samadhi',
    name: '大寂定香',
    minutes: 60,
    desc: '万缘彻底放下，身心若虚空',
    badge: '60 min',
  },
  {
    id: 'micro_wake',
    name: '片刻觉照',
    minutes: 10,
    desc: '工间小憩，回光返照，清明头脑',
    badge: '10 min',
  },
];

// 伴随白噪音选项
const FOCUS_SOUNDSCAPES: { id: SoundscapeType | 'none'; name: string }[] = [
  { id: 'none', name: '静默无声' },
  { id: 'rain', name: '夜雨打蕉' },
  { id: 'wind', name: '松涛入壑' },
  { id: 'bamboo', name: '紫竹摇风' },
  { id: 'stream', name: '空谷流泉' },
  { id: 'deep_night', name: '空山静夜' },
  { id: 'tea', name: '松风煮茗' },
];

// 禅门印可法语
const ZEN_BLESSINGS = [
  { quote: '狂心顿歇，歇即菩提。', source: '《楞严经》' },
  { quote: '心若止水，何愁万物之波澜；神如晴空，岂惧浮云之蔽日。', source: '禅门语录' },
  { quote: '若能转物，即同如来。', source: '《楞严经》' },
  { quote: '一念不生，万法自如。', source: '《六祖坛经》' },
  { quote: '春有百花秋有月，夏有凉风冬有雪。若无闲事挂心头，便是人间好时节。', source: '无门慧开' },
  { quote: '行到水穷处，坐看云起时。', source: '王维 · 摩诘居士' },
  { quote: '千江有水千江月，万里无云万里天。', source: '《嘉泰普灯录》' },
];

export const ZenFocusTimer: React.FC = () => {
  const { t } = useLang();

  // 时长与状态
  const [selectedPreset, setSelectedPreset] = useState<string>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 音效与白噪音
  const [soundscape, setSoundscape] = useState<SoundscapeType | 'none'>('rain');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 统计数据
  const [todayCompletedCount, setTodayCompletedCount] = useState<number>(0);
  const [todayMinutes, setTodayMinutes] = useState<number>(0);
  const [completedBlessing, setCompletedBlessing] = useState<typeof ZEN_BLESSINGS[0]>(ZEN_BLESSINGS[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化统计
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('zen_focus_date');
      if (savedDate === today) {
        setTodayCompletedCount(parseInt(localStorage.getItem('zen_focus_count') || '0', 10));
        setTodayMinutes(parseInt(localStorage.getItem('zen_focus_mins') || '0', 10));
      } else {
        localStorage.setItem('zen_focus_date', today);
        localStorage.setItem('zen_focus_count', '0');
        localStorage.setItem('zen_focus_mins', '0');
      }
    } catch {
      // ignore
    }
  }, []);

  // 切换预设
  const selectPreset = (preset: TimerPreset) => {
    if (isRunning) return;
    setSelectedPreset(preset.id);
    const sec = preset.minutes * 60;
    setTotalSeconds(sec);
    setSecondsLeft(sec);
    setIsCompleted(false);
  };

  // 倒计时主循环
  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  // 白噪音伴音生命周期控制
  useEffect(() => {
    if (!isRunning || !soundEnabled || soundscape === 'none') {
      // 停止所有可能启动的白噪音
      FOCUS_SOUNDSCAPES.forEach((s) => {
        if (s.id !== 'none') {
          zenAudio.setSoundscape(s.id, false);
        }
      });
      return;
    }

    // 开启选中的白噪音
    FOCUS_SOUNDSCAPES.forEach((s) => {
      if (s.id !== 'none') {
        zenAudio.setSoundscape(s.id, s.id === soundscape, 0.22);
      }
    });

    return () => {
      FOCUS_SOUNDSCAPES.forEach((s) => {
        if (s.id !== 'none') {
          zenAudio.setSoundscape(s.id, false);
        }
      });
    };
  }, [isRunning, soundEnabled, soundscape]);

  // 开始/暂停
  const toggleStart = () => {
    if (isCompleted) {
      // 重新开始
      resetTimer();
      return;
    }

    if (!isRunning) {
      // 起香开静仪轨：引磬清脆响一声
      zenAudio.playYinQing(0.85);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  // 重置
  const resetTimer = () => {
    setIsRunning(false);
    setIsCompleted(false);
    const p = PRESETS.find((item) => item.id === selectedPreset);
    const sec = p ? p.minutes * 60 : totalSeconds;
    setSecondsLeft(sec);
  };

  // 专注完成
  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);

    // 出定仪轨：黑曜大钵连续低回震荡
    zenAudio.playBowlStrike('root_iron', 0.95);
    setTimeout(() => {
      zenAudio.playBowlStrike('root_iron', 0.7);
    }, 2800);

    // 随机法句
    const randomBlessing = ZEN_BLESSINGS[Math.floor(Math.random() * ZEN_BLESSINGS.length)];
    setCompletedBlessing(randomBlessing);

    // 记录统计
    const minsGained = Math.round(totalSeconds / 60);
    const newCount = todayCompletedCount + 1;
    const newMins = todayMinutes + minsGained;
    setTodayCompletedCount(newCount);
    setTodayMinutes(newMins);

    try {
      localStorage.setItem('zen_focus_count', String(newCount));
      localStorage.setItem('zen_focus_mins', String(newMins));
    } catch {
      // ignore
    }
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

  // 计算百分比
  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const burnedPercent = 100 - progressPercent;

  // 格式化时间 mm:ss
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // 复制今日定力法语
  const copyBlessing = () => {
    const text = `【禅修工坊 · 专注印可】\n今日专注 ${todayMinutes} 分钟，已燃香 ${todayCompletedCount} 炷。\n『${completedBlessing.quote}』—— ${completedBlessing.source}\n—— 禅宗知识库 chanzong.space`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-b from-[#FAF9F6] via-white to-amber-50/30 rounded-3xl border border-amber-900/15 shadow-sm p-6 sm:p-8 transition-all select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col justify-center bg-[#1A1815] text-stone-200 p-8 sm:p-16' : ''
      }`}
    >
      {/* 顶部标题与控制 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{t('一炷香 · 深度专注')}</span>
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold font-serif-zen ${isFullscreen ? 'text-amber-100' : 'text-slate-900'}`}>
            {t('禅门深度番茄钟')}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* 白噪音静音切换 */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs transition-colors ${
              soundEnabled
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            }`}
            title={soundEnabled ? t('静音伴音') : t('开启伴音')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 全屏切换 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors"
            title={isFullscreen ? t('退出全屏') : t('沉浸全屏')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 预设标签 */}
      {!isFullscreen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {PRESETS.map((preset) => {
            const isSel = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                disabled={isRunning}
                onClick={() => selectPreset(preset)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSel
                    ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-sm scale-[1.02]'
                    : 'bg-white hover:bg-amber-50/60 text-slate-700 border-amber-900/10 disabled:opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-serif-zen">{t(preset.name)}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSel ? 'bg-amber-800 text-amber-200' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {preset.badge}
                  </span>
                </div>
                <p className={`text-[11px] leading-tight line-clamp-1 ${isSel ? 'text-amber-200/80' : 'text-slate-500'}`}>
                  {t(preset.desc)}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* 核心专注视觉区：燃烧线香 + 倒计时 */}
      <div className="relative flex flex-col items-center justify-center my-6 sm:my-10">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* 圆环进度底座 */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* 背景轨道 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
              stroke={isFullscreen ? '#292524' : '#F3F0EA'}
              strokeWidth="3.5"
            />
            {/* 动态燃烧进度 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="transparent"
              stroke={isRunning ? '#B45309' : '#78350F'}
              strokeWidth="3.5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* 中央立体古法心香视觉 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* 燃烧之香 */}
            <div className="relative w-2 h-28 sm:h-32 flex flex-col items-center mb-3">
              {/* 袅袅青烟 */}
              {isRunning && (
                <div className="absolute -top-7 flex items-center justify-center">
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-t from-stone-400/40 via-stone-300/20 to-transparent blur-[1px] animate-pulse" />
                </div>
              )}

              {/* 燃烧点（火星） */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full z-10 transition-all duration-1000 ease-linear"
                style={{
                  top: `${burnedPercent}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  className={`w-full h-full rounded-full ${
                    isRunning ? 'bg-amber-500 shadow-[0_0_12px_#F59E0B] animate-ping' : 'bg-stone-400'
                  }`}
                />
                <div className="absolute inset-0 w-full h-full rounded-full bg-orange-600" />
              </div>

              {/* 已燃烧香灰（上段半透明灰白） */}
              <div
                className="w-1.5 bg-stone-300/40 rounded-t-full transition-all duration-1000 ease-linear"
                style={{ height: `${burnedPercent}%` }}
              />

              {/* 尚未燃烧的心香（下段古褐檀木色） */}
              <div
                className="w-1.5 bg-gradient-to-b from-[#78350F] to-[#451A03] rounded-b-full shadow-inner transition-all duration-1000 ease-linear"
                style={{ height: `${progressPercent}%` }}
              />

              {/* 香座铜盘底托 */}
              <div className="w-6 h-1.5 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-900 rounded-full shadow-xs mt-0.5" />
            </div>

            {/* 大号倒计时数字 */}
            <div
              className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                isFullscreen ? 'text-amber-100' : 'text-slate-900'
              }`}
            >
              {formattedTime}
            </div>

            {/* 当前状态状态提示 */}
            <div className="text-xs font-serif-zen mt-1.5 text-stone-500 flex items-center gap-1.5">
              <span>
                {isCompleted
                  ? t('功德圆满 · 出定开静')
                  : isRunning
                  ? t('心香一炷 · 息虑入静')
                  : t('静候起香')}
              </span>
            </div>
          </div>
        </div>

        {/* 伴随白噪音快捷选择 */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-4 flex-wrap justify-center max-w-md">
          {FOCUS_SOUNDSCAPES.map((snd) => {
            const isSel = soundscape === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => setSoundscape(snd.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSel
                    ? 'bg-amber-800 text-amber-100 shadow-xs scale-105'
                    : isFullscreen
                    ? 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t(snd.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 控制按钮组 */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={toggleStart}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 font-bold font-serif-zen shadow-md hover:shadow-lg hover:from-amber-700 hover:to-amber-800 active:scale-95 transition-all flex items-center space-x-2 text-base"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>{t('暂停参修')}</span>
            </>
          ) : isCompleted ? (
            <>
              <RotateCcw className="w-5 h-5" />
              <span>{t('重开一炷香')}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>{t('鸣磬起香')}</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          disabled={!isRunning && secondsLeft === totalSeconds}
          className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-all disabled:opacity-40"
          title={t('重置香炉')}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 完成弹层 / 今日印可 */}
      {isCompleted && (
        <div className="mt-6 p-5 sm:p-6 bg-gradient-to-r from-amber-900/90 to-stone-900 text-amber-50 rounded-2xl shadow-xl border border-amber-500/30 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-32 h-32" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('一念清净 · 定力印可')}</span>
          </div>

          <p className="text-lg sm:text-xl font-serif-zen font-bold text-amber-100 mb-1">
            “{completedBlessing.quote}”
          </p>
          <p className="text-xs text-amber-300/70 mb-4">—— {completedBlessing.source}</p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={copyBlessing}
              className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-xs font-bold text-amber-100 flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t('已复制专注令') : t('复制定力印可')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 底部统计栏 */}
      {!isFullscreen && (
        <div className="mt-8 pt-4 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <div>
              <span>{t('今日燃香')}：</span>
              <strong className="text-amber-900 font-mono text-sm">{todayCompletedCount}</strong> {t('炷')}
            </div>
            <div>
              <span>{t('专注时长')}：</span>
              <strong className="text-amber-900 font-mono text-sm">{todayMinutes}</strong> {t('分钟')}
            </div>
          </div>

          <div className="text-[11px] text-stone-400">
            {t('出定时大钵唤醒 · 纯离线运算')}
          </div>
        </div>
      )}
    </div>
  );
};
