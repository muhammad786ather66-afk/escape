import { Track, TrackSegment, ObstacleInstance, TrackTheme, ObstacleType } from '../types';

const THEMES_ORDER: TrackTheme[] = [
  'GRASSLAND',
  'DESERT',
  'ICE_WORLD',
  'OCEAN',
  'VOLCANO',
  'SKY',
  'JUNGLE',
  'FACTORY',
  'CANDY_WORLD',
  'SPACE',
];

const TRACK_ADJECTIVES = [
  'Emerald', 'Sahara', 'Glacier', 'Pacific', 'Magma', 'Stratosphere', 'Amazon',
  'Cyber', 'Sugar', 'Supernova', 'Neon', 'Cascade', 'Crystal', 'Balkan', 'Kowloon',
  'Valkyrie', 'Astral', 'Thunder', 'Aurora', 'Solaris', 'Quantum', 'Obsidian',
  'Hyperion', 'Mirage', 'Apex', 'Phantom', 'Zenith', 'Inferno', 'Titan', 'Vortex',
];

const TRACK_NOUNS = [
  'Rolling Hills', 'Dune Dash', 'Glide Canyon', 'Azure Archipelago', 'Peak Circuit',
  'Cloudway', 'Canopy Slalom', 'Gearworks Factory', 'Wonderland', 'Cosmic Speedway',
  'Highway Zero-G', 'Falls Run', 'Cavern Descent', 'Mountain Pass', 'High-Rise Bridge',
  'Sky Fortress', 'Ridge Overdrive', 'Megaloop Sprint', 'Trench Velocity', 'Sector Speedway',
];

// Helper to convert integer to Roman numeral for infinite level titles
function toRoman(num: number): string {
  if (num <= 1) return 'I';
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let roman = '';
  for (let i = 0; i < val.length; i++) {
    while (num >= val[i]) {
      roman += syms[i];
      num -= val[i];
    }
  }
  return roman;
}

