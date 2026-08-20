export interface VersionInfo {
  version: string;
  buildTime: number;
  buildDate?: string;
  forceUpdate?: boolean;
  channel?: string;
  description?: string;
}

export const CLIENT_VERSION = '2.1.0';
export const CLIENT_BUILD_TIME = 1771569400000;

export class VersionChecker {
  private static instance: VersionChecker;
  private checkIntervalId: number | null = null;
  private listeners: ((info: VersionInfo) => void)[] = [];
  public hasUpdateAvailable = false;
  public latestVersionInfo: VersionInfo | null = null;
  public updateQueuedForNextLevel = false;

  private constructor() {
    this.setupGlobalChunkErrorHandler();
    this.setupLifecycleListeners();
  }

  public static getInstance(): VersionChecker {
    if (!VersionChecker.instance) {
      VersionChecker.instance = new VersionChecker();
    }
    return VersionChecker.instance;
  }

  /**
   * Catches Vite / Cloudflare chunk loading errors (when old bundle hashes are purged by CDN)
   * and immediately performs a hard cache-busting reload.
   */
  private setupGlobalChunkErrorHandler() {
    window.addEventListener('error', (event) => {
      const msg = event.message || '';
      if (
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('error loading dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        console.warn('[VersionChecker] Detected stale CDN chunk mismatch error. Auto-reloading client...');
        this.forceHardReload();
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason?.message || String(event.reason || '');
      if (
        reason.includes('Loading chunk') ||
        reason.includes('Failed to fetch dynamically imported module') ||
        reason.includes('error loading dynamically imported module')
      ) {
        console.warn('[VersionChecker] Detected unhandled chunk rejection. Auto-reloading client...');
        this.forceHardReload();
      }
    });
  }

  /**
   * Checks for updates when user returns to tab or regains internet connectivity
   */
  private setupLifecycleListeners() {
    window.addEventListener('focus', () => {
      this.checkServerVersion();
    });

    window.addEventListener('online', () => {
      this.checkServerVersion();
    });
  }

  /**
   * Starts periodic polling for Cloudflare version updates (every 30 seconds)
   */
  public startPeriodicPolling(intervalMs = 30000) {
    if (this.checkIntervalId) return;
    this.checkServerVersion();
    this.checkIntervalId = window.setInterval(() => {
      this.checkServerVersion();
    }, intervalMs);
  }

  public stopPeriodicPolling() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Fetches latest version with cache-busting query parameter and no-cache headers
   */
  public async checkServerVersion(): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/version.json?_nocache=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      if (!response.ok) {
        return false;
      }

      const serverInfo: VersionInfo = await response.json();
      const isNewer =
        serverInfo.buildTime > CLIENT_BUILD_TIME ||
        serverInfo.version !== CLIENT_VERSION;

      if (isNewer && !this.hasUpdateAvailable) {
        this.hasUpdateAvailable = true;
        this.latestVersionInfo = serverInfo;
        console.log(
          `[VersionChecker] New version detected from Cloudflare: v${serverInfo.version} (Build: ${serverInfo.buildTime})`
        );
        this.notifyListeners(serverInfo);
        return true;
      }
    } catch (e) {
      // Network or offline check failure
    }
    return false;
  }

  public onUpdateDetected(callback: (info: VersionInfo) => void): () => void {
    this.listeners.push(callback);
    if (this.hasUpdateAvailable && this.latestVersionInfo) {
      callback(this.latestVersionInfo);
    }
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(info: VersionInfo) {
    this.listeners.forEach((cb) => {
      try {
        cb(info);
      } catch (err) {
        console.error('[VersionChecker] Error in update listener', err);
      }
    });
  }

  /**
   * Performs an immediate cache-busting hard reload of the application
   */
  public forceHardReload() {
    try {
      // Attempt to clear service worker caches if supported
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      // Ignore cache API errors
    }

    // Force hard reload with timestamp query param to bypass browser and CDN cache
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('_v', Date.now().toString());
    window.location.replace(currentUrl.toString());
  }
}

export const versionChecker = VersionChecker.getInstance();
