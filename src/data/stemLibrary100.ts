/**
 * DiffRhythm 2 - 100 Unique Stem Matrix & 100-Stage Mastered Wub Engine
 * Defines 100 distinct sound design stems across 10 families and 100 melded micro-movement stages.
 */

import { StemTrack, SongStageBlock, NoteEvent } from '../types/music';

export interface StemDefinition {
  id: string;
  name: string;
  family:
    | 'sub_bass'
    | 'rolling_wubs'
    | 'heavy_drums'
    | 'percussion'
    | 'leads'
    | 'chords'
    | 'atmosphere'
    | 'vocals'
    | 'buildups'
    | 'drops_fx';
  familyLabel: string;
  instrument: string;
  color: string;
  defaultPan: number;
  defaultVolume: number;
  wubSpeed?: string;
  frequencyRange: string;
  description: string;
}

export const STEM_FAMILIES = [
  { id: 'sub_bass', label: '1. Sub-Bass & Subwoofers (30-60Hz)', icon: '🔊', color: '#eab308' },
  { id: 'rolling_wubs', label: '2. Rolling Wubs & Neuro Bass', icon: '🌀', color: '#f97316' },
  { id: 'heavy_drums', label: '3. Heavy Dubstep Drums & Impacts', icon: '💥', color: '#10b981' },
  { id: 'percussion', label: '4. Percussion, Cymbals & Textures', icon: '⚡', color: '#14b8a6' },
  { id: 'leads', label: '5. Lead Synthesizers & Laser Hooks', icon: '🎹', color: '#06b6d4' },
  { id: 'chords', label: '6. Chords, Keys & Harmonies', icon: '✨', color: '#a855f7' },
  { id: 'atmosphere', label: '7. Atmospheric Drones & Textures', icon: '🌌', color: '#818cf8' },
  { id: 'vocals', label: '8. Vocals, Chants & Growls', icon: '🎙️', color: '#f43f5e' },
  { id: 'buildups', label: '9. Buildup Risers & Tension FX', icon: '📈', color: '#ec4899' },
  { id: 'drops_fx', label: '10. Drops, Downlifters & Mastered Cuts', icon: '🚀', color: '#6366f1' },
];

