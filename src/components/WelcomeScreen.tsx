'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Welcome Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <StarIcon className="h-12 w-12 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl blur-xl" />
            </div>
          </motion.div>

          {/* Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl"
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
            
            {/* Content */}
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight mb-4"
              >
                Fantasy Draft Revealer
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent mb-6"
              />
              
              {/* Enhanced subtitle section */}
              <div className="space-y-4">
                {/* War Room text with advanced effects */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="relative"
                >
                  <motion.h2
                    className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-yellow-200 to-slate-100 tracking-wide"
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
                    WELCOME TO THE WAR ROOM
                  </motion.h2>
                  
                  {/* Underline animation */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1.4 }}
                    className="h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mt-2 rounded-full"
                  />
                </motion.div>

                {/* Draft order text with typewriter effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="relative"
                >
                  <div className="flex items-center justify-center gap-3 text-slate-300">
                    {/* Animated dots */}
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
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
                    </motion.div>
                    
                    {/* Typewriter text */}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 2.0 }}
                      className="text-lg md:text-xl font-semibold tracking-wider uppercase"
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        transition={{ duration: 1.2, delay: 2.0 }}
                        className="inline-block overflow-hidden whitespace-nowrap"
                      >
                        The Draft Order Awaits
                      </motion.span>
                    </motion.span>
                    
                    {/* Animated dots */}
                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 2.2 }}
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
                            delay: i * 0.2 + 0.8
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  {/* Subtle glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent rounded-lg -m-2"
                    animate={{
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </div>
            
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
          </motion.div>

          {/* Enter Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="pt-8"
          >
            <motion.button
              onClick={onEnter}
              className="group relative px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Button content */}
              <span className="relative flex items-center gap-3">
                Enter Draft Lobby
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </motion.div>
              </span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-slate-500 text-sm pt-4"
          >
            🎵 Music will begin when you enter
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
