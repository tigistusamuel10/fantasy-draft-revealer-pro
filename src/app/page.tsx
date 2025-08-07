'use client';

import { useState } from 'react';
import { SetupPhase } from '@/components/SetupPhase';
import { RevealPhase } from '@/components/RevealPhase';
import { ResultsPhase } from '@/components/ResultsPhase';
import { Member, DraftOrder } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'setup' | 'reveal' | 'results';

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup');
  const [draftOrder, setDraftOrder] = useState<DraftOrder[]>([]);

  const handleStartReveal = (memberData: Member[]) => {
    // Fisher-Yates shuffle for true randomization with crypto random seeding
    const shuffled = [...memberData];
    
    // Use crypto.getRandomValues for better randomness if available
    const getSecureRandom = () => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
      }
      // Fallback with multiple random sources
      return Math.random() * Math.random() * Date.now() % 1;
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(getSecureRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const draftOrderWithPositions = shuffled.map((member, index) => ({
      ...member,
      position: index + 1,
      revealed: false,
    }));
    
    setDraftOrder(draftOrderWithPositions);
    setCurrentPhase('reveal');
  };

  const handleShowResults = () => {
    setCurrentPhase('results');
  };

  const handleRestart = () => {
    setCurrentPhase('setup');
    setDraftOrder([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentPhase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <SetupPhase onStartReveal={handleStartReveal} />
            </motion.div>
          )}
          
          {currentPhase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <RevealPhase 
                draftOrder={draftOrder} 
                setDraftOrder={setDraftOrder}
                onShowResults={handleShowResults}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
          
          {currentPhase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsPhase 
                draftOrder={draftOrder}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
