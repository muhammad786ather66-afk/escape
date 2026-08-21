import {
  TrackData,
  TrackThemeType,
  TrackMaterial,
  TexturePatternType,
  TrackPhysicsConfig,
  Obstacle,
  TrackWall,
} from '../types';

export interface LevelPreset {
  name: string;
  theme: TrackThemeType;
  material: TrackMaterial;
  materialName: string;
  texturePattern: TexturePatternType;
  physics: TrackPhysicsConfig;
  bgGradient: [string, string, string];
  accent: string;
  rail: string;
  floor: string;
  grid: string;
  hurdlesDescription: string;
  primaryHurdle:
    | 'ICE_SPIRES'
    | 'LAVA_GEYSERS'
    | 'SANDSTORMS'
    | 'WIND_TURBINES'
    | 'CUTTERS'
    | 'FLAMES'
    | 'BLACK_HOLES'
    | 'BUMPERS'
    | 'LASERS'
    | 'MUSHROOMS'
    | 'MIXED';
}

// 50 Handcrafted & Distinct Level Presets across all 12 Themes
export const LEVEL_PRESETS: LevelPreset[] = [
  // 1: Genesis Cyber Highway
  {
    name: 'Cyber Neon Speedway',
    theme: 'CYBER',
    material: 'NEON_GRID',
    materialName: 'Quantum Cyber Grid',
    texturePattern: 'CYBER_CIRCUIT',
    physics: {
      gravity: 0.16,
      airFriction: 0.994,
      wallRestitution: 0.85,
      ballRestitution: 0.78,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.0,
      physicsSummary: '⚡ High Elastic Rebound · Standard 1.0G',
      ambientParticleType: 'CYBER_BIT',
    },
    bgGradient: ['#090924', '#040417', '#01010a'],
    accent: '#06b6d4',
    rail: '#67e8f9',
    floor: '#0b0e29',
    grid: '#1e293b',
    hurdlesDescription: 'Holographic Buzzsaws & Nitro Hyper-Pads',
    primaryHurdle: 'CUTTERS',
  },
  // 2: Sahara Sandstone Dunes
  {
    name: 'Sahara Sandstone Dunes',
    theme: 'DESERT',
    material: 'DESERT_SANDSTONE',
    materialName: 'Gilded Egyptian Sandstone',
    texturePattern: 'DESERT_DUNES',
    physics: {
      gravity: 0.18,
      airFriction: 0.989,
      wallRestitution: 0.58,
      ballRestitution: 0.65,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 0.85,
      physicsSummary: '🏜️ Sand Drag (0.85x Speed) · Damped Walls · Crosswinds',
      ambientParticleType: 'SAND_DUST',
    },
    bgGradient: ['#381e09', '#201004', '#0d0501'],
    accent: '#f59e0b',
    rail: '#fde68a',
    floor: '#291708',
    grid: '#451a03',
    hurdlesDescription: 'Sandstorm Vortexes & Quicksand Pits',
    primaryHurdle: 'SANDSTORMS',
  },
  // 3: Glacier Crystal Chasm
  {
    name: 'Glacier Crystal Chasm',
    theme: 'ICE',
    material: 'ICE_GLASS',
    materialName: 'Slick Permafrost Glass',
    texturePattern: 'ICE_CRACKS',
    physics: {
      gravity: 0.15,
      airFriction: 0.998,
      wallRestitution: 0.78,
      ballRestitution: 0.74,
      windGustX: -0.04,
      windGustY: 0,
      surfaceSlickness: 1.45,
      physicsSummary: '❄️ Hyper-Slick Ice (1.45x Glide) · Zero Drag Drift',
      ambientParticleType: 'SNOW',
    },
    bgGradient: ['#0c2738', '#071520', '#02070d'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
    floor: '#082f49',
    grid: '#0369a1',
    hurdlesDescription: 'Spinning Frost Spires & Snow Blower Vents',
    primaryHurdle: 'ICE_SPIRES',
  },
  // 4: Obsidian Magma Abyss
  {
    name: 'Obsidian Magma Abyss',
    theme: 'LAVA',
    material: 'MAGMA_ROCK',
    materialName: 'Glowing Volcanic Basalt',
    texturePattern: 'LAVA_VEINS',
    physics: {
      gravity: 0.21,
      airFriction: 0.991,
      wallRestitution: 0.65,
      ballRestitution: 0.70,
      windGustX: 0,
      windGustY: -0.06,
      surfaceSlickness: 0.92,
      physicsSummary: '🌋 Dense Core (1.3x Gravity) · Thermal Updrafts',
      ambientParticleType: 'EMBER',
    },
    bgGradient: ['#3b0808', '#200303', '#0a0101'],
    accent: '#ef4444',
    rail: '#fca5a5',
    floor: '#2a0505',
    grid: '#7f1d1d',
    hurdlesDescription: 'Erupting Lava Geysers & Magma Cannons',
    primaryHurdle: 'LAVA_GEYSERS',
  },
  // 5: Stratosphere Sky Sanctuary
  {
    name: 'Stratosphere Skyway',
    theme: 'SKY',
    material: 'AERO_CLOUD',
    materialName: 'Zephyr Stratosphere Clouds',
    texturePattern: 'SKY_CLOUDS',
    physics: {
      gravity: 0.12,
      airFriction: 0.995,
      wallRestitution: 0.94,
      ballRestitution: 0.88,
      windGustX: 0.12,
      windGustY: -0.04,
      surfaceSlickness: 1.1,
      physicsSummary: '☁️ Low-G Float (0.75x) · Springy Clouds · Jet Streams',
      ambientParticleType: 'CLOUD_MIST',
    },
    bgGradient: ['#072a4a', '#04172b', '#010812'],
    accent: '#38bdf8',
    rail: '#bae6fd',
    floor: '#0c4a6e',
    grid: '#0284c7',
    hurdlesDescription: 'High-Thrust Aero Turbines & Cloud Trampolines',
    primaryHurdle: 'WIND_TURBINES',
  },
  // 6: Deep Sea Bioluminescence
  {
    name: 'Phosphor Coral Abyss',
    theme: 'OCEAN',
    material: 'DEEP_CORAL',
    materialName: 'Phosphorescent Coral Abyss',
    texturePattern: 'OCEAN_CAUSTICS',
    physics: {
      gravity: 0.14,
      airFriction: 0.989,
      wallRestitution: 0.70,
      ballRestitution: 0.72,
      windGustX: 0.05,
      windGustY: 0,
      surfaceSlickness: 0.95,
      physicsSummary: '🌊 Fluid Buoyancy · Hydrodynamic Drag & Currents',
      ambientParticleType: 'BUBBLE',
    },
    bgGradient: ['#031c26', '#010d14', '#000508'],
    accent: '#14b8a6',
    rail: '#99f6e4',
    floor: '#042f2e',
    grid: '#115e59',
    hurdlesDescription: 'Underwater Whirlpool Funnels & Coral Bumpers',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 7: Clockwork Brass Foundry
  {
    name: 'Clockwork Brass Foundry',
    theme: 'FACTORY',
    material: 'CLOCKWORK_BRASS',
    materialName: 'Steampunk Brass & Iron',
    texturePattern: 'STEAMPUNK_GEARS',
    physics: {
      gravity: 0.18,
      airFriction: 0.993,
      wallRestitution: 0.82,
      ballRestitution: 0.76,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.05,
      physicsSummary: '⚙️ Heavy Metallic Torque · Steam Exhaust Bursts',
      ambientParticleType: 'STEAM',
    },
    bgGradient: ['#291a08', '#170e03', '#080401'],
    accent: '#eab308',
    rail: '#fef08a',
    floor: '#1c1917',
    grid: '#78350f',
    hurdlesDescription: 'Heavy Piston Hammers & Industrial Sawblades',
    primaryHurdle: 'CUTTERS',
  },
  // 8: Sugar Rush Candy Carnival
  {
    name: 'Sugar Rush Candy Land',
    theme: 'CANDY',
    material: 'CANDY_JELLY',
    materialName: 'Peppermint Sugar Glass',
    texturePattern: 'CANDY_STRIPES',
    physics: {
      gravity: 0.15,
      airFriction: 0.996,
      wallRestitution: 0.96,
      ballRestitution: 0.92,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.2,
      physicsSummary: '🍭 Ultra-Bouncy Jelly Walls (0.96x Bounce) · High Chaos',
      ambientParticleType: 'CONFETTI',
    },
    bgGradient: ['#380c26', '#1f0414', '#0a0106'],
    accent: '#ec4899',
    rail: '#fbcfe8',
    floor: '#500724',
    grid: '#831843',
    hurdlesDescription: 'Gummy Pinball Bumpers & Jelly Bounce Pads',
    primaryHurdle: 'BUMPERS',
  },
  // 9: Cosmic Nebula Singularity
  {
    name: 'Cosmic Nebula Stargate',
    theme: 'SPACE',
    material: 'STARDUST_OBSIDIAN',
    materialName: 'Celestial Stardust Void',
    texturePattern: 'SPACE_NEBULA',
    physics: {
      gravity: 0.13,
      airFriction: 0.997,
      wallRestitution: 0.86,
      ballRestitution: 0.80,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.15,
      physicsSummary: '🌌 Microgravity (0.8x) · Event Horizon Gravity Slings',
      ambientParticleType: 'STAR_DUST',
    },
    bgGradient: ['#170829', '#0d0317', '#030108'],
    accent: '#a855f7',
    rail: '#f3e8ff',
    floor: '#1e1b4b',
    grid: '#581c87',
    hurdlesDescription: 'Black Hole Gravity Vortexes & Anti-Grav Zones',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 10: Amazon Rainforest Canopy
  {
    name: 'Amazon Emerald Canopy',
    theme: 'JUNGLE',
    material: 'WOOD_TIMBER',
    materialName: 'Ancient Banyan Timber',
    texturePattern: 'JUNGLE_CANOPY',
    physics: {
      gravity: 0.16,
      airFriction: 0.993,
      wallRestitution: 0.72,
      ballRestitution: 0.74,
      windGustX: 0.04,
      windGustY: 0,
      surfaceSlickness: 0.98,
      physicsSummary: '🌿 Organic Canopy Friction · Giant Spore Trampolines',
      ambientParticleType: 'SPORE',
    },
    bgGradient: ['#0f2e1a', '#081c0f', '#020b06'],
    accent: '#10b981',
    rail: '#a7f3d0',
    floor: '#064e3b',
    grid: '#047857',
    hurdlesDescription: 'Giant Bouncy Mushrooms & Swinging Vine Logs',
    primaryHurdle: 'MUSHROOMS',
  },
  // 11: Olympus Gilded Coliseum
  {
    name: 'Olympus Gilded Coliseum',
    theme: 'GOLDEN',
    material: 'ANCIENT_GOLD',
    materialName: 'Imperial 24K Olympian Gold',
    texturePattern: 'GOLDEN_MOSAIC',
    physics: {
      gravity: 0.17,
      airFriction: 0.994,
      wallRestitution: 0.82,
      ballRestitution: 0.78,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.08,
      physicsSummary: '🏛️ Classical Mosaic Roll · Golden Resilience',
      ambientParticleType: 'SPARK',
    },
    bgGradient: ['#382603', '#1e1401', '#0a0600'],
    accent: '#fbbf24',
    rail: '#fef08a',
    floor: '#451a03',
    grid: '#b45309',
    hurdlesDescription: 'Pyramid Bumpers & Golden Stone Sweepers',
    primaryHurdle: 'BUMPERS',
  },
  // 12: Polar Aurora Borealis
  {
    name: 'Polar Aurora Borealis',
    theme: 'AURORA',
    material: 'RAINBOW_AURORA',
    materialName: 'Prismatic Aurora Wave',
    texturePattern: 'AURORA_WAVES',
    physics: {
      gravity: 0.15,
      airFriction: 0.997,
      wallRestitution: 0.88,
      ballRestitution: 0.84,
      windGustX: -0.06,
      windGustY: 0,
      surfaceSlickness: 1.3,
      physicsSummary: '✨ Prismatic Hyper-Glide · Magnetic Ion Winds',
      ambientParticleType: 'AURORA_GLOW',
    },
    bgGradient: ['#092f38', '#04171c', '#00080a'],
    accent: '#2dd4bf',
    rail: '#99f6e4',
    floor: '#042f2e',
    grid: '#0f766e',
    hurdlesDescription: 'Pulsing Aurora Laser Curtains & Prismatic Rifts',
    primaryHurdle: 'LASERS',
  },

  // 13-24: Second Thematic Rotation with Intensified Physics
  // 13: Neon Grid Circuit Overload
  {
    name: 'Tokyo Hyper-Laser Grid',
    theme: 'CYBER',
    material: 'CYBER_CIRCUIT',
    materialName: 'Overclocked Fiber Circuit',
    texturePattern: 'CYBER_CIRCUIT',
    physics: {
      gravity: 0.16,
      airFriction: 0.995,
      wallRestitution: 0.87,
      ballRestitution: 0.80,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.1,
      physicsSummary: '⚡ Overclocked Grid · High Velocity Slingshot',
      ambientParticleType: 'CYBER_BIT',
    },
    bgGradient: ['#1e0538', '#0d011c', '#030008'],
    accent: '#e879f9',
    rail: '#fae8ff',
    floor: '#2e0854',
    grid: '#86198f',
    hurdlesDescription: 'Multi-Tier Laser Gates & Turbo Boost Arrays',
    primaryHurdle: 'LASERS',
  },
  // 14: Gobi Dune Sandstorm
  {
    name: 'Gobi Desert Sandstorm',
    theme: 'DESERT',
    material: 'DESERT_SANDSTONE',
    materialName: 'Wind-Swept Sandstone Slabs',
    texturePattern: 'DESERT_DUNES',
    physics: {
      gravity: 0.18,
      airFriction: 0.988,
      wallRestitution: 0.55,
      ballRestitution: 0.62,
      windGustX: -0.12,
      windGustY: 0,
      surfaceSlickness: 0.80,
      physicsSummary: '🏜️ Severe Sand Drag · High Wind Shears',
      ambientParticleType: 'SAND_DUST',
    },
    bgGradient: ['#331a06', '#1a0d03', '#080300'],
    accent: '#f59e0b',
    rail: '#fed7aa',
    floor: '#291404',
    grid: '#78350f',
    hurdlesDescription: 'Dual Sandstorm Tornadoes & Quicksand Maw',
    primaryHurdle: 'SANDSTORMS',
  },
  // 15: Arctic Permafrost Spire
  {
    name: 'Permafrost Frozen Needle',
    theme: 'ICE',
    material: 'ICE_GLASS',
    materialName: 'Glacial Monolith Ice',
    texturePattern: 'ICE_CRACKS',
    physics: {
      gravity: 0.14,
      airFriction: 0.999,
      wallRestitution: 0.80,
      ballRestitution: 0.76,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 1.5,
      physicsSummary: '❄️ Sub-Zero Frictionless Permafrost · Max Slide',
      ambientParticleType: 'SNOW',
    },
    bgGradient: ['#062338', '#02121f', '#00050d'],
    accent: '#06b6d4',
    rail: '#cffafe',
    floor: '#083344',
    grid: '#0891b2',
    hurdlesDescription: 'Twin Frost Spires & Slippery Blue Ice Runs',
    primaryHurdle: 'ICE_SPIRES',
  },
  // 16: Kilauea Magma Caldera
  {
    name: 'Kilauea Lava Tubes',
    theme: 'LAVA',
    material: 'MAGMA_ROCK',
    materialName: 'Molten Core Channel',
    texturePattern: 'LAVA_VEINS',
    physics: {
      gravity: 0.22,
      airFriction: 0.990,
      wallRestitution: 0.62,
      ballRestitution: 0.68,
      windGustX: 0,
      windGustY: -0.08,
      surfaceSlickness: 0.90,
      physicsSummary: '🌋 Molten Basalt Drag · 1.4x Gravity Crush',
      ambientParticleType: 'EMBER',
    },
    bgGradient: ['#450a0a', '#220404', '#0c0000'],
    accent: '#f97316',
    rail: '#ffedd5',
    floor: '#380b0b',
    grid: '#9a3412',
    hurdlesDescription: 'Twin Magma Geysers & Molten Fire Vent Cones',
    primaryHurdle: 'LAVA_GEYSERS',
  },
  // 17: Cumulus Sky Fortress
  {
    name: 'Sky Apex Nimbus Highway',
    theme: 'SKY',
    material: 'AERO_CLOUD',
    materialName: 'Cumulus Airflow Rail',
    texturePattern: 'SKY_CLOUDS',
    physics: {
      gravity: 0.11,
      airFriction: 0.996,
      wallRestitution: 0.95,
      ballRestitution: 0.90,
      windGustX: -0.15,
      windGustY: -0.05,
      surfaceSlickness: 1.15,
      physicsSummary: '☁️ Cloud Float · 0.7x Gravity · Strong Lateral Gusts',
      ambientParticleType: 'CLOUD_MIST',
    },
    bgGradient: ['#0c3257', '#061b30', '#020b17'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
    floor: '#075985',
    grid: '#0369a1',
    hurdlesDescription: 'Jet Propulsion Fans & Cloud Trampoline Array',
    primaryHurdle: 'WIND_TURBINES',
  },
  // 18: Mariana Trench Deep Abyss
  {
    name: 'Mariana Trench Bioluminescence',
    theme: 'OCEAN',
    material: 'DEEP_CORAL',
    materialName: 'Abyssal Pressure Trench',
    texturePattern: 'OCEAN_CAUSTICS',
    physics: {
      gravity: 0.15,
      airFriction: 0.987,
      wallRestitution: 0.68,
      ballRestitution: 0.70,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 0.92,
      physicsSummary: '🌊 Abyssal Water Resistance · Strong Tidal Pull',
      ambientParticleType: 'BUBBLE',
    },
    bgGradient: ['#021824', '#010c14', '#000408'],
    accent: '#06b6d4',
    rail: '#a5f3fc',
    floor: '#083344',
    grid: '#0e7490',
    hurdlesDescription: 'Dual Vortex Funnels & Coral Hazard Wall',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 19: Industrial Titanium Foundry
  {
    name: 'Titanium Industrial Slicers',
    theme: 'FACTORY',
    material: 'CHROME_METALLIC',
    materialName: 'Heavy Plated Titanium',
    texturePattern: 'STEAMPUNK_GEARS',
    physics: {
      gravity: 0.19,
      airFriction: 0.993,
      wallRestitution: 0.85,
      ballRestitution: 0.78,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.0,
      physicsSummary: '⚙️ High-Impact Titanium Walls · Steam Shockwaves',
      ambientParticleType: 'STEAM',
    },
    bgGradient: ['#1c1917', '#0c0a09', '#000000'],
    accent: '#fb923c',
    rail: '#fed7aa',
    floor: '#292524',
    grid: '#44403c',
    hurdlesDescription: 'High-RPM Titanium Saws & Piston Smashers',
    primaryHurdle: 'CUTTERS',
  },
  // 20: Marshmallow Candy Peak
  {
    name: 'Marshmallow Gumdrop Peaks',
    theme: 'CANDY',
    material: 'CANDY_JELLY',
    materialName: 'Marshmallow Foam Track',
    texturePattern: 'CANDY_STRIPES',
    physics: {
      gravity: 0.14,
      airFriction: 0.996,
      wallRestitution: 0.97,
      ballRestitution: 0.94,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.25,
      physicsSummary: '🍭 Ultra-Elastic Marshmallow Bounce (0.97x Rebound)',
      ambientParticleType: 'CONFETTI',
    },
    bgGradient: ['#420d2a', '#240516', '#0d0107'],
    accent: '#f43f5e',
    rail: '#fecdd3',
    floor: '#4c0519',
    grid: '#9f1239',
    hurdlesDescription: 'Triple Gummy Bumper Clusters & Jelly Launchers',
    primaryHurdle: 'BUMPERS',
  },
  // 21: Supernova Cosmic Singularity
  {
    name: 'Supernova Rift Highway',
    theme: 'SPACE',
    material: 'STARDUST_OBSIDIAN',
    materialName: 'Ionized Plasma Conduit',
    texturePattern: 'SPACE_NEBULA',
    physics: {
      gravity: 0.12,
      airFriction: 0.998,
      wallRestitution: 0.88,
      ballRestitution: 0.82,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.2,
      physicsSummary: '🌌 Zero-G Slipstream · Gravitational slings',
      ambientParticleType: 'STAR_DUST',
    },
    bgGradient: ['#1c0836', '#0e021f', '#04000a'],
    accent: '#c084fc',
    rail: '#f3e8ff',
    floor: '#2e1065',
    grid: '#6b21a8',
    hurdlesDescription: 'Twin Black Hole Binary Singularities',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 22: Ancient Mayan Jungle Temple
  {
    name: 'Mayan Spore Rainforest',
    theme: 'JUNGLE',
    material: 'WOOD_TIMBER',
    materialName: 'Ancient Teak Log Bridges',
    texturePattern: 'JUNGLE_CANOPY',
    physics: {
      gravity: 0.16,
      airFriction: 0.992,
      wallRestitution: 0.74,
      ballRestitution: 0.72,
      windGustX: 0.05,
      windGustY: 0,
      surfaceSlickness: 0.95,
      physicsSummary: '🌿 Wet Timber Slip · Spring Spore Mushrooms',
      ambientParticleType: 'SPORE',
    },
    bgGradient: ['#0d2b17', '#06170c', '#010804'],
    accent: '#22c55e',
    rail: '#bbf7d0',
    floor: '#14532d',
    grid: '#15803d',
    hurdlesDescription: 'Bouncy Mushroom Maze & Swinging Pendulums',
    primaryHurdle: 'MUSHROOMS',
  },
  // 23: Imperial Caesar Colosseum
  {
    name: 'Imperial Caesar Coliseum',
    theme: 'GOLDEN',
    material: 'MARBLE_STONE',
    materialName: 'Carrara Gilded Marble',
    texturePattern: 'GOLDEN_MOSAIC',
    physics: {
      gravity: 0.17,
      airFriction: 0.995,
      wallRestitution: 0.84,
      ballRestitution: 0.80,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.1,
      physicsSummary: '🏛️ Polished Marble Rolling · High Structural Speed',
      ambientParticleType: 'SPARK',
    },
    bgGradient: ['#382400', '#1c1100', '#080400'],
    accent: '#facc15',
    rail: '#fef08a',
    floor: '#261702',
    grid: '#ca8a04',
    hurdlesDescription: 'Gilded Stone Columns & Centurion Sweepers',
    primaryHurdle: 'CUTTERS',
  },
  // 24: Celestial Aurora Shard
  {
    name: 'Celestial Aurora Shard',
    theme: 'AURORA',
    material: 'RAINBOW_AURORA',
    materialName: 'Spectral Prism Glass',
    texturePattern: 'AURORA_WAVES',
    physics: {
      gravity: 0.15,
      airFriction: 0.998,
      wallRestitution: 0.90,
      ballRestitution: 0.86,
      windGustX: 0.06,
      windGustY: 0,
      surfaceSlickness: 1.35,
      physicsSummary: '✨ Prismatic Energy Boost · Low Sliding Resistance',
      ambientParticleType: 'AURORA_GLOW',
    },
    bgGradient: ['#082e3b', '#03171f', '#00070a'],
    accent: '#38bdf8',
    rail: '#bae6fd',
    floor: '#075985',
    grid: '#0284c7',
    hurdlesDescription: 'Multi-Spectrum Laser Gates & Aurora Slings',
    primaryHurdle: 'LASERS',
  },

  // 25-36: Third Rotation (Elite Mastery Series)
  // 25: Synthwave Outrun Sunset
  {
    name: 'Outrun 1984 Synthwave',
    theme: 'CYBER',
    material: 'CYBER_CIRCUIT',
    materialName: 'Neon Vector Wireframe',
    texturePattern: 'CYBER_CIRCUIT',
    physics: {
      gravity: 0.16,
      airFriction: 0.995,
      wallRestitution: 0.88,
      ballRestitution: 0.82,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.15,
      physicsSummary: '⚡ Synthwave Vector Glide · Sharp Bounces',
      ambientParticleType: 'CYBER_BIT',
    },
    bgGradient: ['#2b0838', '#16031f', '#05000a'],
    accent: '#f43f5e',
    rail: '#ffe4e6',
    floor: '#4c0519',
    grid: '#881337',
    hurdlesDescription: 'Laser Barriers & Grid Accelerators',
    primaryHurdle: 'LASERS',
  },
  // 26: Arabian Mirage Desert
  {
    name: 'Arabian Mirage Oasis',
    theme: 'DESERT',
    material: 'DESERT_SANDSTONE',
    materialName: 'Scorched Quartz Sandstone',
    texturePattern: 'DESERT_DUNES',
    physics: {
      gravity: 0.18,
      airFriction: 0.988,
      wallRestitution: 0.58,
      ballRestitution: 0.65,
      windGustX: 0.14,
      windGustY: 0,
      surfaceSlickness: 0.88,
      physicsSummary: '🏜️ Severe Sand Resistance · Swirling Mirage Winds',
      ambientParticleType: 'SAND_DUST',
    },
    bgGradient: ['#3b1e06', '#1f0d02', '#0a0300'],
    accent: '#f59e0b',
    rail: '#fde68a',
    floor: '#2e1202',
    grid: '#d97706',
    hurdlesDescription: 'Mirage Dust Devils & Quicksand Chasms',
    primaryHurdle: 'SANDSTORMS',
  },
  // 27: Frostbite Iceberg Labyrinth
  {
    name: 'Frostbite Iceberg Labyrinth',
    theme: 'ICE',
    material: 'ICE_GLASS',
    materialName: 'Vitreous Cryo-Ice',
    texturePattern: 'ICE_CRACKS',
    physics: {
      gravity: 0.15,
      airFriction: 0.999,
      wallRestitution: 0.82,
      ballRestitution: 0.78,
      windGustX: -0.08,
      windGustY: 0,
      surfaceSlickness: 1.55,
      physicsSummary: '❄️ Extreme Ice Glide (1.55x) · Zero Stopping Power',
      ambientParticleType: 'SNOW',
    },
    bgGradient: ['#082c40', '#031724', '#00060d'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
    floor: '#0c4a6e',
    grid: '#0369a1',
    hurdlesDescription: 'Crystalline Ice Shurikens & Blizzard Cannons',
    primaryHurdle: 'ICE_SPIRES',
  },
  // 28: Krakatoa Magma Fountain
  {
    name: 'Krakatoa Magma Fountain',
    theme: 'LAVA',
    material: 'MAGMA_ROCK',
    materialName: 'Basalt Magma Channel',
    texturePattern: 'LAVA_VEINS',
    physics: {
      gravity: 0.22,
      airFriction: 0.990,
      wallRestitution: 0.65,
      ballRestitution: 0.70,
      windGustX: 0,
      windGustY: -0.1,
      surfaceSlickness: 0.92,
      physicsSummary: '🌋 Intense Core Gravity (1.4x) · Thermal Eruption Vents',
      ambientParticleType: 'EMBER',
    },
    bgGradient: ['#480d0d', '#260404', '#0d0000'],
    accent: '#ef4444',
    rail: '#fee2e2',
    floor: '#3b0a0a',
    grid: '#b91c1c',
    hurdlesDescription: 'Triple Magma Geysers & Molten Fire Cones',
    primaryHurdle: 'LAVA_GEYSERS',
  },
  // 29: Skyway Thundercloud Overpass
  {
    name: 'Thundercloud Aerodrome',
    theme: 'SKY',
    material: 'AERO_CLOUD',
    materialName: 'Thunderhead Vapor Rail',
    texturePattern: 'SKY_CLOUDS',
    physics: {
      gravity: 0.12,
      airFriction: 0.996,
      wallRestitution: 0.95,
      ballRestitution: 0.90,
      windGustX: 0.18,
      windGustY: -0.06,
      surfaceSlickness: 1.18,
      physicsSummary: '☁️ High-Altitude Thunder Currents · 0.75x Gravity',
      ambientParticleType: 'CLOUD_MIST',
    },
    bgGradient: ['#0b2b4a', '#051629', '#010712'],
    accent: '#60a5fa',
    rail: '#dbeafe',
    floor: '#1e3a8a',
    grid: '#2563eb',
    hurdlesDescription: 'High-Velocity Wind Turbines & Lightning Gates',
    primaryHurdle: 'WIND_TURBINES',
  },
  // 30: Atlantis Sunken Coral Gate
  {
    name: 'Atlantis Sunken Gate',
    theme: 'OCEAN',
    material: 'DEEP_CORAL',
    materialName: 'Submerged Coral Aqueduct',
    texturePattern: 'OCEAN_CAUSTICS',
    physics: {
      gravity: 0.14,
      airFriction: 0.988,
      wallRestitution: 0.72,
      ballRestitution: 0.74,
      windGustX: -0.06,
      windGustY: 0,
      surfaceSlickness: 0.96,
      physicsSummary: '🌊 Submerged Water Viscosity · Coral Dampening',
      ambientParticleType: 'BUBBLE',
    },
    bgGradient: ['#03222e', '#01121a', '#00060a'],
    accent: '#14b8a6',
    rail: '#ccfbf1',
    floor: '#115e59',
    grid: '#0f766e',
    hurdlesDescription: 'Twin Tidal Whirlpools & Coral Bumpers',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 31: Steampunk Steam Piston Mill
  {
    name: 'Steampunk Steam Engine',
    theme: 'FACTORY',
    material: 'CLOCKWORK_BRASS',
    materialName: 'High-Pressure Steam Copper',
    texturePattern: 'STEAMPUNK_GEARS',
    physics: {
      gravity: 0.19,
      airFriction: 0.993,
      wallRestitution: 0.84,
      ballRestitution: 0.78,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.05,
      physicsSummary: '⚙️ High Mechanical Resistance · High Rebound Force',
      ambientParticleType: 'STEAM',
    },
    bgGradient: ['#2e1d08', '#1a0f03', '#080400'],
    accent: '#d97706',
    rail: '#fde68a',
    floor: '#292524',
    grid: '#78350f',
    hurdlesDescription: 'Twin Steam Sawblades & Hydraulic Hammers',
    primaryHurdle: 'CUTTERS',
  },
  // 32: Peppermint Lollipop Spiral
  {
    name: 'Peppermint Lollipop Spiral',
    theme: 'CANDY',
    material: 'CANDY_JELLY',
    materialName: 'Hard Candy Glaze',
    texturePattern: 'CANDY_STRIPES',
    physics: {
      gravity: 0.15,
      airFriction: 0.997,
      wallRestitution: 0.96,
      ballRestitution: 0.92,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.3,
      physicsSummary: '🍭 Hard Candy Polish (1.3x Speed) · Super Bounces',
      ambientParticleType: 'CONFETTI',
    },
    bgGradient: ['#3b0c26', '#210515', '#0c0107'],
    accent: '#ec4899',
    rail: '#fbcfe8',
    floor: '#831843',
    grid: '#be185d',
    hurdlesDescription: 'Cherry Bumper Clusters & Jelly Jumpers',
    primaryHurdle: 'BUMPERS',
  },
  // 33: Pulsar Graviton Chamber
  {
    name: 'Pulsar Graviton Core',
    theme: 'SPACE',
    material: 'STARDUST_OBSIDIAN',
    materialName: 'Neutron Star Lattice',
    texturePattern: 'SPACE_NEBULA',
    physics: {
      gravity: 0.13,
      airFriction: 0.998,
      wallRestitution: 0.88,
      ballRestitution: 0.84,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.25,
      physicsSummary: '🌌 Zero-G Gravitational Pull · High Orbital Swirl',
      ambientParticleType: 'STAR_DUST',
    },
    bgGradient: ['#1b0533', '#0e011d', '#04000a'],
    accent: '#a855f7',
    rail: '#e9d5ff',
    floor: '#3b0764',
    grid: '#7e22ce',
    hurdlesDescription: 'Pulsar Black Hole Singularity & Anti-Grav Rifts',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 34: Redwood Giant Canopy
  {
    name: 'Redwood Giant Spires',
    theme: 'JUNGLE',
    material: 'WOOD_TIMBER',
    materialName: 'Ancient Redwood Trunk',
    texturePattern: 'JUNGLE_CANOPY',
    physics: {
      gravity: 0.16,
      airFriction: 0.993,
      wallRestitution: 0.74,
      ballRestitution: 0.74,
      windGustX: -0.06,
      windGustY: 0,
      surfaceSlickness: 1.0,
      physicsSummary: '🌿 Giant Redwood Resistance · Spore Bounce Pads',
      ambientParticleType: 'SPORE',
    },
    bgGradient: ['#0f2e1a', '#081c0f', '#020b06'],
    accent: '#10b981',
    rail: '#a7f3d0',
    floor: '#064e3b',
    grid: '#047857',
    hurdlesDescription: 'Twin Bouncy Mushroom Clusters & Log Sweepers',
    primaryHurdle: 'MUSHROOMS',
  },
  // 35: Pantheon Gilded Amphitheater
  {
    name: 'Pantheon Gilded Amphitheater',
    theme: 'GOLDEN',
    material: 'ANCIENT_GOLD',
    materialName: 'Imperial Auric Ingot',
    texturePattern: 'GOLDEN_MOSAIC',
    physics: {
      gravity: 0.17,
      airFriction: 0.995,
      wallRestitution: 0.85,
      ballRestitution: 0.82,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.12,
      physicsSummary: '🏛️ Imperial Auric Glide · Solid Classical Walls',
      ambientParticleType: 'SPARK',
    },
    bgGradient: ['#3f2c00', '#211700', '#0a0700'],
    accent: '#eab308',
    rail: '#fef9c3',
    floor: '#422006',
    grid: '#a16207',
    hurdlesDescription: 'Gilded Pyramid Bumpers & Rotating Slicers',
    primaryHurdle: 'CUTTERS',
  },
  // 36: Rainbow Aurora Borealis
  {
    name: 'Prismatic Aurora Cascade',
    theme: 'AURORA',
    material: 'RAINBOW_AURORA',
    materialName: 'Prismatic Aurora Crystal',
    texturePattern: 'AURORA_WAVES',
    physics: {
      gravity: 0.15,
      airFriction: 0.998,
      wallRestitution: 0.92,
      ballRestitution: 0.88,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 1.4,
      physicsSummary: '✨ Prismatic High-Speed Ribbon · Magnetic Acceleration',
      ambientParticleType: 'AURORA_GLOW',
    },
    bgGradient: ['#052c38', '#02151c', '#00070a'],
    accent: '#06b6d4',
    rail: '#cffafe',
    floor: '#0e7490',
    grid: '#0891b2',
    hurdlesDescription: 'Aurora Laser Arrays & Quantum Accelerator Pads',
    primaryHurdle: 'LASERS',
  },

  // 37-48: Championship Elimination Masters
  // 37: Neon Cyber Megacity
  {
    name: 'Neo-Tokyo Cyber Megacity',
    theme: 'CYBER',
    material: 'NEON_GRID',
    materialName: 'Super-Charged Optical Grid',
    texturePattern: 'CYBER_CIRCUIT',
    physics: {
      gravity: 0.16,
      airFriction: 0.995,
      wallRestitution: 0.88,
      ballRestitution: 0.82,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.15,
      physicsSummary: '⚡ High Optical Acceleration · Precision Walls',
      ambientParticleType: 'CYBER_BIT',
    },
    bgGradient: ['#1a042e', '#0d011c', '#03000a'],
    accent: '#e879f9',
    rail: '#fae8ff',
    floor: '#2e0854',
    grid: '#a21caf',
    hurdlesDescription: 'Multi-Laser Gates & Cybernetic Buzzsaws',
    primaryHurdle: 'LASERS',
  },
  // 38: Pharaoh Sand Canyon
  {
    name: 'Pharaoh Sandstone Canyon',
    theme: 'DESERT',
    material: 'DESERT_SANDSTONE',
    materialName: 'Ancient Hieroglyphic Sandstone',
    texturePattern: 'DESERT_DUNES',
    physics: {
      gravity: 0.19,
      airFriction: 0.988,
      wallRestitution: 0.58,
      ballRestitution: 0.65,
      windGustX: -0.16,
      windGustY: 0,
      surfaceSlickness: 0.85,
      physicsSummary: '🏜️ Severe Dune Drag · Desert Storm Winds',
      ambientParticleType: 'SAND_DUST',
    },
    bgGradient: ['#3b1c04', '#1f0d01', '#0a0400'],
    accent: '#f59e0b',
    rail: '#fde68a',
    floor: '#451a03',
    grid: '#b45309',
    hurdlesDescription: 'Triple Sandstorm Tornadoes & Quicksand Pits',
    primaryHurdle: 'SANDSTORMS',
  },
  // 39: Cryo Glacier Abyss
  {
    name: 'Cryo Glacier Monolith',
    theme: 'ICE',
    material: 'ICE_GLASS',
    materialName: 'Hyper-Dense Cryo Permafrost',
    texturePattern: 'ICE_CRACKS',
    physics: {
      gravity: 0.14,
      airFriction: 0.999,
      wallRestitution: 0.84,
      ballRestitution: 0.80,
      windGustX: 0.1,
      windGustY: 0,
      surfaceSlickness: 1.6,
      physicsSummary: '❄️ Max Cryo Slide (1.6x) · Low Resistance',
      ambientParticleType: 'SNOW',
    },
    bgGradient: ['#07283b', '#03141f', '#00060d'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
    floor: '#0369a1',
    grid: '#0284c7',
    hurdlesDescription: 'Triple Frost Spires & Snow Blower Vents',
    primaryHurdle: 'ICE_SPIRES',
  },
  // 40: Vesuvius Magma Caldera
  {
    name: 'Vesuvius Magma Caldera',
    theme: 'LAVA',
    material: 'MAGMA_ROCK',
    materialName: 'Molten Core Obsidian',
    texturePattern: 'LAVA_VEINS',
    physics: {
      gravity: 0.23,
      airFriction: 0.990,
      wallRestitution: 0.65,
      ballRestitution: 0.70,
      windGustX: 0,
      windGustY: -0.12,
      surfaceSlickness: 0.90,
      physicsSummary: '🌋 Crushing 1.45x Gravity · Magma Updrafts',
      ambientParticleType: 'EMBER',
    },
    bgGradient: ['#4a0a0a', '#290303', '#0e0000'],
    accent: '#ef4444',
    rail: '#fca5a5',
    floor: '#450a0a',
    grid: '#dc2626',
    hurdlesDescription: 'Multi-Vent Magma Eruptions & Fire Exhaust Jets',
    primaryHurdle: 'LAVA_GEYSERS',
  },
  // 41: Stratosphere Jetstream
  {
    name: 'Zenith Stratosphere Jetstream',
    theme: 'SKY',
    material: 'AERO_CLOUD',
    materialName: 'Stratospheric Ion Vapor',
    texturePattern: 'SKY_CLOUDS',
    physics: {
      gravity: 0.11,
      airFriction: 0.997,
      wallRestitution: 0.96,
      ballRestitution: 0.92,
      windGustX: -0.2,
      windGustY: -0.08,
      surfaceSlickness: 1.25,
      physicsSummary: '☁️ Low-G Float · 0.68x Gravity · Severe Crosswinds',
      ambientParticleType: 'CLOUD_MIST',
    },
    bgGradient: ['#0c3257', '#05192e', '#010814'],
    accent: '#38bdf8',
    rail: '#e0f2fe',
    floor: '#0369a1',
    grid: '#0284c7',
    hurdlesDescription: 'High-Speed Jet Turbines & Cloud Trampoline Array',
    primaryHurdle: 'WIND_TURBINES',
  },
  // 42: Coral Trench Abyssal Maw
  {
    name: 'Coral Trench Abyssal Maw',
    theme: 'OCEAN',
    material: 'DEEP_CORAL',
    materialName: 'Bioluminescent Trench Aqueduct',
    texturePattern: 'OCEAN_CAUSTICS',
    physics: {
      gravity: 0.14,
      airFriction: 0.988,
      wallRestitution: 0.74,
      ballRestitution: 0.76,
      windGustX: 0.1,
      windGustY: 0,
      surfaceSlickness: 0.96,
      physicsSummary: '🌊 Abyssal Water Resistance · Hydro Whirlpools',
      ambientParticleType: 'BUBBLE',
    },
    bgGradient: ['#021b26', '#010e14', '#000508'],
    accent: '#14b8a6',
    rail: '#99f6e4',
    floor: '#134e4a',
    grid: '#0f766e',
    hurdlesDescription: 'Deep Whirlpool Funnels & Coral Bumper Gauntlet',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 43: Heavy Industrial Foundry
  {
    name: 'Infernal Clockwork Foundry',
    theme: 'FACTORY',
    material: 'CHROME_METALLIC',
    materialName: 'Reinforced Plated Steel',
    texturePattern: 'STEAMPUNK_GEARS',
    physics: {
      gravity: 0.20,
      airFriction: 0.992,
      wallRestitution: 0.85,
      ballRestitution: 0.80,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.05,
      physicsSummary: '⚙️ Heavy Plated Steel · High-Velocity Saw Hazards',
      ambientParticleType: 'STEAM',
    },
    bgGradient: ['#241a0b', '#140e04', '#050300'],
    accent: '#f59e0b',
    rail: '#fed7aa',
    floor: '#292524',
    grid: '#78350f',
    hurdlesDescription: 'Multi-Saw Rotary Blades & Steam Pistons',
    primaryHurdle: 'CUTTERS',
  },
  // 44: Candy Wonderland Apex
  {
    name: 'Candy Wonderland Apex',
    theme: 'CANDY',
    material: 'CANDY_JELLY',
    materialName: 'Super-Elastic Gummy Glaze',
    texturePattern: 'CANDY_STRIPES',
    physics: {
      gravity: 0.14,
      airFriction: 0.997,
      wallRestitution: 0.98,
      ballRestitution: 0.95,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.35,
      physicsSummary: '🍭 Ultra-Elastic Gummy Walls (0.98x Rebound) · Maximum Bounce',
      ambientParticleType: 'CONFETTI',
    },
    bgGradient: ['#450d2b', '#260417', '#0d0107'],
    accent: '#f43f5e',
    rail: '#ffe4e6',
    floor: '#9f1239',
    grid: '#be123c',
    hurdlesDescription: 'Gummy Bumper Maze & Jelly Launchers',
    primaryHurdle: 'BUMPERS',
  },
  // 45: Dark Matter Singularity
  {
    name: 'Dark Matter Singularity Core',
    theme: 'SPACE',
    material: 'STARDUST_OBSIDIAN',
    materialName: 'Pure Dark Matter Conduit',
    texturePattern: 'SPACE_NEBULA',
    physics: {
      gravity: 0.12,
      airFriction: 0.998,
      wallRestitution: 0.90,
      ballRestitution: 0.86,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.3,
      physicsSummary: '🌌 Zero-G Void · High Orbital Inertia & Slings',
      ambientParticleType: 'STAR_DUST',
    },
    bgGradient: ['#16032e', '#0b0117', '#030008'],
    accent: '#c084fc',
    rail: '#f3e8ff',
    floor: '#3b0764',
    grid: '#7e22ce',
    hurdlesDescription: 'Dual Singularity Gravity Vortexes & Ion Boosters',
    primaryHurdle: 'BLACK_HOLES',
  },
  // 46: Primeval Jungle Canopy
  {
    name: 'Primeval Jungle Spires',
    theme: 'JUNGLE',
    material: 'WOOD_TIMBER',
    materialName: 'Ancient Primeval Ironwood',
    texturePattern: 'JUNGLE_CANOPY',
    physics: {
      gravity: 0.16,
      airFriction: 0.993,
      wallRestitution: 0.76,
      ballRestitution: 0.76,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 1.05,
      physicsSummary: '🌿 Primeval Timber Grip · Giant Spore Trampolines',
      ambientParticleType: 'SPORE',
    },
    bgGradient: ['#0d2b17', '#06170c', '#010804'],
    accent: '#22c55e',
    rail: '#bbf7d0',
    floor: '#14532d',
    grid: '#16a34a',
    hurdlesDescription: 'Giant Bouncy Mushrooms & Swinging Pendulums',
    primaryHurdle: 'MUSHROOMS',
  },
  // 47: Golden Citadel Gate
  {
    name: 'The Golden Citadel Gate',
    theme: 'GOLDEN',
    material: 'ANCIENT_GOLD',
    materialName: 'Sacred Emperor Gold',
    texturePattern: 'GOLDEN_MOSAIC',
    physics: {
      gravity: 0.17,
      airFriction: 0.995,
      wallRestitution: 0.86,
      ballRestitution: 0.82,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.15,
      physicsSummary: '🏛️ Sacred Auric Glide · Solid Classical Walls',
      ambientParticleType: 'SPARK',
    },
    bgGradient: ['#382400', '#1c1100', '#080400'],
    accent: '#facc15',
    rail: '#fef08a',
    floor: '#261702',
    grid: '#ca8a04',
    hurdlesDescription: 'Golden Sweepers & Imperial Column Barriers',
    primaryHurdle: 'CUTTERS',
  },
  // 48: Cosmic Apex Hyper-Tunnel
  {
    name: 'Cosmic Apex Hyper-Tunnel',
    theme: 'SPACE',
    material: 'STARDUST_OBSIDIAN',
    materialName: 'Dark Energy Stream',
    texturePattern: 'SPACE_NEBULA',
    physics: {
      gravity: 0.12,
      airFriction: 0.998,
      wallRestitution: 0.90,
      ballRestitution: 0.86,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.3,
      physicsSummary: '🌌 Pure Dark Energy · Superluminal Boost Trajectory',
      ambientParticleType: 'STAR_DUST',
    },
    bgGradient: ['#0a011a', '#04000d', '#000000'],
    accent: '#c084fc',
    rail: '#f3e8ff',
    floor: '#1e0533',
    grid: '#7e22ce',
    hurdlesDescription: 'Triple Singularity Graviton Field',
    primaryHurdle: 'BLACK_HOLES',
  },

  // 49: Grand Semi-Final Colosseum
  {
    name: 'Grand Semi-Final Colosseum',
    theme: 'AURORA',
    material: 'RAINBOW_AURORA',
    materialName: 'Champions Prismatic Road',
    texturePattern: 'AURORA_WAVES',
    physics: {
      gravity: 0.16,
      airFriction: 0.997,
      wallRestitution: 0.92,
      ballRestitution: 0.88,
      windGustX: 0.08,
      windGustY: 0,
      surfaceSlickness: 1.4,
      physicsSummary: '✨ Championship Prismatic Field · Qualification Stage (Top 3 Advance)',
      ambientParticleType: 'AURORA_GLOW',
    },
    bgGradient: ['#1f0833', '#0e021a', '#03000a'],
    accent: '#f43f5e',
    rail: '#ffe4e6',
    floor: '#3b0764',
    grid: '#e11d48',
    hurdlesDescription: 'All-Hazards Master Gauntlet (Lasers, Saws, Graviton)',
    primaryHurdle: 'MIXED',
  },

  // 50: THE GRAND FINALE ULTIMATE WORLD CHAMPIONSHIP (TOP 3 RACERS ONLY!)
  {
    name: 'Stage 50: The Grand World Championship Apex',
    theme: 'GOLDEN',
    material: 'ANCIENT_GOLD',
    materialName: 'Imperial 24K Celestial Gold & Stardust',
    texturePattern: 'GOLDEN_MOSAIC',
    physics: {
      gravity: 0.17,
      airFriction: 0.996,
      wallRestitution: 0.90,
      ballRestitution: 0.88,
      windGustX: 0,
      windGustY: 0,
      surfaceSlickness: 1.2,
      physicsSummary: '👑 Grand World Championship 24K Gold · Only 3 Finalists Compete!',
      ambientParticleType: 'SPARK',
    },
    bgGradient: ['#2e1f00', '#170e00', '#050200'],
    accent: '#fbbf24',
    rail: '#ffffff',
    floor: '#3f2502',
    grid: '#f59e0b',
    hurdlesDescription: 'Championship 3-Marble Mastercourse & Golden Apex',
    primaryHurdle: 'MIXED',
  },
];

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
    const clampedLevel = Math.max(1, Math.min(50, level));
    const preset = LEVEL_PRESETS[(clampedLevel - 1) % LEVEL_PRESETS.length];
    const rng = createPRNG(clampedLevel * 83492 + 104729);

    const isGrandFinale = clampedLevel === 50;
    const difficulty = Math.min(10, 1 + Math.floor(clampedLevel * 0.2));

    const trackWidth = isGrandFinale ? 920 : 860;
    const trackHeight = isGrandFinale ? 8200 : Math.min(7400, 3600 + clampedLevel * 90);

    const startX = trackWidth / 2;
    const startY = 160;
    const finishY = trackHeight - 240;

    const walls: TrackWall[] = [];
    const obstacles: Obstacle[] = [];
    const decorations: { x: number; y: number; type: string; size: number }[] = [];

    const leftMargin = 75;
    const rightMargin = trackWidth - 75;

    // Start chamber funnel with bouncy cushions
    walls.push(
      { x1: startX - 220, y1: 40, x2: startX - 260, y2: 260, isBouncy: true, color: preset.rail },
      { x1: startX + 220, y1: 40, x2: startX + 260, y2: 260, isBouncy: true, color: preset.rail },
      { x1: startX - 260, y1: 260, x2: leftMargin, y2: 420, color: preset.rail },
      { x1: startX + 260, y1: 260, x2: rightMargin, y2: 420, color: preset.rail }
    );

    // Procedural track segments down the long course
    const segmentHeight = 480;
    const segmentCount = Math.floor((finishY - 440) / segmentHeight);
    let prevLeft = leftMargin;
    let prevRight = rightMargin;
    let currentY = 420;

    for (let i = 0; i < segmentCount; i++) {
      const nextY = currentY + segmentHeight;
      const isLast = i === segmentCount - 1;

      let nextLeft = leftMargin + (rng() * 100 - 35);
      let nextRight = rightMargin - (rng() * 100 - 35);

      if (nextRight - nextLeft < 440) {
        nextLeft = leftMargin;
        nextRight = rightMargin;
      }

      if (isLast) {
        nextLeft = startX - 240;
        nextRight = startX + 240;
      }

      // Add main side walls
      walls.push(
        { x1: prevLeft, y1: currentY, x2: nextLeft, y2: nextY, color: preset.rail },
        { x1: prevRight, y1: currentY, x2: nextRight, y2: nextY, color: preset.rail }
      );

      const sectionCenterX = (prevLeft + prevRight) / 2;
      const sectionCenterY = (currentY + nextY) / 2;
      const hurdleCategory = preset.primaryHurdle;

      // 1. ICE THEME SPECIFIC: ICE SPIRES & SNOW BLOWERS
      if (hurdleCategory === 'ICE_SPIRES' || preset.theme === 'ICE') {
        const spireCount = 2;
        for (let s = 0; s < spireCount; s++) {
          const sx = sectionCenterX + (s === 0 ? -110 : 110);
          const sy = sectionCenterY + (s === 0 ? -30 : 30);
          obstacles.push({
            id: `icespire_${i}_${s}`,
            type: 'ICE_SPIRE',
            x: sx,
            y: sy,
            radius: 34 + rng() * 8,
            rotation: rng() * Math.PI * 2,
            rotationSpeed: (s % 2 === 0 ? 0.06 : -0.06) * (1 + difficulty * 0.04),
            power: 15 + difficulty,
          });
        }
        // Lateral Snow Blower Fan
        obstacles.push({
          id: `snowblower_${i}`,
          type: 'SNOW_BLOWER',
          x: nextLeft + 50,
          y: currentY + 180,
          width: 50,
          height: 50,
          rotation: 0,
          rotationSpeed: 0,
          power: 12 + difficulty,
        });
        // Slicks
        obstacles.push({
          id: `icepatch_${i}`,
          type: 'ICE_PATCH',
          x: sectionCenterX,
          y: currentY + 60,
          width: 260,
          height: 100,
          rotation: 0,
          rotationSpeed: 0,
        });
      }
      // 2. LAVA THEME SPECIFIC: LAVA GEYSERS & FLAMETHROWERS
      else if (hurdleCategory === 'LAVA_GEYSERS' || preset.theme === 'LAVA') {
        const geyserCount = 2;
        for (let g = 0; g < geyserCount; g++) {
          const gx = sectionCenterX + (g === 0 ? -115 : 115);
          const gy = sectionCenterY + (g === 0 ? -30 : 40);
          obstacles.push({
            id: `geyser_${i}_${g}`,
            type: 'LAVA_GEYSER',
            x: gx,
            y: gy,
            radius: 30,
            rotation: 0,
            rotationSpeed: 0,
            fireActive: true,
            phase: g * 1.6 + i,
            power: 16 + difficulty * 0.8,
          });
        }
        obstacles.push({
          id: `flame_${i}`,
          type: 'FLAMETHROWER',
          x: sectionCenterX,
          y: currentY + 120,
          radius: 28,
          rotation: 0,
          rotationSpeed: 0,
          fireActive: true,
          phase: i * 1.2,
          power: 16 + difficulty,
        });
      }
      // 3. DESERT THEME SPECIFIC: SANDSTORM VORTEX & QUICKSAND
      else if (hurdleCategory === 'SANDSTORMS' || preset.theme === 'DESERT') {
        obstacles.push({
          id: `sandstorm_${i}`,
          type: 'SANDSTORM_VORTEX',
          x: sectionCenterX + (rng() * 60 - 30),
          y: sectionCenterY,
          radius: 75 + rng() * 20,
          rotation: 0,
          rotationSpeed: 0.07,
          power: 1.1 + difficulty * 0.05,
        });
        obstacles.push({
          id: `quicksand_${i}`,
          type: 'QUICKSAND_PIT',
          x: sectionCenterX,
          y: currentY + 80,
          width: 240,
          height: 90,
          rotation: 0,
          rotationSpeed: 0,
        });
        // Pyramid bumpers
        obstacles.push({
          id: `pyramid_l_${i}`,
          type: 'PYRAMID_BUMPER',
          x: nextLeft + 70,
          y: sectionCenterY + 40,
          radius: 28,
          rotation: 0,
          rotationSpeed: 0,
          power: 16,
        });
        obstacles.push({
          id: `pyramid_r_${i}`,
          type: 'PYRAMID_BUMPER',
          x: nextRight - 70,
          y: sectionCenterY + 40,
          radius: 28,
          rotation: 0,
          rotationSpeed: 0,
          power: 16,
        });
      }
      // 4. SKY THEME SPECIFIC: WIND TURBINES & CLOUD TRAMPOLINES
      else if (hurdleCategory === 'WIND_TURBINES' || preset.theme === 'SKY') {
        obstacles.push({
          id: `windfan_l_${i}`,
          type: 'WIND_FAN',
          x: nextLeft + 55,
          y: currentY + 120,
          width: 50,
          height: 50,
          rotation: 0,
          rotationSpeed: 0.1,
          power: 18 + difficulty,
        });
        obstacles.push({
          id: `windfan_r_${i}`,
          type: 'WIND_FAN',
          x: nextRight - 55,
          y: currentY + 280,
          width: 50,
          height: 50,
          rotation: 0,
          rotationSpeed: -0.1,
          power: 18 + difficulty,
        });
        obstacles.push({
          id: `trampoline_${i}`,
          type: 'CLOUD_TRAMPOLINE',
          x: sectionCenterX,
          y: sectionCenterY,
          radius: 36,
          rotation: 0,
          rotationSpeed: 0,
          power: 20,
        });
      }
      // 5. JUNGLE / NATURE: BOUNCY MUSHROOMS & SWINGING LOGS
      else if (hurdleCategory === 'MUSHROOMS' || preset.theme === 'JUNGLE') {
        const mushCount = 3;
        const spacing = (nextRight - nextLeft - 160) / (mushCount - 1);
        for (let m = 0; m < mushCount; m++) {
          obstacles.push({
            id: `mushroom_${i}_${m}`,
            type: 'BOUNCY_MUSHROOM',
            x: nextLeft + 80 + m * spacing,
            y: sectionCenterY + (m % 2 === 0 ? -40 : 40),
            radius: 32 + rng() * 6,
            rotation: 0,
            rotationSpeed: 0,
            power: 18 + difficulty * 0.5,
          });
        }
        obstacles.push({
          id: `hammer_log_${i}`,
          type: 'SPINNING_HAMMER',
          x: sectionCenterX,
          y: currentY + 100,
          length: 130,
          rotation: rng() * Math.PI,
          rotationSpeed: (i % 2 === 0 ? 0.05 : -0.05) * (1 + difficulty * 0.04),
          power: 15,
        });
      }
      // 6. CUTTERS / FACTORY
      else if (hurdleCategory === 'CUTTERS') {
        const sawCount = 2;
        for (let s = 0; s < sawCount; s++) {
          const sx = sectionCenterX + (s === 0 ? -110 : 110);
          const sy = sectionCenterY + (s === 0 ? -40 : 40);
          obstacles.push({
            id: `buzzsaw_${i}_${s}`,
            type: 'BUZZSAW_CUTTER',
            x: sx,
            y: sy,
            radius: 36 + rng() * 8,
            rotation: rng() * Math.PI * 2,
            rotationSpeed: (s % 2 === 0 ? 0.08 : -0.08) * (1 + difficulty * 0.05),
            power: 16 + difficulty,
          });
        }
      }
      // 7. BLACK HOLES / SPACE / OCEAN
      else if (hurdleCategory === 'BLACK_HOLES') {
        obstacles.push({
          id: `blackhole_${i}`,
          type: 'BLACK_HOLE',
          x: sectionCenterX + (rng() * 80 - 40),
          y: sectionCenterY,
          radius: 80 + rng() * 25,
          rotation: 0,
          rotationSpeed: 0.05,
          power: 0.9 + difficulty * 0.05,
        });
        obstacles.push(
          {
            id: `boost_left_${i}`,
            type: 'BOOST_PAD',
            x: nextLeft + 60,
            y: sectionCenterY,
            width: 46,
            height: 70,
            rotation: 0,
            rotationSpeed: 0,
            power: 18 + difficulty,
          },
          {
            id: `boost_right_${i}`,
            type: 'BOOST_PAD',
            x: nextRight - 60,
            y: sectionCenterY,
            width: 46,
            height: 70,
            rotation: 0,
            rotationSpeed: 0,
            power: 18 + difficulty,
          }
        );
      }
      // 8. BUMPERS / CANDY / GOLDEN
      else if (hurdleCategory === 'BUMPERS') {
        const rows = 2;
        for (let r = 0; r < rows; r++) {
          const rowY = currentY + 110 + r * 130;
          const count = 3 + (r % 2 === 0 ? 1 : 0);
          const spacing = (nextRight - nextLeft - 140) / count;
          for (let c = 0; c < count; c++) {
            const bx = nextLeft + 70 + c * spacing + (rng() * 20 - 10);
            obstacles.push({
              id: `bumper_${i}_${r}_${c}`,
              type: 'PINBALL_BUMPER',
              x: bx,
              y: rowY,
              radius: 26 + rng() * 8,
              rotation: 0,
              rotationSpeed: 0,
              power: 15 + difficulty * 0.6,
            });
          }
        }
      }
      // 9. LASERS / CYBER / AURORA
      else if (hurdleCategory === 'LASERS') {
        obstacles.push({
          id: `laser_${i}`,
          type: 'LASER_GATE',
          x: sectionCenterX,
          y: sectionCenterY - 50,
          width: 260 + rng() * 60,
          height: 20,
          rotation: 0,
          rotationSpeed: 0,
          phase: i * 0.8,
          laserActive: true,
        });
        obstacles.push({
          id: `hammer_${i}`,
          type: 'ROTATING_BAR',
          x: sectionCenterX,
          y: sectionCenterY + 70,
          length: 140 + rng() * 30,
          rotation: rng() * Math.PI,
          rotationSpeed: (rng() > 0.5 ? 0.04 : -0.04) * (1 + difficulty * 0.05),
          power: 15,
        });
      }
      // 10. MIXED (Grand Semi-Final & Finale)
      else {
        obstacles.push({
          id: `mix_laser_${i}`,
          type: 'LASER_GATE',
          x: sectionCenterX,
          y: currentY + 100,
          width: 240,
          height: 18,
          rotation: 0,
          rotationSpeed: 0,
          phase: i,
          laserActive: true,
        });
        obstacles.push({
          id: `mix_saw_${i}`,
          type: 'BUZZSAW_CUTTER',
          x: sectionCenterX - 110,
          y: sectionCenterY + 30,
          radius: 34,
          rotation: 0,
          rotationSpeed: 0.08,
          power: 16,
        });
        obstacles.push({
          id: `mix_blackhole_${i}`,
          type: 'BLACK_HOLE',
          x: sectionCenterX + 100,
          y: sectionCenterY + 30,
          radius: 70,
          rotation: 0,
          rotationSpeed: 0.05,
          power: 1.0,
        });
      }

      prevLeft = nextLeft;
      prevRight = nextRight;
      currentY = nextY;
    }

    // Finish Funnel into final straightaway
    walls.push(
      { x1: prevLeft, y1: currentY, x2: startX - 220, y2: finishY + 90, color: preset.rail },
      { x1: prevRight, y1: currentY, x2: startX + 220, y2: finishY + 90, color: preset.rail },
      { x1: startX - 220, y1: finishY + 90, x2: startX - 220, y2: trackHeight, color: preset.rail },
      { x1: startX + 220, y1: finishY + 90, x2: startX + 220, y2: trackHeight, color: preset.rail },
      // Bottom catch wall
      { x1: startX - 220, y1: trackHeight - 25, x2: startX + 220, y2: trackHeight - 25, isBouncy: true, color: preset.accent }
    );

    // Final finish stretch nitro pads
    obstacles.push(
      {
        id: 'finish_boost_1',
        type: 'BOOST_PAD',
        x: startX - 80,
        y: finishY - 100,
        width: 44,
        height: 65,
        rotation: 0,
        rotationSpeed: 0,
        power: 22,
      },
      {
        id: 'finish_boost_2',
        type: 'BOOST_PAD',
        x: startX + 80,
        y: finishY - 100,
        width: 44,
        height: 65,
        rotation: 0,
        rotationSpeed: 0,
        power: 22,
      }
    );

    // Background particle decorations
    for (let d = 0; d < 70; d++) {
      decorations.push({
        x: rng() * trackWidth,
        y: rng() * trackHeight,
        type: preset.theme,
        size: 3 + rng() * 14,
      });
    }

    return {
      level: clampedLevel,
      name: isGrandFinale ? '🏆 STAGE 50: GRAND WORLD CHAMPIONSHIP FINALE 🏆' : `STAGE ${clampedLevel}: ${preset.name}`,
      theme: preset.theme,
      material: preset.material,
      materialName: preset.materialName,
      texturePattern: preset.texturePattern,
      physicsConfig: preset.physics,
      difficulty,
      width: trackWidth,
      height: trackHeight,
      startX,
      startY,
      finishY,
      walls,
      obstacles,
      decorations,
      backgroundGradient: preset.bgGradient,
      accentColor: preset.accent,
      railColor: preset.rail,
      floorColor: preset.floor,
      gridColor: preset.grid,
      hurdlesDescription: preset.hurdlesDescription,
    };
  }
}
