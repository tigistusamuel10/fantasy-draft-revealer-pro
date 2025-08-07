'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';
import { DraftOrder } from '@/types';
import { useAudio } from '@/hooks/useBackgroundMusic';

interface RevealPhaseProps {
  draftOrder: DraftOrder[];
  setDraftOrder: (order: DraftOrder[]) => void;
  onShowResults: () => void;
  onRestart: () => void;
}

export function RevealPhase({ draftOrder, setDraftOrder, onShowResults, onRestart }: RevealPhaseProps) {
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showEpicCelebration, setShowEpicCelebration] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showDramaText, setShowDramaText] = useState(false);
  const [dramaText, setDramaText] = useState('');
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get audio functions
  const { playCountdownSound } = useAudio();
  
  // Memoize sorted draft order to prevent unnecessary re-calculations
  const sortedDraftOrder = useMemo(() => 
    [...draftOrder].sort((a, b) => b.position - a.position), 
    [draftOrder]
  );

  const startReveal = () => {
    setCurrentRevealIndex(0);
    // Scroll to first card after a brief delay to ensure DOM is ready
    setTimeout(() => scrollToCard(0), 200);
  };

  // Memoized scroll function to prevent recreation on every render
  const scrollToCard = useCallback((index: number) => {
    // Wait a moment for DOM to update after any state changes
    setTimeout(() => {
      const cardElement = cardRefs.current[index];
      if (cardElement) {
        // Get the card's position relative to the document
        const cardRect = cardElement.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate the target scroll position accounting for fixed header height
        const headerHeight = 360;
        const targetScrollY = currentScrollY + cardRect.top - headerHeight;
        
        // Scroll to the calculated position smoothly
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth'
        });
        
        // Scroll animation completes after 600ms
        // No need to track revealing state anymore
      } else {
        // Simplified retry logic - single retry only
        setTimeout(() => {
          const retryCardElement = cardRefs.current[index];
          if (retryCardElement) {
            const cardRect = retryCardElement.getBoundingClientRect();
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
            const headerHeight = 360;
            const targetScrollY = currentScrollY + cardRect.top - headerHeight;
            
            window.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth'
            });
            
            // Scroll completed successfully
          } else {
            // Fallback if card element not found
          }
        }, 300);
      }
    }, 150);
  }, []);

  const revealCurrentCard = useCallback(() => {
    if (currentRevealIndex < 0 || currentRevealIndex >= sortedDraftOrder.length) return;
    
    const currentPick = sortedDraftOrder[currentRevealIndex];
    
    // Special suspense for top 3 picks
    if (currentPick.position <= 3) {
      // Inline the dramatic reveal logic to avoid circular dependency
      // Scroll to top to ensure countdown is fully visible
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Small delay to let scroll complete before starting countdown
      setTimeout(() => {
        setIsCountingDown(true);
        setCountdownValue(3);
        
        // Set dramatic text based on position
        const dramaTexts = {
          3: "🥉 THIRD OVERALL PICK",
          2: "🥈 SECOND OVERALL PICK", 
          1: "🏆 FIRST OVERALL PICK! 🏆"
        };
        
        setDramaText(dramaTexts[currentPick.position as keyof typeof dramaTexts] || "");
        setShowDramaText(true);
      }, 300); // Wait for scroll to complete

      // Countdown sequence
      const countdownSequence = [3, 2, 1];
      let currentCount = 0;
      
      const countdownInterval = setInterval(() => {
        if (currentCount < countdownSequence.length) {
          setCountdownValue(countdownSequence[currentCount]);
          playCountdownSound(); // Play countdown tick sound
          currentCount++;
        } else {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          setShowDramaText(false);
          
          // First scroll to the card position, THEN perform the reveal
          scrollToCard(currentRevealIndex);
          
          // Wait for scroll to complete before revealing
          setTimeout(() => {
            // Perform the reveal after scrolling
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 600);
            
            const newDraftOrder = draftOrder.map((p) => 
              p.id === currentPick.id ? { ...p, revealed: true } : p
            );
            setDraftOrder(newDraftOrder);
            
            // Check if this was the #1 pick for EPIC celebration
            if (currentPick.position === 1) {
              setShowFireworks(true);
              setShowEpicCelebration(true);
              
              setTimeout(() => {
                setShowFireworks(false);
                setShowEpicCelebration(false);
              }, 5000); // Longer celebration for #1 pick
            }
          }, 800);
        }
      }, 1000);
    } else {
      // Regular reveal for other picks
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
      
      const newDraftOrder = draftOrder.map((p) => 
        p.id === currentPick.id ? { ...p, revealed: true } : p
      );
      setDraftOrder(newDraftOrder);
      
      // Check if this was the #1 pick for EPIC celebration  
      if (currentPick.position === 1) {
        setShowFireworks(true);
        setShowEpicCelebration(true);
        
        setTimeout(() => {
          setShowFireworks(false);
          setShowEpicCelebration(false);
        }, 5000); // Longer celebration for #1 pick
      }
    }
  }, [currentRevealIndex, sortedDraftOrder, draftOrder, setDraftOrder, scrollToCard, playCountdownSound]);


  const nextReveal = useCallback(() => {
    const nextIndex = currentRevealIndex + 1;

    if (nextIndex >= sortedDraftOrder.length) {
      setAllRevealed(true);
      return;
    }

    setCurrentRevealIndex(nextIndex);
    // Scroll to next card with proper header offset
    setTimeout(() => scrollToCard(nextIndex), 200);
  }, [currentRevealIndex, sortedDraftOrder.length, scrollToCard]);

  const resetReveal = useCallback(() => {
    setCurrentRevealIndex(-1);
    setAllRevealed(false);
    setShowFireworks(false);
    setScreenShake(false);
    
    // Re-randomize the draft order with enhanced randomization
    const getSecureRandom = () => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
      }
      // Fallback with multiple random sources
      return Math.random() * Math.random() * Date.now() % 1;
    };
    
    // Create a copy and reset revealed states
    const resetPicks = draftOrder.map(pick => ({ ...pick, revealed: false }));
    
    // Fisher-Yates shuffle for new randomization
    const shuffled = [...resetPicks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(getSecureRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Reassign positions
    const newOrder = shuffled.map((pick, index) => ({
      ...pick,
      position: index + 1,
      revealed: false
    }));
    
    // Reset card refs array for the new order - do this immediately
    cardRefs.current = new Array(newOrder.length).fill(null);
    
    setDraftOrder(newOrder);
  }, [draftOrder, setDraftOrder]);


  // Keyboard shortcuts - defined after all callback functions
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when revealing and not during countdown
      if (currentRevealIndex < 0 || allRevealed || isCountingDown) return;
      
      switch (event.key.toLowerCase()) {
        case ' ': // Spacebar
        case 'enter':
          event.preventDefault();
          if (!sortedDraftOrder[currentRevealIndex]?.revealed) {
            revealCurrentCard();
          } else {
            nextReveal();
          }
          break;
        case 'n': // N for next
          event.preventDefault();
          if (sortedDraftOrder[currentRevealIndex]?.revealed) {
            nextReveal();
          }
          break;
        case 'r': // R for reveal/reset
          event.preventDefault();
          if (!sortedDraftOrder[currentRevealIndex]?.revealed) {
            revealCurrentCard();
          } else {
            resetReveal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentRevealIndex, allRevealed, isCountingDown, sortedDraftOrder, revealCurrentCard, nextReveal, resetReveal]);

  return (
    <>
      {/* Standard Header - Fixed at top - OUTSIDE of animated container - Hide during countdown AND epic celebration */}
      <AnimatePresence>
        {!(isCountingDown || showDramaText || showEpicCelebration) && (
          <motion.div 
            className="fixed top-0 left-0 right-0 w-full bg-slate-900 border-b border-yellow-500/20 backdrop-blur-md shadow-lg"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              width: '100vw',
              backgroundColor: 'rgba(15, 23, 42, 0.95)'
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
        <div className="container mx-auto px-4 max-w-6xl">
          <StandardHeader 
            isRevealing={currentRevealIndex >= 0 && !allRevealed}
            showStartButton={currentRevealIndex === -1 && !allRevealed}
            currentRevealIndex={currentRevealIndex}
            totalPicks={sortedDraftOrder.length}
            isRevealed={currentRevealIndex >= 0 ? sortedDraftOrder[currentRevealIndex]?.revealed || false : false}
            pickNumber={currentRevealIndex >= 0 ? sortedDraftOrder[currentRevealIndex]?.position || 0 : 0}
            onReveal={revealCurrentCard}
            onNext={nextReveal}
            onReset={resetReveal}
            onStartReveal={startReveal}
          />
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dramatic Countdown Card - OUTSIDE of animated container */}
      <AnimatePresence>
        {(isCountingDown || showDramaText) && (
          <motion.div
            className="fixed inset-0 z-[70] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background overlay - darker for better contrast */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            
            {/* Centered container */}
            <div className="flex items-center justify-center min-h-screen p-4">
              {/* Countdown Card */}
              <motion.div
                className="relative bg-gradient-to-br from-slate-800/98 via-slate-900/98 to-black/98 backdrop-blur-3xl border-3 border-yellow-500/40 rounded-3xl p-12 shadow-2xl max-w-3xl w-full mx-4"
                initial={{ scale: 0.3, rotateY: -90, opacity: 0, y: 50 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1, y: 0 }}
                exit={{ scale: 0.3, rotateY: 90, opacity: 0, y: -50 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              >
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400 opacity-60 animate-pulse" />
              
              {/* Corner football graphics */}
              <div className="absolute top-4 left-4 text-2xl opacity-20 rotate-12">🏈</div>
              <div className="absolute top-4 right-4 text-2xl opacity-20 -rotate-12">🏈</div>
              <div className="absolute bottom-4 left-4 text-2xl opacity-20 -rotate-12">🏈</div>
              <div className="absolute bottom-4 right-4 text-2xl opacity-20 rotate-12">🏈</div>
              
              <div className="text-center relative z-10">
                {/* Drama Text */}
                {showDramaText && (
                  <motion.div
                    className="mb-8"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl px-6 py-4 border border-yellow-500/30 mb-6">
                      <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent leading-tight">
                        {dramaText}
                      </h2>
                    </div>
                    <div className="text-slate-300 text-lg font-semibold uppercase tracking-wider">
                      Get Ready...
                    </div>
                  </motion.div>
                )}
                
                {/* Countdown Number */}
                {isCountingDown && (
                  <motion.div
                    className="relative"
                    key={countdownValue}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 1.2, rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.6 }}
                  >
                    {/* Countdown background circle */}
                    <div className="relative mx-auto w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20 rounded-full border-4 border-yellow-500 shadow-2xl" />
                      <div className="absolute inset-2 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full" />
                      
                      {/* Simplified animated rings */}
                      <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-full animate-spin" />
                      <div className="absolute inset-4 border-2 border-orange-400/20 rounded-full animate-pulse" />
                      
                      {/* Countdown number */}
                      <span className="text-8xl md:text-9xl font-black text-white drop-shadow-2xl relative z-10">
                        {countdownValue}
                      </span>
                    </div>
                    
                    {/* Pulsing text below */}
                    <motion.div 
                      className="mt-6 text-yellow-400 font-bold text-xl uppercase tracking-wider"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      Revealing in...
                    </motion.div>
                  </motion.div>
                )}
              </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EPIC #1 PICK CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showEpicCelebration && (
          <motion.div
            className="fixed inset-0 z-[80] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Background overlay with pulsing colors */}
            <motion.div 
              className="absolute inset-0"
              animate={{
                backgroundColor: [
                  'rgba(0,0,0,0.8)',
                  'rgba(255,215,0,0.1)',
                  'rgba(255,69,0,0.1)',
                  'rgba(0,255,0,0.1)',
                  'rgba(0,0,0,0.8)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Fullscreen fireworks burst */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`epic-${i}`}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    background: `hsl(${(i * 12) % 360}, 100%, ${50 + Math.random() * 30}%)`,
                    boxShadow: '0 0 15px currentColor'
                  }}
                  animate={{
                    x: [0, (Math.cos(i * Math.PI / 15) * (200 + Math.random() * 300))],
                    y: [0, (Math.sin(i * Math.PI / 15) * (200 + Math.random() * 300))],
                    opacity: [1, 0.8, 0.6, 0],
                    scale: [0, 2, 1.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 0.1,
                    delay: (i * 0.05),
                    ease: "easeOut"
                  }}
                />
              ))}
              
              {/* Confetti rain */}
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute w-2 h-8 opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    background: `linear-gradient(45deg, hsl(${Math.random() * 360}, 80%, 60%), hsl(${Math.random() * 360}, 80%, 60%))`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                  animate={{
                    y: ['0vh', '120vh'],
                    rotate: [0, 360 + Math.random() * 360],
                    opacity: [0.8, 0.6, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: 'linear'
                  }}
                />
              ))}
            </div>
            
            {/* Epic celebration text */}
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div
                className="text-center"
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.5 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1.1, 1.2, 1],
                    rotateZ: [0, -5, 5, -3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <h1 className="text-6xl md:text-9xl font-black mb-6">
                    <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse">
                      🎉 #1 PICK! 🎉
                    </span>
                  </h1>
                </motion.div>
                
                <motion.div
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-2xl md:text-4xl font-bold text-white mb-4">
                    🏆 FIRST OVERALL SELECTION! 🏆
                  </div>
                  <div className="text-xl md:text-2xl text-yellow-400 uppercase tracking-widest font-black">
                    FANTASY LEGEND SECURED!
                  </div>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Floating trophy emojis */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`trophy-${i}`}
                className="absolute text-6xl"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  rotate: [0, Math.random() * 30 - 15, 0],
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              >
                {Math.random() > 0.5 ? '🏆' : '🎊'}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - WITH animated container for screen shake */}
      <motion.div 
        className="relative"
        animate={screenShake ? {
          x: [0, -10, 10, -10, 10, 0],
          y: [0, -5, 5, -5, 5, 0]
        } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-96" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Draft Cards Grid - Show in reverse order (highest pick to lowest) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {sortedDraftOrder.map((pick, index) => {
            // Create a stable key that only changes when draft order changes (not on every reveal)
            const cardKey = `${pick.id}-${pick.position}`;
            
            return (
              <motion.div
                key={cardKey}
                ref={el => {
                  if (el) {
                    cardRefs.current[index] = el;
                  }
                }}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <DraftCard
                  pick={pick}
                  isCurrentlyRevealing={currentRevealIndex === index}
                  showFireworks={showFireworks && pick.position === 1}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Draft Complete Section */}
        <AnimatePresence>
          {allRevealed && (
            <motion.div 
              className="text-center space-y-8 py-12"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            >
              {/* Main Completion Banner */}
              <motion.div
                className="relative bg-gradient-to-br from-green-800/90 via-green-900/90 to-emerald-900/90 backdrop-blur-lg border-2 border-green-400/50 rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto"
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2, type: "spring" }}
              >
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-3xl border-2 border-green-400/60 animate-pulse" />
                
                {/* Trophy Icons */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 rounded-full p-4 border-4 border-white shadow-xl">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <TrophyIcon className="h-8 w-8 text-black" />
                  </motion.div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 text-3xl opacity-40 rotate-12">🏆</div>
                <div className="absolute top-4 right-4 text-3xl opacity-40 -rotate-12">🏆</div>
                <div className="absolute bottom-4 left-4 text-3xl opacity-40 -rotate-12">🏆</div>
                <div className="absolute bottom-4 right-4 text-3xl opacity-40 rotate-12">🏆</div>
                
                <div className="relative z-10 pt-4">
                  {/* Main Title */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-black mb-4">
                      <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent leading-tight">
                        DRAFT COMPLETE!
                      </span>
                    </h2>
                  </motion.div>
                  
                  {/* Subtitle */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl px-6 py-3 border border-green-500/30 inline-block">
                      <p className="text-lg md:text-xl font-bold text-green-400 uppercase tracking-wider">
                        🏈 All {sortedDraftOrder.length} Picks Have Been Selected! 🏈
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Stats */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-slate-300 text-sm md:text-base mb-6"
                  >
                    <div className="flex flex-wrap justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xl">📋</span>
                        <span className="font-semibold">{sortedDraftOrder.length} Total Picks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 text-xl">✅</span>
                        <span className="font-semibold">{sortedDraftOrder.length} Revealed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-xl">👥</span>
                        <span className="font-semibold">{sortedDraftOrder.length} Fantasy Teams</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Commissioner Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 border border-blue-400/30 mb-6"
                  >
                    <div className="text-blue-300 text-sm md:text-base italic">
                      &quot;The 2025 Fantasy Football Draft is now complete. May the best fantasy manager win!&quot;
                    </div>
                    <div className="text-blue-400 text-xs mt-2 font-semibold">
                      - Your Fantasy Commissioner
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onShowResults}
                    size="lg"
                    variant="primary"
                    className="text-lg font-bold px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-xl border border-green-400/30"
                  >
                    🏆 View Final Draft Board
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={resetReveal}
                    size="lg"
                    variant="outline"
                    className="text-lg font-bold px-8 py-4 border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10"
                  >
                    🔄 New Reveal Order
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onRestart}
                    size="lg"
                    variant="secondary"
                    className="text-lg font-bold px-8 py-4 bg-slate-700 hover:bg-slate-600 border border-slate-500/50"
                  >
                    🏠 New Draft
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Celebratory Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="text-slate-400 text-sm"
              >
                🎊 Let the trash talking begin! Good luck this season! 🎊
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </motion.div>
    </>
  );
}

