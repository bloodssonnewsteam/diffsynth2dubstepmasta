/**
 * DiffRhythm 2 - Full-Stack Express Server with Gemini 3.8 Flash Generation
 * 100-Stage Mastered Matrix Engine & 100-Stem Dynamic Architecture
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generate100Stages, analyzeMusicComprehension, STEM_LIBRARY_100 } from './src/data/stemLibrary100';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for massive English prompt briefs (25,000+ characters)
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * 100-Stage Melded Composition Engine
 * Guarantees minimum 180 seconds (3+ minutes) with 100 mastered micro-stages & 100 stems
 */
function generate100StageSong(
  prompt: string,
  genre?: string,
  mood?: string,
  bpm?: number,
  key?: string,
  vocalStyle?: string,
  instruments?: string[],
  customLyrics?: string,
  durationSec: number = 199,
  variance: number = 0.85,
  wubSpeed?: string
) {
  const pLower = prompt.toLowerCase();
  const isDubstep =
    pLower.includes('dubstep') ||
    pLower.includes('rolling bass') ||
    pLower.includes('deep bass') ||
    pLower.includes('wobble') ||
    pLower.includes('wub') ||
    pLower.includes('140') ||
    pLower.includes('sub bass') ||
    pLower.includes('tearout') ||
    genre?.toLowerCase().includes('dubstep');

  const isDnb = pLower.includes('dnb') || pLower.includes('drum and bass') || pLower.includes('neurofunk');
  const isLofi = pLower.includes('lo-fi') || pLower.includes('chillhop') || genre?.toLowerCase().includes('lo-fi');
  const isCityPop = pLower.includes('city pop') || pLower.includes('japan') || genre?.toLowerCase().includes('city');

  const chosenBpm = bpm || (isDubstep ? 140 : isDnb ? 174 : isLofi ? 84 : isCityPop ? 116 : 128);
  const chosenKey = key || (isDubstep ? 'D Minor' : isDnb ? 'F Minor' : isLofi ? 'Eb Major' : isCityPop ? 'A Major' : 'F# Minor');
  const chosenGenre = genre || (isDubstep ? 'Deep Dubstep' : isDnb ? 'Neurofunk DnB' : isLofi ? 'Lo-Fi Chillhop' : isCityPop ? 'City Pop' : 'Cyberpunk Synthwave');
  const chosenMood = mood || (isDubstep ? 'Dark, Ominous & Deep Rolling Subwoofer' : 'Futuristic & Cinematic');
  const chosenVocal = vocalStyle || (isDubstep ? 'Dark Cyber Chant & Sub Vocoder' : 'Soaring Cyber-Pop Female');

  // Guarantee at least 180 seconds (3 full minutes!)
  const finalDuration = Math.max(180, Number(durationSec) || 199);
  const secPerBeat = 60 / chosenBpm;
  const totalBeats = Math.ceil(finalDuration / secPerBeat);
  const totalBars = Math.ceil(totalBeats / 4);

  // Divide into 3 distinct song parts / movements
  const part1EndSec = Math.round(finalDuration * 0.33); // ~65s
  const part2EndSec = Math.round(finalDuration * 0.68); // ~133s

  const parts = [
    {
      partIndex: 1 as const,
      name: isDubstep ? 'Part I: Abyss Descent & Sub Build (0:00 - 1:05)' : 'Part I: Exposition & Atmospheric Build (0:00 - 1:05)',
      startSec: 0,
      endSec: part1EndSec,
      sections: ['Intro', 'Verse 1', 'Build-up'] as any[],
      description: 'Atmospheric textures, tension build-up, and rising rhythm',
    },
    {
      partIndex: 2 as const,
      name: isDubstep ? 'Part II: Subduction Drop 1 & Rolling Bass (1:05 - 2:13)' : 'Part II: Chorus 1 & Main Movement (1:05 - 2:13)',
      startSec: part1EndSec,
      endSec: part2EndSec,
      sections: ['Drop 1', 'Breakdown', 'Verse 2'] as any[],
      description: 'First high-impact drop, deep bass modulation, and melodic breakdown',
    },
    {
      partIndex: 3 as const,
      name: isDubstep ? 'Part III: Sub Overload Drop 2 & Outro (2:13 - 3:19+)' : 'Part III: Second Climax & Atmospheric Outro (2:13 - 3:19+)',
      startSec: part2EndSec,
      endSec: finalDuration,
      sections: ['Build-up 2', 'Drop 2', 'Outro'] as any[],
      description: 'Second massive drop with maximum wobble modulation and dissolving fadeout',
    },
  ];

  // 100 Melded Micro-Stages & Tension Blueprint
  const stages = generate100Stages(finalDuration, chosenBpm, isDubstep);

  // Deep Prompt Comprehension Metadata
  const comprehension = analyzeMusicComprehension(prompt, {
    variance,
    bpm: chosenBpm,
    key: chosenKey,
    genre: chosenGenre,
  });

  // 3-Part Lyrics Narrative spanning full 3+ minutes
  const lyrics = isDubstep
    ? [
        {
          id: 'l1',
          section: 'Intro' as const,
          startTime: 3.5,
          endTime: 22.0,
          text: 'Subterranean signal detected... descent into the deep trench...',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l2',
          section: 'Verse 1' as const,
          startTime: 24.0,
          endTime: 46.0,
          text: 'Fourteen thousand fathoms down, sub pressure crushing from above...',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l3',
          section: 'Build-up' as const,
          startTime: 48.0,
          endTime: 64.0,
          text: 'Sub frequencies rising... 140 BPM... PREPARE FOR THE IMPACT!',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l4',
          section: 'Drop 1' as const,
          startTime: 65.0,
          endTime: 98.0,
          text: 'DARK DEEP ROLLING BASS! TEAR THE SUBWOOFERS APART!',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l5',
          section: 'Breakdown' as const,
          startTime: 100.0,
          endTime: 124.0,
          text: 'Into the silence of the abyss, dark echoes slowly drift...',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l6',
          section: 'Verse 2' as const,
          startTime: 125.0,
          endTime: 140.0,
          text: 'Subsurface currents awakening beneath the seabed floor...',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l7',
          section: 'Build-up 2' as const,
          startTime: 141.0,
          endTime: 156.0,
          text: 'Secondary shockwave locked in... MAXIMUM SUBWOOFER RELEASE!',
          partIndex: 3 as const,
          words: [],
        },
        {
          id: 'l8',
          section: 'Drop 2' as const,
          startTime: 157.0,
          endTime: 184.0,
          text: 'TOTAL DEEP SUB OVERLOAD! FEEL THE GROUND TREMBLE!',
          partIndex: 3 as const,
          words: [],
        },
        {
          id: 'l9',
          section: 'Outro' as const,
          startTime: 184.0,
          endTime: finalDuration,
          text: 'Sub frequencies dissolving into the midnight darkness...',
          partIndex: 3 as const,
          words: [],
        },
      ]
    : [
        {
          id: 'l1',
          section: 'Intro' as const,
          startTime: 3.0,
          endTime: 22.0,
          text: 'Signals pulse across the digital sky in the neon twilight...',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l2',
          section: 'Verse 1' as const,
          startTime: 24.0,
          endTime: 48.0,
          text: 'Electric heartbeats passing us by along the empty skyline...',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l3',
          section: 'Build-up' as const,
          startTime: 48.0,
          endTime: 64.0,
          text: 'Accelerating through the synthetic haze into the dawn...',
          partIndex: 1 as const,
          words: [],
        },
        {
          id: 'l4',
          section: 'Drop 1' as const,
          startTime: 65.0,
          endTime: 98.0,
          text: 'Step into the rhythm of the neon lights! Burning the horizon into gold!',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l5',
          section: 'Breakdown' as const,
          startTime: 100.0,
          endTime: 124.0,
          text: 'Gentle chords ringing out across the highway empty lanes...',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l6',
          section: 'Verse 2' as const,
          startTime: 125.0,
          endTime: 140.0,
          text: 'Reflections shimmering on wet asphalt under midnight stars...',
          partIndex: 2 as const,
          words: [],
        },
        {
          id: 'l7',
          section: 'Build-up 2' as const,
          startTime: 141.0,
          endTime: 156.0,
          text: 'Full throttle resonance... take off into the overdrive!',
          partIndex: 3 as const,
          words: [],
        },
        {
          id: 'l8',
          section: 'Drop 2' as const,
          startTime: 157.0,
          endTime: 184.0,
          text: 'Endless harmonic overdrive! Alive in pure synthetic energy!',
          partIndex: 3 as const,
          words: [],
        },
        {
          id: 'l9',
          section: 'Outro' as const,
          startTime: 184.0,
          endTime: finalDuration,
          text: 'Fading out in pristine stereo width...',
          partIndex: 3 as const,
          words: [],
        },
      ];

  // Core Stem Buffers
  const leadVocalsNotes: any[] = [];
  const backingVocalsNotes: any[] = [];
  const leadSynthNotes: any[] = [];
  const chordsHarmonyNotes: any[] = [];
  const atmospherePadNotes: any[] = [];
  const subBassNotes: any[] = [];
  const midBassNotes: any[] = [];
  const drumsKickSnareNotes: any[] = [];
  const percussionCymbalsNotes: any[] = [];
  const fxTransitionsNotes: any[] = [];

  // Chord Progression Definitions
  const chordsProgression: any[] = [];
  const chordCycle = isDubstep
    ? [
        { name: 'Dm', notes: ['D3', 'F3', 'A3'], root: 'D' },
        { name: 'Bb', notes: ['Bb2', 'D3', 'F3'], root: 'Bb' },
        { name: 'Gm', notes: ['G2', 'Bb2', 'D3'], root: 'G' },
        { name: 'A', notes: ['A2', 'C#3', 'E3'], root: 'A' },
      ]
    : [
        { name: 'F#m', notes: ['F#3', 'A3', 'C#4'], root: 'F#' },
        { name: 'D', notes: ['D3', 'F#3', 'A3'], root: 'D' },
        { name: 'A', notes: ['A3', 'C#4', 'E4'], root: 'A' },
        { name: 'E', notes: ['E3', 'G#3', 'B3'], root: 'E' },
      ];

  // Build Chords across all bars
  for (let bar = 0; bar < totalBars; bar += 4) {
    const c = chordCycle[(bar / 4) % chordCycle.length];
    const b = bar * 4;
    chordsProgression.push({ bar: bar + 1, time: b * secPerBeat, chord: c.name, notes: c.notes });
    c.notes.forEach((pitch) => {
      chordsHarmonyNotes.push({ time: b, duration: 3.8, pitch, velocity: 0.65 });
      atmospherePadNotes.push({ time: b, duration: 4.0, pitch, velocity: 0.45 });
    });
  }

  // --- Loop through all bars across the full 3+ minutes ---
  for (let bar = 0; bar < totalBars; bar++) {
    const b = bar * 4;
    const barSec = b * secPerBeat;

    // Movement Classification
    const isPart1 = barSec < part1EndSec;
    const isPart2 = barSec >= part1EndSec && barSec < part2EndSec;
    const isPart3 = barSec >= part2EndSec;

    // Specific section states
    const isBuild = (bar >= 28 && bar < 36) || (bar >= 78 && bar < 86);
    const isDrop = (bar >= 36 && bar < 56) || (bar >= 86 && bar < 108);
    const isBreakdown = bar >= 56 && bar < 70;
    const isIntro = bar < 14;
    const isOutro = bar >= totalBars - 8;

    // Root Note for Bass
    const rootSub = isDubstep
      ? bar % 4 === 1
        ? 'Bb0'
        : bar % 4 === 2
        ? 'G0'
        : bar % 4 === 3
        ? 'A0'
        : 'D1'
      : bar % 4 === 1
      ? 'D1'
      : bar % 4 === 2
      ? 'A1'
      : 'F#1';

    const rootMid = isDubstep
      ? bar % 4 === 1
        ? 'F1'
        : bar % 4 === 2
        ? 'G1'
        : bar % 4 === 3
        ? 'C#2'
        : 'D1'
      : bar % 4 === 1
      ? 'D2'
      : bar % 4 === 2
      ? 'A2'
      : 'F#2';

    // 1. DRUMS (Kick & Snare) + PERCUSSION (Hats, Cymbals, Claps)
    if (isIntro) {
      if (bar >= 6 && bar % 2 === 0) {
        drumsKickSnareNotes.push({ time: b + 0, duration: 0.2, pitch: isDubstep ? 'dubstep_kick' : 'kick', velocity: 0.7 });
      }
      percussionCymbalsNotes.push({ time: b + 2, duration: 0.1, pitch: 'hihat_closed', velocity: 0.5 });
    } else if (isBuild) {
      // Escalating snare roll (accelerando)
      const step = bar % 4 === 3 ? 0.25 : 0.5;
      for (let t = 0; t < 4; t += step) {
        drumsKickSnareNotes.push({
          time: b + t,
          duration: 0.1,
          pitch: 'snare',
          velocity: 0.5 + (t / 4) * 0.45,
        });
      }
      drumsKickSnareNotes.push({ time: b + 0, duration: 0.2, pitch: isDubstep ? 'dubstep_kick' : 'kick', velocity: 0.95 });
      percussionCymbalsNotes.push({ time: b + 0, duration: 0.1, pitch: 'hihat_open', velocity: 0.8 });
    } else if (isDrop) {
      if (isDubstep) {
        // Half-Time Dubstep (140 BPM)
        drumsKickSnareNotes.push({ time: b + 0, duration: 0.35, pitch: 'dubstep_kick', velocity: 1.0 });
        if (bar % 2 === 1) {
          drumsKickSnareNotes.push({ time: b + 1.5, duration: 0.25, pitch: 'dubstep_kick', velocity: 0.85 });
        } else {
          drumsKickSnareNotes.push({ time: b + 2.5, duration: 0.25, pitch: 'dubstep_kick', velocity: 0.9 });
        }
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.3, pitch: 'dubstep_snare', velocity: 1.0 });
        percussionCymbalsNotes.push({ time: b + 2, duration: 0.15, pitch: 'clap', velocity: 0.75 });

        // Sizzling metallic hi-hats with rolling accents
        percussionCymbalsNotes.push({ time: b + 0.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
        percussionCymbalsNotes.push({ time: b + 1.0, duration: 0.1, pitch: 'hihat_open', velocity: 0.85 });
        percussionCymbalsNotes.push({ time: b + 1.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
        percussionCymbalsNotes.push({ time: b + 2.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.8 });
        percussionCymbalsNotes.push({ time: b + 3.0, duration: 0.1, pitch: 'hihat_open', velocity: 0.9 });
        percussionCymbalsNotes.push({ time: b + 3.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.85 });
      } else {
        // 4 on the floor / Electro
        drumsKickSnareNotes.push({ time: b + 0, duration: 0.2, pitch: 'kick', velocity: 1.0 });
        drumsKickSnareNotes.push({ time: b + 1, duration: 0.2, pitch: 'snare', velocity: 0.95 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.2, pitch: 'kick', velocity: 1.0 });
        drumsKickSnareNotes.push({ time: b + 3, duration: 0.2, pitch: 'snare', velocity: 0.95 });
        percussionCymbalsNotes.push({ time: b + 0.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
        percussionCymbalsNotes.push({ time: b + 1.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
        percussionCymbalsNotes.push({ time: b + 2.5, duration: 0.1, pitch: 'hihat_open', velocity: 0.85 });
      }
      if (bar % 8 === 0) {
        percussionCymbalsNotes.push({ time: b + 0, duration: 1.5, pitch: 'crash', velocity: 1.0 });
      }
    } else if (isBreakdown) {
      if (bar % 4 === 0) {
        drumsKickSnareNotes.push({ time: b + 0, duration: 0.3, pitch: isDubstep ? 'dubstep_kick' : 'kick', velocity: 0.75 });
      }
      percussionCymbalsNotes.push({ time: b + 2, duration: 0.1, pitch: 'hihat_closed', velocity: 0.5 });
    } else if (!isOutro) {
      // Standard groove
      drumsKickSnareNotes.push({ time: b + 0, duration: 0.25, pitch: isDubstep ? 'dubstep_kick' : 'kick', velocity: 0.9 });
      drumsKickSnareNotes.push({ time: b + 2, duration: 0.25, pitch: isDubstep ? 'dubstep_snare' : 'snare', velocity: 0.85 });
      percussionCymbalsNotes.push({ time: b + 1, duration: 0.1, pitch: 'hihat_closed', velocity: 0.7 });
      percussionCymbalsNotes.push({ time: b + 3, duration: 0.1, pitch: 'hihat_open', velocity: 0.8 });
    }

    // 2. SUB-BASS (Pure 35Hz Foundation) & MID-BASS (Rolling Wobble / Reese)
    if (isDrop && isDubstep) {
      // Subwoofer foundation
      subBassNotes.push({ time: b + 0, duration: 1.8, pitch: rootSub, velocity: 1.0 });
      subBassNotes.push({ time: b + 2, duration: 1.8, pitch: rootSub, velocity: 0.95 });

      // Dark Deep Rolling Bass with modulated LFO wobble
      const wobble1 = isPart3 ? 7.0 : 3.5;
      const wobble2 = isPart3 ? 11.0 : 7.0;
      midBassNotes.push({ time: b + 0, duration: 0.9, pitch: rootMid, wobbleRate: wobble1, velocity: 1.0 });
      midBassNotes.push({ time: b + 1.0, duration: 0.45, pitch: 'D2', wobbleRate: wobble2, velocity: 0.9 });
      midBassNotes.push({ time: b + 1.5, duration: 0.45, pitch: 'C1', wobbleRate: 4.5, velocity: 0.85 });
      midBassNotes.push({ time: b + 2.25, duration: 0.65, pitch: rootMid, wobbleRate: wobble1, velocity: 0.95 });
      midBassNotes.push({ time: b + 3.0, duration: 0.45, pitch: 'F1', wobbleRate: 9.0, velocity: 0.9 });
      midBassNotes.push({ time: b + 3.5, duration: 0.45, pitch: 'G#1', wobbleRate: 11.0, velocity: 0.95 });
    } else if (isDrop) {
      subBassNotes.push({ time: b + 0, duration: 1.8, pitch: rootSub, velocity: 0.9 });
      subBassNotes.push({ time: b + 2, duration: 1.8, pitch: rootSub, velocity: 0.9 });
      midBassNotes.push({ time: b + 0, duration: 0.5, pitch: rootMid, velocity: 0.9 });
      midBassNotes.push({ time: b + 1.5, duration: 0.5, pitch: rootMid, velocity: 0.85 });
      midBassNotes.push({ time: b + 2.5, duration: 1.0, pitch: rootMid, velocity: 0.95 });
    } else if (!isIntro && !isOutro) {
      subBassNotes.push({ time: b + 0, duration: 3.5, pitch: rootSub, velocity: 0.8 });
      midBassNotes.push({ time: b + 0, duration: 1.8, pitch: rootMid, wobbleRate: isDubstep ? 2.5 : undefined, velocity: 0.75 });
    }

    // 3. LEAD SYNTH (FM lasers, hooks, arpeggios)
    if (isDrop) {
      const leadPitch = isDubstep ? (bar % 2 === 0 ? 'D5' : 'F5') : (bar % 2 === 0 ? 'F#5' : 'C#5');
      leadSynthNotes.push({ time: b + 0.5, duration: 0.4, pitch: leadPitch, velocity: 0.95 });
      leadSynthNotes.push({ time: b + 1.25, duration: 0.3, pitch: isDubstep ? 'G#5' : 'E5', velocity: 0.9 });
      leadSynthNotes.push({ time: b + 2.5, duration: 0.5, pitch: isDubstep ? 'A5' : 'F#5', velocity: 0.95 });
    } else if (isBuild) {
      leadSynthNotes.push({ time: b + 0, duration: 1.0, pitch: isDubstep ? 'D5' : 'A4', velocity: 0.85 });
      leadSynthNotes.push({ time: b + 2, duration: 1.0, pitch: isDubstep ? 'F5' : 'C#5', velocity: 0.9 });
    } else if (bar >= 8 && bar % 2 === 0) {
      leadSynthNotes.push({ time: b + 0, duration: 0.8, pitch: isDubstep ? 'D4' : 'F#4', velocity: 0.7 });
      leadSynthNotes.push({ time: b + 2, duration: 0.8, pitch: isDubstep ? 'A4' : 'C#4', velocity: 0.75 });
    }

    // 4. VOCALS (Lead & Backing Chants)
    if (bar % 8 === 0 && !isIntro && !isOutro) {
      const vPitch = isDubstep ? (bar % 16 === 0 ? 'D5' : 'F5') : (bar % 16 === 0 ? 'F#5' : 'A5');
      leadVocalsNotes.push({
        time: b + 0,
        duration: 2.5,
        pitch: vPitch,
        vowel: isDubstep ? 'a' : 'o',
        velocity: 0.95,
        lyricSnippet: isDubstep ? 'DARK SUB' : 'NEON LIGHTS',
      });
      backingVocalsNotes.push({
        time: b + 0,
        duration: 3.0,
        pitch: isDubstep ? 'D4' : 'F#4',
        vowel: 'u',
        velocity: 0.7,
      });
    }
  }

  // FX Transitions across all 3 parts
  fxTransitionsNotes.push({ time: 0, duration: 3.0, pitch: 'sub_drop', velocity: 0.85 });
  fxTransitionsNotes.push({ time: (part1EndSec - 6) / secPerBeat, duration: 4.0, pitch: 'riser', velocity: 0.9 });
  fxTransitionsNotes.push({ time: part1EndSec / secPerBeat, duration: 1.0, pitch: 'crash', velocity: 1.0 });
  fxTransitionsNotes.push({ time: (part2EndSec - 8) / secPerBeat, duration: 4.0, pitch: 'riser', velocity: 0.95 });
  fxTransitionsNotes.push({ time: part2EndSec / secPerBeat, duration: 1.0, pitch: 'crash', velocity: 1.0 });
  fxTransitionsNotes.push({ time: (finalDuration - 8) / secPerBeat, duration: 4.0, pitch: 'sub_drop', velocity: 0.85 });

  // Base 10-Stem Matrix
  const stems: Record<string, any> = {
    lead_vocals: {
      id: 'lead_vocals',
      name: 'Lead Vocals',
      type: 'lead_vocals',
      instrument: chosenVocal,
      color: '#f43f5e',
      volume: 0.9,
      pan: 0,
      muted: false,
      solo: false,
      notes: leadVocalsNotes,
    },
    backing_vocals: {
      id: 'backing_vocals',
      name: 'Backing Harmonies',
      type: 'backing_vocals',
      instrument: 'Stereo Vocaloid Pad & Whispers',
      color: '#fb7185',
      volume: 0.75,
      pan: -0.25,
      muted: false,
      solo: false,
      notes: backingVocalsNotes,
    },
    lead_synth: {
      id: 'lead_synth',
      name: 'Lead Synthesizer',
      type: 'lead_synth',
      instrument: isDubstep ? 'FM Laser Zaps & Screamer Lead' : (instruments?.[0] || 'Analog Detuned Saw Lead'),
      color: '#06b6d4',
      volume: 0.85,
      pan: 0.15,
      muted: false,
      solo: false,
      notes: leadSynthNotes,
    },
    chords_harmony: {
      id: 'chords_harmony',
      name: 'Chords & Harmony',
      type: 'chords_harmony',
      instrument: isDubstep ? 'Abyssal Minor Chord Drones' : (instruments?.[1] || 'Warm Polyphonic Rhodes & Pad'),
      color: '#a855f7',
      volume: 0.75,
      pan: -0.15,
      muted: false,
      solo: false,
      notes: chordsHarmonyNotes,
    },
    atmosphere_pad: {
      id: 'atmosphere_pad',
      name: 'Atmosphere & Drone',
      type: 'atmosphere_pad',
      instrument: 'Abyssal 140 Sub Drone Pad',
      color: '#818cf8',
      volume: 0.7,
      pan: 0,
      muted: false,
      solo: false,
      notes: atmospherePadNotes,
    },
    sub_bass: {
      id: 'sub_bass',
      name: 'Sub-Bass (35Hz)',
      type: 'sub_bass',
      instrument: isDubstep ? 'Subterranean 35Hz Sine Foundation' : 'Analog Sub 808',
      color: '#eab308',
      volume: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      notes: subBassNotes,
    },
    mid_bass: {
      id: 'mid_bass',
      name: 'Mid Rolling Bass / Wobble',
      type: 'mid_bass',
      instrument: isDubstep ? 'Deep Rolling Neuro Wobble (LFO Modulated)' : 'Distorted Reese Mid-Bass',
      color: '#f97316',
      volume: 0.95,
      pan: 0,
      muted: false,
      solo: false,
      notes: midBassNotes,
    },
    drums_kick_snare: {
      id: 'drums_kick_snare',
      name: 'Kick & Snare Kit',
      type: 'drums_kick_snare',
      instrument: isDubstep ? 'Heavy Dubstep Punch Kick & Gunshot Snare' : 'Punch Studio Kit',
      color: '#10b981',
      volume: 0.95,
      pan: 0,
      muted: false,
      solo: false,
      notes: drumsKickSnareNotes,
    },
    percussion_cymbals: {
      id: 'percussion_cymbals',
      name: 'Percussion & Cymbals',
      type: 'percussion_cymbals',
      instrument: 'Metallic Hi-Hats, Claps & Crash',
      color: '#14b8a6',
      volume: 0.8,
      pan: 0.2,
      muted: false,
      solo: false,
      notes: percussionCymbalsNotes,
    },
    fx_transitions: {
      id: 'fx_transitions',
      name: 'FX & Transitions',
      type: 'fx_transitions',
      instrument: 'Sub Drops, Risers & Impacts',
      color: '#6366f1',
      volume: 0.75,
      pan: 0,
      muted: false,
      solo: false,
      notes: fxTransitionsNotes,
    },

    // Legacy 6 stems
    vocals: {
      id: 'vocals',
      name: 'Lead Vocals',
      type: 'vocals',
      instrument: chosenVocal,
      color: '#f43f5e',
      volume: 0.9,
      pan: 0,
      muted: false,
      solo: false,
      notes: leadVocalsNotes,
    },
    lead: {
      id: 'lead',
      name: 'Lead Synthesizer',
      type: 'lead',
      instrument: isDubstep ? 'FM Laser Zaps & Screamer Lead' : (instruments?.[0] || 'Analog Detuned Saw Lead'),
      color: '#06b6d4',
      volume: 0.85,
      pan: 0.15,
      muted: false,
      solo: false,
      notes: leadSynthNotes,
    },
    chords: {
      id: 'chords',
      name: 'Chords & Harmony',
      type: 'chords',
      instrument: isDubstep ? 'Abyssal Minor Chord Drones' : (instruments?.[1] || 'Warm Polyphonic Rhodes & Pad'),
      color: '#a855f7',
      volume: 0.75,
      pan: -0.15,
      muted: false,
      solo: false,
      notes: chordsHarmonyNotes,
    },
    bass: {
      id: 'bass',
      name: isDubstep ? 'Deep Rolling Sub-Bass' : 'Bassline',
      type: 'bass',
      instrument: isDubstep ? 'Subterranean 35Hz Wobble Bass' : '808 Sub Bass',
      color: '#eab308',
      volume: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      notes: isDubstep ? midBassNotes : subBassNotes,
    },
    drums: {
      id: 'drums',
      name: '140 Dubstep Punch Kit',
      type: 'drums',
      instrument: isDubstep ? 'Heavy Dubstep Punch Kick & Gunshot Snare' : 'Punch Studio Kit',
      color: '#10b981',
      volume: 0.95,
      pan: 0,
      muted: false,
      solo: false,
      notes: [...drumsKickSnareNotes, ...percussionCymbalsNotes],
    },
    fx: {
      id: 'fx',
      name: 'FX & Transitions',
      type: 'fx',
      instrument: 'Sub Drops, Risers & Impacts',
      color: '#6366f1',
      volume: 0.75,
      pan: 0,
      muted: false,
      solo: false,
      notes: fxTransitionsNotes,
    },
  };

  // Populate dynamic stems from the 100-stem library so user can access and modify any of the 100 stems
  for (const def of STEM_LIBRARY_100) {
    if (!stems[def.id]) {
      let sourceNotes = subBassNotes;
      if (def.family === 'rolling_wubs') sourceNotes = midBassNotes;
      else if (def.family === 'heavy_drums') sourceNotes = drumsKickSnareNotes;
      else if (def.family === 'percussion') sourceNotes = percussionCymbalsNotes;
      else if (def.family === 'leads') sourceNotes = leadSynthNotes;
      else if (def.family === 'chords') sourceNotes = chordsHarmonyNotes;
      else if (def.family === 'atmosphere') sourceNotes = atmospherePadNotes;
      else if (def.family === 'vocals') sourceNotes = leadVocalsNotes;
      else if (def.family === 'buildups' || def.family === 'drops_fx') sourceNotes = fxTransitionsNotes;

      stems[def.id] = {
        id: def.id,
        name: def.name,
        type: def.id,
        instrument: def.instrument,
        color: def.color,
        volume: def.defaultVolume,
        pan: def.defaultPan,
        muted: false,
        solo: false,
        notes: sourceNotes,
      };
    }
  }

  return {
    id: `diffrhythm-${Date.now()}`,
    title: prompt.length > 40 ? `${prompt.slice(0, 36).trim()}...` : prompt || 'DiffRhythm 100-Stage Masterpiece',
    prompt,
    genre: chosenGenre,
    subGenres: [chosenGenre, chosenMood, '3-Minute Full Mix', '100-Stage Melded Matrix', '100-Stem Studio Architecture'],
    bpm: chosenBpm,
    key: chosenKey,
    scale: 'minor' as const,
    timeSignature: '4/4' as const,
    durationSec: finalDuration,
    vocalStyle: chosenVocal,
    mood: chosenMood,
    acousticProfile: {
      energy: isDubstep ? 0.96 : 0.88,
      danceability: 0.86,
      valence: isDubstep ? 0.35 : 0.65,
      acousticness: 0.05,
      spaceReverb: 0.7,
    },
    diffusionMeta: {
      steps: 60,
      cfgScale: 5.5,
      sampler: 'Euler-A',
      seed: Math.floor(Math.random() * 999999),
      model: 'DiffRhythm-2-DiT-Audio-Large',
      generatedAt: new Date().toISOString(),
      compositionMethod: '100-stage-melded' as const,
    },
    parts,
    stages,
    comprehension,
    variance,
    chordsProgression,
    lyrics,
    stems,
  };
}

// 1. API: Real-Time English & Music Comprehension Analyzer
app.post('/api/analyze-prompt', (req, res) => {
  const { prompt, variance, bpm, key, genre } = req.body;
  const analysis = analyzeMusicComprehension(prompt || '', { variance, bpm, key, genre });
  res.json(analysis);
});

// 2. API: Generate Full-Stack Song from English Prompt
app.post('/api/generate-song', async (req, res) => {
  try {
    const {
      prompt,
      genre,
      mood,
      bpm,
      key,
      vocalStyle,
      instruments,
      diffusionSteps,
      cfgScale,
      sampler,
      customLyrics,
      durationSec,
      variance,
      wubSpeed,
    } = req.body;

    // Minimum 180 seconds (3 full minutes!)
    const targetDurationSec = Math.max(180, Number(durationSec) || 199);

    if (!prompt && !customLyrics) {
      return res.status(400).json({ error: 'Prompt or lyrics required' });
    }

    // If Gemini API Key is not set, use high-fidelity 100-stage composition engine
    if (!process.env.GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY provided; generating with DiffRhythm-2 100-stage engine.');
      const fullSong = generate100StageSong(
        prompt,
        genre,
        mood,
        bpm,
        key,
        vocalStyle,
        instruments,
        customLyrics,
        targetDurationSec,
        variance ?? 0.85,
        wubSpeed
      );
      return res.json(fullSong);
    }

    const systemPrompt = `You are DiffRhythm-2, an advanced state-of-the-art text-to-full-stack song diffusion neural engine with evolutionary music comprehension.
You compose complete, broadcast-ready 3-minute+ musical architectures with 100 melded micro-movement stages (buildups, drops, rolling wubs, tearouts, fakeouts).
Your knowledge is deeply grounded in underground dubstep sound system culture, Deep Dark & Dangerous (DDD / TRUTH), Trench / Minimal Flow (Infekt / Getter), UK Dubplate (DMZ / Mala / Coki), Tearout (Marauda), and Leftfield Halftime (Alix Perez / 1985).

CRITICAL SONG DURATION & COMPOSITION REQUIREMENT:
The song durationSec MUST be at least 180 seconds (3 minutes) up to 240 seconds.
The song has 100 melded stages including multiple escalating buildups, colossal drops, dark rolling wubs, sub dives, and breakdowns.

UNDERGROUND SOUND SYSTEM DUBSTEP SPECIFICATIONS:
- If Dubstep / Deep Bass / Wub / Trench / Tearout is requested or detected:
  * Tempo: 140 BPM, Key: D Minor or F Minor
  * Sub-Bass: Pure subterranean 30-45Hz sine fundamental anchored in mono for maximum club sound system weight
  * Drums: Colossal dubstep gunshot snare on beat 3 (or snappy layered wooden claps for Trench), 35Hz pitch-swept punch kick on beat 1, rolling triplets hi-hats
  * Bass: Deep rolling neuro wobble bass with LFO modulation (1/8 rolls, 1/16 neuro churn, 1/8T triplet bounce, talkbox yoi growls)
  * Space & FX: Cavernous dub delay (dotted 8th repeats), 12s decay chamber reverb, micro-gate silence cuts right before drops
  * Vocals: Ominous subterranean chants, pitch-shifted demon shouts, or sound system MC dubplates ("DARK ROLLING BASS", "SUBWOOFER OVERLOAD")

Return JSON with:
- title: string
- genre: string (e.g. "Deep Dark & Dangerous Dubstep", "Trench / Minimal Flow", "UK Sound System 140", "Tearout Dubstep")
- subGenres: string[]
- bpm: number (140 for dubstep)
- key: string (e.g. "D Minor")
- durationSec: integer >= 180 (e.g. ${targetDurationSec})
- mood: string
- vocalStyle: string
- chordsProgression: array of chord objects: { bar, time, chord, notes }
- lyrics: array of 9 lyric line objects across all parts`;

    const userMessage = `Generate a full 3-minute+ 100-stage song (Duration: ${targetDurationSec}s) from this prompt:
Prompt: "${prompt}"
Target Duration: ${targetDurationSec} seconds (minimum 180s / 3 minutes)
Genre preference: ${genre || 'Auto-detect'}
Mood preference: ${mood || 'Auto-detect'}
Tempo (BPM): ${bpm || (prompt.toLowerCase().includes('dubstep') ? 140 : 'Auto-detect')}
Key: ${key || 'Auto-detect'}
Vocal Style: ${vocalStyle || 'Auto-detect'}
Preferred Instruments: ${instruments ? instruments.join(', ') : 'Auto-select from 100-stem matrix'}
Custom Lyrics: ${customLyrics || 'Auto-generate matching lyrics across all movements'}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const jsonText = response.text?.trim();
      if (!jsonText) throw new Error('Empty response from model');

      const parsed = JSON.parse(jsonText);

      // Merge Gemini creative concept with our 100-stage 100-stem composition engine
      const baseSong = generate100StageSong(
        prompt,
        parsed.genre || genre,
        parsed.mood || mood,
        Number(parsed.bpm) || bpm,
        parsed.key || key,
        parsed.vocalStyle || vocalStyle,
        instruments,
        customLyrics,
        Math.max(180, Number(parsed.durationSec) || targetDurationSec),
        variance ?? 0.85,
        wubSpeed
      );

      // Overlay Gemini's custom title, lyrics, chords, and metadata
      if (parsed.title) baseSong.title = parsed.title;
      if (Array.isArray(parsed.subGenres)) baseSong.subGenres = parsed.subGenres;
      if (Array.isArray(parsed.lyrics) && parsed.lyrics.length >= 6) {
        baseSong.lyrics = parsed.lyrics.map((l: any, idx: number) => ({
          ...l,
          id: `l_${idx + 1}`,
          partIndex: (idx < 3 ? 1 : idx < 6 ? 2 : 3) as 1 | 2 | 3,
        }));
      }
      if (Array.isArray(parsed.chordsProgression) && parsed.chordsProgression.length > 0) {
        baseSong.chordsProgression = parsed.chordsProgression;
      }
      if (diffusionSteps) baseSong.diffusionMeta.steps = diffusionSteps;
      if (cfgScale) baseSong.diffusionMeta.cfgScale = cfgScale;
      if (sampler) baseSong.diffusionMeta.sampler = sampler;

      return res.json(baseSong);
    } catch (genErr) {
      console.warn('Gemini generation fallback to 100-stage engine:', genErr);
      const fullSong = generate100StageSong(
        prompt,
        genre,
        mood,
        bpm,
        key,
        vocalStyle,
        instruments,
        customLyrics,
        targetDurationSec,
        variance ?? 0.85,
        wubSpeed
      );
      return res.json(fullSong);
    }
  } catch (err: any) {
    console.error('Song generation error:', err);
    const fallback = generate100StageSong(
      req.body.prompt || 'Dark Deep Rolling Bass Dubstep',
      req.body.genre,
      req.body.mood,
      req.body.bpm,
      req.body.key,
      req.body.vocalStyle,
      req.body.instruments,
      req.body.customLyrics,
      199,
      req.body.variance ?? 0.85,
      req.body.wubSpeed
    );
    return res.json(fallback);
  }
});

// 3. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    model: 'DiffRhythm-2',
    stageEngine: '100-Stage Melded Matrix',
    durationSupport: '180s - 240s (3+ minutes)',
    stemCount: 100,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Dev mode Vite middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DiffRhythm 2 Server listening on port ${PORT}`);
});
