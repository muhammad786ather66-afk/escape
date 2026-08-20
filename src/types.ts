export type TrackTheme =
  | 'GRASSLAND'
  | 'DESERT'
  | 'ICE_WORLD'
  | 'VOLCANO'
  | 'OCEAN'
  | 'SKY'
  | 'SPACE'
  | 'JUNGLE'
  | 'FACTORY'
  | 'CANDY_WORLD';

export type ObstacleType =
  | 'HAMMER'
  | 'SPINNING_WHEEL'
  | 'FUNNEL'
  | 'TRAP_DOORS'
  | 'BOUNCY_PADS'
  | 'MOVING_BRIDGE'
  | 'FIRE_ZONE'
  | 'ICE_ZONE'
  | 'WATER_CURRENT'
  | 'GIANT_FAN'
  | 'ROTATING_ARM'
  | 'FALLING_ROCKS'
  | 'CANNON'
  | 'COLOR_GATES'
  | 'SEESAW'
  | 'PINS'
  | 'SPEED_RAMP'
  | 'SPIRAL'
  | 'SPLIT_PATH'
  | 'NARROW_BRIDGE';

export type CameraMode = 'LEADER' | 'PACK' | 'ACTION' | 'FINISH_LINE' | 'FREE_ORBIT' | 'TOP_DOWN';

export type RaceEventType =
  | 'SUPER_SPEED'
  | 'GIANT_HAMMER'
  | 'SLIPPERY_ICE'
  | 'EARTHQUAKE'
  | 'LOW_GRAVITY'
  | 'FINAL_SPRINT'
  | 'CHAOS_STORM';

export interface CountryballDef {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  patternType: 'stripes_h' | 'stripes_v' | 'cross' | 'circle' | 'canton' | 'triangle' | 'sun' | 'stars' | 'diagonal';
  eyeStyle: 'happy' | 'determined' | 'derp' | 'cool' | 'shocked' | 'intense';
  personality: string;
  description: string;
  // Physics attributes
  mass: number;          // 0.8 to 1.3
  restitution: number;   // 0.6 to 0.9 (bounciness)
  topSpeed: number;      // 1.0 to 1.3
  grip: number;          // 0.8 to 1.2
  specialTrait: string;
}

export interface RacerState {
  id: string;
  ballDef: CountryballDef;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  radius: number;
  isEliminated: boolean;
  eliminationReason?: string;
  isFinished: boolean;
  finishTime?: number;
  finishRank?: number;
  rank: number;
  distanceProgress: number; // progress along track 0..1
  stuckTimer: number;
  lastProgressZ: number;
  squashX: number;
  squashY: number;
  squashZ: number;
  trailPoints: { x: number; y: number; z: number; alpha: number }[];
  boostTimer: number;
  iceTimer: number;
  fireTimer: number;
  colorFlash?: string;
}

export interface ObstacleInstance {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  z: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  rotation: number;
  rotSpeed: number;
  phase: number;
  swingAngle?: number;
  isOpen?: boolean;
  customData?: Record<string, number | boolean | string>;
}

export interface TrackSegment {
  id: string;
  type: 'STRAIGHT' | 'CURVE_LEFT' | 'CURVE_RIGHT' | 'SLOPE_DOWN' | 'SLOPE_UP' | 'FUNNEL' | 'SPLIT' | 'MERGE' | 'SPIRAL' | 'JUMP_GAP' | 'SEESAW' | 'NARROW';
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
  width: number;
  wallHeight: number;
  friction: number;
  bounciness: number;
  obstacles: ObstacleInstance[];
  surfaceType: 'NORMAL' | 'ICE' | 'MUD' | 'BOOST' | 'WATER' | 'WOOD' | 'NEON';
  isShortcut?: boolean;
}

export interface Track {
  id: string;
  level: number;
  name: string;
  theme: TrackTheme;
  difficulty: number;
  totalLength: number;
  segments: TrackSegment[];
  spawnPositions: { x: number; y: number; z: number }[];
  finishZ: number;
}

export interface ActiveRaceEvent {
  type: RaceEventType;
  title: string;
  description: string;
  duration: number;
  remainingTime: number;
}

export interface LeaderboardEntry {
  countryId: string;
  name: string;
  flagCode: string;
  primaryColor: string;
  wins: number;
  top3: number;
  racesRun: number;
  totalPoints: number;
  bestTime?: number;
  highestLevelWon?: number;
}

export interface GameSettings {
  soundVolume: number;      // 0..1
  musicVolume: number;      // 0..1
  sfxEnabled: boolean;
  musicEnabled: boolean;
  simulationSpeed: number;  // 0.5, 1, 1.5, 2, 3
  cameraMode: CameraMode;
  showNames: boolean;
  showTrails: boolean;
  autoAdvanceDelay: number; // seconds to wait on podium before next race
  particleDensity: 'LOW' | 'MED' | 'HIGH';
  selectedCountryIds?: string[]; // null or array of enabled racer IDs
}

export interface RaceResult {
  winner: CountryballDef;
  level: number;
  trackName: string;
  theme: TrackTheme;
  raceDuration: number;
  totalRacers: number;
  eliminatedCount: number;
  podium: {
    rank: number;
    racer: CountryballDef;
    finishTime: number;
    points: number;
  }[];
  allFinishers: {
    rank: number;
    racer: CountryballDef;
    finishTime?: number;
    points: number;
    isEliminated: boolean;
  }[];
}
