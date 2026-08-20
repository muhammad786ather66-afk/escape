import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ThreeEngine } from '../game/threeEngine';
import { PhysicsEngine } from '../game/physicsEngine';
import { TrackGenerator } from '../game/trackGenerator';
import { ALL_COUNTRYBALLS } from '../game/countryballsData';
import { sound } from '../game/audioSynth';
import { SaveManager } from '../game/saveManager';
import { Track, RacerState, CountryballDef, ActiveRaceEvent, RaceResult, GameSettings } from '../types';

interface GameCanvasProps {
  level: number;
  settings: GameSettings;
  isPaused: boolean;
  onRaceFinish: (result: RaceResult) => void;
  onUpdateHUD: (data: {
    racers: RacerState[];
    leader: RacerState | null;
    eliminatedCount: number;
    totalRacers: number;
    countdown: number | null;
    activeEvent: ActiveRaceEvent | null;
    trackName: string;
    trackTheme: string;
  }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  settings,
  isPaused,
  onRaceFinish,
  onUpdateHUD,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeEngineRef = useRef<ThreeEngine | null>(null);
  const physicsEngineRef = useRef<PhysicsEngine>(new PhysicsEngine());

  // Race State
  const trackRef = useRef<Track | null>(null);
  const racersRef = useRef<RacerState[]>([]);
  const countdownRef = useRef<number | null>(3);
  const isRacingRef = useRef<boolean>(false);
  const activeEventRef = useRef<ActiveRaceEvent | null>(null);
  const raceStartTimeRef = useRef<number>(0);
  const isFinishedRef = useRef<boolean>(false);

  // Initialize and spawn new race track
  const setupNewRace = useCallback((currentLevel: number, currentSettings: GameSettings) => {
    if (!threeEngineRef.current) return;

    // Filter enabled countryballs
    let enabledRacers = ALL_COUNTRYBALLS;
    if (currentSettings.selectedCountryIds && currentSettings.selectedCountryIds.length >= 4) {
      enabledRacers = ALL_COUNTRYBALLS.filter((c) => currentSettings.selectedCountryIds!.includes(c.id));
    }
    // Pick 12 to 16 racers
    const selectedRacers = enabledRacers.slice().sort(() => Math.random() - 0.5).slice(0, 16);

    const track = TrackGenerator.generateTrack(currentLevel, selectedRacers.length);
    trackRef.current = track;

    threeEngineRef.current.setEnvironmentTheme(track.theme);
    threeEngineRef.current.buildTrack(track);

    // Instantiate racers
    const newRacers: RacerState[] = selectedRacers.map((ballDef, idx) => {
      const spawn = track.spawnPositions[idx] || { x: 0, y: 14, z: 4 };
      return {
        id: ballDef.id,
        ballDef,
        x: spawn.x,
        y: spawn.y,
        z: spawn.z,
        vx: 0,
        vy: 0,
        vz: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        vRotX: 0,
        vRotY: 0,
        vRotZ: 0,
        radius: 1.2,
        isEliminated: false,
        isFinished: false,
        rank: idx + 1,
        distanceProgress: 0,
        stuckTimer: 0,
        lastProgressZ: spawn.z,
        squashX: 1,
        squashY: 1,
        squashZ: 1,
        trailPoints: [],
        boostTimer: 0,
        iceTimer: 0,
        fireTimer: 0,
      };
    });

    racersRef.current = newRacers;
    threeEngineRef.current.setupRacerMeshes(newRacers);

    // Reset race controls
    countdownRef.current = 3;
    isRacingRef.current = false;
    isFinishedRef.current = false;
    activeEventRef.current = null;
    raceStartTimeRef.current = Date.now();

    // Start 3.. 2.. 1.. GO countdown
    sound.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        countdownRef.current = count;
        sound.playCountdownBeep(false);
      } else if (count === 0) {
        countdownRef.current = 0; // "GO!"
        sound.playCountdownBeep(true);
        isRacingRef.current = true;
        // Release initial forward roll momentum
        racersRef.current.forEach((r) => {
          r.vz = 8.0 + Math.random() * 4.0;
        });
      } else {
        countdownRef.current = null;
        clearInterval(interval);
      }
    }, 900);
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const threeEngine = new ThreeEngine(containerRef.current);
    threeEngineRef.current = threeEngine;
    threeEngine.cameraMode = settings.cameraMode;

    setupNewRace(level, settings);

    // Animation loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      const rawDt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (!isPaused && trackRef.current && threeEngineRef.current) {
        const dt = rawDt * settings.simulationSpeed;