// Simple seedable pseudo-random generator
function createPRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TrackGenerator {
  public static generateTrack(level: number, racerCount = 16): Track {
    const rng = createPRNG(level * 7919 + 1337);

    // Pick Theme in repeating order but with procedural rotation
    const themeIndex = (level - 1) % THEMES_ORDER.length;
    const theme = THEMES_ORDER[themeIndex];

    // Generate Unique Track Name
    const adjIndex = Math.floor(rng() * TRACK_ADJECTIVES.length);
    const nounIndex = Math.floor(rng() * TRACK_NOUNS.length);
    const cycle = Math.floor((level - 1) / THEMES_ORDER.length) + 1;
    const suffix = cycle > 1 ? ` ${toRoman(cycle)}` : '';
    const trackName = `${TRACK_ADJECTIVES[adjIndex]} ${TRACK_NOUNS[nounIndex]}${suffix}`;

    // Base difficulty & segment count
    const difficulty = Math.min(10, 1 + Math.floor(level * 0.4));
    // Number of segments: 8 to 22
    const segmentCount = Math.min(24, 8 + Math.floor(level * 0.7));

    const segments: TrackSegment[] = [];
    let currentX = 0;
    let currentY = 16 + segmentCount * 2.2; // High enough start for steep gravity roll
    let currentZ = 0;

    // 1. Starting Grid Segment (Wide, gentle downslope with side rails)
    const startLength = 28;
    const startSegment: TrackSegment = {
      id: `seg_start_lvl_${level}`,
      type: 'STRAIGHT',
      startX: currentX,
      startY: currentY,
      startZ: currentZ,
      endX: currentX,
      endY: currentY - 4.5,
      endZ: currentZ + startLength,
      width: 14,
      wallHeight: 2.5,
      friction: 0.05,
      bounciness: 0.4,
      obstacles: [],
      surfaceType: 'NORMAL',
    };
    segments.push(startSegment);

    currentX = startSegment.endX;
    currentY = startSegment.endY;
    currentZ = startSegment.endZ;

    // 2. Spawn Positions on Starting Grid
    const spawnPositions: { x: number; y: number; z: number }[] = [];
    const cols = 4;
    const spacingX = 2.4;
    const spacingZ = 2.8;

    for (let i = 0; i < racerCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = (col - (cols - 1) / 2) * spacingX;
      const offsetZ = 4 + row * spacingZ;
      const offsetY = currentY + 4.5 - (offsetZ / startLength) * 4.5 + 1.2;
      spawnPositions.push({
        x: currentX + offsetX,
        y: offsetY,
        z: offsetZ,
      });
    }

    // 3. Procedural Sequence of Varied Track Sections
    for (let s = 1; s < segmentCount; s++) {
      const segId = `seg_${level}_${s}`;
      const isLaterSection = s > 2;

      let segType: TrackSegment['type'] = 'STRAIGHT';
      let surfaceType: TrackSegment['surfaceType'] = 'NORMAL';
      let segWidth = 11 + rng() * 3;
      let segLength = 24 + rng() * 10;
      let dY = -2.5 - rng() * 3.5;
      let dX = 0;
      const obstacles: ObstacleInstance[] = [];

      const roll = rng();

      if (roll < 0.22) {
        // Curve Left / Right with Banked Pinball Bumpers
        const isLeft = rng() > 0.5;
        segType = isLeft ? 'CURVE_LEFT' : 'CURVE_RIGHT';
        dX = isLeft ? -(10 + rng() * 6) : 10 + rng() * 6;
        segLength = 26 + rng() * 6;
        dY = -3.2;

        obstacles.push({
          id: `obs_${level}_${s}_bumper`,
          type: 'BOUNCY_PADS',
          x: currentX + dX * 0.5 + (isLeft ? 3.2 : -3.2),
          y: currentY + dY * 0.5 + 0.8,
          z: currentZ + segLength * 0.5,
          sizeX: 2.2,
          sizeY: 1.4,
          sizeZ: 2.2,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      } else if (roll < 0.38 && isLaterSection) {
        // Giant Funnel Vortex Bowl
        segType = 'FUNNEL';
        segWidth = 22;
        segLength = 32;
        dY = -5.5;
        obstacles.push({
          id: `obs_${level}_${s}_funnel`,
          type: 'FUNNEL',
          x: currentX,
          y: currentY + dY * 0.5,
          z: currentZ + segLength * 0.5,
          sizeX: 18,
          sizeY: 4.5,
          sizeZ: 18,
          rotation: 0,
          rotSpeed: 0.02 + level * 0.002,
          phase: 0,
        });
      } else if (roll < 0.54) {
        // Split Path: Shortcut with Boost Pad vs Safe Lane
        segType = 'SPLIT';
        segLength = 30;
        dY = -3.8;
        obstacles.push({
          id: `obs_${level}_${s}_boost`,
          type: 'SPEED_RAMP',
          x: currentX - 4,
          y: currentY + dY * 0.3 + 0.2,
          z: currentZ + 8,
          sizeX: 3,
          sizeY: 0.3,
          sizeZ: 5,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      } else if (roll < 0.68) {
        // Seesaw Mechanical Teeter-Totter
        segType = 'SEESAW';
        segWidth = 8;
        segLength = 26;
        dY = -2.2;
        obstacles.push({
          id: `obs_${level}_${s}_seesaw`,
          type: 'SEESAW',
          x: currentX,
          y: currentY - 1,
          z: currentZ + segLength * 0.5,
          sizeX: 6.5,
          sizeY: 0.6,
          sizeZ: 18,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      } else if (roll < 0.82) {
        // Steep Slope with Giant Swinging Hammers or Spinning Wheels
        segType = 'SLOPE_DOWN';
        dY = -6.5;
        segLength = 28;

        const obsType: ObstacleType = rng() > 0.5 ? 'HAMMER' : 'SPINNING_WHEEL';
        obstacles.push({
          id: `obs_${level}_${s}_mach`,
          type: obsType,
          x: currentX,
          y: currentY + dY * 0.5 + (obsType === 'HAMMER' ? 4.2 : 0.8),
          z: currentZ + segLength * 0.5,
          sizeX: obsType === 'HAMMER' ? 5.5 : 8.5,
          sizeY: obsType === 'HAMMER' ? 2.2 : 1,
          sizeZ: 2,
          rotation: 0,
          rotSpeed: 0.04 + Math.min(0.06, level * 0.004),
          phase: rng() * Math.PI * 2,
          swingAngle: Math.PI * 0.38,
        });
      } else {
        // Elemental Surface Zone (Ice, Mud, Water, Neon Hyperdrive)
        segType = 'STRAIGHT';
        segLength = 26;
        dY = -3.2;
        if (theme === 'ICE_WORLD') surfaceType = 'ICE';
        else if (theme === 'OCEAN') surfaceType = 'WATER';
        else if (theme === 'VOLCANO') surfaceType = 'NEON';
        else if (theme === 'DESERT') surfaceType = 'MUD';
        else surfaceType = rng() > 0.5 ? 'ICE' : 'BOOST';

        // Add giant fans
        if (level >= 2) {
          obstacles.push({
            id: `obs_${level}_${s}_fan`,
            type: 'GIANT_FAN',
            x: currentX + (rng() > 0.5 ? 5.5 : -5.5),
            y: currentY + dY * 0.5 + 1.5,
            z: currentZ + segLength * 0.5,
            sizeX: 4,
            sizeY: 4,
            sizeZ: 2,
            rotation: 0,
            rotSpeed: 0.1,
            phase: 0,
          });
        }
      }

      // Add pinball obstacles in wide straight sections
      if (segWidth >= 10 && rng() > 0.55) {
        obstacles.push({
          id: `obs_${level}_${s}_pin_1`,
          type: 'PINS',
          x: currentX - 2.8,
          y: currentY + dY * 0.5 + 0.8,
          z: currentZ + segLength * 0.3,
          sizeX: 1.2,
          sizeY: 1.8,
          sizeZ: 1.2,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
        obstacles.push({
          id: `obs_${level}_${s}_pin_2`,
          type: 'PINS',
          x: currentX + 2.8,
          y: currentY + dY * 0.5 + 0.8,
          z: currentZ + segLength * 0.6,
          sizeX: 1.2,
          sizeY: 1.8,
          sizeZ: 1.2,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      }

      const segment: TrackSegment = {
        id: segId,
        type: segType,
        startX: currentX,
        startY: currentY,
        startZ: currentZ,
        endX: currentX + dX,
        endY: currentY + dY,
        endZ: currentZ + segLength,
        width: segWidth,
        wallHeight: 1.9,
        friction: surfaceType === 'ICE' ? 0.005 : surfaceType === 'MUD' ? 0.25 : 0.04,
        bounciness: 0.45,
        obstacles,
        surfaceType,
      };

      segments.push(segment);
      currentX = segment.endX;
      currentY = segment.endY;
      currentZ = segment.endZ;
    }

    // 4. Final Sprint & Checkered Finish Line Segment
    const finishLength = 36;
    const finishSegment: TrackSegment = {
      id: `seg_finish_lvl_${level}`,
      type: 'STRAIGHT',
      startX: currentX,
      startY: currentY,
      startZ: currentZ,
      endX: currentX,
      endY: currentY - 3.5,
      endZ: currentZ + finishLength,
      width: 14,
      wallHeight: 2.6,
      friction: 0.06,
      bounciness: 0.5,
      obstacles: [
        // Dual boost ramps leading into the grand finale
        {
          id: `obs_final_boost_l_${level}`,
          type: 'SPEED_RAMP',
          x: currentX - 3.2,
          y: currentY - 1.2,
          z: currentZ + 8,
          sizeX: 2.4,
          sizeY: 0.25,
          sizeZ: 4.5,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        },
        {
          id: `obs_final_boost_r_${level}`,
          type: 'SPEED_RAMP',
          x: currentX + 3.2,
          y: currentY - 1.2,
          z: currentZ + 8,
          sizeX: 2.4,
          sizeY: 0.25,
          sizeZ: 4.5,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        },
      ],
      surfaceType: 'NORMAL',
    };
    segments.push(finishSegment);

    const totalLength = finishSegment.endZ;
    const finishZ = finishSegment.endZ - 4;

    return {
      id: `track_lvl_${level}`,
      level,
      name: trackName,
      theme,
      difficulty,
      totalLength,
      segments,
      spawnPositions,
      finishZ,
    };
  }
}
