import React, { useState, useEffect } from 'react';
import { SaveData } from '../types';
import { SaveManager } from '../game/saveManager';
import { X, Volume2, Monitor, RotateCcw, Sliders, Bot, EyeOff, Maximize, Minimize, Sparkles } from 'lucide-react';
import { sound } from '../game/audio';

interface SettingsModalProps {
  saveData: SaveData;
  onUpdateSave: (newData: SaveData) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSave,
  onClose,
}) => {
  const settings = saveData.settings;
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen toggle:', e);
    }
  };

  const handleToggleSetting = (key: 'autoPilot' | 'hidePanels') => {
    sound.playRadioSquelch();
    const updated: SaveData = {
      ...saveData,
      settings: {
        ...settings,
        [key]: !settings[key],
      },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleQualityChange = (q: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA') => {
    sound.playRadioSquelch();
    const updated: SaveData = {
      ...saveData,
      settings: { ...settings, graphicsQuality: q },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleVolumeChange = (type: 'sfx' | 'music' | 'voice', val: number) => {
    const sfx = type === 'sfx' ? val : settings.soundVolume;
    const music = type === 'music' ? val : settings.musicVolume;
    const voice = type === 'voice' ? val : settings.voiceVolume;

    sound.setVolumes(sfx, music, voice);
    if (type === 'sfx') sound.playGunshot('RIFLE');

    const updated: SaveData = {
      ...saveData,
      settings: {
        ...settings,
        soundVolume: sfx,
        musicVolume: music,
        voiceVolume: voice,
      },
    };
    SaveManager.save(updated);
    onUpdateSave(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all operative campaign records and upgrades?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div 
      id="settings-modal" 
      className="absolute inset-0 z-50 bg-[#020305]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, #111827 0%, #020305 80%)'
      }}
    >
      <div className="relative w-full max-w-xl bg-black/70 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col justify-between my-auto backdrop-blur-md max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
              <Sliders size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">
                SYSTEM CONFIGURATION // OS PARAMETERS
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                SETTINGS
              </h2>
            </div>
          </div>

          <button
            id="close-settings-button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 font-mono">
          
          {/* Automated Gameplay & Display Mode Controls */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Bot size={16} /> AUTOMATION & DISPLAY PARAMETERS
            </div>

            {/* Automated Game Run Mode */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Bot size={14} className="text-cyan-400" />
                  AUTOMATED GAME RUN (SELF-PLAY)
                </div>
                <div className="text-[11px] text-gray-400 font-sans">
                  The operative automatically runs, dodges obstacles, aims, reloads and fires.
                </div>
              </div>
              <button
                id="toggle-autopilot-btn"
                onClick={() => handleToggleSetting('autoPilot')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  settings.autoPilot
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}
              >
                {settings.autoPilot ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Hide UI Panels on Screen */}
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <EyeOff size={14} className="text-amber-400" />
                  HIDE HUD PANELS (CLEAN VIEW)
                </div>
                <div className="text-[11px] text-gray-400 font-sans">
                  Don't show panels on screen; panels only appear when toggled or hovered.
                </div>
              </div>
              <button
                id="toggle-hidepanels-btn"
                onClick={() => handleToggleSetting('hidePanels')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  settings.hidePanels
                    ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 text-gray-400 border-white/10'
                }`}
              >
                {settings.hidePanels ? 'HIDDEN' : 'VISIBLE'}
              </button>
            </div>

            {/* Fullscreen Option */}
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Maximize size={14} className="text-blue-400" />
                  FULL SCREEN DISPLAY
                </div>
                <div className="text-[11px] text-gray-400 font-sans">
                  Expand immersive view to fill entire desktop monitor.
                </div>
              </div>
              <button
                id="toggle-fullscreen-btn"
                onClick={toggleFullscreen}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                  isFullscreen
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                {isFullscreen ? 'EXIT FULLSCREEN' : 'FULL SCREEN'}
              </button>
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Monitor size={14} className="text-blue-400" /> GRAPHICS CLARITY & RESOLUTION
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                    settings.graphicsQuality === q
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 font-sans flex items-center gap-1">
              <Sparkles size={12} className="text-blue-400" />
              Ultra/High renders crisp antialiasing, dynamic volumetric lighting, ocean ripples & shadow mapping.
            </p>
          </div>

          {/* Audio Sliders */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 size={14} className="text-blue-400" /> ACOUSTICS & TELEMETRY AUDIO
            </div>

            <div className="space-y-3 bg-white/5 border border-white/5 rounded-2xl p-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>SFX / COMBAT AUDIO</span>
                  <span className="text-blue-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => handleVolumeChange('sfx', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>DYNAMIC ACTION SYNTH-SCORE</span>
                  <span className="text-blue-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleVolumeChange('music', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>TACTICAL RADIO SYNTHESIS</span>
                  <span className="text-blue-400 font-bold">{Math.round(settings.voiceVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.voiceVolume}
                  onChange={(e) => handleVolumeChange('voice', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-1">
            <button
              onClick={handleResetProgress}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 text-xs font-semibold transition border border-white/5 hover:border-rose-900/50 flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> RESET SAVE DATA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
