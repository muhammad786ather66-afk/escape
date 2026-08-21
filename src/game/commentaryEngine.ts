import { CommentaryMessage, RacerState, CountryballDef } from '../types';
import { sound } from './audioSynth';

export class CommentaryEngine {
  private lastLeaderId: string | null = null;
  private lastLeadChangeTime: number = 0;
  private lastHazardCommentTime: number = 0;
  private lastSpeechTime: number = 0;
  private commentaryHistory: CommentaryMessage[] = [];
  private onNewCommentary?: (msg: CommentaryMessage) => void;

  constructor(onNewCommentary?: (msg: CommentaryMessage) => void) {
    this.onNewCommentary = onNewCommentary;
  }

  public setCallback(cb: (msg: CommentaryMessage) => void) {
    this.onNewCommentary = cb;
  }

  private postMessage(
    text: string,
    type: CommentaryMessage['type'],
    countryCode?: string,
    countryName?: string,
    speak: boolean = true
  ) {
    const msg: CommentaryMessage = {
      id: `comm_${Date.now()}_${Math.random()}`,
      text,
      timestamp: Date.now(),
      type,
      countryCode,
      countryName,
    };

    this.commentaryHistory.unshift(msg);
    if (this.commentaryHistory.length > 30) {
      this.commentaryHistory.pop();
    }

    if (this.onNewCommentary) {
      this.onNewCommentary(msg);
    }

    if (speak && !sound.commentaryVoiceMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const now = Date.now();
      if (now - this.lastSpeechTime > 3200) {
        this.lastSpeechTime = now;
        try {
          // Clean speech string for natural pronunciation
          const spokenText = text.replace(/[\p{Emoji}\u200d]+/gu, '').trim();
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = 1.15;
          utterance.pitch = 1.05;
          utterance.volume = 0.85;
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }
    }
  }

  public onRaceStart(level: number, trackName: string, racersCount: number) {
    this.lastLeaderId = null;
    this.lastLeadChangeTime = Date.now();

    if (level === 50) {
      this.postMessage(
        `🏆 WELCOME TO STAGE 50: THE GRAND FINALE! Only 3 elite nations remain to battle for the World Championship!`,
        'TOURNAMENT',
        undefined,
        undefined,
        true
      );
    } else {
      const intros = [
        `🎙️ Stage ${level} is GREEN! ${racersCount} Countryballs drop into the ${trackName}!`,
        `🏁 And they are OFF in Stage ${level}! Huge pack battling down the opening funnel!`,
        `🚀 Green light! ${racersCount} nations charging into ${trackName}!`,
      ];
      const selected = intros[Math.floor(Math.random() * intros.length)];
      this.postMessage(selected, 'HYPE');
    }
  }

  public checkRaceState(racers: RacerState[]) {
    const now = Date.now();
    const active = racers.filter((r) => !r.isEliminated);
    if (active.length === 0) return;

    const leader = active.find((r) => r.rank === 1) || active[0];

    // Check Lead Change
    if (leader && leader.id !== this.lastLeaderId && now - this.lastLeadChangeTime > 2500) {
      if (this.lastLeaderId !== null) {
        sound.playLeaderChange();
        const templates = [
          `${leader.ball.flagEmoji} ${leader.ball.name} takes the lead with tremendous momentum!`,
          `Sensational overtake by ${leader.ball.flagEmoji} ${leader.ball.name} into 1st position!`,
          `${leader.ball.flagEmoji} ${leader.ball.name} powers ahead to head the pack!`,
          `Look at that speed! ${leader.ball.flagEmoji} ${leader.ball.name} surges to the front!`,
        ];
        const text = templates[Math.floor(Math.random() * templates.length)];
        this.postMessage(text, 'LEAD_CHANGE', leader.ball.code, leader.ball.name, true);
      }
      this.lastLeaderId = leader.id;
      this.lastLeadChangeTime = now;
    }

    // Check Hazard Near-Miss / Rebounds (random periodic excitement)
    if (now - this.lastHazardCommentTime > 5500) {
      const topFive = active.slice(0, 5);
      const randomRacer = topFive[Math.floor(Math.random() * topFive.length)];

      if (randomRacer) {
        const hazardPhrases = [
          `${randomRacer.ball.flagEmoji} ${randomRacer.ball.name} carves right past the spinning cutters!`,
          `Incredible balance from ${randomRacer.ball.flagEmoji} ${randomRacer.ball.name} around the flamethrower gauntlet!`,
          `${randomRacer.ball.flagEmoji} ${randomRacer.ball.name} slingshots out of the black hole gravity vortex!`,
          `High-speed nitro launch for ${randomRacer.ball.flagEmoji} ${randomRacer.ball.name}!`,
        ];
        const phrase = hazardPhrases[Math.floor(Math.random() * hazardPhrases.length)];
        this.postMessage(phrase, 'HAZARD_HIT', randomRacer.ball.code, randomRacer.ball.name, false);
        this.lastHazardCommentTime = now;
      }
    }
  }

  public onStageFinish(winner: CountryballDef, level: number, isGrandFinale: boolean) {
    if (isGrandFinale) {
      this.postMessage(
        `👑 HISTORIC VICTORY! ${winner.flagEmoji} ${winner.name} IS CROWNED THE ULTIMATE WORLD MARBLE CHAMPION! 🌍🎉`,
        'TOURNAMENT',
        winner.code,
        winner.name,
        true
      );
    } else {
      const finishPhrases = [
        `🏁 ${winner.flagEmoji} ${winner.name} captures Stage ${level} victory in thrilling fashion!`,
        `🏆 Checkered flag! ${winner.flagEmoji} ${winner.name} takes 1st place in Stage ${level}!`,
        `🥇 What a dominant run! ${winner.flagEmoji} ${winner.name} wins Stage ${level}!`,
      ];
      const phrase = finishPhrases[Math.floor(Math.random() * finishPhrases.length)];
      this.postMessage(phrase, 'FINISH', winner.code, winner.name, true);
    }
  }

  public getHistory(): CommentaryMessage[] {
    return this.commentaryHistory;
  }
}
