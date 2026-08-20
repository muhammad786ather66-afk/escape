import React, { useEffect } from 'react';
import { CombatStats, MissionConfig } from '../types';
import { Trophy, CheckCircle, XCircle, RotateCcw, ArrowRight, ShieldCheck, Zap, Crosshair, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../game/audio';

interface MissionDebriefModalProps {
  victory: boolean;
  mission: MissionConfig;
  stats: CombatStats;
  earnedCredits: number;
  earnedXP: number;
  newLevel: number;
  leveledUp: boolean;
  onNextMission: () => void;
  onRetry: () => void;
  onOpenArsenal: () => void;
  onMainMenu: () => void;
}

export const MissionDebriefModal: React.FC<MissionDebriefModalProps> = ({
  victory,
  mission,
  stats,
  earnedCredits,
  earnedXP,
  newLevel,
  leveledUp,
  onNextMission,
  onRetry,
  onOpenArsenal,
  onMainMenu,
}) => {
  useEffect(() => {
    if (victory) {
      sound.playPowerUp();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#3b82f6'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [victory]);

  const accuracyPct = stats.accuracyShots > 0 
    ? Math.round((stats.accuracyHits / stats.accuracyShots) * 100) 
    : 100;

  return (
    <div 
      id="mission-debrief-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-lg bg-black/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto backdrop-blur-md">
        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg border">
            {victory ? (
              <div className="w-full h-full rounded-2xl bg-emerald-950/80 border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle size={36} />
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-rose-950/80 border-rose-500/50 text-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <XCircle size={36} />
              </div>
            )}
          </div>

          <h2 className={`text-2xl sm:text-3xl font-bold uppercase tracking-tight ${victory ? 'text-emerald-400' : 'text-rose-400'}`}>
            {victory ? 'OPERATION ACCOMPLISHED' : 'LINK SEVERED // DOWN'}
          </h2>
          <div className="text-xs font-mono text-gray-400 mt-1">
            {mission.codeName} • {mission.location}
          </div>
        </div>

        {/* Combat Stats Grid (Immersive UI Style) */}
        <div className="bg-white/5 border border-blue-900/40 rounded-2xl p-4 mb-5 space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-white/10 font-mono">
            <span className="text-gray-400 uppercase tracking-wider">COMBAT TELEMETRY SCORE</span>
            <span className="text-amber-400 font-bold text-base">{stats.score.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-gray-400 text-[10px]">HOSTILES ELIMINATED</div>
              <div className="text-white font-bold text-sm mt-0.5">{stats.kills}</div>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-gray-400 text-[10px]">CRITICAL HEADSHOTS</div>
              <div className="text-rose-400 font-bold text-sm mt-0.5">{stats.headshots}</div>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-gray-400 text-[10px]">SYSTEM ACCURACY</div>
              <div className="text-blue-400 font-bold text-sm mt-0.5">{accuracyPct}%</div>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-gray-400 text-[10px]">MAX SYNC COMBO</div>
              <div className="text-amber-400 font-bold text-sm mt-0.5">x{stats.comboMultiplier}</div>
            </div>
          </div>
        </div>

        {/* Rewards Section (If Victory) */}
        {victory && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div className="text-[11px] font-mono font-bold text-blue-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Trophy size={14} /> FIELD BOUNTY ALLOCATION
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-200 font-semibold flex items-center gap-1">
                <span className="text-amber-400">◈</span> +{earnedCredits} CREDITS
              </span>
              <span className="text-blue-300 font-semibold">
                +{earnedXP} XP {leveledUp && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-1 shadow-[0_0_6px_#3b82f6]">RANK UP LV {newLevel}!</span>}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2.5">
          {victory ? (
            <button
              id="next-mission-button"
              onClick={onNextMission}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-blue-400/50 transition cursor-pointer"
            >
              <span>PROCEED TO NEXT OPERATION</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              id="retry-mission-button"
              onClick={onRetry}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 active:scale-95 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>RE-ENGAGE OPERATION</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              id="debrief-arsenal-button"
              onClick={onOpenArsenal}
              className="py-3 rounded-xl bg-white/5 hover:bg-blue-500/10 text-gray-300 hover:text-white text-xs font-semibold transition border border-white/10 hover:border-blue-500/40 active:scale-95"
            >
              ARSENAL & LAB
            </button>
            <button
              id="debrief-menu-button"
              onClick={onMainMenu}
              className="py-3 rounded-xl bg-white/5 hover:bg-blue-500/10 text-gray-300 hover:text-white text-xs font-semibold transition border border-white/10 hover:border-blue-500/40 active:scale-95"
            >
              COMMAND DECK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
