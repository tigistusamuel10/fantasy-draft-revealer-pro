'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {

    return (
      <motion.button
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 overflow-hidden group',
          {
            // Primary Variant - Ultra Modern Glassmorphism
            'bg-gradient-to-r from-green-500/90 via-green-600/90 to-green-700/90 backdrop-blur-xl text-white shadow-2xl border border-green-400/30 hover:from-green-400/90 hover:via-green-500/90 hover:to-green-600/90 hover:border-green-300/50':
              variant === 'primary',
            // Secondary Variant - Sophisticated Glass
            'bg-gradient-to-r from-slate-700/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl text-white border border-slate-500/30 hover:from-slate-600/80 hover:via-slate-700/80 hover:to-slate-800/80 hover:border-slate-400/50 shadow-xl':
              variant === 'secondary',
            // Outline Variant - Glowing Border
            'bg-slate-900/20 backdrop-blur-sm border-2 border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400/80 hover:text-yellow-300 shadow-lg':
              variant === 'outline',
            // Ghost Variant - Subtle Glassmorphism
            'bg-white/5 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20':
              variant === 'ghost',
            
            // Enhanced Sizes with Better Proportions
            'h-9 px-4 text-sm font-semibold': size === 'sm',
            'h-11 px-6 text-base font-bold': size === 'md',
            'h-13 px-8 text-lg font-bold': size === 'lg',
            'h-16 px-10 text-xl font-black': size === 'xl',
          },
          className
        )}
        whileHover={{ 
          scale: 1.05,
          boxShadow: variant === 'primary' 
            ? '0 20px 40px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.2)'
            : variant === 'outline'
            ? '0 10px 30px rgba(251, 191, 36, 0.3), 0 0 20px rgba(251, 191, 36, 0.2)'
            : '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
        whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
        transition={{ 
          type: 'spring',
          stiffness: 400,
          damping: 25
        }}
        ref={ref}
        {...props}
      >
        {/* Animated Background Glow */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            {
              'bg-gradient-to-r from-green-400/20 via-green-500/20 to-green-600/20 blur-sm': variant === 'primary',
              'bg-gradient-to-r from-slate-400/20 via-slate-500/20 to-slate-600/20 blur-sm': variant === 'secondary',
              'bg-gradient-to-r from-yellow-400/20 via-yellow-500/20 to-orange-500/20 blur-sm': variant === 'outline',
              'bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-sm': variant === 'ghost',
            }
          )}
        />
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
          initial={{ x: '-200%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
