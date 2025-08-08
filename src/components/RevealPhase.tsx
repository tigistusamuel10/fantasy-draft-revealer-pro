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
  const [headerHeight, setHeaderHeight] = useState(300); // Dynamic header height
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Get audio functions
  const { playCountdownSound, playCardRevealSound } = useAudio();
  
  // Memoize sorted draft order to prevent unnecessary re-calculations
  const sortedDraftOrder = useMemo(() => 
    [...draftOrder].sort((a, b) => b.position - a.position), 
    [draftOrder]
  );

  // Calculate actual header height dynamically
  useEffect(() => {
    const calculateHeaderHeight = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const newHeight = rect.height + 10; // Add 10px buffer (reduced from 20px)
        if (newHeight !== headerHeight) {
          setHeaderHeight(newHeight);
        }
      }
    };

    // Initial calculation
    calculateHeaderHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeaderHeight);
    
    // Use ResizeObserver for more accurate tracking of header size changes
    const resizeObserver = new ResizeObserver(calculateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
      resizeObserver.disconnect();
    };
  }, [headerHeight, currentRevealIndex, sortedDraftOrder.length]); // Recalculate when reveal state changes

  const startReveal = () => {
    setCurrentRevealIndex(0);
    // Scroll to first card after state change
    setTimeout(() => scrollToCard(0), 200);
  };

  // Memoized scroll function to prevent recreation on every render
  const scrollToCard = useCallback((index: number) => {
    // Wait a moment for DOM to update after any state changes
    setTimeout(() => {
      // Force recalculation of header height before scrolling
      let currentHeaderHeight = headerHeight;
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        currentHeaderHeight = rect.height + 10; // Add 10px buffer (reduced from 20px)
        // Update state if it's different (for next time)
        if (currentHeaderHeight !== headerHeight) {
          setHeaderHeight(currentHeaderHeight);
        }
      }
      
      const cardElement = cardRefs.current[index];
      if (cardElement) {
        // Get the card's current position relative to viewport
        const cardRect = cardElement.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // We want the card's top to be positioned at: currentHeaderHeight + padding from top of viewport
        // So if card is currently at cardRect.top, we need to scroll by the difference
        const desiredTopPosition = currentHeaderHeight + 10; // 10px padding below header (reduced from 20px)
        const scrollAdjustment = cardRect.top - desiredTopPosition;
        const targetScrollY = currentScrollY + scrollAdjustment;
        
        // Ensure we don't scroll above the top of the page
        const finalScrollY = Math.max(0, targetScrollY);
        
        // Scroll to the calculated position smoothly
        window.scrollTo({
          top: finalScrollY,
          behavior: 'smooth'
        });
        
      } else {
        // Simplified retry logic - single retry only
        setTimeout(() => {
          const retryCardElement = cardRefs.current[index];
          if (retryCardElement) {
            const cardRect = retryCardElement.getBoundingClientRect();
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            // Apply same positioning logic for retry with fresh header height
            const desiredTopPosition = currentHeaderHeight + 10; // 10px padding (reduced from 20px)
            const scrollAdjustment = cardRect.top - desiredTopPosition;
            const targetScrollY = currentScrollY + scrollAdjustment;
            const finalScrollY = Math.max(0, targetScrollY);
            
            window.scrollTo({
              top: finalScrollY,
              behavior: 'smooth'
            });
            
          } else {
            // Fallback if card element not found
          }
        }, 300);
      }
    }, 150);
  }, [headerHeight, setHeaderHeight, headerRef]); // Include dependencies

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
            
            // Play the card reveal sound
            playCardRevealSound();
            
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
      
      // Play the card reveal sound
      playCardRevealSound();
      
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
  }, [currentRevealIndex, sortedDraftOrder, draftOrder, setDraftOrder, scrollToCard, playCountdownSound, playCardRevealSound]);


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
            ref={headerRef}
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
            remainingPlayers={sortedDraftOrder.filter(pick => !pick.revealed).map(pick => pick.name).sort()}
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

      {/* Dynamic spacer to prevent content from being hidden behind fixed header */}
      <div style={{ height: `${headerHeight}px` }} />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl">
        {/* Draft Cards Grid - Responsive layout for all screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
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
      className="relative h-72 sm:h-80 lg:h-84 perspective-1000"
      animate={isCurrentlyRevealing ? { 
        scale: [1, 1.05, 1],
      } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Simplified Glow Effect */}
      {isCurrentlyRevealing && (
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-yellow-400 animate-pulse"
          style={{
            boxShadow: '0 0 20px rgba(255,215,0,0.6)'
          }}
        />
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
        {/* Front (Hidden) - Consistent with app theme */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
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
          
          <div className="absolute inset-0 rounded-2xl border border-yellow-500/30 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500/60 shadow-2xl" />
          
          {/* Floating particles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-yellow-400/40 rounded-full"
              style={{
                left: `${25 + Math.random() * 50}%`,
                top: `${25 + Math.random() * 50}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut"
              }}
            />
          ))}
          
          <div className="relative z-10 text-center p-3 sm:p-4 lg:p-6 w-full h-full flex flex-col justify-center">
            <motion.div 
              className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4"
              animate={{
                rotateY: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🏈
            </motion.div>
            
            <motion.div 
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 sm:px-4 py-2 sm:py-3 rounded-xl mb-3 sm:mb-4 mx-auto shadow-2xl"
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
                <div className="text-lg sm:text-xl font-black">#{pick.position}</div>
              </div>
            </motion.div>
            
            <motion.div 
              className="text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-bold"
              animate={{
                opacity: [0.7, 1, 0.7],
                color: ['rgb(203, 213, 225)', 'rgb(251, 191, 36)', 'rgb(203, 213, 225)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ON THE CLOCK
            </motion.div>
            
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

        {/* Back (Revealed) - Modern Clean Design */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          {showFireworks && <FireworksEffect />}
          
          {/* Modern gradient background matching app theme */}
          <motion.div 
            className={`absolute inset-0 ${
              pick.position === 1 ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20' :
              pick.position === 2 ? 'bg-gradient-to-br from-slate-400/20 via-slate-500/20 to-slate-600/20' :
              pick.position === 3 ? 'bg-gradient-to-br from-amber-500/20 via-yellow-600/20 to-orange-600/20' :
              pick.position <= 5 ? 'bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20' :
              pick.position <= 10 ? 'bg-gradient-to-br from-green-500/20 via-green-600/20 to-green-700/20' :
              'bg-gradient-to-br from-purple-500/20 via-purple-600/20 to-purple-700/20'
            } backdrop-blur-xl`}
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Consistent glassmorphism */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="absolute inset-0 rounded-2xl border border-white/10" />
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/40 shadow-2xl" />
          
            {/* Clean, modern content layout */}
          <div className="relative z-10 p-4 h-full flex flex-col">
            {/* Top: Position badge */}
            <motion.div 
              className="flex items-center justify-between mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-lg shadow-lg">
                <div className="text-xs font-black uppercase tracking-wider">PICK #{pick.position}</div>
              </div>
              
              {pick.position <= 3 && (
                <motion.div 
                  className="text-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {pick.position === 1 ? '👑' : pick.position === 2 ? '🥈' : '🥉'}
                </motion.div>
              )}
            </motion.div>
            
            {/* Center: Player name - Large and prominent */}
            <motion.div 
              className="flex-1 flex flex-col justify-center mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-2xl font-black text-white mb-1 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                    {pick.name}
                  </span>
                </div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                  Fantasy Manager
                </div>
              </div>
            </motion.div>
            
            {/* Bottom: Info cards - Clean horizontal layout */}
            <div className="space-y-3">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400">💪</span>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Battle Cry</span>
                </div>
                <div className="text-sm text-white font-medium italic leading-snug break-words whitespace-pre-wrap">
                  &quot;{pick.motto}&quot;
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-400">🔮</span>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Prediction</span>
                </div>
                <div className="text-sm text-white font-medium leading-snug break-words">
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
  remainingPlayers: string[];
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
  remainingPlayers,
  onReveal,
  onNext,
  onReset,
  onStartReveal
}: StandardHeaderProps) {
  return (
    <div className="py-2 sm:py-4 min-h-[120px] sm:min-h-[140px] flex flex-col">
      <div className="max-w-6xl mx-auto flex-1">
          {/* Modern Title Card */}
          <div className="mb-3 sm:mb-4">
            <motion.div 
              className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl"
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
                <div className="flex flex-col lg:flex-row items-start justify-between gap-2 sm:gap-4">
                  {/* Left: Enhanced Title */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-1">
                    <motion.div 
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg sm:rounded-xl shadow-xl"
                    >
                      <TrophyIcon className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
                    </motion.div>
                    
                    <div className="space-y-0.5 sm:space-y-1">
                      <motion.h1
                        className="text-base sm:text-xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-yellow-200 to-slate-100 tracking-wide"
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
                          className="text-xs sm:text-sm font-semibold tracking-wider uppercase"
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

                  {/* Right: Live Banner + Remaining Players Tracker */}
                  <div className="flex flex-col lg:flex-row items-end gap-2 sm:gap-3">
                    {/* Live Banner */}
                    <motion.div 
                      className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-3 py-1.5 rounded-full shadow-lg"
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
                        <span className="text-xs sm:text-sm font-bold tracking-wide">LIVE DRAFT COVERAGE</span>
                        <motion.div 
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                        />
                      </div>
                    </motion.div>

                    {/* Compact Remaining Players Tracker - Show only during revealing */}
                    <AnimatePresence>
                      {isRevealing && remainingPlayers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.4 }}
                          className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-400/30 rounded-lg p-2 sm:p-3 shadow-lg min-w-[160px] sm:min-w-[200px]"
                        >
                          {/* Compact Header */}
                          <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                            <span className="text-orange-400 text-sm">👥</span>
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Remaining</span>
                            <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                              {remainingPlayers.length}
                            </div>
                          </div>
                          
                          {/* Vertical scrollable list - Show ALL names */}
                          <div className="max-h-24 sm:max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                            <div className="space-y-1">
                              {remainingPlayers.map((name, index) => (
                                <motion.div
                                  key={name}
                                  className="text-xs text-slate-200 bg-slate-700/50 px-2 py-1 rounded border border-white/10"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                  {name}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="border-t border-yellow-500/20 pt-3 sm:pt-4"
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
                      className="text-lg sm:text-xl font-bold px-6 sm:px-10 py-3 sm:py-4 relative overflow-hidden group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                        🏈 START THE DRAFT! 🏈
                        <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="border-t border-yellow-500/20 pt-3 sm:pt-4 mt-2 sm:mt-3"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Current Pick Info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <div className="text-center">
                        <div className="text-white font-black text-lg sm:text-xl">
                          PICK #{pickNumber}
                        </div>
                        <div className="text-yellow-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                          {isRevealed ? "DRAFTED" : "ON THE CLOCK"}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>

                    {/* Mystery/Status Message */}
                    <div className="hidden md:block">
                      {!isRevealed ? (
                        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl px-4 py-2 border border-yellow-500/30">
                          <div className="text-yellow-400 font-bold text-xs sm:text-sm">🤔 WHO WILL IT BE?</div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl px-4 py-2 border border-green-500/30">
                          <div className="text-green-400 font-bold text-xs sm:text-sm">✅ PICK REVEALED!</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {!isRevealed && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={onReveal}
                          size="lg"
                          variant="primary"
                          className="text-sm sm:text-lg font-black px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-xl border border-green-400/30"
                        >
                          🏈 MAKE THE PICK!
                          <span className="ml-1 sm:ml-2 text-xs opacity-75">(Space)</span>
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
                          className="text-sm sm:text-lg font-black px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-xl border border-blue-400/30"
                        >
                          ➡️ NEXT PICK
                          <span className="ml-1 sm:ml-2 text-xs opacity-75">(Space/N)</span>
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
                        className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700 hover:bg-slate-600 border border-slate-500/30"
                      >
                        🔄 RESET
                        <span className="ml-1 sm:ml-2 text-xs opacity-75">(R)</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 sm:mt-4">
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
      {/* Optimized Multi-Layer Fireworks */}
      
      {/* Primary Golden Burst - Reduced from 16 to 8 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`golden-${i}`}
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: `linear-gradient(45deg, hsl(${45 + (i * 30)}, 100%, 60%), hsl(${60 + (i * 30)}, 100%, 70%))`,
            boxShadow: `0 0 15px hsl(${45 + (i * 30)}, 100%, 60%)`
          }}
          animate={{
            x: [0, (Math.cos(i * Math.PI / 4) * (100 + Math.random() * 60))],
            y: [0, (Math.sin(i * Math.PI / 4) * (100 + Math.random() * 60))],
            opacity: [1, 0.8, 0],
            scale: [0, 2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 1,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Secondary Rainbow Burst - Reduced from 24 to 12 */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`rainbow-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: `hsl(${(i * 30) % 360}, 90%, 65%)`,
            boxShadow: `0 0 10px hsl(${(i * 30) % 360}, 90%, 65%)`
          }}
          animate={{
            x: [0, (Math.cos(i * Math.PI / 6) * (80 + Math.random() * 80))],
            y: [0, (Math.sin(i * Math.PI / 6) * (80 + Math.random() * 80))],
            opacity: [0.8, 0.5, 0],
            scale: [0.5, 1.5, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 0.8,
            delay: 0.5 + (i * 0.08),
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Sparkles - Reduced from 32 to 12 */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
            filter: 'drop-shadow(0 0 6px currentColor)'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            y: [0, -20 - Math.random() * 30]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: Math.random() * 2,
            repeatDelay: Math.random() * 1.5,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Stars - Reduced from 20 to 8 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-yellow-400 text-lg"
          style={{
            left: `${25 + Math.random() * 50}%`,
            top: `${25 + Math.random() * 50}%`,
            filter: 'drop-shadow(0 0 8px currentColor)'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.3, 0],
            rotate: [0, 180]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            repeatDelay: Math.random() * 2,
            ease: "easeOut"
          }}
        >
          ⭐
        </motion.div>
      ))}
      
      {/* Confetti - Reduced from 25 to 10 */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-2 h-6"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            background: `hsl(${Math.random() * 360}, 80%, 60%)`,
            borderRadius: '2px'
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360],
            opacity: [0.8, 0.3, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}
