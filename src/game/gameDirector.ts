import { MissionConfig, MissionObjective, EnvironmentTheme, WeatherType, GameMode, BossType, RadioMessage } from '../types';

const OPERATION_NAMES = [
  'THE ESCAPE',
  'BLACKOUT PROTOCOL',
  'DESERT VIPER',
  'SKYFIRE INTERCEPT',
  'PACIFIC STORM CARRIER',
  'IRON CITADEL',
  'NIGHTFALL ASCENT',
  'OCEAN BATTLESHIP SIEGE',
  'PHANTOM SIEGE',
  'SHADOW VECTOR',
  'ARCTIC DUSK',
  'VALKYRIE STRIKE',
  'COASTAL HARBOR RAID',
  'CYBER BREACH',
  'CORONA FALL',
  'CRIMSON TIDE',
  'GHOST DIVISION',
  'APEX PROTOCOL',
  'OBLIVION RUN',
  'TITAN SHADOW',
  'ECLIPSE DAWN',
];

const LOCATIONS = [
  'Sector 7 Industrial District',
  'South China Sea Carrier Base',
  'Karakoram Snow Outpost',
  'Mojave Black-Site Highway',
  'Pacific Naval Strike Fleet',
  'Sector 4 Underground Research Complex',
  'Neo-Tokyo Transit Corridor',
  'Strait of Hormuz Naval Harbor',
  'Balkan Mountain Pass',
  'Kowloon High-Tech Bridge',
  'Stratosphere 30,000 FT',
  'Archipelago Coastal Fortress',
];

const THEMES: EnvironmentTheme[] = [
  'NEON_CITY',
  'OCEAN_CARRIER',
  'WAR_ZONE',
  'SEA_STRIKE',
  'DESERT_HIGHWAY',
  'SNOW_BASE',
  'SECRET_LAB',
  'COASTAL_HARBOR',
  'CYBER_BRIDGE',
  'MOUNTAIN_PASS',
  'AIRCRAFT_CARRIER',
  'AERIAL_CLOUD',
];

const WEATHERS: WeatherType[] = ['CLEAR', 'SUNSET', 'NIGHT', 'RAIN', 'SNOW', 'DUST_STORM', 'OCEAN_STORM'];

