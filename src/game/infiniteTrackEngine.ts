import { TrackData, TrackTheme, Obstacle, TrackWall } from '../types';

const THEMES: TrackTheme[] = [
  'GRASSLAND',
  'DESERT',
  'CYBER_NEON',
  'ICE_GLACIER',
  'VOLCANO',
  'SPACE_COSMOS',
  'FACTORY',
  'CANDY_LAND',
  'JUNGLE',
  'SYNTHWAVE',
];

const THEME_NAMES: Record<TrackTheme, string[]> = {
  GRASSLAND: ['Emerald Meadows', 'Alpine Slalom', 'Blover Valley', 'Green Ridge'],
  DESERT: ['Sahara Mirage', 'Dune Tempest', 'Pyramid Canyon', 'Oasis Descent'],
  CYBER_NEON: ['Cyberpunk Overdrive', 'Neon Grid 2099', 'Matrix Speedway', 'Laser Circuit'],
  ICE_GLACIER: ['Glacier Drop', 'Frostbite Pass', 'Blizzard Chasm', 'Arctic Slide'],
  VOLCANO: ['Magma Abyss', 'Inferno Ridge', 'Obsidian Crater', 'Lava Plunge'],
  SPACE_COSMOS: ['Cosmic Nebula', 'Zero-G Stargate', 'Asteroid Belt', 'Hyperion Warp'],
  FACTORY: ['Clockwork Gearworks', 'Piston Foundry', 'Conveyor Sector', 'Steam Hazard'],
  CANDY_LAND: ['Sugar Rush Speedway', 'Gummy Slopes', 'Lollipop Vortex', 'Caramel Falls'],
  JUNGLE: ['Amazon Canopy', 'Wild Monsoon', 'Temple of Ruins', 'Vine Cascade'],
  SYNTHWAVE: ['Outrun Highway', 'Retrowave Sunset', 'Palm Breeze 84', 'Midnight Horizon'],
};

const THEME_COLORS: Record<
  TrackTheme,
  { bg: [string, string, string]; accent: string; rail: string }
