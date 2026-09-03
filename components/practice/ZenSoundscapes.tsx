'use client';

import React, { useState } from 'react';
import {
  CloudRain,
  Waves,
  Wind,
  Bell,
  Flame,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Trees,
  Bird,
  CloudLightning,
  Coffee,
  Music,
  Moon,
  Compass,
} from 'lucide-react';
import { zenAudio, SoundscapeType } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

interface SoundTrack {
  id: SoundscapeType;
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
  { id: 'bamboo', label: '紫竹摇风', desc: '翠竹摇曳 · 竹叶摩挲清音', icon: Trees, defaultVolume: 0.28 },
  { id: 'birds', label: '空山晨鸟', desc: '古刹黎明 · 幽林百鸟轻啼', icon: Bird, defaultVolume: 0.26 },
  { id: 'thunder', label: '云谷远雷', desc: '远山轰鸣 · 庇护安详深沉', icon: CloudLightning, defaultVolume: 0.35 },
  { id: 'tea', label: '松风煮茗', desc: '石鼎烹泉 · 沸水初腾细沫', icon: Coffee, defaultVolume: 0.3 },
  { id: 'temple_chant', label: '梵呗低吟', desc: '远殿悠扬 · 低徊长音摄受', icon: Music, defaultVolume: 0.35 },
  { id: 'deep_night', label: '空山静夜', desc: '万籁俱寂 · 近乎无声的深邃', icon: Moon, defaultVolume: 0.2 },
];

interface MasterPreset {
  name: string;
  desc: string;
  tracks: Partial<Record<SoundscapeType, number>>;
}

const MASTER_PRESETS: MasterPreset[] = [
  {
    name: '寒山独宿',
    desc: '夜雨、晚钟与炉火微爆交织，宛若姑苏城外枫桥夜泊。',
    tracks: { rain: 0.4, bell: 0.35, fire: 0.28 },
  },
  {
    name: '竹林悟道',
    desc: '紫竹林风声、晨鸟鸣转与溪水潺潺，一念廓然省悟。',
    tracks: { bamboo: 0.38, birds: 0.32, stream: 0.3 },
  },
  {
    name: '松风煮雪',
    desc: '石鼎茶沸细沫与檐外微雨、薪火交融，偷得浮生半日闲。',
    tracks: { tea: 0.45, rain: 0.25, fire: 0.25 },
  },
  {
    name: '海印三昧',
    desc: '大江潮涌、远山闷雷与深殿梵音，融化个体烦恼入无尽虚空。',
    tracks: { tide: 0.4, temple_chant: 0.35, thunder: 0.3 },
  },
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
    bamboo: 0.28,
    birds: 0.26,
    thunder: 0.35,
    tea: 0.3,
    temple_chant: 0.35,
    deep_night: 0.2,
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

  const applyPreset = (preset: MasterPreset) => {
    // 先停止所有当前声音
    SOUND_TRACKS.forEach((track) => {
      zenAudio.setSoundscape(track.id, false);
    });

    const newActives: Record<string, boolean> = {};
    const newVolumes = { ...volumes };

    Object.entries(preset.tracks).forEach(([trackId, vol]) => {
      if (vol) {
        newActives[trackId] = true;
        newVolumes[trackId] = vol;
        zenAudio.setSoundscape(trackId as SoundscapeType, true, vol);
      }
    });

    setActiveStates(newActives);
    setVolumes(newVolumes);
  };

  const stopAll = () => {
    SOUND_TRACKS.forEach((track) => {
      zenAudio.setSoundscape(track.id, false);
    });
    setActiveStates({});
  };

  const hasAnyActive = Object.values(activeStates).some(Boolean);

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-b from-stone-900 via-[#131E33] to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-2xl select-none relative overflow-hidden">
      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{t('纯数学算法实时物理合成 · 十四大高保真天籁')}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif-zen text-amber-100 mt-2">
            {t('古刹天籁 · 十四大白噪音多轨混音器')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {t('支持多音轨自由叠加混音。点击卡片开启音效，拖动滑块微调独立音量，可在后台持续伴随坐禅、抄经、读书或深度编程。')}
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

      {/* 大师预设情境一键混音栏 */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 mb-3">
          <Compass className="w-4 h-4" />
          <span>{t('大师预设禅境 · 一键沉浸混音')}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MASTER_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-amber-500/20 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="font-bold text-xs text-amber-100 group-hover:text-amber-300 flex items-center justify-between">
                <span>{t(p.name)}</span>
                <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('进入 →')}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                {t(p.desc)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 14 大音轨网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {SOUND_TRACKS.map((track) => {
          const Icon = track.icon;
          const isActive = activeStates[track.id] || false;
          const vol = volumes[track.id] ?? track.defaultVolume;

          return (
            <div
              key={track.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-lg scale-[1.01]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              {/* 卡片顶部：图标与开关 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100 font-serif-zen">
                      {t(track.label)}
                    </div>
                    <div className="text-[10px] text-slate-400">{t(track.desc)}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleSound(track.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  aria-label={isActive ? '关闭' : '开启'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 音量滑块 */}
              <div className="space-y-1 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{t('音量')}</span>
                  <span>{Math.round(vol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={vol}
                  onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                  disabled={!isActive}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-opacity ${
                    isActive ? 'bg-amber-500/40 accent-amber-400' : 'bg-slate-800 opacity-40 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* 开启状态律动微光背景 */}
              {isActive && (
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
