'use client';

import React, { useState } from 'react';
import { CloudRain, Waves, Wind, Bell, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

interface SoundItem {
  id: 'rain' | 'stream' | 'wind';
  label: string;
  icon: any;
  desc: string;
}

export const ZenSoundscapes: React.FC = () => {
  const { t } = useLang();
  const [activeSounds, setActiveSounds] = useState<Record<string, boolean>>({
    rain: false,
    stream: false,
    wind: false,
  });
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0.3,
    stream: 0.3,
    wind: 0.3,
  });

  const sounds: SoundItem[] = [
    { id: 'rain', label: '古刹夜雨', icon: CloudRain, desc: '屋檐滴水 · 雨打芭蕉' },
    { id: 'stream', label: '幽谷清泉', icon: Waves, desc: '清泉石上 · 溪流潺潺' },
    { id: 'wind', label: '深山松涛', icon: Wind, desc: '微风拂松 · 旷远空阔' },
  ];

  const toggleSound = (id: 'rain' | 'stream' | 'wind') => {
    const next = !activeSounds[id];
    setActiveSounds((prev) => ({ ...prev, [id]: next }));
    zenAudio.setSoundscape(id, next, volumes[id]);
  };

  const handleVolumeChange = (id: 'rain' | 'stream' | 'wind', val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    if (activeSounds[id]) {
      zenAudio.setSoundscape(id, true, val);
    }
  };

  const stopAll = () => {
    sounds.forEach((s) => {
      zenAudio.setSoundscape(s.id, false);
    });
    setActiveSounds({ rain: false, stream: false, wind: false });
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-stone-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm select-none">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('自然天籁 · 纯净白噪音')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('古刹禅境氛围音轨')}
          </h3>
        </div>

        <button
          onClick={stopAll}
          className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors"
        >
          {t('全部静音')}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        {t('基于 Web Audio 数学算法实时合成，可与木鱼、佛珠、坐禅计时器同时在后台播放，营造古刹幽静声场。')}
      </p>

      {/* 音轨列表 */}
      <div className="space-y-3.5">
        {sounds.map((s) => {
          const Icon = s.icon;
          const isPlaying = activeSounds[s.id];
          return (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPlaying
                  ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleSound(s.id)}
                  className="flex items-center space-x-3 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isPlaying ? 'bg-amber-900 text-amber-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-serif-zen text-slate-900">
                      {t(s.label)}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t(s.desc)}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => toggleSound(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isPlaying
                      ? 'bg-amber-900 text-amber-100 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isPlaying ? t('播放中') : t('开启')}
                </button>
              </div>

              {/* 音量滑块 */}
              {isPlaying && (
                <div className="mt-3 pt-3 border-t border-amber-900/10 flex items-center space-x-3">
                  <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={volumes[s.id]}
                    onChange={(e) => handleVolumeChange(s.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-900"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
