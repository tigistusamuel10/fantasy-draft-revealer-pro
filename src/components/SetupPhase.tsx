'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { MemberCard } from './MemberCard';
import { Member, LeagueSize } from '@/types';

interface SetupPhaseProps {
  onStartReveal: (members: Member[]) => void;
}

const leagueData = [
  {
    name: 'Tony2Drippy',
    motto: 'Trussss',
    prediction: 'Will not study for the draft'
  },
  {
    name: 'Sam',
    motto: 'I should have more rings',
    prediction: 'Will lose to Dk by 0.002'
  },
  {
    name: 'Bk',
    motto: 'Cancun on 3!',
    prediction: 'Will end his playoff drought'
  },
  {
    name: 'Aman',
    motto: 'Send an article      .',
    prediction: 'Will not draft a rookie'
  },
  {
    name: 'Josh',
    motto: 'I have more rings',
    prediction: 'No more tuition = No more rings'
  },
  {
    name: 'Ebba',
    motto: "I'm tryna feel sumn",
    prediction: "Will go to Benihana's!"
  },
  {
    name: 'Moni',
    motto: 'We are Aliens!',
    prediction: 'Will trade with Sam'
  },
  {
    name: 'Yanet',
    motto: 'ITS MY TEAM!',
    prediction: 'BK will have no access to her team'
  },
  {
    name: 'T',
    motto: 'The toes better be out!',
    prediction: 'Will trade with Sam'
  },
  {
    name: 'Dk',
    motto: 'mmmmmmmmmmm',
    prediction: 'Will make draft hard by reaching'
  },
  {
    name: 'Yoe',
    motto: "When's the cut starting?",
    prediction: 'Will finish higher than Tony'
  },
  {
    name: 'Nedim',
    motto: "Why they veto...it's fair?",
    prediction: '37 Nedim specials'
  }
];

export function SetupPhase({ onStartReveal }: SetupPhaseProps) {
  const [leagueSize, setLeagueSize] = useState<LeagueSize>(12);
  const [members, setMembers] = useState<Member[]>([]);

  // Initialize members with league data
  useEffect(() => {
    const initialMembers: Member[] = Array.from({ length: leagueSize }, (_, i) => {
      const leagueMember = leagueData[i];
      return {
        id: `member-${i + 1}`,
        name: leagueMember?.name || `Member ${i + 1}`,
        motto: leagueMember?.motto || 'Ready to win!',
        prediction: leagueMember?.prediction || 'This is our year!',
      };
    });
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
      {/* Modern Header Card */}
      <motion.div 
        className="text-center mb-12 relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10">
          {/* Icon row */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-xl"
            >
              <TrophyIcon className="h-8 w-8 text-black" />
            </motion.div>
            
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
          
          {/* Enhanced War Room Title */}
          <motion.div className="space-y-4 mb-6">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-yellow-200 to-slate-100 tracking-wide"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                textShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 30px rgba(251, 191, 36, 0.5)",
                  "0 0 20px rgba(251, 191, 36, 0.3)"
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: "200% 100%"
              }}
            >
              DRAFT DAY WAR ROOM
            </motion.h1>
            
            {/* Animated underline */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mx-auto rounded-full"
            />
            
            {/* Subtitle with dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center gap-3 text-slate-200"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
              
              <motion.span
                className="text-lg md:text-xl font-semibold tracking-wider uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                Fantasy Football 2025
              </motion.span>
              
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i + 3}
                  className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: (i * 0.2) + 0.8
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
          
          {/* Decorative elements */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-2 h-2 bg-orange-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          />
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
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg mb-6">
            <label className="text-xl font-bold text-transparent bg-gradient-to-r from-green-300 via-yellow-400 to-orange-400 bg-clip-text mb-4 block tracking-wide uppercase">
              🏈 League Size Configuration
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
          </div>
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

        {/* Enhanced Start Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.button
            onClick={handleSubmit}
            className="group relative px-16 py-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-xl rounded-xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background layers */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: "200% 100%"
              }}
            />
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              {/* Animated dots before */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              
              {/* Main text with typewriter-style reveal */}
              <motion.span
                className="font-black text-xl md:text-2xl tracking-wider uppercase flex items-center gap-2"
                initial={{ opacity: 0.8 }}
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  textShadow: [
                    "0 0 10px rgba(255, 255, 255, 0.3)",
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 10px rgba(255, 255, 255, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏈
                </motion.span>
                BEGIN DRAFT REVEAL
                <motion.span
                  animate={{ rotate: [0, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                >
                  🏈
                </motion.span>
              </motion.span>
              
              {/* Animated dots after */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i + 3}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: (i * 0.2) + 0.6
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Shine effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            />
            
            {/* Pulse effect on hover */}
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100"
              animate={{
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
