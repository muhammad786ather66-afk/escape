import { RacerState, TrackData, Obstacle, Particle, UserBoostPad } from '../types';
import { sound } from './audioSynth';

export class PhysicsEngine {
  private gravity = 0.38;
  private airFriction = 0.992;
  private ballRestitution = 0.75;
  private wallRestitution = 0.7;

  public update(
    racers: RacerState[],
    track: TrackData,
    userBoostPads: UserBoostPad[],
    particles: Particle[],
    dt: number,
    onFinisher: (racer: RacerState, rank: number) => void
  ) {
    const clampedDt = Math.min(1.8, Math.max(0.2, dt));

    // 1. Update Obstacles Animation (Rotations, Lasers)
    for (const obs of track.obstacles) {
      if (obs.rotationSpeed !== 0) {
        obs.rotation += obs.rotationSpeed * clampedDt;
      }
      if (obs.type === 'LASER_GATE' && obs.phase !== undefined) {
        obs.phase += 0.05 * clampedDt;
        obs.laserActive = Math.sin(obs.phase) > -0.2;
      }
    }

    // 2. Update Racers Physics
    for (let i = 0; i < racers.length; i++) {
      const racer = racers[i];
      if (racer.isEliminated) continue;

      // Apply Gravity
      racer.vy += this.gravity * racer.ball.weightMultiplier * clampedDt;

      // Apply Air Friction
      racer.vx *= this.airFriction;
      racer.vy *= this.airFriction;

      // Speed limits
      const maxSpeed = 32 * racer.ball.speedMultiplier;
      const currentSpeed = Math.hypot(racer.vx, racer.vy);
      if (currentSpeed > maxSpeed) {
        const ratio = maxSpeed / currentSpeed;
        racer.vx *= ratio;
        racer.vy *= ratio;
      }

      // Position update
      racer.x += racer.vx * clampedDt;
      racer.y += racer.vy * clampedDt;

      // Angular velocity and ball rolling rotation
      racer.rotation += (racer.vx / racer.radius) * clampedDt * 0.8;

      // Squash and stretch decay
      racer.squishX += (1 - racer.squishX) * 0.15 * clampedDt;
      racer.squishY += (1 - racer.squishY) * 0.15 * clampedDt;

      // Trail particle generation for lead/fast balls
      if (currentSpeed > 8) {
        racer.trailHistory.unshift({ x: racer.x, y: racer.y, alpha: 0.65 });
        if (racer.trailHistory.length > 8) {
          racer.trailHistory.pop();
        }
      } else if (racer.trailHistory.length > 0) {
        racer.trailHistory.pop();
      }

      // Boost timer decay
      if (racer.boostTimer > 0) {
        racer.boostTimer -= clampedDt;
        // Boost sparks
        if (Math.random() < 0.3) {
          particles.push({
            x: racer.x + (Math.random() * 10 - 5),
            y: racer.y + (Math.random() * 10 - 5),
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

      // Track Wall Collisions
      for (const wall of track.walls) {
        this.resolveWallCollision(racer, wall, particles);
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
          this.createConfetti(particles, racer.x, racer.y, 40);
        }
      }

      // Distance score for leaderboard sorting
      racer.distance = racer.y;

      // Anti-Stuck System (Safety Watchdog)
      if (Math.abs(racer.y - racer.lastY) < 1.5 && !racer.isFinished) {
        racer.stuckTimer += clampedDt;
        if (racer.stuckTimer > 70) {
          // Give an automatic forward/lateral impulse
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
        this.resolveBallBallCollision(racers[i], racers[j], particles);
      }
    }

    // 4. Update Particles
    for (let p = particles.length - 1; p >= 0; p--) {
      const part = particles[p];
      part.x += part.vx * clampedDt;
      part.y += part.vy * clampedDt;
      part.vy += 0.15 * clampedDt; // slight particle gravity
      part.life += clampedDt;
      part.alpha = Math.max(0, 1 - part.life / part.maxLife);
      if (part.life >= part.maxLife) {
        particles.splice(p, 1);
      }
    }

    // 5. Update Ranks for Leaderboard
    const sorted = racers.slice().sort((a, b) => {
      if (a.isFinished && b.isFinished) return (a.finishRank || 99) - (b.finishRank || 99);
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.y - a.y;
    });

    sorted.forEach((r, idx) => {
      r.rank = idx + 1;
    });
  }

  private resolveBallBallCollision(r1: RacerState, r2: RacerState, particles: Particle[]) {
    const dx = r2.x - r1.x;
    const dy = r2.y - r1.y;
    const dist = Math.hypot(dx, dy);
    const minDist = r1.radius + r2.radius;

    if (dist > 0 && dist < minDist) {
      // Normal vector
      const nx = dx / dist;
      const ny = dy / dist;

      // Positional overlap resolution
      const overlap = minDist - dist;
      const totalMass = r1.mass + r2.mass;
      r1.x -= nx * overlap * (r2.mass / totalMass);
      r1.y -= ny * overlap * (r2.mass / totalMass);
      r2.x += nx * overlap * (r1.mass / totalMass);
      r2.y += ny * overlap * (r1.mass / totalMass);

      // Relative velocity along normal
      const kx = r1.vx - r2.vx;
      const ky = r1.vy - r2.vy;
      const p = 2 * (nx * kx + ny * ky) / totalMass;

      // Elastic response
      const restitution = this.ballRestitution * (r1.bounciness + r2.bounciness) * 0.5;
      r1.vx -= p * r2.mass * nx * restitution;
      r1.vy -= p * r2.mass * ny * restitution;
      r2.vx += p * r1.mass * nx * restitution;
      r2.vy += p * r1.mass * ny * restitution;

      // Impact squish
      r1.squishX = 0.85;
      r1.squishY = 1.18;
      r2.squishX = 0.85;
      r2.squishY = 1.18;

      const impactSpeed = Math.hypot(kx, ky);
      if (impactSpeed > 4) {
        sound.playBounce(impactSpeed);
        // Tiny collision sparks
        if (impactSpeed > 10 && Math.random() < 0.4) {
          const midX = (r1.x + r2.x) / 2;
          const midY = (r1.y + r2.y) / 2;
          this.createExplosionSparks(particles, midX, midY, '#facc15', 4);
        }
      }
    }
  }

  private resolveWallCollision(racer: RacerState, wall: { x1: number; y1: number; x2: number; y2: number; isBouncy?: boolean }, particles: Particle[]) {
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

      // Separate from wall
      racer.x = closestX + nx * racer.radius;
      racer.y = closestY + ny * racer.radius;

      // Dot product velocity with normal
      const dot = racer.vx * nx + racer.vy * ny;
      if (dot < 0) {
        const bounce = (wall.isBouncy ? 1.25 : this.wallRestitution) * racer.bounciness;
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
      case 'PINBALL_BUMPER':
      case 'BOUNCY_MUSHROOM': {
        const radius = obs.radius || 30;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);
        const minDist = racer.radius + radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          racer.x = obs.x + nx * minDist;
          racer.y = obs.y + ny * minDist;

          const power = (obs.power || 15) * (obs.type === 'BOUNCY_MUSHROOM' ? 1.2 : 1.0);
          racer.vx = nx * power;
          racer.vy = ny * power;

          racer.squishX = 0.75;
          racer.squishY = 1.35;

          sound.playBumper();
          this.createExplosionSparks(
            particles,
            obs.x + nx * radius,
            obs.y + ny * radius,
            obs.type === 'BOUNCY_MUSHROOM' ? '#a855f7' : '#ec4899',
            10
          );
        }
        break;
      }

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

          // Tangential blade speed
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

      case 'BOOST_PAD': {
        const w = obs.width || 40;
        const h = obs.height || 60;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vy = Math.max(racer.vy + 6, obs.power || 18);
          racer.boostTimer = 30;
          sound.playBoost();
          if (Math.random() < 0.2) {
            this.createExplosionSparks(particles, racer.x, racer.y, '#06b6d4', 6);
          }
        }
        break;
      }

      case 'LASER_GATE': {
        if (obs.laserActive) {
          const w = obs.width || 200;
          const h = obs.height || 16;
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

      case 'VORTEX_FUNNEL': {
        const radius = obs.radius || 100;
        const dx = racer.x - obs.x;
        const dy = racer.y - obs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          // Tangential swirl & slight center pull
          const angle = Math.atan2(dy, dx);
          const pull = (1 - dist / radius) * 0.7;
          racer.vx += -Math.sin(angle) * 1.6 - Math.cos(angle) * pull;
          racer.vy += Math.cos(angle) * 1.6 - Math.sin(angle) * pull + 0.2;
        }
        break;
      }

      case 'ICE_PATCH': {
        const w = obs.width || 200;
        const h = obs.height || 100;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vx *= 1.01; // almost frictionless glide
          racer.vy *= 1.01;
        }
        break;
      }

      case 'MUD_PATCH': {
        const w = obs.width || 200;
        const h = obs.height || 100;
        if (
          racer.x > obs.x - w / 2 &&
          racer.x < obs.x + w / 2 &&
          racer.y > obs.y - h / 2 &&
          racer.y < obs.y + h / 2
        ) {
          racer.vx *= 0.95;
          racer.vy *= 0.96;
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
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#facc15'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI - Math.PI / 2;
      const speed = 4 + Math.random() * 10;
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
