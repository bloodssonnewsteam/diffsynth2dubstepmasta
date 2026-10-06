/**
 * DiffRhythm - Genre-profile auto-mixing and procedural synth patch engine
 */

import { Song, StemMixSettings, StemTrack, StemType, SynthPatch } from '../types/music';
import { audioEngine } from './audioEngine';
import { evolutionaryEngine } from './evolutionaryLearningEngine';
import { UNDERGROUND_DUBSTEP_STYLES, UndergroundDubstepStyle } from '../data/undergroundDubstepResearch';

export interface AutoMixResult {
  updatedSong: Song;
  appliedProfileName: string;
  appliedStyleId: string;
  adjustmentsCount: number;
  stemDecisions: {
    stemId: string;
    stemName: string;
    newVolume: number;
    newPan: number;
    mixSettings: StemMixSettings;
    reasoning: string;
  }[];
  activeStemCount: number;
  headroomTrimDb: number;
  masterEq: {
    lowDb: number;
    midDb: number;
    highDb: number;
  };
  reverbWetPercent: number;
  summary: string;
}

function createStemMixSettings(stemId: string, stemName: string): StemMixSettings {
  const id = stemId.toLowerCase();
  const name = stemName.toLowerCase();
  if ((id.startsWith('sub_') || id === 'sub_bass') && !id.includes('click')) {
    return { lowCutHz: 25, highCutHz: 150, reverbSend: 0 };
  }
  if (id.includes('click') || name.includes('transient')) {
    return { lowCutHz: 350, highCutHz: 10000, reverbSend: 0.02 };
  }
  if (id.startsWith('wub_') || id === 'mid_bass' || id === 'bass') {
    return { lowCutHz: 65, highCutHz: 6500, reverbSend: 0.04 };
  }
  if (id.includes('kick')) return { lowCutHz: 28, highCutHz: 9000, reverbSend: 0 };
  if (id.includes('snare') || id.includes('clap')) return { lowCutHz: 100, highCutHz: 14000, reverbSend: 0.08 };
  if (id.startsWith('drum_') || id === 'drums') return { lowCutHz: 35, highCutHz: 16000, reverbSend: 0.03 };
  if (id.startsWith('perc_') || id === 'percussion_cymbals') {
    return { lowCutHz: /hat|cymbal|shaker|ride/.test(`${id} ${name}`) ? 1600 : 300, highCutHz: 18000, reverbSend: 0.06 };
  }
  if (id.includes('vocal')) return { lowCutHz: 100, highCutHz: 15000, reverbSend: id.includes('backing') ? 0.28 : 0.14 };
  if (id.startsWith('lead_') || id === 'lead' || name.includes('lead')) return { lowCutHz: 140, highCutHz: 16000, reverbSend: 0.12 };
  if (id.startsWith('chord_') || id.includes('chords')) return { lowCutHz: 110, highCutHz: 11000, reverbSend: 0.22 };
  if (id.startsWith('atmo_') || id.includes('atmosphere') || name.includes('drone')) {
    return { lowCutHz: 70, highCutHz: 9000, reverbSend: 0.38 };
  }
  if (id.startsWith('rise_') || id.startsWith('drop_') || id === 'fx' || id.includes('fx')) {
    return { lowCutHz: 45, highCutHz: 16000, reverbSend: 0.12 };
  }
  return { lowCutHz: 100, highCutHz: 16000, reverbSend: 0.1 };
}

