/**
 * DiffRhythm 2 - Music and Audio Type Definitions
 * 10-Stem Multi-Track Studio Architecture & 3-Part Long Song Composition
 */

export type SongSectionType =
  | 'Intro'
  | 'Verse 1'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Build-up'
  | 'Drop 1'
  | 'Breakdown'
  | 'Verse 2'
  | 'Build-up 2'
  | 'Drop 2'
  | 'Bridge'
  | 'Solo'
  | 'Drop'
  | 'Chorus 2'
  | 'Outro';

export interface LyricWord {
  word: string;
  start: number; // seconds
  end: number;
}

export interface LyricLine {
  id: string;
  section: SongSectionType;
  startTime: number; // seconds
  endTime: number;
  text: string;
  phoneticHint?: string;
  words?: LyricWord[];
  partIndex?: 1 | 2 | 3; // Movement part (Part 1, 2, or 3)
}

export interface NoteEvent {
  time: number; // beat position or offset
  duration: number; // in beats (e.g., 0.25 = 16th, 0.5 = 8th, 1.0 = quarter)
  pitch: string; // e.g. "C4", "D#4", "G3", or drum sound: "kick", "snare", "hihat_closed", "hihat_open", "clap", "crash"
  frequency?: number; // Hz
  velocity: number; // 0 to 1
  lyricSnippet?: string;
  vowel?: 'a' | 'e' | 'i' | 'o' | 'u';
  wobbleRate?: number; // LFO modulation rate in Hz for rolling bass
}

// 10-Stem Studio Architecture (plus legacy aliases for compatibility)
export type StemType =
  | 'lead_vocals'
  | 'backing_vocals'
  | 'lead_synth'
  | 'chords_harmony'
  | 'atmosphere_pad'
  | 'sub_bass'
  | 'mid_bass'
  | 'drums_kick_snare'
  | 'percussion_cymbals'
  | 'fx_transitions'
  | 'vocals'
  | 'lead'
  | 'chords'
  | 'bass'
  | 'drums'
  | 'fx';

export interface StemTrack {
  id: StemType | string;
  name: string;
  type: StemType | string;
  instrument: string;
  color: string;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  muted: boolean;
  solo: boolean;
  notes: NoteEvent[];
}

export interface ChordEvent {
  bar: number;
  time: number; // seconds
  chord: string; // e.g. "Am7", "Fmaj7", "C", "G"
  notes: string[]; // e.g. ["A3", "C4", "E4", "G4"]
}

export interface SongMovementPart {
  partIndex: 1 | 2 | 3;
  name: string; // e.g. "Part I: Exposition & Verse (0:00 - 1:00)"
  startSec: number;
  endSec: number;
  sections: SongSectionType[];
  description: string;
}

export interface SongStageBlock {
  id: string;
  stageNumber: number; // 1 to 100
  name: string; // e.g. "Stage 01: Sub Drone Awakening", "Stage 14: 16th Snare Accelerando", "Stage 28: 35Hz Rolling Wub Surge"
  type: 'buildup' | 'drop' | 'wub_roll' | 'sub_dive' | 'transition' | 'breakdown' | 'tearout' | 'fakeout';
  startSec: number;
  endSec: number;
  tensionLevel: number; // 0 to 100
  wubModulation: string; // e.g. '1/8 Rolling Wub', '1/16 Neuro Churn', '1/8 Triplet', '35Hz Sub Dive'
  activeStemCount: number;
  description: string;
}

export interface MusicComprehensionData {
  extractedGenre: string;
  detectedBpm: number;
  detectedKey: string;
  subBassProfile: string;
  wubArchitecture: string;
  buildDropCount: number;
  lyricTheme: string;
  energyVarianceScore: number;
}

export interface Song {
  id: string;
  title: string;
  prompt: string;
  genre: string;
  subGenres: string[];
  bpm: number;
  key: string; // e.g. "F# Minor", "D Minor", "A Major"
  scale: 'major' | 'minor' | 'dorian' | 'mixolydian' | 'pentatonic';
  timeSignature: '4/4' | '3/4' | '6/8';
  durationSec: number; // Minimum 180 seconds (3 minutes)
  vocalStyle: string;
  mood: string;
  acousticProfile: {
    energy: number; // 0 to 1
    danceability: number;
    valence: number; // positivity
    acousticness: number;
    spaceReverb: number;
  };
  diffusionMeta: {
    steps: number;
    cfgScale: number;
    sampler: string;
    seed: number;
    model: string;
    generatedAt: string;
    compositionMethod?: '3-part-multi-movement' | '100-stage-melded' | 'monolithic';
  };
  parts?: SongMovementPart[];
  stages?: SongStageBlock[];
  comprehension?: MusicComprehensionData;
  variance?: number; // 0 to 1 (stochasticity / chaotic wub mutations)
  chordsProgression: ChordEvent[];
  lyrics: LyricLine[];
  stems: Record<StemType | string, StemTrack>;
}

export interface SongGenerationParams {
  prompt: string;
  durationSec?: number; // Target length in seconds: 180 (3 min), 210 (3.5 min), 240 (4 min)
  diffusionSteps?: number;
  cfgScale?: number;
  sampler?: 'Euler-A' | 'DPM++ 2M SDE' | 'DDIM';
  vocalStyle?: string;
  lyricsMode?: 'auto' | 'custom';
  customLyrics?: string;
  bpm?: number;
  key?: string;
  variance?: number; // 0 to 1
  wubSpeed?: string;
  buildDropDensity?: number; // up to 100
  selectedStems?: string[];
}
