/**
 * DiffRhythm 2 - Stem Normalizer & 10-Track Multi-Stem Studio Expander
 * Ensures every song has full 10-stem studio depth and backward compatibility.
 */

import { Song, StemType, StemTrack, NoteEvent } from '../types/music';

export const STEM_DEFINITIONS: { id: StemType; name: string; instrument: string; color: string; pan: number; volume: number }[] = [
  { id: 'lead_vocals', name: 'Lead Vocals', instrument: 'Formant Lead Vocalist', color: '#f43f5e', pan: 0, volume: 0.9 },
  { id: 'backing_vocals', name: 'Backing Vocals', instrument: 'Vocal Stack & Chops', color: '#fb7185', pan: -0.25, volume: 0.75 },
  { id: 'lead_synth', name: 'Lead Synth / Hook', instrument: 'Analog Saw & FM Lead', color: '#06b6d4', pan: 0.15, volume: 0.8 },
  { id: 'chords_harmony', name: 'Harmonic Keys', instrument: 'Rhodes Mk II & Poly Keys', color: '#a855f7', pan: -0.2, volume: 0.75 },
  { id: 'atmosphere_pad', name: 'Atmosphere Drone', instrument: 'Cinematic Ambient Strings', color: '#818cf8', pan: 0.25, volume: 0.7 },
  { id: 'sub_bass', name: 'Sub-Bass (35Hz)', instrument: 'Pure Subwoofer Sine (35-55Hz)', color: '#eab308', pan: 0, volume: 0.95 },
  { id: 'mid_bass', name: 'Rolling Mid-Bass', instrument: 'Resonant Neuro Wobble / Slap', color: '#f97316', pan: 0, volume: 0.85 },
  { id: 'drums_kick_snare', name: 'Kick & Snare', instrument: '140 Punch Kick & Gunshot Snare', color: '#10b981', pan: 0, volume: 0.95 },
  { id: 'percussion_cymbals', name: 'Percussion & Hats', instrument: 'Rolling 16th Hats, Shakers, Ride', color: '#14b8a6', pan: 0.1, volume: 0.8 },
  { id: 'fx_transitions', name: 'FX & Risers', instrument: 'Sub Drops, Tape Risers & Sirens', color: '#6366f1', pan: 0, volume: 0.75 },
];