        if (isRacingRef.current && !isFinishedRef.current) {
          const finalizeRace = (winningRacer: RacerState) => {
            if (isFinishedRef.current) return;
            isFinishedRef.current = true;
            sound.playVictoryFanfare();

            // Compute podium & results
            const sorted = racersRef.current.slice().sort((a, b) => {
              if (a.isFinished && b.isFinished) return (a.finishRank || 99) - (b.finishRank || 99);
              if (a.isFinished) return -1;
              if (b.isFinished) return 1;
              return b.z - a.z;
            });

            const raceDuration = (Date.now() - raceStartTimeRef.current) / 1000;
            const result: RaceResult = {
              winner: winningRacer.ballDef,
              level,
              trackName: trackRef.current?.name || `Track ${level}`,
              theme: trackRef.current?.theme || 'GRASSLAND',
              raceDuration,
              totalRacers: racersRef.current.length,
              eliminatedCount: racersRef.current.filter((r) => r.isEliminated).length,
              podium: sorted.slice(0, 3).map((r, idx) => ({
                rank: idx + 1,
                racer: r.ballDef,
                finishTime: raceDuration + idx * 0.4,
                points: idx === 0 ? 100 : idx === 1 ? 70 : 50,
              })),
              allFinishers: sorted.map((r, idx) => ({
                rank: idx + 1,
                racer: r.ballDef,
                finishTime: r.isFinished ? raceDuration + idx * 0.3 : undefined,
                points: Math.max(10, 100 - idx * 8),
                isEliminated: r.isEliminated,
              })),
            };

            SaveManager.recordRaceResult(result);
            onRaceFinish(result);
          };

          // Physics step
          physicsEngineRef.current.update(
            racersRef.current,
            trackRef.current,
            dt,
            activeEventRef.current,
            (intensity, mat) => {
              if (settings.sfxEnabled) sound.playCollision(intensity, mat);
            },
            (racer, reason) => {
              // Elimination
            },
            (racer, rank) => {
              // Finisher!
              if (rank === 1) {
                finalizeRace(racer);
              }
            }
          );

          // Safety Watchdog: If all alive racers fell off or timeout > 40s, auto-crown top distance racer
          const raceDuration = (Date.now() - raceStartTimeRef.current) / 1000;
          const aliveRacers = racersRef.current.filter((r) => !r.isEliminated);
          if (aliveRacers.length === 0 || raceDuration > 45) {
            const bestRacer = racersRef.current.slice().sort((a, b) => b.z - a.z)[0];
            if (bestRacer) {
              finalizeRace(bestRacer);
            }
          }

          // Random Special Events Trigger (12% chance every 10 seconds of race)
          if (Math.random() < 0.003 && !activeEventRef.current) {
            const events: ActiveRaceEvent[] = [
              { type: 'SUPER_SPEED', title: '🔥 SUPER SPEED BOOST!', description: 'All Countryballs gain +45% top speed!', duration: 5, remainingTime: 5 },
              { type: 'SLIPPERY_ICE', title: '❄️ SLIPPERY ICE STORM!', description: 'Zero friction on all surfaces!', duration: 6, remainingTime: 6 },
              { type: 'LOW_GRAVITY', title: '🚀 LOW GRAVITY ZONE!', description: 'Moon physics activated! Huge jumps!', duration: 6, remainingTime: 6 },
              { type: 'FINAL_SPRINT', title: '⚡ FINAL SPRINT HYPERDRIVE!', description: 'Intense rush toward the finish line!', duration: 7, remainingTime: 7 },
            ];
            activeEventRef.current = events[Math.floor(Math.random() * events.length)];
          }

          if (activeEventRef.current) {
            activeEventRef.current.remainingTime -= dt;
            if (activeEventRef.current.remainingTime <= 0) {
              activeEventRef.current = null;
            }
          }
        }

        // Update 3D visual representations
        threeEngineRef.current.updateRacers(racersRef.current);

        const alive = racersRef.current.filter((r) => !r.isEliminated);
        const leader = alive.length > 0 ? alive.reduce((prev, curr) => (curr.z > prev.z ? curr : prev), alive[0]) : null;

        threeEngineRef.current.updateCamera(
          racersRef.current,
          isFinishedRef.current,
          leader ? leader.ballDef : undefined
        );

        // Update HUD
        onUpdateHUD({
          racers: racersRef.current,
          leader,
          eliminatedCount: racersRef.current.filter((r) => r.isEliminated).length,
          totalRacers: racersRef.current.length,
          countdown: countdownRef.current,
          activeEvent: activeEventRef.current,
          trackName: trackRef.current.name,
          trackTheme: trackRef.current.theme,
        });
      }

      threeEngineRef.current?.render();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      threeEngine.destroy();
    };
  }, [level, setupNewRace]);

  // Handle settings update
  useEffect(() => {
    if (threeEngineRef.current) {
      threeEngineRef.current.cameraMode = settings.cameraMode;
    }
  }, [settings.cameraMode]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none overflow-hidden cursor-grab active:cursor-grabbing"
      id="countryballs-canvas-container"
    />
  );
};
