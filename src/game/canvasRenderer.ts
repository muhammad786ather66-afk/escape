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
  private targetRacerId: string | null = null;

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

    // 1. Update Dynamic Camera Tracking & Target Locking
    this.updateCamera(canvasWidth, canvasHeight, track, racers, cameraMode);

    // Save view transform
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 2. Draw Themed Background
    this.drawBackground(ctx, track);

    // 3. Draw Track Walls, Checkpoints & Rails
    this.drawTrack(ctx, track);

    // 4. Draw Obstacles (Hammers, Bumpers, Lasers, Vortexes)
    this.drawObstacles(ctx, track);

    // 5. Draw User-Placed Boost Pads
    this.drawUserBoostPads(ctx, userBoostPads);

    // 6. Draw Checkered Finish Line & Grandstands
    this.drawFinishLine(ctx, track);

    // 7. Draw Racers (Countryballs with Flags, Eyes & Accessories)
    this.drawRacers(ctx, racers);

    // 8. Draw Particle FX (Sparks, Trails, Confetti)
    this.drawParticles(ctx, particles);

    ctx.restore();

    // 9. Draw Screen Overlay FX (Vignette, Speed Lines, Interactive Hint)
    this.drawScreenOverlay(ctx, canvasWidth, canvasHeight, interactiveMode);
  }

  private updateCamera(
    canvasWidth: number,
    canvasHeight: number,
    track: TrackData,
    racers: RacerState[],
    cameraMode: CameraMode
  ) {
    const leader = racers.find((r) => r.rank === 1 && !r.isEliminated) || racers[0];

    let targetX = track.width / 2;
    let targetY = 200;
    let targetZoom = 1.0;

    if (cameraMode === 'LEADER_LOCK' && leader) {
      this.targetRacerId = leader.id;
      targetX = leader.x;
      targetY = leader.y + 60; // look ahead slightly down-track
      targetZoom = Math.min(1.4, canvasHeight / 620);
    } else if (cameraMode === 'PACK_VIEW') {
      const activeRacers = racers.filter((r) => !r.isEliminated).slice(0, 5);
      if (activeRacers.length > 0) {
        const avgX = activeRacers.reduce((s, r) => s + r.x, 0) / activeRacers.length;
        const avgY = activeRacers.reduce((s, r) => s + r.y, 0) / activeRacers.length;
        targetX = avgX;
        targetY = avgY + 40;
        targetZoom = Math.min(1.15, canvasHeight / 720);
      }
    } else {
      // OVERVIEW
      targetX = track.width / 2;
      targetY = leader ? leader.y : track.height / 2;
      targetZoom = Math.min(0.85, canvasWidth / track.width);
    }

    // Smooth lerp camera translation
    this.cameraX += (targetX - this.cameraX) * 0.08;
    this.cameraY += (targetY - this.cameraY) * 0.08;
    this.cameraZoom += (targetZoom - this.cameraZoom) * 0.05;
  }

  private drawBackground(ctx: CanvasRenderingContext2D, track: TrackData) {
    const grad = ctx.createLinearGradient(0, 0, 0, track.height);
    grad.addColorStop(0, track.backgroundGradient[0]);
    grad.addColorStop(0.5, track.backgroundGradient[1]);
    grad.addColorStop(1, track.backgroundGradient[2]);

    ctx.fillStyle = grad;
    ctx.fillRect(-400, -200, track.width + 800, track.height + 400);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.5;
    const gridSize = 60;
    for (let x = -200; x <= track.width + 200; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -200);
      ctx.lineTo(x, track.height + 200);
      ctx.stroke();
    }
    for (let y = -200; y <= track.height + 200; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(track.width + 200, y);
      ctx.stroke();
    }

    // Ambient floating decorations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    track.decorations.forEach((dec) => {
      ctx.beginPath();
      ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawTrack(ctx: CanvasRenderingContext2D, track: TrackData) {
    // Glowing track floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.rect(40, 20, track.width - 80, track.height - 40);
    ctx.fill();

    // Rails & Walls
    track.walls.forEach((wall) => {
      ctx.save();
      // Outer Glow
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
        case 'PINBALL_BUMPER': {
          const r = obs.radius || 28;
          // Pulse glow
          ctx.shadowColor = track.accentColor;
          ctx.shadowBlur = 14;

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = track.accentColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          // Inner bumper ring
          ctx.fillStyle = track.accentColor;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'BOUNCY_MUSHROOM': {
          const r = obs.radius || 32;
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 16;

          ctx.fillStyle = '#db2777';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fbcfe8';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Spots
          ctx.fillStyle = '#ffffff';
          [-r * 0.4, 0, r * 0.4].forEach((ox) => {
            ctx.beginPath();
            ctx.arc(ox, -r * 0.2, 5, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'SPINNING_HAMMER':
        case 'ROTATING_BAR': {
          ctx.rotate(obs.rotation);
          const len = obs.length || 140;

          // Shaft
          ctx.fillStyle = '#334155';
          ctx.fillRect(-len / 2, -5, len, 10);

          ctx.strokeStyle = track.railColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(-len / 2, -5, len, 10);

          // Center pivot hub
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          // Hammer heads on ends
          if (obs.type === 'SPINNING_HAMMER') {
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.fillRect(-len / 2 - 12, -14, 24, 28);
            ctx.fillRect(len / 2 - 12, -14, 24, 28);
          }
          break;
        }

        case 'BOOST_PAD': {
          const w = obs.width || 40;
          const h = obs.height || 60;

          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.fillRect(-w / 2, -h / 2, w, h);

          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.strokeRect(-w / 2, -h / 2, w, h);

          // Animated chevron arrows pointing down
          ctx.strokeStyle = '#a5f3fc';
          ctx.lineWidth = 3;
          const offset = (time * 30) % 20;
          for (let y = -h / 2 + 10 + offset; y < h / 2 - 10; y += 20) {
            ctx.beginPath();
            ctx.moveTo(-w / 3, y - 8);
            ctx.lineTo(0, y + 4);
            ctx.lineTo(w / 3, y - 8);
            ctx.stroke();
          }
          break;
        }

        case 'LASER_GATE': {
          const w = obs.width || 200;
          const h = obs.height || 16;

          // Posts
          ctx.fillStyle = '#475569';
          ctx.fillRect(-w / 2 - 10, -12, 20, 24);
          ctx.fillRect(w / 2 - 10, -12, 20, 24);

          // Laser beam
          if (obs.laserActive) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 18;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
            ctx.fillRect(-w / 2, -h / 2, w, h);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-w / 2, -2, w, 4);
          }
          break;
        }

        case 'VORTEX_FUNNEL': {
          const r = obs.radius || 90;
          ctx.rotate(time * 2);

          // Spiral arms
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 3;
          for (let a = 0; a < 4; a++) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.8, a * (Math.PI / 2), a * (Math.PI / 2) + 1);
            ctx.stroke();
          }

          ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'ICE_PATCH': {
          const w = obs.width || 200;
          const h = obs.height || 100;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        }

        case 'MUD_PATCH': {
          const w = obs.width || 200;
          const h = obs.height || 100;
          ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          break;
        }
      }
      ctx.restore();
    });
  }

  private drawUserBoostPads(ctx: CanvasRenderingContext2D, pads: UserBoostPad[]) {
    const time = performance.now() * 0.005;
    pads.forEach((pad) => {
      ctx.save();
      ctx.translate(pad.x, pad.y);

      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;

      // Concentric pulsating rings
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius * (0.6 + 0.4 * Math.sin(time)), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, pad.radius, 0, Math.PI * 2);
      ctx.fill();

      // Nitro Icon Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡NITRO', 0, 0);

      ctx.restore();
    });
  }

  private drawFinishLine(ctx: CanvasRenderingContext2D, track: TrackData) {
    const y = track.finishY;
    const w = 360;
    const x = track.startX - w / 2;
    const h = 28;

    // Grandstand Side Banners
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 30, y - 20, 24, 70);
    ctx.fillRect(x + w + 6, y - 20, 24, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('🏁', x - 26, y + 20);
    ctx.fillText('🏁', x + w + 10, y + 20);

    // Checkered Banner
    const squareSize = 14;
    const cols = Math.floor(w / squareSize);
    const rows = 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#111827';
        ctx.fillRect(x + c * squareSize, y + r * squareSize, squareSize, squareSize);
      }
    }

    // Finish Text
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.font = 'black 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ FINISH LINE ★', track.startX, y - 10);
    ctx.shadowBlur = 0;
  }

  private drawRacers(ctx: CanvasRenderingContext2D, racers: RacerState[]) {
    // Sort so leaders and jumping balls are drawn on top
    const sortedRacers = racers.slice().sort((a, b) => a.y - b.y);

    sortedRacers.forEach((racer) => {
      if (racer.isEliminated) return;

      ctx.save();
      ctx.translate(racer.x, racer.y);

      // Squish & Stretch transform
      ctx.scale(racer.squishX, racer.squishY);

      // Ball Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, racer.radius + 3, racer.radius * 0.85, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boost Glow if active
      if (racer.boostTimer > 0) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
      }

      // 1st Place Golden Crown Halo
      if (racer.rank === 1 && !racer.isFinished) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, racer.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotate flag inside ball
      ctx.save();
      ctx.rotate(racer.rotation);

      // Ball Clipping Path
      ctx.beginPath();
      ctx.arc(0, 0, racer.radius, 0, Math.PI * 2);
      ctx.clip();

      // Render Countryball Flag
      this.drawCountryballFlag(ctx, racer.ball, racer.radius);

      // Shading / Sphere gradient highlight
      const grad = ctx.createRadialGradient(
        -racer.radius * 0.35,
        -racer.radius * 0.35,
        racer.radius * 0.1,
        0,
        0,
        racer.radius
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, racer.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // restore rotation for eyes & hat so they stay upright

      // Draw Cartoon Eyes
      this.drawCountryballEyes(ctx, racer);

      // Draw Countryball Hat / Accessory
      this.drawAccessory(ctx, racer.ball.accessory, racer.radius);

      // Rank Badge on ball
      ctx.fillStyle = racer.rank === 1 ? '#facc15' : 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -racer.radius - 12, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = racer.rank === 1 ? '#000000' : '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${racer.rank}`, 0, -racer.radius - 12);

      ctx.restore();
    });
  }

  private drawCountryballFlag(ctx: CanvasRenderingContext2D, ball: CountryballDef, r: number) {
    const d = r * 2;
    ctx.fillStyle = ball.primaryColor;
    ctx.fillRect(-r, -r, d, d);

    switch (ball.id) {
      case 'turkey': {
        // Red with White Crescent and 5-Pointed Star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.1, 0, r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E30A17';
        ctx.beginPath();
        ctx.arc(r * 0.05, 0, r * 0.44, 0, Math.PI * 2);
        ctx.fill();

        // Star
        ctx.fillStyle = '#ffffff';
        this.drawStar(ctx, r * 0.35, 0, 5, r * 0.22, r * 0.1);
        break;
      }

      case 'germany': {
        // Black, Red, Gold Horizontal Stripes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillStyle = '#DD0000';
        ctx.fillRect(-r, -r + d / 3, d, d / 3);
        ctx.fillStyle = '#FFCE00';
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);
        break;
      }

      case 'france': {
        // Blue, White, Red Vertical Stripes
        ctx.fillStyle = '#002654';
        ctx.fillRect(-r, -r, d / 3, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 3, -r, d / 3, d);
        ctx.fillStyle = '#ED2939';
        ctx.fillRect(-r + (2 * d) / 3, -r, d / 3, d);
        break;
      }

      case 'brazil': {
        // Green field, Yellow Rhombus, Blue Circle
        ctx.fillStyle = '#009739';
        ctx.fillRect(-r, -r, d, d);

        ctx.fillStyle = '#FEDD00';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.75);
        ctx.lineTo(r * 0.85, 0);
        ctx.lineTo(0, r * 0.75);
        ctx.lineTo(-r * 0.85, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#012169';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // White curved band
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, r * 0.15, r * 0.38, Math.PI * 1.05, Math.PI * 1.85);
        ctx.stroke();
        break;
      }

      case 'usa': {
        // Red and White horizontal stripes + Blue canton
        for (let s = 0; s < 7; s++) {
          ctx.fillStyle = s % 2 === 0 ? '#B22234' : '#FFFFFF';
          ctx.fillRect(-r, -r + s * (d / 7), d, d / 7);
        }
        ctx.fillStyle = '#3C3B6E';
        ctx.fillRect(-r, -r, d * 0.55, d * 0.5);
        break;
      }

      case 'japan': {
        // White field + Red Sun disc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'uk': {
        // Union Jack
        ctx.fillStyle = '#012169';
        ctx.fillRect(-r, -r, d, d);

        // White diagonal saltire
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(-r, r);
        ctx.lineTo(r, -r);
        ctx.stroke();

        // Red diagonal
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = 5;
        ctx.stroke();

        // White cross
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r, -6, d, 12);
        ctx.fillRect(-6, -r, 12, d);

        // Red cross
        ctx.fillStyle = '#C8102E';
        ctx.fillRect(-r, -3.5, d, 7);
        ctx.fillRect(-3.5, -r, 7, d);
        break;
      }

      case 'italy': {
        // Green, White, Red Vertical
        ctx.fillStyle = '#009246';
        ctx.fillRect(-r, -r, d / 3, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 3, -r, d / 3, d);
        ctx.fillStyle = '#CE2B37';
        ctx.fillRect(-r + (2 * d) / 3, -r, d / 3, d);
        break;
      }

      case 'poland': {
        // Red on top, White on bottom (Classic Polandball inverted rule)
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(-r, -r, d, d / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, 0, d, d / 2);
        break;
      }

      case 'canada': {
        // Red, White, Red
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-r, -r, d / 4, d);
        ctx.fillRect(r - d / 4, -r, d / 4, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 4, -r, d / 2, d);

        // Red Maple Leaf center
        ctx.fillStyle = '#FF0000';
        this.drawStar(ctx, 0, 0, 5, r * 0.35, r * 0.15);
        break;
      }

      case 'mexico': {
        // Green, White, Red Vertical + Eagle emblem
        ctx.fillStyle = '#006847';
        ctx.fillRect(-r, -r, d / 3, d);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r + d / 3, -r, d / 3, d);
        ctx.fillStyle = '#CE1126';
        ctx.fillRect(-r + (2 * d) / 3, -r, d / 3, d);

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'argentina': {
        // Cyan, White, Cyan + Sun of May
        ctx.fillStyle = '#74ACDF';
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, -r + d / 3, d, d / 3);

        // Sun
        ctx.fillStyle = '#F6B40E';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'spain': {
        // Red, Yellow (double width), Red
        ctx.fillStyle = '#AA151B';
        ctx.fillRect(-r, -r, d, d / 4);
        ctx.fillRect(-r, r - d / 4, d, d / 4);
        ctx.fillStyle = '#F1BF00';
        ctx.fillRect(-r, -r + d / 4, d, d / 2);
        break;
      }

      case 'sweden': {
        // Blue with Yellow Nordic Cross
        ctx.fillStyle = '#006AA7';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#FECC00';
        ctx.fillRect(-r, -4, d, 8);
        ctx.fillRect(-r * 0.35, -r, 8, d);
        break;
      }

      case 'india': {
        // Saffron, White, Green + Ashoka Chakra
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(-r, -r, d, d / 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-r, -r + d / 3, d, d / 3);
        ctx.fillStyle = '#138808';
        ctx.fillRect(-r, -r + (2 * d) / 3, d, d / 3);

        // Chakra wheel
        ctx.strokeStyle = '#000080';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'australia': {
        // Blue field with Union Jack canton & stars
        ctx.fillStyle = '#00008B';
        ctx.fillRect(-r, -r, d, d);
        ctx.fillStyle = '#ffffff';
        this.drawStar(ctx, r * 0.35, -r * 0.2, 5, 4, 2);
        this.drawStar(ctx, r * 0.5, r * 0.2, 5, 5, 2.5);
        this.drawStar(ctx, -r * 0.3, r * 0.3, 7, 6, 3);
        break;
      }
    }
  }

  private drawCountryballEyes(ctx: CanvasRenderingContext2D, racer: RacerState) {
    const r = racer.radius;
    const eyeOffsetX = r * 0.3;
    const eyeOffsetY = -r * 0.05;

    // USA wears sunglasses instead of eyes
    if (racer.ball.accessory === 'SUNGLASSES') {
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;

      // Dark Aviator Lenses
      ctx.beginPath();
      ctx.ellipse(-eyeOffsetX, eyeOffsetY, r * 0.28, r * 0.34, -0.05, 0, Math.PI * 2);
      ctx.ellipse(eyeOffsetX, eyeOffsetY, r * 0.28, r * 0.34, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Aviator Gold Frame
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Bridge
      ctx.beginPath();
      ctx.moveTo(-eyeOffsetX + 6, eyeOffsetY - 4);
      ctx.lineTo(eyeOffsetX - 6, eyeOffsetY - 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    // Classic Countryball Cute Eyes (White bean shapes with black pupils)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;

    [-eyeOffsetX, eyeOffsetX].forEach((ox) => {
      ctx.beginPath();
      ctx.ellipse(ox, eyeOffsetY, r * 0.22, r * 0.28, ox > 0 ? -0.1 : 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Black Pupil looking forward / slightly down
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ox + 1.5, eyeOffsetY + 2, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    });
  }

  private drawAccessory(ctx: CanvasRenderingContext2D, acc: CountryballDef['accessory'], r: number) {
    ctx.save();
    switch (acc) {
      case 'FEZ': {
        // Turkey Fez Hat
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, -r * 0.8);
        ctx.lineTo(r * 0.45, -r * 0.8);
        ctx.lineTo(r * 0.38, -r * 1.45);
        ctx.lineTo(-r * 0.38, -r * 1.45);
        ctx.closePath();
        ctx.fill();

        // Tassel
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.45);
        ctx.lineTo(r * 0.55, -r * 1.05);
        ctx.stroke();
        break;
      }

      case 'STAHLHELM': {
        // Germany Pickelhaube / Helmet
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -r * 0.6, r * 0.6, Math.PI, 0);
        ctx.fill();

        // Brass Spike
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(-4, -r * 1.2);
        ctx.lineTo(4, -r * 1.2);
        ctx.lineTo(0, -r * 1.6);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'BERET': {
        // France Beret
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(r * 0.15, -r * 0.85, r * 0.65, r * 0.25, 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'HEADBAND': {
        // Brazil Samba Headband
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-r * 0.85, -r * 0.5, r * 1.7, 7);
        break;
      }

      case 'HACHIMAKI': {
        // Japan Hachimaki Headband
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r * 0.85, -r * 0.5, r * 1.7, 7);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(0, -r * 0.45, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'TOP_HAT': {
        // UK Victorian Top Hat & Monocle
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-r * 0.75, -r * 0.85, r * 1.5, 5); // Brim
        ctx.fillRect(-r * 0.45, -r * 1.55, r * 0.9, r * 0.7); // Hat Body
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-r * 0.45, -r * 0.98, r * 0.9, 4); // Red ribbon

        // Gold Monocle on right eye
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r * 0.3, -r * 0.05, r * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'CHEF_HAT': {
        // Italy Chef Toque
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 1.15, r * 0.35, 0, Math.PI * 2);
        ctx.arc(r * 0.25, -r * 1.15, r * 0.35, 0, Math.PI * 2);
        ctx.arc(0, -r * 1.35, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'PLUNGER': {
        // Poland Plunger ("Poland can into space!")
        ctx.fillStyle = '#b45309'; // Wooden stick
        ctx.fillRect(-3, -r * 1.7, 6, r * 0.9);
        ctx.fillStyle = '#dc2626'; // Rubber suction cup
        ctx.beginPath();
        ctx.arc(0, -r * 0.8, r * 0.35, Math.PI, 0);
        ctx.fill();
        break;
      }

      case 'SOMBRERO': {
        // Mexico Sombrero
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.8, r * 1.1, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, -r * 1.15, r * 0.4, Math.PI, 0);
        ctx.fill();
        break;
      }

      case 'VIKING': {
        // Sweden Viking Horns
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, -r * 0.7, r * 0.55, Math.PI, 0);
        ctx.fill();
        // White Horns
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.7);
        ctx.lineTo(-r * 0.85, -r * 1.2);
        ctx.lineTo(-r * 0.35, -r * 0.85);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(r * 0.5, -r * 0.7);
        ctx.lineTo(r * 0.85, -r * 1.2);
        ctx.lineTo(r * 0.35, -r * 0.85);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'TURBAN': {
        // India Turban
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.85, r * 0.65, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
    ctx.restore();
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

  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'CONFETTI') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 1.6);
      } else if (p.shape === 'SPARK') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawScreenOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    interactiveMode: boolean
  ) {
    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.75);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Interactive Mode Crosshair cursor / hint
    if (interactiveMode) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);
    }
  }
}