export function normalizeSongStems(song: Song): Song {
  if (!song || !song.stems) return song;

  const currentStems = song.stems as any;
  const isAlready10Stems = 'lead_vocals' in currentStems && 'sub_bass' in currentStems;

  if (isAlready10Stems) {
    return song;
  }

  // Convert 6-stem format into 10-stem format
  const oldVocals: StemTrack = currentStems.vocals || { notes: [] };
  const oldLead: StemTrack = currentStems.lead || { notes: [] };
  const oldChords: StemTrack = currentStems.chords || { notes: [] };
  const oldBass: StemTrack = currentStems.bass || { notes: [] };
  const oldDrums: StemTrack = currentStems.drums || { notes: [] };
  const oldFx: StemTrack = currentStems.fx || { notes: [] };

  // 1. Backing Vocals (generate subtle harmony/chops from vocals)
  const backingNotes: NoteEvent[] = (oldVocals.notes || []).map((n: NoteEvent) => ({
    ...n,
    time: n.time + 0.1,
    velocity: (n.velocity || 0.8) * 0.7,
    vowel: (n.vowel === 'a' ? 'o' : 'u') as any,
  }));

  // 2. Separate Kick/Snare vs Percussion/Hats
  const kickSnareNotes: NoteEvent[] = [];
  const percNotes: NoteEvent[] = [];
  (oldDrums.notes || []).forEach((n: NoteEvent) => {
    const p = (n.pitch || '').toLowerCase();
    if (p.includes('kick') || p.includes('snare') || p.includes('clap')) {
      kickSnareNotes.push(n);
    } else {
      percNotes.push(n);
    }
  });

  // 3. Separate Sub-Bass (low fundamental) vs Mid-Bass (harmonics/wobble)
  const subBassNotes: NoteEvent[] = (oldBass.notes || []).map((n: NoteEvent) => ({
    ...n,
    wobbleRate: undefined, // pure clean sub
  }));
  const midBassNotes: NoteEvent[] = (oldBass.notes || []).map((n: NoteEvent) => ({
    ...n,
    wobbleRate: n.wobbleRate || 3.5, // resonant harmonic rolling wobble
  }));

  // 4. Atmosphere Drone (from chords with slow attack)
  const padNotes: NoteEvent[] = (oldChords.notes || []).map((n: NoteEvent) => ({
    ...n,
    duration: Math.max(n.duration, 4.0),
    velocity: (n.velocity || 0.7) * 0.75,
  }));

  const newStems: Record<StemType, StemTrack> = {
    lead_vocals: {
      id: 'lead_vocals',
      name: 'Lead Vocals',
      type: 'lead_vocals',
      instrument: oldVocals.instrument || 'Formant Lead Vocalist',
      color: '#f43f5e',
      volume: oldVocals.volume ?? 0.9,
      pan: 0,
      muted: oldVocals.muted || false,
      solo: oldVocals.solo || false,
      notes: oldVocals.notes || [],
    },
    backing_vocals: {
      id: 'backing_vocals',
      name: 'Backing Vocals',
      type: 'backing_vocals',
      instrument: 'Vocal Stack & Chops',
      color: '#fb7185',
      volume: 0.75,
      pan: -0.25,
      muted: oldVocals.muted || false,
      solo: false,
      notes: backingNotes,
    },
    lead_synth: {
      id: 'lead_synth',
      name: 'Lead Synth / Hook',
      type: 'lead_synth',
      instrument: oldLead.instrument || 'Analog Saw & FM Lead',
      color: '#06b6d4',
      volume: oldLead.volume ?? 0.8,
      pan: 0.15,
      muted: oldLead.muted || false,
      solo: oldLead.solo || false,
      notes: oldLead.notes || [],
    },
    chords_harmony: {
      id: 'chords_harmony',
      name: 'Harmonic Keys',
      type: 'chords_harmony',
      instrument: oldChords.instrument || 'Rhodes Mk II & Poly Keys',
      color: '#a855f7',
      volume: oldChords.volume ?? 0.75,
      pan: -0.2,
      muted: oldChords.muted || false,
      solo: oldChords.solo || false,
      notes: oldChords.notes || [],
    },
    atmosphere_pad: {
      id: 'atmosphere_pad',
      name: 'Atmosphere Drone',
      type: 'atmosphere_pad',
      instrument: 'Cinematic Ambient Strings',
      color: '#818cf8',
      volume: 0.7,
      pan: 0.25,
      muted: false,
      solo: false,
      notes: padNotes,
    },
    sub_bass: {
      id: 'sub_bass',
      name: 'Sub-Bass (35Hz)',
      type: 'sub_bass',
      instrument: 'Pure Subwoofer Sine (35-55Hz)',
      color: '#eab308',
      volume: 0.95,
      pan: 0,
      muted: oldBass.muted || false,
      solo: oldBass.solo || false,
      notes: subBassNotes,
    },
    mid_bass: {
      id: 'mid_bass',
      name: 'Rolling Mid-Bass',
      type: 'mid_bass',
      instrument: 'Resonant Neuro Wobble / Slap',
      color: '#f97316',
      volume: oldBass.volume ?? 0.85,
      pan: 0,
      muted: oldBass.muted || false,
      solo: oldBass.solo || false,
      notes: midBassNotes,
    },
    drums_kick_snare: {
      id: 'drums_kick_snare',
      name: 'Kick & Snare',
      type: 'drums_kick_snare',
      instrument: '140 Punch Kick & Gunshot Snare',
      color: '#10b981',
      volume: oldDrums.volume ?? 0.95,
      pan: 0,
      muted: oldDrums.muted || false,
      solo: oldDrums.solo || false,
      notes: kickSnareNotes.length > 0 ? kickSnareNotes : oldDrums.notes || [],
    },
    percussion_cymbals: {
      id: 'percussion_cymbals',
      name: 'Percussion & Hats',
      type: 'percussion_cymbals',
      instrument: 'Rolling 16th Hats, Shakers, Ride',
      color: '#14b8a6',
      volume: 0.8,
      pan: 0.1,
      muted: oldDrums.muted || false,
      solo: false,
      notes: percNotes,
    },
    fx_transitions: {
      id: 'fx_transitions',
      name: 'FX & Risers',
      type: 'fx_transitions',
      instrument: oldFx.instrument || 'Sub Drops, Tape Risers & Sirens',
      color: '#6366f1',
      volume: oldFx.volume ?? 0.75,
      pan: 0,
      muted: oldFx.muted || false,
      solo: oldFx.solo || false,
      notes: oldFx.notes || [],
    },
    // Legacy stem aliases
    vocals: oldVocals,
    lead: oldLead,
    chords: oldChords,
    bass: oldBass,
    drums: oldDrums,
    fx: oldFx,
  };

  return {
    ...song,
    stems: newStems,
  };
}
