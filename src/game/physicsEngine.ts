import { RacerState, TrackData, Obstacle, Particle, UserBoostPad } from '../types';
import { sound } from './audioSynth';

export class PhysicsEngine {
  public update(
    racers: RacerState[],
    track: TrackData,
    userBoostPads: UserBoostPad[],
    particles: Particle[],
    dt: number,
    onFinisher: (racer: RacerState, rank: number) => void
  ) {
    const clampedDt = Math.min(1.8, Math.max(0.2, dt));
    const phys = track.physicsConfig || {
      gravity: 0.16,
      airFriction: 0.994,
      wallRestitution: 0.70,
      ballRestitution: 0.74,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.0,
      physicsSummary: 'Standard 1.0G',
      ambientParticleType: 'SPARK',
    };

    const timeSec = performance.now() * 0.001;

    // 1. Update Obstacles Animation (Rotations, Lasers, Flamethrowers, Geysers, Fans)
    for (const obs of track.obstacles) {
      if (obs.rotationSpeed !== 0) {
        obs.rotation += obs.rotationSpeed * clampedDt * 0.7;
      }
      if (obs.type === 'LASER_GATE' && obs.phase !== undefined) {
        obs.phase += 0.035 * clampedDt;
        obs.laserActive = Math.sin(obs.phase) > -0.2;
      }
      if (obs.type === 'FLAMETHROWER' && obs.phase !== undefined) {
        obs.phase += 0.04 * clampedDt;
        obs.fireActive = Math.sin(obs.phase) > -0.3;

        // Emit flame particles when active
        if (obs.fireActive && Math.random() < 0.4) {
          const flameAngle = Math.PI / 2 + (Math.random() * 0.6 - 0.3);
          const speed = 3 + Math.random() * 5;
          particles.push({
            x: obs.x + (Math.random() * 12 - 6),
            y: obs.y + 10,
            vx: Math.cos(flameAngle) * speed,
            vy: Math.sin(flameAngle) * speed,
            color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
            size: 6 + Math.random() * 8,
            alpha: 0.9,
            life: 0,
            maxLife: 20 + Math.random() * 10,
            shape: 'FLAME',
          });
        }
      }
      if (obs.type === 'LAVA_GEYSER' && obs.phase !== undefined) {
        obs.phase += 0.05 * clampedDt;
        obs.fireActive = Math.sin(obs.phase) > 0.1;
        if (obs.fireActive && Math.random() < 0.5) {
          particles.push({
            x: obs.x + (Math.random() * 16 - 8),
            y: obs.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -4 - Math.random() * 6,
            color: Math.random() > 0.5 ? '#ff4500' : '#ffa500',
            size: 7 + Math.random() * 8,
            alpha: 0.95,
            life: 0,
            maxLife: 24,
            shape: 'FLAME',
          });
        }
      }
      if (obs.type === 'BUZZSAW_CUTTER' && Math.random() < 0.15) {
        const sa = obs.rotation + Math.random() * 0.5;
        particles.push({
          x: obs.x + Math.cos(sa) * (obs.radius || 36),
          y: obs.y + Math.sin(sa) * (obs.radius || 36),
          vx: Math.cos(sa) * 4,
          vy: Math.sin(sa) * 4,
          color: '#fbbf24',
          size: 3,
          alpha: 1,
          life: 0,
          maxLife: 10,
          shape: 'SPARK',
        });
      }
      if (obs.type === 'ICE_SPIRE' && Math.random() < 0.2) {
        const sa = obs.rotation + Math.random() * 0.5;
        particles.push({
          x: obs.x + Math.cos(sa) * (obs.radius || 34),
          y: obs.y + Math.sin(sa) * (obs.radius || 34),
          vx: Math.cos(sa) * 3,
          vy: Math.sin(sa) * 3,
          color: '#bae6fd',
          size: 3.5,
          alpha: 0.9,
          life: 0,
          maxLife: 12,
          shape: 'SPARK',
        });
      }
      if ((obs.type === 'WIND_FAN' || obs.type === 'SNOW_BLOWER') && Math.random() < 0.3) {
        particles.push({
          x: obs.x + 20,
          y: obs.y + (Math.random() * 30 - 15),
          vx: 5 + Math.random() * 4,
          vy: (Math.random() - 0.5) * 2,
          color: obs.type === 'SNOW_BLOWER' ? '#e0f2fe' : '#7dd3fc',
          size: 3,
          alpha: 0.8,
          life: 0,
          maxLife: 18,
          shape: 'SPARK',
        });
      }
    }

    // Dynamic wind calculation
    const currentWindX = phys.windGustX * Math.cos(timeSec * 1.5);
    const currentWindY = phys.windGustY;

    // 2. Update Racers Physics
    for (let i = 0; i < racers.length; i++) {
      const racer = racers[i];
      if (racer.isEliminated) continue;

      // Apply Theme-Specific Gravity
      racer.vy += phys.gravity * racer.ball.weightMultiplier * clampedDt;

      // Apply Theme Wind Current
      racer.vx += currentWindX * clampedDt;
      racer.vy += currentWindY * clampedDt;

      // Check slipstream draft from balls ahead (keeps competition close & intense!)
      let slipstreamBoost = 1.0;
      for (let j = 0; j < racers.length; j++) {
        if (i !== j && !racers[j].isEliminated) {
          const dy = racer.y - racers[j].y;
          const dx = Math.abs(racer.x - racers[j].x);
          if (dy > 20 && dy < 140 && dx < 35) {
            slipstreamBoost = 1.025; // Slipstream draft boost
            if (Math.random() < 0.05) {
              particles.push({
                x: racer.x,
                y: racer.y - racer.radius,
                vx: (Math.random() - 0.5) * 2,
                vy: -3,
                color: '#67e8f9',
                size: 3,
                alpha: 0.7,
                life: 0,
                maxLife: 12,
                shape: 'SPARK',
              });
            }
            break;
          }
        }
      }

      // Apply Air Friction (Adjusted by theme)
      racer.vx *= phys.airFriction;
      racer.vy *= phys.airFriction * slipstreamBoost;

      // Speed limits - moderate so viewer can appreciate flag details
      const maxSpeed = 14.2 * racer.ball.speedMultiplier * (phys.surfaceSlickness || 1.0);
      const currentSpeed = Math.hypot(racer.vx, racer.vy);
      if (currentSpeed > maxSpeed) {
        const ratio = maxSpeed / currentSpeed;
        racer.vx *= ratio;
        racer.vy *= ratio;
      }

      // Position update
      racer.x += racer.vx * clampedDt;
      racer.y += racer.vy * clampedDt;

      // Rolling rotation
      racer.rotation += (racer.vx / racer.radius) * clampedDt * 0.8;

      // Squash and stretch decay
      racer.squishX += (1 - racer.squishX) * 0.15 * clampedDt;
      racer.squishY += (1 - racer.squishY) * 0.15 * clampedDt;

      // Trail particle history
      if (currentSpeed > 7.5) {
        racer.trailHistory.unshift({ x: racer.x, y: racer.y, alpha: 0.65 });
        if (racer.trailHistory.length > 8) {
          racer.trailHistory.pop();
        }
      } else if (racer.trailHistory.length > 0) {
        racer.trailHistory.pop();
      }

      // Boost timer
      if (racer.boostTimer > 0) {
        racer.boostTimer -= clampedDt;
        if (Math.random() < 0.35) {
          particles.push({
            x: racer.x + (Math.random() * 12 - 6),
            y: racer.y + (Math.random() * 12 - 6),
            vx: -racer.vx * 0.3 + (Math.random() * 4 - 2),
            vy: -racer.vy * 0.3 + (Math.random() * 4 - 2),
            color: '#38bdf8',
            size: 4 + Math.random() * 4,
            alpha: 1,
            life: 0,
            maxLife: 20,
            shape: 'SPARK',
          });
        }
      }

      // Hazard Hit Timer
      if (racer.hazardHitTimer && racer.hazardHitTimer > 0) {
        racer.hazardHitTimer -= clampedDt;
      }

      // Track Wall Collisions
      for (const wall of track.walls) {
        this.resolveWallCollision(racer, wall, particles, phys.wallRestitution);
      }

      // Obstacle Collisions
      for (const obs of track.obstacles) {
        this.resolveObstacleCollision(racer, obs, particles);
      }

      // User Boost Pad Collisions
      for (const pad of userBoostPads) {
        const dist = Math.hypot(racer.x - pad.x, racer.y - pad.y);
        if (dist < racer.radius + pad.radius) {
          racer.vy += pad.power;
          racer.boostTimer = 40;
          sound.playBoost();
          this.createExplosionSparks(particles, pad.x, pad.y, '#38bdf8', 12);
        }
      }

      // Finish Line Detection
      if (!racer.isFinished && racer.y >= track.finishY) {
        racer.isFinished = true;
        const finishedCount = racers.filter((r) => r.isFinished).length;
        racer.finishRank = finishedCount;
        sound.playFinishHorn();
        onFinisher(racer, finishedCount);

        // Celebration confetti burst for winner
        if (finishedCount === 1) {
          this.createConfetti(particles, racer.x, racer.y, 45);
          sound.playCrowdCheer();
        }
      }

      // Distance score for leaderboard sorting
      racer.distance = racer.y;

      // Anti-Stuck System (Safety Watchdog)
      if (Math.abs(racer.y - racer.lastY) < 1.5 && !racer.isFinished) {
        racer.stuckTimer += clampedDt;
        if (racer.stuckTimer > 60) {
          racer.vx += (Math.random() * 8 - 4);
          racer.vy += 6 + Math.random() * 4;
          racer.stuckTimer = 0;
        }
      } else {
        racer.stuckTimer = 0;
        racer.lastY = racer.y;
      }
    }

    // 3. Ball-to-Ball Elastic Collisions
    for (let i = 0; i < racers.length; i++) {
      for (let j = i + 1; j < racers.length; j++) {
        this.resolveBallBallCollision(racers[i], racers[j], particles, phys.ballRestitution);
      }
    }

    // 4. Update Particles
    for (let p = particles.length - 1; p >= 0; p--) {
      const part = particles[p];
      part.x += part.vx * clampedDt;
      part.y += part.vy * clampedDt;
      if (part.shape !== 'FLAME') {
        part.vy += 0.15 * clampedDt;
      } else {
        part.size += 0.15 * clampedDt;
      }
      part.life += clampedDt;
      part.alpha = Math.max(0, 1 - part.life / part.maxLife);

      if (part.life >= part.maxLife) {
        particles.splice(p, 1);
      }
    }

    // 5. Update Ranks for Leaderboard
    const sorted = racers.slice().sort((a, b) => {
      if (a.isFinished && b.isFinished) return (a.finishRank || 999) - (b.finishRank || 999);
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.y - a.y;
    });

    sorted.forEach((r, idx) => {
      r.rank = idx + 1;
    });
  }

