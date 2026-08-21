class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public sfxMuted: boolean = false;
  public musicMuted: boolean = false;
  public commentaryVoiceMuted: boolean = false;
  private musicInterval: number | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction or first sound call
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.45;
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.18;
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playBounce(velocity: number = 5) {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = Math.min(550, 160 + velocity * 22);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.08);

      const vol = Math.min(0.4, 0.08 + (velocity / 20) * 0.25);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  public playBumper() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  public playBoost() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  public playBuzzsaw() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(680, this.ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }

  public playFireWhoosh() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      // Noise + low frequency resonance for flame whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(280, this.ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.26);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (e) {}
  }

  public playVortexHole() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  public playLaser() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {}
  }

  public playWhoosh() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }

  public playLeaderChange() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      [587.33, 880].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.07 + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + i * 0.07);
        osc.stop(this.ctx!.currentTime + i * 0.07 + 0.18);
      });
    } catch (e) {}
  }

  public playCrowdCheer() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      [220, 277.18, 329.63, 440].forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f + Math.random() * 20 - 10, this.ctx!.currentTime);
        osc.frequency.linearRampToValueAtTime(f + 60, this.ctx!.currentTime + 0.6);

        gain.gain.setValueAtTime(0.12, this.ctx!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start();
        osc.stop(this.ctx!.currentTime + 0.85);
      });
    } catch (e) {}
  }

  public playFinishHorn() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  public playVictoryFanfare() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const chords = [
        { freqs: [261.63, 329.63, 392.0], time: 0, dur: 0.25 },
        { freqs: [293.66, 369.99, 440.0], time: 0.28, dur: 0.25 },
        { freqs: [329.63, 415.3, 493.88], time: 0.56, dur: 0.25 },
        { freqs: [523.25, 659.25, 783.99, 1046.5], time: 0.85, dur: 0.8 },
      ];

      chords.forEach(({ freqs, time, dur }) => {
        freqs.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, this.ctx!.currentTime + time);

          gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + time);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + time + dur);

          osc.connect(gain);
          gain.connect(this.sfxGain!);

          osc.start(this.ctx!.currentTime + time);
          osc.stop(this.ctx!.currentTime + time + dur + 0.05);
        });
      });
    } catch (e) {}
  }

  public playGrandChampionshipFanfare() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const melody = [
        { f: 523.25, t: 0.0, d: 0.2 },
        { f: 659.25, t: 0.2, d: 0.2 },
        { f: 783.99, t: 0.4, d: 0.2 },
        { f: 1046.5, t: 0.6, d: 0.4 },
        { f: 880.0, t: 1.0, d: 0.2 },
        { f: 1046.5, t: 1.2, d: 0.8 },
      ];

      melody.forEach(({ f, t, d }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

        gain.gain.setValueAtTime(0.35, this.ctx!.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + t);
        osc.stop(this.ctx!.currentTime + t + d + 0.05);
      });
    } catch (e) {}
  }

  public playLevelUp() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.22);
      });
    } catch (e) {}
  }

  public startBackgroundMusic() {
    if (this.musicMuted || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    let step = 0;

    const scale = [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63]; // C Pentatonic/Minor
    const arpeggio = [0, 2, 4, 7, 5, 4, 2, 0, 1, 3, 5, 8, 7, 5, 3, 1];

    this.musicInterval = window.setInterval(() => {
      if (this.musicMuted || !this.ctx || !this.musicGain) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const noteIndex = arpeggio[step % arpeggio.length];
        const freq = (scale[noteIndex % scale.length] || 130) * (step % 8 === 0 ? 1 : 2);

        osc.type = step % 4 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const vol = step % 4 === 0 ? 0.22 : 0.12;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);

        // Sub bass kick every 4 beats
        if (step % 4 === 0) {
          const bass = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          bass.type = 'triangle';
          bass.frequency.setValueAtTime(90, this.ctx.currentTime);
          bass.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.12);

          bassGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

          bass.connect(bassGain);
          bassGain.connect(this.musicGain);

          bass.start();
          bass.stop(this.ctx.currentTime + 0.15);
        }

        step++;
      } catch (e) {}
    }, 150);
  }

  public stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public toggleMuteSFX(): boolean {
    this.sfxMuted = !this.sfxMuted;
    return this.sfxMuted;
  }

  public toggleSfx(): boolean {
    return this.toggleMuteSFX();
  }

  public toggleMuteMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.musicMuted;
  }

  public toggleMusic(): boolean {
    return this.toggleMuteMusic();
  }

  public toggleMuteVoice(): boolean {
    this.commentaryVoiceMuted = !this.commentaryVoiceMuted;
    return this.commentaryVoiceMuted;
  }

  public toggleCommentaryVoice(): boolean {
    return this.toggleMuteVoice();
  }
}

export const sound = new SoundSynthesizer();
