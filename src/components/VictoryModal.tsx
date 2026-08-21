import React from 'react';
import { RaceWinnerInfo } from '../types';
import { Trophy, ChevronRight, Crown, Sparkles, Flame, Medal, Award, Globe } from 'lucide-react';

interface VictoryModalProps {
  winnerInfo: RaceWinnerInfo;
  currentLevel: number;
  totalLevels: number;
  nextLevelCountdown: number;
  onNextLevel: () => void;
  tournamentWins: Record<string, number>;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerInfo,
  currentLevel,
  totalLevels,
  nextLevelCountdown,
  onNextLevel,
  tournamentWins,
}) => {
  const isGrandFinale = currentLevel >= 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto select-none">
      <div
        className={`bg-slate-900 border-2 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-center relative overflow-hidden flex flex-col items-center shadow-2xl ${
          isGrandFinale
            ? 'border-amber-400 shadow-[0_0_80px_rgba(250,204,21,0.6)]'
            : 'border-cyan-400/80 shadow-[0_0_60px_rgba(6,182,212,0.35)]'
        }`}
      >
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Badge Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-black uppercase mb-3 shadow">
          {isGrandFinale ? (
            <>
              <Crown size={15} className="text-amber-400 animate-bounce" />
              <span>STAGE 50: GRAND WORLD CHAMPIONSHIP FINALE</span>
            </>
          ) : (
            <>
              <Trophy size={14} className="text-amber-400" />
              <span>STAGE {winnerInfo.level} OF {totalLevels} COMPLETED</span>
            </>
          )}
        </div>

        {/* High-Definition Winning Countryball Close-Up Showcase */}
        <div className="relative my-1 p-3 flex flex-col items-center">
          <div className="relative">
            <div className="text-7xl sm:text-8xl mb-2 filter drop-shadow-[0_0_25px_rgba(250,204,21,0.7)] animate-pulse">
              {winnerInfo.winner.flagEmoji}
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Crown size={32} className="text-amber-400 fill-amber-400 drop-shadow" />
            </div>
          </div>

          <div className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 mt-1">
            <Sparkles size={14} />
            <span>{isGrandFinale ? '🏆 WORLD MARBLE CHAMPION 🏆' : '🔍 WINNER CLOSE-UP'}</span>
            <Sparkles size={14} />
          </div>
        </div>

        {/* Winning Country Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase drop-shadow mb-1">
          {winnerInfo.winner.name} {isGrandFinale ? 'WINS THE TOURNAMENT!' : 'WINS STAGE!'}
        </h2>
        <p className="text-xs text-gray-300 mb-4 font-mono">
          Finish Time: {winnerInfo.finishTime.toFixed(2)}s · Trait: {winnerInfo.winner.trait}
        </p>

        {/* Stage Top 3 Podium */}
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3 mb-4 space-y-1.5">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider text-left mb-1 font-bold flex items-center justify-between">
            <span>STAGE PODIUM FINISHERS</span>
            <span>DIFFERENTIAL</span>
          </div>
          {winnerInfo.podium.map((p) => (
            <div
              key={p.ball.id}
              className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border ${
                p.rank === 1
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold'
                  : 'bg-white/5 border-white/5 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-black text-xs ${
                    p.rank === 1
                      ? 'text-amber-400'
                      : p.rank === 2
                      ? 'text-slate-300'
                      : 'text-amber-600'
                  }`}
                >
                  #{p.rank}
                </span>
                <span className="text-base">{p.ball.flagEmoji}</span>
                <span className="font-bold">{p.ball.name}</span>
                {tournamentWins[p.ball.id] > 0 && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded font-mono">
                    {tournamentWins[p.ball.id]} 🏆
                  </span>
                )}
              </div>
              <span className="font-mono text-gray-300 text-[11px]">
                {p.rank === 1 ? `${p.finishTime.toFixed(2)}s` : `+${(p.finishTime - winnerInfo.finishTime).toFixed(2)}s`}
              </span>
            </div>
          ))}
        </div>

        {/* Automatic Progression Status & Advance Button */}
        <div className="w-full flex flex-col gap-2">
          {!isGrandFinale ? (
            <>
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                <span>AUTO-ADVANCING TO STAGE {currentLevel + 1}...</span>
                <span>{nextLevelCountdown}s</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - nextLevelCountdown) / 4) * 100}%` }}
                />
              </div>

              <button
                onClick={onNextLevel}
                className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <span>ADVANCE TO STAGE {currentLevel + 1} NOW</span>
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 text-amber-200 text-xs font-mono font-bold">
                🌍 50-STAGE WORLD CHAMPIONSHIP COMPLETED! ALL HAIL {winnerInfo.winner.name.toUpperCase()}! 👑
              </div>
              <button
                onClick={onNextLevel}
                className="mt-1 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <span>START NEW 50-STAGE TOURNAMENT</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