  private resolveBallBallCollision(
    r1: RacerState,
    r2: RacerState,
    particles: Particle[],
    ballRestitution: number
  ) {
    const dx = r2.x - r1.x;
    const dy = r2.y - r1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = r1.radius + r2.radius;

    if (dist > 0 && dist < minDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      const overlap = minDist - dist;
      const totalMass = r1.mass + r2.mass;
      r1.x -= nx * overlap * (r2.mass / totalMass);
      r1.y -= ny * overlap * (r2.mass / totalMass);
      r2.x += nx * overlap * (r1.mass / totalMass);
      r2.y += ny * overlap * (r1.mass / totalMass);

      const kx = r1.vx - r2.vx;
      const ky = r1.vy - r2.vy;
      const p = (2 * (nx * kx + ny * ky)) / totalMass;

      const restitution = ballRestitution * (r1.bounciness + r2.bounciness) * 0.5;
      r1.vx -= p * r2.mass * nx * restitution;
      r1.vy -= p * r2.mass * ny * restitution;
      r2.vx += p * r1.mass * nx * restitution;
      r2.vy += p * r1.mass * ny * restitution;

      r1.squishX = 0.85;
      r1.squishY = 1.18;
      r2.squishX = 0.85;
      r2.squishY = 1.18;

      const impactSpeed = Math.hypot(kx, ky);
      if (impactSpeed > 4) {
        sound.playBounce(impactSpeed);
        if (impactSpeed > 10 && Math.random() < 0.4) {
          const midX = (r1.x + r2.x) / 2;
          const midY = (r1.y + r2.y) / 2;
          this.createExplosionSparks(particles, midX, midY, '#facc15', 4);
        }
      }
    }
  }

