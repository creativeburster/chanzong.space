// 禅宗知识库 · 纯原生 Web Audio 音频合成引擎（零外部网络依赖，秒开无延迟，支持离线 PWA）

class ZenAudioEngine {
  private ctx: AudioContext | null = null;

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
   * 播放清脆空灵的木鱼敲击声
   * 采用双振荡器调制 + 带通共鸣滤波 + 快速指数衰减
   */
  playWoodenFish(volume: number = 0.8) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 主振荡器 (模拟实木本体敲击基础音 520Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      // 次振荡器 (模拟木质腔体共振泛音 860Hz)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(860, now);
      osc2.frequency.exponentialRampToValueAtTime(260, now + 0.05);

      // 带通滤波器模拟木头空腔
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.Q.setValueAtTime(3.5, now);

      // 增益衰减包络
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      // 噪声源产生短促清脆的“嗒”敲击触感
      const bufferSize = Math.floor(ctx.sampleRate * 0.015); // 15ms 噪声
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

      // 连接节点
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 触发
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
   * 播放清越悠远的金属引磬/古刹梵钟声
   * 用于坐禅开静与出定
   */
  playSingingBowl(volume: number = 0.7) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 3.5; // 3.5秒清长余音

      // 三组金属泛音频率 (模拟铜制引磬)
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
}

export const zenAudio = new ZenAudioEngine();
