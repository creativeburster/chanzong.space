'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Waves, Volume2, Disc, Play, Square, Bell, Clock, RefreshCw } from 'lucide-react';
import { zenAudio, SingingBowlType, SINGING_BOWL_PRESETS } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const SingingBowl: React.FC = () => {
  const { t } = useLang();
  const [currentType, setCurrentType] = useState<SingingBowlType>('sacral_bronze');
  const [playMode, setPlayMode] = useState<'strike' | 'sing'>('strike');
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [isSinging, setIsSinging] = useState<boolean>(false);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [mindfulnessInterval, setMindfulnessInterval] = useState<number>(0); // 0 为关闭，1/3/5 为分钟数
  const timerRef = useRef<any>(null);

  const preset = SINGING_BOWL_PRESETS[currentType];

  // 敲击处理
  const handleStrike = () => {
    zenAudio.playBowlStrike(currentType, 0.85);
    setIsStriking(true);
    setStrikeCount((v) => v + 1);
    setTimeout(() => setIsStriking(false), 250);
  };

  // 磨钵开关切换
  const toggleSinging = () => {
    if (isSinging) {
      zenAudio.stopBowlSing();
      setIsSinging(false);
    } else {
      zenAudio.startBowlSing(currentType, 0.5);
      setIsSinging(true);
      setStrikeCount((v) => v + 1);
    }
  };

  // 切换颂钵类型时若正在磨钵，自动切换音调
  const handleSelectBowl = (type: SingingBowlType) => {
    setCurrentType(type);
    if (isSinging) {
      zenAudio.startBowlSing(type, 0.5);
    }
  };

  // 组件卸载时关闭磨钵与定时器
  useEffect(() => {
    return () => {
      zenAudio.stopBowlSing();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 正念觉察间歇钟
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mindfulnessInterval > 0) {
      const ms = mindfulnessInterval * 60 * 1000;
      timerRef.current = setInterval(() => {
        zenAudio.playBowlStrike(currentType, 0.7);
        setIsStriking(true);
        setTimeout(() => setIsStriking(false), 250);
      }, ms);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mindfulnessInterval, currentType]);

  // 动态渐变配色
  const getBowlGradient = () => {
    switch (currentType) {
      case 'root_iron':
        return {
          gradId: 'ironGrad',
          outerStart: '#4B5563',
          outerMid: '#1F2937',
          outerEnd: '#111827',
          inner: '#0B0F17',
          rim: '#9CA3AF',
        };
      case 'sacral_bronze':
        return {
          gradId: 'bronzeGrad',
          outerStart: '#F59E0B',
          outerMid: '#B45309',
          outerEnd: '#451A03',
          inner: '#291107',
          rim: '#FDE68A',
        };
      case 'heart_copper':
        return {
          gradId: 'copperGrad',
          outerStart: '#10B981',
          outerMid: '#047857',
          outerEnd: '#064E3B',
          inner: '#022C22',
          rim: '#A7F3D0',
        };
      case 'throat_ceramic':
        return {
          gradId: 'ceramicGrad',
          outerStart: '#38BDF8',
          outerMid: '#0284C7',
          outerEnd: '#0C4A6E',
          inner: '#082F49',
          rim: '#BAE6FD',
        };
      case 'crown_crystal':
        return {
          gradId: 'crystalGrad',
          outerStart: '#C084FC',
          outerMid: '#9333EA',
          outerEnd: '#581C87',
          inner: '#3B0764',
          rim: '#F3E8FF',
        };
    }
  };

  const bgConfig = getBowlGradient();

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('五行脉轮声频音疗 · Web Audio')}</span>
          </div>
          <h3 className="text-2xl font-bold font-serif-zen text-amber-100 mt-1">
            {t(preset.name)}
          </h3>
          <div className="text-xs text-slate-400 mt-0.5">
            {t(preset.chakra)} · <span className="font-mono text-amber-300 font-bold">{preset.freq}Hz</span>
          </div>
        </div>

        {/* 模式选择：敲击 / 持续磨钵 */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs">
          <button
            onClick={() => {
              if (isSinging) zenAudio.stopBowlSing();
              setIsSinging(false);
              setPlayMode('strike');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              playMode === 'strike'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('手槌敲击')}
          </button>
          <button
            onClick={() => setPlayMode('sing')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              playMode === 'sing'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('绕钵磨钵')}
          </button>
        </div>
      </div>

      {/* 5 大脉轮颂钵选择切换栏 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {(Object.keys(SINGING_BOWL_PRESETS) as SingingBowlType[]).map((key) => {
          const item = SINGING_BOWL_PRESETS[key];
          const isSelected = currentType === key;
          return (
            <button
              key={key}
              onClick={() => handleSelectBowl(key)}
              className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-slate-200 truncate">{t(item.name.slice(0, 4))}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{t(item.chakra.split('·')[0].trim())}</div>
              <div className="text-[10px] font-mono text-amber-300/80 mt-0.5">{item.freq}Hz</div>
            </button>
          );
        })}
      </div>

      {/* 颂钵描述 */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-6">
        {t(preset.desc)}
      </div>

      {/* 颂钵视觉主体 */}
      <div className="relative flex items-center justify-center my-4 py-8">
        {/* 扩散共鸣水波纹环 */}
        <div
          className={`absolute w-56 h-56 rounded-full border border-amber-400/30 transition-all duration-1000 ${
            isStriking || isSinging ? 'scale-150 opacity-0' : 'scale-100 opacity-30 animate-ping'
          }`}
        />
        <div
          className={`absolute w-72 h-72 rounded-full border border-amber-300/20 transition-all duration-1000 delay-150 ${
            isStriking || isSinging ? 'scale-175 opacity-0' : 'scale-100 opacity-20 animate-pulse'
          }`}
        />

        {/* 磨钵时环绕旋转流光 */}
        {isSinging && (
          <div className="absolute w-64 h-64 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '4s' }} />
        )}

        {/* 颂钵 SVG 拟物 */}
        <button
          onClick={playMode === 'strike' ? handleStrike : toggleSinging}
          className={`relative p-4 rounded-full outline-none transition-all duration-200 active:scale-95 ${
            isStriking ? 'scale-95' : 'hover:scale-105'
          }`}
        >
          <svg className="w-52 h-52 sm:w-60 sm:h-60 drop-shadow-2xl" viewBox="0 0 200 200">
            <defs>
              <linearGradient id={bgConfig.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={bgConfig.outerStart} />
                <stop offset="40%" stopColor={bgConfig.outerMid} />
                <stop offset="100%" stopColor={bgConfig.outerEnd} />
              </linearGradient>
            </defs>

            {/* 颂钵底座暗影 */}
            <ellipse cx="100" cy="165" rx="60" ry="14" fill="#000000" opacity="0.7" />

            {/* 颂钵外弧身 */}
            <path
              d="M28 75 C28 148, 58 168, 100 168 C142 168, 172 148, 172 75 C172 70, 160 65, 100 65 C40 65, 28 70, 28 75 Z"
              fill={`url(#${bgConfig.gradId})`}
              stroke={bgConfig.rim}
              strokeWidth="1.8"
            />

            {/* 颂钵钵口内圈 */}
            <ellipse cx="100" cy="72" rx="72" ry="23" fill={bgConfig.inner} stroke={bgConfig.rim} strokeWidth="2.5" />
            
            {/* 钵内底心 */}
            <ellipse cx="100" cy="75" rx="42" ry="13" fill="#05070D" opacity="0.85" />
            <circle cx="100" cy="75" r="5.5" fill={bgConfig.rim} opacity="0.6" />

            {/* 钵口边缘手打锤纹光感 */}
            <path d="M42 80 Q100 96, 158 80" stroke={bgConfig.rim} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" fill="none" />
          </svg>

          {/* 磨钵中央播放图标提示 */}
          {playMode === 'sing' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg">
                {isSinging ? <Square className="w-5 h-5 fill-amber-300" /> : <Play className="w-5 h-5 fill-amber-300 ml-0.5" />}
              </div>
            </div>
          )}
        </button>
      </div>

      {/* 底部功能条：正念觉知间歇钟与敲击统计 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Waves className="w-4 h-4 text-amber-400" />
          <span>{t('已共振')}: <strong className="text-amber-300 font-mono text-sm">{strikeCount}</strong> {t('次')}</span>
        </div>

        {/* 觉知间歇钟选择 */}
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('定时觉知钟')}:</span>
          {[0, 1, 3, 5].map((m) => (
            <button
              key={m}
              onClick={() => setMindfulnessInterval(m)}
              className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-all ${
                mindfulnessInterval === m
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 0 ? t('关') : `${m}m`}
            </button>
          ))}
        </div>

        {/* 触发大按钮 */}
        {playMode === 'strike' ? (
          <button
            onClick={handleStrike}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t('敲击起音')}</span>
          </button>
        ) : (
          <button
            onClick={toggleSinging}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5 shrink-0 ${
              isSinging
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isSinging ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isSinging ? t('停止音浴') : t('开启持续音浴')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