  private resolveWallCollision(
    racer: RacerState,
    wall: { x1: number; y1: number; x2: number; y2: number; isBouncy?: boolean },
    particles: Particle[],
    baseWallRestitution: number
  ) {
    const l2 = (wall.x2 - wall.x1) ** 2 + (wall.y2 - wall.y1) ** 2;
    if (l2 === 0) return;

    let t = ((racer.x - wall.x1) * (wall.x2 - wall.x1) + (racer.y - wall.y1) * (wall.y2 - wall.y1)) / l2;
    t = Math.max(0, Math.min(1, t));

    const closestX = wall.x1 + t * (wall.x2 - wall.x1);
    const closestY = wall.y1 + t * (wall.y2 - wall.y1);

    const dx = racer.x - closestX;
    const dy = racer.y - closestY;
    const dist = Math.hypot(dx, dy);

    if (dist < racer.radius && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      racer.x = closestX + nx * racer.radius;
      racer.y = closestY + ny * racer.radius;

      const dot = racer.vx * nx + racer.vy * ny;
      if (dot < 0) {
        const bounce = (wall.isBouncy ? 1.25 : baseWallRestitution) * racer.bounciness;
        racer.vx -= (1 + bounce) * dot * nx;
        racer.vy -= (1 + bounce) * dot * ny;

        racer.squishX = 0.88;
        racer.squishY = 1.15;

        const impactSpeed = Math.abs(dot);
        if (impactSpeed > 4) {
          sound.playBounce(impactSpeed);
          if (impactSpeed > 8) {
            this.createExplosionSparks(particles, closestX, closestY, '#cbd5e1', 3);
          }
        }
      }
    }
  }

