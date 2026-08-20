import React, { useState } from 'react';
import { MissionConfig, SaveData, GameMode } from '../types';
import { GameDirector } from '../game/gameDirector';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  Plane, 
  Shield, 
  ChevronRight, 
  Lock, 
  Globe, 
  Infinity as InfinityIcon, 
  Anchor, 
  Wind,
  Flame,
  Bot
} from 'lucide-react';
import { sound } from '../game/audio';

interface OperationsMapModalProps {
  saveData: SaveData;
  onSelectMission: (mission: MissionConfig) => void;
  onClose: () => void;
}

export const OperationsMapModal: React.FC<OperationsMapModalProps> = ({
  saveData,
  onSelectMission,
  onClose,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'GROUND' | 'AIR' | 'SEA' | 'INFINITE'>('ALL');

  const maxMission = Math.max(16, saveData.highestMission + 4);
  const missionsList: MissionConfig[] = [];
  for (let i = 1; i <= maxMission; i++) {
    missionsList.push(GameDirector.generateMission(i));
  }

  const handleLaunchInfinite = (mode: GameMode = 'GROUND') => {
    sound.playPowerUp();
    const infiniteMission = GameDirector.generateInfiniteMission(mode);
    onSelectMission(infiniteMission);
  };

  const filteredMissions = missionsList.filter((m) => {
    if (filter === 'GROUND') return m.gameMode === 'GROUND' && !m.theme.includes('SEA') && !m.theme.includes('OCEAN');
    if (filter === 'AIR') return m.gameMode === 'AIRCRAFT';
    if (filter === 'SEA') return m.theme.includes('SEA') || m.theme.includes('OCEAN') || m.theme.includes('COASTAL');
    return true;
  });

  return (
    <div 
      id="operations-map-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-4xl bg-black/70 border border-blue-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto max-h-[92vh] backdrop-blur-md">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-900/40 pb-4 mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center shrink-0">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                TACTICAL THEATRE // GLOBAL THREAT GRID
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                OPERATIONS MATRIX
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
            <button
              id="close-operations-button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Launch Banner: Infinite Survival Endless Mode */}
        <div className="mb-4 bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-cyan-950/60 border border-blue-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(59,130,246,0.15)] font-mono">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <InfinityIcon size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                INFINITE ENDLESS PROTOCOL
              </div>
              <div className="text-[10px] text-gray-400 font-sans">
                Procedural biomes (Ocean Carrier, Skyfire Air, Cyber Bridge, Secret Lab) with endless boss waves.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="launch-infinite-ground"
              onClick={() => handleLaunchInfinite('GROUND')}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-300 transition"
            >
              <Shield size={13} /> INFINITE LAND/SEA
            </button>
            <button
              id="launch-infinite-air"
              onClick={() => handleLaunchInfinite('AIRCRAFT')}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300 transition"
            >
              <Plane size={13} /> INFINITE AIR OPS
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            ALL OPERATIONS
          </button>
          <button
            onClick={() => setFilter('GROUND')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 transition ${
              filter === 'GROUND'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield size={13} /> GROUND
          </button>
          <button
            onClick={() => setFilter('SEA')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 transition ${
              filter === 'SEA'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Anchor size={13} /> NAVAL & SEA
          </button>
          <button
            onClick={() => setFilter('AIR')}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 transition ${
              filter === 'AIR'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Plane size={13} /> AIR DOGFIGHT
          </button>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-80 pr-1 font-mono">
          {filteredMissions.map((m) => {
            const isUnlocked = m.missionNumber <= saveData.highestMission;
            const isCompleted = m.missionNumber < saveData.highestMission;

            return (
              <div
                key={m.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white/5 border-white/10 hover:border-blue-500/50 shadow-md backdrop-blur-sm'
                    : 'bg-black/40 border-white/5 opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      OPERATION 0{m.missionNumber}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      m.threatLevel === 'EXTREME' || m.threatLevel === 'NIGHTFALL'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      THREAT: {m.threatLevel}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2 font-sans">
                    {m.gameMode === 'AIRCRAFT' ? <Plane size={16} className="text-cyan-400" /> : <Shield size={16} className="text-blue-400" />}
                    {m.codeName}
                  </h3>

                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-2.5">
                    <MapPin size={12} className="text-blue-400" /> {m.location}
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-2 text-[11px] text-gray-300 mb-3 space-y-0.5">
                    <div className="text-gray-400 flex justify-between">
                      <span>LZ DISTANCE:</span>
                      <span className="font-bold text-blue-400">{m.targetDistance}m</span>
                    </div>
                    {m.hasBoss && (
                      <div className="text-rose-400 font-semibold flex items-center gap-1">
                        <ShieldAlert size={12} /> BOSS: {m.bossName}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        sound.playPowerUp();
                        onSelectMission(m);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      <span>{isCompleted ? 'RE-RUN CONTRACT' : 'ENGAGE CONTRACT'}</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-white/5 text-gray-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/5">
                      <Lock size={14} /> CLASSIFIED • COMPLETE PRIOR OP
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
