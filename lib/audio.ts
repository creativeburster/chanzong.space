// 禅宗知识库 · 纯原生 Web Audio 全功能声音合成引擎
// 零外部资源依赖，秒开无延迟，支持离线 PWA，包含木鱼、念珠、颂钵、引磬与自然天籁白噪音

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private bowlHumOsc: OscillatorNode | null = null;
  private bowlHumGain: GainNode | null = null;
  private soundscapeNodes: Record<string, { source: AudioNode; gain: GainNode } | null> = {
    rain: null,
    stream: null,
    wind: null,
  };

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

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

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
      // 较高且短促的温润实木碰撞音 (780Hz -> 420Hz)
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
   * 3. 播放清越悠远的金属引磬声
   */
  playSingingBowl(volume: number = 0.7) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 3.5;
      const freqs = [880, 1760, 2640];
      const gains = [0.6, 0.25, 0.15];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume * gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {
      // ignore
    }
  }

  /**
   * 4. 播放深沉疗愈的藏式大颂钵重击声 (432Hz 基础和弦)
   */
  playSingingBowlDeep(volume: number = 0.8) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 6.0; // 6秒绵长泛音
      const harmonics = [
        { freq: 216, gain: 0.7 },
        { freq: 432, gain: 0.5 },
        { freq: 648, gain: 0.3 },
        { freq: 864, gain: 0.15 },
        { freq: 1296, gain: 0.08 },
      ];

      harmonics.forEach(({ freq, gain: g }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 2, now);

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
   * 5. 播放古琴/墨落轻音 (用于抄经)
   */
  playQinPluck(volume: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // 宫商角徵羽五声音阶
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
   * 6. 自然天籁白噪音程序化合成 (雨声、溪流、松涛)
   */
  setSoundscape(type: 'rain' | 'stream' | 'wind', active: boolean, volume: number = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const existing = this.soundscapeNodes[type];
      if (!active) {
        if (existing) {
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

      // 生成 5 秒粉红/白噪声循环缓冲
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Paul Kellet's Pink Noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
      } else if (type === 'stream') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.Q.setValueAtTime(1.5, ctx.currentTime);
      } else { // wind
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.soundscapeNodes[type] = { source: noise, gain };
    } catch {
      // ignore
    }
  }
}

export const zenAudio = new ZenAudioEngine();
