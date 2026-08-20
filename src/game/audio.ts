/**
 * Audio Engine for OPERATION: SHADOW STRIKE
 * Procedural Web Audio API sound generator and dynamic music synthesizer.
 * No external audio files needed; 100% reliable, zero latency, highly atmospheric.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;

  private isMuted: boolean = false;
  private sfxVolume: number = 0.85;
  private musicVolume: number = 0.65;
  private voiceVolume: number = 0.9;

  // Music state
  private musicPlaying: boolean = false;
  private musicIntensity: 'STEALTH' | 'COMBAT' | 'BOSS' | 'AERIAL' | 'VICTORY' = 'STEALTH';
  private musicInterval: number | null = null;
  private currentStep: number = 0;
  private bpm: number = 132;

  constructor() {
    // Lazy init on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.setValueAtTime(this.voiceVolume, this.ctx.currentTime);
      this.voiceGain.connect(this.masterGain);
    } catch {
      // Audio not supported or blocked
    }
  }

  public resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number, voice: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.voiceVolume = Math.max(0, Math.min(1, voice));

    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
      if (this.musicGain) this.musicGain.gain.setValueAtTime(this.musicVolume, now);
      if (this.voiceGain) this.voiceGain.gain.setValueAtTime(this.voiceVolume, now);
    }
  }

  // --- SOUND EFFECTS ---

  // Gunshots
  public playGunshot(type: 'RIFLE' | 'SMG' | 'SHOTGUN' | 'SNIPER' | 'PLASMA' | 'ROCKET' | 'MINIGUN') {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    switch (type) {
      case 'RIFLE': {
        // High punch + noise crack
        this.playNoiseBurst(t, 0.08, 1200, 400, 0.4);
        this.playSineDrop(t, 180, 40, 0.1, 0.35);
        break;
      }
      case 'SMG': {
        // Fast snap
        this.playNoiseBurst(t, 0.04, 2400, 800, 0.25);
        this.playSineDrop(t, 220, 70, 0.05, 0.2);
        break;
      }
      case 'SHOTGUN': {
        // Huge punch + heavy low-end
        this.playNoiseBurst(t, 0.18, 900, 200, 0.7);
        this.playSineDrop(t, 150, 30, 0.2, 0.6);
        this.playNoiseBurst(t + 0.03, 0.12, 3000, 1000, 0.3);
        break;
      }
      case 'SNIPER': {
        // High supersonic crack + deep echo
        this.playSineDrop(t, 450, 35, 0.25, 0.7);
        this.playNoiseBurst(t, 0.15, 3800, 600, 0.5);
        break;
      }
      case 'PLASMA': {
        // Sci-fi synth sweep
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }
      case 'ROCKET': {
        // Whoosh ignite
        this.playSineDrop(t, 320, 80, 0.35, 0.5);
        this.playNoiseBurst(t, 0.4, 600, 150, 0.4);
        break;
      }
      case 'MINIGUN': {
        this.playNoiseBurst(t, 0.035, 1800, 500, 0.28);
        this.playSineDrop(t, 160, 50, 0.04, 0.25);
        break;
      }
    }
  }

  // Explosions
  public playExplosion(intensity: 'SMALL' | 'MEDIUM' | 'LARGE' | 'NUKE' = 'MEDIUM') {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const mult = intensity === 'SMALL' ? 0.5 : intensity === 'MEDIUM' ? 1.0 : intensity === 'LARGE' ? 1.5 : 2.2;
    const dur = 0.3 * mult;

    // Sub-bass thump
    this.playSineDrop(t, 120 * mult, 25, dur, 0.8 * Math.min(1.2, mult));
    // Distortion noise
    this.playNoiseBurst(t, dur * 1.5, 800, 80, 0.7 * Math.min(1.2, mult));
    // Shockwave sizzle
    this.playNoiseBurst(t + 0.04, dur * 0.8, 2500, 300, 0.4 * mult);
  }

  // Hit Impact
  public playHit(type: 'FLESH' | 'ARMOR' | 'HEADSHOT' | 'SHIELD') {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    if (type === 'HEADSHOT') {
      // High ding chime + squish
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, t);
      osc.frequency.exponentialRampToValueAtTime(2340, t + 0.08);
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
      this.playSineDrop(t, 200, 60, 0.06, 0.3);
    } else if (type === 'ARMOR') {
      // Metal clink
      this.playNoiseBurst(t, 0.05, 3500, 1500, 0.4);
      this.playSineDrop(t, 400, 180, 0.05, 0.3);
    } else if (type === 'SHIELD') {
      // Sci-fi zap
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.1);
    } else {
      // Flesh thud
      this.playSineDrop(t, 160, 40, 0.08, 0.3);
    }
  }

  // Movement SFX
  public playJump() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.18);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
    this.playNoiseBurst(t, 0.1, 800, 300, 0.2);
  }

  public playSlide() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    this.playNoiseBurst(t, 0.35, 1200, 300, 0.35);
  }

  public playDodge() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    this.playNoiseBurst(t, 0.15, 2200, 600, 0.3);
    this.playSineDrop(t, 320, 120, 0.12, 0.25);
  }

  public playMelee() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Whoosh + solid punch
    this.playNoiseBurst(t, 0.18, 1400, 200, 0.4);
    this.playSineDrop(t + 0.05, 240, 45, 0.18, 0.7);
  }

  public playReload() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Mag out clink
    this.playNoiseBurst(t, 0.04, 3000, 1200, 0.25);
    // Mag slam
    this.playSineDrop(t + 0.25, 300, 100, 0.08, 0.35);
    this.playNoiseBurst(t + 0.25, 0.06, 2500, 800, 0.35);
    // Bolt rack
    this.playNoiseBurst(t + 0.5, 0.05, 4000, 1500, 0.3);
  }

  public playPowerUp() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const st = t + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      g.gain.setValueAtTime(0.3, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(st);
      osc.stop(st + 0.15);
    });
  }

  // Missile & Flight SFX
  public playMissileLockAlarm() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const st = t + i * 0.12;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, st);
      g.gain.setValueAtTime(0.35, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.08);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(st);
      osc.stop(st + 0.08);
    }
  }

  public playFlareDeploy() {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    this.playNoiseBurst(t, 0.25, 1800, 400, 0.5);
    this.playSineDrop(t, 500, 100, 0.2, 0.4);
  }

  // Radio dialogue squelch sound
  public playRadioSquelch() {
    if (!this.ctx || !this.voiceGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    // Bleep
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.setValueAtTime(1250, t + 0.04);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.voiceGain);
    osc.start(t);
    osc.stop(t + 0.1);
    // Static burst
    this.playNoiseBurst(t + 0.02, 0.07, 3000, 1000, 0.15);
  }

  public playComboUp(multiplier: number) {
    if (!this.ctx || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    const base = 300 + multiplier * 80;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.15);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Synthesized speech-like robotic/radio voice vocalizer for atmospheric immersion
  public speakRadioVoice(text: string) {
    // Try browser speech synthesis if available and enabled
    if ('speechSynthesis' in window && this.voiceVolume > 0.1) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.15;
        utterance.pitch = 0.95;
        utterance.volume = this.voiceVolume;
        
        // Select an English voice if present
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
        if (engVoice) utterance.voice = engVoice;

        this.playRadioSquelch();
        window.speechSynthesis.speak(utterance);
      } catch {
        this.playRadioSquelch();
      }
    } else {
      this.playRadioSquelch();
    }
  }

  // --- PROCEDURAL DYNAMIC ACTION SOUNDTRACK ---

  public startMusic(mode: 'STEALTH' | 'COMBAT' | 'BOSS' | 'AERIAL' | 'VICTORY' = 'COMBAT') {
    if (this.musicPlaying && this.musicIntensity === mode) return;
    this.resume();
    this.musicIntensity = mode;
    this.musicPlaying = true;
    
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    this.bpm = mode === 'AERIAL' ? 142 : mode === 'BOSS' ? 138 : mode === 'COMBAT' ? 130 : 110;
    const stepDurationMs = (60000 / this.bpm) / 4; // 16th note steps

    this.currentStep = 0;
    this.musicInterval = window.setInterval(() => {
      this.renderMusicStep(this.currentStep % 16);
      this.currentStep++;
    }, stepDurationMs);
  }

  public setMusicIntensity(mode: 'STEALTH' | 'COMBAT' | 'BOSS' | 'AERIAL' | 'VICTORY') {
    if (this.musicIntensity === mode) return;
    this.startMusic(mode);
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private renderMusicStep(step: number) {
    if (!this.ctx || !this.musicGain || !this.musicPlaying || this.musicVolume <= 0.01) return;
    const t = this.ctx.currentTime;

    const mode = this.musicIntensity;

    // Kick on 0, 4, 8, 12 in combat/boss/aerial
    if (mode !== 'STEALTH') {
      if (step % 4 === 0) {
        this.playSynthKick(t, mode === 'BOSS' ? 1.2 : 0.8);
      }
    } else if (step === 0 || step === 8) {
      this.playSynthKick(t, 0.5);
    }

    // Snare / Clack on 4, 12
    if ((step === 4 || step === 12) && mode !== 'STEALTH') {
      this.playSynthSnare(t, mode === 'BOSS' ? 0.7 : 0.5);
    }

    // Hi-hat on every odd step
    if (step % 2 === 0 && (mode === 'COMBAT' || mode === 'AERIAL' || mode === 'BOSS')) {
      this.playSynthHiHat(t, step % 4 === 2 ? 0.25 : 0.15);
    }

    // Bassline
    const bassNotes = mode === 'BOSS' 
      ? [55, 55, 65.41, 55, 73.42, 55, 65.41, 51.91] // A minor aggressive
      : mode === 'AERIAL'
      ? [73.42, 73.42, 87.31, 73.42, 98.0, 73.42, 110, 87.31] // D minor energetic
      : [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 77.78, 58.27]; // C minor spy theme

    if (step % 2 === 0) {
      const noteIdx = (Math.floor(step / 2)) % bassNotes.length;
      const freq = bassNotes[noteIdx];
      this.playSynthBass(t, freq, mode === 'BOSS' ? 0.45 : mode === 'STEALTH' ? 0.25 : 0.35);
    }

    // Action Synth Lead / Stabs on specific beats
    if (mode === 'BOSS' && (step === 0 || step === 3 || step === 6 || step === 10 || step === 14)) {
      this.playSynthLead(t, step === 10 ? 220 : 174.61, 0.3);
    } else if (mode === 'AERIAL' && step % 4 === 1) {
      this.playSynthLead(t, 293.66 + (step % 8) * 30, 0.22);
    }
  }

  // Internal Audio Node Generators
  private playNoiseBurst(time: number, duration: number, highCut: number, lowCut: number, gainVal: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((highCut + lowCut) / 2, time);
    filter.Q.setValueAtTime(1.2, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private playSineDrop(time: number, startFreq: number, endFreq: number, duration: number, gainVal: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playSynthKick(time: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(gainVal * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  private playSynthSnare(time: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    this.playNoiseBurst(time, 0.12, 4000, 1000, gainVal * 0.5);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
    gain.gain.setValueAtTime(gainVal * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private playSynthHiHat(time: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    this.playNoiseBurst(time, 0.035, 9000, 5000, gainVal * 0.4);
  }

  private playSynthBass(time: number, freq: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.18);

    gain.gain.setValueAtTime(gainVal * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playSynthLead(time: number, freq: number, gainVal: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(gainVal * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.25);
  }
}

export const sound = new SoundEngine();
