'use client';

import { motion } from 'framer-motion';
import { UserIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Member, DraftStrategy } from '@/types';

interface MemberCardProps {
  member: Member;
  index: number;
  onUpdate: (index: number, field: keyof Member, value: string) => void;
}

const strategyOptions: DraftStrategy[] = ['RB Heavy', 'WR First', 'Zero RB', 'Best Available', 'QB Early'];

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
          <UserIcon className="h-5 w-5 text-orange-400" />
          <span className="text-sm font-medium text-slate-400">Member #{index + 1}</span>
        </div>
        <TrophyIcon className="h-5 w-5 text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Name
        </label>
        <input
          type="text"
          value={member.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
          placeholder="Enter member name"
        />
      </div>

      {/* Team Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Team Name
        </label>
        <input
          type="text"
          value={member.team}
          onChange={(e) => onUpdate(index, 'team', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
          placeholder="Enter team name"
        />
      </div>

      {/* Draft Strategy */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Strategy
        </label>
        <select
          value={member.strategy}
          onChange={(e) => onUpdate(index, 'strategy', e.target.value)}
          className="w-full bg-white/5 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 cursor-pointer"
        >
          {strategyOptions.map((strategy) => (
            <option key={strategy} value={strategy} className="bg-slate-800">
              {strategy}
            </option>
          ))}
        </select>
      </div>

      {/* Motto Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Motto
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
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Season Prediction
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
