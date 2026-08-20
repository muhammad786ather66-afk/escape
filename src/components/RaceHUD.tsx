import React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Camera,
  Trophy,
  Users,
  Settings as SettingsIcon,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { RacerState, ActiveRaceEvent, CameraMode, GameSettings } from '../types';

interface RaceHUDProps {
  level: number;
  trackName: string;
  trackTheme: string;
  racers: RacerState[];
  leader: RacerState | null;
  eliminatedCount: number;
  totalRacers: number;
  countdown: number | null;
  activeEvent: ActiveRaceEvent | null;
  isPaused: boolean;
  settings: GameSettings;
  isFullscreen: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onRestartRace: () => void;
  onNextRace: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeCamera: (mode: CameraMode) => void;
  onOpenLeaderboard: () => void;
  onOpenRoster: () => void;
  onOpenSettings: () => void;
}

export const RaceHUD: React.FC<RaceHUDProps> = ({
  level,
  trackName,
  trackTheme,
  racers,
  leader,
  eliminatedCount,
  totalRacers,
  countdown,
  activeEvent,
  isPaused,
  settings,
  isFullscreen,
  onTogglePause,
  onToggleMute,
  onToggleFullscreen,
  onRestartRace,
  onNextRace,
  onChangeSpeed,
  onChangeCamera,
  onOpenLeaderboard,
  onOpenRoster,
  onOpenSettings,
}) => {
  // Sort active racers for the live broadcast ticker
  const topRacers = racers
    .filter((r) => !r.isEliminated)
    .sort((a, b) => {
      if (a.isFinished && b.isFinished) return (a.finishRank || 99) - (b.finishRank || 99);
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.z - a.z;
    })
    .slice(0, 6);

  const speedOptions = [0.5, 1.0, 1.5, 2.0, 3.0];
  const camOptions: { mode: CameraMode; label: string }[] = [
    { mode: 'LEADER', label: 'Leader' },
    { mode: 'PACK', label: 'Pack' },
    { mode: 'ACTION', label: 'Action' },
    { mode: 'TOP_DOWN', label: 'Top-Down' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* 1. TOP BROADCAST BAR */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Track & Level Info */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-xl shadow-lg border border-blue-400/40 tracking-wider">
              LEVEL {level}
            </div>
            <div className="bg-black/60 backdrop-blur-md text-amber-300 font-mono text-[11px] sm:text-xs px-2.5 py-1 rounded-xl border border-white/10 tracking-wide font-bold">
              {trackTheme.replace('_', ' ')}
            </div>
          </div>
          <div className="text-white text-xs sm:text-sm font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
            <span>{trackName}</span>
          </div>
        </div>

        {/* Live Race Standings Ticker */}
        <div className="hidden md:flex flex-col items-center bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl shadow-xl pointer-events-auto">
          <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE LEADERBOARD
          </div>
          <div className="flex items-center gap-2">
            {topRacers.map((r, idx) => (
              <div
                key={r.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  idx === 0
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 scale-105'
                    : 'bg-white/5 text-gray-200 border border-white/5'
                }`}
              >
                <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                <span>{r.ballDef.flagCode}</span>
                <span>{r.ballDef.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Menu Icons (Leaderboard, Roster, Settings) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenRoster}
            title="Countryballs Roster"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white flex items-center justify-center border border-white/15 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Users size={18} />
          </button>
          <button
            onClick={onOpenLeaderboard}
            title="Standings & Leaderboard"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-amber-400 flex items-center justify-center border border-white/15 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Trophy size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-gray-300 flex items-center justify-center border border-white/15 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {/* 2. SPECIAL EVENT BANNER */}
      {activeEvent && (
        <div className="self-center pointer-events-auto animate-bounce mb-auto mt-4">
          <div className="bg-gradient-to-r from-red-600 via-amber-500 to-pink-600 text-white font-black text-sm sm:text-base px-5 py-2 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.6)] border border-white/40 flex items-center gap-2">
            <Flame size={20} className="animate-spin" />
            <span>{activeEvent.title}</span>
            <span className="text-xs bg-black/40 px-2 py-0.5 rounded-lg font-mono">
              {Math.ceil(activeEvent.remainingTime)}s
            </span>
          </div>
        </div>
      )}

      {/* 3. 3.. 2.. 1.. GO! COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="text-center animate-scale-in">
            <div
              className={`font-black text-6xl sm:text-8xl md:text-9xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] tracking-tight ${
                countdown === 0
                  ? 'text-green-400 scale-125'
                  : countdown === 1
                  ? 'text-red-500'
                  : countdown === 2
                  ? 'text-amber-400'
                  : 'text-blue-400'
              }`}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <div className="text-white font-mono font-bold text-sm sm:text-lg tracking-widest uppercase mt-2 bg-black/60 px-4 py-1 rounded-full border border-white/20 inline-block">
              {countdown === 0 ? 'AUTO RACE STARTED!' : 'GET READY...'}
            </div>
          </div>
        </div>
      )}

      {/* 4. BOTTOM CONTROLS & STATUS DOCK */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Racer Stats Pill */}
        <div className="flex items-center gap-2 bg-black/65 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 shadow-xl pointer-events-auto text-xs font-mono">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>RACERS: {totalRacers - eliminatedCount}</span>
          </div>
          <span className="text-gray-500">|</span>
          <div className="text-red-400 font-bold">
            <span>OUT: {eliminatedCount}</span>
          </div>
          {leader && (
            <>
              <span className="text-gray-500">|</span>
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <span>1ST: {leader.ballDef.flagCode} {leader.ballDef.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
          >
            {isPaused ? <Play size={18} className="fill-current" /> : <Pause size={18} />}
          </button>

          {/* Simulation Speed Cycler */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                  settings.simulationSpeed === spd
                    ? 'bg-blue-500 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Camera View Switcher */}
          <div className="hidden lg:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
            {camOptions.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => onChangeCamera(opt.mode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                  settings.cameraMode === opt.mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Mute Audio */}
          <button
            onClick={onToggleMute}
            title={settings.sfxEnabled ? 'Mute Audio (M)' : 'Unmute Audio (M)'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 flex items-center justify-center border border-white/10 shadow-lg active:scale-95 transition cursor-pointer"
          >
            {settings.sfxEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-red-400" />}
          </button>

          {/* Restart Race */}
          <button
            onClick={onRestartRace}
            title="Restart Track (R)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 flex items-center justify-center border border-white/10 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <RotateCcw size={18} />
          </button>

          {/* Next Track Skip */}
          <button
            onClick={onNextRace}
            title="Skip to Next Track (N)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            title="Fullscreen (F)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 flex items-center justify-center border border-white/10 shadow-lg active:scale-95 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
