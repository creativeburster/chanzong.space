'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellOff,
  Sparkles,
  Volume2,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Heart,
  Flame,
} from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { zenAudio, SingingBowlType } from '@/lib/audio';

type BellSound = 'yinqing' | 'temple_bell' | 'bowl_root' | 'bowl_crystal';

interface BellSoundOption {
  id: BellSound;
  name: string;
  desc: string;
}

const BELL_SOUNDS: BellSoundOption[] = [
  { id: 'yinqing', name: '古铜金引磬', desc: '清脆高越，直透顶门，顿破昏沉' },
  { id: 'temple_bell', name: '深山古刹晚钟', desc: '沉雄震荡，拍频悠长，如临寒山寺' },
  { id: 'bowl_root', name: '黑曜陨铁大钵', desc: '超低频宇宙OM音，深层放松身体' },
  { id: 'bowl_crystal', name: '极光白水晶钵', desc: '空灵纯净极高频，唤醒清明觉知' },
];

const INTERVAL_OPTIONS = [
  { minutes: 15, label: '15分钟' },
  { minutes: 30, label: '30分钟' },
  { minutes: 45, label: '45分钟' },
  { minutes: 60, label: '60分钟' },
];

// 正念提撕偈颂
const MINDFULNESS_VERSES = [
  '听此钟声，烦恼轻，智慧长，菩提生。离地狱，出火坑，愿成佛，度众生。',
  '息心即是息妄，妄心若息，真心现前。放下双肩，感受当下这一呼一吸。',
  '身在何处，心在何处。觉知双足立地，觉察脊柱如松，当下即是归处。',
  '不迎不拒，如如不动。看着眼前的杂念如流水落花，自来还自去。',
  '诸法从本来，常自寂灭相。深深吸一口气，感谢这具勤劳的身体。',
];

