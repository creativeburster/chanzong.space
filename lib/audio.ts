// 禅宗知识库 · 纯原生 Web Audio 全功能声音合成引擎
// 零外部资源依赖，秒开无延迟，支持离线 PWA，包含木鱼、念珠、五大脉轮颂钵、引磬与十四大自然天籁白噪音

export type SingingBowlType = 'root_iron' | 'sacral_bronze' | 'heart_copper' | 'throat_ceramic' | 'crown_crystal';

export interface SingingBowlMeta {
  id: SingingBowlType;
  name: string;
  chakra: string;
  freq: number;
  duration: number;
  desc: string;
  color: string;
  harmonics: { ratio: number; gain: number; detune?: number }[];
}

export const SINGING_BOWL_PRESETS: Record<SingingBowlType, SingingBowlMeta> = {
  root_iron: {
    id: 'root_iron',
    name: '黑曜陨铁大钵',
    chakra: '海底轮 · 接地定心',
    freq: 136.1, // 宇宙原音 OM
    duration: 11.0,
    desc: '沉稳厚重，深达 11 秒超低拍频震颤，释放下半身紧绷，入座前接地定心。',
    color: '#78350F',
    harmonics: [
      { ratio: 1.0, gain: 0.8 },
      { ratio: 1.004, gain: 0.75, detune: 0.5 }, // 0.5Hz 微妙拍频
      { ratio: 2.76, gain: 0.38 },
      { ratio: 4.82, gain: 0.18 },
      { ratio: 7.15, gain: 0.08 },
    ],
  },
  sacral_bronze: {
    id: 'sacral_bronze',
    name: '暖阳古铜老钵',
    chakra: '腹轮/脐轮 · 生机安和',
    freq: 216.0, // 432Hz 次谐波
    duration: 8.5,
    desc: '喜马拉雅手打老铜钵，温润金黄余音，舒缓神经紧绷，温养腹部气机。',
    color: '#D97706',
    harmonics: [
      { ratio: 1.0, gain: 0.75 },
      { ratio: 2.0, gain: 0.5 },
      { ratio: 3.01, gain: 0.28 },
      { ratio: 4.95, gain: 0.12 },
    ],
  },
  heart_copper: {
    id: 'heart_copper',
    name: '翡翠青铜慈心钵',
    chakra: '心轮 · 慈悲舒缓',
    freq: 341.3, // 慈心和弦
    duration: 7.5,
    desc: '带古代青铜微锈的清越钵，泛音如水波涟漪，化解心口郁结，生起柔和慈悲。',
    color: '#059669',
    harmonics: [
      { ratio: 1.0, gain: 0.8 },
      { ratio: 1.002, gain: 0.6 },
      { ratio: 2.72, gain: 0.35 },
      { ratio: 4.65, gain: 0.12 },
    ],
  },
  throat_ceramic: {
    id: 'throat_ceramic',
    name: '净水青瓷音钵',
    chakra: '喉轮 · 清凉空灵',
    freq: 528.0, // 奇迹修复频
    duration: 6.5,
    desc: '瓷铜复合材质，如山涧甘泉滴落玉盘，开启纯净觉知与内心澄澈。',
    color: '#0284C7',
    harmonics: [
      { ratio: 1.0, gain: 0.85 },
      { ratio: 2.0, gain: 0.38 },
      { ratio: 3.45, gain: 0.16 },
      { ratio: 5.12, gain: 0.06 },
    ],
  },
  crown_crystal: {
    id: 'crown_crystal',
    name: '极光白水晶钵',
    chakra: '顶轮 · 澄澈觉照',
    freq: 852.0, // 高纯度觉照频
    duration: 9.0,
    desc: '高纯度石英水晶烧制，超长正弦纯音，穿透杂念，令自性灵台寂照现前。',
    color: '#7C3AED',
    harmonics: [
      { ratio: 1.0, gain: 0.9 },
      { ratio: 1.001, gain: 0.7 },
      { ratio: 2.0, gain: 0.22 },
      { ratio: 3.0, gain: 0.08 },
    ],
  },
};