  private resolveObstacleCollision(racer: RacerState, obs: Obstacle, particles: Particle[]) {
    switch (obs.type) {
      // 1. FLAMETHROWER
      case 'FLAMETHROWER': {
        const radius = obs.radius || 28;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < racer.radius + radius && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * (racer.radius + radius);
          racer.y = obs.y + ny * (racer.radius + radius);
          racer.vx = nx * 10;
          racer.vy = ny * 10;
          sound.playBumper();
        }

        if (obs.fireActive && dy > 0 && dy < 130 && Math.abs(dx) < 45) {
          racer.vy += 4.5;
          racer.vx += (Math.random() * 6 - 3);
          racer.hazardHitTimer = 30;
          sound.playFireWhoosh();
          this.createExplosionSparks(particles, racer.x, racer.y, '#f97316', 8);
        }
        break;
      }

      // 2. LAVA GEYSER
      case 'LAVA_GEYSER': {
        const radius = obs.radius || 30;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < racer.radius + radius && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * (racer.radius + radius);
          racer.y = obs.y + ny * (racer.radius + radius);
          racer.vx = nx * 12;
          racer.vy = ny * 12;
          sound.playBumper();
        }

        if (obs.fireActive && Math.abs(dx) < 40 && Math.abs(dy) < 50) {
          racer.vy += 7;
          racer.vx += (Math.random() * 10 - 5);
          racer.hazardHitTimer = 35;
          sound.playFireWhoosh();
          this.createExplosionSparks(particles, racer.x, racer.y, '#ff4500', 12);
        }
        break;
      }

