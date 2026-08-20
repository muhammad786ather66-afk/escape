import React, { useEffect, useState } from 'react';
import { 
  RadioMessage, 
  CombatStats, 
  WeaponDef, 
  GameMode, 
  SpecialAbilityId 
} from '../types';
import { 
  Crosshair, 
  Shield, 
  Heart, 
  Radio, 
  Zap, 
  RotateCcw, 
  Sword, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Pause,
  AlertTriangle,
  Bot,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Infinity as InfinityIcon
} from 'lucide-react';
import { SPECIAL_ABILITIES } from '../game/weapons';

interface TacticalHUDProps {
  gameMode: GameMode;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  weapon: WeaponDef;
  abilityCharge: number;
  isAbilityActive: boolean;
  abilityDurationLeft: number;
  abilityId: SpecialAbilityId;
  stats: CombatStats;
  targetDistance: number;
  isInfinite?: boolean;
  currentSector?: number;
  autoPilot: boolean;
  hidePanelsDefault?: boolean;
  radioMessage: RadioMessage | null;
  bossInfo: { name: string; health: number; maxHealth: number; isAlive: boolean } | null;
  onToggleAutoPilot: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onMelee: () => void;
  onReload: () => void;
  onStartFiring: () => void;
  onStopFiring: () => void;
  onActivateAbility: () => void;
  onDeployFlares: () => void;
  onAltitudeUp: () => void;
  onAltitudeDown: () => void;
  onPause: () => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  gameMode,
  health,
  maxHealth,
  shield,
  maxShield,
  ammo,
  maxAmmo,
  isReloading,
  weapon,
  abilityCharge,
  isAbilityActive,
  abilityDurationLeft,
  abilityId,
  stats,
  targetDistance,
  isInfinite = false,
  currentSector = 1,
  autoPilot,
  hidePanelsDefault = false,
  radioMessage,
  bossInfo,
  onToggleAutoPilot,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  onMelee,
  onReload,
  onStartFiring,
  onStopFiring,
  onActivateAbility,
  onDeployFlares,
  onAltitudeUp,
  onAltitudeDown,
  onPause,
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [panelsVisible, setPanelsVisible] = useState<boolean>(!hidePanelsDefault);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const abilityDef = SPECIAL_ABILITIES[abilityId];

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e);
    }
  };

  // Touch Swipe Gesture Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) onMoveRight();
        else onMoveLeft();
      } else {
        if (dy < 0) {
          if (gameMode === 'AIRCRAFT') onAltitudeUp();
          else onJump();
        } else {
          if (gameMode === 'AIRCRAFT') onAltitudeDown();
          else onSlide();
        }
      }
    }
    setTouchStart(null);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // Toggle HUD panels
      if (e.key === 'h' || e.key === 'H') {
        setPanelsVisible((v) => !v);
        return;
      }
      // Toggle Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
        return;
      }
      // Toggle Auto-Pilot
      if (e.key === 'u' || e.key === 'U') {
        onToggleAutoPilot();
        return;
      }

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') onMoveLeft();
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') onMoveRight();
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
        if (gameMode === 'AIRCRAFT') onAltitudeUp();
        else onJump();
      }
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        if (gameMode === 'AIRCRAFT') onAltitudeDown();
        else onSlide();
      }
      if (e.key === 'r' || e.key === 'R') onReload();
      if (e.key === 'e' || e.key === 'E') onMelee();
      if (e.key === 'q' || e.key === 'Q') onActivateAbility();
      if (e.key === 'c' || e.key === 'C') onDeployFlares();
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') onPause();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, onToggleAutoPilot, onMoveLeft, onMoveRight, onJump, onSlide, onReload, onMelee, onActivateAbility, onDeployFlares, onAltitudeUp, onAltitudeDown, onPause]);

  const healthPct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const shieldPct = Math.max(0, Math.min(100, (shield / maxShield) * 100));
  const distPct = isInfinite 
    ? ((stats.distanceTraveled % 1000) / 1000) * 100
    : Math.max(0, Math.min(100, (stats.distanceTraveled / targetDistance) * 100));

  return (
    <div 
      id="tactical-hud"
      className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 overflow-hidden font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Immersive UI crosshair lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
      </div>

      {/* Floating Panel Toggle & Quick Controls Bar */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-2 pointer-events-auto z-30">
        {/* Fullscreen Button */}
        <button
          id="hud-fullscreen-btn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
          className="bg-black/70 hover:bg-white/10 text-gray-300 hover:text-white border border-blue-500/30 p-2 sm:p-2.5 rounded-xl transition shadow-lg backdrop-blur-md active:scale-95 flex items-center gap-1.5 text-xs font-mono"
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          <span className="hidden md:inline">{isFullscreen ? 'EXIT' : 'FULL'}</span>
        </button>

        {/* HUD Panels Visibility Toggle */}
        <button
          id="hud-visibility-btn"
          onClick={() => setPanelsVisible(!panelsVisible)}
          title="Toggle UI Panels (H)"
          className={`p-2 sm:p-2.5 rounded-xl border transition shadow-lg backdrop-blur-md active:scale-95 flex items-center gap-1.5 text-xs font-mono ${
            panelsVisible
              ? 'bg-black/70 text-blue-300 border-blue-500/40 hover:bg-blue-500/20'
              : 'bg-amber-500/30 text-amber-300 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
          }`}
        >
          {panelsVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          <span className="hidden sm:inline">{panelsVisible ? 'HUD [ON]' : 'PANELS HIDDEN (H)'}</span>
        </button>

        {/* Auto-Pilot Toggle Chip */}
        <button
          id="hud-autopilot-btn"
          onClick={onToggleAutoPilot}
          title="Toggle Auto-Pilot (U)"
          className={`px-3 py-2 rounded-xl border transition shadow-lg backdrop-blur-md active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold ${
            autoPilot 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-black/70 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200'
          }`}
        >
          <Bot size={15} className={autoPilot ? 'animate-pulse text-cyan-400' : ''} />
          <span>AUTO-RUN: {autoPilot ? 'ON' : 'OFF'}</span>
        </button>

        {/* Pause Button */}
        <button
          id="pause-button"
          onClick={onPause}
          className="bg-black/70 hover:bg-white/10 text-gray-300 hover:text-white border border-blue-500/30 p-2 sm:p-2.5 rounded-xl transition shadow-lg backdrop-blur-md active:scale-95"
        >
          <Pause size={16} />
        </button>
      </div>

      {/* --- TOP BAR: TELEMETRY & PROGRESS (Hidden when panelsVisible is false) --- */}
      {panelsVisible && (
        <div className="w-full flex items-start justify-between gap-3 pointer-events-auto z-10 animate-fade-in pr-48 sm:pr-64">
          {/* Operative Vitals Panel */}
          <div className="bg-black/75 backdrop-blur-md border border-blue-500/30 rounded-2xl p-3 shadow-[0_0_20px_rgba(59,130,246,0.15)] max-w-[260px] w-full">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-mono">
              <span className="flex items-center gap-1.5 font-bold tracking-wider text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6] animate-pulse"></span>
                {gameMode === 'AIRCRAFT' ? 'SPECTER-X JET' : 'AGENT MERCER'}
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                {isInfinite ? `SECTOR ${currentSector}` : `${gameMode} LINK`}
              </span>
            </div>

            {/* Health Bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[11px] font-mono font-semibold mb-0.5 text-rose-400">
                <span className="flex items-center gap-1"><Heart size={12} /> HULL / HP</span>
                <span>{Math.round(health)} / {maxHealth}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 shadow-[0_0_8px_#f43f5e] transition-all duration-150"
                  style={{ width: `${healthPct}%` }}
                ></div>
              </div>
            </div>

            {/* Shield Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono font-semibold mb-0.5 text-blue-400">
                <span className="flex items-center gap-1"><Shield size={12} /> AEGIS SHIELD</span>
                <span>{Math.round(shield)} / {maxShield}</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_#38bdf8] transition-all duration-150"
                  style={{ width: `${shieldPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Center: Mission / Infinite Survival Distance Bar */}
          <div className="flex-1 max-w-sm mx-auto text-center hidden md:block">
            <div className="bg-black/75 backdrop-blur-md border border-blue-900/40 rounded-2xl px-4 py-2 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-1">
                <span className="tracking-widest uppercase text-blue-400/90 flex items-center gap-1">
                  {isInfinite ? <InfinityIcon size={13} className="text-cyan-400" /> : null}
                  {isInfinite ? `SECTOR 0${currentSector} RUNWAY` : 'EXTRACTION LZ'}
                </span>
                <span className="text-white font-bold">
                  {stats.distanceTraveled}m {isInfinite ? '' : `/ ${targetDistance}m`}
                </span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_#3b82f6] transition-all duration-200"
                  style={{ width: `${distPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Score Counter */}
          <div className="bg-black/75 backdrop-blur-md border border-blue-900/40 rounded-2xl px-4 py-2 text-right font-mono hidden lg:block">
            <div className="text-[10px] text-blue-400 uppercase tracking-widest">SCORE</div>
            <div className="text-lg font-bold text-amber-400 tracking-tight">{stats.score.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* --- BOSS HEALTH TELEMETRY --- */}
      {bossInfo && bossInfo.isAlive && (
        <div className="w-full max-w-md mx-auto my-2 animate-scale-in pointer-events-auto z-10 font-mono">
          <div className="bg-red-950/85 backdrop-blur-md border border-red-500/60 rounded-2xl p-3 shadow-[0_0_25px_rgba(239,68,68,0.4)]">
            <div className="flex items-center justify-between text-xs text-red-300 font-bold mb-1 tracking-wider">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-red-400 animate-pulse" />
                HOSTILE TARGET // {bossInfo.name}
              </span>
              <span>{Math.round(bossInfo.health)} / {bossInfo.maxHealth}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-red-900">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_12px_#ef4444] transition-all duration-150"
                style={{ width: `${Math.max(0, (bossInfo.health / bossInfo.maxHealth) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* --- COMBO MULTIPLIER POPUP --- */}
      {panelsVisible && stats.combo > 1 && (
        <div className="absolute top-24 left-6 pointer-events-none animate-scale-in z-10 font-mono">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3.5 py-1.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] font-black tracking-tight flex items-center gap-1.5 border border-blue-300">
            <Flame size={18} className="text-amber-300 animate-bounce" />
            <span className="text-lg">x{stats.comboMultiplier} SYNC STREAK</span>
            <span className="text-xs ml-1 bg-black/40 px-2 py-0.5 rounded-md font-mono">+{stats.combo}</span>
          </div>
        </div>
      )}

      {/* --- RADIO INTEL COMMENTARY BANNER --- */}
      {radioMessage && (
        <div className="w-full max-w-lg mx-auto pointer-events-none animate-slide-up my-auto z-10 font-sans">
          <div className="bg-[#020305]/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-blue-400">
                <span>{radioMessage.callsign}</span>
                <span className="text-gray-500 text-[10px]">FREQ 142.85 MHz // ENCRYPTED</span>
              </div>
              <p className="text-sm font-medium text-white mt-1 leading-snug">
                "{radioMessage.text}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM CONTROLS & WEAPON HUD (Hidden when panelsVisible is false) --- */}
      {panelsVisible && (
        <div className="w-full flex items-end justify-between gap-3 pointer-events-auto mt-auto pt-2 z-10 font-mono animate-fade-in">
          {/* Left Touch Controls: Movement D-Pad */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              id="control-jump-up"
              onClick={gameMode === 'AIRCRAFT' ? onAltitudeUp : onJump}
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/70 hover:bg-blue-500/20 active:bg-blue-500/40 border border-blue-500/30 text-blue-300 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95 transition backdrop-blur-md"
            >
              <ChevronUp size={22} />
              <span className="text-[9px] font-bold tracking-wider">{gameMode === 'AIRCRAFT' ? 'ASCEND' : 'JUMP'}</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="control-move-left"
                onClick={onMoveLeft}
                className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/70 hover:bg-blue-500/20 active:bg-blue-500/40 border border-blue-500/30 text-blue-300 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95 transition backdrop-blur-md"
              >
                <ChevronLeft size={22} />
                <span className="text-[9px] font-bold tracking-wider">LEFT</span>
              </button>

              <button
                id="control-slide-down"
                onClick={gameMode === 'AIRCRAFT' ? onAltitudeDown : onSlide}
                className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/70 hover:bg-blue-500/20 active:bg-blue-500/40 border border-blue-500/30 text-blue-300 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95 transition backdrop-blur-md"
              >
                <ChevronDown size={22} />
                <span className="text-[9px] font-bold tracking-wider">{gameMode === 'AIRCRAFT' ? 'DESCEND' : 'SLIDE'}</span>
              </button>

              <button
                id="control-move-right"
                onClick={onMoveRight}
                className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-black/70 hover:bg-blue-500/20 active:bg-blue-500/40 border border-blue-500/30 text-blue-300 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95 transition backdrop-blur-md"
              >
                <ChevronRight size={22} />
                <span className="text-[9px] font-bold tracking-wider">RIGHT</span>
              </button>
            </div>
          </div>

          {/* Center: Ammo & Weapon Info */}
          <div className="bg-black/75 backdrop-blur-md border border-blue-900/40 rounded-2xl p-3 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-center min-w-[130px] max-w-[190px]">
            <div className="text-[10px] text-blue-400/80 uppercase tracking-widest font-semibold truncate">
              {weapon.name}
            </div>
            <div className="flex items-baseline justify-center gap-1 my-1">
              <span className="text-2xl font-black text-white">{isReloading ? '--' : ammo}</span>
              <span className="text-xs text-gray-500 font-bold">/ {maxAmmo}</span>
            </div>

            <button
              id="reload-button"
              onClick={onReload}
              disabled={isReloading || ammo >= maxAmmo}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                isReloading 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-white/5 hover:bg-blue-500/20 text-gray-300 hover:text-white border-white/10 active:scale-95'
              }`}
            >
              <RotateCcw size={12} className={isReloading ? 'animate-spin' : ''} />
              {isReloading ? 'RELOADING...' : 'RELOAD (R)'}
            </button>
          </div>

          {/* Right Touch Controls: Actions & Trigger */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {/* Special Ability Button */}
              <button
                id="special-ability-button"
                onClick={onActivateAbility}
                disabled={abilityCharge < 100 && !isAbilityActive}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex flex-col items-center justify-center shadow-lg transition backdrop-blur-md active:scale-95 relative overflow-hidden ${
                  isAbilityActive
                    ? 'bg-amber-500 text-black border-amber-300 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : abilityCharge >= 100
                    ? 'bg-blue-600 text-white border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-2 ring-blue-400'
                    : 'bg-black/60 text-gray-500 border-white/10'
                }`}
              >
                <Zap size={20} />
                <span className="text-[9px] font-black tracking-wider">
                  {isAbilityActive ? `${abilityDurationLeft.toFixed(1)}s` : `${Math.round(abilityCharge)}%`}
                </span>
                {!isAbilityActive && abilityCharge < 100 && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500/30 pointer-events-none"
                    style={{ height: `${abilityCharge}%` }}
                  ></div>
                )}
              </button>

              {/* Melee / Flares */}
              {gameMode === 'AIRCRAFT' ? (
                <button
                  id="flare-button"
                  onClick={onDeployFlares}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-black/70 hover:bg-orange-500/20 active:bg-orange-500/40 border border-orange-500/40 text-orange-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)] active:scale-95 transition backdrop-blur-md"
                >
                  <Sparkles size={20} />
                  <span className="text-[9px] font-bold tracking-wider">FLARES</span>
                </button>
              ) : (
                <button
                  id="melee-button"
                  onClick={onMelee}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-black/70 hover:bg-rose-500/20 active:bg-rose-500/40 border border-rose-500/40 text-rose-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.15)] active:scale-95 transition backdrop-blur-md"
                >
                  <Sword size={20} />
                  <span className="text-[9px] font-bold tracking-wider">MELEE</span>
                </button>
              )}
            </div>

            {/* Primary Trigger / Fire Button */}
            <button
              id="fire-trigger-button"
              onMouseDown={onStartFiring}
              onMouseUp={onStopFiring}
              onTouchStart={onStartFiring}
              onTouchEnd={onStopFiring}
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white border-2 border-blue-300 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-90 transition select-none cursor-pointer"
            >
              <Crosshair size={28} className="animate-spin-slow" />
              <span className="text-[11px] font-black tracking-widest mt-0.5">FIRE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
