/**
 * Curated DiffRhythm 2 Full-Stack Song Presets
 * Fully composed 3+ minute full-length compositions with 6 multi-track stems, chords, and timed lyrics.
 */

import { Song, NoteEvent, LyricLine } from '../types/music';
import { generate100Stages, analyzeMusicComprehension, STEM_LIBRARY_100 } from './stemLibrary100';

// --- Flagship 3+ Minute Dark Deep Rolling Bass Dubstep Generator ---
function createAbyssalDubstepSong(): Song {
  const bpm = 140;
  const secPerBeat = 60 / bpm; // ~0.42857 sec
  const totalBars = 116;
  const durationSec = Math.round(totalBars * 4 * secPerBeat); // ~199 seconds (3 minutes 19 seconds)

  const lyrics: LyricLine[] = [
    {
      id: 'd_l1',
      section: 'Intro',
      startTime: 3.4,
      endTime: 18.0,
      text: 'Descent into the deep... shadows awake beneath the trench.',
      words: [
        { word: 'Descent', start: 3.4, end: 4.8 },
        { word: 'into', start: 4.8, end: 5.6 },
        { word: 'the', start: 5.6, end: 6.0 },
        { word: 'deep...', start: 6.0, end: 8.5 },
        { word: 'shadows', start: 10.0, end: 11.5 },
        { word: 'awake', start: 11.5, end: 13.0 },
        { word: 'beneath', start: 13.0, end: 14.5 },
        { word: 'the', start: 14.5, end: 15.0 },
        { word: 'trench.', start: 15.0, end: 18.0 },
      ],
    },
    {
      id: 'd_l2',
      section: 'Verse 1',
      startTime: 24.0,
      endTime: 44.0,
      text: 'Fourteen thousand fathoms down, can you feel the sub pressure?',
      words: [
        { word: 'Fourteen', start: 24.0, end: 25.5 },
        { word: 'thousand', start: 25.5, end: 27.0 },
        { word: 'fathoms', start: 27.0, end: 29.0 },
        { word: 'down,', start: 29.0, end: 32.0 },
        { word: 'can', start: 34.0, end: 35.0 },
        { word: 'you', start: 35.0, end: 35.8 },
        { word: 'feel', start: 35.8, end: 37.5 },
        { word: 'the', start: 37.5, end: 38.2 },
        { word: 'sub', start: 38.2, end: 40.0 },
        { word: 'pressure?', start: 40.0, end: 44.0 },
      ],
    },
    {
      id: 'd_l3',
      section: 'Build-up',
      startTime: 48.0,
      endTime: 62.0,
      text: 'Pressure rising... frequencies align... prepare for the drop!',
      words: [
        { word: 'Pressure', start: 48.0, end: 50.0 },
        { word: 'rising...', start: 50.0, end: 52.5 },
        { word: 'frequencies', start: 53.0, end: 55.5 },
        { word: 'align...', start: 55.5, end: 57.5 },
        { word: 'prepare', start: 58.0, end: 59.5 },
        { word: 'for', start: 59.5, end: 60.0 },
        { word: 'the', start: 60.0, end: 60.6 },
        { word: 'drop!', start: 60.6, end: 62.0 },
      ],
    },
    {
      id: 'd_l4',
      section: 'Drop 1',
      startTime: 64.0,
      endTime: 94.0,
      text: 'DARK DEEP ROLLING BASS! TEAR THE SUB FREQUENCIES APART!',
      words: [
        { word: 'DARK', start: 64.0, end: 66.0 },
        { word: 'DEEP', start: 66.0, end: 68.0 },
        { word: 'ROLLING', start: 68.0, end: 72.0 },
        { word: 'BASS!', start: 72.0, end: 76.0 },
        { word: 'TEAR', start: 78.0, end: 81.0 },
        { word: 'THE', start: 81.0, end: 82.5 },
        { word: 'SUB', start: 82.5, end: 85.0 },
        { word: 'FREQUENCIES', start: 85.0, end: 89.0 },
        { word: 'APART!', start: 89.0, end: 94.0 },
      ],
    },
    {
      id: 'd_l5',
      section: 'Breakdown',
      startTime: 96.0,
      endTime: 122.0,
      text: 'Into the silence of the abyss, the echoes slowly drift...',
      words: [
        { word: 'Into', start: 96.0, end: 98.0 },
        { word: 'the', start: 98.0, end: 99.0 },
        { word: 'silence', start: 99.0, end: 102.5 },
        { word: 'of', start: 102.5, end: 103.5 },
        { word: 'the', start: 103.5, end: 104.5 },
        { word: 'abyss,', start: 104.5, end: 109.0 },
        { word: 'the', start: 111.0, end: 112.0 },
        { word: 'echoes', start: 112.0, end: 115.0 },
        { word: 'slowly', start: 115.0, end: 118.0 },
        { word: 'drift...', start: 118.0, end: 122.0 },
      ],
    },
    {
      id: 'd_l6',
      section: 'Verse 2',
      startTime: 124.0,
      endTime: 140.0,
      text: 'Signal detected from the darkness below...',
      words: [
        { word: 'Signal', start: 124.0, end: 126.5 },
        { word: 'detected', start: 126.5, end: 130.0 },
        { word: 'from', start: 130.0, end: 131.5 },
        { word: 'the', start: 131.5, end: 132.5 },
        { word: 'darkness', start: 132.5, end: 136.0 },
        { word: 'below...', start: 136.0, end: 140.0 },
      ],
    },
    {
      id: 'd_l7',
      section: 'Build-up 2',
      startTime: 140.0,
      endTime: 156.0,
      text: 'Second wave incoming... 140 BPM... SUBSONIC OVERLOAD!',
      words: [
        { word: 'Second', start: 140.0, end: 142.5 },
        { word: 'wave', start: 142.5, end: 144.5 },
        { word: 'incoming...', start: 144.5, end: 147.5 },
        { word: '140', start: 148.0, end: 150.0 },
        { word: 'BPM...', start: 150.0, end: 152.0 },
        { word: 'SUBSONIC', start: 152.0, end: 154.5 },
        { word: 'OVERLOAD!', start: 154.5, end: 156.0 },
      ],
    },
    {
      id: 'd_l8',
      section: 'Drop 2',
      startTime: 156.0,
      endTime: 188.0,
      text: 'MAXIMUM DEEP ROLLING BASS! FEEL THE EARTHQUAKE!',
      words: [
        { word: 'MAXIMUM', start: 156.0, end: 159.0 },
        { word: 'DEEP', start: 159.0, end: 162.0 },
        { word: 'ROLLING', start: 162.0, end: 166.0 },
        { word: 'BASS!', start: 166.0, end: 171.0 },
        { word: 'FEEL', start: 173.0, end: 176.0 },
        { word: 'THE', start: 176.0, end: 178.0 },
        { word: 'EARTHQUAKE!', start: 178.0, end: 188.0 },
      ],
    },
    {
      id: 'd_l9',
      section: 'Outro',
      startTime: 188.0,
      endTime: 199.0,
      text: 'Sub frequencies dissipating into the dark...',
      words: [
        { word: 'Sub', start: 188.0, end: 189.5 },
        { word: 'frequencies', start: 189.5, end: 192.5 },
        { word: 'dissipating', start: 192.5, end: 195.5 },
        { word: 'into', start: 195.5, end: 197.0 },
        { word: 'the', start: 197.0, end: 197.5 },
        { word: 'dark...', start: 197.5, end: 199.0 },
      ],
    },
  ];

  // --- Generate 3+ Minute Drum Pattern (Half-time Dubstep) ---
  const drumNotes: NoteEvent[] = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const b = bar * 4;
    const isIntro = bar < 14;
    const isBuild1 = bar >= 28 && bar < 37;
    const isDrop1 = bar >= 37 && bar < 56;
    const isBreakdown = bar >= 56 && bar < 72;
    const isVerse2 = bar >= 72 && bar < 82;
    const isBuild2 = bar >= 82 && bar < 92;
    const isDrop2 = bar >= 92 && bar < 110;
    const isOutro = bar >= 110;

    if (isIntro) {
      // Atmospheric rimshots & occasional closed hat
      if (bar % 2 === 1) {
        drumNotes.push({ time: b + 2, duration: 0.1, pitch: 'hihat_closed', velocity: 0.5 });
      }
      if (bar >= 8 && bar % 2 === 0) {
        drumNotes.push({ time: b + 0, duration: 0.2, pitch: 'dubstep_kick', velocity: 0.7 });
      }
    } else if (isBuild1 || isBuild2) {
      // Escalating Snare Roll for build-up
      const stepSpeed = bar % 4 === 3 ? 0.25 : 0.5; // accelerates to 16ths
      for (let t = 0; t < 4; t += stepSpeed) {
        const vel = 0.5 + (t / 4) * 0.45;
        drumNotes.push({ time: b + t, duration: 0.1, pitch: 'snare', velocity: vel });
      }
      // Kick on 1 and 3
      drumNotes.push({ time: b + 0, duration: 0.2, pitch: 'dubstep_kick', velocity: 0.9 });
      drumNotes.push({ time: b + 2, duration: 0.2, pitch: 'dubstep_kick', velocity: 0.85 });
    } else if (isDrop1 || isDrop2) {
      // --- HEAVY 140 DUBSTEP HALF-TIME GROOVE ---
      // Beat 1: Heavy sub kick
      drumNotes.push({ time: b + 0, duration: 0.35, pitch: 'dubstep_kick', velocity: 1.0 });
      // Syncopated secondary kick
      if (bar % 2 === 1) {
        drumNotes.push({ time: b + 1.5, duration: 0.25, pitch: 'dubstep_kick', velocity: 0.85 });
      } else {
        drumNotes.push({ time: b + 2.5, duration: 0.25, pitch: 'dubstep_kick', velocity: 0.9 });
      }
      // Beat 3: Massive gunshot snare
      drumNotes.push({ time: b + 2, duration: 0.3, pitch: 'dubstep_snare', velocity: 1.0 });
      drumNotes.push({ time: b + 2, duration: 0.15, pitch: 'clap', velocity: 0.75 });

      // Sizzling metallic Hi-Hats with rolling triplets
      drumNotes.push({ time: b + 0, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
      drumNotes.push({ time: b + 0.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.8 });
      drumNotes.push({ time: b + 1.0, duration: 0.1, pitch: 'hihat_open', velocity: 0.85 });
      drumNotes.push({ time: b + 1.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
      drumNotes.push({ time: b + 2.0, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 });
      drumNotes.push({ time: b + 2.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.8 });
      drumNotes.push({ time: b + 3.0, duration: 0.1, pitch: 'hihat_open', velocity: 0.9 });
      drumNotes.push({ time: b + 3.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.85 });

      // Crash on start of drop phrases
      if (bar % 8 === 0) {
        drumNotes.push({ time: b + 0, duration: 1.5, pitch: 'crash', velocity: 1.0 });
      }
    } else if (isBreakdown) {
      // Sparse sub kick & gentle closed hats
      if (bar % 4 === 0) {
        drumNotes.push({ time: b + 0, duration: 0.3, pitch: 'dubstep_kick', velocity: 0.75 });
      }
      drumNotes.push({ time: b + 2, duration: 0.1, pitch: 'hihat_closed', velocity: 0.5 });
    } else if (isVerse2) {
      // Verse 2 half-time groove with ghost notes
      drumNotes.push({ time: b + 0, duration: 0.25, pitch: 'dubstep_kick', velocity: 0.9 });
      drumNotes.push({ time: b + 2, duration: 0.25, pitch: 'dubstep_snare', velocity: 0.85 });
      drumNotes.push({ time: b + 1, duration: 0.1, pitch: 'hihat_closed', velocity: 0.65 });
      drumNotes.push({ time: b + 3, duration: 0.1, pitch: 'hihat_open', velocity: 0.75 });
    } else if (isOutro) {
      // Echoing kick on 1
      if (bar % 2 === 0) {
        drumNotes.push({ time: b + 0, duration: 0.4, pitch: 'dubstep_kick', velocity: 0.7 });
      }
    }
  }

  // --- Generate 3+ Minute Dark Deep Rolling Bassline ---
  const bassNotes: NoteEvent[] = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const b = bar * 4;
    const isIntro = bar < 14;
    const isBuild1 = bar >= 28 && bar < 37;
    const isDrop1 = bar >= 37 && bar < 56;
    const isBreakdown = bar >= 56 && bar < 72;
    const isVerse2 = bar >= 72 && bar < 82;
    const isBuild2 = bar >= 82 && bar < 92;
    const isDrop2 = bar >= 92 && bar < 110;
    const isOutro = bar >= 110;

    if (isIntro) {
      // Sustained sub drone at D1 (36.7Hz)
      if (bar % 4 === 0) {
        bassNotes.push({ time: b, duration: 3.8, pitch: 'D1', wobbleRate: 1.5, velocity: 0.75 });
      }
    } else if (bar >= 14 && bar < 28) {
      // Verse 1 deep rolling pulses (D1, F1, G1, D1)
      const root = bar % 4 === 1 ? 'F1' : bar % 4 === 2 ? 'G1' : bar % 4 === 3 ? 'A#1' : 'D1';
      bassNotes.push({ time: b + 0, duration: 1.2, pitch: root, wobbleRate: 3.5, velocity: 0.85 });
      bassNotes.push({ time: b + 1.5, duration: 0.8, pitch: root, wobbleRate: 4.5, velocity: 0.8 });
      bassNotes.push({ time: b + 2.5, duration: 1.2, pitch: root, wobbleRate: 3.5, velocity: 0.85 });
    } else if (isBuild1 || isBuild2) {
      // Rising pitch tension bass
      const root = bar % 2 === 0 ? 'D1' : 'F1';
      bassNotes.push({ time: b + 0, duration: 1.8, pitch: root, wobbleRate: 6.0, velocity: 0.9 });
      bassNotes.push({ time: b + 2, duration: 1.8, pitch: 'A1', wobbleRate: 8.0, velocity: 0.95 });
    } else if (isDrop1 || isDrop2) {
      // --- MAXIMUM DARK DEEP ROLLING BASS (DUBSTEP DROP) ---
      // Heavy 1/8 note rolling wobble patterns that hit low D1 (36Hz) & D2 (73Hz)
      const basePitch = isDrop2 && bar % 2 === 1 ? 'F1' : 'D1';
      // 1. Heavy downbeat sub impact
      bassNotes.push({
        time: b + 0,
        duration: 0.9,
        pitch: basePitch,
        wobbleRate: 3.5, // 1/8 note rolling LFO
        velocity: 1.0,
      });
      // 2. Rolling triplet bounce
      bassNotes.push({
        time: b + 1.0,
        duration: 0.45,
        pitch: 'D2',
        wobbleRate: 7.0, // fast 1/16 wobble
        velocity: 0.9,
      });
      // 3. Sub drop sweep
      bassNotes.push({
        time: b + 1.5,
        duration: 0.45,
        pitch: 'C1',
        wobbleRate: 4.5,
        velocity: 0.85,
      });
      // 4. Heavy backbeat anchor after snare
      bassNotes.push({
        time: b + 2.25,
        duration: 0.65,
        pitch: basePitch,
        wobbleRate: 3.5,
        velocity: 0.95,
      });
      // 5. Rolling neuro stutter fill
      bassNotes.push({
        time: b + 3.0,
        duration: 0.45,
        pitch: 'F1',
        wobbleRate: 9.0, // intense wobble rate
        velocity: 0.9,
      });
      bassNotes.push({
        time: b + 3.5,
        duration: 0.45,
        pitch: 'G#1',
        wobbleRate: 11.0,
        velocity: 0.95,
      });
    } else if (isBreakdown) {
      // Warm deep sub drone
      if (bar % 4 === 0) {
        bassNotes.push({ time: b, duration: 3.8, pitch: 'D1', wobbleRate: 1.2, velocity: 0.7 });
      }
    } else if (isVerse2) {
      bassNotes.push({ time: b + 0, duration: 1.8, pitch: 'D1', wobbleRate: 3.5, velocity: 0.85 });
      bassNotes.push({ time: b + 2, duration: 1.8, pitch: 'F1', wobbleRate: 4.5, velocity: 0.85 });
    } else if (isOutro) {
      if (bar % 2 === 0) {
        bassNotes.push({ time: b, duration: 3.5, pitch: 'D1', wobbleRate: 1.0, velocity: 0.6 });
      }
    }
  }

  // --- Lead Synth & FX Stabs across 3+ minutes ---
  const leadNotes: NoteEvent[] = [];
  for (let bar = 0; bar < totalBars; bar++) {
    const b = bar * 4;
    const isDrop = (bar >= 37 && bar < 56) || (bar >= 92 && bar < 110);
    const isBuild = (bar >= 28 && bar < 37) || (bar >= 82 && bar < 92);
    const isIntro = bar < 14;

    if (isIntro && bar >= 4) {
      // Eerie dark minor arpeggio
      leadNotes.push({ time: b + 0, duration: 0.5, pitch: 'D4', velocity: 0.7 });
      leadNotes.push({ time: b + 1, duration: 0.5, pitch: 'F4', velocity: 0.7 });
      leadNotes.push({ time: b + 2, duration: 0.5, pitch: 'A4', velocity: 0.75 });
      leadNotes.push({ time: b + 3, duration: 0.5, pitch: 'D5', velocity: 0.8 });
    } else if (isBuild) {
      // Siren rising hook
      leadNotes.push({ time: b + 0, duration: 1.0, pitch: 'D5', velocity: 0.85 });
      leadNotes.push({ time: b + 2, duration: 1.0, pitch: 'F5', velocity: 0.9 });
    } else if (isDrop) {
      // Dubstep laser synth & syncopated hook
      leadNotes.push({ time: b + 0.5, duration: 0.4, pitch: 'D5', velocity: 0.95 });
      leadNotes.push({ time: b + 1.25, duration: 0.3, pitch: 'F5', velocity: 0.9 });
      leadNotes.push({ time: b + 2.5, duration: 0.5, pitch: 'G#5', velocity: 0.95 });
      leadNotes.push({ time: b + 3.25, duration: 0.4, pitch: 'A5', velocity: 1.0 });
    }
  }

  // --- Pad / Chords across 3+ minutes ---
  const chordNotes: NoteEvent[] = [];
  const chordsProgression = [
    { bar: 1, time: 0, chord: 'Dm', notes: ['D3', 'F3', 'A3'] },
    { bar: 5, time: 6.85, chord: 'Bb', notes: ['Bb2', 'D3', 'F3'] },
    { bar: 9, time: 13.71, chord: 'Gm', notes: ['G2', 'Bb2', 'D3'] },
    { bar: 13, time: 20.57, chord: 'A', notes: ['A2', 'C#3', 'E3'] },
  ];

  for (let bar = 0; bar < totalBars; bar += 4) {
    const b = bar * 4;
    chordNotes.push({ time: b + 0, duration: 4.0, pitch: 'D3', velocity: 0.65 });
    chordNotes.push({ time: b + 0, duration: 4.0, pitch: 'F3', velocity: 0.65 });
    chordNotes.push({ time: b + 0, duration: 4.0, pitch: 'A3', velocity: 0.65 });

    chordNotes.push({ time: b + 4, duration: 4.0, pitch: 'Bb2', velocity: 0.65 });
    chordNotes.push({ time: b + 4, duration: 4.0, pitch: 'D3', velocity: 0.65 });
    chordNotes.push({ time: b + 4, duration: 4.0, pitch: 'F3', velocity: 0.65 });

    chordNotes.push({ time: b + 8, duration: 4.0, pitch: 'G2', velocity: 0.65 });
    chordNotes.push({ time: b + 8, duration: 4.0, pitch: 'Bb2', velocity: 0.65 });
    chordNotes.push({ time: b + 8, duration: 4.0, pitch: 'D3', velocity: 0.65 });

    chordNotes.push({ time: b + 12, duration: 4.0, pitch: 'A2', velocity: 0.65 });
    chordNotes.push({ time: b + 12, duration: 4.0, pitch: 'C#3', velocity: 0.65 });
    chordNotes.push({ time: b + 12, duration: 4.0, pitch: 'E3', velocity: 0.65 });
  }

  // --- FX Stems (risers, crashes, sub drops) across 3+ minutes ---
  const fxNotes: NoteEvent[] = [
    { time: 0, duration: 3.0, pitch: 'sub_drop', velocity: 0.8 },
    { time: 26 * 4, duration: 2.0, pitch: 'riser', velocity: 0.85 },
    { time: 37 * 4, duration: 0.5, pitch: 'crash', velocity: 1.0 },
    { time: 55 * 4, duration: 2.0, pitch: 'sub_drop', velocity: 0.85 },
    { time: 80 * 4, duration: 2.5, pitch: 'riser', velocity: 0.9 },
    { time: 92 * 4, duration: 0.5, pitch: 'crash', velocity: 1.0 },
    { time: 109 * 4, duration: 3.0, pitch: 'sub_drop', velocity: 0.8 },
  ];

  // --- Vocals Stem ---
  const vocalNotes: NoteEvent[] = [
    // Intro
    { time: 8, duration: 2.0, pitch: 'D4', vowel: 'e', velocity: 0.8, lyricSnippet: 'Descent' },
    { time: 14, duration: 2.5, pitch: 'F4', vowel: 'i', velocity: 0.8, lyricSnippet: 'deep' },
    // Verse 1
    { time: 56, duration: 2.0, pitch: 'D4', vowel: 'u', velocity: 0.85, lyricSnippet: 'Fourteen' },
    { time: 64, duration: 2.5, pitch: 'F4', vowel: 'a', velocity: 0.85, lyricSnippet: 'fathoms' },
    { time: 76, duration: 3.0, pitch: 'G4', vowel: 'e', velocity: 0.9, lyricSnippet: 'sub pressure' },
    // Build 1
    { time: 112, duration: 2.5, pitch: 'A4', vowel: 'e', velocity: 0.95, lyricSnippet: 'Pressure rising' },
    { time: 136, duration: 2.0, pitch: 'D5', vowel: 'o', velocity: 1.0, lyricSnippet: 'DROP!' },
    // Drop 1
    { time: 150, duration: 2.5, pitch: 'D5', vowel: 'a', velocity: 1.0, lyricSnippet: 'DARK BASS' },
    { time: 174, duration: 3.0, pitch: 'F5', vowel: 'o', velocity: 1.0, lyricSnippet: 'ROLLING' },
    // Breakdown
    { time: 230, duration: 3.5, pitch: 'D4', vowel: 'i', velocity: 0.8, lyricSnippet: 'silence' },
    // Build 2
    { time: 330, duration: 2.5, pitch: 'A4', vowel: 'e', velocity: 0.95, lyricSnippet: '140 BPM' },
    { time: 356, duration: 2.0, pitch: 'D5', vowel: 'o', velocity: 1.0, lyricSnippet: 'OVERLOAD' },
    // Drop 2
    { time: 370, duration: 3.0, pitch: 'D5', vowel: 'a', velocity: 1.0, lyricSnippet: 'MAXIMUM BASS' },
    { time: 410, duration: 3.5, pitch: 'F5', vowel: 'e', velocity: 1.0, lyricSnippet: 'EARTHQUAKE' },
  ];

  const songObj: Song = {
    id: 'diffrhythm-preset-dubstep-abyssal-rolling',
    title: 'Abyssal Trench (Deep Rolling Bass)',
    prompt: 'Dark deep rolling bass dubstep at 140 BPM with subterranean sub-bass, half-time heavy punch drums, gunshot snares, neuro wobble, and ominous vocal chants',
    genre: 'Deep Dubstep',
    subGenres: ['Dark 140', 'Deep Rolling Bass', 'Tearout Dubstep', 'Sub-Bass'],
    bpm: 140,
    key: 'D Minor',
    scale: 'minor',
    timeSignature: '4/4',
    durationSec: 199, // 3 minutes 19 seconds!
    vocalStyle: 'Dark Cyber Chant & Sub Vocoder',
    mood: 'Dark, Ominous & Deep Subwoofer Rolling',
    acousticProfile: {
      energy: 0.96,
      danceability: 0.88,
      valence: 0.35,
      acousticness: 0.05,
      spaceReverb: 0.7,
    },
    synthesisMeta: {
      seed: 948210,
      model: 'Curated Web Audio preset',
      generatedAt: '2026-10-05T13:45:00Z',
      compositionMethod: '3-part-multi-movement',
    },
    parts: [
      {
        partIndex: 1,
        name: 'Part I: Abyss Descent & Sub Build (0:00 - 1:04)',
        startSec: 0,
        endSec: 64,
        sections: ['Intro', 'Verse 1', 'Build-up'],
        description: 'Atmospheric sub drone, tension build-up, and rising 140 BPM snare rolls',
      },
      {
        partIndex: 2,
        name: 'Part II: Subduction Drop 1 & Rolling Bass (1:04 - 2:04)',
        startSec: 64,
        endSec: 124,
        sections: ['Drop 1', 'Breakdown'],
        description: 'Colossal first drop with 35Hz sub-bass, gunshot snares, and rolling neuro wobble',
      },
      {
        partIndex: 3,
        name: 'Part III: Sub Overload Drop 2 & Outro (2:04 - 3:19)',
        startSec: 124,
        endSec: 199,
        sections: ['Verse 2', 'Build-up 2', 'Drop 2', 'Outro'],
        description: 'Secondary shockwave with maximum wobble rate modulation and sub dissipation',
      },
    ],
    chordsProgression,
    lyrics,
    stems: {
      // 10-Stem Studio Architecture
      lead_vocals: {
        id: 'lead_vocals',
        name: 'Dark Vocaloid Chants',
        type: 'lead_vocals',
        instrument: 'Ominous Sub Formant Chants',
        color: '#f43f5e',
        volume: 0.85,
        pan: 0,
        muted: false,
        solo: false,
        notes: vocalNotes,
      },
      backing_vocals: {
        id: 'backing_vocals',
        name: 'Backing Whispers & Chants',
        type: 'backing_vocals',
        instrument: 'Stereo Vocaloid Pad & Whispers',
        color: '#fb7185',
        volume: 0.75,
        pan: -0.25,
        muted: false,
        solo: false,
        notes: vocalNotes.map((n) => ({ ...n, time: n.time + 0.25, vowel: 'u' as const, velocity: n.velocity * 0.7 })),
      },
      lead_synth: {
        id: 'lead_synth',
        name: 'Laser & Siren Lead',
        type: 'lead_synth',
        instrument: 'FM Laser Zaps & Detuned Siren',
        color: '#06b6d4',
        volume: 0.85,
        pan: 0.2,
        muted: false,
        solo: false,
        notes: leadNotes,
      },
      chords_harmony: {
        id: 'chords_harmony',
        name: 'Ominous Drones & Chords',
        type: 'chords_harmony',
        instrument: 'Abyssal Reese Pad & Minor Drones',
        color: '#a855f7',
        volume: 0.7,
        pan: -0.2,
        muted: false,
        solo: false,
        notes: chordNotes,
      },
      atmosphere_pad: {
        id: 'atmosphere_pad',
        name: 'Atmosphere Drone Pad',
        type: 'atmosphere_pad',
        instrument: 'Subterranean Drone Pad',
        color: '#818cf8',
        volume: 0.65,
        pan: 0,
        muted: false,
        solo: false,
        notes: chordNotes.map((c) => ({ ...c, duration: c.duration * 1.5, velocity: 0.5 })),
      },
      sub_bass: {
        id: 'sub_bass',
        name: 'Sub-Bass (35Hz)',
        type: 'sub_bass',
        instrument: 'Subterranean 35Hz Sine Foundation',
        color: '#eab308',
        volume: 1.0,
        pan: 0,
        muted: false,
        solo: false,
        notes: bassNotes.filter((b) => !b.pitch.includes('2')),
      },
      mid_bass: {
        id: 'mid_bass',
        name: 'Deep Rolling Wobble Bass',
        type: 'mid_bass',
        instrument: 'Deep Rolling Neuro Wobble (LFO Modulated)',
        color: '#f97316',
        volume: 0.95,
        pan: 0,
        muted: false,
        solo: false,
        notes: bassNotes,
      },
      drums_kick_snare: {
        id: 'drums_kick_snare',
        name: 'Punch Kick & Gunshot Snare',
        type: 'drums_kick_snare',
        instrument: 'Heavy Punch Kick & Gunshot Snare',
        color: '#10b981',
        volume: 0.95,
        pan: 0,
        muted: false,
        solo: false,
        notes: drumNotes.filter((d) => d.pitch.includes('kick') || d.pitch.includes('snare')),
      },
      percussion_cymbals: {
        id: 'percussion_cymbals',
        name: 'Hi-Hats, Claps & Crash',
        type: 'percussion_cymbals',
        instrument: 'Metallic Hi-Hats, Claps & Crash',
        color: '#14b8a6',
        volume: 0.8,
        pan: 0.2,
        muted: false,
        solo: false,
        notes: drumNotes.filter((d) => !d.pitch.includes('kick') && !d.pitch.includes('snare')),
      },
      fx_transitions: {
        id: 'fx_transitions',
        name: 'Sub Drops & Sirens',
        type: 'fx_transitions',
        instrument: 'Sub Drops, Tape Risers & Impact Booms',
        color: '#6366f1',
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        notes: fxNotes,
      },

      // Legacy 6 stems for backwards compatibility
      vocals: {
        id: 'vocals',
        name: 'Dark Vocaloid Chants',
        type: 'vocals',
        instrument: 'Ominous Sub Formant Chants',
        color: '#f43f5e',
        volume: 0.85,
        pan: 0,
        muted: false,
        solo: false,
        notes: vocalNotes,
      },
      lead: {
        id: 'lead',
        name: 'Laser & Siren Lead',
        type: 'lead',
        instrument: 'FM Laser Zaps & Detuned Siren',
        color: '#06b6d4',
        volume: 0.8,
        pan: 0.2,
        muted: false,
        solo: false,
        notes: leadNotes,
      },
      chords: {
        id: 'chords',
        name: 'Ominous Drones',
        type: 'chords',
        instrument: 'Abyssal Reese Pad & Minor Drones',
        color: '#a855f7',
        volume: 0.7,
        pan: -0.2,
        muted: false,
        solo: false,
        notes: chordNotes,
      },
      bass: {
        id: 'bass',
        name: 'Deep Rolling Sub-Bass',
        type: 'bass',
        instrument: 'Subterranean 35Hz Wobble Bass',
        color: '#eab308',
        volume: 1.0,
        pan: 0,
        muted: false,
        solo: false,
        notes: bassNotes,
      },
      drums: {
        id: 'drums',
        name: '140 Dubstep Punch Kit',
        type: 'drums',
        instrument: 'Heavy Punch Kick & Gunshot Snare',
        color: '#10b981',
        volume: 0.95,
        pan: 0,
        muted: false,
        solo: false,
        notes: drumNotes,
      },
      fx: {
        id: 'fx',
        name: 'Sub Drops & Sirens',
        type: 'fx',
        instrument: 'Sub Drops, Tape Risers & Impact Booms',
        color: '#6366f1',
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        notes: fxNotes,
      },
    },
  };

  // Populate dynamic 100 stems
  for (const def of STEM_LIBRARY_100) {
    if (!songObj.stems[def.id]) {
      let sourceNotes = bassNotes;
      if (def.family === 'sub_bass') sourceNotes = bassNotes.filter((b) => !b.pitch.includes('2'));
      else if (def.family === 'heavy_drums') sourceNotes = drumNotes.filter((d) => d.pitch.includes('kick') || d.pitch.includes('snare'));
      else if (def.family === 'percussion') sourceNotes = drumNotes.filter((d) => !d.pitch.includes('kick') && !d.pitch.includes('snare'));
      else if (def.family === 'leads') sourceNotes = leadNotes;
      else if (def.family === 'chords' || def.family === 'atmosphere') sourceNotes = chordNotes;
      else if (def.family === 'vocals') sourceNotes = vocalNotes;
      else if (def.family === 'buildups' || def.family === 'drops_fx') sourceNotes = fxNotes;

      songObj.stems[def.id] = {
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

  songObj.stages = generate100Stages(199, 140, true);
  songObj.comprehension = analyzeMusicComprehension(
    'Dark deep rolling bass dubstep at 140 BPM with subterranean 35Hz sub-bass, half-time heavy punch drums, gunshot snares, neuro wobble, and ominous vocal chants',
    { variance: 0.9, bpm: 140, key: 'D Minor', genre: 'Deep Dubstep' }
  );
  songObj.variance = 0.9;

  return songObj;
}

// Function to extend presets to 3+ minutes (180+ seconds)
function extendSongToLongFormat(baseSong: Song, targetDurationSec: number = 192): Song {
  const bpm = baseSong.bpm || 120;
  const secPerBeat = 60 / bpm;
  const originalDuration = baseSong.durationSec || 36;
  const repeatFactor = Math.ceil(targetDurationSec / originalDuration);

  // Extend Lyrics across sections
  const extendedLyrics: LyricLine[] = [];
  const sections = ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Bridge', 'Chorus 2', 'Drop', 'Outro'];

  let currentStartTime = 2.0;
  sections.forEach((sec, idx) => {
    const sectionDuration = Math.round(targetDurationSec / sections.length);
    const endTime = Math.min(targetDurationSec, currentStartTime + sectionDuration - 1.5);

    const baseText = baseSong.lyrics[idx % baseSong.lyrics.length]?.text || `Melodic ${sec} harmony flowing through the mix`;
    extendedLyrics.push({
      id: `ext_l_${idx}`,
      section: sec as any,
      startTime: currentStartTime,
      endTime,
      text: baseText,
      words: baseText.split(' ').map((w, wIdx, arr) => ({
        word: w,
        start: currentStartTime + (wIdx / arr.length) * (endTime - currentStartTime),
        end: currentStartTime + ((wIdx + 0.8) / arr.length) * (endTime - currentStartTime),
      })),
    });
    currentStartTime = endTime + 1.5;
  });

  // Duplicate & shift note events across all bars for 3+ minutes
  const extendedStems: any = {};
  for (const [sKey, sTrack] of Object.entries(baseSong.stems) as [string, any][]) {
    const originalNotes = sTrack.notes || [];
    const extendedNotes: NoteEvent[] = [];
    const originalBeats = Math.ceil(originalDuration / secPerBeat);
    const targetBeats = Math.ceil(targetDurationSec / secPerBeat);

    for (let loop = 0; loop < repeatFactor; loop++) {
      const beatOffset = loop * originalBeats;
      for (const note of originalNotes) {
        const shiftedTime = note.time + beatOffset;
        if (shiftedTime < targetBeats) {
          extendedNotes.push({
            ...note,
            time: shiftedTime,
          });
        }
      }
    }

    extendedStems[sKey] = {
      ...sTrack,
      notes: extendedNotes,
    };
  }

  // Extend chord progression
  const extendedChords = [];
  const chordsPerLoop = baseSong.chordsProgression.length;
  for (let loop = 0; loop < repeatFactor; loop++) {
    const timeOffset = loop * (baseSong.chordsProgression[chordsPerLoop - 1]?.time + 4 || 16);
    for (let cIdx = 0; cIdx < chordsPerLoop; cIdx++) {
      const chord = baseSong.chordsProgression[cIdx];
      extendedChords.push({
        bar: loop * chordsPerLoop + chord.bar,
        time: chord.time + timeOffset,
        chord: chord.chord,
        notes: chord.notes,
      });
    }
  }

  // Ensure all 10 stems exist in extendedStems with appropriate fallback channels
  if (!extendedStems.lead_vocals && extendedStems.vocals) extendedStems.lead_vocals = extendedStems.vocals;
  if (!extendedStems.backing_vocals && extendedStems.vocals) {
    extendedStems.backing_vocals = {
      ...extendedStems.vocals,
      id: 'backing_vocals',
      name: 'Backing Harmonies',
      type: 'backing_vocals',
      instrument: 'Stereo Vocal Harmony & Pads',
      color: '#fb7185',
      volume: 0.7,
      pan: -0.25,
      notes: extendedStems.vocals.notes.map((n: any) => ({ ...n, time: n.time + 0.25, vowel: 'u', velocity: (n.velocity || 0.8) * 0.7 })),
    };
  }
  if (!extendedStems.lead_synth && extendedStems.lead) extendedStems.lead_synth = extendedStems.lead;
  if (!extendedStems.chords_harmony && extendedStems.chords) extendedStems.chords_harmony = extendedStems.chords;
  if (!extendedStems.atmosphere_pad && extendedStems.chords) {
    extendedStems.atmosphere_pad = {
      ...extendedStems.chords,
      id: 'atmosphere_pad',
      name: 'Atmosphere Drone Pad',
      type: 'atmosphere_pad',
      instrument: 'Lush Cinematic Pad',
      color: '#818cf8',
      volume: 0.65,
      pan: 0,
      notes: extendedStems.chords.notes.map((c: any) => ({ ...c, duration: (c.duration || 2) * 1.5, velocity: 0.5 })),
    };
  }
  if (!extendedStems.sub_bass && extendedStems.bass) {
    extendedStems.sub_bass = {
      ...extendedStems.bass,
      id: 'sub_bass',
      name: 'Sub-Bass (35Hz)',
      type: 'sub_bass',
      instrument: 'Analog Sub Sine 808',
      color: '#eab308',
      volume: 0.95,
      pan: 0,
    };
  }
  if (!extendedStems.mid_bass && extendedStems.bass) extendedStems.mid_bass = extendedStems.bass;
  if (!extendedStems.drums_kick_snare && extendedStems.drums) {
    extendedStems.drums_kick_snare = {
      ...extendedStems.drums,
      id: 'drums_kick_snare',
      name: 'Kick & Snare Kit',
      type: 'drums_kick_snare',
      instrument: 'Punch Studio Kit',
      color: '#10b981',
      volume: 0.95,
    };
  }
  if (!extendedStems.percussion_cymbals && extendedStems.drums) {
    extendedStems.percussion_cymbals = {
      ...extendedStems.drums,
      id: 'percussion_cymbals',
      name: 'Hi-Hats, Claps & Crash',
      type: 'percussion_cymbals',
      instrument: 'Studio Cymbals & Percussion',
      color: '#14b8a6',
      volume: 0.8,
      pan: 0.2,
      notes: extendedStems.drums.notes.filter((d: any) => !d.pitch?.includes('kick') && !d.pitch?.includes('snare')),
    };
  }
  if (!extendedStems.fx_transitions && extendedStems.fx) extendedStems.fx_transitions = extendedStems.fx;

  // Populate dynamic 100 stems into extendedStems
  for (const def of STEM_LIBRARY_100) {
    if (!extendedStems[def.id]) {
      let sourceNotes = extendedStems.sub_bass?.notes || extendedStems.bass?.notes || [];
      if (def.family === 'rolling_wubs') sourceNotes = extendedStems.mid_bass?.notes || sourceNotes;
      else if (def.family === 'heavy_drums') sourceNotes = extendedStems.drums_kick_snare?.notes || extendedStems.drums?.notes || [];
      else if (def.family === 'percussion') sourceNotes = extendedStems.percussion_cymbals?.notes || extendedStems.drums?.notes || [];
      else if (def.family === 'leads') sourceNotes = extendedStems.lead_synth?.notes || extendedStems.lead?.notes || [];
      else if (def.family === 'chords') sourceNotes = extendedStems.chords_harmony?.notes || extendedStems.chords?.notes || [];
      else if (def.family === 'atmosphere') sourceNotes = extendedStems.atmosphere_pad?.notes || sourceNotes;
      else if (def.family === 'vocals') sourceNotes = extendedStems.lead_vocals?.notes || extendedStems.vocals?.notes || [];
      else if (def.family === 'buildups' || def.family === 'drops_fx') sourceNotes = extendedStems.fx_transitions?.notes || extendedStems.fx?.notes || [];

      extendedStems[def.id] = {
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

  const part1End = Math.round(targetDurationSec * 0.33);
  const part2End = Math.round(targetDurationSec * 0.68);
  const parts = [
    {
      partIndex: 1 as const,
      name: 'Part I: Atmosphere & Build (0:00 - 1:04)',
      startSec: 0,
      endSec: part1End,
      sections: ['Intro', 'Verse 1', 'Pre-Chorus'] as any[],
      description: 'Opening atmosphere, exposition, and escalating momentum',
    },
    {
      partIndex: 2 as const,
      name: 'Part II: Main Chorus & Bridge (1:04 - 2:10)',
      startSec: part1End,
      endSec: part2End,
      sections: ['Chorus', 'Verse 2', 'Bridge'] as any[],
      description: 'Peak thematic climax and multi-track harmonic convergence',
    },
    {
      partIndex: 3 as const,
      name: 'Part III: Extended Climax & Outro (2:10 - 3:12+)',
      startSec: part2End,
      endSec: targetDurationSec,
      sections: ['Drop', 'Chorus 2', 'Outro'] as any[],
      description: 'Grand finale, secondary movement, and fading harmonic tail',
    },
  ];

  return {
    ...baseSong,
    durationSec: targetDurationSec,
    lyrics: extendedLyrics,
    stems: extendedStems,
    chordsProgression: extendedChords,
    parts,
    stages: generate100Stages(targetDurationSec, baseSong.bpm || 128, false),
    comprehension: analyzeMusicComprehension(baseSong.prompt, {
      bpm: baseSong.bpm,
      key: baseSong.key,
      genre: baseSong.genre,
    }),
    variance: 0.85,
  };
}

// 1. Flagship 3+ Minute Deep Rolling Bass Dubstep Track
const ABYSSAL_DUBSTEP = createAbyssalDubstepSong();

// 2. Neon Overdrive extended to 3 minutes 12 seconds (192 seconds)
const NEON_OVERDRIVE_3MIN = extendSongToLongFormat({
  id: 'diffrhythm-preset-1-neon-overdrive',
  title: 'Neon Overdrive (Extended 3-Min Mix)',
  prompt: 'Fast-paced cyberpunk synthwave with driving bassline, soaring neon female vocals, and gated analog drums about speeding through Neo-Tokyo in the rain',
  genre: 'Synthwave',
  subGenres: ['Cyberpunk', 'Darksynth', 'Outrun'],
  bpm: 128,
  key: 'F# Minor',
  scale: 'minor',
  timeSignature: '4/4',
  durationSec: 192,
  vocalStyle: 'Soaring Cyber-Pop Female',
  mood: 'High Octane & Cinematic',
  acousticProfile: {
    energy: 0.92,
    danceability: 0.85,
    valence: 0.65,
    acousticness: 0.08,
    spaceReverb: 0.65,
  },
  synthesisMeta: {
    seed: 849201,
    model: 'Curated Web Audio preset',
    generatedAt: '2026-10-05T12:00:00Z',
  },
  chordsProgression: [
    { bar: 1, time: 0, chord: 'F#m', notes: ['F#3', 'A3', 'C#4'] },
    { bar: 2, time: 1.875, chord: 'D', notes: ['D3', 'F#3', 'A3'] },
    { bar: 3, time: 3.75, chord: 'A', notes: ['A3', 'C#4', 'E4'] },
    { bar: 4, time: 5.625, chord: 'E', notes: ['E3', 'G#3', 'B3'] },
  ],
  lyrics: [
    {
      id: 'l1',
      section: 'Verse 1',
      startTime: 3.75,
      endTime: 14.5,
      text: 'Rain on the windshield, violet and blue reflecting chrome in the rearview',
      words: [],
    },
    {
      id: 'l2',
      section: 'Chorus',
      startTime: 15.0,
      endTime: 36.0,
      text: 'We are the neon overdrive tonight, burning the skyline into synthetic light!',
      words: [],
    },
  ],
  stems: {
    vocals: {
      id: 'vocals',
      name: 'Lead Vocals',
      type: 'vocals',
      instrument: 'Formant Cyber-Vocaloid',
      color: '#ec4899',
      volume: 0.9,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        { time: 8, duration: 1.5, pitch: 'F#4', vowel: 'e', velocity: 0.85, lyricSnippet: 'Rain on' },
        { time: 10, duration: 1.5, pitch: 'A4', vowel: 'i', velocity: 0.85, lyricSnippet: 'the wind' },
        { time: 12, duration: 2.0, pitch: 'G#4', vowel: 'o', velocity: 0.8, lyricSnippet: 'shield' },
        { time: 16, duration: 1.5, pitch: 'F#4', vowel: 'e', velocity: 0.85, lyricSnippet: 'Reflect' },
        { time: 24, duration: 1.5, pitch: 'A4', vowel: 'i', velocity: 0.88, lyricSnippet: 'Zero' },
        { time: 32, duration: 1.8, pitch: 'F#5', vowel: 'e', velocity: 1.0, lyricSnippet: 'We are' },
        { time: 36, duration: 3.0, pitch: 'F#5', vowel: 'i', velocity: 1.0, lyricSnippet: 'overdrive' },
      ],
    },
    lead: {
      id: 'lead',
      name: 'Lead Synth',
      type: 'lead',
      instrument: 'Analog Detuned Saw Hook',
      color: '#06b6d4',
      volume: 0.8,
      pan: 0.2,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 0.5, pitch: 'F#4', velocity: 0.75 },
        { time: 0.5, duration: 0.5, pitch: 'A4', velocity: 0.7 },
        { time: 1.0, duration: 0.5, pitch: 'C#5', velocity: 0.8 },
        { time: 1.5, duration: 0.5, pitch: 'E5', velocity: 0.75 },
        { time: 2.0, duration: 0.5, pitch: 'F#5', velocity: 0.85 },
        { time: 4, duration: 0.5, pitch: 'D4', velocity: 0.75 },
        { time: 6.0, duration: 0.5, pitch: 'F#5', velocity: 0.85 },
      ],
    },
    chords: {
      id: 'chords',
      name: 'Warm Pads & Keys',
      type: 'chords',
      instrument: 'Juno-106 Lush Poly Pad',
      color: '#8b5cf6',
      volume: 0.75,
      pan: -0.2,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 4.0, pitch: 'F#3', velocity: 0.6 },
        { time: 0, duration: 4.0, pitch: 'A3', velocity: 0.6 },
        { time: 0, duration: 4.0, pitch: 'C#4', velocity: 0.6 },
        { time: 4, duration: 4.0, pitch: 'D3', velocity: 0.6 },
        { time: 4, duration: 4.0, pitch: 'F#3', velocity: 0.6 },
        { time: 8, duration: 4.0, pitch: 'A3', velocity: 0.6 },
        { time: 12, duration: 4.0, pitch: 'E3', velocity: 0.6 },
      ],
    },
    bass: {
      id: 'bass',
      name: 'Bassline',
      type: 'bass',
      instrument: 'Moog 808 Synthwave Bass',
      color: '#f59e0b',
      volume: 0.85,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        ...Array.from({ length: 16 }).map((_, i) => ({
          time: i * 0.5,
          duration: 0.45,
          pitch: 'F#2',
          velocity: i % 2 === 0 ? 0.9 : 0.75,
        })),
        ...Array.from({ length: 16 }).map((_, i) => ({
          time: 8 + i * 0.5,
          duration: 0.45,
          pitch: 'D2',
          velocity: i % 2 === 0 ? 0.9 : 0.75,
        })),
      ],
    },
    drums: {
      id: 'drums',
      name: 'Drum Kit',
      type: 'drums',
      instrument: 'TR-707 Gated Reverb Drum Machine',
      color: '#10b981',
      volume: 0.85,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        ...Array.from({ length: 8 }).flatMap((_, barIndex) => {
          const b = barIndex * 4;
          return [
            { time: b + 0, duration: 0.2, pitch: 'kick', velocity: 1.0 },
            { time: b + 1, duration: 0.2, pitch: 'kick', velocity: 0.9 },
            { time: b + 2, duration: 0.2, pitch: 'kick', velocity: 1.0 },
            { time: b + 3, duration: 0.2, pitch: 'kick', velocity: 0.9 },
            { time: b + 1, duration: 0.2, pitch: 'snare', velocity: 0.95 },
            { time: b + 3, duration: 0.2, pitch: 'snare', velocity: 0.95 },
            { time: b + 0, duration: 0.1, pitch: 'hihat_closed', velocity: 0.7 },
            { time: b + 0.5, duration: 0.1, pitch: 'hihat_closed', velocity: 0.8 },
            { time: b + 1, duration: 0.1, pitch: 'hihat_closed', velocity: 0.7 },
            { time: b + 1.5, duration: 0.1, pitch: 'hihat_open', velocity: 0.85 },
          ];
        }),
      ],
    },
    fx: {
      id: 'fx',
      name: 'FX & Ambience',
      type: 'fx',
      instrument: 'White Noise Riser & Tape Delay',
      color: '#6366f1',
      volume: 0.7,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 2.0, pitch: 'sub_drop', velocity: 0.8 },
        { time: 14, duration: 2.0, pitch: 'riser', velocity: 0.85 },
        { time: 16, duration: 0.5, pitch: 'crash', velocity: 0.9 },
      ],
    },
  },
}, 192);