export type SoundscapeType =
  | 'rain'
  | 'stream'
  | 'wind'
  | 'bell'
  | 'fire'
  | 'insects'
  | 'tide'
  | 'windchime'
  | 'bamboo'
  | 'birds'
  | 'thunder'
  | 'tea'
  | 'temple_chant'
  | 'deep_night';

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private continuousSingNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
  private soundscapeNodes: Record<string, { source: AudioNode; gain: GainNode; interval?: any } | null> = {};

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 1. 播放清脆空灵的木鱼敲击声
   */
  playWoodenFish(volume: number = 0.85) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(860, now);
      osc2.frequency.exponentialRampToValueAtTime(260, now + 0.05);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.Q.setValueAtTime(3.5, now);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      const bufferSize = Math.floor(ctx.sampleRate * 0.015);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      osc1.connect(filter);
      osc2.connect(filter);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      noise.start(now);

      osc1.stop(now + 0.18);
      osc2.stop(now + 0.18);
      noise.stop(now + 0.02);
    } catch {
      // ignore
    }
  }

  /**
   * 2. 播放温润佛珠捻动碰撞轻音
   */
  playBeadClick(volume: number = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.035);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * 3. 敲击指定脉轮颂钵（Strike Mode）
   */
  playBowlStrike(type: SingingBowlType = 'sacral_bronze', volume: number = 0.85) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const preset = SINGING_BOWL_PRESETS[type] || SINGING_BOWL_PRESETS.sacral_bronze;
      const now = ctx.currentTime;
      const duration = preset.duration;

      preset.harmonics.forEach(({ ratio, gain: g, detune }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const targetFreq = preset.freq * ratio;
        osc.frequency.setValueAtTime(targetFreq + (detune || 0), now);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * g, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // ignore
    }
  }

  /**
   * 4. 顺时针持续绕钵磨钵（Singing Mode / 环绕共振音浴）
   */
  startBowlSing(type: SingingBowlType = 'sacral_bronze', volume: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopBowlSing(); // 先停止已有的磨钵音

    try {
      const preset = SINGING_BOWL_PRESETS[type] || SINGING_BOWL_PRESETS.sacral_bronze;
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(volume, now + 0.8);
      masterGain.connect(ctx.destination);

      const oscs: OscillatorNode[] = [];

      preset.harmonics.slice(0, 3).forEach(({ ratio, gain: g, detune }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(preset.freq * ratio + (detune || 0), now);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(g, now);

        osc.connect(subGain);
        subGain.connect(masterGain);
        osc.start(now);
        oscs.push(osc);
      });

      this.continuousSingNodes = { oscs, gain: masterGain };
    } catch {
      // ignore
    }
  }

  /**
   * 停止磨钵持续共鸣
   */
  stopBowlSing() {
    if (!this.continuousSingNodes || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.continuousSingNodes.gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      const { oscs } = this.continuousSingNodes;
      setTimeout(() => {
        oscs.forEach((osc) => {
          try { osc.stop(); } catch {}
        });
      }, 900);
      this.continuousSingNodes = null;
    } catch {
      // ignore
    }
  }

  /**
   * 向后兼容老接口
   */
  playSingingBowl(volume: number = 0.7) {
    this.playBowlStrike('crown_crystal', volume);
  }

  playSingingBowlDeep(volume: number = 0.85) {
    this.playBowlStrike('root_iron', volume);
  }

  /**
   * 5. 播放古琴/墨落轻音 (用于抄经)
   */
  playQinPluck(volume: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // ignore
    }
  }

  /**
   * 6. 自然与禅房天籁 14 大白噪音实时数学合成
   */
  setSoundscape(
    type: SoundscapeType,
    active: boolean,
    volume: number = 0.3
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const existing = this.soundscapeNodes[type];
      if (!active) {
        if (existing) {
          if (existing.interval) clearInterval(existing.interval);
          existing.gain.gain.setValueAtTime(existing.gain.gain.value, ctx.currentTime);
          existing.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            try { (existing.source as any).stop?.(); } catch {}
          }, 600);
          this.soundscapeNodes[type] = null;
        }
        return;
      }

      if (existing) {
        existing.gain.gain.setValueAtTime(volume, ctx.currentTime);
        return;
      }

      // 生成 6 秒高保真粉红/白噪声循环缓冲
      const bufferSize = ctx.sampleRate * 6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      let birdInterval: any = null;

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
      } else if (type === 'stream') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.Q.setValueAtTime(1.4, ctx.currentTime);
      } else if (type === 'wind') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, ctx.currentTime);
      } else if (type === 'bell') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(108, ctx.currentTime);
        filter.Q.setValueAtTime(8.0, ctx.currentTime);
      } else if (type === 'fire') {
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else if (type === 'insects') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4500, ctx.currentTime);
        filter.Q.setValueAtTime(6.0, ctx.currentTime);
      } else if (type === 'tide') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);
      } else if (type === 'windchime') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2600, ctx.currentTime);
        filter.Q.setValueAtTime(9.0, ctx.currentTime);
      } else if (type === 'bamboo') {
        // 紫竹摇风：带通 650Hz，微风穿林
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);
        filter.Q.setValueAtTime(2.2, ctx.currentTime);
      } else if (type === 'birds') {
        // 空山晨鸟：高频环境基底 + 定期清脆轻鸣
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, ctx.currentTime);
        filter.Q.setValueAtTime(4.0, ctx.currentTime);

        birdInterval = setInterval(() => {
          if (!this.ctx) return;
          try {
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            bOsc.type = 'sine';
            const baseFreq = 2600 + Math.random() * 1200;
            bOsc.frequency.setValueAtTime(baseFreq, t);
            bOsc.frequency.exponentialRampToValueAtTime(baseFreq + 400, t + 0.05);
            bOsc.frequency.exponentialRampToValueAtTime(baseFreq - 300, t + 0.12);

            bGain.gain.setValueAtTime(volume * 0.45, t);
            bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            bOsc.connect(bGain);
            bGain.connect(this.ctx.destination);
            bOsc.start(t);
            bOsc.stop(t + 0.15);
          } catch {}
        }, 3500 + Math.random() * 2000);
      } else if (type === 'thunder') {
        // 云谷远雷：极低频 65Hz，厚重深沉
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(75, ctx.currentTime);
      } else if (type === 'tea') {
        // 松风煮茗：细密气泡沸水声，带通 820Hz
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);
      } else if (type === 'temple_chant') {
        // 梵呗低吟：深沉共鸣和声
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(136.1, ctx.currentTime);
        filter.Q.setValueAtTime(5.5, ctx.currentTime);
      } else { // deep_night 空山静夜
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.soundscapeNodes[type] = { source: noise, gain, interval: birdInterval };
    } catch {
      // ignore
    }
  }

  /**
   * 7. 播放沙沙耙沙声 (枯山水)
   */
  playSandRake(volume: number = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  /**
   * 8. 播放万缘放下化烬消散音
   */
  playWhooshFire(volume: number = 0.4) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.2;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // ignore
    }
  }

  /**
   * 9. 播放高泛音古法金铜引磬声 (明彻通顶，起香开静专用)
   */
  playYinQing(volume: number = 0.75) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 4.2;
      const harmonics = [
        { freq: 2048, gain: 0.8 },
        { freq: 4096, gain: 0.35 },
        { freq: 6144, gain: 0.15 },
        { freq: 8192, gain: 0.05 },
      ];

      harmonics.forEach(({ freq, gain: g }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 4, now);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * g, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00005, now + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // ignore
    }
  }

  /**
   * 10. 播放深山古刹晚钟 / 晨钟暮鼓百八钟声 (沉雄震荡，拍频悠长)
   */
  playTempleBell(volume: number = 0.85) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 7.5;
      const harmonics = [
        { freq: 108, gain: 0.8 },
        { freq: 109.5, gain: 0.7 },
        { freq: 216, gain: 0.5 },
        { freq: 324, gain: 0.3 },
        { freq: 432, gain: 0.2 },
        { freq: 648, gain: 0.1 },
      ];

      harmonics.forEach(({ freq, gain: g }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * g, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // ignore
    }
  }
}

export const zenAudio = new ZenAudioEngine();