export class GameDirector {
  public static generateMission(missionNum: number, forceMode?: GameMode): MissionConfig {
    const isFlightMission = forceMode === 'AIRCRAFT' || (missionNum % 4 === 0 && missionNum >= 4);
    const gameMode: GameMode = isFlightMission ? 'AIRCRAFT' : 'GROUND';

    const nameIdx = (missionNum - 1) % OPERATION_NAMES.length;
    const codeName = OPERATION_NAMES[nameIdx] + (missionNum > OPERATION_NAMES.length ? ` - PHASE ${Math.floor(missionNum / OPERATION_NAMES.length) + 1}` : '');
    const location = LOCATIONS[(missionNum - 1) % LOCATIONS.length];

    let theme: EnvironmentTheme;
    if (gameMode === 'AIRCRAFT') {
      theme = missionNum % 3 === 0 ? 'SEA_STRIKE' : 'AERIAL_CLOUD';
    } else {
      theme = THEMES[(missionNum - 1) % (THEMES.length)];
    }

    const weather: WeatherType = theme === 'SNOW_BASE' ? 'SNOW' 
      : theme === 'DESERT_HIGHWAY' ? 'DUST_STORM'
      : theme === 'NEON_CITY' ? 'NIGHT'
      : theme === 'OCEAN_CARRIER' || theme === 'SEA_STRIKE' ? 'OCEAN_STORM'
      : WEATHERS[Math.floor(Math.random() * WEATHERS.length)];

    let threatLevel: MissionConfig['threatLevel'] = 'LOW';
    if (missionNum >= 30) threatLevel = 'NIGHTFALL';
    else if (missionNum >= 15) threatLevel = 'EXTREME';
    else if (missionNum >= 8) threatLevel = 'HIGH';
    else if (missionNum >= 4) threatLevel = 'MEDIUM';

    const targetDistance = Math.min(2500, 600 + missionNum * 120);

    const hasBoss = missionNum >= 2 && (missionNum % 2 === 0 || missionNum % 5 === 0);
    let bossType: BossType | undefined;
    let bossName: string | undefined;

    if (hasBoss) {
      if (gameMode === 'AIRCRAFT') {
        bossType = missionNum >= 10 ? 'DREADNOUGHT_JET' : 'HAVOC_GUNSHIP';
        bossName = bossType === 'DREADNOUGHT_JET' ? 'AIR FORTRESS "VALKYRIE-9"' : 'AH-88 HAVOC GUNSHIP';
      } else {
        if (theme === 'OCEAN_CARRIER' || theme === 'SEA_STRIKE' || theme === 'COASTAL_HARBOR') {
          bossType = 'NAVAL_DREADNOUGHT';
          bossName = 'NAVAL BATTLESHIP "LEVIATHAN-7"';
        } else {
          bossType = missionNum % 4 === 0 ? 'COLOSSUS_MECH' : 'GROUND_WARLORD';
          bossName = bossType === 'COLOSSUS_MECH' ? 'WAR MACHINE "TITAN-X"' : 'WARLORD GENERAL KORVEX';
        }
      }
    }

    const objectives: MissionObjective[] = [
      {
        type: 'REACH_DISTANCE',
        description: `Infiltrate and push ${targetDistance}m to extraction point`,
        target: targetDistance,
        current: 0,
        completed: false,
      },
      {
        type: 'KILL_ENEMIES',
        description: `Eliminate ${Math.min(50, 10 + missionNum * 3)} hostile operatives`,
        target: Math.min(50, 10 + missionNum * 3),
        current: 0,
        completed: false,
      },
    ];

    if (hasBoss && bossName) {
      objectives.push({
        type: 'DESTROY_BOSS',
        description: `Neutralize high-value target: ${bossName}`,
        target: 1,
        current: 0,
        completed: false,
      });
    }

    const briefing = gameMode === 'AIRCRAFT' 
      ? `Agent Mercer, scrambler jets have intercepted our airspace over ${location}. Take control of the Specter-X fighter, neutralize enemy bogeys, and escort the strike package.`
      : `Agent Mercer, hostile forces have secured the perimeter at ${location}. The extraction window is critical. Breach enemy lines, neutralize high-value hostiles, and reach the extraction LZ.`;

    return {
      id: `MISSION_${missionNum}`,
      missionNumber: missionNum,
      codeName,
      classification: missionNum >= 10 ? 'TOP SECRET' : missionNum >= 5 ? 'SECRET' : 'RESTRICTED',
      location,
      briefing,
      theme,
      weather,
      gameMode,
      threatLevel,
      targetDistance,
      objectives,
      hasBoss,
      bossType,
      bossName,
      rewardCredits: 300 + missionNum * 120 + (hasBoss ? 400 : 0),
      rewardXP: 250 + missionNum * 90 + (hasBoss ? 350 : 0),
    };
  }

  // Generate Infinite Survival Endless Run
  public static generateInfiniteMission(preferredMode: GameMode = 'GROUND'): MissionConfig {
    return {
      id: 'MISSION_INFINITE_OPS',
      missionNumber: 999,
      codeName: 'PROJECT ENDLESS PROTOCOL // INFINITE SURVIVAL',
      classification: 'EYES ONLY',
      location: 'Global Shifting Theaters (Sea, Air, Land & Space)',
      briefing: 'Directive 00: Autonomous Deep Infiltration. Survive as long as possible against relentless waves of hostile mechanized brigades, naval dreadnoughts, and aerial interceptors. Distance and score are limitless.',
      theme: preferredMode === 'AIRCRAFT' ? 'AERIAL_CLOUD' : 'OCEAN_CARRIER',
      weather: 'SUNSET',
      gameMode: preferredMode,
      threatLevel: 'NIGHTFALL',
      targetDistance: Infinity,
      isInfinite: true,
      objectives: [
        {
          type: 'INFINITE_SURVIVE',
          description: 'Survive continuously and rack up maximum distance & combat score',
          target: 999999,
          current: 0,
          completed: false,
        },
        {
          type: 'KILL_ENEMIES',
          description: 'Neutralize infinite hostile waves and sector bosses',
          target: 999999,
          current: 0,
          completed: false,
        },
      ],
      hasBoss: true,
      bossType: preferredMode === 'AIRCRAFT' ? 'DREADNOUGHT_JET' : 'COLOSSUS_MECH',
      bossName: 'SECTOR BOSS INTERCEPT',
      rewardCredits: 5000,
      rewardXP: 4000,
    };
  }

