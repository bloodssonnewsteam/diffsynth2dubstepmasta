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
import type { LyricLine, SongSectionType } from './src/types/music';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for massive English prompt briefs (25,000+ characters)
app.use(express.json({ limit: '50mb' }));

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_OFFSETS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

function pitchToMidi(pitch: string): number {
  const match = pitch.match(/^([A-G](?:#|b)?)(-?\d+)$/i);
  if (!match) return 60;
  const name = match[1][0].toUpperCase() + match[1].slice(1);
  return (Number(match[2]) + 1) * 12 + (NOTE_OFFSETS[name] ?? 0);
}

function midiToPitch(midi: number): string {
  const rounded = Math.round(midi);
  return `${CHROMATIC_NOTES[((rounded % 12) + 12) % 12]}${Math.floor(rounded / 12) - 1}`;
}

function getKeyRoot(key: string): string {
  return key.match(/^([A-G](?:#|b)?)/i)?.[1] ?? 'D';
}

function getScaleIntervals(key: string): number[] {
  return key.toLowerCase().includes('major')
    ? [0, 2, 4, 5, 7, 9, 11]
    : [0, 2, 3, 5, 7, 8, 10];
}

function scalePitch(key: string, degree: number, octave: number): string {
  const root = getKeyRoot(key);
  const intervals = getScaleIntervals(key);
  const normalizedDegree = ((degree % 7) + 7) % 7;
  const octaveOffset = Math.floor(degree / 7);
  const rootMidi = pitchToMidi(`${root}4`);
  return midiToPitch(rootMidi + intervals[normalizedDegree] + (octaveOffset + octave - 4) * 12);
}

function buildChordCycle(key: string, withSevenths = false) {
  const intervals = getScaleIntervals(key);
  const degrees = key.toLowerCase().includes('major') ? [0, 4, 5, 3] : [0, 5, 3, 6];
  return degrees.map((degree) => {
    const rootMidi = pitchToMidi(scalePitch(key, degree, 3));
    const thirdMidi = pitchToMidi(scalePitch(key, degree + 2, 3));
    const fifthMidi = pitchToMidi(scalePitch(key, degree + 4, 3));
    const seventhMidi = pitchToMidi(scalePitch(key, degree + 6, 3));
    const thirdDistance = thirdMidi - rootMidi;
    const fifthDistance = fifthMidi - rootMidi;
    const seventhDistance = seventhMidi - rootMidi;
    const suffix = thirdDistance === 3 && fifthDistance === 6
      ? withSevenths ? 'm7b5' : 'dim'
      : thirdDistance === 3 ? withSevenths ? seventhDistance === 10 ? 'm7' : 'm' : 'm'
        : withSevenths ? seventhDistance === 11 ? 'maj7' : '7' : '';
    const rootName = CHROMATIC_NOTES[((rootMidi % 12) + 12) % 12];
    return {
      name: `${rootName}${suffix}`,
      notes: [midiToPitch(rootMidi), midiToPitch(thirdMidi), midiToPitch(fifthMidi), ...(withSevenths ? [midiToPitch(seventhMidi)] : [])],
      root: rootName,
    };
  });
}

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
  wubSpeed?: string,
  buildDropDensity: number = 100,
  selectedStems: string[] = [],
  recentMotifs: string[][] = []
) {
  const pLower = prompt.toLowerCase();
  const isDubstep =
    pLower.includes('dubstep') ||
    pLower.includes('rolling bass') ||
    pLower.includes('deep bass') ||
    pLower.includes('wobble') ||
    pLower.includes('wub') ||
    pLower.includes('sub bass') ||
    pLower.includes('tearout') ||
    genre?.toLowerCase().includes('dubstep');

  const isDnb = pLower.includes('dnb') || pLower.includes('drum and bass') || pLower.includes('neurofunk') || genre?.toLowerCase().includes('dnb') || genre?.toLowerCase().includes('drum & bass');
  const isLofi = pLower.includes('lo-fi') || pLower.includes('chillhop') || genre?.toLowerCase().includes('lo-fi');
  const isCityPop = pLower.includes('city pop') || pLower.includes('japan') || genre?.toLowerCase().includes('city');
  const isAmbient = /ambient|soundscape|drone|no drums|without drums/.test(pLower) || genre?.toLowerCase().includes('ambient');
  const isTrap = /\btrap\b|808|hi-hat roll|hihat roll/.test(pLower) || genre?.toLowerCase().includes('trap');
  const isHouse = /\bhouse\b|four.on.the.floor|four on the floor|tech house|\btechno\b/.test(pLower) || /house|techno/i.test(genre || '');
  const isBreakbeat = /breakbeat|broken beat|two.step|two step|uk garage|garage/.test(pLower);
  const isJazz = /jazz|neo.soul|neo soul|swing|jazzy|r&b/.test(pLower) || /jazz|neo.?soul|r&b/i.test(genre || '');
  const isFutureBass = /future bass|supersaw|chopped vocal/.test(pLower) || genre?.toLowerCase().includes('future bass');
  const isHyperpop = /hyperpop|glitch pop|glitchy pop/.test(pLower) || genre?.toLowerCase().includes('hyperpop');
  const isBright = /uplifting|bright|joyful|euphoric|hopeful|sunny/.test(pLower);
  const isDark = /dark|ominous|menacing|brooding|eerie/.test(pLower);
  const isMinimal = /minimal|sparse|stripped.back|few layers/.test(pLower);
  const isDense = /dense|busy|maximal|layered|wall of sound/.test(pLower);
  const promptBpmMatch = pLower.match(/\b(\d{2,3})\s*(?:bpm|beats per minute)\b/);
  const promptBpm = promptBpmMatch ? Number(promptBpmMatch[1]) : undefined;
  const promptKeyMatch = pLower.match(/\b([a-g](?:#|b)?)\s+(major|minor)\b/i);
  const promptKey = promptKeyMatch
    ? `${promptKeyMatch[1][0].toUpperCase()}${promptKeyMatch[1].slice(1)} ${promptKeyMatch[2][0].toUpperCase()}${promptKeyMatch[2].slice(1)}`
    : undefined;
  const isInstrumental = /instrumental|no vocals|without vocals|no vocal/.test(pLower) && !customLyrics?.trim();

  const defaultBpm = isDubstep ? 140 : isDnb ? 174 : isLofi ? 84 : isCityPop ? 116 : isHouse ? 124 : isTrap ? 140 : isFutureBass || isHyperpop ? 150 : isAmbient ? 90 : 128;
  const chosenBpm = Math.round(Math.max(30, Math.min(240, Number(bpm) || promptBpm || defaultBpm)));
  const chosenKey = key || promptKey || (isDubstep ? 'D Minor' : isDnb ? 'F Minor' : isLofi || isJazz ? 'Eb Major' : isCityPop ? 'A Major' : 'F# Minor');
  const chosenGenre = genre || (isDubstep ? 'Deep Dubstep' : isDnb ? 'Neurofunk DnB' : isLofi ? 'Lo-Fi Chillhop' : isCityPop ? 'City Pop' : isHouse ? 'House' : isTrap ? 'Melodic Trap' : isFutureBass ? 'Future Bass' : isHyperpop ? 'Hyperpop' : isAmbient ? 'Ambient' : isJazz ? 'Jazz / Neo-Soul' : 'Electronic');
  const chosenMood = mood || (isBright ? 'Bright and uplifting' : isDark ? 'Dark and atmospheric' : isAmbient ? 'Calm and spacious' : isLofi ? 'Warm and relaxed' : 'Energetic and melodic');
  const chosenVocal = vocalStyle || (isInstrumental ? 'Instrumental'
    : /baritone|male voice|male vocal/.test(pLower) ? 'Warm Baritone Male'
      : /rap|rapper|autotune/.test(pLower) ? 'Melodic Autotuned Rap'
        : /breathy|indie soul|neo.soul/.test(pLower) ? 'Breathy Indie Soul'
          : /female|woman|girl/.test(pLower) ? 'Soaring Cyber-Pop Female'
            : isDubstep ? 'Dark Cyber Chant & Sub Vocoder'
              : isCityPop ? 'Warm Breezy City Pop'
                : isAmbient ? 'Ethereal Ambient Chorus' : 'Soaring Cyber-Pop Female');
  const compositionSeed = Math.floor(Math.random() * 999999);
  let randomState = compositionSeed || 1;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };
  const normalizedVariance = Math.max(0, Math.min(1, variance));
  const promptDirectedMotif = /ascending|rising melody|climb/.test(pLower)
    ? 'ascending'
    : /descending|falling melody|descent/.test(pLower)
      ? 'descending'
      : /arpeggio|arp/.test(pLower)
        ? 'arpeggio'
        : undefined;
  const melodicMotif: number[] = [];
  for (let index = 0; index < 16; index++) {
    const previous = index > 0 ? melodicMotif[index - 1] : Math.floor(random() * 7);
    const promptDegree = promptDirectedMotif === 'ascending'
      ? (previous + 1 + Math.floor(random() * 2)) % 7
      : promptDirectedMotif === 'descending'
        ? (previous + 6 - Math.floor(random() * 2)) % 7
        : promptDirectedMotif === 'arpeggio'
          ? [0, 2, 4, 6][index % 4]
          : undefined;
    melodicMotif.push(promptDegree ?? (random() < normalizedVariance ? Math.floor(random() * 7) : previous));
  }
  const motifMatchesHistory = () => recentMotifs.some((knownMotif) =>
    knownMotif.length >= 8 && knownMotif.slice(0, 8).join('|') === melodicMotif.slice(0, 8)
      .map((degree) => scalePitch(chosenKey, degree, 5))
      .join('|')
  );
  for (let attempt = 0; attempt < 20 && motifMatchesHistory(); attempt++) {
    const index = Math.floor(random() * melodicMotif.length);
    melodicMotif[index] = Math.floor(random() * 7);
  }
  const requestedDensity = Math.max(0.2, Math.min(1, Number(buildDropDensity) / 100 || 1));
  const promptDensityBias = isAmbient ? 0.28 : isMinimal ? 0.65 : isDense ? 1.18 : 1;
  const arrangementDensity = Math.max(0.12, Math.min(1, requestedDensity * promptDensityBias));
  const selectedStemIds = new Set(selectedStems);

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
  const stages = generate100Stages(finalDuration, chosenBpm, isDubstep, buildDropDensity);
  const isMajor = chosenKey.toLowerCase().includes('major');
  const progressionOptions = isMajor
    ? [[0, 4, 5, 3], [0, 3, 4, 0], [5, 3, 0, 4], [0, 5, 1, 4]]
    : [[0, 5, 3, 6], [0, 3, 6, 2], [0, 6, 3, 4], [0, 4, 1, 6]];
  const progressions = progressionOptions[Math.floor(random() * progressionOptions.length)];
  const layoutJitter = random() * 0.06 - 0.03;
  const sectionLayout = isAmbient
    ? {
        introEnd: 0.22,
        buildOneStart: 0.42,
        buildOneEnd: 0.46,
        dropOneEnd: 0.68,
        breakdownEnd: 0.88,
        buildTwoStart: 0.78,
        buildTwoEnd: 0.82,
        dropTwoEnd: 0.94,
        outroStart: 0.94,
      }
    : {
        introEnd: 0.09 + random() * 0.05,
        buildOneStart: 0.27 + layoutJitter,
        buildOneEnd: 0.34 + layoutJitter,
        dropOneEnd: 0.52 + layoutJitter,
        breakdownEnd: 0.67 + layoutJitter,
        buildTwoStart: 0.69 + layoutJitter,
        buildTwoEnd: 0.76 + layoutJitter,
        dropTwoEnd: 0.92 + layoutJitter,
        outroStart: 0.92 + layoutJitter,
      };

  // Deep Prompt Comprehension Metadata
  const comprehension = analyzeMusicComprehension(prompt, {
    variance,
    bpm: chosenBpm,
    key: chosenKey,
    genre: chosenGenre,
    wubSpeed,
    buildDropCount: buildDropDensity,
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

  const customLyricRows: { text: string; section: SongSectionType }[] = [];
  let currentLyricSection: SongSectionType = 'Verse 1';
  const lyricSections: SongSectionType[] = [
    'Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Build-up', 'Drop 1',
    'Breakdown', 'Verse 2', 'Build-up 2', 'Drop 2', 'Bridge', 'Outro',
  ];
  for (const rawLine of (customLyrics || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const headingMatch = line.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (headingMatch) {
      const heading = headingMatch[1].toLowerCase();
      currentLyricSection = lyricSections.find((section) => section.toLowerCase() === heading)
        || (heading.includes('verse') && heading.includes('2') ? 'Verse 2' : undefined)
        || (heading.includes('verse') ? 'Verse 1' : undefined)
        || (heading.includes('drop') && heading.includes('2') ? 'Drop 2' : undefined)
        || (heading.includes('drop') ? 'Drop 1' : undefined)
        || (heading.includes('build') && heading.includes('2') ? 'Build-up 2' : undefined)
        || (heading.includes('build') ? 'Build-up' : undefined)
        || currentLyricSection;
      if (headingMatch[2].trim()) customLyricRows.push({ text: headingMatch[2].trim(), section: currentLyricSection });
      continue;
    }
    customLyricRows.push({ text: line, section: currentLyricSection });
  }
  const generatedLyrics: LyricLine[] = isInstrumental
    ? []
    : customLyricRows.length
      ? customLyricRows.slice(0, 36).map((line, index, rows) => {
        const startTime = Math.round((index / rows.length) * finalDuration);
        const endTime = Math.min(finalDuration, Math.round(((index + 1) / rows.length) * finalDuration));
        return {
          id: `custom-lyric-${index + 1}`,
          section: line.section,
          startTime,
          endTime: Math.max(startTime + 1, endTime),
          text: line.text,
          partIndex: (startTime < part1EndSec ? 1 : startTime < part2EndSec ? 2 : 3) as 1 | 2 | 3,
          words: [],
        };
        })
      : lyrics;

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
  const chordCycle = buildChordCycle(chosenKey, isJazz);

  // Build Chords across all bars
  for (let bar = 0; bar < totalBars; bar += 4) {
    const c = chordCycle[(bar / 4) % chordCycle.length];
    const b = bar * 4;
    chordsProgression.push({ bar: bar + 1, time: b * secPerBeat, chord: c.name, notes: c.notes });
    c.notes.forEach((pitch) => {
      chordsHarmonyNotes.push({ time: b, duration: 15.8, pitch, velocity: 0.65 });
      atmospherePadNotes.push({ time: b, duration: 16.0, pitch, velocity: 0.45 });
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
    const songProgress = bar / totalBars;
    const isBuild = !isAmbient && (
      (songProgress >= sectionLayout.buildOneStart && songProgress < sectionLayout.buildOneEnd)
      || (songProgress >= sectionLayout.buildTwoStart && songProgress < sectionLayout.buildTwoEnd)
    );
    const isDrop = !isAmbient && (
      (songProgress >= sectionLayout.buildOneEnd && songProgress < sectionLayout.dropOneEnd)
      || (songProgress >= sectionLayout.buildTwoEnd && songProgress < sectionLayout.dropTwoEnd)
    );
    const isBreakdown = isAmbient
      ? songProgress >= sectionLayout.introEnd && songProgress < sectionLayout.outroStart
      : songProgress >= sectionLayout.dropOneEnd && songProgress < sectionLayout.breakdownEnd;
    const isIntro = songProgress < sectionLayout.introEnd;
    const isOutro = songProgress >= sectionLayout.outroStart;

    // Root Note for Bass
    const progressionDegree = progressions[Math.floor(bar / 4) % 4];
    const rootSub = scalePitch(chosenKey, progressionDegree, 1);
    const rootMid = scalePitch(chosenKey, progressionDegree, 2);

    // 1. DRUMS (Kick & Snare) + PERCUSSION (Hats, Cymbals, Claps)
    if (isAmbient) {
      if (bar % 8 === 0) percussionCymbalsNotes.push({ time: b, duration: 0.1, pitch: 'hihat_closed', velocity: 0.12 });
    } else if (isIntro) {
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
      } else if (isDnb) {
        drumsKickSnareNotes.push({ time: b, duration: 0.2, pitch: 'kick', velocity: 1.0 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.2, pitch: 'snare', velocity: 0.95 });
        drumsKickSnareNotes.push({ time: b + 2.75, duration: 0.15, pitch: 'kick', velocity: 0.75 });
        for (let step = 0.5; step < 4; step += 0.5) {
          percussionCymbalsNotes.push({ time: b + step, duration: 0.1, pitch: 'hihat_closed', velocity: step % 1 === 0 ? 0.68 : 0.42 });
        }
      } else if (isLofi) {
        drumsKickSnareNotes.push({ time: b, duration: 0.25, pitch: 'kick', velocity: 0.78 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.25, pitch: 'snare', velocity: 0.62 });
        percussionCymbalsNotes.push({ time: b + 1.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.38 });
        percussionCymbalsNotes.push({ time: b + 3.5, duration: 0.1, pitch: 'hihat_open', velocity: 0.32 });
      } else if (isTrap) {
        drumsKickSnareNotes.push({ time: b, duration: 0.25, pitch: 'kick', velocity: 0.9 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.2, pitch: 'snare', velocity: 0.78 });
        drumsKickSnareNotes.push({ time: b + 2.75, duration: 0.2, pitch: 'kick', velocity: 0.7 });
        for (let step = 0.5; step < 4; step += 0.5) {
          percussionCymbalsNotes.push({ time: b + step, duration: 0.08, pitch: 'hihat_closed', velocity: step % 1 === 0 ? 0.55 : 0.38 });
        }
        if (bar % 4 === 3) {
          for (let step = 3; step < 4; step += 0.25) {
            percussionCymbalsNotes.push({ time: b + step, duration: 0.06, pitch: 'hihat_closed', velocity: 0.42 });
          }
        }
      } else if (isHouse) {
        for (let beat = 0; beat < 4; beat++) {
          drumsKickSnareNotes.push({ time: b + beat, duration: 0.25, pitch: 'kick', velocity: beat === 0 ? 0.92 : 0.76 });
        }
        drumsKickSnareNotes.push({ time: b + 1, duration: 0.15, pitch: 'clap', velocity: 0.72 });
        drumsKickSnareNotes.push({ time: b + 3, duration: 0.15, pitch: 'clap', velocity: 0.72 });
        for (let beat = 0.5; beat < 4; beat += 1) {
          percussionCymbalsNotes.push({ time: b + beat, duration: 0.08, pitch: 'hihat_closed', velocity: 0.48 });
        }
      } else if (isCityPop) {
        drumsKickSnareNotes.push({ time: b, duration: 0.25, pitch: 'kick', velocity: 0.82 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.25, pitch: 'kick', velocity: 0.72 });
        drumsKickSnareNotes.push({ time: b + 1, duration: 0.18, pitch: 'snare', velocity: 0.68 });
        drumsKickSnareNotes.push({ time: b + 3, duration: 0.18, pitch: 'clap', velocity: 0.62 });
        for (const beat of [0.5, 1.5, 2.5, 3.5]) {
          percussionCymbalsNotes.push({ time: b + beat, duration: 0.08, pitch: 'hihat_closed', velocity: 0.42 });
        }
      } else if (isFutureBass) {
        drumsKickSnareNotes.push({ time: b, duration: 0.25, pitch: 'kick', velocity: 0.9 });
        drumsKickSnareNotes.push({ time: b + 2, duration: 0.2, pitch: 'snare', velocity: 0.84 });
        percussionCymbalsNotes.push({ time: b + 1, duration: 0.08, pitch: 'hihat_closed', velocity: 0.45 });
        percussionCymbalsNotes.push({ time: b + 2.75, duration: 0.08, pitch: 'hihat_open', velocity: 0.52 });
      } else if (isHyperpop) {
        for (let beat = 0; beat < 4; beat++) {
          drumsKickSnareNotes.push({ time: b + beat, duration: 0.18, pitch: 'kick', velocity: 0.88 });
        }
        drumsKickSnareNotes.push({ time: b + 1, duration: 0.12, pitch: 'clap', velocity: 0.85 });
        drumsKickSnareNotes.push({ time: b + 3, duration: 0.12, pitch: 'snare', velocity: 0.8 });
        for (let step = 0.25; step < 4; step += 0.5) {
          percussionCymbalsNotes.push({ time: b + step, duration: 0.05, pitch: 'hihat_closed', velocity: random() < 0.35 ? 0.7 : 0.38 });
        }
      } else if (isBreakbeat) {
        drumsKickSnareNotes.push({ time: b, duration: 0.24, pitch: 'kick', velocity: 0.9 });
        drumsKickSnareNotes.push({ time: b + 1.5, duration: 0.2, pitch: 'kick', velocity: 0.64 });
        drumsKickSnareNotes.push({ time: b + 2.5, duration: 0.2, pitch: 'snare', velocity: 0.84 });
        percussionCymbalsNotes.push({ time: b + 0.5, duration: 0.08, pitch: 'hihat_closed', velocity: 0.58 });
        percussionCymbalsNotes.push({ time: b + 1.5, duration: 0.08, pitch: 'hihat_open', velocity: 0.5 });
        percussionCymbalsNotes.push({ time: b + 3.5, duration: 0.08, pitch: 'hihat_closed', velocity: 0.46 });
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
    if (isAmbient) {
      if (bar % 8 === 0) subBassNotes.push({ time: b, duration: 15.5, pitch: rootSub, velocity: 0.22 });
    } else if (isDrop && isDubstep) {
      // Subwoofer foundation
      subBassNotes.push({ time: b + 0, duration: 1.8, pitch: rootSub, velocity: 1.0 });
      subBassNotes.push({ time: b + 2, duration: 1.8, pitch: rootSub, velocity: 0.95 });

      // Dark Deep Rolling Bass with modulated LFO wobble
      const selectedWubRate = wubSpeed?.includes('1/16')
        ? (chosenBpm / 60) * 3
        : wubSpeed?.includes('Triplet')
          ? (chosenBpm / 60) * 2.25
          : wubSpeed?.includes('Yoi')
            ? 5.25
            : wubSpeed?.includes('Tearout')
              ? 9
              : wubSpeed?.includes('Acid')
                ? 2.5
                : (chosenBpm / 60) * 1.5;
      const wobble1 = Math.min(14, selectedWubRate * (isPart3 ? 1.6 : 1));
      const wobble2 = Math.min(16, selectedWubRate * (isPart3 ? 2.2 : 2));
      midBassNotes.push({ time: b + 0, duration: 0.9, pitch: rootMid, wobbleRate: wobble1, velocity: 1.0 });
      if (random() < arrangementDensity) midBassNotes.push({ time: b + 1.0, duration: 0.45, pitch: scalePitch(chosenKey, progressionDegree + 2, 2), wobbleRate: wobble2, velocity: 0.9 });
      if (random() < arrangementDensity) midBassNotes.push({ time: b + 1.5, duration: 0.45, pitch: scalePitch(chosenKey, progressionDegree + 4, 1), wobbleRate: selectedWubRate, velocity: 0.85 });
      midBassNotes.push({ time: b + 2.25, duration: 0.65, pitch: rootMid, wobbleRate: wobble1, velocity: 0.95 });
      if (random() < arrangementDensity) midBassNotes.push({ time: b + 3.0, duration: 0.45, pitch: scalePitch(chosenKey, progressionDegree + 1, 1), wobbleRate: Math.min(16, selectedWubRate * 2), velocity: 0.9 });
      if (random() < arrangementDensity) midBassNotes.push({ time: b + 3.5, duration: 0.45, pitch: scalePitch(chosenKey, progressionDegree + 3, 1), wobbleRate: Math.min(18, selectedWubRate * 2.5), velocity: 0.95 });
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
    if (isAmbient) {
      if (bar % 8 === 0) leadSynthNotes.push({ time: b, duration: 6, pitch: scalePitch(chosenKey, melodicMotif[bar % melodicMotif.length], 5), velocity: 0.22 });
    } else if (isDrop) {
      const motifOffset = melodicMotif[(bar * 5 + Math.floor(bar / 4)) % melodicMotif.length];
      const leadPitch = scalePitch(chosenKey, motifOffset + (bar % 4 === 3 ? 7 : 0), 5);
      leadSynthNotes.push({ time: b + 0.5, duration: 0.4, pitch: leadPitch, velocity: 0.95 });
      if (random() < arrangementDensity) leadSynthNotes.push({ time: b + 1.25, duration: 0.3, pitch: scalePitch(chosenKey, melodicMotif[(bar * 3 + 2) % melodicMotif.length], 5), velocity: 0.9 });
      if (random() < arrangementDensity) leadSynthNotes.push({ time: b + 2.5, duration: 0.5, pitch: scalePitch(chosenKey, melodicMotif[(bar * 3 + 4) % melodicMotif.length], 5), velocity: 0.95 });
    } else if (isBuild) {
      leadSynthNotes.push({ time: b + 0, duration: 1.0, pitch: scalePitch(chosenKey, melodicMotif[bar % melodicMotif.length], 4), velocity: 0.85 });
      leadSynthNotes.push({ time: b + 2, duration: 1.0, pitch: scalePitch(chosenKey, melodicMotif[(bar + 2) % melodicMotif.length], 5), velocity: 0.9 });
    } else if (bar >= 8 && bar % 2 === 0) {
      leadSynthNotes.push({ time: b + 0, duration: 0.8, pitch: scalePitch(chosenKey, melodicMotif[bar % melodicMotif.length], 4), velocity: 0.7 });
      leadSynthNotes.push({ time: b + 2, duration: 0.8, pitch: scalePitch(chosenKey, melodicMotif[(bar + 3) % melodicMotif.length], 4), velocity: 0.75 });
    }

    // 4. VOCALS (Lead & Backing Chants)
    if (!isInstrumental && !isAmbient && bar % 8 === 0 && !isIntro && !isOutro) {
      const vPitch = scalePitch(chosenKey, melodicMotif[bar % melodicMotif.length], 5);
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
        pitch: scalePitch(chosenKey, melodicMotif[(bar + 4) % melodicMotif.length], 4),
        vowel: 'u',
        velocity: 0.7,
      });
    }
  }

  // FX Transitions across all 3 parts
  if (isAmbient) {
    fxTransitionsNotes.push({ time: 0, duration: 8.0, pitch: 'riser', velocity: 0.12 });
    fxTransitionsNotes.push({ time: (finalDuration * 0.48) / secPerBeat, duration: 12.0, pitch: 'riser', velocity: 0.1 });
  } else {
    fxTransitionsNotes.push({ time: 0, duration: 3.0, pitch: 'sub_drop', velocity: 0.85 });
    fxTransitionsNotes.push({ time: (part1EndSec - 6) / secPerBeat, duration: 4.0, pitch: 'riser', velocity: 0.9 });
    fxTransitionsNotes.push({ time: part1EndSec / secPerBeat, duration: 1.0, pitch: 'crash', velocity: 1.0 });
    fxTransitionsNotes.push({ time: (part2EndSec - 8) / secPerBeat, duration: 4.0, pitch: 'riser', velocity: 0.95 });
    fxTransitionsNotes.push({ time: part2EndSec / secPerBeat, duration: 1.0, pitch: 'crash', velocity: 1.0 });
    fxTransitionsNotes.push({ time: (finalDuration - 8) / secPerBeat, duration: 4.0, pitch: 'sub_drop', velocity: 0.85 });
  }

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
      muted: isInstrumental,
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
      muted: isInstrumental,
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

  for (const legacyStem of ['vocals', 'lead', 'chords', 'bass', 'drums', 'fx']) {
    stems[legacyStem].muted = true;
  }

  const coreStemByFamily: Record<string, string> = {
    sub_bass: 'sub_bass',
    rolling_wubs: 'mid_bass',
    heavy_drums: 'drums_kick_snare',
    percussion: 'percussion_cymbals',
    leads: 'lead_synth',
    chords: 'chords_harmony',
    atmosphere: 'atmosphere_pad',
    vocals: 'lead_vocals',
    buildups: 'fx_transitions',
    drops_fx: 'fx_transitions',
  };
  for (const family of new Set(STEM_LIBRARY_100.filter((stem) => selectedStemIds.has(stem.id)).map((stem) => stem.family))) {
    const primaryStem = coreStemByFamily[family];
    if (primaryStem) stems[primaryStem].muted = true;
  }

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

      const fxFamily = def.family === 'buildups' || def.family === 'drops_fx';
      const familyMembers = STEM_LIBRARY_100.filter((stem) =>
        fxFamily
          ? (stem.family === 'buildups' || stem.family === 'drops_fx') && selectedStemIds.has(stem.id)
          : stem.family === def.family && selectedStemIds.has(stem.id)
      );
      const selectedIndex = familyMembers.findIndex((stem) => stem.id === def.id);
      const stemNotes = selectedIndex < 0
        ? selectedStemIds.size && familyMembers.length
          ? []
          : sourceNotes
        : sourceNotes.filter((_, noteIndex) => noteIndex % familyMembers.length === selectedIndex);

      stems[def.id] = {
        id: def.id,
        name: def.name,
        type: def.id,
        instrument: def.instrument,
        color: def.color,
        volume: def.defaultVolume,
        pan: def.defaultPan,
        muted: selectedIndex < 0,
        solo: false,
        notes: stemNotes,
      };
    }
  }

  return {
    id: `diffrhythm-${Date.now()}`,
    title: prompt.length > 40 ? `${prompt.slice(0, 36).trim()}...` : prompt || 'DiffRhythm 100-Stage Masterpiece',
    prompt,
    genre: chosenGenre,
    subGenres: [chosenGenre, chosenMood, '3-Minute Full Mix', `${stages.length}-Stage Arrangement`, '100-Stem Sound Library'],
    bpm: chosenBpm,
    key: chosenKey,
    scale: chosenKey.toLowerCase().includes('major') ? 'major' as const : 'minor' as const,
    timeSignature: '4/4' as const,
    durationSec: finalDuration,
    vocalStyle: chosenVocal,
    mood: chosenMood,
    acousticProfile: {
      energy: isAmbient ? 0.28 : isLofi ? 0.44 : isDubstep || isDnb || isHyperpop ? 0.92 : isBright ? 0.88 : 0.72,
      danceability: isAmbient ? 0.18 : isHouse || isCityPop ? 0.88 : isDnb || isTrap ? 0.82 : 0.68,
      valence: isDark ? 0.28 : isBright ? 0.84 : isLofi ? 0.48 : 0.62,
      acousticness: isAmbient || isJazz ? 0.42 : isLofi ? 0.34 : 0.08,
      spaceReverb: isAmbient ? 0.82 : isLofi || isJazz ? 0.48 : 0.3,
    },
    synthesisMeta: {
      seed: compositionSeed,
      model: 'Procedural Web Audio synthesizer',
      generatedAt: new Date().toISOString(),
      compositionMethod: 'procedural-composition' as const,
    },
    parts,
    stages,
    comprehension,
    variance,
    motifSignature: melodicMotif.map((degree) => scalePitch(chosenKey, degree, 5)),
    chordsProgression,
    lyrics: generatedLyrics,
    stems,
  };
}

// 1. API: Real-Time English & Music Comprehension Analyzer
app.post('/api/analyze-prompt', (req, res) => {
  const { prompt, variance, bpm, key, genre } = req.body;
  const analysis = analyzeMusicComprehension(prompt || '', { variance, bpm, key, genre });
  res.json(analysis);
});

app.get('/api/youtube/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (query.length < 2) return res.status(400).json({ error: 'Enter at least two search characters.' });
  if (!process.env.YOUTUBE_API_KEY) {
    return res.status(503).json({ error: 'YouTube search is not configured. Set YOUTUBE_API_KEY on the server.' });
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.search = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      safeSearch: 'moderate',
      q: query,
      key: process.env.YOUTUBE_API_KEY,
    }).toString();
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: payload.error?.message || 'YouTube search failed.' });
    }

    const results = (payload.items || []).map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title || 'Untitled video',
      channelTitle: item.snippet?.channelTitle || 'Unknown channel',
      publishedAt: item.snippet?.publishedAt || '',
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    })).filter((item: any) => item.videoId);
    return res.json({ results });
  } catch {
    return res.status(502).json({ error: 'Could not connect to YouTube search.' });
  }
});

app.post('/api/youtube/analyze', async (req, res) => {
  const videoId = typeof req.body.videoId === 'string' ? req.body.videoId.trim() : '';
  if (!/^[\w-]{11}$/.test(videoId)) return res.status(400).json({ error: 'A valid YouTube video ID is required.' });
  if (!process.env.YOUTUBE_API_KEY) {
    return res.status(503).json({ error: 'YouTube reference analysis is not configured. Set YOUTUBE_API_KEY on the server.' });
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.search = new URLSearchParams({
      part: 'snippet',
      id: videoId,
      key: process.env.YOUTUBE_API_KEY,
    }).toString();
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: payload.error?.message || 'YouTube metadata lookup failed.' });
    }
    const video = payload.items?.[0];
    if (!video) return res.status(404).json({ error: 'That video is unavailable.' });

    const snippet = video.snippet || {};
    const metadataText = `${snippet.title || ''} ${(snippet.tags || []).join(' ')} ${snippet.description || ''}`
      .slice(0, 12000)
      .toLowerCase();
    const genre = [
      'drum and bass', 'drum & bass', 'dnb', 'dubstep', 'synthwave', 'techno',
      'house', 'hip hop', 'hip-hop', 'ambient', 'jazz', 'metal', 'pop', 'orchestral',
    ].find((candidate) => metadataText.includes(candidate)) || 'Unclassified';
    const moodCues = ['dark', 'uplifting', 'melancholic', 'aggressive', 'dreamy', 'energetic', 'cinematic', 'relaxed']
      .filter((cue) => metadataText.includes(cue));
    const productionCues = [
      'analog synthesizer', 'synthesizer', 'synth', 'live drums', '808', 'breakbeat',
      'orchestral', 'acoustic guitar', 'electric guitar', 'piano', 'strings', 'distorted bass',
    ].filter((cue) => metadataText.includes(cue));
    const bpmMatch = metadataText.match(/\b(4[0-9]|[5-9][0-9]|1[0-9]{2}|200)\s*(?:bpm|beats per minute)\b/);
    const keyMatch = metadataText.match(/\b([a-g](?:#|b)?)\s*(major|minor)\b/i);
    const bpm = bpmMatch ? Number(bpmMatch[1]) : undefined;
    const key = keyMatch ? `${keyMatch[1].toUpperCase()} ${keyMatch[2][0].toUpperCase()}${keyMatch[2].slice(1).toLowerCase()}` : undefined;
    const styleNotes = [
      `Genre cue: ${genre}.`,
      moodCues.length ? `Mood cues: ${moodCues.join(', ')}.` : '',
      productionCues.length ? `Production cues: ${productionCues.join(', ')}.` : '',
      bpm ? `Metadata-declared tempo: ${bpm} BPM.` : '',
      key ? `Metadata-declared key: ${key}.` : '',
      'Use only these broad metadata cues as inspiration; create original harmony, melody, rhythm, and lyrics.',
    ].filter(Boolean).join(' ');

    return res.json({
      reference: {
        videoId,
        title: snippet.title || 'Untitled video',
        channelTitle: snippet.channelTitle || 'Unknown channel',
        publishedAt: snippet.publishedAt || '',
        thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        genre,
        bpm,
        key,
        moodCues,
        productionCues,
        styleNotes,
        influence: 0.5,
        addedAt: new Date().toISOString(),
      },
    });
  } catch {
    return res.status(502).json({ error: 'Could not analyze YouTube video metadata.' });
  }
});

app.post('/api/enhance-prompt', (req, res) => {
  const { prompt, genre, mood, bpm, key, vocalStyle, selectedStems } = req.body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A prompt is required' });
  }

  const productionDetails = [
    genre,
    bpm ? `${bpm} BPM` : undefined,
    key ? `key of ${key}` : undefined,
    vocalStyle ? `${vocalStyle} vocals` : undefined,
    mood,
  ].filter(Boolean);
  const selectedStemNames = Array.isArray(selectedStems)
    ? selectedStems
        .map((id: string) => STEM_LIBRARY_100.find((stem) => stem.id === id)?.name)
        .filter(Boolean)
    : [];

  const enhancedPrompt = [
    prompt.trim(),
    productionDetails.length ? `Production direction: ${productionDetails.join(', ')}.` : '',
    selectedStemNames.length ? `Featured sound design: ${selectedStemNames.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  res.json({ enhancedPrompt });
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
      customLyrics,
      durationSec,
      variance,
      wubSpeed,
      selectedStems,
      buildDropDensity,
      referenceNotes,
      recentMotifs,
    } = req.body;

    // Minimum 180 seconds (3 full minutes!)
    const targetDurationSec = Math.max(180, Number(durationSec) || 199);

    if (!prompt && !customLyrics) {
      return res.status(400).json({ error: 'Prompt or lyrics required' });
    }
    const safeReferenceNotes = typeof referenceNotes === 'string' ? referenceNotes.slice(0, 5000) : '';
    const generationPrompt = [prompt, safeReferenceNotes]
      .filter((value) => typeof value === 'string' && value.trim())
      .join('\n\nProduction reference notes:\n');
    const safeSelectedStems = Array.isArray(selectedStems)
      ? selectedStems.filter((id: unknown) => typeof id === 'string' && STEM_LIBRARY_100.some((stem) => stem.id === id))
      : [];
    const safeRecentMotifs = Array.isArray(recentMotifs)
      ? recentMotifs.slice(0, 8)
          .map((motif: unknown) => Array.isArray(motif) ? motif.slice(0, 8).filter((note: unknown) => typeof note === 'string').map(String) : [])
          .filter((motif: string[]) => motif.length === 8)
      : [];
    const stageDensity = Math.max(20, Math.min(100, Number(buildDropDensity) || 100));

    // The procedural engine remains the actual audio generator; Gemini only augments composition metadata.
    if (!process.env.GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY provided; generating with the procedural composition engine.');
      const fullSong = generate100StageSong(
        generationPrompt,
        genre,
        mood,
        bpm,
        key,
        vocalStyle,
        instruments,
        customLyrics,
        targetDurationSec,
        variance ?? 0.85,
        wubSpeed,
        stageDensity,
        safeSelectedStems,
        safeRecentMotifs
      );
      return res.json(fullSong);
    }

    const systemPrompt = `You are a music arrangement assistant. Return a concise, valid JSON composition brief for a procedural synthesizer.
Describe a coherent full-length musical architecture with section changes, builds, drops, breakdowns, and original lyrical ideas.
Your knowledge is deeply grounded in underground dubstep sound system culture, Deep Dark & Dangerous (DDD / TRUTH), Trench / Minimal Flow (Infekt / Getter), UK Dubplate (DMZ / Mala / Coki), Tearout (Marauda), and Leftfield Halftime (Alix Perez / 1985).

COMPOSITION REQUIREMENTS:
The song durationSec MUST be at least 180 seconds (3 minutes) up to 240 seconds.
Use the requested arrangement density and genre to plan section contrast, builds, drops, and breakdowns.

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

    const userMessage = `Create a full-length musical composition brief (Duration: ${targetDurationSec}s) from this prompt:
Prompt: "${prompt}"
Metadata-derived reference direction: "${safeReferenceNotes || 'None'}"
Target Duration: ${targetDurationSec} seconds (minimum 180s / 3 minutes)
Genre preference: ${genre || 'Auto-detect'}
Mood preference: ${mood || 'Auto-detect'}
Tempo (BPM): ${bpm || (prompt.toLowerCase().includes('dubstep') ? 140 : 'Auto-detect')}
Key: ${key || 'Auto-detect'}
Vocal Style: ${vocalStyle || 'Auto-detect'}
Preferred Instruments: ${instruments ? instruments.join(', ') : 'Auto-select from 100-stem matrix'}
Selected Sound Design Stems: ${safeSelectedStems.map((id: string) => STEM_LIBRARY_100.find((stem) => stem.id === id)?.name).filter(Boolean).join(', ') || 'Auto-select from matrix'}
Arrangement density: ${stageDensity} out of 100.
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

      // Gemini supplies text metadata; the procedural engine remains responsible for all audio.
      const baseSong = generate100StageSong(
        generationPrompt,
        parsed.genre || genre,
        parsed.mood || mood,
        Number(parsed.bpm) || bpm,
        parsed.key || key,
        parsed.vocalStyle || vocalStyle,
        instruments,
        customLyrics,
        Math.max(180, Number(parsed.durationSec) || targetDurationSec),
        variance ?? 0.85,
        wubSpeed,
        stageDensity,
        safeSelectedStems,
        safeRecentMotifs
      );

      // Overlay Gemini's custom title, lyrics, chords, and metadata
      if (parsed.title) baseSong.title = parsed.title;
      if (Array.isArray(parsed.subGenres)) baseSong.subGenres = parsed.subGenres;
      if (!customLyrics?.trim() && Array.isArray(parsed.lyrics) && parsed.lyrics.length >= 6) {
        baseSong.lyrics = parsed.lyrics.map((l: any, idx: number) => ({
          ...l,
          id: `l_${idx + 1}`,
          partIndex: (idx < 3 ? 1 : idx < 6 ? 2 : 3) as 1 | 2 | 3,
        }));
      }
      if (Array.isArray(parsed.chordsProgression) && parsed.chordsProgression.length > 0) {
        baseSong.chordsProgression = parsed.chordsProgression;
      }
      return res.json(baseSong);
    } catch (genErr) {
      console.warn('Gemini composition metadata unavailable; using procedural composition:', genErr);
      const fullSong = generate100StageSong(
        generationPrompt,
        genre,
        mood,
        bpm,
        key,
        vocalStyle,
        instruments,
        customLyrics,
        targetDurationSec,
        variance ?? 0.85,
        wubSpeed,
        stageDensity,
        safeSelectedStems,
        safeRecentMotifs
      );
      return res.json(fullSong);
    }
  } catch (err: any) {
    console.error('Song generation error:', err);
    const fallback = generate100StageSong(
      [req.body.prompt, req.body.referenceNotes].filter(Boolean).join('\n\n') || 'Dark Deep Rolling Bass Dubstep',
      req.body.genre,
      req.body.mood,
      req.body.bpm,
      req.body.key,
      req.body.vocalStyle,
      req.body.instruments,
      req.body.customLyrics,
      199,
      req.body.variance ?? 0.85,
      req.body.wubSpeed,
      req.body.buildDropDensity ?? 100,
      Array.isArray(req.body.selectedStems) ? req.body.selectedStems : [],
      Array.isArray(req.body.recentMotifs) ? req.body.recentMotifs : []
    );
    return res.json(fallback);
  }
});

// 3. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    model: 'Procedural Web Audio synthesizer',
    stageEngine: 'Seeded key-aware arrangement',
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
