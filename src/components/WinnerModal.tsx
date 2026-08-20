import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Clock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { RaceResult } from '../types';

interface WinnerModalProps {
  result: RaceResult;
  autoAdvanceSeconds: number;
  onNextRace: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  result,
  autoAdvanceSeconds,
  onNextRace,
}) => {
  const [timeLeft, setTimeLeft] = useState(autoAdvanceSeconds);

  // Trigger celebratory confetti cannon on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [result.winner.primaryColor, result.winner.secondaryColor, '#fbbf24', '#38bdf8'],
      });
    } catch (e) {
      console.log('Confetti error', e);
    }
  }, [result]);

  // Automatic countdown timer to next race
  useEffect(() => {
    setTimeLeft(autoAdvanceSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onNextRace();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoAdvanceSeconds, onNextRace]);

  const progressPercent = ((autoAdvanceSeconds - timeLeft) / autoAdvanceSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col items-center text-center">
        {/* Glow Header */}
        <div className="absolute -top-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy & Badge */}
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-xl border-2 border-white/40 animate-bounce">
            <Trophy size={44} className="text-slate-950" />
          </div>
          <div className="absolute -bottom-1 -right-1 text-2xl sm:text-3xl bg-slate-800 rounded-full p-1 border border-white/20">
            {result.winner.flagCode}
          </div>
        </div>

        <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5 mb-1">
          <Sparkles size={14} />
          <span>LEVEL {result.level} COMPLETED</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
          {result.winner.name} WINS!
        </h2>

        <p className="text-xs sm:text-sm text-gray-400 font-mono italic mb-6">
          "{result.winner.specialTrait}"
        </p>

        {/* Podium Top 3 Standings */}
        <div className="w-full bg-slate-950/60 rounded-2xl border border-white/10 p-3 mb-5 flex flex-col gap-2">
          <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider text-left px-2">
            RACE PODIUM & POINTS
          </div>

          {result.podium.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                p.rank === 1
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : p.rank === 2
                  ? 'bg-slate-700/40 border border-slate-500/30 text-gray-200'
                  : 'bg-amber-900/20 border border-amber-700/30 text-amber-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 text-left font-mono">#{p.rank}</span>
                <span className="text-base">{p.racer.flagCode}</span>
                <span>{p.racer.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-gray-400">{p.finishTime.toFixed(1)}s</span>
                <span className="text-emerald-400">+{p.points} PTS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Race Stats Row */}
        <div className="grid grid-cols-3 gap-2 w-full mb-6 font-mono text-xs text-gray-300">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="text-gray-400 text-[10px]">RACERS</div>
            <div className="text-sm font-bold text-white mt-0.5">{result.totalRacers}</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="text-gray-400 text-[10px]">ELIMINATED</div>
            <div className="text-sm font-bold text-red-400 mt-0.5">{result.eliminatedCount}</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <div className="text-gray-400 text-[10px]">DURATION</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{result.raceDuration.toFixed(1)}s</div>
          </div>
        </div>

        {/* Next Race Auto Advance Button & Progress Bar */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onNextRace}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition cursor-pointer"
          >
            <span>NEXT RACE (LEVEL {result.level + 1})</span>
            <ArrowRight size={20} />
          </button>

          {/* Auto Advance Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            Auto-starting in {timeLeft}s (sit back and watch)...
          </span>
        </div>
      </div>
    </div>
  );
};
