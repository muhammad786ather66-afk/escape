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

const TRACK_NAMES = [
  'Emerald Rolling Hills',
  'Sahara Dune Dash',
  'Glacier Glide Canyon',
  'Pacific Azure Archipelago',
  'Magma Peak Circuit',
  'Stratosphere Cloudway',
  'Amazon Canopy Slalom',
  'Cyber Gearworks Factory',
  'Sugar Rush Wonderland',
  'Supernova Cosmic Speedway',
  'Neon Highway Zero-G',
  'Cascade Falls Run',
  'Crystal Cavern Descent',
  'Balkan Mountain Pass',
  'Kowloon High-Rise Bridge',
  'Valkyrie Sky Fortress',
];

export class TrackGenerator {
  public static generateTrack(level: number, racerCount = 16): Track {
    const themeIndex = (level - 1) % THEMES_ORDER.length;
    const theme = THEMES_ORDER[themeIndex];
    const nameIndex = (level - 1) % TRACK_NAMES.length;
    const trackName = `${TRACK_NAMES[nameIndex]} ${level > TRACK_NAMES.length ? `II` : ''}`;

    // Base difficulty scales with level
    const difficulty = Math.min(10, 1 + Math.floor(level / 2));
    const segmentCount = Math.min(22, 7 + Math.floor(level * 0.8));

    const segments: TrackSegment[] = [];
    let currentX = 0;
    let currentY = 12; // Start elevated so gravity pulls marbles down
    let currentZ = 0;

    // 1. Starting Grid Segment (Wide, gentle downslope with side rails)
    const startLength = 28;
    const startSegment: TrackSegment = {
      id: 'seg_start',
      type: 'STRAIGHT',
      startX: currentX,
      startY: currentY,
      startZ: currentZ,
      endX: currentX,
      endY: currentY - 4,
      endZ: currentZ + startLength,
      width: 14,
      wallHeight: 2.2,
      friction: 0.05,
      bounciness: 0.4,
      obstacles: [],
      surfaceType: 'NORMAL',
    };
    segments.push(startSegment);

    currentX = startSegment.endX;
    currentY = startSegment.endY;
    currentZ = startSegment.endZ;

    // 2. Generate Spawn Positions on Starting Grid
    const spawnPositions: { x: number; y: number; z: number }[] = [];
    const cols = 4;
    const rows = Math.ceil(racerCount / cols);
    const spacingX = 2.4;
    const spacingZ = 2.8;

    for (let i = 0; i < racerCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = (col - (cols - 1) / 2) * spacingX;
      const offsetZ = 4 + row * spacingZ;
      const offsetY = currentY + 4 - (offsetZ / startLength) * 4 + 1.2;
      spawnPositions.push({
        x: currentX + offsetX,
        y: offsetY,
        z: offsetZ,
      });
    }

    // 3. Procedural Sequence of Interesting Obstacle Segments
    for (let s = 1; s < segmentCount; s++) {
      const segId = `seg_${s}`;
      const isLaterSection = s > 3;

      // Select segment archetype based on level and step
      let segType: TrackSegment['type'] = 'STRAIGHT';
      let surfaceType: TrackSegment['surfaceType'] = 'NORMAL';
      let segWidth = 12;
      let segLength = 24 + Math.random() * 8;
      let dY = -2.5 - Math.random() * 2.5;
      let dX = 0;
      const obstacles: ObstacleInstance[] = [];

      const roll = Math.random();

      if (roll < 0.2) {
        // Curve Left / Right
        const isLeft = Math.random() > 0.5;
        segType = isLeft ? 'CURVE_LEFT' : 'CURVE_RIGHT';
        dX = isLeft ? -12 : 12;
        segLength = 28;
        dY = -3.0;

        // Add pinball bumpers on outside of curves
        obstacles.push({
          id: `obs_${s}_bumper`,
          type: 'BOUNCY_PADS',
          x: currentX + dX * 0.5 + (isLeft ? 3 : -3),
          y: currentY + dY * 0.5 + 0.8,
          z: currentZ + segLength * 0.5,
          sizeX: 2.2,
          sizeY: 1.2,
          sizeZ: 2.2,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      } else if (roll < 0.35 && isLaterSection) {
        // Giant Funnel Bowl
        segType = 'FUNNEL';
        segWidth = 24;
        segLength = 32;
        dY = -5;
        obstacles.push({
          id: `obs_${s}_funnel`,
          type: 'FUNNEL',
          x: currentX,
          y: currentY + dY * 0.5,
          z: currentZ + segLength * 0.5,
          sizeX: 18,
          sizeY: 4,
          sizeZ: 18,
          rotation: 0,
          rotSpeed: 0.02,
          phase: 0,
        });
      } else if (roll < 0.5) {
        // Split Path: Main Safe Path vs Dangerous Speed Shortcut
        segType = 'SPLIT';
        segLength = 30;
        dY = -3.5;
        // Speed Boost on shortcut side
        obstacles.push({
          id: `obs_${s}_boost`,
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
      } else if (roll < 0.65) {
        // Seesaw Bridge / Narrow Suspended Bridge
        segType = 'SEESAW';
        segWidth = 8;
        segLength = 26;
        dY = -2;
        obstacles.push({
          id: `obs_${s}_seesaw`,
          type: 'SEESAW',
          x: currentX,
          y: currentY - 1,
          z: currentZ + segLength * 0.5,
          sizeX: 6,
          sizeY: 0.6,
          sizeZ: 18,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        });
      } else if (roll < 0.8) {
        // Steep Slope with Giant Swinging Hammers or Spinning Wheels
        segType = 'SLOPE_DOWN';
        dY = -6;
        segLength = 26;

        if (level >= 2) {
          const obsType: ObstacleType = Math.random() > 0.5 ? 'HAMMER' : 'SPINNING_WHEEL';
          obstacles.push({
            id: `obs_${s}_mach`,
            type: obsType,
            x: currentX,
            y: currentY + dY * 0.5 + (obsType === 'HAMMER' ? 4 : 0.8),
            z: currentZ + segLength * 0.5,
            sizeX: obsType === 'HAMMER' ? 5 : 8,
            sizeY: obsType === 'HAMMER' ? 2 : 1,
            sizeZ: 2,
            rotation: 0,
            rotSpeed: 0.04 + level * 0.005,
            phase: Math.random() * Math.PI * 2,
            swingAngle: Math.PI * 0.35,
          });
        }
      } else {
        // Elemental Zone (Ice, Mud, Water Rapids, Fire Zone)
        segType = 'STRAIGHT';
        segLength = 26;
        dY = -3;
        if (theme === 'ICE_WORLD') surfaceType = 'ICE';
        else if (theme === 'OCEAN') surfaceType = 'WATER';
        else if (theme === 'VOLCANO') surfaceType = 'NEON';
        else if (theme === 'DESERT') surfaceType = 'MUD';
        else surfaceType = Math.random() > 0.5 ? 'ICE' : 'BOOST';

        // Add giant fans or trapdoors
        if (level >= 3) {
          obstacles.push({
            id: `obs_${s}_fan`,
            type: 'GIANT_FAN',
            x: currentX + (Math.random() > 0.5 ? 6 : -6),
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

      // Add pinball obstacles / pins inside wide straight sections
      if (segWidth >= 10 && Math.random() > 0.6) {
        obstacles.push({
          id: `obs_${s}_pin_1`,
          type: 'PINS',
          x: currentX - 2.5,
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
          id: `obs_${s}_pin_2`,
          type: 'PINS',
          x: currentX + 2.5,
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
        wallHeight: 1.8,
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
      id: 'seg_finish',
      type: 'STRAIGHT',
      startX: currentX,
      startY: currentY,
      startZ: currentZ,
      endX: currentX,
      endY: currentY - 3,
      endZ: currentZ + finishLength,
      width: 14,
      wallHeight: 2.5,
      friction: 0.06,
      bounciness: 0.5,
      obstacles: [
        // Dual boost pads for thrilling final sprint!
        {
          id: 'obs_final_boost_l',
          type: 'SPEED_RAMP',
          x: currentX - 3,
          y: currentY - 1,
          z: currentZ + 8,
          sizeX: 2.4,
          sizeY: 0.2,
          sizeZ: 4.5,
          rotation: 0,
          rotSpeed: 0,
          phase: 0,
        },
        {
          id: 'obs_final_boost_r',
          type: 'SPEED_RAMP',
          x: currentX + 3,
          y: currentY - 1,
          z: currentZ + 8,
          sizeX: 2.4,
          sizeY: 0.2,
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
