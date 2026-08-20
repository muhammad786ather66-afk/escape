import { Track, RacerState, TrackSegment, ActiveRaceEvent, ObstacleInstance } from '../types';
import { sound } from './audioSynth';

export class PhysicsEngine {
  private gravity = -22.0;

  public update(
    racers: RacerState[],
    track: Track,
    dt: number,
    activeEvent: ActiveRaceEvent | null,
    onCollision?: (intensity: number, mat: 'wood' | 'metal' | 'glass' | 'rubber') => void,
    onElimination?: (racer: RacerState, reason: string) => void,
    onFinished?: (racer: RacerState, rank: number) => void
  ) {
    // Modify gravity or speed based on active global event
    let effGravity = this.gravity;
    let speedMult = 1.0;
    if (activeEvent) {
      if (activeEvent.type === 'LOW_GRAVITY') effGravity = -9.8;
      if (activeEvent.type === 'SUPER_SPEED' || activeEvent.type === 'FINAL_SPRINT') speedMult = 1.45;
    }

    const aliveRacers = racers.filter((r) => !r.isEliminated);

    // 1. Update individual racer physics
    for (const racer of aliveRacers) {
      if (racer.isFinished) continue;

      // Apply Gravity
      racer.vy += effGravity * dt;

      // Find current track segment
      const seg = this.findSegmentForZ(track, racer.z);
      if (seg) {
        this.resolveTrackSurfaceCollision(racer, seg, dt, activeEvent, onCollision);
      }

      // Check obstacle collisions
      if (seg && seg.obstacles.length > 0) {
        this.resolveObstacleCollisions(racer, seg.obstacles, dt, activeEvent, onCollision);
      }

      // Trait / Personality modifier integration
      if (racer.ballDef.id === 'germany' && Math.abs(racer.vx) < 1.0) {
        // Autobahn straight line acceleration
        racer.vz += 3.5 * dt;
      }
      if (racer.ballDef.id === 'japan') {
        // High stability center lock
        racer.vx *= 0.96;
      }

      // Apply Boost timers
      if (racer.boostTimer > 0) {
        racer.boostTimer -= dt;
        racer.vz += 14.0 * dt * speedMult;
      }

      // Integrate positions
      racer.x += racer.vx * dt * speedMult;
      racer.y += racer.vy * dt * speedMult;
      racer.z += racer.vz * dt * speedMult;

      // Roll rotations (Euler spin)
      const rollSpeed = Math.sqrt(racer.vx * racer.vx + racer.vz * racer.vz) / racer.radius;
      racer.rotX += rollSpeed * dt * (racer.vz > 0 ? 1 : -1);
      racer.rotZ -= (racer.vx / racer.radius) * dt;

      // Squash and stretch spring decay
      racer.squashX += (1.0 - racer.squashX) * 12.0 * dt;
      racer.squashY += (1.0 - racer.squashY) * 12.0 * dt;
      racer.squashZ += (1.0 - racer.squashZ) * 12.0 * dt;

      // Track trail points
      if (Math.abs(racer.vz) > 5) {
        racer.trailPoints.unshift({ x: racer.x, y: racer.y - 0.2, z: racer.z, alpha: 0.8 });
        if (racer.trailPoints.length > 18) racer.trailPoints.pop();
      }
      for (const pt of racer.trailPoints) {
        pt.alpha -= dt * 1.5;
      }

      // Distance progress
      racer.distanceProgress = Math.min(1.0, Math.max(0.0, racer.z / track.totalLength));

      // Check finish line crossing
      if (racer.z >= track.finishZ && !racer.isFinished) {
        racer.isFinished = true;
        const finishedCount = racers.filter((r) => r.isFinished).length;
        racer.finishRank = finishedCount;
        racer.rank = finishedCount;
        sound.playFinishChime();
        if (onFinished) onFinished(racer, finishedCount);
      }

      // 2. Anti-Stuck & Fall-Off Eliminator Watchdog
      const minTrackY = seg ? Math.min(seg.startY, seg.endY) - 16 : -30;
      if (racer.y < minTrackY) {
        // Fallen off track!
        racer.isEliminated = true;
        racer.eliminationReason = 'Fell off track';
        sound.playElimination();
        if (onElimination) onElimination(racer, 'Fell off track');
        continue;
      }

      // Monitor forward velocity for anti-stuck
      if (Math.abs(racer.z - racer.lastProgressZ) < 0.4 && Math.abs(racer.vz) < 1.0) {
        racer.stuckTimer += dt;
        if (racer.stuckTimer > 3.0) {
          // Apply smart forward nudge impulse
          racer.vz += 12.0 + Math.random() * 6.0;
          racer.vy += 4.0;
          racer.vx += (Math.random() - 0.5) * 4.0;
          racer.stuckTimer = 0;
        }
      } else {
        racer.lastProgressZ = racer.z;
        racer.stuckTimer = 0;
      }
    }

    // 3. Sphere-Sphere Elastic/Plastic Collisions between racers
    for (let i = 0; i < aliveRacers.length; i++) {
      const rA = aliveRacers[i];
      if (rA.isFinished) continue;

      for (let j = i + 1; j < aliveRacers.length; j++) {
        const rB = aliveRacers[j];
        if (rB.isFinished) continue;

        const dx = rB.x - rA.x;
        const dy = rB.y - rA.y;
        const dz = rB.z - rA.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const minDist = rA.radius + rB.radius;

        if (distSq < minDist * minDist && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          // Positional separation
          const overlap = (minDist - dist) * 0.5;
          rA.x -= nx * overlap;
          rA.y -= ny * overlap;
          rA.z -= nz * overlap;
          rB.x += nx * overlap;
          rB.y += ny * overlap;
          rB.z += nz * overlap;

          // Relative velocity along normal
          const kx = rA.vx - rB.vx;
          const ky = rA.vy - rB.vy;
          const kz = rA.vz - rB.vz;
          const relVel = kx * nx + ky * ny + kz * nz;

          if (relVel > 0) {
            // Calculate restitution impulse
            const e = (rA.ballDef.restitution + rB.ballDef.restitution) * 0.5;
            const mA = rA.ballDef.mass;
            const mB = rB.ballDef.mass;
            const jImpulse = (-(1 + e) * relVel) / (1 / mA + 1 / mB);

            rA.vx += (jImpulse / mA) * nx;
            rA.vy += (jImpulse / mA) * ny;
            rA.vz += (jImpulse / mA) * nz;

            rB.vx -= (jImpulse / mB) * nx;
            rB.vy -= (jImpulse / mB) * ny;
            rB.vz -= (jImpulse / mB) * nz;

            // Squash deform on both balls
            const impactIntensity = Math.min(1.5, Math.abs(relVel) / 8.0);
            rA.squashY = Math.max(0.65, 1.0 - impactIntensity * 0.25);
            rB.squashY = Math.max(0.65, 1.0 - impactIntensity * 0.25);

            if (impactIntensity > 0.15 && onCollision) {
              onCollision(impactIntensity, 'glass');
            }
          }
        }
      }
    }

    // 4. Update relative rankings based on forward Z progress
    const activeComp = racers.slice().sort((a, b) => {
      if (a.isFinished && b.isFinished) return (a.finishRank || 99) - (b.finishRank || 99);
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      if (a.isEliminated && !b.isEliminated) return 1;
      if (!a.isEliminated && b.isEliminated) return -1;
      return b.z - a.z;
    });

    activeComp.forEach((racer, index) => {
      if (!racer.isFinished) {
        racer.rank = index + 1;
      }
    });
  }

