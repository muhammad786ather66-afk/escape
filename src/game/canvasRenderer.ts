import {
  TrackData,
  RacerState,
  Particle,
  UserBoostPad,
  CameraMode,
  CountryballDef,
} from '../types';

export class CanvasRenderer {
  private cameraY = 0;
  private cameraX = 400;
  private cameraZoom = 1.0;
  public targetRacerId: string | null = null;

  public render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    track: TrackData,
    racers: RacerState[],
    particles: Particle[],
    userBoostPads: UserBoostPad[],
    cameraMode: CameraMode,
    interactiveMode: boolean
  ) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Dynamic Camera Tracking & Target Locking
    this.updateCamera(canvasWidth, canvasHeight, track, racers, cameraMode);

    // Save view transform
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 2. Themed Background & Distinct Material Textures
    this.drawBackground(ctx, track);

    // 3. Track Walls, Rails & Checkpoints
    this.drawTrack(ctx, track);

    // 4. Obstacles (Ice Spires, Lava Geysers, Sandstorms, Wind Fans, Lasers, Saws)
    this.drawObstacles(ctx, track);

    // 5. User Boost Pads
    this.drawUserBoostPads(ctx, userBoostPads);

    // 6. Checkered Finish Line & Grandstands
    this.drawFinishLine(ctx, track);

    // 7. Racers (Countryballs with Flags, Eyes & Accessories)
    this.drawRacers(ctx, racers);

    // 8. Particle FX (Plumes, Sparks, Trails, Confetti)
    this.drawParticles(ctx, particles);

    // 9. Ambient Themed Weather Particles
    this.drawAmbientWeather(ctx, track);

    ctx.restore();

    // 10. Screen Overlay FX
    this.drawScreenOverlay(ctx, canvasWidth, canvasHeight, interactiveMode, track);
  }

  private updateCamera(
    canvasWidth: number,
    canvasHeight: number,
    track: TrackData,
    racers: RacerState[],
    cameraMode: CameraMode
  ) {
    const leader = racers.find((r) => r.rank === 1 && !r.isEliminated) || racers[0];
    const finishedLeader = racers.find((r) => r.isFinished && r.finishRank === 1) || leader;

    let targetX = track.width / 2;
    let targetY = 200;
    let targetZoom = 1.0;

    if (cameraMode === 'WINNER_CLOSEUP' && (finishedLeader || leader)) {
      const focus = finishedLeader || leader;
      this.targetRacerId = focus.id;
      targetX = focus.x;
      targetY = focus.y;
      targetZoom = Math.min(2.4, Math.max(1.7, canvasHeight / 390));
    } else if (cameraMode === 'LEADER_LOCK' && leader) {
      this.targetRacerId = leader.id;
      targetX = leader.x;
      targetY = leader.y + 40;
      targetZoom = Math.min(1.8, Math.max(1.35, canvasHeight / 490));
    } else if (cameraMode === 'PACK_VIEW') {
      const activeRacers = racers.filter((r) => !r.isEliminated).slice(0, 8);
      if (activeRacers.length > 0) {
        const avgX = activeRacers.reduce((s, r) => s + r.x, 0) / activeRacers.length;
        const avgY = activeRacers.reduce((s, r) => s + r.y, 0) / activeRacers.length;
        targetX = avgX;
        targetY = avgY + 30;
        targetZoom = Math.min(1.3, canvasHeight / 660);
      }
    } else {
      // OVERVIEW
      targetX = track.width / 2;
      targetY = leader ? leader.y : track.height / 2;
      targetZoom = Math.min(0.9, canvasWidth / track.width);
    }

    // Smooth lerp
    this.cameraX += (targetX - this.cameraX) * 0.09;
    this.cameraY += (targetY - this.cameraY) * 0.09;
    this.cameraZoom += (targetZoom - this.cameraZoom) * 0.06;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, track: TrackData) {
    const time = performance.now() * 0.001;

    // Gradient Sky/Abyss
    const grad = ctx.createLinearGradient(0, 0, 0, track.height);
    grad.addColorStop(0, track.backgroundGradient[0]);
    grad.addColorStop(0.5, track.backgroundGradient[1]);
    grad.addColorStop(1, track.backgroundGradient[2]);

    ctx.fillStyle = grad;
    ctx.fillRect(-600, -300, track.width + 1200, track.height + 600);

    // Track Floor Canvas
    ctx.fillStyle = track.floorColor || 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(40, 20, track.width - 80, track.height - 40);

    // Material Grid lines
    ctx.strokeStyle = track.gridColor || 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1.2;
    const gridSize = 70;
    for (let x = 40; x <= track.width - 40; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, track.height - 20);
      ctx.stroke();
    }
    for (let y = 20; y <= track.height - 20; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(track.width - 40, y);
      ctx.stroke();
    }

    // Themed Texture Patterns
    this.drawTrackTexturePattern(ctx, track, time);

    // Ambient floating decorations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    track.decorations.forEach((dec) => {
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawTrackTexturePattern(ctx: CanvasRenderingContext2D, track: TrackData, time: number) {
    ctx.save();

    switch (track.texturePattern) {
      // 1. ICE CRACKS: Frosty crystalline fractures & highlights
      case 'ICE_CRACKS': {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.18)';
        ctx.lineWidth = 1.5;
        for (let y = 150; y < track.height - 200; y += 220) {
          const sx = 100 + ((y * 13) % (track.width - 240));
          ctx.beginPath();
          ctx.moveTo(sx, y);
          ctx.lineTo(sx + 45, y + 35);
          ctx.lineTo(sx + 30, y + 80);
          ctx.lineTo(sx + 75, y + 110);
          ctx.moveTo(sx + 45, y + 35);
          ctx.lineTo(sx + 90, y + 25);
          ctx.stroke();
        }
        break;
      }

      // 2. LAVA VEINS: Pulsing molten magma fissures
      case 'LAVA_VEINS': {
        const pulse = 0.5 + 0.5 * Math.sin(time * 3);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 + pulse * 0.12})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        for (let y = 120; y < track.height - 200; y += 260) {
          const sx = 120 + ((y * 17) % (track.width - 260));
          ctx.beginPath();
          ctx.moveTo(sx, y);
          ctx.bezierCurveTo(sx + 60, y + 40, sx - 40, y + 100, sx + 50, y + 150);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        break;
      }

      // 3. DESERT DUNES: Undulating golden sand ridges
      case 'DESERT_DUNES': {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 2;
        for (let y = 100; y < track.height - 200; y += 180) {
          ctx.beginPath();
          ctx.moveTo(60, y);
          for (let x = 60; x < track.width - 60; x += 80) {
            const waveY = y + Math.sin(x * 0.03 + y * 0.05) * 16;
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        break;
      }

      // 4. SKY CLOUDS: Fluffy cloud silhouettes
      case 'SKY_CLOUDS': {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let y = 120; y < track.height - 200; y += 320) {
          const cx = 140 + ((y * 19) % (track.width - 320));
          ctx.beginPath();
          ctx.arc(cx, y, 45, 0, Math.PI * 2);
          ctx.arc(cx + 35, y - 10, 35, 0, Math.PI * 2);
          ctx.arc(cx - 35, y - 5, 30, 0, Math.PI * 2);
          ctx.arc(cx + 70, y + 5, 32, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 5. CYBER CIRCUIT: High-tech circuit traces & data nodes
      case 'CYBER_CIRCUIT': {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillStyle = 'rgba(232, 121, 249, 0.35)';
        ctx.lineWidth = 1.8;
        for (let y = 140; y < track.height - 200; y += 240) {
          const sx = 100 + ((y * 23) % (track.width - 240));
          ctx.beginPath();
          ctx.moveTo(sx, y);
          ctx.lineTo(sx + 50, y);
          ctx.lineTo(sx + 90, y + 40);
          ctx.lineTo(sx + 90, y + 100);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(sx + 90, y + 100, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 6. SPACE NEBULA: Celestial gas wisps
      case 'SPACE_NEBULA': {
        for (let y = 160; y < track.height - 200; y += 400) {
          const cx = track.width / 2 + Math.sin(y * 0.02) * 120;
          const nebGrad = ctx.createRadialGradient(cx, y, 10, cx, y, 160);
          nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
          nebGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.06)');
          nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = nebGrad;
          ctx.beginPath();
          ctx.arc(cx, y, 160, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 7. JUNGLE CANOPY: Wood plank seams & leafy vines
      case 'JUNGLE_CANOPY': {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.16)';
        ctx.lineWidth = 2;
        for (let y = 100; y < track.height - 200; y += 140) {
          ctx.beginPath();
          ctx.moveTo(60, y);
          ctx.lineTo(track.width - 60, y);
          ctx.stroke();
        }
        break;
      }

      // 8. OCEAN CAUSTICS: Aquatic caustic light ripple net
      case 'OCEAN_CAUSTICS': {
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.16)';
        ctx.lineWidth = 1.5;
        for (let y = 120; y < track.height - 200; y += 160) {
          const shift = Math.sin(time * 2 + y * 0.02) * 14;
          ctx.beginPath();
          for (let x = 80; x < track.width - 80; x += 60) {
            ctx.ellipse(x + shift, y, 24, 14, 0.2, 0, Math.PI * 2);
          }
          ctx.stroke();
        }
        break;
      }

      // 9. STEAMPUNK GEARS: Cogwheel silhouettes
      case 'STEAMPUNK_GEARS': {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.14)';
        ctx.lineWidth = 2.5;
        for (let y = 160; y < track.height - 200; y += 300) {
          const gx = 140 + ((y * 11) % (track.width - 280));
          ctx.beginPath();
          ctx.arc(gx, y, 38, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(gx, y, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      // 10. GOLDEN MOSAIC: Classical Grecian diamond tile grid
      case 'GOLDEN_MOSAIC': {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
        ctx.lineWidth = 1.4;
        const size = 50;
        for (let y = 60; y < track.height - 200; y += size) {
          for (let x = 60; x < track.width - 60; x += size) {
            ctx.strokeRect(x, y, size, size);
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + size / 2);
            ctx.lineTo(x + size / 2, y + size);
            ctx.lineTo(x, y + size / 2);
            ctx.closePath();
            ctx.stroke();
          }
        }
        break;
      }

      // 11. CANDY STRIPES: Diagonal peppermint ribbons
      case 'CANDY_STRIPES': {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.12)';
        ctx.lineWidth = 22;
        for (let y = -200; y < track.height + 200; y += 110) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(track.width - 40, y + 260);
          ctx.stroke();
        }
        break;
      }

      // 12. AURORA WAVES: Iridescent wave curtains
      case 'AURORA_WAVES': {
        for (let a = 0; a < 3; a++) {
          const waveGrad = ctx.createLinearGradient(0, 0, track.width, 0);
          waveGrad.addColorStop(0, 'rgba(45, 212, 191, 0)');
          waveGrad.addColorStop(0.4, 'rgba(45, 212, 191, 0.12)');
          waveGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.12)');
          waveGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

          ctx.fillStyle = waveGrad;
          ctx.beginPath();
          ctx.moveTo(40, 20);
          for (let y = 20; y < track.height; y += 80) {
            const wx = track.width / 2 + Math.sin(y * 0.005 + time * 1.5 + a) * 160;
            ctx.lineTo(wx, y);
          }
          ctx.lineTo(track.width - 40, track.height);
          ctx.lineTo(track.width - 40, 20);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();
  }

  private drawTrack(ctx: CanvasRenderingContext2D, track: TrackData) {
    track.walls.forEach((wall) => {
      ctx.save();
      ctx.strokeStyle = wall.color || track.railColor;
      ctx.shadowColor = wall.color || track.accentColor;
      ctx.shadowBlur = 12;
      ctx.lineWidth = wall.isBouncy ? 8 : 6;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();

      // Inner bright core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();

      ctx.restore();
    });
  }

  private drawObstacles(ctx: CanvasRenderingContext2D, track: TrackData) {
    const time = performance.now() * 0.003;

    track.obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      switch (obs.type) {
        // 1. FLAMETHROWER
        case 'FLAMETHROWER': {
          const r = obs.radius || 28;
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = obs.fireActive ? '#ef4444' : '#475569';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
          ctx.fill();

          if (obs.fireActive) {
            ctx.save();
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 25;
            const fireGrad = ctx.createLinearGradient(0, 0, 0, 110);
            fireGrad.addColorStop(0, '#ffffff');
            fireGrad.addColorStop(0.2, '#fef08a');
            fireGrad.addColorStop(0.5, '#f97316');
            fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-40 + Math.sin(time * 12) * 8, 105);
            ctx.lineTo(0, 125 + Math.cos(time * 14) * 10);
            ctx.lineTo(40 + Math.sin(time * 12 + 2) * 8, 105);
            ctx.lineTo(18, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          break;
        }

        // 2. LAVA GEYSER
        case 'LAVA_GEYSER': {
          const r = obs.radius || 30;
          ctx.fillStyle = '#450a0a';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = obs.fireActive ? '#ff4500' : '#7f1d1d';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          ctx.fill();

          if (obs.fireActive) {
            ctx.shadowColor = '#ff4500';
            ctx.shadowBlur = 30;
            ctx.fillStyle = 'rgba(255, 69, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(0, -20, r * 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        // 3. BUZZSAW CUTTER
        case 'BUZZSAW_CUTTER': {
          ctx.rotate(obs.rotation);
          const r = obs.radius || 36;

          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;

          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e2e8f0';
          const teethCount = 12;
          for (let t = 0; t < teethCount; t++) {
            const ang = (t * Math.PI * 2) / teethCount;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * (r * 0.7), Math.sin(ang) * (r * 0.7));
            ctx.lineTo(Math.cos(ang + 0.18) * r, Math.sin(ang + 0.18) * r);
            ctx.lineTo(Math.cos(ang + 0.35) * (r * 0.7), Math.sin(ang + 0.35) * (r * 0.7));
            ctx.closePath();
            ctx.fill();
          }

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        // 4. ICE SPIRE (Crystalline Shuriken Star)
        case 'ICE_SPIRE': {
          ctx.rotate(obs.rotation);
          const r = obs.radius || 34;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;

          // 6-pointed ice snowflake
          ctx.fillStyle = '#7dd3fc';
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          for (let p = 0; p < 6; p++) {
            const ang = (p * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang - 0.2) * (r * 0.4), Math.sin(ang - 0.2) * (r * 0.4));
            ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
            ctx.lineTo(Math.cos(ang + 0.2) * (r * 0.4), Math.sin(ang + 0.2) * (r * 0.4));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // 5. BLACK HOLE & SANDSTORM VORTEX
        case 'BLACK_HOLE':
        case 'VORTEX_FUNNEL':
        case 'SANDSTORM_VORTEX': {
          const r = obs.radius || 80;
          ctx.rotate(time * (obs.type === 'SANDSTORM_VORTEX' ? 4 : 3));

          const auraColor =
            obs.type === 'SANDSTORM_VORTEX'
              ? '#f59e0b'
              : obs.type === 'VORTEX_FUNNEL'
              ? '#14b8a6'
              : '#c084fc';
          ctx.shadowColor = auraColor;
          ctx.shadowBlur = 24;

          const auraGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
          auraGrad.addColorStop(0, '#000000');
          auraGrad.addColorStop(0.5, obs.type === 'SANDSTORM_VORTEX' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.4)');
          auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Spiral arms
          ctx.strokeStyle = obs.type === 'SANDSTORM_VORTEX' ? '#fde68a' : 'rgba(216, 180, 254, 0.7)';
          ctx.lineWidth = 3;
          for (let a = 0; a < 4; a++) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.7, a * (Math.PI / 2), a * (Math.PI / 2) + 1.2);
            ctx.stroke();
          }

          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        // 6. PINBALL BUMPER & PYRAMID BUMPER
        case 'PINBALL_BUMPER':
        case 'PYRAMID_BUMPER': {
          const r = obs.radius || 28;
          ctx.shadowColor = obs.type === 'PYRAMID_BUMPER' ? '#fbbf24' : track.accentColor;
          ctx.shadowBlur = 14;

          if (obs.type === 'PYRAMID_BUMPER') {
            ctx.fillStyle = '#451a03';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.86, r * 0.6);
            ctx.lineTo(-r * 0.86, r * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = track.accentColor;
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = track.accentColor;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        // 7. BOUNCY MUSHROOM
        case 'BOUNCY_MUSHROOM': {
          const r = obs.radius || 32;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 16;

          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#a7f3d0';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          [-r * 0.4, 0, r * 0.4].forEach((ox) => {
            ctx.beginPath();
            ctx.arc(ox, -r * 0.2, 5, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        // 8. CLOUD TRAMPOLINE
        case 'CLOUD_TRAMPOLINE': {
          const r = obs.radius || 36;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 20;

          ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('☁️', 0, 0);
          break;
        }

        // 9. WIND FAN & SNOW BLOWER
        case 'WIND_FAN':
        case 'SNOW_BLOWER': {
          const w = obs.width || 50;
          const h = obs.height || 50;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = obs.type === 'SNOW_BLOWER' ? '#38bdf8' : '#60a5fa';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          // Spinning Fan Blades
          ctx.save();
          ctx.rotate(time * 15);
          ctx.fillStyle = '#94a3b8';
          for (let b = 0; b < 3; b++) {
            ctx.rotate((Math.PI * 2) / 3);
            ctx.fillRect(-3, -16, 6, 16);
          }
          ctx.restore();

          // Airstream lines
          ctx.strokeStyle = obs.type === 'SNOW_BLOWER' ? 'rgba(224, 242, 254, 0.4)' : 'rgba(96, 165, 250, 0.4)';
          ctx.lineWidth = 2;
          for (let l = 0; l < 3; l++) {
            const ly = -12 + l * 12;
            ctx.beginPath();
            ctx.moveTo(w / 2, ly);
            ctx.lineTo(w / 2 + 50 + Math.sin(time * 8 + l) * 15, ly);
            ctx.stroke();
          }
          break;
        }

        // 10. SPINNING HAMMER & ROTATING BAR
        case 'SPINNING_HAMMER':
        case 'ROTATING_BAR': {
          ctx.rotate(obs.rotation);
          const len = obs.length || 140;

          ctx.fillStyle = '#334155';
          ctx.fillRect(-len / 2, -5, len, 10);
          ctx.strokeStyle = track.railColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(-len / 2, -5, len, 10);

          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          if (obs.type === 'SPINNING_HAMMER') {
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.fillRect(-len / 2 - 12, -14, 24, 28);
            ctx.fillRect(len / 2 - 12, -14, 24, 28);
          }
          break;
        }

        // 11. BOOST PAD
        case 'BOOST_PAD': {
          const w = obs.width || 44;
          const h = obs.height || 65;

          ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          ctx.strokeStyle = '#a5f3fc';
          ctx.lineWidth = 3;
          const offset = (time * 35) % 20;
          for (let y = -h / 2 + 10 + offset; y < h / 2 - 10; y += 20) {
            ctx.beginPath();
            ctx.moveTo(-w / 3, y - 8);
            ctx.lineTo(0, y + 4);
            ctx.lineTo(w / 3, y - 8);
            ctx.stroke();
          }
          break;
        }

        // 12. LASER GATE
        case 'LASER_GATE': {
          const w = obs.width || 240;
          const h = obs.height || 18;

          ctx.fillStyle = '#475569';
          ctx.fillRect(-w / 2 - 10, -12, 20, 24);
          ctx.fillRect(w / 2 - 10, -12, 20, 24);

          if (obs.laserActive) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.fillRect(-w / 2, -h / 2, w, h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-w / 2, -2, w, 4);
          }
          break;
        }

        // 13. ICE & QUICKSAND PATCHES
        case 'ICE_PATCH': {
          const w = obs.width || 240;
          const h = obs.height || 100;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
          ctx.lineWidth = 2;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        }

        case 'QUICKSAND_PIT':
        case 'MUD_PATCH': {
          const w = obs.width || 240;
          const h = obs.height || 100;
          ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        }
      }

      ctx.restore();
    });
  }

  private drawAmbientWeather(ctx: CanvasRenderingContext2D, track: TrackData) {
    const time = performance.now() * 0.001;
    const type = track.physicsConfig.ambientParticleType;

    ctx.save();
    const count = 35;

    for (let i = 0; i < count; i++) {
      const px = ((i * 137 + time * 30) % track.width);
      const py = ((i * 223 + time * (type === 'EMBER' || type === 'STEAM' ? -60 : 70)) % track.height + track.height) % track.height;

      switch (type) {
        case 'SNOW':
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'EMBER':
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 69, 0, 0.75)' : 'rgba(255, 165, 0, 0.75)';
          ctx.beginPath();
          ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'SAND_DUST':
          ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'CLOUD_MIST':
        case 'STEAM':
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(px, py, 14 + (i % 10), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'BUBBLE':
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, 3 + (i % 4), 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'CYBER_BIT':
          ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(232, 121, 249, 0.8)';
          ctx.fillRect(px, py, 3, 3);
          break;
        case 'STAR_DUST':
          ctx.fillStyle = 'rgba(216, 180, 254, 0.8)';
          ctx.beginPath();
          ctx.arc(px, py, 1.5 + (i % 2), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'SPORE':
          ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    }

    ctx.restore();
  }

  private drawUserBoostPads(ctx: CanvasRenderingContext2D, pads: UserBoostPad[]) {
    pads.forEach((pad) => {
      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawFinishLine(ctx: CanvasRenderingContext2D, track: TrackData) {
    const y = track.finishY;
    const w = 440;
    const x = track.startX - w / 2;

    // Grandstand Side Banners
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 32, y - 20, 26, 75);
    ctx.fillRect(x + w + 6, y - 20, 26, 75);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🏁', x - 28, y + 22);
    ctx.fillText('🏁', x + w + 10, y + 22);

    // Checkered Pattern
    const squareSize = 15;
    const cols = Math.floor(w / squareSize);
    const rows = 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111827';
        ctx.fillRect(x + c * squareSize, y + r * squareSize, squareSize, squareSize);
      }
    }

    // Finish Banner Text
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.font = 'black 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ FINISH LINE ★', track.startX, y - 12);
    ctx.shadowBlur = 0;
  }

  private drawRacers(ctx: CanvasRenderingContext2D, racers: RacerState[]) {
    const sortedRacers = racers.slice().sort((a, b) => a.y - b.y);
    const time = performance.now() * 0.003;

    sortedRacers.forEach((racer) => {
      if (racer.isEliminated) return;

      ctx.save();
      ctx.translate(racer.x, racer.y);
      ctx.scale(racer.squishX, racer.squishY);

      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, racer.radius + 4, racer.radius * 0.9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1st Place Golden Halo
      if (racer.rank === 1) {
        ctx.save();
        const pulse = 1 + 0.15 * Math.sin(time * 6);
        ctx.strokeStyle = racer.isFinished ? '#f59e0b' : '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = racer.isFinished ? 24 : 16;
        ctx.beginPath();
        ctx.arc(0, 0, (racer.radius + 6) * pulse, 0, Math.PI * 2);
        ctx.stroke();

        if (racer.isFinished) {
          ctx.save();
          ctx.rotate(time * 2);
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 2;
          for (let ray = 0; ray < 8; ray++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const ang = (ray * Math.PI) / 4;
            ctx.lineTo(Math.cos(ang) * (racer.radius * 2.2), Math.sin(ang) * (racer.radius * 2.2));
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      // Boost or Hazard glow
      if (racer.boostTimer > 0) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 22;
      } else if (racer.hazardHitTimer && racer.hazardHitTimer > 0) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 20;
      }

      // Flag inside ball (rotated)
      ctx.save();
      ctx.rotate(racer.rotation);

      ctx.beginPath();
      ctx.arc(0, 0, racer.radius, 0, Math.PI * 2);
      ctx.clip();

      this.drawCountryballFlag(ctx, racer.ball, racer.radius);

      // 3D Sphere Shading
      const grad = ctx.createRadialGradient(
        -racer.radius * 0.35,
        -racer.radius * 0.35,
        racer.radius * 0.08,
        0,
        0,
        racer.radius
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, racer.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Outer Ball Rim Stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, racer.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Cartoon Eyes
      this.drawCountryballEyes(ctx, racer);

      // Hat / Accessory
      this.drawAccessory(ctx, racer.ball.accessory, racer.radius);

      // 1st Place Crown
      if (racer.rank === 1) {
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        const cy = -racer.radius - 18;
        ctx.beginPath();
        ctx.moveTo(-10, cy + 6);
        ctx.lineTo(-12, cy - 6);
        ctx.lineTo(-4, cy);
        ctx.lineTo(0, cy - 8);
        ctx.lineTo(4, cy);
        ctx.lineTo(12, cy - 6);
        ctx.lineTo(10, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Floating Country Badge
      const labelY = racer.radius + 16;
      const tagText = `${racer.ball.flagEmoji} ${racer.ball.name}`;
      ctx.font = 'bold 10px sans-serif';
      const textWidth = ctx.measureText(tagText).width;

      ctx.fillStyle = racer.rank === 1 ? 'rgba(250, 204, 21, 0.95)' : 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = racer.rank === 1 ? '#eab308' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-textWidth / 2 - 6, labelY - 8, textWidth + 12, 16, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = racer.rank === 1 ? '#020617' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, 0, labelY);

      // Rank Badge on Top
      ctx.fillStyle = racer.rank === 1 ? '#facc15' : racer.rank <= 3 ? '#38bdf8' : 'rgba(30, 41, 59, 0.9)';
      ctx.beginPath();
      ctx.arc(0, -racer.radius - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = racer.rank === 1 ? '#000000' : '#ffffff';
      ctx.font = 'black 8.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${racer.rank}`, 0, -racer.radius - 8);

      ctx.restore();
    });
  }

  private drawCountryballFlag(ctx: CanvasRenderingContext2D, ball: CountryballDef, r: number) {
    const d = r * 2;
    ctx.fillStyle = ball.primaryColor;
    ctx.fillRect(-r, -r, d, d);

    // Custom Detailed Flags for classic powers
    switch (ball.id) {
      case 'turkey': {
        ctx.fillStyle = '#E30A17';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.12, 0, r * 0.52, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E30A17';
        ctx.beginPath();
        ctx.arc(r * 0.04, 0, r * 0.41, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        this.drawStar(ctx, r * 0.32, 0, 5, r * 0.22, r * 0.09);
        return;
      }
      case 'germany': {
        ctx.fillStyle = '#000000';
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillStyle = '#DD0000';
        ctx.fillRect(-r, -r + d / 3, d, d / 3);
        ctx.fillStyle = '#FFCE00';
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);
        return;
      }
      case 'france': {
        ctx.fillStyle = '#002654';
        ctx.fillRect(-r, -r, d / 3, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 3, -r, d / 3, d);
        ctx.fillStyle = '#ED2939';
        ctx.fillRect(-r + (2 * d) / 3, -r, d / 3, d);
        return;
      }
      case 'brazil': {
        ctx.fillStyle = '#009739';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#FEDD00';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.72);
        ctx.lineTo(r * 0.85, 0);
        ctx.lineTo(0, r * 0.72);
        ctx.lineTo(-r * 0.85, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#012169';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, r * 0.12, r * 0.38, Math.PI * 1.08, Math.PI * 1.85);
        ctx.stroke();
        return;
      }
      case 'usa': {
        for (let s = 0; s < 7; s++) {
          ctx.fillStyle = s % 2 === 0 ? '#B22234' : '#FFFFFF';
          ctx.fillRect(-r, -r + s * (d / 7), d, d / 7);
        }
        ctx.fillStyle = '#3C3B6E';
        ctx.fillRect(-r, -r, d * 0.52, d * 0.5);
        ctx.fillStyle = '#ffffff';
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            this.drawStar(ctx, -r + 4 + col * (d * 0.2), -r + 4 + row * (d * 0.18), 5, 2.5, 1.2);
          }
        }
        return;
      }
      case 'japan': {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      case 'uk': {
        ctx.fillStyle = '#012169';
        ctx.fillRect(-r, -r, d, d);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = r * 0.35;
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(-r, r);
        ctx.lineTo(r, -r);
        ctx.stroke();
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = r * 0.16;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r, -r * 0.28, d, r * 0.56);
        ctx.fillRect(-r * 0.28, -r, r * 0.56, d);
        ctx.fillStyle = '#C8102E';
        ctx.fillRect(-r, -r * 0.16, d, r * 0.32);
        ctx.fillRect(-r * 0.16, -r, r * 0.32, d);
        return;
      }
      case 'china': {
        ctx.fillStyle = '#DE2910';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#FFDE00';
        this.drawStar(ctx, -r * 0.45, -r * 0.45, 5, r * 0.28, r * 0.12);
        this.drawStar(ctx, -r * 0.15, -r * 0.65, 5, r * 0.1, r * 0.04);
        this.drawStar(ctx, -r * 0.05, -r * 0.45, 5, r * 0.1, r * 0.04);
        this.drawStar(ctx, -r * 0.05, -r * 0.25, 5, r * 0.1, r * 0.04);
        this.drawStar(ctx, -r * 0.15, -r * 0.08, 5, r * 0.1, r * 0.04);
        return;
      }
      case 'canada': {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-r, -r, d / 4, d);
        ctx.fillRect(r - d / 4, -r, d / 4, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 4, -r, d / 2, d);
        ctx.fillStyle = '#FF0000';
        this.drawStar(ctx, 0, -r * 0.05, 5, r * 0.32, r * 0.14);
        ctx.fillRect(-1.5, r * 0.15, 3, r * 0.18);
        return;
      }
      case 'argentina': {
        ctx.fillStyle = '#74ACDF';
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, -r + d / 3, d, d / 3);
        ctx.fillStyle = '#F6B40E';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      case 'poland': {
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(-r, -r, d, d / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, 0, d, d / 2);
        return;
      }
    }

    // Universal Procedural Flag Styles
    switch (ball.flagStyle) {
      case 'TRICOLOR_H': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(-r, -r + d / 3, d, d / 3);
        ctx.fillStyle = ball.accentColor;
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);
        break;
      }
      case 'TRICOLOR_V': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d / 3, d);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(-r + d / 3, -r, d / 3, d);
        ctx.fillStyle = ball.accentColor;
        ctx.fillRect(-r + (2 * d) / 3, -r, d / 3, d);
        break;
      }
      case 'BICOLOR_H': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d / 2);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(-r, 0, d, d / 2);
        break;
      }
      case 'BICOLOR_V': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d / 2, d);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(0, -r, d / 2, d);
        break;
      }
      case 'CROSS_NORDIC': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(-r, -r * 0.16, d, r * 0.32);
        ctx.fillRect(-r * 0.35, -r, r * 0.32, d);
        if (ball.accentColor && ball.accentColor !== ball.secondaryColor) {
          ctx.fillStyle = ball.accentColor;
          ctx.fillRect(-r, -r * 0.08, d, r * 0.16);
          ctx.fillRect(-r * 0.27, -r, r * 0.16, d);
        }
        break;
      }
      case 'SALTIRE': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d);
        ctx.strokeStyle = ball.secondaryColor;
        ctx.lineWidth = r * 0.35;
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(-r, r);
        ctx.lineTo(r, -r);
        ctx.stroke();
        break;
      }
      case 'SUN_DISC': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = ball.secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'SOLID_STAR': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = ball.secondaryColor;
        this.drawStar(ctx, 0, 0, 5, r * 0.45, r * 0.2);
        break;
      }
      case 'DIAGONAL_SPLIT': {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = ball.secondaryColor;
        ctx.beginPath();
        ctx.moveTo(-r, r);
        ctx.lineTo(r, -r);
        ctx.lineTo(r, r);
        ctx.closePath();
        ctx.fill();
        break;
      }
      default: {
        ctx.fillStyle = ball.primaryColor;
        ctx.fillRect(-r, -r, d, d / 2);
        ctx.fillStyle = ball.secondaryColor;
        ctx.fillRect(-r, 0, d, d / 2);
        ctx.fillStyle = ball.accentColor;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  private drawCountryballEyes(ctx: CanvasRenderingContext2D, racer: RacerState) {
    const r = racer.radius;
    const eyeOffsetX = r * 0.3;
    const eyeOffsetY = -r * 0.05;

    if (racer.ball.accessory === 'SUNGLASSES') {
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;

      ctx.beginPath();
      ctx.ellipse(-eyeOffsetX, eyeOffsetY, r * 0.28, r * 0.34, -0.05, 0, Math.PI * 2);
      ctx.ellipse(eyeOffsetX, eyeOffsetY, r * 0.28, r * 0.34, 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-eyeOffsetX + 6, eyeOffsetY - 4);
      ctx.lineTo(eyeOffsetX - 6, eyeOffsetY - 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    // Classic Countryball Eyes
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.6;

    // Left Eye
    ctx.beginPath();
    ctx.ellipse(-eyeOffsetX, eyeOffsetY, r * 0.22, r * 0.28, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, r * 0.22, r * 0.28, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils looking down/forward in race direction
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-eyeOffsetX + 1.5, eyeOffsetY + 3, r * 0.08, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX + 1.5, eyeOffsetY + 3, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawAccessory(ctx: CanvasRenderingContext2D, accessory: string, r: number) {
    ctx.save();

    switch (accessory) {
      case 'FEZ': {
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, -r * 0.7);
        ctx.lineTo(-r * 0.25, -r * 1.3);
        ctx.lineTo(r * 0.25, -r * 1.3);
        ctx.lineTo(r * 0.35, -r * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.3);
        ctx.lineTo(r * 0.35, -r * 0.9);
        ctx.stroke();
        break;
      }

      case 'STAHLHELM': {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r * 0.55, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(-r * 0.65, -r * 0.7, r * 1.3, 4);
        break;
      }

      case 'BERET': {
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.85, r * 0.55, r * 0.22, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'TOP_HAT': {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-r * 0.6, -r * 0.75, r * 1.2, 4);
        ctx.fillRect(-r * 0.35, -r * 1.35, r * 0.7, r * 0.6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-r * 0.35, -r * 0.85, r * 0.7, 4);
        break;
      }

      case 'SOMBRERO': {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.75, r * 0.8, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-r * 0.28, -r * 1.25, r * 0.56, r * 0.5);
        break;
      }

      case 'USHANKA': {
        ctx.fillStyle = '#57534e';
        ctx.fillRect(-r * 0.55, -r * 1.25, r * 1.1, r * 0.6);
        ctx.fillStyle = '#ef4444';
        this.drawStar(ctx, 0, -r * 0.95, 5, 4, 2);
        break;
      }

      case 'TURBAN': {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.85, r * 0.55, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }

      case 'HEADBAND':
      case 'HACHIMAKI': {
        ctx.fillStyle = accessory === 'HACHIMAKI' ? '#ffffff' : '#ef4444';
        ctx.fillRect(-r * 0.85, -r * 0.35, r * 1.7, 6);
        if (accessory === 'HACHIMAKI') {
          ctx.fillStyle = '#bc002d';
          ctx.beginPath();
          ctx.arc(0, -r * 0.25, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach((part) => {
      ctx.save();
      ctx.globalAlpha = part.alpha;
      ctx.fillStyle = part.color;

      if (part.shape === 'CONFETTI') {
        ctx.fillRect(part.x - part.size / 2, part.y - part.size / 2, part.size, part.size * 0.6);
      } else if (part.shape === 'FLAME') {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawScreenOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    interactiveMode: boolean,
    track: TrackData
  ) {
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.45,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    if (interactiveMode) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ TAP / CLICK TRACK TO DROP NITRO SPEED PADS', width / 2, height - 30);
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
