import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { RaceHUD } from './components/RaceHUD';
import { WinnerModal } from './components/WinnerModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RosterModal } from './components/RosterModal';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import { SaveManager } from './game/saveManager';
import { sound } from './game/audioSynth';
import { versionChecker, VersionInfo, CLIENT_VERSION } from './game/versionChecker';
import { RefreshCw, Sparkles } from 'lucide-react';
import {
  GameSettings,
  RaceResult,
  RacerState,
  ActiveRaceEvent,
  CameraMode,
  LeaderboardEntry,
} from './types';

export function App() {
  const [gameState, setGameState] = useState<'MENU' | 'RACING'>('MENU');
  const [level, setLevel] = useState<number>(() => SaveManager.loadCurrentLevel());
  const [settings, setSettings] = useState<GameSettings>(() => SaveManager.loadSettings());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => SaveManager.loadLeaderboard());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'LEADERBOARD' | 'ROSTER' | 'SETTINGS' | null>(null);
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  // Start Cloudflare version update polling
  useEffect(() => {
    versionChecker.startPeriodicPolling(30000);
    const unsubscribe = versionChecker.onUpdateDetected((info) => {
      setUpdateInfo(info);
    });
    return () => {
      unsubscribe();
      versionChecker.stopPeriodicPolling();
    };
  }, []);

  // Save current level when level changes
  useEffect(() => {
    SaveManager.saveCurrentLevel(level);
  }, [level]);

  // HUD telemetry state
  const [hudData, setHudData] = useState<{
    racers: RacerState[];
    leader: RacerState | null;
    eliminatedCount: number;
    totalRacers: number;
    countdown: number | null;
    activeEvent: ActiveRaceEvent | null;
    trackName: string;
    trackTheme: string;
  }>({
    racers: [],
    leader: null,
    eliminatedCount: 0,
    totalRacers: 16,
    countdown: 3,
    activeEvent: null,
    trackName: 'Emerald Rolling Hills',
    trackTheme: 'GRASSLAND',
  });

  // Sync sound settings to audio synth
  useEffect(() => {
    sound.setVolumes(settings.soundVolume, settings.musicVolume, !settings.sfxEnabled);
    if (gameState === 'RACING' && settings.musicEnabled) {
      sound.startBGM();
    } else {
      sound.stopBGM();
    }
  }, [settings, gameState]);

  // Fullscreen helper
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const handleStartRace = () => {
    setGameState('RACING');
    setRaceResult(null);
    setIsPaused(false);
    if (settings.musicEnabled) sound.startBGM();
  };

  const handleRestartRace = () => {
    setRaceResult(null);
    setIsPaused(false);
    // Force re-mount of canvas for current level
    setLevel((prev) => prev);
  };

  const handleNextRace = () => {
    setRaceResult(null);
    setIsPaused(false);

    // If Cloudflare has deployed a new build version, seamlessly hard-reload on level transition
    if (versionChecker.hasUpdateAvailable) {
      const nextLevel = level + 1;
      SaveManager.saveCurrentLevel(nextLevel);
      versionChecker.forceHardReload();
      return;
    }

    setLevel((prev) => prev + 1);
  };

  const handleManualForceUpdate = () => {
    SaveManager.saveCurrentLevel(level);
    versionChecker.forceHardReload();
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    SaveManager.saveSettings(newSettings);
  };

  const handleToggleMute = () => {
    handleUpdateSettings({
      ...settings,
      sfxEnabled: !settings.sfxEnabled,
      musicEnabled: !settings.sfxEnabled,
    });
  };

  const handleChangeSpeed = (speed: number) => {
    handleUpdateSettings({
      ...settings,
      simulationSpeed: speed,
    });
  };

  const handleChangeCamera = (mode: CameraMode) => {
    handleUpdateSettings({
      ...settings,
      cameraMode: mode,
    });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== null) {
        if (e.key === 'Escape') setActiveModal(null);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        handleRestartRace();
      } else if (e.key === 'n' || e.key === 'N') {
        handleNextRace();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handleToggleFullscreen, handleToggleMute]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 relative font-sans">
      {/* Cloudflare Auto-Update Live Notification Banner */}
      {updateInfo && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-bounce">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300/40 flex items-center gap-3">
            <Sparkles size={16} className="text-amber-300 animate-spin" />
            <span>
              Cloudflare update available (v{updateInfo.version}). Auto-syncing on next level!
            </span>
            <button
              onClick={handleManualForceUpdate}
              className="px-2.5 py-1 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-100 active:scale-95 transition cursor-pointer flex items-center gap-1 shadow"
            >
              <RefreshCw size={12} className="animate-spin" />
              Update Now
            </button>
          </div>
        </div>
      )}

      {gameState === 'MENU' && (
        <MainMenu
          onStartRace={handleStartRace}
          onOpenRoster={() => setActiveModal('ROSTER')}
          onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
        />
      )}

      {gameState === 'RACING' && (
        <>
          <GameCanvas
            key={`canvas_level_${level}`}
            level={level}
            settings={settings}
            isPaused={isPaused}
            onRaceFinish={(result) => {
              setRaceResult(result);
              setLeaderboard(SaveManager.loadLeaderboard());
            }}
            onUpdateHUD={(data) => setHudData(data)}
          />

          <RaceHUD
            level={level}
            trackName={hudData.trackName}
            trackTheme={hudData.trackTheme}
            racers={hudData.racers}
            leader={hudData.leader}
            eliminatedCount={hudData.eliminatedCount}
            totalRacers={hudData.totalRacers}
            countdown={hudData.countdown}
            activeEvent={hudData.activeEvent}
            isPaused={isPaused}
            settings={settings}
            isFullscreen={isFullscreen}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            onToggleMute={handleToggleMute}
            onToggleFullscreen={handleToggleFullscreen}
            onRestartRace={handleRestartRace}
            onNextRace={handleNextRace}
            onChangeSpeed={handleChangeSpeed}
            onChangeCamera={handleChangeCamera}
            onOpenLeaderboard={() => setActiveModal('LEADERBOARD')}
            onOpenRoster={() => setActiveModal('ROSTER')}
            onOpenSettings={() => setActiveModal('SETTINGS')}
          />
        </>
      )}

      {/* Winner Celebration Modal */}
      {raceResult && (
        <WinnerModal
          result={raceResult}
          autoAdvanceSeconds={settings.autoAdvanceDelay || 5}
          onNextRace={handleNextRace}
        />
      )}

      {/* Leaderboard Modal */}
      {activeModal === 'LEADERBOARD' && (
        <LeaderboardModal
          entries={leaderboard}
          onUpdateEntries={(entries) => setLeaderboard(entries)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Countryballs Roster Modal */}
      {activeModal === 'ROSTER' && (
        <RosterModal
          selectedIds={settings.selectedCountryIds || []}
          onUpdateSelectedIds={(ids) => handleUpdateSettings({ ...settings, selectedCountryIds: ids })}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Settings Modal */}
      {activeModal === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

export default App;
