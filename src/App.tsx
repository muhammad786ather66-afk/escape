import React, { useState, useEffect } from 'react';
import { 
  GameState, 
  MissionConfig, 
  CombatStats, 
  SaveData 
} from './types';
import { SaveManager } from './game/saveManager';
import { GameDirector } from './game/gameDirector';
import { sound } from './game/audio';

import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { MissionDebriefModal } from './components/MissionDebriefModal';
import { ArsenalModal } from './components/ArsenalModal';
import { UpgradesModal } from './components/UpgradesModal';
import { OperationsMapModal } from './components/OperationsMapModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => SaveManager.load());
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentMission, setCurrentMission] = useState<MissionConfig>(() => 
    GameDirector.generateMission(1)
  );

  // Debrief states
  const [debriefVictory, setDebriefVictory] = useState<boolean>(true);
  const [debriefStats, setDebriefStats] = useState<CombatStats>({
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
  const [earnedCredits, setEarnedCredits] = useState<number>(0);
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const [newLevel, setNewLevel] = useState<number>(1);
  const [leveledUp, setLeveledUp] = useState<boolean>(false);

  // Synchronize audio volumes on startup
  useEffect(() => {
    sound.setVolumes(
      saveData.settings.soundVolume,
      saveData.settings.musicVolume,
      saveData.settings.voiceVolume
    );
  }, [saveData.settings]);

  // Handle Play Campaign from Main Menu
  const handlePlayCampaign = () => {
    const mission = GameDirector.generateMission(saveData.highestMission);
    setCurrentMission(mission);
    setGameState('BRIEFING');
  };

  // Handle Mission Selection from Operations Map
  const handleSelectMission = (mission: MissionConfig) => {
    setCurrentMission(mission);
    setGameState('BRIEFING');
  };

  // Start Playing
  const handleStartMission = () => {
    setGameState('PLAYING');
  };

  // Mission Completed (Victory or Defeat)
  const handleMissionFinished = (
    victory: boolean, 
    stats: CombatStats, 
    creditsEarned: number, 
    xpEarned: number
  ) => {
    setDebriefVictory(victory);
    setDebriefStats(stats);
    setEarnedCredits(creditsEarned);
    setEarnedXP(xpEarned);

    // Calculate progression & Level Ups
    let currentXP = saveData.xp + xpEarned;
    let currentLvl = saveData.level;
    let didLevelUp = false;

    while (currentXP >= SaveManager.getXPForNextLevel(currentLvl)) {
      currentXP -= SaveManager.getXPForNextLevel(currentLvl);
      currentLvl++;
      didLevelUp = true;
    }

    setNewLevel(currentLvl);
    setLeveledUp(didLevelUp);

    // Update achievements progress
    const updatedAchievements = saveData.achievements.map((ach) => {
      let progress = ach.progress;
      if (ach.id === 'FIRST_BLOOD' && stats.kills > 0) progress = 1;
      if (ach.id === 'KILL_50') progress += stats.kills;
      if (ach.id === 'KILL_200') progress += stats.kills;
      if (ach.id === 'BOSS_SLAYER' && currentMission.hasBoss && victory) progress = 1;
      if (ach.id === 'COMBO_MASTER' && stats.comboMultiplier >= 10) progress = 10;
      if (ach.id === 'FLIGHT_ACE' && currentMission.gameMode === 'AIRCRAFT') progress += stats.kills;
      if (ach.id === 'WEAPON_HOARDER') progress = saveData.unlockedWeapons.length;

      const isUnlocked = progress >= ach.maxProgress;
      return { ...ach, progress: Math.min(ach.maxProgress, progress), unlocked: isUnlocked };
    });

    const newSave: SaveData = {
      ...saveData,
      credits: saveData.credits + creditsEarned,
      xp: currentXP,
      level: currentLvl,
      highestMission: victory ? Math.max(saveData.highestMission, currentMission.missionNumber + 1) : saveData.highestMission,
      missionsCompleted: victory ? saveData.missionsCompleted + 1 : saveData.missionsCompleted,
      highestCombo: Math.max(saveData.highestCombo, stats.comboMultiplier),
      highestScore: Math.max(saveData.highestScore, stats.score),
      totalKills: saveData.totalKills + stats.kills,
      totalBossesDefeated: victory && currentMission.hasBoss ? saveData.totalBossesDefeated + 1 : saveData.totalBossesDefeated,
      totalDistanceRun: saveData.totalDistanceRun + stats.distanceTraveled,
      achievements: updatedAchievements,
    };

    SaveManager.save(newSave);
    setSaveData(newSave);

    setGameState(victory ? 'VICTORY' : 'DEFEAT');
  };

  // Next Mission after Victory
  const handleNextMission = () => {
    const nextMission = GameDirector.generateMission(currentMission.missionNumber + 1);
    setCurrentMission(nextMission);
    setGameState('BRIEFING');
  };

  // Retry Mission
  const handleRetryMission = () => {
    setGameState('BRIEFING');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      {/* 3D Game Canvas Layer (Active when PLAYING) */}
      {gameState === 'PLAYING' && (
        <GameCanvas
          mission={currentMission}
          saveData={saveData}
          onMissionFinished={handleMissionFinished}
          onAbortToMenu={() => setGameState('MENU')}
        />
      )}

      {/* Main Menu Overlay */}
      {gameState === 'MENU' && (
        <MainMenu
          saveData={saveData}
          onPlay={handlePlayCampaign}
          onOpenOperations={() => setGameState('OPERATIONS')}
          onOpenArsenal={() => setGameState('ARSENAL')}
          onOpenUpgrades={() => setGameState('UPGRADES')}
          onOpenAchievements={() => setGameState('ACHIEVEMENTS')}
          onOpenSettings={() => setGameState('SETTINGS')}
        />
      )}

      {/* Mission Briefing Overlay */}
      {gameState === 'BRIEFING' && (
        <MissionBriefingModal
          mission={currentMission}
          onStartMission={handleStartMission}
        />
      )}

      {/* Mission Debrief Evaluation (Victory or Defeat) */}
      {(gameState === 'VICTORY' || gameState === 'DEFEAT') && (
        <MissionDebriefModal
          victory={debriefVictory}
          mission={currentMission}
          stats={debriefStats}
          earnedCredits={earnedCredits}
          earnedXP={earnedXP}
          newLevel={newLevel}
          leveledUp={leveledUp}
          onNextMission={handleNextMission}
          onRetry={handleRetryMission}
          onOpenArsenal={() => setGameState('ARSENAL')}
          onMainMenu={() => setGameState('MENU')}
        />
      )}

      {/* Arsenal Modal */}
      {gameState === 'ARSENAL' && (
        <ArsenalModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Upgrades Modal */}
      {gameState === 'UPGRADES' && (
        <UpgradesModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Operations Map Modal */}
      {gameState === 'OPERATIONS' && (
        <OperationsMapModal
          saveData={saveData}
          onSelectMission={handleSelectMission}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Achievements Records Modal */}
      {gameState === 'ACHIEVEMENTS' && (
        <AchievementsModal
          saveData={saveData}
          onClose={() => setGameState('MENU')}
        />
      )}

      {/* Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSave={setSaveData}
          onClose={() => setGameState('MENU')}
        />
      )}
    </div>
  );
}
