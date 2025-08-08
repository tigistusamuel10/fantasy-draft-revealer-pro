'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextType {
  play: () => Promise<void>;
  pause: () => void;
  toggleMute: () => void;
  changeMusicVolume: (newVolume: number) => void;
  changeSoundFXVolume: (newVolume: number) => void;
  playCountdownSound: () => void;
  playCardSelectSound: () => void;
  playCardRevealSound: () => void;
  playButtonClickSound: () => void;
  switchToNFLTheme: () => Promise<void>;
  switchToLobbyMusic: () => Promise<void>;
  isPlaying: boolean;
  musicVolume: number;
  soundFXVolume: number;
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
  const cardSelectAudioRef = useRef<HTMLAudioElement | null>(null);
  const cardRevealAudioRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3); // 30% music volume by default (lower)
  const [soundFXVolume, setSoundFXVolume] = useState(0.8); // 80% sound FX volume by default (louder)
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'lobby' | 'nfl'>('lobby');

  // Create enhanced Web Audio API sound effects
  const createCountdownSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.15;
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a sharp beep sound for countdown
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Higher frequency beep with quick decay
      data[i] = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 15) * 0.3;
    }
    
    const audioBuffer = buffer;
    const blob = new Blob([encodeWAV(audioBuffer)], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };
  
  const createCardSelectSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.2;
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a satisfying "click" sound with a subtle swoosh
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Combine high frequency click with lower whoosh
      const click = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 25) * 0.4;
      const whoosh = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 8) * 0.2;
      data[i] = click + whoosh;
    }
    
    const audioBuffer = buffer;
    const blob = new Blob([encodeWAV(audioBuffer)], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };
  
  const createCardRevealSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.4;
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a satisfying "whoosh-pop" reveal sound - like a card flipping with impact
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Phase 1: Quick whoosh (0-0.15s) - card flipping through air
      let sample = 0;
      if (t < 0.15) {
        const whooshProgress = t / 0.15;
        // White noise filtered through a swept bandpass for whoosh effect
        const noise = (Math.random() - 0.5) * 0.3;
        const filterFreq = 200 + whooshProgress * 800;
        const filtered = noise * Math.sin(2 * Math.PI * filterFreq * t);
        sample += filtered * (1 - whooshProgress) * 0.4;
      }
      
      // Phase 2: Sharp impact/pop (0.15-0.25s) - card hitting the table/revealing
      if (t >= 0.15 && t < 0.25) {
        const impactProgress = (t - 0.15) / 0.1;
        // Sharp attack with quick decay - like a satisfying "thunk"
        const impact = Math.sin(2 * Math.PI * 150 * (t - 0.15)) * Math.exp(-impactProgress * 15);
        sample += impact * 0.6;
      }
      
      // Phase 3: Quick ring-out (0.25-0.4s) - subtle resonance
      if (t >= 0.25) {
        const ringProgress = (t - 0.25) / 0.15;
        // Gentle ring at a pleasant frequency
        const ring = Math.sin(2 * Math.PI * 440 * (t - 0.25)) * Math.exp(-ringProgress * 8);
        sample += ring * 0.15;
      }
      
      data[i] = Math.max(-1, Math.min(1, sample));
    }
    
    const audioBuffer = buffer;
    const blob = new Blob([encodeWAV(audioBuffer)], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };
  
  const createButtonClickSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.08; // Very short - 80ms
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Create a subtle, pleasant "tick" sound - much softer than card select
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Gentle click at a pleasant frequency with very quick decay
      const tick = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 35) * 0.15;
      // Add a tiny bit of higher harmonic for crispness
      const harmonic = Math.sin(2 * Math.PI * 1600 * t) * Math.exp(-t * 50) * 0.05;
      data[i] = tick + harmonic;
    }
    
    const audioBuffer = buffer;
    const blob = new Blob([encodeWAV(audioBuffer)], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };
  
  // Helper function to encode audio buffer as WAV
  const encodeWAV = (buffer: AudioBuffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const data = buffer.getChannelData(0);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  useEffect(() => {
    // Initialize lobby music
    lobbyAudioRef.current = new Audio('/audio/lobbyNflSong.mp3');
    lobbyAudioRef.current.loop = true;
    lobbyAudioRef.current.volume = musicVolume;

    // Initialize NFL theme music
    nflAudioRef.current = new Audio('/audio/nfl-theme.mp3');
    nflAudioRef.current.loop = true;
    nflAudioRef.current.volume = musicVolume;

    // Initialize enhanced sound effects
    try {
      countdownAudioRef.current = new Audio(createCountdownSound());
      countdownAudioRef.current.volume = soundFXVolume;
      
      cardSelectAudioRef.current = new Audio(createCardSelectSound());
      cardSelectAudioRef.current.volume = soundFXVolume;
      
      cardRevealAudioRef.current = new Audio(createCardRevealSound());
      cardRevealAudioRef.current.volume = soundFXVolume;
      
      buttonClickAudioRef.current = new Audio(createButtonClickSound());
      buttonClickAudioRef.current.volume = soundFXVolume;
    } catch (error) {
      console.log('Web Audio API not supported, falling back to simple sounds');
      // Fallback to simple beep sounds if Web Audio API fails
      const simpleBeep = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMeAz6R1+3MeSsFJHfH79yQQAoUXrTp66hVFApGn+DyvmMeAz6R1+3MeSs=';
      countdownAudioRef.current = new Audio(simpleBeep);
      cardSelectAudioRef.current = new Audio(simpleBeep);
      cardRevealAudioRef.current = new Audio(simpleBeep);
      buttonClickAudioRef.current = new Audio(simpleBeep);
      
      countdownAudioRef.current.volume = soundFXVolume;
      cardSelectAudioRef.current.volume = soundFXVolume;
      cardRevealAudioRef.current.volume = soundFXVolume;
      buttonClickAudioRef.current.volume = soundFXVolume;
    }

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
      if (cardSelectAudioRef.current) {
        cardSelectAudioRef.current.pause();
        cardSelectAudioRef.current = null;
      }
      if (cardRevealAudioRef.current) {
        cardRevealAudioRef.current.pause();
        cardRevealAudioRef.current = null;
      }
      if (buttonClickAudioRef.current) {
        buttonClickAudioRef.current.pause();
        buttonClickAudioRef.current = null;
      }
    };
  }, []); // Remove volume dependencies - volume changes are handled by separate effects

  // Update music volume when it changes
  useEffect(() => {
    const currentAudio = currentTrack === 'lobby' ? lobbyAudioRef.current : nflAudioRef.current;
    if (currentAudio) {
      currentAudio.volume = isMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMuted, currentTrack]);

  // Update sound FX volume when it changes
  useEffect(() => {
    const sfxVolume = isMuted ? 0 : soundFXVolume;
    if (countdownAudioRef.current) {
      countdownAudioRef.current.volume = sfxVolume;
    }
    if (cardSelectAudioRef.current) {
      cardSelectAudioRef.current.volume = sfxVolume;
    }
    if (cardRevealAudioRef.current) {
      cardRevealAudioRef.current.volume = sfxVolume;
    }
    if (buttonClickAudioRef.current) {
      buttonClickAudioRef.current.volume = sfxVolume;
    }
  }, [soundFXVolume, isMuted]);

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

  const changeMusicVolume = (newVolume: number) => {
    setMusicVolume(Math.max(0, Math.min(1, newVolume)));
  };

  const changeSoundFXVolume = (newVolume: number) => {
    setSoundFXVolume(Math.max(0, Math.min(1, newVolume)));
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

  const playCardSelectSound = () => {
    if (cardSelectAudioRef.current && !isMuted) {
      try {
        cardSelectAudioRef.current.currentTime = 0; // Reset to start
        cardSelectAudioRef.current.play().catch(() => {});
        console.log('🔊 Card selection sound played');
      } catch {
        // Ignore audio play errors
      }
    }
  };

  const playCardRevealSound = () => {
    if (cardRevealAudioRef.current && !isMuted) {
      try {
        cardRevealAudioRef.current.currentTime = 0; // Reset to start
        cardRevealAudioRef.current.play().catch(() => {});
        console.log('🔊 Card reveal sound played');
      } catch {
        // Ignore audio play errors
      }
    }
  };

  const playButtonClickSound = () => {
    // Use the dedicated subtle button click sound
    if (buttonClickAudioRef.current && !isMuted) {
      try {
        buttonClickAudioRef.current.currentTime = 0; // Reset to start
        buttonClickAudioRef.current.play().catch(() => {});
        console.log('🔊 Button click sound played');
      } catch {
        // Ignore audio play errors
      }
    }
  };

  const contextValue: AudioContextType = {
    play,
    pause,
    toggleMute,
    changeMusicVolume,
    changeSoundFXVolume,
    playCountdownSound,
    playCardSelectSound,
    playCardRevealSound,
    playButtonClickSound,
    switchToNFLTheme,
    switchToLobbyMusic,
    isPlaying,
    musicVolume,
    soundFXVolume,
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
