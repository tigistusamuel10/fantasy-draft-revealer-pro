'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { MemberCard } from './MemberCard';
import { Button } from './ui/Button';
import { Member, LeagueSize, DraftStrategy } from '@/types';

interface SetupPhaseProps {
  onStartReveal: (members: Member[]) => void;
}

const testNames = [
  'Alex Johnson', 'Morgan Smith', 'Taylor Davis', 'Jordan Wilson',
  'Casey Brown', 'Riley Jones', 'Avery Miller', 'Quinn Garcia',
  'Blake Martinez', 'Sage Anderson', 'Drew Thompson', 'Reese Williams'
];

const funTeamNames = [
  'Thunder Bolts', 'Fire Dragons', 'Lightning Strikes', 'Storm Chasers',
  'Phantom Force', 'Steel Titans', 'Shadow Wolves', 'Crimson Eagles',
  'Golden Gladiators', 'Mystic Warriors', 'Apex Predators', 'Velocity Vipers'
];

const funMottos = [
  'Victory at all costs!', 'Champions never quit!', 'Dominate or go home!',
  'Fear the fury!', 'Legends in the making!', 'Unstoppable force!',
  'Rise above all!', 'Conquer everything!', 'Never back down!',
  'Elite performance only!', 'Maximum effort, maximum results!', 'Championship or bust!'
];

const funPredictions = [
  'Going undefeated this season!', 'Championship trophy incoming!', 
  'Playoff domination guaranteed!', 'Setting new league records!',
  'First place finish locked in!', 'Fantasy football perfection!',
  'Winning it all this year!', 'League champion destiny!',
  'Unstoppable season ahead!', 'Trophy case getting fuller!',
  'Victory parade planning!', 'Championship celebration ready!'
];

export function SetupPhase({ onStartReveal }: SetupPhaseProps) {
  const [leagueSize, setLeagueSize] = useState<LeagueSize>(12);
  const [members, setMembers] = useState<Member[]>([]);

  // Initialize members with test data
  useEffect(() => {
    const initialMembers: Member[] = Array.from({ length: leagueSize }, (_, i) => ({
      id: `member-${i + 1}`,
      name: testNames[i] || `Member ${i + 1}`,
      team: funTeamNames[i] || `Team ${i + 1}`,
      motto: funMottos[i] || 'Ready to win!',
      strategy: (['RB Heavy', 'WR First', 'Zero RB', 'Best Available', 'QB Early'] as DraftStrategy[])[i % 5],
      prediction: funPredictions[i] || 'This is our year!',
    }));
    setMembers(initialMembers);
  }, [leagueSize]);

  const updateMember = (index: number, field: keyof Member, value: string) => {
    setMembers(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    );
  };

  const handleSubmit = () => {
    // Validate all members have names
    const hasEmptyNames = members.some(member => !member.name.trim());
    if (hasEmptyNames) {
      alert('Please enter names for all league members.');
      return;
    }

    onStartReveal(members);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header - Match RevealPhase styling */}
      <motion.div 
        className="text-center mb-12 backdrop-blur-xl bg-slate-900/50 rounded-3xl p-8 border border-yellow-500/20 shadow-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                DRAFT DAY WAR ROOM
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
                <span className="text-yellow-400 text-lg">🏈</span>
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
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-xl"
          >
            <SparklesIcon className="h-8 w-8 text-white" />
          </motion.div>
        </div>
        
        {/* Live Setup Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg inline-block mb-6">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-bold tracking-wide uppercase">Draft Setup in Progress</span>
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </div>
        
        <motion.p 
          className="text-xl text-slate-200 max-w-2xl mx-auto font-medium"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Configure your league and prepare for an epic, cinematic draft order reveal!
        </motion.p>
      </motion.div>

      {/* Setup Content */}
      <motion.div 
        className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* League Size Selector */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <label className="text-xl font-semibold text-white mb-4 block">
            League Size:
          </label>
          <select 
            value={leagueSize} 
            onChange={(e) => setLeagueSize(Number(e.target.value) as LeagueSize)}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-3 text-lg font-medium text-white focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-400 transition-all duration-300 cursor-pointer hover:bg-white/15"
          >
            <option value={8}>8 Teams</option>
            <option value={10}>10 Teams</option>
            <option value={12}>12 Teams</option>
            <option value={14}>14 Teams</option>
            <option value={16}>16 Teams</option>
          </select>
        </motion.div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
            >
              <MemberCard
                member={member}
                index={index}
                onUpdate={updateMember}
              />
            </motion.div>
          ))}
        </div>

        {/* Start Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Button
            onClick={handleSubmit}
            size="xl"
            variant="primary"
            className="text-2xl font-bold px-12 py-6 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <span className="relative z-10 flex items-center gap-3">
              🏈 BEGIN DRAFT REVEAL 🏈
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
