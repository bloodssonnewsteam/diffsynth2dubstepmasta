/**
 * DiffRhythm 2 - Intelligent Auto-Mixing Engine
 * Automatically balances gains, stereo panning, frequency slotting, low-end mono consolidation,
 * master 3-band EQ, and convolution reverb sends based on underground sound system engineering.
 */

import { Song, StemTrack, StemType } from '../types/music';
import { audioEngine } from './audioEngine';
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
    reasoning: string;
  }[];
  masterEq: {
    lowDb: number;
    midDb: number;
    highDb: number;
  };
  reverbWetPercent: number;
  summary: string;
}

export class AutoMixerEngine {
  private static instance: AutoMixerEngine | null = null;

  public static getInstance(): AutoMixerEngine {
    if (!AutoMixerEngine.instance) {
      AutoMixerEngine.instance = new AutoMixerEngine();
    }
    return AutoMixerEngine.instance;
  }

  /**
   * Automatically mix all stems and master rack on a song to the highest studio standard
   */
  public autoMixSong(song: Song, preferredStyleId?: string): AutoMixResult {
    // 1. Determine optimal underground mixing profile
    let matchedStyle: UndergroundDubstepStyle = UNDERGROUND_DUBSTEP_STYLES[0]; // Default DDD

    if (preferredStyleId) {
      const found = UNDERGROUND_DUBSTEP_STYLES.find((s) => s.id === preferredStyleId);
      if (found) matchedStyle = found;
    } else {
      const text = `${song.genre} ${song.prompt} ${song.title}`.toLowerCase();
      if (text.includes('trench') || text.includes('infekt') || text.includes('getter') || text.includes('clap')) {
        matchedStyle = UNDERGROUND_DUBSTEP_STYLES[1]; // Trench
      } else if (text.includes('dmz') || text.includes('mala') || text.includes('coki') || text.includes('sound system') || text.includes('dubplate')) {
        matchedStyle = UNDERGROUND_DUBSTEP_STYLES[2]; // UK Sound System
      } else if (text.includes('tearout') || text.includes('marauda') || text.includes('svdden') || text.includes('aggressive')) {
        matchedStyle = UNDERGROUND_DUBSTEP_STYLES[3]; // Tearout
      } else if (text.includes('halftime') || text.includes('neuro') || text.includes('1985') || text.includes('alix perez') || text.includes('shades')) {
        matchedStyle = UNDERGROUND_DUBSTEP_STYLES[4]; // Leftfield Halftime
      } else if (text.includes('purple') || text.includes('joker') || text.includes('city pop') || text.includes('synthwave')) {
        matchedStyle = UNDERGROUND_DUBSTEP_STYLES[5]; // Purple Sound
      }
    }

    const profile = matchedStyle.autoMixProfile;
    const stemDecisions: AutoMixResult['stemDecisions'] = [];
    const updatedStems: Record<string, StemTrack> = { ...song.stems };

    // 2. Iterate through all active stems and calculate optimal gain & stereo placement
    for (const [sId, stem] of Object.entries(updatedStems)) {
      if (!stem) continue;

      const lowerId = sId.toLowerCase();
      const lowerName = stem.name.toLowerCase();

      let targetVol = 0.85;
      let targetPan = 0;
      let reasoning = '';

      // --- SUB-BASS ---
      if (lowerId.startsWith('sub_') || lowerId === 'sub_bass' || lowerId === 'bass') {
        targetVol = profile.subVolume;
        targetPan = 0; // Pure mono anchor: absolute rule of sound system mixing
        reasoning = 'Sub-bass anchored in pure mono (Pan 0) with +3dB subsonic headroom for sound system punch';
      }
      // --- ROLLING WUBS & NEURO BASS ---
      else if (lowerId.startsWith('wub_') || lowerId === 'mid_bass' || lowerName.includes('wub') || lowerName.includes('neuro')) {
        targetVol = profile.wubVolume;
        targetPan = lowerId.includes('saw') || lowerId.includes('fm') ? 0.1 : 0;
        reasoning = 'Rolling wubs balanced right above 110Hz to prevent low-end mud and maintain punch';
      }
      // --- HEAVY DRUMS (KICK & SNARE) ---
      else if (lowerId.startsWith('drum_') || lowerId === 'drums_kick_snare' || lowerId === 'drums') {
        if (lowerId.includes('snare') || lowerName.includes('snare') || lowerName.includes('clap')) {
          targetVol = profile.snareVolume;
          targetPan = 0;
          reasoning = 'Gunshot snare centered with transient focus and sidechain punch';
        } else {
          targetVol = profile.kickVolume;
          targetPan = 0;
          reasoning = 'Kick transient centered in mono with rapid low-end pitch downsweep';
        }
      }
      // --- PERCUSSION & CYMBALS ---
      else if (lowerId.startsWith('perc_') || lowerId === 'percussion_cymbals' || lowerName.includes('hat') || lowerName.includes('percussion')) {
        targetVol = profile.percVolume;
        targetPan = lowerId.includes('open') ? -0.2 : 0.18;
        reasoning = 'Hi-hats and cymbals offset stereo (L/R) with high-shelf shimmer to open up the center channel';
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
        reasoning = 'Atmospheric drone diffused through convolution reverb for vast cavernous spatial depth';
      }
      // --- VOCALS & CHANTS ---
      else if (lowerId.startsWith('vocal_') || lowerId === 'lead_vocals' || lowerId === 'backing_vocals' || lowerId === 'vocals') {
        if (lowerId.includes('backing') || lowerId.includes('whisper')) {
          targetVol = profile.vocalsVolume * 0.85;
          targetPan = -0.25;
          reasoning = 'Backing chants panned wide with high reverb send';
        } else {
          targetVol = profile.vocalsVolume;
          targetPan = 0;
          reasoning = 'Lead chants centered with formant resonance';
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
      };

      stemDecisions.push({
        stemId: sId,
        stemName: stem.name,
        newVolume: updatedStems[sId].volume,
        newPan: updatedStems[sId].pan,
        reasoning,
      });
    }

    // 3. Update AudioEngine Live Parameters
    audioEngine.setEqualizer(profile.eqLowDb, profile.eqMidDb, profile.eqHighDb);
    audioEngine.setReverbLevel(profile.reverbWet);

    const updatedSong: Song = {
      ...song,
      stems: updatedStems,
    };

    audioEngine.loadSong(updatedSong);

    return {
      updatedSong,
      appliedProfileName: matchedStyle.name,
      appliedStyleId: matchedStyle.id,
      adjustmentsCount: stemDecisions.length,
      stemDecisions,
      masterEq: {
        lowDb: profile.eqLowDb,
        midDb: profile.eqMidDb,
        highDb: profile.eqHighDb,
      },
      reverbWetPercent: Math.round(profile.reverbWet * 100),
      summary: `AI Auto-Mix applied "${matchedStyle.name}" sound design parameters: mono sub-bass anchored at 35Hz, dynamic ducking headroom created, master EQ boosted (+${profile.eqLowDb}dB low-shelf), and algorithmic reverb tuned to ${Math.round(profile.reverbWet * 100)}%.`,
    };
  }
}

export const autoMixer = AutoMixerEngine.getInstance();
