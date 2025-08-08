export interface Member {
  id: string;
  name: string;
  motto: string;
  prediction: string;
}

export interface DraftOrder extends Member {
  position: number;
  revealed: boolean;
}

export type DraftStrategy = 
  | 'RB Heavy'
  | 'WR First' 
  | 'Zero RB'
  | 'Best Available'
  | 'QB Early'
  | 'TE Premium'
  | 'Handcuff Master'
  | 'Sleeper Hunter'
  | 'Adaptive Genius';

export type LeagueSize = 8 | 10 | 12 | 14 | 16;

export interface RevealEffects {
  fireworks: boolean;
  spotlight: boolean;
  countdown: boolean;
  screenFlash: boolean;
  cameraShake: boolean;
  victoryFanfare: boolean;
}
