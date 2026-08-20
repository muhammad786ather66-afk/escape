import React, { useState } from 'react';
import { Users, X, Check, Shield, Zap, Sparkles, Shuffle } from 'lucide-react';
import { ALL_COUNTRYBALLS } from '../game/countryballsData';
import { CountryballDef } from '../types';

interface RosterModalProps {
  selectedIds: string[];
  onUpdateSelectedIds: (ids: string[]) => void;
  onClose: () => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  selectedIds,
  onUpdateSelectedIds,
  onClose,
}) => {
  const [activeBall, setActiveBall] = useState<CountryballDef>(ALL_COUNTRYBALLS[0]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 4) {
        alert('You must keep at least 4 Countryballs selected for a race!');
        return;
      }
      onUpdateSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      onUpdateSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    onUpdateSelectedIds(ALL_COUNTRYBALLS.map((c) => c.id));
  };

  const handleRandom16 = () => {
    const shuffled = ALL_COUNTRYBALLS.slice().sort(() => Math.random() - 0.5).slice(0, 16);
    onUpdateSelectedIds(shuffled.map((c) => c.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900/95 border border-white/15 rounded-3xl p-5 sm:p-7 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                COUNTRYBALLS RACER ROSTER
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                {selectedIds.length} of {ALL_COUNTRYBALLS.length} Racers Active in Rotation
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

        {/* Action Controls (Select All, Random 16) */}
        <div className="flex items-center justify-between py-3">
          <div className="text-xs text-gray-400 font-mono">
            Click any Countryball to inspect traits or toggle race participation:
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandom16}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-gray-200 transition cursor-pointer"
            >
              <Shuffle size={14} />
              <span>Random 16</span>
            </button>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-white transition cursor-pointer shadow"
            >
              <Check size={14} />
              <span>Select All</span>
            </button>
          </div>
        </div>

        {/* Content Split: Left Gallery, Right Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
          {/* Countryball Cards Grid */}
          <div className="md:col-span-2 overflow-y-auto pr-1 space-y-2 max-h-[50vh] md:max-h-[58vh] custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_COUNTRYBALLS.map((ball) => {
              const isSelected = selectedIds.includes(ball.id);
              const isActive = activeBall.id === ball.id;

              return (
                <div
                  key={ball.id}
                  onClick={() => setActiveBall(ball)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : isSelected
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-black/40 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{ball.flagCode}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(ball.id);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-transparent border border-white/20'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="font-bold text-sm text-white">{ball.name}</div>
                    <div className="text-[10px] font-mono text-gray-400 truncate">{ball.specialTrait}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Inspector Panel */}
          <div className="bg-slate-950/70 rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl">{activeBall.flagCode}</span>
                <div>
                  <h3 className="text-2xl font-black text-white">{activeBall.name}</h3>
                  <span className="text-xs text-blue-400 font-mono font-bold tracking-wider uppercase">
                    {activeBall.personality}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-4">{activeBall.description}</p>

              {/* Special Trait Box */}
              <div className="bg-blue-500/15 border border-blue-400/30 rounded-xl p-2.5 mb-4 text-xs">
                <div className="font-mono font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} />
                  <span>SPECIAL TRAIT</span>
                </div>
                <div className="text-gray-200">{activeBall.specialTrait}</div>
              </div>

              {/* Physics Stats Gauges */}
              <div className="space-y-2 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>TOP SPEED</span>
                    <span className="text-white">{(activeBall.topSpeed * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${(activeBall.topSpeed / 1.3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>BOUNCINESS</span>
                    <span className="text-white">{(activeBall.restitution * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-400 rounded-full"
                      style={{ width: `${(activeBall.restitution / 1.0) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>WEIGHT / MASS</span>
                    <span className="text-white">{(activeBall.mass * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(activeBall.mass / 1.3) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>TRACTION & GRIP</span>
                    <span className="text-white">{(activeBall.grip * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${(activeBall.grip / 1.3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleSelect(activeBall.id)}
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition cursor-pointer mt-4 ${
                selectedIds.includes(activeBall.id)
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'
              }`}
            >
              {selectedIds.includes(activeBall.id) ? 'Exclude from Race' : 'Include in Race'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