// 3. Tokyo Midnight Cruise extended to 3 minutes 6 seconds (186 seconds)
const TOKYO_MIDNIGHT_3MIN = extendSongToLongFormat({
  id: 'diffrhythm-preset-2-tokyo-midnight',
  title: 'Tokyo Midnight Cruise (3-Min City Pop)',
  prompt: '90s Japanese City Pop with funk slap bass, breezy electric piano, brass hits, and melancholic romantic vocals about midnight expressway lights',
  genre: 'City Pop',
  subGenres: ['Funk', 'Japanese Pop', 'Boogie', 'Disco'],
  bpm: 116,
  key: 'A Major',
  scale: 'major',
  timeSignature: '4/4',
  durationSec: 186,
  vocalStyle: 'Warm Breezy Japanese Pop',
  mood: 'Nostalgic & Sophisticated',
  acousticProfile: {
    energy: 0.82,
    danceability: 0.88,
    valence: 0.78,
    acousticness: 0.35,
    spaceReverb: 0.5,
  },
  synthesisMeta: {
    seed: 712390,
    model: 'Curated Web Audio preset',
    generatedAt: '2026-10-05T12:00:00Z',
  },
  chordsProgression: [
    { bar: 1, time: 0, chord: 'F#m7', notes: ['F#3', 'A3', 'C#4', 'E4'] },
    { bar: 2, time: 2.06, chord: 'B7', notes: ['B3', 'D#4', 'F#4', 'A4'] },
    { bar: 3, time: 4.13, chord: 'Emaj7', notes: ['E3', 'G#3', 'B3', 'D#4'] },
    { bar: 4, time: 6.2, chord: 'Amaj7', notes: ['A3', 'C#4', 'E4', 'G#4'] },
  ],
  lyrics: [
    {
      id: 'l1',
      section: 'Verse 1',
      startTime: 2.0,
      endTime: 16.0,
      text: 'City towers glow against the night sky, drive away with me into the golden highway breeze!',
      words: [],
    },
  ],
  stems: {
    vocals: {
      id: 'vocals',
      name: 'Lead Vocals',
      type: 'vocals',
      instrument: 'Formant City Pop Vocalist',
      color: '#f43f5e',
      volume: 0.9,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        { time: 4, duration: 1.5, pitch: 'C#5', vowel: 'i', velocity: 0.85, lyricSnippet: 'City' },
        { time: 6, duration: 1.5, pitch: 'B4', vowel: 'a', velocity: 0.8, lyricSnippet: 'towers' },
        { time: 14, duration: 2.0, pitch: 'E5', vowel: 'a', velocity: 0.95, lyricSnippet: 'Drive away' },
        { time: 24, duration: 3.0, pitch: 'A5', vowel: 'i', velocity: 1.0, lyricSnippet: 'breeze!' },
      ],
    },
    lead: {
      id: 'lead',
      name: 'Brass Stabs & Solo',
      type: 'lead',
      instrument: 'Yamaha DX7 Horn Stabs',
      color: '#eab308',
      volume: 0.8,
      pan: 0.15,
      muted: false,
      solo: false,
      notes: [
        { time: 2, duration: 0.3, pitch: 'C#5', velocity: 0.9 },
        { time: 2.5, duration: 0.4, pitch: 'E5', velocity: 0.95 },
        { time: 6, duration: 0.3, pitch: 'D#5', velocity: 0.85 },
        { time: 10, duration: 0.3, pitch: 'E5', velocity: 0.9 },
      ],
    },
    chords: {
      id: 'chords',
      name: 'Electric Piano',
      type: 'chords',
      instrument: 'Rhodes Mk II Electric Piano',
      color: '#a855f7',
      volume: 0.75,
      pan: -0.15,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 3.5, pitch: 'F#3', velocity: 0.7 },
        { time: 0, duration: 3.5, pitch: 'A3', velocity: 0.7 },
        { time: 4, duration: 3.5, pitch: 'B3', velocity: 0.7 },
        { time: 8, duration: 3.5, pitch: 'E3', velocity: 0.7 },
      ],
    },
    bass: {
      id: 'bass',
      name: 'Funk Slap Bass',
      type: 'bass',
      instrument: 'Slap Bass with Envelope Filter',
      color: '#f97316',
      volume: 0.85,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 0.5, pitch: 'F#2', velocity: 0.95 },
        { time: 1.5, duration: 0.5, pitch: 'C#3', velocity: 0.9 },
        { time: 4.0, duration: 0.5, pitch: 'B2', velocity: 0.95 },
        { time: 8.0, duration: 0.5, pitch: 'E2', velocity: 0.95 },
      ],
    },
    drums: {
      id: 'drums',
      name: 'Funk Disco Drums',
      type: 'drums',
      instrument: 'Classic Acoustic Studio Funk Kit',
      color: '#10b981',
      volume: 0.85,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        ...Array.from({ length: 8 }).flatMap((_, barIndex) => {
          const b = barIndex * 4;
          return [
            { time: b + 0, duration: 0.2, pitch: 'kick', velocity: 0.95 },
            { time: b + 1.5, duration: 0.2, pitch: 'kick', velocity: 0.85 },
            { time: b + 1, duration: 0.2, pitch: 'snare', velocity: 0.95 },
            { time: b + 3, duration: 0.2, pitch: 'snare', velocity: 0.95 },
            { time: b + 0, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 },
            { time: b + 1, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 },
            { time: b + 2, duration: 0.1, pitch: 'hihat_closed', velocity: 0.75 },
            { time: b + 3, duration: 0.1, pitch: 'hihat_open', velocity: 0.85 },
          ];
        }),
      ],
    },
    fx: {
      id: 'fx',
      name: 'Vinyl & Shimmer',
      type: 'fx',
      instrument: 'Analog Vinyl Sparkle & Cymbal Swells',
      color: '#3b82f6',
      volume: 0.65,
      pan: 0,
      muted: false,
      solo: false,
      notes: [
        { time: 0, duration: 1.0, pitch: 'crash', velocity: 0.8 },
      ],
    },
  },
}, 186);

export const PRESET_SONGS: Song[] = [
  ABYSSAL_DUBSTEP,
  NEON_OVERDRIVE_3MIN,
  TOKYO_MIDNIGHT_3MIN,
];
