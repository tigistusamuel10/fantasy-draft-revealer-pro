'use client';

import { useEffect } from 'react';
import { useAudio } from '@/hooks/useBackgroundMusic';

interface GlobalButtonSoundsProps {
  children: React.ReactNode;
}

export function GlobalButtonSounds({ children }: GlobalButtonSoundsProps) {
  const { playButtonClickSound } = useAudio();

  useEffect(() => {
    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element is a button or has button-like behavior
      if (
        target.tagName === 'BUTTON' ||
        target.role === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        playButtonClickSound();
      }
    };

    // Add event listener to document for all clicks
    document.addEventListener('click', handleButtonClick, true);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [playButtonClickSound]);

  return <>{children}</>;
}
