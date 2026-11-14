export type WordCategory = 'fruit' | 'animal' | 'nature' | 'vehicle' | 'school';

export interface WordItem {
  id: string;
  word: string;
  syllables: string[];
  category: WordCategory;
  stageId: number;
  hint: string;
  bgTint: string;
}

export interface StageInfo {
  id: number;
  title: string;
  subtitle: string;
  category: WordCategory;
  pairCount: number;
  maxHearts: number;
  accentBg: string;
  accentText: string;
}

export type AppScreen =
  | 'TITLE_MENU'
  | 'PLAYING_MEMORY'
  | 'PLAYING_LINE'
  | 'PLAYING_SPEED'
  | 'COLLECTION';

export type RoundStatus = 'PLAYING' | 'STAGE_CLEAR' | 'GAME_OVER';

export interface PlayerProgress {
  totalScore: number;
  stageStars: Record<number, number>; // stageId -> 0..3
  unlockedWordIds: string[];
  bestSpeedScore: number;
  bestLineWaveCleared: number;
}

export interface StudentRecord {
  id: string;
  nickname: string;
  classCode: string;
  totalScore: number;
  bestSpeedScore: number;
  bestLineWaveCleared: number;
  totalStars: number;
  unlockedCount: number;
  gamesPlayed: number;
  lastMode: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface ScoreLogRecord {
  id: string;
  studentId: string;
  nickname: string;
  mode: 'memory' | 'line' | 'speed';
  score: number;
  stageId: number;
  createdAtMs: number;
}
