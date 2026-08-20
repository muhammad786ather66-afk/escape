import React from 'react';
import { SaveData } from '../types';
import { SaveManager } from '../game/saveManager';
import { 
  Play, 
  Map, 
  Crosshair, 
  Shield, 
  Trophy, 
  Settings, 
  Radio, 
  ChevronRight, 
  User, 
  Activity, 
  Cpu, 
  Layers, 
  Zap 
} from 'lucide-react';
import { sound } from '../game/audio';

interface MainMenuProps {
  saveData: SaveData;
  onPlay: () => void;
  onOpenOperations: () => void;
  onOpenArsenal: () => void;
  onOpenUpgrades: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenOperations,
  onOpenArsenal,
  onOpenUpgrades,
  onOpenAchievements,
  onOpenSettings,
}) => {
  const rank = SaveManager.getRankTitle(saveData.level);
  const nextLevelXP = SaveManager.getXPForNextLevel(saveData.level);
  const xpPct = Math.min(100, Math.round((saveData.xp / nextLevelXP) * 100));

  const handleStart = () => {
    sound.playPowerUp();
    onPlay();
  };

  return (
    <div 
      id="main-menu-overlay" 
      className="absolute inset-0 z-40 bg-[#020305] text-[#d1d5db] font-sans flex flex-col justify-between overflow-y-auto select-none relative"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, #111827 0%, #020305 80%)'
      }}
    >
      {/* Background Ambience & Lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Tactical Grid SVG background */}
      <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
        <defs>
          <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 300 L 1000 300" stroke="url(#grid-grad)" strokeWidth="0.8" />
        <path d="M500 0 L 500 600" stroke="url(#grid-grad)" strokeWidth="0.8" />
        <circle cx="500" cy="300" r="220" stroke="rgba(59,130,246,0.12)" fill="none" />
        <circle cx="500" cy="300" r="380" stroke="rgba(59,130,246,0.06)" fill="none" />
      </svg>

      {/* --- TOP HEADER (IMMERSIVE UI STYLE) --- */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-blue-900/30 bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-widest text-white leading-tight">
              SHADOW-STRIKE OS
            </span>
            <span className="text-[9px] text-blue-400 font-mono tracking-wider">
              NIGHTFALL PROTOCOL // V4.2
            </span>
          </div>
          <span className="hidden md:inline-block text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-mono">
            SECTOR 7G
          </span>
        </div>

        {/* Telemetry & Profile Badges */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-[11px]">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-blue-400/70 text-[10px] uppercase tracking-wider">SYNC LEVEL</span>
            <span className="text-white font-bold">LVL {saveData.level} • {saveData.xp}/{nextLevelXP} XP</span>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-blue-400/70 text-[10px] uppercase tracking-wider">CREDITS</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              ◈ {saveData.credits.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse"></div>
            <button
              id="menu-settings-button"
              onClick={() => {
                sound.playRadioSquelch();
                onOpenSettings();
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/40 text-gray-300 hover:text-white transition active:scale-95"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CENTER STAGE --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 z-10 my-auto">
        <div className="w-full max-w-4xl flex flex-col items-center text-center">
          
          {/* Holographic Sync Target Emblem */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-blue-500/15 flex items-center justify-center">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-blue-500/25 flex items-center justify-center shadow-[inset_0_0_30px_rgba(59,130,246,0.15)]">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/10 rounded-full flex flex-col items-center justify-center border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.25)] backdrop-blur-sm">
                  <span className="text-3xl sm:text-4xl font-light text-white tracking-tighter">0{saveData.highestMission}</span>
                  <span className="text-[10px] text-blue-400 mt-1 font-mono tracking-widest">ACTIVE_OP</span>
                </div>
              </div>
            </div>

            {/* Coordinates and status stamps around the circle */}
            <div className="absolute -top-2 left-0 text-left hidden sm:block">
              <div className="text-[10px] text-blue-400 font-mono tracking-widest">// TARGET_SECTOR</div>
              <div className="text-sm font-light text-gray-400">SYS_0x4F_BLACK</div>
            </div>

            <div className="absolute -bottom-2 right-0 text-right hidden sm:block">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">STATUS</div>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                ARMED & READY
              </div>
            </div>
          </div>

          {/* Titles & Slogan */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-mono text-blue-400 uppercase tracking-widest mb-3 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              TACTICAL FIELD OPERATIVE // {saveData.agentName}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase drop-shadow-2xl">
              OPERATION <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">SHADOW STRIKE</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 font-mono tracking-widest uppercase mt-2 max-w-lg mx-auto">
              NEURAL COMBAT RUNNER • AERIAL STRIKE INFILTRATION
            </p>
          </div>

          {/* Action Launch Bar */}
          <div className="w-full max-w-xl space-y-4">
            <button
              id="menu-play-button"
              onClick={handleStart}
              className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-base sm:text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/50 transition cursor-pointer"
            >
              <Play size={22} className="fill-current" />
              <span>ENGAGE OPERATION 0{saveData.highestMission}</span>
              <ChevronRight size={22} />
            </button>

            {/* Navigation Nodes (Immersive UI Subpanels) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                id="menu-operations-button"
                onClick={() => {
                  sound.playRadioSquelch();
                  onOpenOperations();
                }}
                className="p-3.5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-gray-300 hover:text-blue-400 group backdrop-blur-sm"
              >
                <Map size={18} className="text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-mono font-semibold tracking-wider">OPERATIONS</span>
              </button>

              <button
                id="menu-arsenal-button"
                onClick={() => {
                  sound.playRadioSquelch();
                  onOpenArsenal();
                }}
                className="p-3.5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-gray-300 hover:text-blue-400 group backdrop-blur-sm"
              >
                <Crosshair size={18} className="text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-mono font-semibold tracking-wider">ARSENAL</span>
              </button>

              <button
                id="menu-upgrades-button"
                onClick={() => {
                  sound.playRadioSquelch();
                  onOpenUpgrades();
                }}
                className="p-3.5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-gray-300 hover:text-blue-400 group backdrop-blur-sm"
              >
                <Shield size={18} className="text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-mono font-semibold tracking-wider">UPGRADES</span>
              </button>

              <button
                id="menu-achievements-button"
                onClick={() => {
                  sound.playRadioSquelch();
                  onOpenAchievements();
                }}
                className="p-3.5 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95 text-gray-300 hover:text-blue-400 group backdrop-blur-sm"
              >
                <Trophy size={18} className="text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[11px] font-mono font-semibold tracking-wider">RECORDS</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER STATUS BAR (IMMERSIVE UI STYLE) --- */}
      <footer className="h-14 px-4 sm:px-8 border-t border-blue-900/30 bg-black/40 backdrop-blur-md flex items-center justify-between text-[11px] font-mono z-10">
        <div className="flex gap-4 sm:gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></div>
            <span className="text-gray-400 hidden sm:inline">ENCRYPTED TUNNEL ACTIVE</span>
            <span className="text-gray-400 sm:hidden">TUNNEL ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div>
            <span className="text-gray-400 hidden sm:inline">NEURAL LINK: 0.98 NOMINAL</span>
            <span className="text-gray-400 sm:hidden">LINK 0.98</span>
          </div>
        </div>
        <div className="text-gray-500 uppercase tracking-widest text-[10px]">
          SYS_STREAM // 001-A // 60 FPS
        </div>
      </footer>
    </div>
  );
};
