'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useAudio } from '@/hooks/useBackgroundMusic';

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { volume, isMuted, toggleMute, changeVolume, isPlaying, play, pause, currentTrack } = useAudio();

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-md rounded-xl border border-slate-600/50 hover:border-yellow-500/50 transition-colors shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Settings"
      >
        <Cog6ToothIcon className="h-5 w-5 text-slate-300 hover:text-yellow-400 transition-colors" />
        
        {/* Audio Status Indicator */}
        {isPlaying && !isMuted && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            title="Audio Playing"
          />
        )}
        
        {isMuted && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            title="Audio Muted"
          />
        )}
      </motion.button>

      {/* Settings Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ zIndex: -1 }}
            />
            
            {/* Settings Panel */}
            <motion.div
              className="absolute top-14 right-0 w-72 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border-b border-slate-600/50">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cog6ToothIcon className="h-4 w-4 text-yellow-400" />
                  Settings
                </h3>
              </div>

              {/* Audio Controls */}
              <div className="p-4 space-y-4">
                {/* Audio Section Header */}
                <div className="flex items-center gap-2 mb-3">
                  <SpeakerWaveIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Audio</span>
                </div>

                {/* Manual Play Button for debugging */}
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-slate-300 font-medium">Manual Controls</label>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        console.log('🔄 Manual play triggered');
                        try {
                          await play();
                        } catch (error) {
                          console.error('Manual play failed:', error);
                        }
                      }}
                      className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                    >
                      ▶ PLAY
                    </button>
                    <button
                      onClick={pause}
                      className="px-3 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-semibold hover:bg-orange-500/30 transition-colors"
                    >
                      ⏸ PAUSE
                    </button>
                  </div>
                </div>

                {/* Mute Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 font-medium">Background Music</label>
                  <button
                    onClick={toggleMute}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isMuted 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {isMuted ? (
                      <>
                        <SpeakerXMarkIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">MUTED</span>
                      </>
                    ) : (
                      <>
                        <SpeakerWaveIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">ON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300 font-medium">Volume</label>
                    <span className="text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      disabled={isMuted}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Audio Info */}
                <div className="pt-3 border-t border-slate-600/50">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {currentTrack === 'lobby' ? '🎶 Lobby Music' : '🏈 NFL Theme Music'}
                    </span>
                    <span className={`font-semibold ${
                      isMuted 
                        ? 'text-red-400' 
                        : isPlaying 
                          ? 'text-green-400' 
                          : 'text-orange-400'
                    }`}>
                      {isMuted ? 'MUTED' : isPlaying ? 'PLAYING' : 'PAUSED'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: 2px solid #1e293b;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }
        
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: 2px solid #1e293b;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .slider:disabled::-webkit-slider-thumb {
          background: #64748b;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
