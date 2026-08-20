import React, { useState } from 'react';
import { WeaponId, WeaponDef, SaveData } from '../types';
import { WEAPONS_DATABASE } from '../game/weapons';
import { SaveManager } from '../game/saveManager';
import { X, Crosshair, Zap, Check, Lock, Volume2, ShieldAlert } from 'lucide-react';
import { sound } from '../game/audio';

interface ArsenalModalProps {
  saveData: SaveData;
  onUpdateSave: (newData: SaveData) => void;
  onClose: () => void;
}

export const ArsenalModal: React.FC<ArsenalModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(saveData.equippedWeapon);

  const weaponsList = Object.values(WEAPONS_DATABASE);
  const selectedWeapon = WEAPONS_DATABASE[selectedWeaponId];
  const isUnlocked = saveData.unlockedWeapons.includes(selectedWeaponId);
  const isEquipped = saveData.equippedWeapon === selectedWeaponId;

  const stats = SaveManager.getWeaponEffectiveStats(selectedWeaponId, saveData.upgrades);

  const handleEquip = () => {
    if (!isUnlocked) return;
    sound.playReload();
    const updated = {
      ...saveData,
      equippedWeapon: selectedWeaponId,
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleUnlock = () => {
    if (isUnlocked || saveData.credits < selectedWeapon.cost) return;
    sound.playPowerUp();
    const updated: SaveData = {
      ...saveData,
      credits: saveData.credits - selectedWeapon.cost,
      unlockedWeapons: [...saveData.unlockedWeapons, selectedWeaponId],
      equippedWeapon: selectedWeaponId,
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleTestSound = () => {
    sound.playGunshot(
      selectedWeaponId === 'TACTICAL_SMG' ? 'SMG' :
      selectedWeaponId === 'HEAVY_SHOTGUN' ? 'SHOTGUN' :
      selectedWeaponId === 'SNIPER_RIFLE' ? 'SNIPER' :
      selectedWeaponId === 'PLASMA_CANNON' ? 'PLASMA' :
      selectedWeaponId === 'ROCKET_LAUNCHER' ? 'ROCKET' :
      selectedWeaponId === 'MINIGUN' ? 'MINIGUN' : 'RIFLE'
    );
  };

  return (
    <div 
      id="arsenal-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-4xl bg-black/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto max-h-[90vh] backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Crosshair size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">
                WEAPONS MATRIX // ARMORY LAB
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                TACTICAL ARSENAL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <span>◈</span> {saveData.credits.toLocaleString()} CREDITS
            </div>
            <button
              id="close-arsenal-button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content: List + Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto pr-1">
          {/* Weapon Selector List */}
          <div className="md:col-span-5 space-y-2 max-h-72 md:max-h-96 overflow-y-auto">
            {weaponsList.map((wp) => {
              const unlocked = saveData.unlockedWeapons.includes(wp.id);
              const equipped = saveData.equippedWeapon === wp.id;
              const selected = selectedWeaponId === wp.id;

              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    setSelectedWeaponId(wp.id);
                    sound.playRadioSquelch();
                  }}
                  className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between font-mono ${
                    selected
                      ? 'bg-blue-500/15 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-blue-400/80 font-bold truncate">{wp.category}</div>
                    <div className="text-sm font-bold text-white truncate">{wp.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {equipped && (
                      <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded shadow-[0_0_6px_#3b82f6]">
                        EQUIPPED
                      </span>
                    )}
                    {!unlocked && (
                      <span className="text-gray-500">
                        <Lock size={15} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Weapon Inspector Card (Immersive UI Style) */}
          <div className="md:col-span-7 bg-white/5 border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">{selectedWeapon.category}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedWeapon.name}</h3>
                </div>
                <button
                  id="test-fire-button"
                  onClick={handleTestSound}
                  className="p-2 rounded-xl bg-black/40 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 text-xs font-mono font-bold transition active:scale-95"
                >
                  <Volume2 size={15} /> ACOUSTIC TEST
                </button>
              </div>

              <p className="text-xs text-gray-300 font-sans leading-relaxed mb-5">
                {selectedWeapon.description}
              </p>

              {/* Specs Bars */}
              <div className="space-y-3 text-xs font-mono mb-6">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>FIREPOWER / BURST DAMAGE</span>
                    <span className="text-rose-400 font-bold">{stats.damage} DMG</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full shadow-[0_0_6px_#f43f5e]" style={{ width: `${Math.min(100, (stats.damage / 300) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>CYCLIC RATE OF FIRE</span>
                    <span className="text-amber-400 font-bold">{stats.fireRate} rps</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_6px_#fbbf24]" style={{ width: `${Math.min(100, (stats.fireRate / 20) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>MAGAZINE CAPACITY</span>
                    <span className="text-blue-400 font-bold">{stats.magSize} ROUNDS</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_6px_#38bdf8]" style={{ width: `${Math.min(100, (stats.magSize / 120) * 100)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>TACTICAL CYCLE / RELOAD TIME</span>
                    <span className="text-emerald-400 font-bold">{stats.reloadTime}s</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" style={{ width: `${Math.max(10, (1 - stats.reloadTime / 4) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equip or Unlock Button */}
            <div>
              {isUnlocked ? (
                <button
                  id="equip-weapon-button"
                  onClick={handleEquip}
                  disabled={isEquipped}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    isEquipped
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5 font-mono'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer font-mono'
                  }`}
                >
                  <Check size={18} />
                  {isEquipped ? 'CURRENTLY EQUIPPED' : 'EQUIP WEAPON'}
                </button>
              ) : (
                <button
                  id="unlock-weapon-button"
                  onClick={handleUnlock}
                  disabled={saveData.credits < selectedWeapon.cost}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition font-mono ${
                    saveData.credits >= selectedWeapon.cost
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Lock size={18} />
                  UNLOCK FOR ◈ {selectedWeapon.cost.toLocaleString()} CREDITS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