  private findSegmentForZ(track: Track, z: number): TrackSegment | null {
    for (const seg of track.segments) {
      if (z >= seg.startZ && z <= seg.endZ + 2) {
        return seg;
      }
    }
    return track.segments[track.segments.length - 1] || null;
  }

  private resolveTrackSurfaceCollision(
    racer: RacerState,
    seg: TrackSegment,
    dt: number,
    activeEvent: ActiveRaceEvent | null,
    onCollision?: (intensity: number, mat: 'wood' | 'metal' | 'glass' | 'rubber') => void
  ) {
    const segLen = Math.max(1, seg.endZ - seg.startZ);
    const u = Math.max(0, Math.min(1, (racer.z - seg.startZ) / segLen));

    // Interpolate center path X and floor Y
    const centerX = seg.startX + (seg.endX - seg.startX) * u;
    const floorY = seg.startY + (seg.endY - seg.startY) * u;
    const slope = (seg.endY - seg.startY) / segLen; // negative means downhill

    const halfW = seg.width * 0.5;
    const leftLimit = centerX - halfW + racer.radius;
    const rightLimit = centerX + halfW - racer.radius;

    // 1. Guardrail Side Wall Collisions
    if (racer.x < leftLimit) {
      racer.x = leftLimit;
      if (racer.vx < 0) {
        racer.vx = -racer.vx * seg.bounciness;
        racer.vz += 1.5 * dt; // deflection forward
        if (Math.abs(racer.vx) > 2.0 && onCollision) onCollision(0.4, 'wood');
      }
    } else if (racer.x > rightLimit) {
      racer.x = rightLimit;
      if (racer.vx > 0) {
        racer.vx = -racer.vx * seg.bounciness;
        racer.vz += 1.5 * dt;
        if (Math.abs(racer.vx) > 2.0 && onCollision) onCollision(0.4, 'wood');
      }
    }

    // 2. Track Floor Collision & Slope Propulsion
    const targetY = floorY + racer.radius;
    if (racer.y <= targetY) {
      racer.y = targetY;

      // Downhill slope gravitational acceleration
      const slopeThrust = -slope * 28.0; // steeper downhill = faster
      racer.vz += slopeThrust * dt;

      // Friction
      let friction = seg.friction;
      if (seg.surfaceType === 'ICE' || (activeEvent && activeEvent.type === 'SLIPPERY_ICE')) {
        friction = 0.005; // super slick!
      } else if (seg.surfaceType === 'MUD') {
        friction = 0.35;
      }
      racer.vx *= Math.pow(1.0 - friction, dt * 60);
      racer.vz *= Math.pow(1.0 - friction * 0.5, dt * 60);

      // Bounce restitution if landing from air
      if (racer.vy < -2.0) {
        const impact = Math.min(1.0, Math.abs(racer.vy) / 15.0);
        racer.vy = -racer.vy * seg.bounciness * racer.ballDef.restitution;
        racer.squashY = Math.max(0.6, 1.0 - impact * 0.4);
        if (onCollision) onCollision(impact, 'wood');
      } else {
        racer.vy = 0;
      }
    }
  }

