export type GameMode = 'GROUND' | 'AIRCRAFT';

export type GameState = 
  | 'MENU'
  | 'BRIEFING'
  | 'PLAYING'
  | 'PAUSED'
  | 'BOSS_INTRO'
  | 'VICTORY'
  | 'DEFEAT'
  | 'ARSENAL'
  | 'UPGRADES'
  | 'OPERATIONS'
  | 'ACHIEVEMENTS'
  | 'SETTINGS';

export type WeatherType = 'CLEAR' | 'SUNSET' | 'NIGHT' | 'RAIN' | 'SNOW' | 'DUST_STORM' | 'OCEAN_STORM';

export type EnvironmentTheme = 
  | 'NEON_CITY'
  | 'WAR_ZONE'
  | 'DESERT_HIGHWAY'
  | 'SNOW_BASE'
  | 'SECRET_LAB'
  | 'COASTAL_HARBOR'
  | 'OCEAN_CARRIER'
  | 'SEA_STRIKE'
  | 'CYBER_BRIDGE'
  | 'MOUNTAIN_PASS'
  | 'AIRCRAFT_CARRIER'
  | 'AERIAL_CLOUD';

export type WeaponId = 
  | 'ASSAULT_RIFLE'
  | 'TACTICAL_SMG'
  | 'HEAVY_SHOTGUN'
  | 'SNIPER_RIFLE'
  | 'PLASMA_CANNON'
  | 'ROCKET_LAUNCHER'
  | 'MINIGUN';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: string;
  description: string;
  damage: number;
  fireRate: number; // shots per sec
  range: number;
  magSize: number;
  reloadTime: number; // seconds
  recoil: number;
  bulletSpeed: number;
  bulletColor: string;
  bulletRadius: number;
  isExplosive?: boolean;
  spread?: number;
  bulletsPerShot?: number;
  cost: number;
  unlockedByDefault: boolean;
  icon: string;
}

export type SpecialAbilityId = 'ORBITAL_STRIKE' | 'BULLET_TIME' | 'DRONE_SWARM' | 'EMP_BLAST' | 'OVERCHARGE_SHIELD';

export interface SpecialAbilityDef {
  id: SpecialAbilityId;
  name: string;
  description: string;
  duration: number;
  cooldown: number;
  icon: string;
}

export type EnemyType = 
  | 'SOLDIER'
  | 'FAST_STRIKER'
  | 'HEAVY_GUNNER'
  | 'RIOT_SHIELD'
  | 'SNIPER'
  | 'ROCKET_SOLDIER'
  | 'DRONE'
  | 'WAR_MECH'
  | 'PATROL_JEEP'
  | 'ENEMY_JET'
  | 'ATTACK_HELI'
  | 'NAVAL_GUNBOAT';

export type BossType = 
  | 'GROUND_WARLORD'
  | 'COLOSSUS_MECH'
  | 'HAVOC_GUNSHIP'
  | 'DREADNOUGHT_JET'
  | 'NAVAL_DREADNOUGHT';

export interface MissionObjective {
  type: 'SURVIVE_TIME' | 'REACH_DISTANCE' | 'KILL_ENEMIES' | 'DESTROY_BOSS' | 'DEFEAT_DRONES' | 'DESTROY_CONVOY' | 'INFINITE_SURVIVE';
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface MissionConfig {
  id: string;
  missionNumber: number;
  codeName: string;
  classification: 'RESTRICTED' | 'SECRET' | 'TOP SECRET' | 'EYES ONLY';
  location: string;
  briefing: string;
  theme: EnvironmentTheme;
  weather: WeatherType;
  gameMode: GameMode;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'NIGHTFALL';
  targetDistance: number;
  objectives: MissionObjective[];
  hasBoss: boolean;
  bossType?: BossType;
  bossName?: string;
  rewardCredits: number;
  rewardXP: number;
  isInfinite?: boolean;
}

export interface RadioMessage {
  id: string;
  sender: 'HQ' | 'COMMANDER VEX' | 'AGENT MERCER' | 'INTEL' | 'OVERWATCH';
  callsign: string;
  text: string;
  urgency: 'NORMAL' | 'WARNING' | 'ALERT' | 'VICTORY';
  timestamp: number;
  duration: number;
}

export interface UpgradeTree {
  // Operative upgrades
  maxHealthLevel: number;
  shieldLevel: number;
  critChanceLevel: number;
  dodgeWindowLevel: number;
  meleeDamageLevel: number;
  creditBonusLevel: number;
  
  // Weapon upgrade levels (keyed by WeaponId)
  weaponDamageLevels: Record<WeaponId, number>;
  weaponMagLevels: Record<WeaponId, number>;
  weaponReloadLevels: Record<WeaponId, number>;
  
  // Aircraft upgrades
  jetArmorLevel: number;
  jetSpeedLevel: number;
  missileCapacityLevel: number;
  flareCooldownLevel: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCredits: number;
  icon: string;
}

export interface SaveData {
  agentName: string;
  level: number;
  xp: number;
  credits: number;
  highestMission: number;
  missionsCompleted: number;
  highestCombo: number;
  highestScore: number;
  totalKills: number;
  totalBossesDefeated: number;
  totalDistanceRun: number;
  
  equippedWeapon: WeaponId;
  equippedSecondaryWeapon: WeaponId;
  equippedAbility: SpecialAbilityId;
  unlockedWeapons: WeaponId[];
  
  upgrades: UpgradeTree;
  achievements: Achievement[];
  
  settings: {
    graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
    soundVolume: number;
    musicVolume: number;
    voiceVolume: number;
    invertPitch: boolean;
    autoFire: boolean;
    autoPilot: boolean;
    hidePanels: boolean;
    vibrationEnabled: boolean;
  };
}

export interface CombatStats {
  score: number;
  combo: number;
  comboMultiplier: number;
  comboTimer: number;
  kills: number;
  headshots: number;
  perfectDodges: number;
  damageTaken: number;
  damageDealt: number;
  accuracyShots: number;
  accuracyHits: number;
  distanceTraveled: number;
  timeElapsed: number;
}