// Full catalog of 100 unique studio stems
export const STEM_LIBRARY_100: StemDefinition[] = [
  // --- Family 1: Sub-Bass & Subwoofers (1-10) ---
  { id: 'sub_30hz_clean', name: '30Hz Pure Sub Sine', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Pure 30Hz Subwoofer Sine', color: '#eab308', defaultPan: 0, defaultVolume: 1.0, frequencyRange: '30Hz - 45Hz', description: 'Clean subsonic fundamental that shakes floorboards' },
  { id: 'sub_35hz_rumble', name: '35Hz Deep Trench Sub', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Subterranean 35Hz Rumble', color: '#ca8a04', defaultPan: 0, defaultVolume: 1.0, frequencyRange: '35Hz - 55Hz', description: 'Classic deep dubstep trench frequency' },
  { id: 'sub_45hz_punch', name: '45Hz Chest Punch Sub', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Punchy 45Hz Low-End Sub', color: '#eab308', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '45Hz - 65Hz', description: 'Immediate physical chest hit on drop beats' },
  { id: 'sub_808_glide', name: 'Pitch-Glide 808 Sub', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Portamento Gliding 808 Sub', color: '#facc15', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '32Hz - 70Hz', description: 'Smooth octave pitch slides on bar turnarounds' },
  { id: 'sub_harmonic_sat', name: 'Sub Harmonic Saturator', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Warm Tube Saturated Sub', color: '#d97706', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '30Hz - 90Hz', description: 'Adds second-order harmonics so sub cuts through small speakers' },
  { id: 'sub_infra_drone', name: 'Infra-Sub Abyss Drone', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Continuous 28Hz Abyssal Drone', color: '#b45309', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '28Hz - 42Hz', description: 'Atmospheric sub-bed sustaining through breakdowns' },
  { id: 'sub_12tone_dive', name: 'Sub 12-Tone Dive', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Exponential Pitch-Drop Sub', color: '#eab308', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '120Hz -> 30Hz', description: 'Rapid downward pitch dive on main drop impacts' },
  { id: 'sub_analog_drive', name: 'Overdriven Analog Sub', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Overdriven Moog Style Sub', color: '#f59e0b', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '35Hz - 85Hz', description: 'Warm clipping drive for aggressive low-end crunch' },
  { id: 'sub_click_transient', name: 'Sub Transient Click', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Fast Transient Click (800Hz)', color: '#fbbf24', defaultPan: 0, defaultVolume: 0.75, frequencyRange: '800Hz transient', description: 'Gives the sub note attack definition in dense mixes' },
  { id: 'sub_resonance_peak', name: 'Peak Resonant Sub', family: 'sub_bass', familyLabel: 'Sub-Bass', instrument: 'Q-Boosted Resonant Sub Sine', color: '#f59e0b', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '40Hz peak', description: 'Narrow high-Q boost creating focused sub vibration' },

  // --- Family 2: Rolling Wubs & Neuro Bass (11-20) ---
  { id: 'wub_1_8_rolling', name: '1/8 Dark Rolling Wub', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'LFO 3.5Hz Resonant Lowpass Wub', color: '#f97316', defaultPan: 0, defaultVolume: 0.95, wubSpeed: '1/8 Roll (3.5Hz)', frequencyRange: '100Hz - 1.2kHz', description: 'The definitive deep rolling dubstep wub groove' },
  { id: 'wub_1_16_neuro', name: '1/16 Neuro Churn Wub', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Rapid 7.0Hz Neuro Churn Filter', color: '#ea580c', defaultPan: 0, defaultVolume: 0.95, wubSpeed: '1/16 Neuro (7.0Hz)', frequencyRange: '120Hz - 2.5kHz', description: 'Rapid rolling neurofunk wub modulation' },
  { id: 'wub_triplet_roll', name: '1/8T Triplet Rolling Wub', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Polymetric 5.25Hz Triplet Wub', color: '#fb923c', defaultPan: 0, defaultVolume: 0.9, wubSpeed: '1/8 Triplet (5.25Hz)', frequencyRange: '110Hz - 1.8kHz', description: 'Swinging triplet rolls that create intense bounce' },
  { id: 'wub_yoi_growl', name: 'Formant "Yoi" Growl', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Dual Bandpass Vowel Growler', color: '#f97316', defaultPan: 0, defaultVolume: 0.95, wubSpeed: 'Formant Yoi', frequencyRange: '250Hz - 3.2kHz', description: 'Vocaloid talkbox growl shouting "Yoi-Yoi"' },
  { id: 'wub_tearout_saw', name: 'Screaming Tearout Saw', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Triple Detuned Saw with Hard Clip', color: '#c2410c', defaultPan: 0.1, defaultVolume: 0.9, wubSpeed: 'Aggro Tearout', frequencyRange: '150Hz - 4.5kHz', description: 'Abrasive metal-edged tearout bass punch' },
  { id: 'wub_acid_sweep', name: 'Acid 303 Resonant Wobble', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'TB-303 Style High-Resonance Sweep', color: '#f97316', defaultPan: -0.1, defaultVolume: 0.85, wubSpeed: 'Acid Sweep', frequencyRange: '180Hz - 3.8kHz', description: 'High-resonance squelch sweeping across octaves' },
  { id: 'wub_reese_churn', name: 'Detuned Reese Heavy Churn', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Multi-Saw Reese with Phase Cancellation', color: '#ea580c', defaultPan: 0, defaultVolume: 0.9, wubSpeed: 'Reese Churn', frequencyRange: '90Hz - 2.0kHz', description: 'Heavy phase-beating reese bass texture' },
  { id: 'wub_granular_squelch', name: 'Granular Squelch Wub', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Grain-Sampled Gutter Squelch', color: '#fb923c', defaultPan: 0.15, defaultVolume: 0.85, wubSpeed: 'Granular Squelch', frequencyRange: '200Hz - 3.0kHz', description: 'Wet, organic squelch transients between beats' },
  { id: 'wub_talkbox_chomp', name: 'Talkbox Vowel Bass Chomp', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: 'Formant Vowel A-O-U Filter Chomp', color: '#f97316', defaultPan: 0, defaultVolume: 0.9, wubSpeed: 'Vowel Chomp', frequencyRange: '300Hz - 2.4kHz', description: 'Chomping vocal vowel filter envelope' },
  { id: 'wub_fm_metallic', name: 'FM Metallic Screech Wub', family: 'rolling_wubs', familyLabel: 'Rolling Wubs', instrument: '2-Op FM Cross-Modulated Screech', color: '#c2410c', defaultPan: 0.2, defaultVolume: 0.85, wubSpeed: 'FM Screech', frequencyRange: '400Hz - 6.0kHz', description: 'Metallic industrial screech cuts through dense sub' },

  // --- Family 3: Heavy Dubstep Drums & Impacts (21-30) ---
  { id: 'drum_140_punch_kick', name: '140 Sub Punch Kick', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Transient Swept Punch Kick (175Hz->36Hz)', color: '#10b981', defaultPan: 0, defaultVolume: 1.0, frequencyRange: '36Hz - 175Hz', description: 'Heavy weight kick engineered for 140 BPM dubstep' },
  { id: 'drum_gunshot_snare', name: 'Colossal Gunshot Snare', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: '210Hz Punch + Gated Noise Crack', color: '#059669', defaultPan: 0, defaultVolume: 1.0, frequencyRange: '210Hz + White Noise', description: 'Gunshot acoustic snap on beat 3' },
  { id: 'drum_gated_snare_crack', name: 'Gated 200Hz Snare Crack', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Gated Metallic Reverb Snare', color: '#10b981', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '200Hz - 8kHz', description: 'Huge 80s gated reverb tail cut cleanly on half-beats' },
  { id: 'drum_808_clap_layer', name: 'Multi-Tap 808 Clap Layer', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Triple Tap Analog Clap', color: '#34d399', defaultPan: 0.1, defaultVolume: 0.8, frequencyRange: '1.2kHz - 5kHz', description: 'Layered over gunshot snare for stereo width' },
  { id: 'drum_ghost_rimshot', name: 'Ghost Note Rimshot', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Wood & Metal Rim Click', color: '#059669', defaultPan: -0.15, defaultVolume: 0.65, frequencyRange: '900Hz - 3kHz', description: 'Intricate ghost syncopations between beats 1 and 3' },
  { id: 'drum_sub_boom_kick', name: 'Sub Bass Boom Kick', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Decaying 808 Boom Kick', color: '#10b981', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '38Hz sustain', description: 'Long sub tail kick on drop accents' },
  { id: 'drum_acoustic_transient', name: 'Acoustic Punch Transient', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Birch Wood Kick Beater Click', color: '#34d399', defaultPan: 0, defaultVolume: 0.7, frequencyRange: '2.5kHz - 6kHz', description: 'Gives the kick high-end snap' },
  { id: 'drum_halftime_kick_sync', name: 'Syncopated Dubstep Kick', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Offbeat Half-Time Sync Kick', color: '#10b981', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '45Hz - 160Hz', description: 'Triggered on beat 2.5 of alternate bars' },
  { id: 'drum_snare_roll_engine', name: 'Accelerating Snare Roll', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Accelerating 16th/32nd Snare Machine', color: '#059669', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '190Hz - 7kHz', description: 'Drives tension through pre-drop buildups' },
  { id: 'drum_sub_stomp_impact', name: 'Sub Stomp Impact', family: 'heavy_drums', familyLabel: 'Heavy Drums', instrument: 'Giant Industrial Foot Stomp', color: '#047857', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '35Hz - 1.5kHz', description: 'Massive downbeat impact with stereo reverb' },

  // --- Family 4: Percussion, Cymbals & Textures (31-40) ---
  { id: 'perc_16th_closed_hat', name: 'Sizzling 16th Metallic Hats', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'High-Velocity 16th Hat Pattern', color: '#14b8a6', defaultPan: 0.15, defaultVolume: 0.8, frequencyRange: '6kHz - 16kHz', description: 'Fast rolling hi-hat groove' },
  { id: 'perc_open_halftime_hat', name: 'Half-Time Open Hat', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Sizzling 808 Open Hi-Hat', color: '#0d9488', defaultPan: -0.2, defaultVolume: 0.85, frequencyRange: '5kHz - 14kHz', description: 'Accented open hat on upbeat of beats 2 & 4' },
  { id: 'perc_ride_ping', name: 'Ride Cymbal Bell Ping', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Heavy Bronze Ride Bell Ping', color: '#2dd4bf', defaultPan: 0.25, defaultVolume: 0.75, frequencyRange: '3kHz - 12kHz', description: 'Crisp bell pings driving second drop groove' },
  { id: 'perc_crash_swell', name: 'Crash Cymbal Impact Swell', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: '18-Inch Dark Crash with Long Decay', color: '#14b8a6', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '2kHz - 18kHz', description: 'Explosive crash on section drops' },
  { id: 'perc_shaker_groove', name: 'Cabasa / Shaker Groove', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Organic Latin Cabasa Shaker', color: '#0d9488', defaultPan: -0.15, defaultVolume: 0.65, frequencyRange: '4kHz - 15kHz', description: 'Subtle high-frequency groove bed' },
  { id: 'perc_metal_clank', name: 'Industrial Metal Clank', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Pipe Clank & Iron Anvil Strike', color: '#14b8a6', defaultPan: 0.2, defaultVolume: 0.75, frequencyRange: '1.5kHz - 8kHz', description: 'Dark metallic percussive accent' },
  { id: 'perc_glitch_click', name: 'Glitch Perc Click', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Microsound Clicks & Cuts', color: '#2dd4bf', defaultPan: -0.25, defaultVolume: 0.6, frequencyRange: '2kHz - 10kHz', description: 'IDM micro-glitch ear candy' },
  { id: 'perc_woodblock_clack', name: 'Woodblock Perc Clack', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Resonant Teak Wood Block', color: '#0f766e', defaultPan: 0.15, defaultVolume: 0.7, frequencyRange: '800Hz - 2.5kHz', description: 'Mid-range percussive syncopation' },
  { id: 'perc_vinyl_dust', name: 'Vinyl Dust & Crackle', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: '33 RPM Turntable Vinyl Noise', color: '#14b8a6', defaultPan: 0, defaultVolume: 0.5, frequencyRange: 'Wideband Noise', description: 'Lo-fi analog warmth and atmosphere' },
  { id: 'perc_reverse_cymbal', name: 'Reverse Cymbal Wash', family: 'percussion', familyLabel: 'Percussion & Hats', instrument: 'Reversed Crash Cymbal Swell', color: '#2dd4bf', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '1.5kHz - 16kHz', description: 'Sucks tension back into every drop hit' },

  // --- Family 5: Lead Synthesizers & Laser Hooks (41-50) ---
  { id: 'lead_fm_laser_zap', name: 'FM Laser Zap Hook', family: 'leads', familyLabel: 'Lead Synths', instrument: '2-Op Pitch Modulated FM Laser', color: '#06b6d4', defaultPan: 0.15, defaultVolume: 0.85, frequencyRange: '500Hz - 5kHz', description: 'Iconic dubstep laser zaps and chirps' },
  { id: 'lead_screaming_saw', name: 'Detuned Screamer Saw', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Supersaw Detuned 7 Voices', color: '#0891b2', defaultPan: -0.15, defaultVolume: 0.85, frequencyRange: '400Hz - 6kHz', description: 'Thick unison lead for main melodic themes' },
  { id: 'lead_siren_screech', name: 'Abyssal Siren Screech', family: 'leads', familyLabel: 'Lead Synths', instrument: 'High-Resonance LFO Siren Lead', color: '#22d3ee', defaultPan: 0.25, defaultVolume: 0.8, frequencyRange: '800Hz - 4kHz', description: 'Emergency alarm siren piercing through drop' },
  { id: 'lead_cyber_arpeggio', name: 'Cyberpunk Arpeggio', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Clock-Synced 16th Arpeggiator', color: '#06b6d4', defaultPan: -0.2, defaultVolume: 0.75, frequencyRange: '600Hz - 3.5kHz', description: 'Hypnotic minor arpeggio cascading through verse' },
  { id: 'lead_square_pluck', name: '80s Square Pluck Hook', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Short Decay Resonant Square Pluck', color: '#0e7490', defaultPan: 0.1, defaultVolume: 0.8, frequencyRange: '500Hz - 3kHz', description: 'Punchy melodic counter-melody' },
  { id: 'lead_pitch_bend_glide', name: 'Portamento Pitch Glide', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Monophonic Legato Glide Saw', color: '#06b6d4', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '300Hz - 2.5kHz', description: 'Whining pitch bends between melodic anchors' },
  { id: 'lead_distorted_horn', name: 'Distorted Synth Horn', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Braam Style Cinematic Brass Horn', color: '#0891b2', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '150Hz - 2.8kHz', description: 'Massive Inception-style braam horns on drops' },
  { id: 'lead_poly_saw_stab', name: 'Polyphonic Saw Stabs', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Dual Saw Staccato Chord Stabs', color: '#22d3ee', defaultPan: -0.1, defaultVolume: 0.8, frequencyRange: '400Hz - 4kHz', description: 'Pumping syncopated stabs behind wub rhythms' },
  { id: 'lead_octave_laser_chime', name: 'High-Octave Laser Chime', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Bell-Chime Sine with Ring Mod', color: '#06b6d4', defaultPan: 0.2, defaultVolume: 0.7, frequencyRange: '1.5kHz - 8kHz', description: 'Ethereal high-octave counter-melody' },
  { id: 'lead_eerie_minor_flute', name: 'Eerie Minor Synth Flute', family: 'leads', familyLabel: 'Lead Synths', instrument: 'Breathy Triangle Flute with Vibrato', color: '#0891b2', defaultPan: -0.15, defaultVolume: 0.75, frequencyRange: '400Hz - 2.2kHz', description: 'Haunting minor-scale motif in intro and outro' },

  // --- Family 6: Chords, Keys & Harmonies (51-60) ---
  { id: 'chord_rhodes_vintage', name: 'Vintage Rhodes Mk II', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Rhodes Electric Piano with Tremolo', color: '#a855f7', defaultPan: -0.15, defaultVolume: 0.8, frequencyRange: '150Hz - 3.5kHz', description: 'Warm electric piano tines and mellow chords' },
  { id: 'chord_juno_pad', name: 'Warm Juno Poly Pad', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Juno-106 Analog Chorus Pad', color: '#9333ea', defaultPan: 0, defaultVolume: 0.75, frequencyRange: '200Hz - 4kHz', description: 'Lush chorused vintage analog pads' },
  { id: 'chord_minor9_abyssal', name: 'Minor 9th Abyssal Pad', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Dark Minor 9th Chord Voicings', color: '#c084fc', defaultPan: 0.2, defaultVolume: 0.75, frequencyRange: '180Hz - 3.2kHz', description: 'Haunting minor jazz chords underpinning wubs' },
  { id: 'chord_strings_detuned', name: 'Detuned String Ensemble', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Dark Orchestral Celli & Violins', color: '#a855f7', defaultPan: -0.2, defaultVolume: 0.7, frequencyRange: '150Hz - 5kHz', description: 'Cinematic string swells during breakdowns' },
  { id: 'chord_dark_grand_piano', name: 'Dark Grand Piano', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Concert Grand with Filtered Lows', color: '#7e22ce', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '100Hz - 4.5kHz', description: 'Stately classical minor chord progressions' },
  { id: 'chord_choir_pad', name: 'Celestial Choir Pad', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Vocal Choir Sustained Formant Pad', color: '#a855f7', defaultPan: 0.15, defaultVolume: 0.7, frequencyRange: '300Hz - 3.8kHz', description: 'Angelic backing choir lifting chorus parts' },
  { id: 'chord_organ_stabs', name: 'Deep Church Organ Stabs', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Pipe Organ with Rotary Speaker', color: '#9333ea', defaultPan: -0.1, defaultVolume: 0.75, frequencyRange: '120Hz - 3kHz', description: 'Gothic church organ chords adding solemn grandeur' },
  { id: 'chord_brass_stack', name: 'Poly Brass Stack', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Synthesized Brass Ensemble', color: '#c084fc', defaultPan: 0.2, defaultVolume: 0.8, frequencyRange: '200Hz - 4.5kHz', description: 'Bold brass stabs pushing melodic tension' },
  { id: 'chord_wah_keys', name: 'Wah-Wah Electric Keys', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Envelope Filter Clavinet / Wurlitzer', color: '#a855f7', defaultPan: -0.15, defaultVolume: 0.7, frequencyRange: '250Hz - 3kHz', description: 'Funky filtered keys for groove sections' },
  { id: 'chord_shimmer_pad', name: 'Ambient Shimmer Reverb Pad', family: 'chords', familyLabel: 'Chords & Keys', instrument: 'Octave-Shifted Shimmer Reverb', color: '#9333ea', defaultPan: 0, defaultVolume: 0.65, frequencyRange: '600Hz - 10kHz', description: 'Glittering high-frequency harmonic halo' },

  // --- Family 7: Atmospheric Drones & Textures (61-70) ---
  { id: 'atmo_trench_drone', name: 'Trench Abyssal Drone', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Deep Sub-Trench Ambient Drone', color: '#818cf8', defaultPan: 0, defaultVolume: 0.75, frequencyRange: '40Hz - 800Hz', description: 'Continuous deep ocean trench atmosphere' },
  { id: 'atmo_reverb_tail', name: 'Deep Space Reverb Tail', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: '12-Second Infinite Reverb Decay', color: '#6366f1', defaultPan: 0, defaultVolume: 0.6, frequencyRange: '100Hz - 6kHz', description: 'Vast cosmic space texture' },
  { id: 'atmo_sub_rumble_bed', name: 'Subterranean Rumble Bed', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Low Earth Vibration Drone', color: '#4f46e5', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '35Hz - 120Hz', description: 'Subtle geological rumbling beneath the entire mix' },
  { id: 'atmo_drone_resonance', name: 'Dark Drone Resonance', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Pitched Comb Filter Drone', color: '#818cf8', defaultPan: 0.2, defaultVolume: 0.7, frequencyRange: '150Hz - 1.5kHz', description: 'Resonant harmonic drone aligned with root key' },
  { id: 'atmo_filtered_noise', name: 'Filtered Noise Floor', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Pink Noise Lowpass Swept Floor', color: '#6366f1', defaultPan: -0.2, defaultVolume: 0.5, frequencyRange: '100Hz - 2kHz', description: 'Provides dense tape texture in quiet passages' },
  { id: 'atmo_cyber_city', name: 'Cyber City Ambience', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Rain & Distant Siren Field Sample', color: '#4338ca', defaultPan: 0, defaultVolume: 0.6, frequencyRange: 'Full Spectrum', description: 'Neo-Tokyo midnight cityscape texture' },
  { id: 'atmo_foghorn_bass', name: 'Foghorn Bass Drone', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Low Port Horn Resonator', color: '#818cf8', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '75Hz - 500Hz', description: 'Distant foghorn drone sounding every 16 bars' },
  { id: 'atmo_tape_hiss', name: 'Tape Hiss Saturation', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Reel-to-Reel Tape Hiss Layer', color: '#6366f1', defaultPan: 0, defaultVolume: 0.45, frequencyRange: '3kHz - 14kHz', description: 'Warm analog studio noise floor' },
  { id: 'atmo_hydrophone', name: 'Submerged Hydrophone', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Underwater Sonar Hydrophone', color: '#4f46e5', defaultPan: -0.15, defaultVolume: 0.65, frequencyRange: '80Hz - 1.2kHz', description: 'Murky underwater pressure waves' },
  { id: 'atmo_void_whisper', name: 'Eerie Void Whisper', family: 'atmosphere', familyLabel: 'Atmosphere & Drone', instrument: 'Granular Whispered Voices in Reverb', color: '#818cf8', defaultPan: 0.25, defaultVolume: 0.55, frequencyRange: '400Hz - 5kHz', description: 'Ghostly voices drifting across the stereo field' },

  // --- Family 8: Vocals, Chants & Growls (71-80) ---
  { id: 'vocal_formant_chants', name: 'Formant Sub Chants', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Formant Synthesized Vocal Chants', color: '#f43f5e', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '200Hz - 3.5kHz', description: 'Synchronized melodic vocals with karaoke lyrics' },
  { id: 'vocal_demon_pitch_shift', name: 'Demon Pitch-Shifted Voice', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: '12-Semitone Downshifted Vocal', color: '#e11d48', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '100Hz - 1.8kHz', description: 'Deep monstrous vocal shouting "DARK ROLLING BASS"' },
  { id: 'vocal_vocoder_melody', name: 'Cybernetic Vocoder Melody', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: '16-Band Carrier Vocoder', color: '#fb7185', defaultPan: 0.1, defaultVolume: 0.85, frequencyRange: '250Hz - 4.5kHz', description: 'Robotic Kraftwerk / Daft Punk style harmonies' },
  { id: 'vocal_battle_shouts', name: 'Battle Shouts & Hypes', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Aggressive Dubstep Crowd Shouts', color: '#f43f5e', defaultPan: -0.1, defaultVolume: 0.9, frequencyRange: '300Hz - 3kHz', description: 'Pre-drop shouts: "DROP IT", "PULL UP", "FEEL THE SUB"' },
  { id: 'vocal_female_lead_hook', name: 'Soaring Cyber-Pop Female', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Formant Female Soloist with Vibrato', color: '#fda4af', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '350Hz - 5.5kHz', description: 'Emotional soaring lead vocals across chorus' },
  { id: 'vocal_glitched_chops', name: 'Glitched Vocal Chops', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Stutter-Sliced Pitch Vocal Chops', color: '#f43f5e', defaultPan: 0.2, defaultVolume: 0.8, frequencyRange: '400Hz - 4kHz', description: 'Rhythmic chopped vocal riffs jumping in stereo' },
  { id: 'vocal_breathy_pad', name: 'Breathy Vocal Pad', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Aah/Ooh Vocal Breath Texture', color: '#fb7185', defaultPan: -0.2, defaultVolume: 0.7, frequencyRange: '300Hz - 3kHz', description: 'Smooth backing vocal chords' },
  { id: 'vocal_reverse_sweep', name: 'Reverse Vocal Swell', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Time-Reversed Vocal Phrase in Reverb', color: '#f43f5e', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '250Hz - 3.5kHz', description: 'Reverse vocal intake leading into main lines' },
  { id: 'vocal_robot_phrase', name: 'Robot Phrase Generator', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Speech Synthesizer TTS Voice', color: '#e11d48', defaultPan: 0.15, defaultVolume: 0.8, frequencyRange: '200Hz - 3.2kHz', description: 'Cold mechanical system notices: "SUBWOOFER OVERLOAD"' },
  { id: 'vocal_whisper_choir', name: 'Whisper Choir Harmony', family: 'vocals', familyLabel: 'Vocals & Chants', instrument: 'Multi-Track Whispering Ensemble', color: '#fda4af', defaultPan: -0.25, defaultVolume: 0.65, frequencyRange: '1kHz - 8kHz', description: 'Eerie whispers adding intimate tension' },

  // --- Family 9: Buildup Risers & Tension FX (81-90) ---
  { id: 'rise_linear_pitch', name: 'Linear Pitch Riser', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Sawtooth Continuous Pitch Slide', color: '#ec4899', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '100Hz -> 8kHz', description: 'Classic rising synth tension before drop' },
  { id: 'rise_noise_sweep', name: 'Exponential Noise Sweep', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Bandpass Filtered White Noise Sweep', color: '#db2777', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '200Hz -> 10kHz', description: 'Massive rushing air pressure before impact' },
  { id: 'rise_snare_accelerando', name: 'Snare Accelerando Machine', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Quarter -> 8th -> 16th -> 32nd Snare', color: '#f472b6', defaultPan: 0, defaultVolume: 0.9, frequencyRange: '200Hz - 6kHz', description: 'Accelerating snare roll driving the dancefloor' },
  { id: 'rise_granular_stutter', name: 'Granular Stutter Riser', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Sample-and-Hold Chopped Riser', color: '#ec4899', defaultPan: 0.2, defaultVolume: 0.8, frequencyRange: '300Hz - 7kHz', description: 'Stuttering glitch chops accelerating in speed' },
  { id: 'rise_sub_uplifter', name: 'Filtered Sub Uplifter', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Low-Frequency Resonance Uplift', color: '#be185d', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '40Hz -> 400Hz', description: 'Sub frequencies rising upward before drop silence' },
  { id: 'rise_reverse_wash', name: 'Reverse Cymbal Wash', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Long 4-Bar Reversed Cymbal Swell', color: '#ec4899', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '1kHz - 15kHz', description: 'Smooth metallic crescendo' },
  { id: 'rise_siren_alarm', name: 'Siren Buildup Alarm', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'High-Pitch Red Alert Klaxon', color: '#db2777', defaultPan: -0.15, defaultVolume: 0.85, frequencyRange: '800Hz - 3.5kHz', description: 'Warning siren signaling immediate drop' },
  { id: 'rise_jet_sweep', name: 'White Noise Jet Sweep', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Flanged White Noise Jet Engine', color: '#f472b6', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '100Hz - 16kHz', description: 'Jet plane takeoff rush of white noise' },
  { id: 'rise_drone_crescendo', name: 'Tension Drone Crescendo', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Orchestral Brass & Synth Swell', color: '#ec4899', defaultPan: 0, defaultVolume: 0.8, frequencyRange: '120Hz - 3kHz', description: 'Heavy cinematic chord swelling in volume' },
  { id: 'rise_octave_climb', name: 'Multi-Octave Pitch Climb', family: 'buildups', familyLabel: 'Buildup & Risers', instrument: 'Shepard Tone Infinite Pitch Climb', color: '#db2777', defaultPan: 0.1, defaultVolume: 0.8, frequencyRange: '200Hz -> 6kHz', description: 'Infinite psychoacoustic rising illusion' },

  // --- Family 10: Drops, Downlifters & Mastered Cuts (91-100) ---
  { id: 'drop_sub_impact_100t', name: '100-Ton Sub Impact', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Colossal Low-End Explosion Impact', color: '#6366f1', defaultPan: 0, defaultVolume: 1.0, frequencyRange: '25Hz - 500Hz', description: 'The absolute heaviest drop impact on beat 1' },
  { id: 'drop_sub_boom', name: 'Sub Drop Bass Boom', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Classic 808 Sub Drop Boom (110Hz->30Hz)', color: '#4f46e5', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '30Hz - 110Hz', description: 'Deep bass drop rolling through floor' },
  { id: 'drop_metal_plate_crash', name: 'Metal Plate Crash', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'High-Density Steel Plate Crash', color: '#818cf8', defaultPan: 0.15, defaultVolume: 0.9, frequencyRange: '1kHz - 18kHz', description: 'Abrasive metallic hit marking drop start' },
  { id: 'drop_lowend_explosion', name: 'Low-End Explosion', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Cinema Subwoofer Demolition Boom', color: '#6366f1', defaultPan: 0, defaultVolume: 0.95, frequencyRange: '28Hz - 250Hz', description: 'Shockwave felt in the chest' },
  { id: 'drop_tape_stop', name: 'Tape Stop Cut Effect', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Motorized Vinyl / Tape Brake', color: '#4338ca', defaultPan: 0, defaultVolume: 0.9, frequencyRange: 'Full Spectrum Pitch Cut', description: 'Sudden pitch-drop brake right before drop hits' },
  { id: 'drop_reverb_splash', name: 'Reverb Splash Dissolve', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Gated 100% Wet Reverb Splash', color: '#6366f1', defaultPan: 0, defaultVolume: 0.75, frequencyRange: '300Hz - 8kHz', description: 'Envelops the drop in massive spatial depth' },
  { id: 'drop_laser_downsweep', name: 'Laser Gun Downsweep', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Sci-Fi Heavy Cannon Downsweep', color: '#818cf8', defaultPan: -0.15, defaultVolume: 0.85, frequencyRange: '4kHz -> 150Hz', description: 'Laser down-ramp on drop switch' },
  { id: 'drop_glitch_cut', name: 'Glitch Breakdown Cut', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Sudden 0.1s Total Audio Silence Cut', color: '#4f46e5', defaultPan: 0, defaultVolume: 1.0, frequencyRange: 'Full Silence Gate', description: 'Dead silence micro-gap right before the wubs roll' },
  { id: 'drop_vinyl_rewind', name: 'Vinyl DJ Rewind Scrape', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: '12-Inch Turntable Quick Rewind', color: '#6366f1', defaultPan: 0.2, defaultVolume: 0.8, frequencyRange: '400Hz - 7kHz', description: 'Sound system rewind pull-up effect' },
  { id: 'drop_final_dissolve', name: 'Final Sub Dissolve', family: 'drops_fx', familyLabel: 'Drops & Impacts', instrument: 'Long Decay Sub Tail into Abyss', color: '#3730a3', defaultPan: 0, defaultVolume: 0.85, frequencyRange: '30Hz decay', description: 'Sub frequencies slowly dissolving into silence at track end' },
];

/**
 * 100-Stage Mastered Matrix Generator
 * Divides the 3+ minute track into up to 100 perfected micro-stages, transitions, buildups, and drops.
 */
export function generate100Stages(
  durationSec: number = 199,
  bpm: number = 140,
  isDubstep: boolean = true,
  requestedStageCount: number = 100
): SongStageBlock[] {
  const stageCount = Math.max(20, Math.min(100, Math.round(requestedStageCount / 5) * 5));
  const stageDuration = durationSec / stageCount; // ~1.99s per micro-stage
  const stages: SongStageBlock[] = [];

  const wubTypes = [
    '35Hz Sub Dive',
    '1/8 Dark Rolling Wub',
    '1/16 Neuro Churn',
    '1/8 Triplet Bounce',
    'Formant Yoi Growl',
    'Screaming Tearout Saw',
    'Reese Phase Churn',
    'Talkbox Vowel Chomp',
    'FM Metallic Screech',
    'Acid 303 Resonance',
  ];

  for (let i = 1; i <= stageCount; i++) {
    const startSec = Math.round((i - 1) * stageDuration * 10) / 10;
    const endSec = Math.round(i * stageDuration * 10) / 10;
    const progress = i / stageCount;
    const stage = Math.ceil(progress * 100);

    let type: SongStageBlock['type'] = 'wub_roll';
    let tension = 50;
    let name = '';
    let description = '';
    let wub = wubTypes[i % wubTypes.length];

    // Stage 1 to 14: Intro & Sub Awakening
    if (stage <= 14) {
      type = i === 1 ? 'sub_dive' : 'transition';
      tension = Math.round(20 + (stage / 14) * 25);
      name = `Stage ${String(i).padStart(2, '0')}: Sub Drone Awakening [${stage}/14]`;
      description = 'Subterranean 35Hz rumble with eerie ambient pads';
      wub = '30Hz Sub Bed';
    }
    // Stage 15 to 28: Verse 1 & Rhythm Exposition
    else if (stage <= 28) {
      type = 'wub_roll';
      tension = Math.round(45 + ((stage - 14) / 14) * 20);
      name = `Stage ${String(i).padStart(2, '0')}: Halftime Groove Lock [${stage - 14}/14]`;
      description = '140 BPM kick & ghost rimshots with syncopated sub pulses';
      wub = '1/8 Rolling Sub';
    }
    // Stage 29 to 38: Buildup 1 & Accelerando Snare Tension
    else if (stage <= 38) {
      type = 'buildup';
      tension = Math.round(65 + ((stage - 28) / 10) * 32);
      name = `Stage ${String(i).padStart(2, '0')}: Accelerando Snare Build [${stage - 28}/10]`;
      description = 'Rising pitch sweeps, 16th snare rolls, and escalating tension';
      wub = 'Pitch Riser / Uplift';
    }
    // Stage 39: False Drop / Micro-Cut Silence
    else if (stage === 39 || (stageCount < 100 && i === Math.round(stageCount * 0.39))) {
      type = 'fakeout';
      tension = 98;
      name = `Stage 39: Pre-Drop Micro-Cut Silence`;
      description = 'Total audio silence gate (0.2s pause) before colossal impact';
      wub = 'Dead Silence Cut';
    }
    // Stage 40 to 60: DROP 1 - Peak 140 Rolling Wub Destruction
    else if (stage <= 60) {
      type = stage === 40 || (stageCount < 100 && i === Math.round(stageCount * 0.39) + 1)
        ? 'drop'
        : stage % 5 === 0 ? 'tearout' : 'wub_roll';
      tension = Math.round(90 + Math.sin((stage - 40) * 0.5) * 10);
      name = `Stage ${String(i).padStart(2, '0')}: Drop I - ${wub} Surge [${stage - 39}/21]`;
      description = 'Heavy gunshot snares, 35Hz sub punch, and modulated rolling wubs';
    }
    // Stage 61 to 72: Deep Breakdown & Atmospheric Abyss
    else if (stage <= 72) {
      type = 'breakdown';
      tension = Math.round(40 + Math.sin((stage - 60) * 0.4) * 15);
      name = `Stage ${String(i).padStart(2, '0')}: Abyssal Trench Breakdown [${stage - 60}/12]`;
      description = 'Atmospheric minor drones, vocal chops, and deep sub currents';
      wub = 'Reese Phase Churn';
    }
    // Stage 73 to 82: Buildup 2 - Maximum Intensity Accelerando
    else if (stage <= 82) {
      type = 'buildup';
      tension = Math.round(70 + ((stage - 72) / 10) * 29);
      name = `Stage ${String(i).padStart(2, '0')}: Secondary Shockwave Build [${stage - 72}/10]`;
      description = '32nd snare bursts, siren alarms, and laser pitch climbing';
      wub = 'Siren Alarm Climb';
    }
    // Stage 83: Pre-Drop 2 Vacuum Cut
    else if (stage === 83 || (stageCount < 100 && i === Math.round(stageCount * 0.83))) {
      type = 'fakeout';
      tension = 100;
      name = `Stage 83: Pre-Drop 2 Vacuum Drop Breath`;
      description = 'Inhaling reverse vocal wash into sub-zero vacuum';
      wub = 'Vacuum Gate Cut';
    }
    // Stage 84 to 96: DROP 2 - Colossal Tearout Wub Overload
    else if (stage <= 96) {
      type = stage <= 84 || (stageCount < 100 && i === Math.round(stageCount * 0.83) + 1) ? 'drop' : 'tearout';
      tension = Math.round(95 + Math.cos((stage - 84) * 0.6) * 5);
      name = `Stage ${String(i).padStart(2, '0')}: Drop II - ${wub} Tearout [${stage - 83}/13]`;
      description = 'Maximum 140 dubstep overload with hyper-neuro wub modulation';
    }
    // Stage 97 to 100: Atmospheric Outro & Sub Dissolve
    else {
      type = 'transition';
      tension = Math.round(30 - ((stage - 96) / 4) * 20);
      name = `Stage ${String(i).padStart(2, '0')}: Sub Dissolve into Darkness [${i - 96}/4]`;
      description = 'Sub frequencies dissipating into infinity and tape fadeout';
      wub = '30Hz Sub Fade';
    }

    if (!isDubstep) {
      const stageName: Record<SongStageBlock['type'], string> = {
        sub_dive: 'Opening Texture',
        transition: 'Transition',
        wub_roll: 'Main Groove',
        buildup: 'Energy Build',
        drop: 'Main Hook',
        breakdown: 'Breakdown',
        tearout: 'Instrumental Variation',
        fakeout: 'Brief Pause',
      };
      name = `Stage ${String(i).padStart(2, '0')}: ${stageName[type]}`;
      description = 'Genre-specific instrumental arrangement movement';
      wub = type === 'buildup' ? 'Riser and rhythmic lift' : type === 'drop' ? 'Main instrumental hook' : 'Synth texture';
    }

    stages.push({
      id: `stage_${i}`,
      stageNumber: i,
      name,
      type,
      startSec,
      endSec,
      tensionLevel: Math.min(100, Math.max(10, tension)),
      wubModulation: wub,
      activeStemCount: type === 'drop' || type === 'tearout' ? 18 : type === 'buildup' ? 14 : 10,
      description,
    });
  }

  return stages;
}

/**
 * Intelligent Music Comprehension & Prompt DNA Extractor
 */
export function analyzeMusicComprehension(prompt: string, customParams?: any) {
  const p = prompt.toLowerCase();

  // Sub-genre detection
  let extractedGenre = 'Electronic';
  if (p.includes('riddim')) extractedGenre = 'Riddim Dubstep';
  else if (p.includes('tearout')) extractedGenre = 'Tearout Dubstep';
  else if (p.includes('neurofunk') || p.includes('dnb') || p.includes('drum and bass')) extractedGenre = 'Neurofunk Drum & Bass';
  else if (p.includes('synthwave') || p.includes('cyberpunk')) extractedGenre = 'Cyberpunk Synthwave';
  else if (p.includes('city pop')) extractedGenre = 'Japanese City Pop';
  else if (p.includes('lo-fi') || p.includes('chillhop')) extractedGenre = 'Lo-Fi Chillhop';
  else if (p.includes('future bass')) extractedGenre = 'Future Bass';
  else if (p.includes('hyperpop')) extractedGenre = 'Hyperpop';
  else if (p.includes('melodic trap') || p.includes('808 trap')) extractedGenre = 'Melodic Trap';
  else if (p.includes('house') || p.includes('techno')) extractedGenre = 'House / Techno';
  else if (p.includes('ambient') || p.includes('soundscape')) extractedGenre = 'Ambient';
  else if (p.includes('jazz') || p.includes('neo-soul') || p.includes('r&b')) extractedGenre = 'Jazz / Neo-Soul';
  else if (p.includes('dubstep') || p.includes('deep sub')) extractedGenre = 'Deep Dubstep';
  if (typeof customParams?.genre === 'string' && customParams.genre.trim()) extractedGenre = customParams.genre;

  // BPM Detection
  const bpmMatch = p.match(/(\d{2,3})\s*bpm/i);
  const genreLower = extractedGenre.toLowerCase();
  const inferredBpm = genreLower.includes('drum') || genreLower.includes('dnb') ? 174
    : genreLower.includes('lo-fi') ? 84
      : genreLower.includes('city') ? 116
        : genreLower.includes('ambient') ? 90
          : genreLower.includes('house') || genreLower.includes('techno') ? 124
            : genreLower.includes('dubstep') ? 140 : 128;
  const detectedBpm = Math.max(30, Math.min(240, Number(customParams?.bpm) || (bpmMatch ? Number(bpmMatch[1]) : inferredBpm)));

  // Key detection
  let detectedKey = customParams?.key || (genreLower.includes('lo-fi') ? 'Eb Major' : genreLower.includes('city') ? 'A Major' : 'D Minor');
  const keyMatches = ['d minor', 'f minor', 'f# minor', 'a minor', 'c minor', 'g minor', 'a major', 'eb major'];
  if (!customParams?.key) {
    for (const km of keyMatches) {
      if (p.includes(km)) {
        detectedKey = km.charAt(0).toUpperCase() + km.slice(1);
        break;
      }
    }
  }

  // Wub & Sub Profile
  let subBassProfile = genreLower.includes('dubstep') ? '35Hz mono sub foundation' : 'Genre-balanced low-frequency foundation';
  if (p.includes('808')) subBassProfile = 'Pitch-gliding 808 sub foundation';
  if (p.includes('clean')) subBassProfile = 'Clean sine sub with controlled harmonics';

  let wubArchitecture = customParams?.wubSpeed || 'Prompt-shaped synth modulation';
  if (p.includes('tearout')) wubArchitecture = 'Aggressive Multi-Detuned Tearout Saw with Hard-Clipping';
  if (p.includes('triplet')) wubArchitecture = 'Polymetric 1/8-Triplet Bounce with Squelch Growls';

  return {
    extractedGenre,
    detectedBpm,
    detectedKey,
    subBassProfile,
    wubArchitecture,
    buildDropCount: Math.max(20, Math.min(100, Number(customParams?.buildDropCount) || 100)),
    lyricTheme: p.slice(0, 120),
    energyVarianceScore: customParams?.variance !== undefined ? Math.round(customParams.variance * 100) : 85,
  };
}
