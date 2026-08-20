import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TrackData,
  RacerState,
  Particle,
  UserBoostPad,
  CameraMode,
  GameMode,
  RaceWinnerInfo,
} from '../types';
import { COUNTRYBALLS } from '../game/countryballsData';
import { InfiniteTrackEngine } from '../game/infiniteTrackEngine';
import { PhysicsEngine } from '../game/physicsEngine';
import { CanvasRenderer } from '../game/canvasRenderer';
import { sound } from '../game/audioSynth';
import { versionChecker, VersionInfo, CLIENT_VERSION } from '../game/versionChecker';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  FastForward,
  Eye,
  Crosshair,
  Sparkles,
  RefreshCw,
  Trophy,
  Zap,
  MousePointer,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface AutoRunnerGameProps {
  initialLevel?: number;
}

export const AutoRunnerGame: React.FC<AutoRunnerGameProps> = ({ initialLevel = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const winnerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State
  const [level, setLevel] = useState<number>(initialLevel);
  const [gameMode, setGameMode] = useState<GameMode>('AUTO_PILOT');
  const [cameraMode, setCameraMode] = useState<CameraMode>('LEADER_LOCK');
  const [simSpeed, setSimSpeed] = useState<number>(0.75); // Calibrated gentle speed for clear watching
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sfxMuted, setSfxMuted] = useState<boolean>(false);
  const [musicMuted, setMusicMuted] = useState<boolean>(true); // start music muted for autoplay browser restrictions

  // Victory / Level Transition State
  const [winnerInfo, setWinnerInfo] = useState<RaceWinnerInfo | null>(null);
  const [nextLevelCountdown, setNextLevelCountdown] = useState<number>(4);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  // Telemetry state for HUD
  const [leaderRacer, setLeaderRacer] = useState<RacerState | null>(null);
  const [standings, setStandings] = useState<RacerState[]>([]);
  const [raceElapsedSec, setRaceElapsedSec] = useState<number>(0);

  // Engine Refs
  const trackRef = useRef<TrackData>(InfiniteTrackEngine.generateTrack(initialLevel));
  const racersRef = useRef<RacerState[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const userBoostPadsRef = useRef<UserBoostPad[]>([]);
  const physicsEngineRef = useRef<PhysicsEngine>(new PhysicsEngine());
  const rendererRef = useRef<CanvasRenderer>(new CanvasRenderer());
  const raceStartTimeRef = useRef<number>(Date.now());
  const isFinishedRef = useRef<boolean>(false);
  const victoryTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Cloudflare Version Polling
  useEffect(() => {
    versionChecker.startPeriodicPolling(30000);
    const unsub = versionChecker.onUpdateDetected((info) => {
      setUpdateInfo(info);
    });
    return () => {
      unsub();
      versionChecker.stopPeriodicPolling();
    };
  }, []);

  // Spawn racers on starting grid with larger 26px radius for clear flag watching
  const spawnRacers = useCallback((track: TrackData) => {
    const racers: RacerState[] = [];
    const count = 16;
    const cols = 4;
    const spacingX = 52;
    const spacingY = 56;

    for (let i = 0; i < count; i++) {
      const ballDef = COUNTRYBALLS[i % COUNTRYBALLS.length];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = (col - (cols - 1) / 2) * spacingX;
      const offsetY = row * spacingY;

      racers.push({
        id: `racer_${ballDef.id}_${i}`,
        ball: ballDef,
        x: track.startX + offsetX,
        y: track.startY + offsetY,
        vx: (Math.random() * 2 - 1) * 0.8,
        vy: 0.8 + Math.random() * 1.2,
        radius: 26, // Large high-definition flag sphere
        mass: 1.0 * ballDef.weightMultiplier,
        bounciness: 0.82 * ballDef.bounceMultiplier,
        rotation: 0,
        angularVelocity: 0,
        squishX: 1,
        squishY: 1,
        distance: 0,
        rank: i + 1,
        isFinished: false,
        isEliminated: false,
        trailHistory: [],
        stuckTimer: 0,
        lastY: track.startY + offsetY,
        boostTimer: 0,
        color: ballDef.primaryColor,
      });
    }

    return racers;
  }, []);

  // Initialize and Reset Level
  const startLevel = useCallback(
    (lvl: number) => {
      const newTrack = InfiniteTrackEngine.generateTrack(lvl);
      trackRef.current = newTrack;
      racersRef.current = spawnRacers(newTrack);
      particlesRef.current = [];
      userBoostPadsRef.current = [];
      raceStartTimeRef.current = Date.now();
      isFinishedRef.current = false;
      setWinnerInfo(null);
      setNextLevelCountdown(4);
      setCameraMode('LEADER_LOCK');

      sound.playLevelUp();
    },
    [spawnRacers]
  );

  // Initialize level on mount & level change
  useEffect(() => {
    startLevel(level);
  }, [level, startLevel]);

  // Victory Finalization & Automatic Level Advance Logic
  const finalizeRace = useCallback(
    (winningRacer: RacerState) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      // Automatically zoom into winning marble for high-definition close-up
      setCameraMode('WINNER_CLOSEUP');

      const duration = (Date.now() - raceStartTimeRef.current) / 1000;
      sound.playVictoryFanfare();

      const sorted = racersRef.current.slice().sort((a, b) => {
        if (a.isFinished && b.isFinished) return (a.finishRank || 99) - (b.finishRank || 99);
        if (a.isFinished) return -1;
        if (b.isFinished) return 1;
        return b.y - a.y;
      });

      const winInfo: RaceWinnerInfo = {
        winner: winningRacer.ball,
        level,
        trackName: trackRef.current.name,
        theme: trackRef.current.theme,
        finishTime: duration,
        podium: sorted.slice(0, 3).map((r, idx) => ({
          rank: idx + 1,
          ball: r.ball,
          finishTime: duration + idx * 0.35,
        })),
      };

      setWinnerInfo(winInfo);
      setNextLevelCountdown(4);

      // Start 4-second countdown to automatically advance to the next level
      let remaining = 4;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        setNextLevelCountdown(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      // Automatically advance after 4.2 seconds
      if (victoryTimerRef.current) clearTimeout(victoryTimerRef.current);
      victoryTimerRef.current = window.setTimeout(() => {
        // If Cloudflare has deployed a new version, hard reload on level change
        if (versionChecker.hasUpdateAvailable) {
          versionChecker.forceHardReload();
          return;
        }
        // Advance level automatically
        setLevel((prev) => prev + 1);
      }, 4200);
    },
    [level]
  );

  // Manual Skip / Advance
  const handleNextLevelManually = () => {
    if (victoryTimerRef.current) clearTimeout(victoryTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (versionChecker.hasUpdateAvailable) {
      versionChecker.forceHardReload();
      return;
    }
    setLevel((prev) => prev + 1);
  };

  // Main Canvas Render & Physics Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      const rawDt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const dt = rawDt * simSpeed * 60; // 60hz reference physics step

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Physics step if not paused
          if (!isPaused) {
            physicsEngineRef.current.update(
              racersRef.current,
              trackRef.current,
              userBoostPadsRef.current,
              particlesRef.current,
              dt,
              (racer, rank) => {
                if (rank === 1) {
                  finalizeRace(racer);
                }
              }
            );

            // Decay user boost pads
            for (let b = userBoostPadsRef.current.length - 1; b >= 0; b--) {
              const pad = userBoostPadsRef.current[b];
              pad.life += dt;
              if (pad.life >= pad.maxLife) {
                userBoostPadsRef.current.splice(b, 1);
              }
            }

            // Emergency timeout watchdog: 30s auto-crown distance leader
            const elapsed = (Date.now() - raceStartTimeRef.current) / 1000;
            setRaceElapsedSec(elapsed);

            if (elapsed > 30 && !isFinishedRef.current) {
              const bestRacer = racersRef.current.slice().sort((a, b) => b.y - a.y)[0];
              if (bestRacer) {
                finalizeRace(bestRacer);
              }
            }
          }

          // Update HUD Telemetry
          const leader = racersRef.current.find((r) => r.rank === 1 && !r.isEliminated);
          if (leader) setLeaderRacer({ ...leader });
          setStandings([...racersRef.current]);

          // Render 2D Frame
          rendererRef.current.render(
            ctx,
            canvas.width,
            canvas.height,
            trackRef.current,
            racersRef.current,
            particlesRef.current,
            userBoostPadsRef.current,
            cameraMode,
            gameMode === 'INTERACTIVE'
          );
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simSpeed, isPaused, cameraMode, gameMode, finalizeRace]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Interactive Boost Pad Placement (Click / Tap)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameMode !== 'INTERACTIVE') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates via camera approximation
    const leader = racersRef.current.find((r) => r.rank === 1) || racersRef.current[0];
    const cameraY = leader ? leader.y + 60 : 300;
    const cameraX = trackRef.current.width / 2;

    const worldX = (clickScreenX - canvas.width / 2) + cameraX;
    const worldY = (clickScreenY - canvas.height / 2) + cameraY;

    // Add user boost pad
    userBoostPadsRef.current.push({
      x: worldX,
      y: worldY,
      radius: 40,
      life: 0,
      maxLife: 200,
      power: 24,
    });

    sound.playBoost();
  };

  const handleToggleSfx = () => {
    const muted = sound.toggleSfx();
    setSfxMuted(muted);
  };

  const handleToggleMusic = () => {
    const muted = sound.toggleMusic();
    setMusicMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Primary HTML5 2D Game Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`w-full h-full block ${
          gameMode === 'INTERACTIVE' ? 'cursor-crosshair' : 'cursor-default'
        }`}
      />

      {/* Cloudflare Auto-Update Live Banner */}
      {updateInfo && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-auto">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300/40 flex items-center gap-3">
            <Sparkles size={16} className="text-amber-300 animate-spin" />
            <span>Cloudflare update v{updateInfo.version} deployed. Auto-syncing on next level!</span>
            <button
              onClick={() => versionChecker.forceHardReload()}
              className="px-2.5 py-1 rounded-xl bg-white text-slate-950 font-black text-xs uppercase hover:bg-emerald-100 active:scale-95 transition cursor-pointer flex items-center gap-1 shadow"
            >
              <RefreshCw size={12} className="animate-spin" />
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-30">
        {/* Current Level & Theme Title Banner */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 shadow-2xl flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Flame size={14} className="fill-slate-950" />
              <span>LEVEL {level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xs sm:text-base tracking-wide flex items-center gap-1.5 drop-shadow">
                <span>{trackRef.current.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-cyan-400/30">
                  {trackRef.current.theme}
                </span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Length: {trackRef.current.height}m · Difficulty: {trackRef.current.difficulty}/10
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls: Mode Switcher, Camera, Audio, Speed */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Auto-Pilot vs Interactive Mode Toggle */}
          <button
            onClick={() => setGameMode((m) => (m === 'AUTO_PILOT' ? 'INTERACTIVE' : 'AUTO_PILOT'))}
            className={`px-3 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border transition cursor-pointer shadow-lg active:scale-95 ${
              gameMode === 'AUTO_PILOT'
                ? 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300 text-white shadow-emerald-900/50'
                : 'bg-cyan-600/90 hover:bg-cyan-500 border-cyan-300 text-white shadow-cyan-900/50 animate-pulse'
            }`}
            title="Toggle between Hands-free Auto-Pilot and Interactive Nitro placement"
          >
            {gameMode === 'AUTO_PILOT' ? (
              <>
                <Zap size={14} />
                <span className="hidden sm:inline">AUTO-PILOT</span>
              </>
            ) : (
              <>
                <MousePointer size={14} />
                <span className="hidden sm:inline">INTERACTIVE</span>
              </>
            )}
          </button>

          {/* Camera Mode Toggle */}
          <button
            onClick={() =>
              setCameraMode((c) =>
                c === 'LEADER_LOCK'
                  ? 'WINNER_CLOSEUP'
                  : c === 'WINNER_CLOSEUP'
                  ? 'PACK_VIEW'
                  : c === 'PACK_VIEW'
                  ? 'OVERVIEW'
                  : 'LEADER_LOCK'
              )
            }
            className="px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95"
            title="Cycle Camera Modes (Target Lock, Winner Close-Up, Pack View, Full Overview)"
          >
            <Crosshair size={14} className="text-amber-400" />
            <span className="hidden md:inline">
              {cameraMode === 'LEADER_LOCK'
                ? '🎯 TARGET LOCK'
                : cameraMode === 'WINNER_CLOSEUP'
                ? '🔍 CLOSE-UP'
                : cameraMode === 'PACK_VIEW'
                ? '👥 PACK VIEW'
                : '🗺️ OVERVIEW'}
            </span>
          </button>

          {/* Speed Multiplier Button */}
          <button
            onClick={() => {
              const speeds = [0.4, 0.75, 1.0, 1.5];
              const next = speeds[(speeds.indexOf(simSpeed) + 1) % speeds.length];
              setSimSpeed(next);
            }}
            className="px-2.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer shadow-lg active:scale-95"
            title="Speed Multiplier (Slow, Normal, Fast)"
          >
            <FastForward size={14} />
            <span>
              {simSpeed === 0.4 ? '0.4x (Slow-Mo)' : simSpeed === 0.75 ? '0.75x (Relaxed)' : `${simSpeed}x`}
            </span>
          </button>

          {/* SFX Mute Button */}
          <button
            onClick={handleToggleSfx}
            className={`p-2 rounded-2xl border transition cursor-pointer shadow-lg active:scale-95 ${
              sfxMuted
                ? 'bg-red-950/80 border-red-500/50 text-red-400'
                : 'bg-slate-900/90 border-white/20 text-white hover:bg-slate-800'
            }`}
            title="Toggle Sound Effects"
          >
            {sfxMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Music Mute Button */}
          <button
            onClick={handleToggleMusic}
            className={`p-2 rounded-2xl border transition cursor-pointer shadow-lg active:scale-95 ${
              musicMuted
                ? 'bg-slate-900/90 border-white/20 text-gray-400 hover:text-white'
                : 'bg-purple-900/90 border-purple-400 text-purple-200'
            }`}
            title="Toggle Procedural Synth Music"
          >
            <Music size={15} />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white transition cursor-pointer shadow-lg active:scale-95"
            title="Pause / Resume Race"
          >
            {isPaused ? <Play size={15} className="fill-white" /> : <Pause size={15} />}
          </button>

          {/* Restart Level */}
          <button
            onClick={() => startLevel(level)}
            className="p-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white transition cursor-pointer shadow-lg active:scale-95"
            title="Restart Level"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT: TARGET LOCK & SPEEDOMETER HUD */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-20">
        {leaderRacer && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center gap-3 text-white">
            <div className="text-2xl drop-shadow">{leaderRacer.ball.flagEmoji}</div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 flex items-center gap-1 font-bold">
                  <Crosshair size={10} /> TARGET LOCKED
                </span>
                <span className="text-xs font-black tracking-wide">{leaderRacer.ball.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-gray-300 mt-0.5">
                <span>POS: #1</span>
                <span>
                  SPEED: {Math.hypot(leaderRacer.vx, leaderRacer.vy).toFixed(1)} m/s
                </span>
                <span>TRAIT: {leaderRacer.ball.trait.split('-')[0]}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: REAL-TIME LEADERBOARD OVERLAY */}
      <div className="absolute top-20 right-3 bottom-4 w-44 sm:w-56 bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-3xl p-3 shadow-2xl flex flex-col pointer-events-auto z-20">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-white">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-cyan-300">
            <Trophy size={14} className="text-amber-400" />
            <span>LIVE STANDINGS</span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {raceElapsedSec.toFixed(1)}s
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scroll">
          {standings
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((racer) => {
              const progressPct = Math.min(
                100,
                Math.max(0, ((racer.y - trackRef.current.startY) / (trackRef.current.finishY - trackRef.current.startY)) * 100)
              );

              return (
                <div
                  key={racer.id}
                  className={`flex items-center justify-between p-1.5 rounded-xl border text-xs transition-all ${
                    racer.rank === 1
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                      : racer.rank <= 3
                      ? 'bg-slate-800/80 border-white/20 text-white'
                      : 'bg-slate-950/50 border-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold w-4 text-[10px] text-center">
                      {racer.rank}
                    </span>
                    <span className="text-base leading-none">{racer.ball.flagEmoji}</span>
                    <span className="font-semibold text-[11px] truncate">
                      {racer.ball.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {racer.isFinished ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/40">
                        FIN
                      </span>
                    ) : (
                      <div className="w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4-SECOND AUTOMATIC VICTORY POP-UP MODAL WITH HD BALL SHOWCASE */}
      {winnerInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-slate-900 border-2 border-amber-400/90 rounded-3xl p-6 max-w-md w-full shadow-[0_0_60px_rgba(250,204,21,0.4)] text-center relative overflow-hidden flex flex-col items-center">
            {/* Ambient gold glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Winner Ball Close-up Card */}
            <div className="relative my-2 p-3 flex flex-col items-center">
              <div className="text-6xl sm:text-7xl mb-1 filter drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse">
                {winnerInfo.winner.flagEmoji}
              </div>
              <div className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                <span>👑 WINNER CLOSE-UP 👑</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold mb-2 shadow">
              <Trophy size={14} className="text-amber-400" />
              <span>STAGE {winnerInfo.level} CHAMPION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase drop-shadow mb-1">
              {winnerInfo.winner.name} WINS!
            </h2>
            <p className="text-xs text-gray-300 mb-3 font-mono">
              Time: {winnerInfo.finishTime.toFixed(2)}s · Trait: {winnerInfo.winner.trait}
            </p>

            {/* Podium Overview */}
            <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3 mb-4 space-y-1.5">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider text-left mb-1 font-bold">
                STAGE TOP 3 PODIUM
              </div>
              {winnerInfo.podium.map((p) => (
                <div
                  key={p.ball.id}
                  className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl border ${
                    p.rank === 1
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold'
                      : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-xs ${
                        p.rank === 1
                          ? 'text-amber-400'
                          : p.rank === 2
                          ? 'text-slate-300'
                          : 'text-amber-600'
                      }`}
                    >
                      #{p.rank}
                    </span>
                    <span className="text-base">{p.ball.flagEmoji}</span>
                    <span className="font-bold">{p.ball.name}</span>
                  </div>
                  <span className="font-mono text-gray-300 text-[11px]">
                    +{p.finishTime.toFixed(2)}s
                  </span>
                </div>
              ))}
            </div>

            {/* Automatic Next Level Progress Bar & Button */}
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                <span>AUTO-ADVANCING TO LEVEL {level + 1}...</span>
                <span>{nextLevelCountdown}s</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - nextLevelCountdown) / 4) * 100}%` }}
                />
              </div>

              <button
                onClick={handleNextLevelManually}
                className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <span>PLAY NEXT LEVEL NOW</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