interface DraftCardProps {
  pick: DraftOrder;
  isCurrentlyRevealing: boolean;
  showFireworks: boolean;
}

function DraftCard({ pick, isCurrentlyRevealing, showFireworks }: DraftCardProps) {
  return (
    <motion.div 
      className="relative h-80 perspective-1000"  // Increased height for better content
      animate={isCurrentlyRevealing ? { 
        scale: [1, 1.08, 1.05, 1.08, 1],
        rotate: [0, -1.5, 1.5, -0.8, 0]
      } : {}}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Enhanced Glow Effect with Multiple Layers */}
      {isCurrentlyRevealing && (
        <>
          {/* Outer glow */}
          <motion.div
            className="absolute -inset-4 rounded-3xl opacity-60"
            animate={{
              boxShadow: [
                '0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)',
                '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3)',
                '0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Inner border glow */}
          <div
            className="absolute -inset-2 rounded-2xl border-2 border-yellow-400/80 animate-pulse"
            style={{
              boxShadow: 'inset 0 0 20px rgba(255,215,0,0.3)'
            }}
          />
        </>
      )}

      {/* Card Container with Enhanced 3D Effect */}
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer group"
        animate={{ rotateY: pick.revealed ? 180 : 0 }}
        transition={{ 
          duration: 1.2, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        {/* Front (Hidden) - Luxurious Draft Board Style */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
          {/* Animated background with mesh gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-black/95 backdrop-blur-xl"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 50%, rgba(0,0,0,0.95) 100%)',
                'linear-gradient(135deg, rgba(51,65,85,0.95) 0%, rgba(30,41,59,0.95) 50%, rgba(15,23,42,0.95) 100%)',
                'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 50%, rgba(0,0,0,0.95) 100%)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Glassmorphism border */}
          <div className="absolute inset-0 rounded-2xl border border-yellow-500/30 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500/60 shadow-2xl" />
          
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-yellow-400/40 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
          
          <div className="relative z-10 text-center p-6 w-full h-full flex flex-col justify-center">
            {/* Enhanced Football Icon with Animation */}
            <motion.div 
              className="text-6xl mb-4"
              animate={{
                rotateY: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🏈
            </motion.div>
            
            {/* Enhanced Pick Badge */}
            <motion.div 
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-3 rounded-xl mb-4 mx-auto shadow-2xl"
              animate={{
                boxShadow: [
                  '0 8px 25px rgba(255,193,7,0.3)',
                  '0 12px 35px rgba(255,193,7,0.4)',
                  '0 8px 25px rgba(255,193,7,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-xl blur-sm opacity-50" />
              <div className="relative z-10">
                <div className="text-xs font-black uppercase tracking-widest">PICK</div>
                <div className="text-2xl font-black">#{pick.position}</div>
              </div>
            </motion.div>
            
            {/* Enhanced Status Text */}
            <motion.div 
              className="text-sm text-slate-300 uppercase tracking-widest font-bold"
              animate={{
                opacity: [0.7, 1, 0.7],
                color: ['rgb(203, 213, 225)', 'rgb(251, 191, 36)', 'rgb(203, 213, 225)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ON THE CLOCK
            </motion.div>
            
            {/* Draft Position Indicator */}
            <div className="mt-4 flex justify-center space-x-1">
              {[...Array(Math.min(pick.position, 5))].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-yellow-400/60 rounded-full"
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
            </div>
          </div>
        </div>

        {/* Back (Revealed) - Ultra-Modern NFL Style */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          {showFireworks && <FireworksEffect />}
          
          {/* Dynamic Background Based on Pick Position */}
          <motion.div 
            className={`absolute inset-0 ${
              pick.position === 1 ? 'bg-gradient-to-br from-yellow-600/90 via-orange-600/90 to-red-600/90' :
              pick.position === 2 ? 'bg-gradient-to-br from-gray-400/90 via-gray-500/90 to-gray-600/90' :
              pick.position === 3 ? 'bg-gradient-to-br from-amber-600/90 via-yellow-700/90 to-orange-700/90' :
              pick.position <= 5 ? 'bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-800/90' :
              pick.position <= 10 ? 'bg-gradient-to-br from-green-600/90 via-green-700/90 to-green-800/90' :
              'bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-purple-800/90'
            } backdrop-blur-xl`}
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-2xl border border-white/20" />
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/60 shadow-2xl" />
          
          {/* Content with better spacing */}
          <div className="relative z-10 p-4 h-full flex flex-col">
            {/* Enhanced Draft Header */}
            <motion.div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-2 rounded-xl mb-4 text-center flex-shrink-0 shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-xs font-black uppercase tracking-widest">DRAFTED</div>
              <div className="text-xl font-black">#{pick.position}</div>
              {pick.position <= 3 && (
                <motion.div 
                  className="text-xs mt-1 font-bold"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {pick.position === 1 ? '👑 FIRST!' : pick.position === 2 ? '🥈 SECOND' : '🥉 THIRD'}
                </motion.div>
              )}
            </motion.div>
            
            {/* Player Info Section */}
            <motion.div 
              className="flex-shrink-0 mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-black text-white mb-2 uppercase leading-tight">
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    {pick.name}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-200 mb-2">
                  <span className="text-yellow-400">⚡</span> &quot;{pick.team}&quot;
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">
                  Fantasy Manager
                </div>
              </div>
            </motion.div>
            
            {/* Enhanced Details Section */}
            <div className="space-y-3 flex-1 flex flex-col justify-end">
              <motion.div 
                className="bg-gradient-to-br from-emerald-800/80 to-green-900/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-400/40 shadow-lg"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-300 text-lg">🎯</span>
                  <div className="text-xs font-black text-transparent bg-gradient-to-r from-emerald-200 to-green-400 bg-clip-text uppercase tracking-wider">
                    STRATEGY
                  </div>
                </div>
                <div className="text-xs font-bold text-white leading-relaxed">
                  {pick.strategy}
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-blue-800/80 to-indigo-900/80 backdrop-blur-sm rounded-xl p-3 border border-blue-400/40 shadow-lg"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-300 text-lg">💪</span>
                  <div className="text-xs font-black text-transparent bg-gradient-to-r from-blue-200 to-cyan-400 bg-clip-text uppercase tracking-wider">
                    BATTLE CRY
                  </div>
                </div>
                <div className="text-xs text-slate-200 italic font-medium leading-relaxed">
                  &quot;{pick.motto}&quot;
                </div>
              </motion.div>
              
              {/* Prediction Section */}
              <motion.div 
                className="bg-gradient-to-br from-purple-800/80 to-pink-900/80 backdrop-blur-sm rounded-xl p-3 border border-purple-400/40 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-300 text-lg">🔮</span>
                  <div className="text-xs font-black text-transparent bg-gradient-to-r from-purple-200 to-pink-400 bg-clip-text uppercase tracking-wider">
                    PREDICTION
                  </div>
                </div>
                <div className="text-xs text-slate-200 font-medium leading-relaxed">
                  {pick.prediction}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StandardHeaderProps {
  isRevealing: boolean;
  showStartButton: boolean;
  currentRevealIndex: number;
  totalPicks: number;
  isRevealed: boolean;
  pickNumber: number;
  onReveal: () => void;
  onNext: () => void;
  onReset: () => void;
  onStartReveal: () => void;
}

function StandardHeader({
  isRevealing,
  showStartButton,
  currentRevealIndex,
  totalPicks,
  isRevealed,
  pickNumber,
  onReveal,
  onNext,
  onReset,
  onStartReveal
}: StandardHeaderProps) {
  return (
    <div className="py-6 min-h-[240px] flex flex-col">
      <div className="max-w-6xl mx-auto flex-1">
          {/* Modern Title Card */}
          <div className="mb-6">
            <motion.div 
              className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
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
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left: Enhanced Title */}
                  <div className="flex items-center gap-4">
                    <motion.div 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-xl"
                    >
                      <TrophyIcon className="h-6 w-6 text-black" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <motion.h1
                        className="text-2xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-yellow-200 to-slate-100 tracking-wide"
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
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-full"
                      />
                      
                      {/* Subtitle with dots */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex items-center gap-2 text-slate-200"
                      >
                        {[0, 1].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 bg-yellow-400 rounded-full"
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
                          className="text-sm md:text-base font-semibold tracking-wider uppercase"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          Fantasy Football 2025
                        </motion.span>
                        
                        {[0, 1].map((i) => (
                          <motion.div
                            key={i + 2}
                            className="w-1 h-1 bg-yellow-400 rounded-full"
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
                    </div>
                  </div>

                  {/* Right: Enhanced Live Banner */}
                  <motion.div 
                    className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 4px 20px rgba(239, 68, 68, 0.3)",
                        "0 8px 25px rgba(239, 68, 68, 0.5)",
                        "0 4px 20px rgba(239, 68, 68, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-bold tracking-wide">LIVE DRAFT COVERAGE</span>
                      <motion.div 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>
                </div>
                
                {/* Decorative elements */}
                <motion.div
                  className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-orange-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                />
              </div>
            </motion.div>
          </div>

          {/* Start Button Section */}
          <AnimatePresence>
            {showStartButton && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="border-t border-yellow-500/20 pt-6"
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={onStartReveal}
                      size="xl"
                      variant="primary"
                      className="text-xl font-bold px-10 py-4 relative overflow-hidden group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <span className="relative z-10 flex items-center gap-3">
                        🏈 START THE DRAFT! 🏈
                        <ChevronDownIcon className="h-5 w-5 animate-bounce" />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Panel Section - Only show during revealing */}
          <AnimatePresence>
            {isRevealing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="border-t border-yellow-500/20 pt-6 mt-4"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Left: Current Pick Info */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <div className="text-center">
                        <div className="text-white font-black text-xl">
                          PICK #{pickNumber}
                        </div>
                        <div className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">
                          {isRevealed ? "DRAFTED" : "ON THE CLOCK"}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>

                    {/* Mystery/Status Message */}
                    <div className="hidden sm:block">
                      {!isRevealed ? (
                        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl px-4 py-2 border border-yellow-500/30">
                          <div className="text-yellow-400 font-bold text-sm">🤔 WHO WILL IT BE?</div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl px-4 py-2 border border-green-500/30">
                          <div className="text-green-400 font-bold text-sm">✅ PICK REVEALED!</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-3">
                    {!isRevealed && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={onReveal}
                          size="lg"
                          variant="primary"
                          className="text-lg font-black px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-xl border border-green-400/30"
                        >
                          🏈 MAKE THE PICK!
                          <span className="ml-2 text-xs opacity-75">(Space)</span>
                        </Button>
                      </motion.div>
                    )}
                    
                    {isRevealed && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={onNext}
                          size="lg"
                          variant="primary"
                          className="text-lg font-black px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-xl border border-blue-400/30"
                        >
                          ➡️ NEXT PICK
                          <span className="ml-2 text-xs opacity-75">(Space/N)</span>
                        </Button>
                      </motion.div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={onReset}
                        size="md"
                        variant="secondary"
                        className="text-sm font-bold px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500/30"
                      >
                        🔄 RESET
                        <span className="ml-2 text-xs opacity-75">(R)</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold">DRAFT PROGRESS</span>
                    <span>{currentRevealIndex + 1} / {totalPicks} PICKS REVEALED</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPicks }, (_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 flex-1 ${
                          index < currentRevealIndex
                            ? 'bg-green-500'
                            : index === currentRevealIndex
                            ? 'bg-yellow-500 scale-110'
                            : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
}

function FireworksEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {/* Ultra-Spectacular Multi-Layer Fireworks */}
      
      {/* Primary Golden Burst */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={`golden-${i}`}
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: `linear-gradient(45deg, hsl(${45 + (i * 15)}, 100%, 60%), hsl(${60 + (i * 15)}, 100%, 70%))`,
            boxShadow: `0 0 20px hsl(${45 + (i * 15)}, 100%, 60%), 0 0 40px hsl(${45 + (i * 15)}, 100%, 40%)`
          }}
          animate={{
            x: [0, (Math.cos(i * Math.PI / 8) * (120 + Math.random() * 80))],
            y: [0, (Math.sin(i * Math.PI / 8) * (120 + Math.random() * 80))],
            opacity: [1, 0.9, 0.7, 0],
            scale: [0, 2.5, 1.8, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 0.2,
            delay: i * 0.08,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Secondary Rainbow Burst */}
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={`rainbow-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: `hsl(${(i * 15) % 360}, 100%, 65%)`,
            boxShadow: `0 0 15px hsl(${(i * 15) % 360}, 100%, 65%)`
          }}
          animate={{
            x: [0, (Math.cos(i * Math.PI / 12) * (80 + Math.random() * 120))],
            y: [0, (Math.sin(i * Math.PI / 12) * (80 + Math.random() * 120))],
            opacity: [0.8, 1, 0.5, 0],
            scale: [0.5, 2, 1.5, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 0.1,
            delay: 0.3 + (i * 0.06),
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Diamond Sparkles */}
      {[...Array(32)].map((_, i) => (
        <motion.div
          key={`diamond-${i}`}
          className="absolute w-2 h-2"
          style={{
            left: `${25 + Math.random() * 50}%`,
            top: `${25 + Math.random() * 50}%`,
            background: 'linear-gradient(45deg, #ffffff, #fbbf24, #ffffff)',
            clipPath: 'polygon(50% 0%, 0% 50%, 50% 100%, 100% 50%)',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
          }}
          animate={{
            opacity: [0, 1, 0.7, 0],
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360],
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 60, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: Math.random() * 3,
            repeatDelay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Glowing Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-300"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            fontSize: `${1 + Math.random() * 1.5}rem`,
            filter: 'drop-shadow(0 0 10px currentColor)'
          }}
          animate={{
            opacity: [0, 1, 0.6, 0],
            scale: [0, 1.3, 1, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 4,
            repeatDelay: Math.random() * 3,
            ease: "easeOut"
          }}
        >
          ⭐
        </motion.div>
      ))}
      
      {/* Magical Particle Trail */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            boxShadow: '0 0 6px currentColor'
          }}
          animate={{
            opacity: [0, 0.8, 1, 0.4, 0],
            scale: [0, 0.8, 1.2, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, -50 - Math.random() * 100],
            rotate: [0, 720]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
            repeatDelay: Math.random() * 3,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Celebration Confetti */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-3 h-3"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            background: `linear-gradient(45deg, hsl(${Math.random() * 360}, 80%, 60%), hsl(${Math.random() * 360}, 80%, 70%))`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 720 + Math.random() * 360],
            opacity: [0.9, 0.7, 0.3, 0],
            scale: [1, 0.8, 0.6, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
