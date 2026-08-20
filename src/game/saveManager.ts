import { SaveData, WeaponId, UpgradeTree, Achievement } from '../types';
import { WEAPONS_DATABASE } from './weapons';

const SAVE_STORAGE_KEY = 'OPERATION_SHADOW_STRIKE_SAVE_V1';

export const INITIAL_UPGRADES: UpgradeTree = {
  maxHealthLevel: 0,
  shieldLevel: 0,
  critChanceLevel: 0,
  dodgeWindowLevel: 0,
  meleeDamageLevel: 0,
  creditBonusLevel: 0,
  
  weaponDamageLevels: {
    ASSAULT_RIFLE: 0,
    TACTICAL_SMG: 0,
    HEAVY_SHOTGUN: 0,
    SNIPER_RIFLE: 0,
    PLASMA_CANNON: 0,
    ROCKET_LAUNCHER: 0,
    MINIGUN: 0,
  },
  weaponMagLevels: {
    ASSAULT_RIFLE: 0,
    TACTICAL_SMG: 0,
    HEAVY_SHOTGUN: 0,
    SNIPER_RIFLE: 0,
    PLASMA_CANNON: 0,
    ROCKET_LAUNCHER: 0,
    MINIGUN: 0,
  },
  weaponReloadLevels: {
    ASSAULT_RIFLE: 0,
    TACTICAL_SMG: 0,
    HEAVY_SHOTGUN: 0,
    SNIPER_RIFLE: 0,
    PLASMA_CANNON: 0,
    ROCKET_LAUNCHER: 0,
    MINIGUN: 0,
  },
  
  jetArmorLevel: 0,
  jetSpeedLevel: 0,
  missileCapacityLevel: 0,
  flareCooldownLevel: 0,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_BLOOD', title: 'First Blood', description: 'Eliminate your first hostile operative.', unlocked: false, progress: 0, maxProgress: 1, rewardCredits: 200, icon: 'Crosshair' },
  { id: 'KILL_50', title: 'Tactical Sweeper', description: 'Eliminate 50 hostiles across any missions.', unlocked: false, progress: 0, maxProgress: 50, rewardCredits: 800, icon: 'ShieldAlert' },
  { id: 'KILL_200', title: 'Shadow Reaper', description: 'Eliminate 200 hostiles.', unlocked: false, progress: 0, maxProgress: 200, rewardCredits: 2500, icon: 'Skull' },
  { id: 'BOSS_SLAYER', title: 'Heavy Target Neutralized', description: 'Defeat your first Boss or Gunship.', unlocked: false, progress: 0, maxProgress: 1, rewardCredits: 1200, icon: 'Flame' },
  { id: 'COMBO_MASTER', title: 'Ghost Operative', description: 'Achieve a 10x Combat Combo.', unlocked: false, progress: 0, maxProgress: 10, rewardCredits: 1500, icon: 'Zap' },
  { id: 'FLIGHT_ACE', title: 'Skyfire Ace', description: 'Destroy 25 aerial targets in Aircraft Combat.', unlocked: false, progress: 0, maxProgress: 25, rewardCredits: 2000, icon: 'Plane' },
  { id: 'WEAPON_HOARDER', title: 'Black Market Specialist', description: 'Unlock 4 different firearms in Arsenal.', unlocked: false, progress: 1, maxProgress: 4, rewardCredits: 3000, icon: 'FolderLock' },
];

export const INITIAL_SAVE_DATA: SaveData = {
  agentName: 'Agent Kai Mercer',
  level: 1,
  xp: 0,
  credits: 500,
  highestMission: 1,
  missionsCompleted: 0,
  highestCombo: 0,
  highestScore: 0,
  totalKills: 0,
  totalBossesDefeated: 0,
  totalDistanceRun: 0,
  
  equippedWeapon: 'ASSAULT_RIFLE',
  equippedSecondaryWeapon: 'TACTICAL_SMG',
  equippedAbility: 'BULLET_TIME',
  unlockedWeapons: ['ASSAULT_RIFLE'],
  
  upgrades: INITIAL_UPGRADES,
  achievements: INITIAL_ACHIEVEMENTS,
  
  settings: {
    graphicsQuality: 'HIGH',
    soundVolume: 0.8,
    musicVolume: 0.65,
    voiceVolume: 0.9,
    invertPitch: false,
    autoFire: true,
    autoPilot: true,
    hidePanels: false,
    vibrationEnabled: true,
  },
};

