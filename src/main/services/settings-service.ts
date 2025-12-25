import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppSettings } from '../../shared/types';
import { getAppDataPath, safeJsonParse } from '../utils';

export class SettingsService {
  private settingsPath: string;
  private defaultSettings: AppSettings = {
    theme: 'system',
    maxCommits: 1000,
    autoRefresh: true,
    refreshInterval: 5000,
    showAuthor: true,
    showTimestamp: true,
    compactMode: false,
    colorBlindMode: false,
    githubUsernameMap: {}, // New setting for mapping emails to GitHub usernames
  };

  constructor() {
    this.settingsPath = join(getAppDataPath(), 'settings.json');
  }

  async getSettings(): Promise<AppSettings> {
    try {
      if (!existsSync(this.settingsPath)) {
        await this.saveSettings(this.defaultSettings);
        return this.defaultSettings;
      }

      const settingsJson = readFileSync(this.settingsPath, 'utf8');
      const settings = safeJsonParse<AppSettings>(settingsJson, this.defaultSettings);

      // Merge with defaults to ensure all properties exist
      return { ...this.defaultSettings, ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.defaultSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      // Ensure the settings directory exists
      const settingsDir = getAppDataPath();
      if (!existsSync(settingsDir)) {
        mkdirSync(settingsDir, { recursive: true });
      }

      // Validate settings before saving
      const validatedSettings = this.validateSettings(settings);

      writeFileSync(this.settingsPath, JSON.stringify(validatedSettings, null, 2));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Could not save settings');
    }
  }

  private validateSettings(settings: AppSettings): AppSettings {
    return {
      theme: ['light', 'dark', 'system'].includes(settings.theme) ? settings.theme : 'system',
      maxCommits: Math.max(100, Math.min(settings.maxCommits, 50000)),
      autoRefresh: Boolean(settings.autoRefresh),
      refreshInterval: Math.max(1000, Math.min(settings.refreshInterval, 60000)),
      showAuthor: Boolean(settings.showAuthor),
      showTimestamp: Boolean(settings.showTimestamp),
      compactMode: Boolean(settings.compactMode),
      colorBlindMode: Boolean(settings.colorBlindMode),
      githubUsernameMap: typeof settings.githubUsernameMap === 'object' && settings.githubUsernameMap !== null
        ? settings.githubUsernameMap
        : {},
    };
  }

  resetToDefaults(): Promise<void> {
    return this.saveSettings(this.defaultSettings);
  }
}
