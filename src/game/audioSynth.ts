// Procedural Web Audio API Sound Synthesizer for ASMR Marble Racing
// Zero external files, 100% lightweight and reliable across all browsers.

class AudioSynth {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;

  public sfxVolume = 0.75;
  public musicVolume = 0.45;
  public isMuted = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = this.isMuted ? 0 : this.sfxVolume;
      this.sfxGainNode.connect(this.ctx.destination);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = this.isMuted ? 0 : this.musicVolume;
      this.musicGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number, muted: boolean) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    this.isMuted = muted;

    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setTargetAtTime(muted ? 0 : sfx, this.ctx.currentTime, 0.05);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(muted ? 0 : music, this.ctx.currentTime, 0.05);
    }
  }

  // 1. Marble Collisions (Clack, Clink, Wood, Metal, Rubber)
  public playCollision(intensity = 0.5, material: 'wood' | 'metal' | 'glass' | 'rubber' = 'wood') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = Math.min(1.0, Math.max(0.08, intensity * 0.45));

    if (material === 'metal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
      gain.gain.setValueAtTime(vol * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (material === 'rubber') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.18);
      gain.gain.setValueAtTime(vol * 1.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    } else if (material === 'glass') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + Math.random() * 600, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.08);
      gain.gain.setValueAtTime(vol * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    } else {
      // Wood / Marble clack
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.07);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 2. Bouncy Pad Spring Launch
  public playBouncyPad() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.16);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 3. Giant Hammer Smash
  public playHammerSmash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // Low sub thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.36);

    // High metal anvil ding
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, t);
    osc2.frequency.exponentialRampToValueAtTime(300, t + 0.2);
    gain2.gain.setValueAtTime(0.3, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc2.connect(gain2);
    gain2.connect(this.sfxGainNode);
    osc2.start(t);
    osc2.stop(t + 0.26);
  }

  // 4. Speed Booster Whoosh
  public playSpeedBoost() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.22);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 5. Countdown Beeps
  public playCountdownBeep(isGo = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isGo) {
      // High energetic whistle / fanfare chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1174, t + 0.08); // D6
      gain.gain.setValueAtTime(0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.52);
    } else {
      // 3.. 2.. 1.. standard pitch beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
  }

  // 6. Elimination Pop / Splash
  public playElimination() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  // 7. Finish Line Checkered Flag Horn & Crowd Cheering
  public playFinishChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // Trumpet chord
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.65);
    });
  }

  // 8. Winner Victory Fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.4 },  // C6
    ];

    let offset = 0;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, t + offset);
      gain.gain.setValueAtTime(0.2, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t + offset);
      osc.stop(t + offset + note.d + 0.05);

      offset += note.d * 0.9;
    });
  }

  // 9. Procedural Upbeat Background Racing Music Loop
  public startBGM() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;
    let step = 0;
    const bpm = 124;
    const stepTime = (60 / bpm) / 4; // 16th note

    const bassScale = [130.81, 146.83, 164.81, 174.61, 196.0, 220.0]; // C3 minor pentatonic
    const arpScale = [523.25, 659.25, 783.99, 987.77, 1046.5];       // C5 pentatonic

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGainNode || this.isMuted) return;

      const t = this.ctx.currentTime;

      // 1. Kick on beat 1, 5, 9, 13 (every 4 16ths)
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 0.14);
      }

      // 2. Hi-hat on every off-beat 16th
      if (step % 2 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(4500 + Math.random() * 2000, t);
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 0.04);
      }

      // 3. Funky Bassline on select 16ths
      if ([0, 3, 6, 8, 11, 14].includes(step % 16)) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const noteIdx = Math.floor((step % 16) / 2) % bassScale.length;
        osc.frequency.setValueAtTime(bassScale[noteIdx], t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 0.18);
      }

      // 4. Arpeggiated chime
      if (step % 3 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const arpNote = arpScale[(step * 2) % arpScale.length];
        osc.frequency.setValueAtTime(arpNote, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 0.12);
      }

      step++;
    }, stepTime * 1000);
  }

  public stopBGM() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new AudioSynth();
