'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextType {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  changeVolume: (newVolume: number) => void;
  playCountdownSound: () => void;
  switchToNFLTheme: () => Promise<void>;
  switchToLobbyMusic: () => Promise<void>;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTrack: 'lobby' | 'nfl';
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const lobbyAudioRef = useRef<HTMLAudioElement | null>(null);
  const nflAudioRef = useRef<HTMLAudioElement | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 50% volume by default
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'lobby' | 'nfl'>('lobby');

  useEffect(() => {
    // Initialize lobby music
    lobbyAudioRef.current = new Audio('/audio/lobbyNflSong.mp3');
    lobbyAudioRef.current.loop = true;
    lobbyAudioRef.current.volume = volume; // Same volume as NFL theme

    // Initialize NFL theme music
    nflAudioRef.current = new Audio('/audio/nfl-theme.mp3');
    nflAudioRef.current.loop = true;
    nflAudioRef.current.volume = volume;

    // Initialize countdown sound audio element
    countdownAudioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAz6R1+3MeSsFJHfH79yQQAoUXrTp66hVFApGn+DyvmMeAz6R1+3MeSs=');
    countdownAudioRef.current.volume = 0.6;

    // Cleanup on unmount
    return () => {
      if (lobbyAudioRef.current) {
        lobbyAudioRef.current.pause();
        lobbyAudioRef.current = null;
      }
      if (nflAudioRef.current) {
        nflAudioRef.current.pause();
        nflAudioRef.current = null;
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current = null;
      }
    };
  }, [volume]);

  // Update volume when it changes
  useEffect(() => {
    const currentAudio = currentTrack === 'lobby' ? lobbyAudioRef.current : nflAudioRef.current;
    if (currentAudio) {
      currentAudio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, currentTrack]);

  const getCurrentAudio = () => {
    return currentTrack === 'lobby' ? lobbyAudioRef.current : nflAudioRef.current;
  };

  const play = async () => {
    const audio = getCurrentAudio();
    if (!audio) return;
    
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.log('Audio play was blocked (user interaction required)');
      setIsPlaying(false);
      throw error;
    }
  };

  const pause = () => {
    const audio = getCurrentAudio();
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const switchToNFLTheme = async () => {
    // Pause current audio
    if (lobbyAudioRef.current && isPlaying) {
      lobbyAudioRef.current.pause();
    }
    
    setCurrentTrack('nfl');
    
    // Start NFL theme if we were playing
    if (isPlaying && nflAudioRef.current) {
      try {
        await nflAudioRef.current.play();
      } catch (error) {
        console.log('Failed to switch to NFL theme:', error);
      }
    }
  };

  const switchToLobbyMusic = async () => {
    // Pause current audio
    if (nflAudioRef.current && isPlaying) {
      nflAudioRef.current.pause();
    }
    
    setCurrentTrack('lobby');
    
    // Start lobby music if we were playing
    if (isPlaying && lobbyAudioRef.current) {
      try {
        await lobbyAudioRef.current.play();
      } catch (error) {
        console.log('Failed to switch to lobby music:', error);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const changeVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const playCountdownSound = () => {
    if (countdownAudioRef.current && !isMuted) {
      try {
        countdownAudioRef.current.currentTime = 0; // Reset to start
        countdownAudioRef.current.play().catch(() => {});
      } catch {
        // Ignore audio play errors
      }
    }
  };

  const contextValue: AudioContextType = {
    play,
    pause,
    toggleMute,
    changeVolume,
    playCountdownSound,
    switchToNFLTheme,
    switchToLobbyMusic,
    isPlaying,
    volume,
    isMuted,
    currentTrack,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