export class SaveManager {
  private static cachedData: SaveData | null = null;

  public static load(): SaveData {
    if (this.cachedData) return this.cachedData;
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with initial save in case new fields were added
        this.cachedData = {
          ...INITIAL_SAVE_DATA,
          ...parsed,
          upgrades: {
            ...INITIAL_SAVE_DATA.upgrades,
            ...(parsed.upgrades || {}),
            weaponDamageLevels: { ...INITIAL_SAVE_DATA.upgrades.weaponDamageLevels, ...(parsed.upgrades?.weaponDamageLevels || {}) },
            weaponMagLevels: { ...INITIAL_SAVE_DATA.upgrades.weaponMagLevels, ...(parsed.upgrades?.weaponMagLevels || {}) },
            weaponReloadLevels: { ...INITIAL_SAVE_DATA.upgrades.weaponReloadLevels, ...(parsed.upgrades?.weaponReloadLevels || {}) },
          },
          settings: {
            ...INITIAL_SAVE_DATA.settings,
            ...(parsed.settings || {}),
          },
          achievements: INITIAL_ACHIEVEMENTS.map(ach => {
            const savedAch = parsed.achievements?.find((a: Achievement) => a.id === ach.id);
            return savedAch ? { ...ach, ...savedAch } : ach;
          }),
        };
        return this.cachedData;
      }
    } catch {
      // Ignore parsing errors and fallback
    }
    this.cachedData = { ...INITIAL_SAVE_DATA };
    return this.cachedData;
  }

  public static save(data: SaveData): void {
    this.cachedData = data;
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage may fail in some environments
    }
  }

  public static getRankTitle(level: number): { title: string; badgeColor: string } {
    if (level < 3) return { title: 'Recruit', badgeColor: 'text-zinc-400' };
    if (level < 7) return { title: 'Field Operative', badgeColor: 'text-emerald-400' };
    if (level < 15) return { title: 'Special Agent', badgeColor: 'text-sky-400' };
    if (level < 25) return { title: 'Elite Agent', badgeColor: 'text-indigo-400' };
    if (level < 40) return { title: 'Shadow Agent', badgeColor: 'text-purple-400' };
    if (level < 60) return { title: 'Strike Commander', badgeColor: 'text-amber-400' };
    return { title: 'Legendary Phantom', badgeColor: 'text-rose-500' };
  }

  public static getXPForNextLevel(level: number): number {
    return Math.floor(400 * Math.pow(1.22, level - 1));
  }

  // Calculate upgraded weapon attributes
  public static getWeaponEffectiveStats(weaponId: WeaponId, upgrades: UpgradeTree) {
    const base = WEAPONS_DATABASE[weaponId];
    const dmgLvl = upgrades.weaponDamageLevels[weaponId] || 0;
    const magLvl = upgrades.weaponMagLevels[weaponId] || 0;
    const relLvl = upgrades.weaponReloadLevels[weaponId] || 0;

    return {
      damage: Math.round(base.damage * (1 + dmgLvl * 0.15)),
      magSize: Math.round(base.magSize * (1 + magLvl * 0.2)),
      reloadTime: Number((base.reloadTime * (1 - relLvl * 0.08)).toFixed(2)),
      fireRate: base.fireRate,
      range: base.range,
      bulletSpeed: base.bulletSpeed,
      recoil: base.recoil,
    };
  }

  // Player suit upgrades
  public static getPlayerSuitStats(upgrades: UpgradeTree) {
    return {
      maxHealth: 100 + upgrades.maxHealthLevel * 20,
      maxShield: 50 + upgrades.shieldLevel * 15,
      critChance: 0.05 + upgrades.critChanceLevel * 0.04,
      meleeDamage: 60 + upgrades.meleeDamageLevel * 25,
      creditMultiplier: 1.0 + upgrades.creditBonusLevel * 0.15,
    };
  }

  // Jet stats
  public static getJetStats(upgrades: UpgradeTree) {
    return {
      maxArmor: 200 + upgrades.jetArmorLevel * 40,
      speedBonus: 1.0 + upgrades.jetSpeedLevel * 0.08,
      missileCap: 6 + upgrades.missileCapacityLevel * 2,
      flareCooldown: Math.max(3, 8 - upgrades.flareCooldownLevel * 1.0),
    };
  }
}
