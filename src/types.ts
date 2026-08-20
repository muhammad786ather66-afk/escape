export type CameraMode = 'LEADER_LOCK' | 'WINNER_CLOSEUP' | 'PACK_VIEW' | 'OVERVIEW';

export type GameMode = 'AUTO_PILOT' | 'INTERACTIVE';

export type TrackTheme =
  | 'GRASSLAND'
  | 'DESERT'
  | 'CYBER_NEON'
  | 'ICE_GLACIER'
  | 'VOLCANO'
  | 'SPACE_COSMOS'
  | 'FACTORY'
  | 'CANDY_LAND'
  | 'JUNGLE'
  | 'SYNTHWAVE';

export interface CountryballDef {
  id: string;
  name: string;
  code: string;
  flagEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  accessory:
    | 'FEZ'
    | 'STAHLHELM'
    | 'BERET'
    | 'HEADBAND'
    | 'SUNGLASSES'
    | 'HACHIMAKI'
    | 'TOP_HAT'
    | 'CHEF_HAT'
    | 'PLUNGER'
    | 'USHANKA'
    | 'SOMBRERO'
    | 'SUN_CAP'
    | 'MATADOR'
    | 'VIKING'
    | 'TURBAN'
    | 'CORK_HAT';
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
}

export type ObstacleType =
  | 'PINBALL_BUMPER'
  | 'SPINNING_HAMMER'
  | 'ROTATING_BAR'
  | 'BOOST_PAD'
  | 'BOUNCY_MUSHROOM'
  | 'LASER_GATE'
  | 'VORTEX_FUNNEL'
  | 'SEESAW'
  | 'WIND_FAN'
  | 'ICE_PATCH'
  | 'MUD_PATCH';

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
  theme: TrackTheme;
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
  shape?: 'CIRCLE' | 'STAR' | 'SPARK' | 'CONFETTI';
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
  theme: TrackTheme;
  finishTime: number;
  podium: { rank: number; ball: CountryballDef; finishTime: number }[];
}

export interface LeaderboardStats {
  countryId: string;
  wins: number;
  podiums: number;
  totalPoints: number;
  racesCount: number;
}