  private resolveObstacleCollisions(
    racer: RacerState,
    obstacles: ObstacleInstance[],
    dt: number,
    activeEvent: ActiveRaceEvent | null,
    onCollision?: (intensity: number, mat: 'wood' | 'metal' | 'glass' | 'rubber') => void
  ) {
    for (const obs of obstacles) {
      // Update obstacle dynamic phase
      obs.phase += obs.rotSpeed * (activeEvent?.type === 'CHAOS_STORM' ? 2.0 : 1.0);

      switch (obs.type) {
        case 'HAMMER': {
          // Giant swinging pendulum hammer
          const swing = Math.sin(obs.phase) * (obs.swingAngle || 1.1);
          const hammerX = obs.x + Math.sin(swing) * 6.0;
          const hammerY = obs.y - Math.cos(swing) * 6.0 + 3.0;
          const hammerZ = obs.z;

          const dx = racer.x - hammerX;
          const dy = racer.y - hammerY;
          const dz = racer.z - hammerZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < racer.radius + 2.0) {
            // WHAM! Giant Hammer Impact!
            const swingVel = Math.cos(obs.phase) * obs.rotSpeed * 120.0;
            racer.vx += (dx / (dist || 1)) * 18.0 + swingVel * 0.3;
            racer.vy += 8.0 + Math.random() * 4.0;
            racer.vz += 10.0;
            racer.squashY = 0.5;
            sound.playHammerSmash();
            if (onCollision) onCollision(1.0, 'metal');
          }
          break;
        }

        case 'BOUNCY_PADS': {
          // Pinball Bumper
          const dx = racer.x - obs.x;
          const dz = racer.z - obs.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < racer.radius + obs.sizeX * 0.5 && Math.abs(racer.y - obs.y) < 2.0) {
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            racer.vx = nx * 22.0;
            racer.vz = nz * 16.0 + 6.0;
            racer.vy = 8.0;
            racer.squashX = 0.7;
            racer.squashZ = 0.7;
            sound.playBouncyPad();
            if (onCollision) onCollision(0.8, 'rubber');
          }
          break;
        }

        case 'SPEED_RAMP': {
          // Speed Boost Arrow Pad
          const dx = Math.abs(racer.x - obs.x);
          const dz = Math.abs(racer.z - obs.z);
          if (dx < obs.sizeX * 0.5 && dz < obs.sizeZ * 0.5 && Math.abs(racer.y - obs.y) < 1.5) {
            racer.boostTimer = 1.2;
            sound.playSpeedBoost();
          }
          break;
        }

        case 'FUNNEL': {
          // Vortex suction pulling marbles toward drain center
          const dx = obs.x - racer.x;
          const dz = obs.z - racer.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < obs.sizeX * 0.5) {
            const pull = (1.0 - dist / (obs.sizeX * 0.5)) * 18.0;
            // Tangential swirl + inward pull
            racer.vx += (dx / (dist || 1)) * pull * dt - (dz / (dist || 1)) * 14.0 * dt;
            racer.vz += (dz / (dist || 1)) * pull * dt + (dx / (dist || 1)) * 14.0 * dt;
          }
          break;
        }

        case 'GIANT_FAN': {
          // Lateral wind stream
          if (Math.abs(racer.z - obs.z) < 6.0 && racer.y >= obs.y - 2 && racer.y <= obs.y + 4) {
            const blowDir = obs.x > 0 ? -1 : 1;
            racer.vx += blowDir * 24.0 * dt;
          }
          break;
        }

        case 'PINS': {
          // Pinball Pin Obstacle
          const dx = racer.x - obs.x;
          const dz = racer.z - obs.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < racer.radius + obs.sizeX * 0.5 && Math.abs(racer.y - obs.y) < 2.0) {
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            racer.vx = nx * 14.0;
            racer.vz = nz * 14.0;
            if (onCollision) onCollision(0.6, 'wood');
          }
          break;
        }
      }
    }
  }
}
