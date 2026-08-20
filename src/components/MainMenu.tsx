import React from 'react';
import { Play, Users, Trophy, Settings as SettingsIcon, Sparkles, Flag, Volume2, Shield } from 'lucide-react';
import { ALL_COUNTRYBALLS } from '../game/countryballsData';

interface MainMenuProps {
  onStartRace: () => void;
  onOpenRoster: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartRace,
  onOpenRoster,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const showcaseBalls = ALL_COUNTRYBALLS.slice(0, 10);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white select-none overflow-y-auto">
      {/* Decorative Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-xs font-mono text-blue-300 uppercase tracking-widest mt-4 shadow-lg">
        <Sparkles size={14} className="text-amber-400" />
        <span>3D PHYSICS AUTO-SIMULATOR // NO CONTROLS NEEDED</span>
      </div>

      {/* Title & Showcase */}
      <div className="flex flex-col items-center text-center max-w-2xl">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none drop-shadow-2xl">
          COUNTRYBALLS <br />
          <span className="bg-gradient-to-r from-blue-400 via-amber-300 to-pink-400 bg-clip-text text-transparent">
            MARBLE RACING
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 font-mono tracking-wider uppercase mt-4 max-w-md">
          Endless procedural obstacle courses, funny physics collisions, and satisfying ASMR rolling
        </p>

        {/* Rolling Countryballs Preview Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-8 flex-wrap">
          {showcaseBalls.map((b, idx) => (
            <div
              key={b.id}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-2xl sm:text-3xl shadow-xl hover:scale-110 transition duration-300 cursor-pointer animate-bounce"
              style={{ animationDelay: `${idx * 0.1}s`, animationDuration: '2s' }}
              title={b.name}
            >
              {b.flagCode}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm mb-6">
        <button
          onClick={onStartRace}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(59,130,246,0.5)] border border-blue-300/40 transition cursor-pointer"
        >
          <Play size={24} className="fill-current" />
          <span>START AUTO RACE</span>
        </button>

        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={onOpenRoster}
            className="py-3 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition cursor-pointer"
          >
            <Users size={18} />
            <span>ROSTER</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition cursor-pointer"
          >
            <Trophy size={18} />
            <span>STANDINGS</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="py-3 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-mono font-bold text-xs flex flex-col items-center justify-center gap-1 border border-white/10 transition cursor-pointer"
          >
            <SettingsIcon size={18} />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[11px] font-mono text-gray-500 flex items-center gap-2 mb-2">
        <span>PRESS SPACE TO PAUSE • R TO RESTART • M TO MUTE</span>
      </div>
    </div>
  );
};
