import React from 'react';
import { Play, RotateCcw, Home, Settings, Pause } from 'lucide-react';
import { sound } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
  return (
    <div 
      id="pause-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/90 backdrop-blur-xl flex items-center justify-center p-4 font-sans select-none"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="w-full max-w-sm bg-black/60 border border-blue-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.25)] text-center space-y-4 backdrop-blur-md">
        
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-white mx-auto">
          <Pause size={22} />
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">
            TACTICAL HOLD // FEED SUSPENDED
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            OPERATION PAUSED
          </h2>
        </div>

        <div className="space-y-2.5 pt-2 font-mono">
          <button
            id="pause-resume-button"
            onClick={() => {
              sound.playRadioSquelch();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition cursor-pointer border border-blue-400/50"
          >
            <Play size={16} className="fill-current" /> RESUME OPERATION
          </button>

          <button
            id="pause-restart-button"
            onClick={() => {
              sound.playRadioSquelch();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 hover:border-blue-500/40 active:scale-95 transition"
          >
            <RotateCcw size={16} /> RE-ENGAGE MISSION
          </button>

          <button
            id="pause-settings-button"
            onClick={() => {
              sound.playRadioSquelch();
              onSettings();
            }}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 hover:border-blue-500/40 active:scale-95 transition"
          >
            <Settings size={16} /> SETTINGS
          </button>

          <button
            id="pause-quit-button"
            onClick={() => {
              sound.playRadioSquelch();
              onMainMenu();
            }}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 border border-white/5 hover:border-rose-900/50 transition"
          >
            <Home size={16} /> ABORT TO COMMAND DECK
          </button>
        </div>
      </div>
    </div>
  );
};
