import React, { useState } from 'react';
import { CommentaryMessage } from '../types';
import { Radio, Mic, MicOff, MessageSquare, Volume2, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { sound } from '../game/audioSynth';

interface LiveCommentaryTickerProps {
  currentMessage: CommentaryMessage | null;
  history: CommentaryMessage[];
}

export const LiveCommentaryTicker: React.FC<LiveCommentaryTickerProps> = ({
  currentMessage,
  history,
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(!sound.commentaryVoiceMuted);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const toggleVoice = () => {
    const nextState = sound.toggleCommentaryVoice();
    setVoiceEnabled(!nextState);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 sm:right-64 z-30 pointer-events-none flex flex-col gap-1.5">
      {/* Expanded History Drawer */}
      {showHistory && (
        <div className="bg-slate-950/95 backdrop-blur-md border border-white/20 rounded-2xl p-3 max-h-48 overflow-y-auto pointer-events-auto space-y-1.5 shadow-2xl custom-scroll">
          <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center justify-between pb-1 border-b border-white/10">
            <span>🎙️ LIVE COMMENTARY LOG</span>
            <span className="text-gray-400">{history.length} events</span>
          </div>
          {history.map((msg) => (
            <div
              key={msg.id}
              className={`text-xs p-1.5 rounded-lg border flex items-start gap-2 ${
                msg.type === 'LEAD_CHANGE'
                  ? 'bg-amber-500/10 border-amber-400/30 text-amber-200 font-semibold'
                  : msg.type === 'FINISH' || msg.type === 'TOURNAMENT'
                  ? 'bg-purple-500/20 border-purple-400/40 text-purple-200 font-bold'
                  : msg.type === 'HAZARD_HIT'
                  ? 'bg-orange-500/10 border-orange-400/30 text-orange-200'
                  : 'bg-white/5 border-white/5 text-gray-200'
              }`}
            >
              <span className="text-[10px] font-mono text-gray-400 shrink-0">
                {new Date(msg.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
              </span>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Broadcast Ticker Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-400/30 rounded-2xl px-3.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2.5 pointer-events-auto">
        {/* Live Broadcast Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-red-600/90 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-md animate-pulse">
            <Radio size={12} />
            <span>LIVE COMM</span>
          </div>
        </div>

        {/* Dynamic Commentary Text */}
        <div className="flex-1 overflow-hidden">
          <div className="text-xs sm:text-sm font-bold text-cyan-100 truncate tracking-wide flex items-center gap-2">
            <span className="text-amber-400 animate-pulse">●</span>
            <span className="drop-shadow">
              {currentMessage ? currentMessage.text : 'Welcome to the 50-Stage World Championship! Racers at the ready...'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* TTS Announcer Voice Toggle */}
          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95 ${
              voiceEnabled
                ? 'bg-emerald-600/80 border-emerald-400 text-white shadow-emerald-900/50'
                : 'bg-slate-800 border-white/20 text-gray-400 hover:text-white'
            }`}
            title={voiceEnabled ? 'Announcer Voice ON (Web Speech TTS)' : 'Announcer Voice Muted'}
          >
            {voiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            <span className="hidden md:inline text-[10px] uppercase font-mono">
              {voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}
            </span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
            title="Toggle Commentary History"
          >
            {showHistory ? <ChevronDown size={14} /> : <MessageSquare size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
