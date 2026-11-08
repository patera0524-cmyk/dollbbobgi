export type PrizeTier = 'grand' | 'first' | 'second' | 'third' | 'lucky' | 'consolation';

export interface Prize {
  id: string;
  name: string;
  count: number;
  initialCount: number;
  emoji: string;
  color: string;
  tier: PrizeTier;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface DrawRecord {
  id: string;
  timestamp: number;
  prizeName: string;
  prizeEmoji: string;
  playerName?: string;
}

export type MachineThemeId = 'neon' | 'pastel' | 'retro' | 'emerald';

export interface MachineTheme {
  id: MachineThemeId;
  name: string;
  cabinetBg: string;
  accentColor: string;
  accentSecondary: string;
  glowColor: string;
  glassTint: string;
  chuteColor: string;
}

export type ClawGripStrength = 'guaranteed' | 'high' | 'thrill';

export interface MachineConfig {
  title: string;
  subtitle: string;
  adminPassword: string;
  requirePassword: boolean;
  theme: MachineThemeId;
  controlMode: 'manual' | 'auto';
  gripStrength: ClawGripStrength;
  enableQuiz: boolean;
  quizCoinsReward: number;
  prizes: Prize[];
  questions: QuizQuestion[];
}

export type ClawPhase = 'IDLE' | 'MOVING_MANUAL' | 'MOVING_AUTO' | 'DROPPING' | 'GRABBING' | 'LIFTING' | 'RETURNING' | 'DISPENSING';
