import React from 'react';
import { SaveData, Achievement } from '../types';
import { X, Trophy, CheckCircle, Lock, Sparkles, Award } from 'lucide-react';
import { sound } from '../game/audio';

interface AchievementsModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  saveData,
  onClose,
}) => {
  return (
    <div 
      id="achievements-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-2xl bg-black/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto max-h-[90vh] backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Award size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase flex items-center gap-1.5">
                DOSSIER // FIELD COMMENDATIONS
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                OPERATIVE RECORDS
              </h2>
            </div>
          </div>

          <button
            id="close-achievements-button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* List (Immersive UI Style) */}
        <div className="space-y-3 overflow-y-auto max-h-96 pr-1 font-mono">
          {saveData.achievements.map((ach) => {
            const isDone = ach.progress >= ach.maxProgress;
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-blue-600/10 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isDone 
                      ? 'bg-blue-600/20 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                      : 'bg-black/40 border-white/10 text-gray-600'
                  }`}>
                    {isDone ? <CheckCircle size={20} /> : <Lock size={20} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-sans">{ach.title}</h4>
                      {isDone && (
                        <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.2 rounded shadow-[0_0_6px_#3b82f6]">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-sans">{ach.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-32 bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_6px_#3b82f6]" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{ach.progress} / {ach.maxProgress}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">BOUNTY</div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <span>◈</span> {ach.rewardCredits}
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