> = {
  GRASSLAND: {
    bg: ['#0f2e1a', '#081c0f', '#020b06'],
    accent: '#22c55e',
    rail: '#86efac',
  },
  DESERT: {
    bg: ['#3b220c', '#231205', '#0e0602'],
    accent: '#f59e0b',
    rail: '#fde68a',
  },
  CYBER_NEON: {
    bg: ['#090924', '#040417', '#01010a'],
    accent: '#06b6d4',
    rail: '#a5f3fc',
  },
  ICE_GLACIER: {
    bg: ['#0c2738', '#071520', '#02070d'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
  },
  VOLCANO: {
    bg: ['#360d0d', '#1f0505', '#0a0101'],
    accent: '#ef4444',
    rail: '#fca5a5',
  },
  SPACE_COSMOS: {
    bg: ['#160829', '#0c0317', '#030108'],
    accent: '#a855f7',
    rail: '#f3e8ff',
  },
  FACTORY: {
    bg: ['#262626', '#141414', '#080808'],
    accent: '#eab308',
    rail: '#fef08a',
  },
  CANDY_LAND: {
    bg: ['#380c26', '#1f0414', '#0a0106'],
    accent: '#ec4899',
    rail: '#fbcfe8',
  },
  JUNGLE: {
    bg: ['#112918', '#08170c', '#020a04'],
    accent: '#10b981',
    rail: '#a7f3d0',
  },
  SYNTHWAVE: {
    bg: ['#280838', '#14031d', '#05000a'],
    accent: '#d946ef',
    rail: '#fae8ff',
  },
};

// Seeded PRNG
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export class InfiniteTrackEngine {
  public static generateTrack(level: number): TrackData {
    const rng = createPRNG(level * 68921 + 104729);

    const themeIndex = (level - 1) % THEMES.length;
    const theme = THEMES[themeIndex];
    const namesList = THEME_NAMES[theme];
    const nameBase = namesList[Math.floor(rng() * namesList.length)];
    const cycle = Math.floor((level - 1) / THEMES.length) + 1;
    const name = cycle > 1 ? `${nameBase} · Stage ${cycle}` : nameBase;

    const colors = THEME_COLORS[theme];
    const difficulty = Math.min(10, 1 + Math.floor(level * 0.5));

    const trackWidth = 800;
    // Increasing track length as level increases: from 2800px up to 7500px
    const trackHeight = Math.min(7500, 2600 + level * 280);

    const startX = trackWidth / 2;
    const startY = 140;
    const finishY = trackHeight - 220;

    const walls: TrackWall[] = [];
    const obstacles: Obstacle[] = [];
    const decorations: { x: number; y: number; type: string; size: number }[] = [];

    // Outer bounding walls with angled funnels and turns
    const leftMargin = 70;
    const rightMargin = trackWidth - 70;

    // Start chamber / starting gate funnel
    walls.push(
      { x1: startX - 180, y1: 40, x2: startX - 220, y2: 240, isBouncy: true, color: colors.rail },
      { x1: startX + 180, y1: 40, x2: startX + 220, y2: 240, isBouncy: true, color: colors.rail },
      { x1: startX - 220, y1: 240, x2: leftMargin, y2: 380, color: colors.rail },
      { x1: startX + 220, y1: 240, x2: rightMargin, y2: 380, color: colors.rail }
    );

    // Procedural track segments down the length
    const segmentCount = Math.floor((finishY - 400) / 450);
    let prevLeft = leftMargin;
    let prevRight = rightMargin;
    let currentY = 380;

    for (let i = 0; i < segmentCount; i++) {
      const nextY = currentY + 450;
      const isLast = i === segmentCount - 1;

      let nextLeft = leftMargin + (rng() * 90 - 30);
      let nextRight = rightMargin - (rng() * 90 - 30);

      // Ensure minimum track width
      if (nextRight - nextLeft < 380) {
        nextLeft = leftMargin;
        nextRight = rightMargin;
      }

      if (isLast) {
        // Funnel cleanly into finish area
        nextLeft = startX - 200;
        nextRight = startX + 200;
      }

      // Add main guide rails
      walls.push(
        { x1: prevLeft, y1: currentY, x2: nextLeft, y2: nextY, color: colors.rail },
        { x1: prevRight, y1: currentY, x2: nextRight, y2: nextY, color: colors.rail }
      );

      // Procedural Obstacles inside this section based on theme & difficulty
      const sectionCenterX = (prevLeft + prevRight) / 2;
      const sectionCenterY = (currentY + nextY) / 2;
      const sectionRoll = rng();

      if (sectionRoll < 0.25) {
        // Pinball Bumper Matrix
        const bumperRows = 2 + Math.floor(rng() * 2);
        for (let r = 0; r < bumperRows; r++) {
          const rowY = currentY + 100 + r * 110;
          const count = 3 + (r % 2 === 0 ? 1 : 0);
          const spacing = (nextRight - nextLeft - 120) / count;
          for (let c = 0; c < count; c++) {
            const bx = nextLeft + 60 + c * spacing + (rng() * 20 - 10);
            obstacles.push({
              id: `bumper_${i}_${r}_${c}`,
              type: 'PINBALL_BUMPER',
              x: bx,
              y: rowY,
              radius: 24 + rng() * 8,
              rotation: 0,
              rotationSpeed: 0,
              power: 12 + difficulty * 0.8,
            });
          }
        }
      } else if (sectionRoll < 0.45) {
        // Dual or Triple Rotating Hammers / Blades
        const bladeCount = 1 + Math.min(2, Math.floor(difficulty / 3));
        for (let b = 0; b < bladeCount; b++) {
          const bx = sectionCenterX + (b === 0 ? 0 : b === 1 ? -120 : 120);
          const by = sectionCenterY + (b * 60 - 30);
          obstacles.push({
            id: `hammer_${i}_${b}`,
            type: 'SPINNING_HAMMER',
            x: bx,
            y: by,
            length: 120 + rng() * 40,
            rotation: rng() * Math.PI * 2,
            rotationSpeed: (rng() > 0.5 ? 1 : -1) * (0.03 + difficulty * 0.006),
            power: 14 + difficulty,
          });
        }
      } else if (sectionRoll < 0.6) {
        // Vortex Funnel & Speed Boosts
        obstacles.push({
          id: `vortex_${i}`,
          type: 'VORTEX_FUNNEL',
          x: sectionCenterX,
          y: sectionCenterY,
          radius: 90 + rng() * 30,
          rotation: 0,
          rotationSpeed: 0.04,
          power: 0.8,
        });

        // Flanking speed ramps
        obstacles.push(
          {
            id: `boost_l_${i}`,
            type: 'BOOST_PAD',
            x: nextLeft + 50,
            y: sectionCenterY - 40,
            width: 44,
            height: 70,
            rotation: 0,
            rotationSpeed: 0,
            power: 18 + difficulty,
          },
          {
            id: `boost_r_${i}`,
            type: 'BOOST_PAD',
            x: nextRight - 50,
            y: sectionCenterY - 40,
            width: 44,
            height: 70,
            rotation: 0,
            rotationSpeed: 0,
            power: 18 + difficulty,
          }
        );
      } else if (sectionRoll < 0.78) {
        // Laser Gates / Moving Barriers
        const gateCount = 2;
        for (let g = 0; g < gateCount; g++) {
          const gy = currentY + 120 + g * 140;
          obstacles.push({
            id: `laser_${i}_${g}`,
            type: 'LASER_GATE',
            x: sectionCenterX,
            y: gy,
            width: 220 + rng() * 60,
            height: 18,
            rotation: 0,
            rotationSpeed: 0,
            phase: g * Math.PI,
            laserActive: true,
          });
        }
      } else {
        // Bouncy Mushrooms & Rotating Crossbars
        obstacles.push({
          id: `rotbar_${i}`,
          type: 'ROTATING_BAR',
          x: sectionCenterX,
          y: sectionCenterY,
          length: 180 + rng() * 40,
          rotation: rng() * Math.PI,
          rotationSpeed: (rng() > 0.5 ? 0.035 : -0.035) * (1 + difficulty * 0.1),
        });

        // Bouncy mushrooms in corners
        obstacles.push(
          {
            id: `shroom_l_${i}`,
            type: 'BOUNCY_MUSHROOM',
            x: nextLeft + 80,
            y: sectionCenterY + 80,
            radius: 32,
            rotation: 0,
            rotationSpeed: 0,
            power: 16,
          },
          {
            id: `shroom_r_${i}`,
            type: 'BOUNCY_MUSHROOM',
            x: nextRight - 80,
            y: sectionCenterY + 80,
            radius: 32,
            rotation: 0,
            rotationSpeed: 0,
            power: 16,
          }
        );
      }

      // Add environmental patches (Ice or Mud)
      if (theme === 'ICE_GLACIER' || rng() < 0.3) {
        obstacles.push({
          id: `patch_${i}`,
          type: theme === 'DESERT' ? 'MUD_PATCH' : 'ICE_PATCH',
          x: sectionCenterX,
          y: currentY + 60,
          width: 240,
          height: 100,
          rotation: 0,
          rotationSpeed: 0,
        });
      }

      prevLeft = nextLeft;
      prevRight = nextRight;
      currentY = nextY;
    }

    // Finish Funnel into final straightaway
    walls.push(
      { x1: prevLeft, y1: currentY, x2: startX - 180, y2: finishY + 80, color: colors.rail },
      { x1: prevRight, y1: currentY, x2: startX + 180, y2: finishY + 80, color: colors.rail },
      { x1: startX - 180, y1: finishY + 80, x2: startX - 180, y2: trackHeight, color: colors.rail },
      { x1: startX + 180, y1: finishY + 80, x2: startX + 180, y2: trackHeight, color: colors.rail },
      // Bottom catch wall
      { x1: startX - 180, y1: trackHeight - 20, x2: startX + 180, y2: trackHeight - 20, isBouncy: true, color: colors.accent }
    );

    // Final finish stretch boost pads
    obstacles.push(
      {
        id: 'finish_boost_1',
        type: 'BOOST_PAD',
        x: startX - 70,
        y: finishY - 90,
        width: 36,
        height: 60,
        rotation: 0,
        rotationSpeed: 0,
        power: 20,
      },
      {
        id: 'finish_boost_2',
        type: 'BOOST_PAD',
        x: startX + 70,
        y: finishY - 90,
        width: 36,
        height: 60,
        rotation: 0,
        rotationSpeed: 0,
        power: 20,
      }
    );

    // Add ambient background particle decorations
    for (let d = 0; d < 50; d++) {
      decorations.push({
        x: rng() * trackWidth,
        y: rng() * trackHeight,
        type: theme,
        size: 3 + rng() * 12,
      });
    }

    return {
      level,
      name,
      theme,
      difficulty,
      width: trackWidth,
      height: trackHeight,
      startX,
      startY,
      finishY,
      walls,
      obstacles,
      decorations,
      backgroundGradient: colors.bg,
      accentColor: colors.accent,
      railColor: colors.rail,
    };
  }
}