export const ZenMindfulnessBell: React.FC = () => {
  const { t } = useLang();

  // 状态
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
  const [selectedSound, setSelectedSound] = useState<BellSound>('yinqing');
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(30 * 60);

  // 正念微暂停弹窗
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [currentVerse, setCurrentVerse] = useState<string>(MINDFULNESS_VERSES[0]);
  const [pauseTimer, setPauseTimer] = useState<number>(30);
  const [isPausing, setIsPausing] = useState<boolean>(false);

  // 今日统计
  const [todayAwakeCount, setTodayAwakeCount] = useState<number>(0);

  // 初始化今日记录
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('zen_bell_date');
      if (savedDate === today) {
        setTodayAwakeCount(parseInt(localStorage.getItem('zen_bell_count') || '0', 10));
      } else {
        localStorage.setItem('zen_bell_date', today);
        localStorage.setItem('zen_bell_count', '0');
      }
    } catch {
      // ignore
    }
  }, []);

  // 播放选中的钟声
  const playSound = (sound: BellSound) => {
    if (sound === 'yinqing') {
      zenAudio.playYinQing(0.85);
    } else if (sound === 'temple_bell') {
      zenAudio.playTempleBell(0.9);
    } else if (sound === 'bowl_root') {
      zenAudio.playBowlStrike('root_iron', 0.95);
    } else if (sound === 'bowl_crystal') {
      zenAudio.playBowlStrike('crown_crystal', 0.85);
    }
  };

  // 手动测试鸣钟
  const strikeBellNow = () => {
    playSound(selectedSound);
    triggerPrompt();
  };

  // 触发正念提撕
  const triggerPrompt = () => {
    const v = MINDFULNESS_VERSES[Math.floor(Math.random() * MINDFULNESS_VERSES.length)];
    setCurrentVerse(v);
    setShowPrompt(true);
    setIsPausing(true);
    setPauseTimer(30);

    const newCount = todayAwakeCount + 1;
    setTodayAwakeCount(newCount);
    try {
      localStorage.setItem('zen_bell_count', String(newCount));
    } catch {
      // ignore
    }
  };

  // 倒计时后台主循环
  useEffect(() => {
    if (!isEnabled) {
      setSecondsUntilNext(intervalMinutes * 60);
      return;
    }

    const timer = setInterval(() => {
      setSecondsUntilNext((prev) => {
        if (prev <= 1) {
          playSound(selectedSound);
          triggerPrompt();
          return intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnabled, intervalMinutes, selectedSound]);

  // 30秒正念微暂停倒数
  useEffect(() => {
    if (!isPausing || pauseTimer <= 0) return;
    const timer = setInterval(() => {
      setPauseTimer((prev) => {
        if (prev <= 1) {
          setIsPausing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPausing, pauseTimer]);

  // 格式化下次鸣钟倒数 mm:ss
  const minsLeft = Math.floor(secondsUntilNext / 60);
  const secsLeft = secondsUntilNext % 60;
  const formattedCountdown = `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-b from-[#FAF9F6] via-white to-amber-50/40 rounded-3xl border border-amber-900/15 shadow-sm p-6 sm:p-8 transition-all select-none relative">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>{t('梅村正念法门 · 觉醒钟声')}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif-zen text-slate-900">
            {t('正念觉醒钟')}
          </h3>
        </div>

        {/* 启闭开关 */}
        <button
          onClick={() => {
            const next = !isEnabled;
            setIsEnabled(next);
            if (next) playSound(selectedSound);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold font-serif-zen flex items-center space-x-2 transition-all shadow-xs ${
            isEnabled
              ? 'bg-amber-900 text-amber-100 ring-2 ring-amber-600'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {isEnabled ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
          <span>{isEnabled ? t('觉醒钟已开启') : t('开启觉醒钟')}</span>
        </button>
      </div>

      <p className="text-xs text-slate-600 mb-6 leading-relaxed">
        {t('源自一行禅师梅村修行传统：在电脑前工作或阅读时，每隔一段时间钟声会自动响起，提醒你放下万缘，放松肩颈咬肌，做三次深呼吸，回到当下这一具活生生的身体。')}
      </p>

      {/* 状态与下次鸣钟卡片 */}
      <div className="p-5 bg-stone-900 text-amber-50 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-800/60 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-400 mb-0.5">{t('距离下次提撕鸣钟')}</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-100">
              {isEnabled ? formattedCountdown : t('未启动')}
            </div>
          </div>
        </div>

        <button
          onClick={strikeBellNow}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-100 text-xs font-bold font-serif-zen shadow-sm active:scale-95 transition-all flex items-center justify-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('立即叩响觉醒钟')}</span>
        </button>
      </div>

      {/* 设定区：间隔与音色 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* 间隔时长选择 */}
        <div className="p-4 bg-white rounded-2xl border border-amber-900/10">
          <label className="text-xs font-bold text-slate-700 mb-2 block font-serif-zen">
            {t('提撕间隔时间')}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => {
                  setIntervalMinutes(opt.minutes);
                  setSecondsUntilNext(opt.minutes * 60);
                }}
                className={`py-1.5 text-xs rounded-xl font-bold transition-all ${
                  intervalMinutes === opt.minutes
                    ? 'bg-amber-800 text-amber-50 shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 钟声音色选择 */}
        <div className="p-4 bg-white rounded-2xl border border-amber-900/10">
          <label className="text-xs font-bold text-slate-700 mb-2 block font-serif-zen">
            {t('觉醒钟声音色')}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {BELL_SOUNDS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  setSelectedSound(snd.id);
                  playSound(snd.id);
                }}
                className={`px-2.5 py-1.5 text-xs rounded-xl font-bold transition-all text-left flex items-center justify-between ${
                  selectedSound === snd.id
                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span className="truncate">{snd.name}</span>
                <Volume2 className="w-3 h-3 opacity-60 ml-1 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 正念提撕弹窗 / 微暂停体验 */}
      {showPrompt && (
        <div className="p-6 bg-gradient-to-r from-stone-900 via-[#1C1917] to-amber-950 text-stone-200 rounded-2xl shadow-xl border border-amber-500/30 mb-6 text-center animate-fade-in relative">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span>{t('身心觉知 · 正念微暂停')}</span>
          </div>

          <p className="text-base sm:text-lg font-serif-zen font-bold text-amber-100 max-w-xl mx-auto mb-4 leading-relaxed">
            “{currentVerse}”
          </p>

          <div className="flex items-center justify-center space-x-4">
            <div className="text-xs text-stone-400">
              {pauseTimer > 0 ? (
                <span>
                  {t('静坐深呼吸剩余')}：
                  <strong className="font-mono text-amber-300 text-sm ml-1">{pauseTimer}s</strong>
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">{t('身心已清凉，继续精进')}</span>
              )}
            </div>

            <button
              onClick={() => setShowPrompt(false)}
              className="px-3.5 py-1 rounded-xl bg-stone-700 hover:bg-stone-600 text-xs text-stone-200 transition-colors"
            >
              {t('已知晓关闭')}
            </button>
          </div>
        </div>
      )}

      {/* 底部统计 */}
      <div className="pt-4 border-t border-amber-900/10 flex items-center justify-between text-xs text-slate-500">
        <div>
          <span>{t('今日觉醒唤醒')}：</span>
          <strong className="text-amber-900 font-mono text-sm">{todayAwakeCount}</strong> {t('次')}
        </div>
        <div className="text-[11px] text-stone-400">
          {t('建议在长时间看屏工作时常驻开启')}
        </div>
      </div>
    </div>
  );
};