function createSynthPatch(
  family: 'bass' | 'lead' | 'pad',
  random: () => number,
  learnedPatch?: SynthPatch,
  referenceText = ''
): SynthPatch {
  const ranges = {
    bass: { cutoff: [220, 920], resonance: [3.5, 7], attack: [0.008, 0.04], release: [0.035, 0.12], lfo: [2.5, 7.5], drive: [12, 32], detune: [5, 18], waves: ['sawtooth', 'square'] as OscillatorType[] },
    lead: { cutoff: [1400, 4600], resonance: [0.7, 4], attack: [0.005, 0.04], release: [0.04, 0.2], lfo: [3.5, 7], drive: [4, 22], detune: [4, 16], waves: ['sawtooth', 'square', 'triangle'] as OscillatorType[] },
    pad: { cutoff: [550, 2600], resonance: [0.5, 2], attack: [0.12, 0.55], release: [0.15, 0.6], lfo: [0.15, 0.9], drive: [0, 6], detune: [2, 12], waves: ['sine', 'triangle', 'sawtooth'] as OscillatorType[] },
  }[family];
  const range = (min: number, max: number) => min + random() * (max - min);
  const blend = (fresh: number, learned: number, min: number, max: number) =>
    Math.max(min, Math.min(max, fresh * 0.35 + learned * 0.65));
  const wave = ranges.waves[Math.floor(random() * ranges.waves.length)];
  const savedReferenceInfluence = Math.max(0, ...[...referenceText.matchAll(/Influence (\d+)%:/g)].map((match) => Number(match[1]) / 100));
  const directPrompt = referenceText.split(/production reference notes:/i)[0];
  const promptCueInfluence = /piano|strings|orchestral|acoustic|808|distorted bass|analog|bright|uplifting|dark|relaxed|ambient/i.test(directPrompt) ? 0.65 : 0;
  const influence = Math.max(savedReferenceInfluence, promptCueInfluence);
  const referenceTone = family === 'pad' && /piano|strings|orchestral|acoustic/i.test(referenceText)
    ? 'triangle'
    : family === 'bass' && /808|distorted bass|analog/i.test(referenceText)
      ? 'sawtooth'
      : family === 'lead' && /analog synthesizer|analog synth|bright|uplifting/i.test(referenceText)
        ? 'sawtooth'
        : undefined;
  const referenceCutoffBias = /dark|relaxed|ambient/i.test(referenceText)
    ? 0.35
    : /bright|uplifting|energetic/i.test(referenceText)
      ? 0.7
      : undefined;
  const tunedRange = (bounds: number[], learned: number | undefined, useReferenceBias = false) => {
    const min = bounds[0];
    const max = bounds[1];
    const fresh = range(min, max);
    const learnedValue = learned === undefined ? fresh : blend(fresh, learned, min, max);
    if (!useReferenceBias || referenceCutoffBias === undefined || random() > influence) return learnedValue;
    return learnedValue * (1 - influence) + (min + (max - min) * referenceCutoffBias) * influence;
  };

  return {
    oscillatorType: referenceTone && random() < influence
      ? referenceTone as OscillatorType
      : learnedPatch && random() < 0.65 ? learnedPatch.oscillatorType : wave,
    detuneCents: tunedRange(ranges.detune, learnedPatch?.detuneCents),
    filterCutoffHz: tunedRange(ranges.cutoff, learnedPatch?.filterCutoffHz, true),
    resonance: tunedRange(ranges.resonance, learnedPatch?.resonance),
    attackSeconds: tunedRange(ranges.attack, learnedPatch?.attackSeconds),
    releaseSeconds: tunedRange(ranges.release, learnedPatch?.releaseSeconds),
    lfoRateHz: tunedRange(ranges.lfo, learnedPatch?.lfoRateHz),
    distortion: tunedRange(ranges.drive, learnedPatch?.distortion),
  };
}

export class AutoMixerEngine {
  private static instance: AutoMixerEngine | null = null;

  public static getInstance(): AutoMixerEngine {
    if (!AutoMixerEngine.instance) {
      AutoMixerEngine.instance = new AutoMixerEngine();
    }
    return AutoMixerEngine.instance;
  }

