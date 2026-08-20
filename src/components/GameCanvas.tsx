import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  MissionConfig, 
  CombatStats, 
  RadioMessage, 
  SaveData 
} from '../types';
import { ThreeGameEngine } from '../game/threeEngine';
import { SaveManager } from '../game/saveManager';
import { WEAPONS_DATABASE } from '../game/weapons';
import { GameDirector } from '../game/gameDirector';
import { TacticalHUD } from './TacticalHUD';
import { PauseModal } from './PauseModal';
import { sound } from '../game/audio';

interface GameCanvasProps {
  mission: MissionConfig;
  saveData: SaveData;
  onMissionFinished: (victory: boolean, stats: CombatStats, earnedCredits: number, earnedXP: number) => void;
  onAbortToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mission,
  saveData,
  onMissionFinished,
  onAbortToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeGameEngine | null>(null);

  // HUD Reactive States
  const [health, setHealth] = useState<number>(100);
  const [maxHealth, setMaxHealth] = useState<number>(100);
  const [shield, setShield] = useState<number>(50);
  const [maxShield, setMaxShield] = useState<number>(50);
  const [ammo, setAmmo] = useState<number>(30);
  const [maxAmmo, setMaxAmmo] = useState<number>(30);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [abilityCharge, setAbilityCharge] = useState<number>(100);
  const [isAbilityActive, setIsAbilityActive] = useState<boolean>(false);
  const [abilityDurationLeft, setAbilityDurationLeft] = useState<number>(0);
  const [autoPilot, setAutoPilotState] = useState<boolean>(saveData.settings.autoPilot ?? true);
  const [currentSector, setCurrentSector] = useState<number>(1);
  const [stats, setStats] = useState<CombatStats>({
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    kills: 0,
    headshots: 0,
    perfectDodges: 0,
    damageTaken: 0,
    damageDealt: 0,
    accuracyShots: 0,
    accuracyHits: 0,
    distanceTraveled: 0,
    timeElapsed: 0,
  });
  const [radioMessage, setRadioMessage] = useState<RadioMessage | null>(null);
  const [bossInfo, setBossInfo] = useState<{ name: string; health: number; maxHealth: number; isAlive: boolean } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Radio Trigger Handler with cooldown
  const handleRadioTrigger = useCallback((type: any) => {
    const msg = GameDirector.getRadioDialogue(type);
    setRadioMessage(msg);
    sound.speakRadioVoice(msg.text);
    setTimeout(() => {
      setRadioMessage((curr) => (curr?.id === msg.id ? null : curr));
    }, msg.duration * 1000);
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const currentWeaponDef = WEAPONS_DATABASE[saveData.equippedWeapon];
    const suitStats = SaveManager.getPlayerSuitStats(saveData.upgrades);

    const engine = new ThreeGameEngine(
      containerRef.current,
      {
        onScoreUpdate: (newStats) => {
          setStats(newStats);
          if (engineRef.current) {
            setCurrentSector(engineRef.current.currentSector);
          }
        },
        onHealthUpdate: (hp, maxHp, sh, maxSh) => {
          setHealth(hp);
          setMaxHealth(maxHp);
          setShield(sh);
          setMaxShield(maxSh);
        },
        onAmmoUpdate: (currAmmo, maxA, reloading) => {
          setAmmo(currAmmo);
          setMaxAmmo(maxA);
          setIsReloading(reloading);
        },
        onAbilityUpdate: (charge, active, dur) => {
          setAbilityCharge(charge);
          setIsAbilityActive(active);
          setAbilityDurationLeft(dur);
        },
        onBossHealthUpdate: (name, bHp, bMaxHp, isAlive) => {
          setBossInfo({ name, health: bHp, maxHealth: bMaxHp, isAlive });
        },
        onRadioTrigger: handleRadioTrigger,
        onMissionComplete: (victory, finalStats) => {
          const earnedCredits = victory ? mission.rewardCredits : Math.floor(mission.rewardCredits * 0.25);
          const earnedXP = victory ? mission.rewardXP : Math.floor(mission.rewardXP * 0.25);
          onMissionFinished(victory, finalStats, earnedCredits, earnedXP);
        },
      },
      saveData.settings.graphicsQuality
    );

    engine.setAutoPilot(autoPilot);

    engine.configureMission(
      mission.theme,
      mission.weather,
      mission.gameMode,
      mission.targetDistance,
      currentWeaponDef,
      saveData.equippedAbility,
      suitStats,
      mission.isInfinite
    );

    engine.start();
    engineRef.current = engine;

    // Trigger Initial Radio Message
    handleRadioTrigger('MISSION_START');

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [mission, saveData, handleRadioTrigger, onMissionFinished]);

  // Toggle Auto-Pilot
  const handleToggleAutoPilot = () => {
    sound.playRadioSquelch();
    const nextVal = !autoPilot;
    setAutoPilotState(nextVal);
    if (engineRef.current) {
      engineRef.current.setAutoPilot(nextVal);
    }
  };

  // Player input wrappers
  const handleMoveLeft = () => engineRef.current?.moveLane(-1);
  const handleMoveRight = () => engineRef.current?.moveLane(1);
  const handleJump = () => engineRef.current?.jump();
  const handleSlide = () => engineRef.current?.slide();
  const handleMelee = () => engineRef.current?.meleeAttack();
  const handleReload = () => engineRef.current?.reload();
  const handleStartFiring = () => engineRef.current?.startFiring();
  const handleStopFiring = () => engineRef.current?.stopFiring();
  const handleActivateAbility = () => engineRef.current?.activateSpecialAbility();
  const handleDeployFlares = () => engineRef.current?.deployFlares();
  const handleAltitudeUp = () => engineRef.current?.adjustJetAltitude(1.5);
  const handleAltitudeDown = () => engineRef.current?.adjustJetAltitude(-1.5);

  const handlePause = () => {
    setIsPaused(true);
    engineRef.current?.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    engineRef.current?.resumeGame();
  };

  const handleRestart = () => {
    setIsPaused(false);
    if (engineRef.current) {
      const currentWeaponDef = WEAPONS_DATABASE[saveData.equippedWeapon];
      const suitStats = SaveManager.getPlayerSuitStats(saveData.upgrades);
      engineRef.current.configureMission(
        mission.theme,
        mission.weather,
        mission.gameMode,
        mission.targetDistance,
        currentWeaponDef,
        saveData.equippedAbility,
        suitStats,
        mission.isInfinite
      );
      engineRef.current.resumeGame();
    }
  };

  return (
    <div id="game-canvas-container" className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

      {/* In-Game Tactical HUD */}
      {!isPaused && (
        <TacticalHUD
          gameMode={mission.gameMode}
          health={health}
          maxHealth={maxHealth}
          shield={shield}
          maxShield={maxShield}
          ammo={ammo}
          maxAmmo={maxAmmo}
          isReloading={isReloading}
          weapon={WEAPONS_DATABASE[saveData.equippedWeapon]}
          abilityCharge={abilityCharge}
          isAbilityActive={isAbilityActive}
          abilityDurationLeft={abilityDurationLeft}
          abilityId={saveData.equippedAbility}
          stats={stats}
          targetDistance={mission.targetDistance}
          isInfinite={mission.isInfinite}
          currentSector={currentSector}
          autoPilot={autoPilot}
          hidePanelsDefault={saveData.settings.hidePanels}
          radioMessage={radioMessage}
          bossInfo={bossInfo}
          onToggleAutoPilot={handleToggleAutoPilot}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onJump={handleJump}
          onSlide={handleSlide}
          onMelee={handleMelee}
          onReload={handleReload}
          onStartFiring={handleStartFiring}
          onStopFiring={handleStopFiring}
          onActivateAbility={handleActivateAbility}
          onDeployFlares={handleDeployFlares}
          onAltitudeUp={handleAltitudeUp}
          onAltitudeDown={handleAltitudeDown}
          onPause={handlePause}
        />
      )}

      {/* In-Game Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onSettings={() => {}}
          onMainMenu={onAbortToMenu}
        />
      )}
    </div>
  );
};
