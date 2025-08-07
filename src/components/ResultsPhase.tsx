'use client';

import { motion } from 'framer-motion';
import { TrophyIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';
import { DraftOrder } from '@/types';

interface ResultsPhaseProps {
  draftOrder: DraftOrder[];
  onRestart: () => void;
}

export function ResultsPhase({ draftOrder, onRestart }: ResultsPhaseProps) {
  // Sort by draft position
  const sortedOrder = [...draftOrder].sort((a, b) => a.position - b.position);

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-400 to-amber-500';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-amber-600 to-yellow-700';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header - Match RevealPhase styling */}
      <motion.div 
        className="text-center mb-12 backdrop-blur-xl bg-slate-900/50 rounded-3xl p-8 border border-yellow-500/20 shadow-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-xl"
          >
            <TrophyIcon className="h-8 w-8 text-black" />
          </motion.div>
          
          <div>
            <motion.h1 
              className="text-4xl md:text-6xl font-black leading-tight"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                FINAL DRAFT ORDER
              </span>
            </motion.h1>
            <motion.div 
              className="mt-2 flex items-center justify-center gap-2"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-500/30">
                <span className="text-yellow-400 text-lg">🏆</span>
                <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">
                  Fantasy Football 2025
                </span>
                <motion.div 
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ 
                    opacity: [1, 0.3, 1],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl shadow-xl"
          >
            <SparklesIcon className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        {/* Results Complete Banner */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg inline-block mb-6">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-bold tracking-wide uppercase">Draft Order Complete</span>
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            />
          </div>
        </div>
        
        <motion.p 
          className="text-xl text-slate-200 max-w-2xl mx-auto font-medium"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          The destiny has been revealed! Here&apos;s your official fantasy football draft order.
        </motion.p>
      </motion.div>

      {/* Draft Order List */}
      <motion.div 
        className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="space-y-4">
          {sortedOrder.map((pick, index) => (
            <motion.div
              key={pick.id}
              className="relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Position Banner */}
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur border border-white/10 hover:border-orange-400/30 transition-all duration-300 group-hover:scale-[1.02]">
                
                {/* Position Number with Medal */}
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getPositionColor(pick.position)} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-black text-white">
                      #{pick.position}
                    </span>
                  </div>
                  <div className="text-center mt-2 text-2xl">
                    {getPositionEmoji(pick.position)}
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{pick.name}</h3>
                      <p className="text-lg text-slate-300 font-medium">{pick.team}</p>
                    </div>
                    {pick.position === 1 && (
                      <motion.div
                        className="flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrophyIcon className="h-4 w-4" />
                        FIRST PICK!
                      </motion.div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Strategy</div>
                      <div className="text-sm font-medium text-white">{pick.strategy}</div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 md:col-span-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Team Motto</div>
                      <div className="text-sm text-slate-300 italic">&quot;{pick.motto}&quot;</div>
                    </div>
                  </div>

                  {/* Prediction */}
                  <div className="mt-4 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-lg p-3 border border-green-500/20">
                    <div className="text-xs text-green-300 uppercase tracking-wide mb-1">Season Prediction</div>
                    <div className="text-sm text-green-100 font-medium">&quot;{pick.prediction}&quot;</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <p className="text-lg text-slate-300 mb-6">
          🎊 May the best draft strategy win! Good luck this season! 🎊
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            size="xl"
            variant="primary"
            className="text-xl font-bold px-10 py-4 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            />
            <span className="relative z-10 flex items-center gap-3">
              <ArrowPathIcon className="h-5 w-5" />
              Start New Draft Reveal
            </span>
          </Button>
        </div>

        {/* Draft Tips */}
        <motion.div 
          className="mt-12 p-6 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-2xl border border-green-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <h3 className="text-lg font-semibold text-green-200 mb-3">🧠 Draft Day Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-100">
            <div>• Research player injury reports before drafting</div>
            <div>• Don&apos;t reach for your favorite team&apos;s players</div>
            <div>• Have backup plans for every position</div>
            <div>• Pay attention to bye weeks when drafting</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
