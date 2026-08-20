import React, { useEffect, useState } from 'react';
import { MissionConfig } from '../types';
import { ShieldAlert, Crosshair, MapPin, Target, ChevronRight, FileText, Radio, Activity } from 'lucide-react';
import { sound } from '../game/audio';

interface MissionBriefingModalProps {
  mission: MissionConfig;
  onStartMission: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  mission,
  onStartMission,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    sound.speakRadioVoice(`Agent Mercer. Mission ${mission.missionNumber}. ${mission.codeName}. Prepare for immediate deployment.`);
  }, [mission]);

  const handleLaunch = () => {
    setCountdown(3);
    sound.playPowerUp();
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onStartMission();
          return null;
        }
        sound.playRadioSquelch();
        return prev - 1;
      });
    }, 800);
  };

  return (
    <div 
      id="mission-briefing-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      {/* Ambience Lighting */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-xl bg-black/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto backdrop-blur-md">
        
        {/* Header Classification Stamp */}
        <div>
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6] animate-ping"></div>
              <span className="text-xs font-mono font-bold text-blue-400 tracking-widest uppercase">
                MISSION BRIEFING // NIGHTFALL HQ
              </span>
            </div>
            <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md tracking-wider">
              {mission.classification}
            </span>
          </div>

          {/* Operation Code & Location */}
          <div className="mb-6">
            <div className="text-[11px] text-gray-400 font-mono uppercase tracking-widest mb-1">
              MISSION 0{mission.missionNumber} // {mission.gameMode} DEPLOYMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              {mission.codeName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 mt-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <MapPin size={14} /> {mission.location}
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <ShieldAlert size={14} /> THREAT: {mission.threatLevel}
              </span>
              <span className="text-gray-500">
                LZ DISTANCE: {mission.targetDistance}m
              </span>
            </div>
          </div>

          {/* Intel Summary (Immersive UI Style) */}
          <div className="bg-white/5 border border-blue-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 mb-2">
              <FileText size={14} /> TACTICAL INTEL DIRECTIVE
            </div>
            <p className="text-sm text-gray-200 leading-relaxed font-sans">
              "{mission.briefing}"
            </p>
          </div>

          {/* Mission Objectives */}
          <div className="mb-6">
            <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Target size={14} className="text-blue-400" /> PRIMARY DIRECTIVES
            </div>
            <div className="space-y-2">
              {mission.objectives.map((obj, i) => (
                <div key={i} className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3 text-xs">
                  <span className="text-gray-200">{obj.description}</span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded font-mono font-bold">
                    REQ: {obj.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button / Countdown */}
        <div className="pt-2">
          {countdown !== null ? (
            <div className="w-full py-5 rounded-2xl bg-blue-600 text-white font-mono font-bold text-2xl text-center shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse">
              INITIALIZING SYNC IN {countdown}...
            </div>
          ) : (
            <button
              id="launch-mission-button"
              onClick={handleLaunch}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-blue-400/50 transition cursor-pointer"
            >
              <span>ENGAGE INFILTRATION</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
