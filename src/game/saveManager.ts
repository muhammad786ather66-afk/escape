import { LeaderboardEntry, GameSettings, RaceResult } from '../types';
import { ALL_COUNTRYBALLS } from './countryballsData';

const SETTINGS_KEY = 'countryballs_marble_settings_v1';
const LEADERBOARD_KEY = 'countryballs_marble_leaderboard_v1';
const CURRENT_LEVEL_KEY = 'countryballs_marble_current_level_v1';

export class SaveManager {
  public static loadCurrentLevel(): number {
    try {
      const saved = localStorage.getItem(CURRENT_LEVEL_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load level from storage', e);
    }
    return 1;
  }

  public static saveCurrentLevel(level: number) {
    try {
      localStorage.setItem(CURRENT_LEVEL_KEY, level.toString());
    } catch (e) {
      console.warn('Failed to save level', e);
    }
  }

  public static loadSettings(): GameSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return {
          ...this.getDefaultSettings(),
          ...JSON.parse(saved),
        };
      }
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return this.getDefaultSettings();
  }

  public static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  public static getDefaultSettings(): GameSettings {
    return {
      soundVolume: 0.75,
      musicVolume: 0.45,
      sfxEnabled: true,
      musicEnabled: true,
      simulationSpeed: 1.0,
      cameraMode: 'LEADER',
      showNames: true,
      showTrails: true,
      autoAdvanceDelay: 5,
      particleDensity: 'HIGH',
      selectedCountryIds: ALL_COUNTRYBALLS.slice(0, 16).map((c) => c.id),
    };
  }

  public static loadLeaderboard(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LeaderboardEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load leaderboard', e);
    }

    // Initialize with all countryballs
    return ALL_COUNTRYBALLS.map((c) => ({
      countryId: c.id,
      name: c.name,
      flagCode: c.flagCode,
      primaryColor: c.primaryColor,
      wins: 0,
      top3: 0,
      racesRun: 0,
      totalPoints: 0,
      highestLevelWon: 0,
    }));
  }

  public static saveLeaderboard(entries: LeaderboardEntry[]) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save leaderboard', e);
    }
  }

  public static recordRaceResult(result: RaceResult): LeaderboardEntry[] {
    const leaderboard = this.loadLeaderboard();
    const map = new Map<string, LeaderboardEntry>();
    leaderboard.forEach((entry) => map.set(entry.countryId, entry));

    result.allFinishers.forEach((finisher) => {
      let entry = map.get(finisher.racer.id);
      if (!entry) {
        entry = {
          countryId: finisher.racer.id,
          name: finisher.racer.name,
          flagCode: finisher.racer.flagCode,
          primaryColor: finisher.racer.primaryColor,
          wins: 0,
          top3: 0,
          racesRun: 0,
          totalPoints: 0,
        };
        map.set(finisher.racer.id, entry);
      }

      entry.racesRun += 1;
      entry.totalPoints += finisher.points;

      if (finisher.rank === 1) {
        entry.wins += 1;
        entry.top3 += 1;
        if (!entry.highestLevelWon || result.level > entry.highestLevelWon) {
          entry.highestLevelWon = result.level;
        }
      } else if (finisher.rank <= 3) {
        entry.top3 += 1;
      }
    });

    const updated = Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);
    this.saveLeaderboard(updated);
    return updated;
  }

  public static resetLeaderboard(): LeaderboardEntry[] {
    localStorage.removeItem(LEADERBOARD_KEY);
    return this.loadLeaderboard();
  }
}