  /** Apply a genre profile, learned synth parameters, and conservative stem headroom. */
  public autoMixSong(song: Song, preferredStyleId?: string): AutoMixResult {
    // 1. Resolve a genre-appropriate profile, preserving any learned/user choice.
    let matchedStyle: UndergroundDubstepStyle = UNDERGROUND_DUBSTEP_STYLES[0];

    if (preferredStyleId) {
      const found = UNDERGROUND_DUBSTEP_STYLES.find((s) => s.id === preferredStyleId);
      if (found) matchedStyle = found;
    } else {
      const text = `${song.genre} ${song.prompt} ${song.title}`.toLowerCase();
      const findStyle = (id: string) => UNDERGROUND_DUBSTEP_STYLES.find((style) => style.id === id);
      if (/tearout|marauda|svdden|aggressive/.test(text)) {
        matchedStyle = findStyle('tearout_marauda_style') ?? matchedStyle;
      } else if (/trench|minimal flow|infekt|getter/.test(text)) {
        matchedStyle = findStyle('trench_minimal_flow') ?? matchedStyle;
      } else if (/dmz|mala|coki|sound system|dubplate/.test(text)) {
        matchedStyle = findStyle('uk_sound_system_dmz') ?? matchedStyle;
      } else if (/drum ?and ?bass|\bdnb\b|neurofunk|halftime|1985|alix perez|shades/.test(text)) {
        matchedStyle = findStyle('leftfield_halftime_neuro') ?? matchedStyle;
      } else if (/dubstep|riddim|sub bass|\b140\b/.test(text)) {
        matchedStyle = findStyle('deep_dark_dangerous') ?? matchedStyle;
      } else if (/synthwave|city pop|purple|joker|future bass|cyberpunk/.test(text)) {
        matchedStyle = findStyle('purple_sound_bristol') ?? matchedStyle;
      } else {
        matchedStyle = findStyle('balanced_studio') ?? matchedStyle;
      }
    }

    const profile = matchedStyle.autoMixProfile;
    const stemDecisions: AutoMixResult['stemDecisions'] = [];
    const updatedStems: Record<string, StemTrack> = { ...song.stems };
    let patchSeed = (song.synthesisMeta?.seed ?? (song as Song & { diffusionMeta?: { seed?: number } }).diffusionMeta?.seed ?? 1) >>> 0;
    const random = () => {
      patchSeed = (Math.imul(patchSeed, 1664525) + 1013904223) >>> 0;
      return patchSeed / 0x100000000;
    };

    // 2. Iterate through all active stems and calculate optimal gain & stereo placement
    for (const [sId, stem] of Object.entries(updatedStems)) {
      if (!stem) continue;

      const lowerId = sId.toLowerCase();
      const lowerName = stem.name.toLowerCase();
      const synthFamily =
        lowerId === 'mid_bass' || lowerId === 'bass' || lowerId.startsWith('wub_')
          ? 'bass'
          : lowerId === 'lead_synth' || lowerId === 'lead' || (lowerId.startsWith('lead_') && lowerId !== 'lead_vocals')
            ? 'lead'
            : lowerId === 'chords_harmony' || lowerId === 'chords' || lowerId.startsWith('chord_') || lowerId === 'atmosphere_pad' || lowerId.startsWith('atmo_')
              ? 'pad'
              : undefined;
      const learnedPatch = synthFamily
        ? evolutionaryEngine.getPreferredSynthPatch(song.genre, synthFamily, song.bpm)
        : undefined;
      const synthPatch = synthFamily
        ? createSynthPatch(synthFamily, random, learnedPatch, song.prompt)
        : stem.synthPatch;
      const mixSettings = createStemMixSettings(sId, stem.name);

      let targetVol = 0.85;
      let targetPan = 0;
      let reasoning = '';

      // --- SUB-BASS ---
      if (lowerId.startsWith('sub_') || lowerId === 'sub_bass' || lowerId === 'bass') {
        targetVol = profile.subVolume;
        targetPan = 0; // Pure mono anchor: absolute rule of sound system mixing
        reasoning = 'Sub-bass centered in mono with level set by the selected genre profile';
      }
      // --- ROLLING WUBS & NEURO BASS ---
      else if (lowerId.startsWith('wub_') || lowerId === 'mid_bass' || lowerName.includes('wub') || lowerName.includes('neuro')) {
        targetVol = profile.wubVolume;
        targetPan = lowerId.includes('saw') || lowerId.includes('fm') ? 0.1 : 0;
        reasoning = 'Wub level set by the selected profile; filter cutoff is controlled by the generated synth patch';
      }
      // --- HEAVY DRUMS (KICK & SNARE) ---
      else if (lowerId.startsWith('drum_') || lowerId === 'drums_kick_snare' || lowerId === 'drums') {
        if (lowerId.includes('snare') || lowerName.includes('snare') || lowerName.includes('clap')) {
          targetVol = profile.snareVolume;
          targetPan = 0;
          reasoning = 'Snare and clap centered with level set by the selected profile';
        } else {
          targetVol = profile.kickVolume;
          targetPan = 0;
          reasoning = 'Kick centered in mono with level set by the selected profile';
        }
      }
      // --- PERCUSSION & CYMBALS ---
      else if (lowerId.startsWith('perc_') || lowerId === 'percussion_cymbals' || lowerName.includes('hat') || lowerName.includes('percussion')) {
        targetVol = profile.percVolume;
        targetPan = lowerId.includes('open') ? -0.2 : 0.18;
        reasoning = 'Percussion placed modestly off-center; master EQ follows the selected profile';
      }
      // --- LEADS & LASER ZAPS ---
      else if (lowerId.startsWith('lead_') || lowerId === 'lead_synth' || lowerId === 'lead' || lowerName.includes('laser')) {
        targetVol = profile.leadsVolume;
        targetPan = 0.15;
        reasoning = 'Laser leads and sirens panned slightly right (+0.15) for stereo width and ear candy';
      }
      // --- CHORDS & KEYS ---
      else if (lowerId.startsWith('chord_') || lowerId === 'chords_harmony' || lowerId === 'chords') {
        targetVol = profile.chordsVolume;
        targetPan = -0.18;
        reasoning = 'Harmonic chords positioned left (-0.18) with warm body to balance leads';
      }
      // --- ATMOSPHERE & DRONES ---
      else if (lowerId.startsWith('atmo_') || lowerId === 'atmosphere_pad' || lowerName.includes('drone') || lowerName.includes('atmosphere')) {
        targetVol = profile.atmoVolume;
        targetPan = 0;
        reasoning = 'Atmosphere centered; reverb amount follows the selected master profile';
      }
      // --- VOCALS & CHANTS ---
      else if (lowerId.startsWith('vocal_') || lowerId === 'lead_vocals' || lowerId === 'backing_vocals' || lowerId === 'vocals') {
        if (lowerId.includes('backing') || lowerId.includes('whisper')) {
          targetVol = profile.vocalsVolume * 0.85;
          targetPan = -0.25;
          reasoning = 'Backing layer reduced and offset left for separation';
        } else {
          targetVol = profile.vocalsVolume;
          targetPan = 0;
          reasoning = 'Lead vocal centered with level set by the selected profile';
        }
      }
      // --- BUILDUPS, RISERS & DROPS ---
      else if (lowerId.startsWith('rise_') || lowerId.startsWith('drop_') || lowerId === 'fx_transitions' || lowerId === 'fx') {
        targetVol = profile.fxVolume;
        targetPan = lowerId.startsWith('drop_') ? 0 : 0.1;
        reasoning = 'Impact drops and tension risers boosted for massive section transitions';
      }

      // Apply updates to stem
      updatedStems[sId] = {
        ...stem,
        volume: Math.round(targetVol * 100) / 100,
        pan: Math.round(targetPan * 100) / 100,
        synthPatch,
        mixSettings,
      };

      stemDecisions.push({
        stemId: sId,
        stemName: stem.name,
        newVolume: updatedStems[sId].volume,
        newPan: updatedStems[sId].pan,
        mixSettings,
        reasoning,
      });
    }

    const anySolo = Object.values(updatedStems).some((stem) => stem?.solo);
    const activeStems = Object.entries(updatedStems).filter(([, stem]) =>
      Boolean(stem && !stem.muted && stem.notes?.length && (!anySolo || stem.solo))
    );
    const summedStemPower = activeStems.reduce((total, [, stem]) => total + (stem.volume ?? 0.85) ** 2, 0);
    const headroomTrim = Math.min(1, Math.sqrt(8 / Math.max(8, summedStemPower)));
    const headroomTrimDb = headroomTrim < 1 ? 20 * Math.log10(headroomTrim) : 0;

    if (headroomTrim < 1) {
      for (const [stemId] of activeStems) {
        const trimmedVolume = Math.round((updatedStems[stemId].volume * headroomTrim) * 100) / 100;
        updatedStems[stemId] = { ...updatedStems[stemId], volume: trimmedVolume };
        const decision = stemDecisions.find((item) => item.stemId === stemId);
        if (decision) decision.newVolume = trimmedVolume;
      }
    }

    // 3. Update AudioEngine Live Parameters
    audioEngine.setEqualizer(profile.eqLowDb, profile.eqMidDb, profile.eqHighDb);
    audioEngine.setReverbLevel(profile.reverbWet);

    const updatedSong: Song = {
      ...song,
      stems: updatedStems,
      mixProfileId: matchedStyle.id,
    };

    audioEngine.loadSong(updatedSong);

    return {
      updatedSong,
      appliedProfileName: matchedStyle.name,
      appliedStyleId: matchedStyle.id,
      adjustmentsCount: stemDecisions.length,
      activeStemCount: activeStems.length,
      headroomTrimDb: Math.round(headroomTrimDb * 10) / 10,
      stemDecisions,
      masterEq: {
        lowDb: profile.eqLowDb,
        midDb: profile.eqMidDb,
        highDb: profile.eqHighDb,
      },
      reverbWetPercent: Math.round(profile.reverbWet * 100),
      summary: `Profile "${matchedStyle.name}" balanced ${activeStems.length} active stems${headroomTrimDb < 0 ? ` with ${Math.abs(headroomTrimDb).toFixed(1)}dB headroom trim` : ''}; master EQ ${profile.eqLowDb}/${profile.eqMidDb}/${profile.eqHighDb}dB, reverb ${Math.round(profile.reverbWet * 100)}%.`,
    };
  }
}

export const autoMixer = AutoMixerEngine.getInstance();
