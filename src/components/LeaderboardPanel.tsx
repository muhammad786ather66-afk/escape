import React, { useState } from 'react';
import { RacerState, TrackData, CountryballDef } from '../types';
import { Trophy, Medal, Flame, Globe, ChevronRight } from 'lucide-react';
import { COUNTRYBALLS } from '../game/countryballsData';

interface LeaderboardPanelProps {
  standings: RacerState[];
  track: TrackData;
  elapsedSec: number;
  tournamentWins: Record<string, number>;
  totalLevels: number;
  currentLevel: number;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  standings,
  track,
  elapsedSec,
  tournamentWins,
  totalLevels,
  currentLevel,
}) => {
  const [tab, setTab] = useState<'RACE' | 'CHAMPIONSHIP'>('RACE');

  // Sorted tournament winners by win count
  const sortedTournamentBalls = COUNTRYBALLS.slice().sort(
    (a, b) => (tournamentWins[b.id] || 0) - (tournamentWins[a.id] || 0)
  );

  return (
    <div className="absolute top-20 right-3 bottom-16 sm:bottom-4 w-44 sm:w-60 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-3xl p-3 shadow-2xl flex flex-col pointer-events-auto z-20 select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-white">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('RACE')}
            className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
              tab === 'RACE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            STAGE {currentLevel}
          </button>
          <button
            onClick={() => setTab('CHAMPIONSHIP')}
            className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
              tab === 'CHAMPIONSHIP'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TALLY 🏆
          </button>
        </div>

        <span className="text-[10px] font-mono text-gray-400 font-bold">
          {elapsedSec.toFixed(1)}s
        </span>
      </div>

      {/* Tab 1: Live Race Standings */}
      {tab === 'RACE' && (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scroll">
          {standings
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((racer) => {
              const progressPct = Math.min(
                100,
                Math.max(
                  0,
                  ((racer.y - track.startY) / (track.finishY - track.startY)) * 100
                )
              );

              return (
                <div
                  key={racer.id}
                  className={`flex items-center justify-between p-1.5 rounded-xl border text-xs transition-all ${
                    racer.rank === 1
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 font-bold'
                      : racer.rank <= 3
                      ? 'bg-slate-800/80 border-white/20 text-white'
                      : 'bg-slate-950/50 border-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-bold w-4 text-[10px] text-center">
                      {racer.rank}
                    </span>
                    <span className="text-base leading-none">{racer.ball.flagEmoji}</span>
                    <span className="font-semibold text-[11px] truncate">
                      {racer.ball.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {racer.isFinished ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/40">
                        FIN
                      </span>
                    ) : (
                      <div className="w-10 sm:w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Tab 2: Tournament Win Tally */}
      {tab === 'CHAMPIONSHIP' && (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scroll">
          <div className="text-[10px] font-mono uppercase text-gray-400 pb-1 font-bold">
            STAGE WINS (50-STAGE CAMPAIGN)
          </div>
          {sortedTournamentBalls.map((ball, idx) => {
            const wins = tournamentWins[ball.id] || 0;
            return (
              <div
                key={ball.id}
                className={`flex items-center justify-between p-1.5 rounded-xl border text-xs ${
                  wins > 0
                    ? 'bg-amber-500/15 border-amber-400/30 text-amber-200'
                    : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono font-bold w-4 text-[10px] text-center text-gray-400">
                    {idx + 1}
                  </span>
                  <span className="text-base leading-none">{ball.flagEmoji}</span>
                  <span className="font-semibold text-[11px] truncate text-white">
                    {ball.name}
                  </span>
                </div>
                <div className="font-mono font-bold text-xs flex items-center gap-1">
                  <span className={wins > 0 ? 'text-amber-400' : 'text-gray-500'}>
                    {wins}
                  </span>
                  <span className="text-[10px]">🏆</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
