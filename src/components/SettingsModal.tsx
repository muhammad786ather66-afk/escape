import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Volume2, VolumeX, Music, FastForward, Clock, Keyboard, CloudLightning, RefreshCw, CheckCircle2 } from 'lucide-react';
import { GameSettings } from '../types';
import { versionChecker, CLIENT_VERSION } from '../game/versionChecker';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatusText('Checking Cloudflare CDN...');
    try {
      const hasNew = await versionChecker.checkServerVersion();
      if (hasNew) {
        setUpdateStatusText('New version found! Reloading...');
        setTimeout(() => {
          versionChecker.forceHardReload();
        }, 800);
      } else {
        setUpdateStatusText('You are running the latest version.');
        setTimeout(() => setUpdateStatusText(null), 3000);
      }
    } catch (e) {
      setUpdateStatusText('Check failed (offline or network error).');
      setTimeout(() => setUpdateStatusText(null), 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900/95 border border-white/15 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <SettingsIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                GAME SETTINGS
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Audio, simulation timing & controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-4 space-y-5">
          {/* Sound Effects Volume */}
          <div>
            <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold">
                <Volume2 size={16} className="text-blue-400" />
                SFX VOLUME (ASMR Physics & Impacts)
              </span>
              <span>{(settings.soundVolume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Background Music Volume */}
          <div>
            <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold">
                <Music size={16} className="text-pink-400" />
                BACKGROUND MUSIC
              </span>
              <span>{(settings.musicVolume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Auto Advance Podium Delay */}
          <div>
            <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock size={16} className="text-amber-400" />
                AUTO-ADVANCE PODIUM TIMER
              </span>
              <span>{settings.autoAdvanceDelay} seconds</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={settings.autoAdvanceDelay}
              onChange={(e) =>
                onUpdateSettings({ ...settings, autoAdvanceDelay: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Cloudflare Live Auto-Update Section */}
          <div className="bg-emerald-950/40 rounded-2xl border border-emerald-500/30 p-3 text-xs font-mono text-emerald-300">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-200">
                <CloudLightning size={16} className="text-emerald-400" />
                <span>CLOUDFLARE LIVE AUTO-SYNC</span>
              </div>
              <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                v{CLIENT_VERSION}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mb-2.5">
              When new builds deploy, browsers are automatically refreshed with cache-busting on the next level transition.
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-emerald-400">
                {updateStatusText || 'Auto-polling active every 30s'}
              </span>
              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition cursor-pointer disabled:opacity-50 shadow"
              >
                <RefreshCw size={12} className={isCheckingUpdate ? 'animate-spin' : ''} />
                <span>Check Now</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="bg-slate-950/60 rounded-2xl border border-white/10 p-3 text-xs font-mono text-gray-300">
            <div className="font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Keyboard size={14} />
              <span>KEYBOARD SHORTCUTS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">SPACE</kbd> Pause / Resume</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">R</kbd> Restart Race</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">N</kbd> Skip / Next Race</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">M</kbd> Mute Audio</div>
              <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">F</kbd> Fullscreen</div>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-sm uppercase tracking-wider transition cursor-pointer shadow-lg mt-2"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
