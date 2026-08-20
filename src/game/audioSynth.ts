class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public sfxMuted: boolean = false;
  public musicMuted: boolean = false;
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

      const freq = Math.min(600, 180 + velocity * 25);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      const vol = Math.min(0.5, 0.08 + (velocity / 20) * 0.3);
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
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
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
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
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
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
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
      const notes = [
        { f: 523.25, d: 0.15, t: 0 },
        { f: 659.25, d: 0.15, t: 0.15 },
        { f: 783.99, d: 0.15, t: 0.3 },
        { f: 1046.5, d: 0.45, t: 0.45 },
        { f: 880.0, d: 0.2, t: 0.9 },
        { f: 1046.5, d: 0.6, t: 1.1 },
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, this.ctx!.currentTime + n.t);

        gain.gain.setValueAtTime(0.4, this.ctx!.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + n.t);
        osc.stop(this.ctx!.currentTime + n.t + n.d + 0.05);
      });

      // Cheering white noise burst
      this.playCrowdCheer();
    } catch (e) {}
  }

  private playCrowdCheer() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start();
    } catch (e) {}
  }

  public playLevelUp() {
    if (this.sfxMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const chords = [440, 554.37, 659.25, 880];
      chords.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.38);
      });
    } catch (e) {}
  }

  public toggleSfx(): boolean {
    this.sfxMuted = !this.sfxMuted;
    return this.sfxMuted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicMuted;
  }

  public startMusic() {
    if (this.musicMuted || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    const chords = [
      [261.63, 329.63, 392.0], // C
      [220.0, 261.63, 329.63],  // Am
      [174.61, 220.0, 261.63],  // F
      [196.0, 246.94, 293.66],  // G
    ];
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.musicMuted || !this.ctx || !this.musicGain) return;
      try {
        const chord = chords[step % chords.length];
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(this.musicGain!);

          osc.start();
          osc.stop(this.ctx!.currentTime + 1.25);
        });

        // Bass beat
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(chord[0] / 2, this.ctx.currentTime);
        bassGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start();
        bassOsc.stop(this.ctx.currentTime + 0.55);

        step++;
      } catch (e) {}
    }, 1200);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundSynthesizer();
