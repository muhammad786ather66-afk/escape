import React, { useState } from 'react';
import { SaveData, UpgradeTree, WeaponId } from '../types';
import { SaveManager } from '../game/saveManager';
import { WEAPONS_DATABASE } from '../game/weapons';
import { X, Shield, Heart, Zap, Crosshair, Plane, Sparkles, Check, ChevronUp, Cpu } from 'lucide-react';
import { sound } from '../game/audio';

interface UpgradesModalProps {
  saveData: SaveData;
  onUpdateSave: (newData: SaveData) => void;
  onClose: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'OPERATIVE' | 'WEAPONS' | 'AIRCRAFT'>('OPERATIVE');
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(saveData.equippedWeapon);

  const upgrades = saveData.upgrades;

  const calculateCost = (currentLvl: number) => {
    return Math.floor(400 * Math.pow(1.5, currentLvl));
  };

  const handleUpgradeOperative = (key: keyof Pick<UpgradeTree, 'maxHealthLevel' | 'shieldLevel' | 'critChanceLevel' | 'meleeDamageLevel' | 'creditBonusLevel'>) => {
    const cost = calculateCost(upgrades[key]);
    if (saveData.credits < cost || upgrades[key] >= 10) return;

    sound.playPowerUp();
    const updated: SaveData = {
      ...saveData,
      credits: saveData.credits - cost,
      upgrades: {
        ...upgrades,
        [key]: upgrades[key] + 1,
      },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleUpgradeWeapon = (type: 'damage' | 'mag' | 'reload') => {
    const mapKey = type === 'damage' ? 'weaponDamageLevels' : type === 'mag' ? 'weaponMagLevels' : 'weaponReloadLevels';
    const currentLvl = upgrades[mapKey][selectedWeaponId] || 0;
    const cost = calculateCost(currentLvl);
    if (saveData.credits < cost || currentLvl >= 10) return;

    sound.playPowerUp();
    const updated: SaveData = {
      ...saveData,
      credits: saveData.credits - cost,
      upgrades: {
        ...upgrades,
        [mapKey]: {
          ...upgrades[mapKey],
          [selectedWeaponId]: currentLvl + 1,
        },
      },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleUpgradeAircraft = (key: keyof Pick<UpgradeTree, 'jetArmorLevel' | 'jetSpeedLevel' | 'missileCapacityLevel' | 'flareCooldownLevel'>) => {
    const cost = calculateCost(upgrades[key]);
    if (saveData.credits < cost || upgrades[key] >= 10) return;

    sound.playPowerUp();
    const updated: SaveData = {
      ...saveData,
      credits: saveData.credits - cost,
      upgrades: {
        ...upgrades,
        [key]: upgrades[key] + 1,
      },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  return (
    <div 
      id="upgrades-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-3xl bg-black/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto max-h-[90vh] backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Cpu size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">
                NEURAL LAB // ENHANCEMENT ENGINE
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                COMBAT UPGRADES
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="bg-black/50 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>◈</span> {saveData.credits.toLocaleString()} CREDITS
            </div>
            <button
              id="close-upgrades-button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs (Immersive UI Style) */}
        <div className="grid grid-cols-3 gap-2 mb-6 font-mono">
          <button
            onClick={() => setTab('OPERATIVE')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              tab === 'OPERATIVE' 
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
            }`}
          >
            <Shield size={16} /> OPERATIVE SUIT
          </button>
          <button
            onClick={() => setTab('WEAPONS')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              tab === 'WEAPONS' 
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
            }`}
          >
            <Crosshair size={16} /> WEAPON LAB
          </button>
          <button
            onClick={() => setTab('AIRCRAFT')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              tab === 'AIRCRAFT' 
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
            }`}
          >
            <Plane size={16} /> STEALTH JET
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-96 pr-1 space-y-3 font-mono">
          {tab === 'OPERATIVE' && (
            <div className="space-y-2.5">
              {[
                { key: 'maxHealthLevel', title: 'Carbon Nanofiber Weave', desc: '+20 Max Operative Health', icon: Heart, color: 'text-rose-400' },
                { key: 'shieldLevel', title: 'Aegis Deflector Battery', desc: '+15 Max Kinetic Shield Buffer', icon: Shield, color: 'text-blue-400' },
                { key: 'critChanceLevel', title: 'Thermal Targeting Sensor', desc: '+4% Critical Headshot Chance', icon: Zap, color: 'text-amber-400' },
                { key: 'meleeDamageLevel', title: 'Pneumatic Exoskeleton', desc: '+25 Close Melee Damage', icon: Crosshair, color: 'text-orange-400' },
                { key: 'creditBonusLevel', title: 'Black-Ops Intel Extractor', desc: '+15% Bonus Credits per Mission', icon: Sparkles, color: 'text-emerald-400' },
              ].map((item) => {
                const lvl = upgrades[item.key as keyof UpgradeTree] as number;
                const cost = calculateCost(lvl);
                const canAfford = saveData.credits >= cost && lvl < 10;

                return (
                  <div key={item.key} className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${item.color}`}>
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.title}</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.2 rounded font-bold">
                            LVL {lvl}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeOperative(item.key as any)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        lvl >= 10
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                          : canAfford
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 cursor-pointer'
                          : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp size={14} />
                      {lvl >= 10 ? 'MAXED' : `◈ ${cost.toLocaleString()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'WEAPONS' && (
            <div className="space-y-4">
              {/* Select Weapon */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {saveData.unlockedWeapons.map((wpId) => {
                  const wp = WEAPONS_DATABASE[wpId];
                  return (
                    <button
                      key={wpId}
                      onClick={() => setSelectedWeaponId(wpId)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition border ${
                        selectedWeaponId === wpId
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {wp.name}
                    </button>
                  );
                })}
              </div>

              {/* Upgrades for selected weapon */}
              {[
                { type: 'damage', title: 'High-Grain Munitions', desc: '+15% Bullet Damage', map: 'weaponDamageLevels' },
                { type: 'mag', title: 'Extended Polymer Magazine', desc: '+20% Magazine Capacity', map: 'weaponMagLevels' },
                { type: 'reload', title: 'Flared Magwell & Speed Bolt', desc: '-8% Reload Duration', map: 'weaponReloadLevels' },
              ].map((item) => {
                const mapKey = item.map as 'weaponDamageLevels' | 'weaponMagLevels' | 'weaponReloadLevels';
                const lvl = upgrades[mapKey][selectedWeaponId] || 0;
                const cost = calculateCost(lvl);
                const canAfford = saveData.credits >= cost && lvl < 10;

                return (
                  <div key={item.type} className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.title}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.2 rounded font-bold">
                          LVL {lvl}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-sans">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleUpgradeWeapon(item.type as any)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        lvl >= 10
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                          : canAfford
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 cursor-pointer'
                          : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp size={14} />
                      {lvl >= 10 ? 'MAXED' : `◈ ${cost.toLocaleString()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'AIRCRAFT' && (
            <div className="space-y-2.5">
              {[
                { key: 'jetArmorLevel', title: 'Titanium-Composite Airframe', desc: '+40 Jet Hull Armor', icon: Shield },
                { key: 'jetSpeedLevel', title: 'Dual Turbofan Afterburners', desc: '+8% Flight Velocity', icon: Plane },
                { key: 'missileCapacityLevel', title: 'Internal Rotary Weapons Bay', desc: '+2 Air-to-Air Missiles', icon: Crosshair },
                { key: 'flareCooldownLevel', title: 'Rapid-Deploy Chaff Countermeasures', desc: '-1.0s Flare Cooldown', icon: Sparkles },
              ].map((item) => {
                const lvl = upgrades[item.key as keyof UpgradeTree] as number;
                const cost = calculateCost(lvl);
                const canAfford = saveData.credits >= cost && lvl < 10;

                return (
                  <div key={item.key} className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-4 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-blue-400">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.title}</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.2 rounded font-bold">
                            LVL {lvl}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeAircraft(item.key as any)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        lvl >= 10
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                          : canAfford
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 cursor-pointer'
                          : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp size={14} />
                      {lvl >= 10 ? 'MAXED' : `◈ ${cost.toLocaleString()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
