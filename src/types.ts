export type CameraMode = 'LEADER_LOCK' | 'WINNER_CLOSEUP' | 'PACK_VIEW' | 'OVERVIEW';

export type GameMode = 'AUTO_PILOT' | 'INTERACTIVE';

export type TrackThemeType =
  | 'ICE'
  | 'LAVA'
  | 'DESERT'
  | 'SKY'
  | 'CYBER'
  | 'SPACE'
  | 'JUNGLE'
  | 'OCEAN'
  | 'FACTORY'
  | 'GOLDEN'
  | 'CANDY'
  | 'AURORA';

export type TrackMaterial =
  | 'NEON_GRID'
  | 'ICE_GLASS'
  | 'MAGMA_ROCK'
  | 'ANCIENT_GOLD'
  | 'DEEP_CORAL'
  | 'CLOCKWORK_BRASS'
  | 'CANDY_JELLY'
  | 'STARDUST_OBSIDIAN'
  | 'CHROME_METALLIC'
  | 'WOOD_TIMBER'
  | 'CYBER_CIRCUIT'
  | 'RAINBOW_AURORA'
  | 'MARBLE_STONE'
  | 'AERO_CLOUD'
  | 'DESERT_SANDSTONE';

export type TexturePatternType =
  | 'ICE_CRACKS'
  | 'LAVA_VEINS'
  | 'DESERT_DUNES'
  | 'SKY_CLOUDS'
  | 'CYBER_CIRCUIT'
  | 'SPACE_NEBULA'
  | 'JUNGLE_CANOPY'
  | 'OCEAN_CAUSTICS'
  | 'STEAMPUNK_GEARS'
  | 'GOLDEN_MOSAIC'
  | 'CANDY_STRIPES'
  | 'AURORA_WAVES';

export type AmbientParticleType =
  | 'SNOW'
  | 'EMBER'
  | 'SAND_DUST'
  | 'CLOUD_MIST'
  | 'CYBER_BIT'
  | 'STAR_DUST'
  | 'BUBBLE'
  | 'SPORE'
  | 'SPARK'
  | 'CONFETTI'
  | 'STEAM'
  | 'AURORA_GLOW';

export interface TrackPhysicsConfig {
  gravity: number; // e.g. 0.11 (Sky/Space) to 0.22 (Lava/Heavy)
  airFriction: number; // e.g. 0.988 (Sand/Mud) to 0.998 (Ice)
  wallRestitution: number; // e.g. 0.55 (Damped Sand) to 0.95 (Super bouncy Cloud/Candy)
  ballRestitution: number; // e.g. 0.65 to 0.92
  windGustX: number; // Continuous or oscillating crosswind
  windGustY: number; // Updraft / downdraft
  surfaceSlickness: number; // Multiplier on ball rolling/skidding
  physicsSummary: string; // User-facing badge text
  ambientParticleType: AmbientParticleType;
}

export type FlagStyle =
  | 'TRICOLOR_H'
  | 'TRICOLOR_V'
  | 'BICOLOR_H'
  | 'BICOLOR_V'
  | 'CROSS_NORDIC'
  | 'SALTIRE'
  | 'CANTON_STRIPES'
  | 'SUN_DISC'
  | 'CRESCENT_STAR'
  | 'EMBLEM_CENTER'
  | 'SOLID_STAR'
  | 'DIAGONAL_SPLIT'
  | 'CUSTOM';

export interface CountryballDef {
  id: string;
  name: string;
  code: string;
  flagEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  flagStyle: FlagStyle;
  flagDetails?: {
    stripeColors?: string[];
    isVertical?: boolean;
    emblemType?: 'STAR' | 'SUN' | 'CRESCENT' | 'CROSS' | 'MAPLE' | 'SHIELD' | 'EAGLE' | 'WHEEL' | 'DRAGON' | 'CIRCLES' | 'CEDAR';
    emblemColor?: string;
    cantonColor?: string;
    secondaryEmblemColor?: string;
  };
  accessory: string;
  trait: string;
  speedMultiplier: number;
  bounceMultiplier: number;
  weightMultiplier: number;
}

export interface RacerState {
  id: string;
  ball: CountryballDef;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  bounciness: number;
  rotation: number;
  angularVelocity: number;
  squishX: number;
  squishY: number;
  distance: number;
  rank: number;
  isFinished: boolean;
  finishRank?: number;
  finishTime?: number;
  isEliminated: boolean;
  trailHistory: { x: number; y: number; alpha: number }[];
  stuckTimer: number;
  lastY: number;
  boostTimer: number;
  color: string;
  hazardHitTimer?: number; // for visual reaction on hitting cutter/fire
}

export type ObstacleType =
  | 'FLAMETHROWER'
  | 'LAVA_GEYSER'
  | 'LAVA_RIVER'
  | 'BUZZSAW_CUTTER'
  | 'BLACK_HOLE'
  | 'PINBALL_BUMPER'
  | 'SPINNING_HAMMER'
  | 'ROTATING_BAR'
  | 'BOOST_PAD'
  | 'BOUNCY_MUSHROOM'
  | 'LASER_GATE'
  | 'VORTEX_FUNNEL'
  | 'WIND_FAN'
  | 'CLOUD_TRAMPOLINE'
  | 'ICE_PATCH'
  | 'ICE_SPIRE'
  | 'SNOW_BLOWER'
  | 'MUD_PATCH'
  | 'QUICKSAND_PIT'
  | 'SANDSTORM_VORTEX'
  | 'PYRAMID_BUMPER';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation: number;
  rotationSpeed: number;
  length?: number;
  power?: number;
  state?: number;
  laserActive?: boolean;
  fireActive?: boolean;
  phase?: number;
  customData?: any;
}

export interface TrackWall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isBouncy?: boolean;
  color?: string;
}

export interface TrackData {
  level: number;
  name: string;
  theme: TrackThemeType;
  material: TrackMaterial;
  materialName: string;
  texturePattern: TexturePatternType;
  physicsConfig: TrackPhysicsConfig;
  difficulty: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
  finishY: number;
  walls: TrackWall[];
  obstacles: Obstacle[];
  decorations: { x: number; y: number; type: string; size: number }[];
  backgroundGradient: [string, string, string];
  accentColor: string;
  railColor: string;
  floorColor: string;
  gridColor: string;
  hurdlesDescription?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'CIRCLE' | 'STAR' | 'SPARK' | 'CONFETTI' | 'FLAME' | 'SMOKE';
}

export interface UserBoostPad {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  power: number;
}

export interface RaceWinnerInfo {
  winner: CountryballDef;
  level: number;
  trackName: string;
  theme: string;
  materialName: string;
  finishTime: number;
  podium: { rank: number; ball: CountryballDef; finishTime: number }[];
  isGrandFinale: boolean;
  totalCompetitors: number;
  qualifiedForNext: number;
}

export interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'LEAD_CHANGE' | 'HAZARD_HIT' | 'OVERTAKE' | 'FINISH' | 'TOURNAMENT' | 'HYPE';
  countryCode?: string;
  countryName?: string;
}

export interface TournamentStageInfo {
  currentLevel: number;
  totalLevels: number; // 50
  startingRacersCount: number; // 100 at level 1 down to 3 at level 50
  remainingRacersCount: number;
  isGrandFinale: boolean;
}
