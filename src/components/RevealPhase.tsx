'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';
import { DraftOrder } from '@/types';

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
  const [isRevealing, setIsRevealing] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [showDramaText, setShowDramaText] = useState(false);
  const [dramaText, setDramaText] = useState('');
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Memoize sorted draft order to prevent unnecessary re-calculations
  const sortedDraftOrder = useMemo(() => 
    [...draftOrder].sort((a, b) => b.position - a.position), 
    [draftOrder]
  );

  // Keyboard shortcuts
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
  }, [currentRevealIndex, allRevealed, isCountingDown, sortedDraftOrder]); // Dependencies are correct as these are primitive values

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
        
        // Set revealing state after scroll animation completes
        setTimeout(() => {
          setIsRevealing(true);
        }, 600);
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
            
            setTimeout(() => setIsRevealing(true), 600);
          } else {
            setTimeout(() => setIsRevealing(true), 100);
          }
        }, 300);
      }
    }, 150);
  }, []);

  const revealCurrentCard = () => {
    if (currentRevealIndex < 0 || currentRevealIndex >= sortedDraftOrder.length) return;
    
    const currentPick = sortedDraftOrder[currentRevealIndex];
    
    // Special suspense for top 3 picks
    if (currentPick.position <= 3) {
      startDramaticReveal(currentPick);
    } else {
      // Regular reveal for other picks
      performReveal(currentPick);
    }
  };

  const startDramaticReveal = (pick: DraftOrder) => {
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
      
      setDramaText(dramaTexts[pick.position as keyof typeof dramaTexts] || "");
      setShowDramaText(true);
    }, 300); // Wait for scroll to complete

    // Countdown sequence
    const countdownSequence = [3, 2, 1];
    let currentCount = 0;
    
    const countdownInterval = setInterval(() => {
      if (currentCount < countdownSequence.length) {
        setCountdownValue(countdownSequence[currentCount]);
        currentCount++;
      } else {
        clearInterval(countdownInterval);
        setIsCountingDown(false);
        setShowDramaText(false);
        performReveal(pick);
        
        // Auto-scroll to the revealed card after countdown
        setTimeout(() => {
          scrollToCard(currentRevealIndex);
        }, 1000); // Wait for reveal animation to complete
      }
    }, 1000);
  };

  const performReveal = (pick: DraftOrder) => {
    // Add screen shake for dramatic effect
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 600);
    
    // Reveal the card
    setDraftOrder(prev => 
      prev.map((p) => 
        p.id === pick.id ? { ...p, revealed: true } : p
      )
    );
    
    // Reset revealing state
    setIsRevealing(false);
    
    // Check if this was the #1 pick for fireworks
    if (pick.position === 1) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 3000);
    }
  };

  const nextReveal = () => {
    setIsRevealing(false);
    const nextIndex = currentRevealIndex + 1;

    if (nextIndex >= sortedDraftOrder.length) {
      setAllRevealed(true);
      return;
    }

    setCurrentRevealIndex(nextIndex);
    // Scroll to next card with proper header offset
    setTimeout(() => scrollToCard(nextIndex), 200);
  };

  const resetReveal = () => {
    setCurrentRevealIndex(-1);
    setAllRevealed(false);
    setShowFireworks(false);
    setIsRevealing(false);
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
    
    setDraftOrder(prev => {
      // Create a copy and reset revealed states
      const resetPicks = prev.map(pick => ({ ...pick, revealed: false }));
      
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
      
      return newOrder;
    });
  };

  return (
    <>
      {/* Standard Header - Fixed at top - OUTSIDE of animated container - Hide during countdown */}
      <AnimatePresence>
        {!(isCountingDown || showDramaText) && (
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
                      "The 2025 Fantasy Football Draft is now complete. May the best fantasy manager win!"
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
      className="relative h-72 perspective-1000"  // Increased height from h-64 to h-72
      animate={isCurrentlyRevealing ? { 
        scale: [1, 1.1, 1.05, 1.1, 1],
        rotate: [0, -2, 2, -1, 0]
      } : {}}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Simplified Glow Effect - Reduced animations for better performance */}
      {isCurrentlyRevealing && (
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-yellow-400 animate-pulse"
          style={{
            boxShadow: '0 0 20px rgba(255,215,0,0.8)'
          }}
        />
      )}

      {/* Card */}
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: pick.revealed ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Front (Hidden) - Draft Board Style */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border-2 border-yellow-500 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="text-center p-4 w-full h-full flex flex-col justify-center">
            <div className="text-5xl mb-3">🏈</div>
            <div className="bg-yellow-500 text-black px-3 py-2 rounded-lg mb-3 mx-auto">
              <div className="text-xs font-bold uppercase">PICK</div>
              <div className="text-xl font-black">#{pick.position}</div>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">ON THE CLOCK</div>
          </div>
        </div>

        {/* Back (Revealed) - NFL Team Colors */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-2xl border-2 border-yellow-400 shadow-2xl overflow-hidden">
          {showFireworks && <FireworksEffect />}
          
          <div className="p-3 h-full flex flex-col">
            {/* NFL Draft Style Header */}
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-lg mb-3 text-center flex-shrink-0">
              <div className="text-xs font-bold uppercase tracking-wide leading-tight">DRAFTED</div>
              <div className="text-lg font-black">#{pick.position}</div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-between text-center text-white min-h-0">
              {/* Player Info */}
              <div className="flex-shrink-0">
                <div className="text-lg font-black text-yellow-400 mb-1 uppercase leading-tight line-clamp-1">
                  {pick.name}
                </div>
                <div className="text-sm font-bold text-gray-200 mb-3 leading-tight line-clamp-1">
                  "{pick.team}"
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-2 flex-1 flex flex-col justify-end">
                <div className="bg-blue-800/70 rounded-lg p-2 border border-yellow-500/30">
                  <div className="text-xs text-yellow-400 uppercase tracking-wide font-bold mb-1">🏈 STRATEGY</div>
                  <div className="text-xs font-medium text-white line-clamp-2">{pick.strategy}</div>
                </div>
                
                <div className="bg-blue-800/70 rounded-lg p-2 border border-yellow-500/30">
                  <div className="text-xs text-yellow-400 uppercase tracking-wide font-bold mb-1">💬 MOTTO</div>
                  <div className="text-xs text-gray-200 italic line-clamp-2">"{pick.motto}"</div>
                </div>
              </div>
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
          {/* Top Row - Title and Live Banner */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-xl"
              >
                <TrophyIcon className="h-6 w-6 text-black" />
              </motion.div>
              
              <div>
                <h1 className="text-2xl lg:text-4xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                    DRAFT DAY WAR ROOM
                  </span>
                </h1>
                <motion.div 
                  className="mt-2 flex items-center gap-2"
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
            </div>

            {/* Right: Live Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-bold tracking-wide">LIVE DRAFT COVERAGE</span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
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
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, (Math.cos(i * Math.PI / 4) * 60)],
            y: [0, (Math.sin(i * Math.PI / 4) * 60)],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
