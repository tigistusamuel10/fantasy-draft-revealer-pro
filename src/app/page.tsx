'use client';

import { useState, useEffect, useCallback } from 'react';
import { SetupPhase } from '@/components/SetupPhase';
import { RevealPhase } from '@/components/RevealPhase';
import { ResultsPhase } from '@/components/ResultsPhase';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Member, DraftOrder } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useBackgroundMusic';
import { SettingsButton } from '@/components/AudioControls';

type Phase = 'welcome' | 'setup' | 'reveal' | 'results';

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('welcome');
  const [draftOrder, setDraftOrder] = useState<DraftOrder[]>([]);
  const { play, isPlaying, switchToNFLTheme, switchToLobbyMusic } = useAudio();
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Simple audio initialization
  const startAudio = useCallback(async () => {
    if (audioInitialized) {
      console.log('🎶 Audio already initialized');
      return;
    }
    
    console.log('🎶 Starting audio...');
    await play();
    setAudioInitialized(true);
  }, [play, audioInitialized]);

  // Start lobby music on user interaction during setup phase
  useEffect(() => {
    // Only set up interaction listener if we're in setup phase and no audio is playing
    if (currentPhase === 'setup' && !audioInitialized) {
      const handleUserInteraction = async () => {
        if (audioInitialized) return;
        
        console.log('👆 Starting lobby music...');
        try {
          await startAudio();
          console.log('✅ Lobby music started successfully');
        } catch (error) {
          console.error('❌ Failed to start lobby music:', error);
        }
      };

      // Add listeners for user interaction
      const events = ['click', 'keydown', 'touchstart', 'mousedown'];
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
      });

      // Cleanup function
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserInteraction);
        });
      };
    }
  }, [startAudio, audioInitialized, currentPhase]);

  const handleStartReveal = async (memberData: Member[]) => {
    // Start NFL theme music for the reveal phase
    try {
      await switchToNFLTheme();
      if (!audioInitialized) {
        await startAudio();
      }
      console.log('🏈 Started NFL theme for reveal phase');
    } catch (error) {
      console.log('Failed to start NFL theme:', error);
    }
    
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

  const handleEnterLobby = async () => {
    try {
      await startAudio();
      setCurrentPhase('setup');
      console.log('🎶 Entered lobby with music');
    } catch (error) {
      console.log('Failed to start lobby music:', error);
      // Still proceed to setup phase even if audio fails
      setCurrentPhase('setup');
    }
  };

  const handleRestart = async () => {
    setCurrentPhase('setup');
    setDraftOrder([]);
    
    // Switch back to lobby music if audio is playing
    if (audioInitialized && isPlaying) {
      try {
        await switchToLobbyMusic();
        console.log('🎶 Switched back to lobby music');
      } catch (error) {
        console.log('Failed to switch to lobby music:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden">
      {/* Audio Status Message - Only show during setup phase */}
      {currentPhase === 'setup' && !audioInitialized && (
        <div className="fixed top-4 left-4 z-40 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-400 font-medium">
          🎶 Click anywhere to start lobby music
        </div>
      )}
      
      {/* Settings Button - Hidden on welcome screen */}
      {currentPhase !== 'welcome' && <SettingsButton />}
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentPhase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <WelcomeScreen onEnter={handleEnterLobby} />
            </motion.div>
          )}
          
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
