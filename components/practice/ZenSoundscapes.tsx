'use client';

import React, { useState } from 'react';
import { CloudRain, Waves, Wind, Bell, Flame, Sparkles, Volume2, VolumeX, Sun, Feather, Radio } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

interface SoundTrack {
  id: 'rain' | 'stream' | 'wind' | 'bell' | 'fire' | 'insects' | 'tide' | 'windchime';
  label: string;
  desc: string;
  icon: any;
  defaultVolume: number;
}

const SOUND_TRACKS: SoundTrack[] = [
  { id: 'rain', label: '古刹夜雨', desc: '檐下滴沥 · 涤荡尘虑', icon: CloudRain, defaultVolume: 0.35 },
  { id: 'stream', label: '幽谷清泉', desc: '石隙流鸣 · 活泼灵动', icon: Waves, defaultVolume: 0.3 },
  { id: 'wind', label: '深山松涛', desc: '松风拂面 · 廓然开朗', icon: Wind, defaultVolume: 0.25 },
  { id: 'bell', label: '晚钟余韵', desc: '暮鼓晨钟 · 108Hz深沉共鸣', icon: Bell, defaultVolume: 0.4 },
  { id: 'fire', label: '禅寺薪火', desc: '红炉温夜 · 柴火微暖爆裂', icon: Flame, defaultVolume: 0.28 },
  { id: 'insects', label: '夏夜流萤', desc: '幽径清风 · 秋蝉草木微鸣', icon: Sparkles, defaultVolume: 0.2 },
  { id: 'tide', label: '大江潮音', desc: '海潮涨落 · 观音耳根圆通', icon: Waves, defaultVolume: 0.32 },
  { id: 'windchime', label: '云端风铃', desc: '檐角铜铃 · 随风清越破空', icon: Radio, defaultVolume: 0.22 },
];

export const ZenSoundscapes: React.FC = () => {
  const { t } = useLang();
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0.35,
    stream: 0.3,
    wind: 0.25,
    bell: 0.4,
    fire: 0.28,
    insects: 0.2,
    tide: 0.32,
    windchime: 0.22,
  });

  const toggleSound = (id: SoundTrack['id']) => {
    const next = !activeStates[id];
    setActiveStates((prev) => ({ ...prev, [id]: next }));
    zenAudio.setSoundscape(id, next, volumes[id]);
  };

  const handleVolumeChange = (id: SoundTrack['id'], v: number) => {
    setVolumes((prev) => ({ ...prev, [id]: v }));
    if (activeStates[id]) {
      zenAudio.setSoundscape(id, true, v);
    }
  };

  const stopAll = () => {
    SOUND_TRACKS.forEach((track) => {
      zenAudio.setSoundscape(track.id, false);
    });
    setActiveStates({});
  };

  const hasAnyActive = Object.values(activeStates).some(Boolean);

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-stone-900 via-[#131E33] to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-2xl select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{t('纯数学算法实时合成 · 零网络延迟')}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif-zen text-amber-100 mt-2">
            {t('古刹天籁 · 八大白噪音混音器')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {t('支持多音轨自由叠加混音。点击卡片开启音效，拖动滑块调节独立音量，可在后台持续伴随坐禅、抄经或研读经典。')}
          </p>
        </div>

        {hasAnyActive && (
          <button
            onClick={stopAll}
            className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
          >
            <VolumeX className="w-4 h-4" />
            <span>{t('一键静音全部')}</span>
          </button>
        )}
      </div>

      {/* 8 大音轨网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SOUND_TRACKS.map((track) => {
          const Icon = track.icon;
          const isActive = activeStates[track.id] || false;
          const vol = volumes[track.id] ?? track.defaultVolume;

          return (
            <div
              key={track.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => toggleSound(track.id)}
                className="cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 scale-110'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isActive ? t('播放中') : t('已停止')}
                  </span>
                </div>

                <h4 className="text-base font-bold font-serif-zen text-white">
                  {t(track.label)}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {t(track.desc)}
                </p>
              </div>

              {/* 独立音量滑块 */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.02"
                  value={vol}
                  onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                  disabled={!isActive}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-30"
                />
                <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
                  {Math.round((vol / 0.8) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