  // Dynamic Radio Commentary Generator
  public static getRadioDialogue(event: 
    | 'MISSION_START' 
    | 'HOSTILE_WAVE' 
    | 'SNIPER_ALERT' 
    | 'MISSILE_INCOMING' 
    | 'BOSS_SPAWNED' 
    | 'BOSS_DEFEATED' 
    | 'LOW_HEALTH' 
    | 'COMBO_5' 
    | 'COMBO_10' 
    | 'EXTRACTION_NEAR' 
    | 'FLARES_DEPLOYED'
    | 'VICTORY'
  ): RadioMessage {
    const time = Date.now();
    switch (event) {
      case 'MISSION_START':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'NIGHTFALL OVERWATCH',
          text: 'Mercer, you are clear for engagement. Extraction window is ticking. Move!',
          urgency: 'NORMAL',
          timestamp: time,
          duration: 4.5,
        };
      case 'HOSTILE_WAVE': {
        const lines = [
          'Contact! Multiple hostiles moving into your sector!',
          'Heavy squad inbound! Watch your flanks!',
          'Enemy vanguard advancing. Neutralize on sight!',
          'Reinforcements detected on tactical radar!',
        ];
        return {
          id: `radio_${time}`,
          sender: 'INTEL',
          callsign: 'NIGHTFALL INTEL',
          text: lines[Math.floor(Math.random() * lines.length)],
          urgency: 'WARNING',
          timestamp: time,
          duration: 3.8,
        };
      }
      case 'SNIPER_ALERT':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'OVERWATCH',
          text: 'Laser designator spotted! Sniper on the perimeter, slide or take cover!',
          urgency: 'ALERT',
          timestamp: time,
          duration: 3.5,
        };
      case 'MISSILE_INCOMING':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'TACTICAL RADAR',
          text: 'MISSILE LOCK DETECTED! Evade or deploy countermeasure flares immediately!',
          urgency: 'ALERT',
          timestamp: time,
          duration: 3.2,
        };
      case 'BOSS_SPAWNED':
        return {
          id: `radio_${time}`,
          sender: 'COMMANDER VEX',
          callsign: 'COMMANDER VEX',
          text: 'You made a mistake coming here, Mercer. Your agency dies with you today!',
          urgency: 'ALERT',
          timestamp: time,
          duration: 4.5,
        };
      case 'BOSS_DEFEATED':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'NIGHTFALL OVERWATCH',
          text: 'High-value target neutralized! Splendid work, Mercer. Path to LZ is clear.',
          urgency: 'VICTORY',
          timestamp: time,
          duration: 4.0,
        };
      case 'LOW_HEALTH':
        return {
          id: `radio_${time}`,
          sender: 'INTEL',
          callsign: 'BIO-MONITOR',
          text: 'Warning: Operative vitals critical! Armor integrity failing!',
          urgency: 'ALERT',
          timestamp: time,
          duration: 3.0,
        };
      case 'COMBO_5':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'NIGHTFALL OVERWATCH',
          text: 'Combo x5! Keep up the momentum, Mercer!',
          urgency: 'NORMAL',
          timestamp: time,
          duration: 2.8,
        };
      case 'COMBO_10':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'NIGHTFALL OVERWATCH',
          text: 'Phantom status confirmed! Unbelievable combat precision!',
          urgency: 'VICTORY',
          timestamp: time,
          duration: 3.0,
        };
      case 'EXTRACTION_NEAR':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'EXTRACTION 1',
          text: 'Echo-Four is on station at the landing zone. Inbound for pickup in 100 meters!',
          urgency: 'VICTORY',
          timestamp: time,
          duration: 4.0,
        };
      case 'FLARES_DEPLOYED':
        return {
          id: `radio_${time}`,
          sender: 'AGENT MERCER',
          callsign: 'AGENT MERCER',
          text: 'Countermeasures deployed. Missile tracking defeated.',
          urgency: 'NORMAL',
          timestamp: time,
          duration: 2.5,
        };
      case 'VICTORY':
        return {
          id: `radio_${time}`,
          sender: 'HQ',
          callsign: 'NIGHTFALL OVERWATCH',
          text: 'Extraction confirmed. Mission accomplished. Welcome back to base, Agent.',
          urgency: 'VICTORY',
          timestamp: time,
          duration: 4.0,
        };
    }
  }
}
