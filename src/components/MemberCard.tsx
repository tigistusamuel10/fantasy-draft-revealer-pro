'use client';

import { motion } from 'framer-motion';
import { UserIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Member } from '@/types';

interface MemberCardProps {
  member: Member;
  index: number;
  onUpdate: (index: number, field: keyof Member, value: string) => void;
}

export function MemberCard({ member, index, onUpdate }: MemberCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-400/30 group"
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header with Position */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-orange-400 drop-shadow-sm" />
          <span className="text-sm font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text tracking-wider uppercase">Member #{index + 1}</span>
        </div>
        <TrophyIcon className="h-5 w-5 text-yellow-400 opacity-60 group-hover:opacity-100 transition-all duration-300 hover:scale-110" />
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text mb-2 tracking-wide">
          🏈 NAME
        </label>
        <input
          type="text"
          value={member.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
          placeholder="Enter member name"
        />
      </div>

      {/* Motto Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text mb-2 tracking-wide">
          💪 MOTTO
        </label>
        <input
          type="text"
          value={member.motto}
          onChange={(e) => onUpdate(index, 'motto', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
          placeholder="Enter team motto"
        />
      </div>

      {/* Prediction Input */}
      <div className="mb-0">
        <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text mb-2 tracking-wide">
          🔮 SEASON PREDICTION
        </label>
        <input
          type="text"
          value={member.prediction}
          onChange={(e) => onUpdate(index, 'prediction', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
          placeholder="Enter season prediction"
        />
      </div>
    </motion.div>
  );
}