      // 3. BUZZSAW CUTTER
      case 'BUZZSAW_CUTTER': {
        const radius = obs.radius || 36;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = racer.radius + radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * minDist;
          racer.y = obs.y + ny * minDist;

          const sawSpeed = 16;
          const tx = -ny * (obs.rotationSpeed > 0 ? 1 : -1);
          const ty = nx * (obs.rotationSpeed > 0 ? 1 : -1);

          racer.vx = nx * (obs.power || 16) * 0.6 + tx * sawSpeed * 0.4;
          racer.vy = ny * (obs.power || 16) * 0.6 + ty * sawSpeed * 0.4 + 2;

          racer.hazardHitTimer = 25;
          sound.playBuzzsaw();
          this.createExplosionSparks(particles, obs.x + nx * radius, obs.y + ny * radius, '#facc15', 12);
        }
        break;
      }

      // 4. ICE SPIRE
      case 'ICE_SPIRE': {
        const radius = obs.radius || 34;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = racer.radius + radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * minDist;
          racer.y = obs.y + ny * minDist;

          racer.vx = nx * (obs.power || 16) * 0.8;
          racer.vy = ny * (obs.power || 16) * 0.8 + 3;

          racer.hazardHitTimer = 20;
          sound.playBounce(12);
          this.createExplosionSparks(particles, obs.x + nx * radius, obs.y + ny * radius, '#7dd3fc', 10);
        }
        break;
      }

      // 5. SNOW BLOWER & WIND FAN
      case 'SNOW_BLOWER':
      case 'WIND_FAN': {
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        if (dx > 0 && dx < 220 && Math.abs(dy) < 55) {
          const force = (1 - dx / 220) * (obs.power || 16) * 0.18;
          racer.vx += force;
          racer.vy += 0.3;
          if (Math.random() < 0.1) {
            sound.playWhoosh();
          }
        }
        break;
      }

      // 6. CLOUD TRAMPOLINE
      case 'CLOUD_TRAMPOLINE': {
        const radius = obs.radius || 36;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = racer.radius + radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * minDist;
          racer.y = obs.y + ny * minDist;

          racer.vx = nx * 8;
          racer.vy = Math.max(14, ny * 18);
          racer.squishX = 0.65;
          racer.squishY = 1.45;

          sound.playBumper();
          this.createExplosionSparks(particles, obs.x, obs.y, '#bae6fd', 14);
        }
        break;
      }

      // 7. BLACK HOLE & SANDSTORM VORTEX
      case 'BLACK_HOLE':
      case 'VORTEX_FUNNEL':
      case 'SANDSTORM_VORTEX': {
        const radius = obs.radius || 80;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const angle = Math.atan2(dy, dx);
          const intensity = 1 - dist / radius;

          // Swirl orbital force
          racer.vx += -Math.sin(angle) * 2.5 * intensity;
          racer.vy += Math.cos(angle) * 2.5 * intensity + 0.3;

          // Pull towards center
          racer.vx -= Math.cos(angle) * 0.9 * intensity;
          racer.vy -= Math.sin(angle) * 0.9 * intensity;

          if (dist < 24 && Math.random() < 0.2) {
            sound.playVortexHole();
            this.createExplosionSparks(
              particles,
              racer.x,
              racer.y,
              obs.type === 'SANDSTORM_VORTEX' ? '#f59e0b' : '#c084fc',
              6
            );
          }
        }
        break;
      }

      // 8. PINBALL BUMPERS, PYRAMIDS & MUSHROOMS
      case 'PINBALL_BUMPER':
      case 'PYRAMID_BUMPER':
      case 'BOUNCY_MUSHROOM': {
        const radius = obs.radius || 28;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = racer.radius + radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * minDist;
          racer.y = obs.y + ny * minDist;

          const power = (obs.power || 15) * (obs.type === 'BOUNCY_MUSHROOM' ? 1.25 : 1.0);
          racer.vx = nx * power;
          racer.vy = ny * power;

          racer.squishX = 0.75;
          racer.squishY = 1.35;

          sound.playBumper();
          const sparkColor =
            obs.type === 'BOUNCY_MUSHROOM'
              ? '#10b981'
              : obs.type === 'PYRAMID_BUMPER'
              ? '#fbbf24'
              : '#ec4899';
          this.createExplosionSparks(particles, obs.x + nx * radius, obs.y + ny * radius, sparkColor, 10);
        }
        break;
      }

      // 9. ROTATING HAMMERS & BARS
      case 'SPINNING_HAMMER':
      case 'ROTATING_BAR': {
        const halfLen = (obs.length || 140) / 2;
        const cos = Math.cos(obs.rotation);
        const sin = Math.sin(obs.rotation);

        const x1 = obs.x - cos * halfLen;
        const y1 = obs.y - sin * halfLen;
        const x2 = obs.x + cos * halfLen;
        const y2 = obs.y + sin * halfLen;

        const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        let t = ((racer.x - x1) * (x2 - x1) + (racer.y - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));

        const cx = x1 + t * (x2 - x1);
        const cy = y1 + t * (y2 - y1);

        const dx = racer.x - cx;
        const dy = racer.y - cy;
        const dist = Math.hypot(dx, dy);
        const barThickness = 12;

        if (dist < racer.radius + barThickness && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;

          racer.x = cx + nx * (racer.radius + barThickness);
          racer.y = cy + ny * (racer.radius + barThickness);

          const distFromCenter = Math.hypot(cx - obs.x, cy - obs.y);
          const tangentSpeed = distFromCenter * obs.rotationSpeed * 35;
          const tx = -sin * (obs.rotationSpeed > 0 ? 1 : -1);
          const ty = cos * (obs.rotationSpeed > 0 ? 1 : -1);

          racer.vx = nx * 8 + tx * Math.abs(tangentSpeed) * 0.6;
          racer.vy = ny * 8 + ty * Math.abs(tangentSpeed) * 0.6 + 2;

          sound.playBumper();
          this.createExplosionSparks(particles, cx, cy, '#f59e0b', 8);
        }
        break;
      }

      // 10. BOOST PADS
      case 'BOOST_PAD': {
        const w = obs.width || 44;
        const h = obs.height || 65;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vy = Math.max(racer.vy + 7, obs.power || 20);
          racer.boostTimer = 30;
          sound.playBoost();
          if (Math.random() < 0.25) {
            this.createExplosionSparks(particles, racer.x, racer.y, '#06b6d4', 6);
          }
        }
        break;
      }

      // 11. LASER GATES
      case 'LASER_GATE': {
        if (obs.laserActive) {
          const w = obs.width || 240;
          const h = obs.height || 18;
          if (
            racer.x > obs.x - w / 2 &&
            racer.x < obs.x + w / 2 &&
            racer.y > obs.y - h / 2 &&
            racer.y < obs.y + h / 2
          ) {
            racer.vy = -Math.abs(racer.vy) * 0.8 - 4;
            racer.vx += (Math.random() * 8 - 4);
            sound.playLaser();
            this.createExplosionSparks(particles, racer.x, racer.y, '#ef4444', 10);
          }
        }
        break;
      }

      // 12. SURFACE PATCHES (ICE, MUD, QUICKSAND)
      case 'ICE_PATCH': {
        const w = obs.width || 240;
        const h = obs.height || 100;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vx *= 1.015;
          racer.vy *= 1.015;
        }
        break;
      }

      case 'MUD_PATCH':
      case 'QUICKSAND_PIT': {
        const w = obs.width || 240;
        const h = obs.height || 100;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vx *= 0.94;
          racer.vy *= 0.95;
        }
        break;
      }
    }
  }

  private createExplosionSparks(particles: Particle[], x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 15 + Math.random() * 15,
        shape: 'SPARK',
      });
    }
  }

  private createConfetti(particles: Particle[], x: number, y: number, count: number) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#facc15', '#06b6d4'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI - Math.PI / 2;
      const speed = 4 + Math.random() * 12;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        shape: 'CONFETTI',
      });
    }
  }
}
