import React, { useState } from 'react';
import { Trophy, X, RotateCcw, Medal, Sparkles, Flame } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { SaveManager } from '../game/saveManager';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onUpdateEntries: (entries: LeaderboardEntry[]) => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  onUpdateEntries,
  onClose,
}) => {
  const [sortBy, setSortBy] = useState<'POINTS' | 'WINS' | 'PODIUMS'>('POINTS');

  const sortedEntries = entries.slice().sort((a, b) => {
    if (sortBy === 'WINS') return b.wins - a.wins || b.totalPoints - a.totalPoints;
    if (sortBy === 'PODIUMS') return b.top3 - a.top3 || b.totalPoints - a.totalPoints;
    return b.totalPoints - a.totalPoints || b.wins - a.wins;
  });

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all countryball race statistics?')) {
      const reset = SaveManager.resetLeaderboard();
      onUpdateEntries(reset);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900/95 border border-white/15 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                HALL OF FAME LEADERBOARD
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Persistent racing standings & medal counts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sort Controls Bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setSortBy('POINTS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sortBy === 'POINTS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setSortBy('WINS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sortBy === 'WINS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Wins 🥇
            </button>
            <button
              onClick={() => setSortBy('PODIUMS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                sortBy === 'PODIUMS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Top 3 🏆
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Stats</span>
          </button>
        </div>

        {/* Scrollable Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {sortedEntries.map((entry, idx) => {
            const winRate = entry.racesRun > 0 ? ((entry.wins / entry.racesRun) * 100).toFixed(0) : '0';

            return (
              <div
                key={entry.countryId}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg'
                    : idx === 1
                    ? 'bg-slate-800/40 border-slate-600/30 text-gray-200'
                    : idx === 2
                    ? 'bg-amber-950/20 border-amber-800/30 text-gray-200'
                    : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                {/* Rank & Ball Info */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-mono font-black text-sm ${
                      idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <span className="text-2xl">{entry.flagCode}</span>

                  <div>
                    <div className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.wins > 0 && <span className="text-xs text-amber-400">🥇x{entry.wins}</span>}
                    </div>
                    <div className="text-[11px] font-mono text-gray-400">
                      Races: {entry.racesRun} • Win Rate: {winRate}%
                    </div>
                  </div>
                </div>

                {/* Score Stats */}
                <div className="flex items-center gap-4 font-mono text-right">
                  <div className="hidden sm:block">
                    <div className="text-[10px] text-gray-400 uppercase">PODIUMS</div>
                    <div className="font-bold text-gray-300">{entry.top3}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">POINTS</div>
                    <div className="font-black text-amber-400 text-sm sm:text-base">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
