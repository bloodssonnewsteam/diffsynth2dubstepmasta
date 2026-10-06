/**
 * DiffRhythm 2 - Comprehensive Underground Dubstep Research & Style Matrix
 * Grounded in authentic 140 BPM sound system culture, Deep Dark & Dangerous (DDD),
 * Trench, Minimal Flow, Tearout, UK Dubplate (DMZ/Mala/Coki), and Leftfield Halftime.
 */

export interface UndergroundDubstepStyle {
  id: string;
  name: string;
  pioneers: string[];
  labels: string[];
  tempoBpm: number;
  keyPreference: string;
  subBassFrequency: string; // e.g. "30Hz - 45Hz pure sine with mono anchor"
  wubModulationProfile: string;
  drumArchitecture: string;
  spaceAndAtmosphere: string;
  mixPhilosophy: string;
  autoMixProfile: {
    subVolume: number;
    wubVolume: number;
    kickVolume: number;
    snareVolume: number;
    percVolume: number;
    leadsVolume: number;
    chordsVolume: number;
    atmoVolume: number;
    vocalsVolume: number;
    fxVolume: number;
    eqLowDb: number;
    eqMidDb: number;
    eqHighDb: number;
    reverbWet: number;
  };
  samplePrompt: string;
}

export const UNDERGROUND_DUBSTEP_STYLES: UndergroundDubstepStyle[] = [
  {
    id: 'deep_dark_dangerous',
    name: 'Deep, Dark & Dangerous (DDD / Abyssal 140)',
    pioneers: ['TRUTH', 'Ternion Sound', 'Khadhe', 'ColtCuts', 'J:Kenzo', 'Sepia'],
    labels: ['Deep, Dark & Dangerous', 'Deep Medi Musik', 'Artikal Music UK'],
    tempoBpm: 140,
    keyPreference: 'D Minor',
    subBassFrequency: '32Hz - 45Hz subterranean sine with second harmonic saturation (mono-anchored)',
    wubModulationProfile: '1/8 slow hypnotic rolling wubs, formant talkbox growls, and 1/16 subtle neuro churns',
    drumArchitecture: 'Half-time syncopated 140 kick on beat 1, colossal gunshot acoustic snare on beat 3, dry ghost rimshots',
    spaceAndAtmosphere: 'Cavernous dub delay (dotted 8th repeats), 12-second decay infinite chamber reverb, subterranean cavern drones',
    mixPhilosophy: 'Subwoofer supremacy: sub is strictly mono with high headroom; mid-bass is filtered above 110Hz to preserve the clean 35Hz trench',
    autoMixProfile: {
      subVolume: 1.05,
      wubVolume: 0.92,
      kickVolume: 0.98,
      snareVolume: 0.98,
      percVolume: 0.72,
      leadsVolume: 0.78,
      chordsVolume: 0.75,
      atmoVolume: 0.78,
      vocalsVolume: 0.88,
      fxVolume: 0.82,
      eqLowDb: 3.5,
      eqMidDb: -1.0,
      eqHighDb: 1.0,
      reverbWet: 0.38,
    },
    samplePrompt:
      'Deep Dark and Dangerous 140 dubstep with heavy 35Hz sub-bass, slow hypnotic rolling wubs, cavernous dub delays, gunshot snares, and ominous vocal chants about descending into the abyss.',
  },
  {
    id: 'trench_minimal_flow',
    name: 'Trench / Minimal Flow (Infekt & Getter Sound)',
    pioneers: ['Infekt', 'Getter', 'Chibs', 'Aweminus', 'Samplifire'],
    labels: ['Disciple Round Table', 'Trenchlords', 'Never Say Die Black Label'],
    tempoBpm: 140,
    keyPreference: 'F Minor',
    subBassFrequency: '40Hz chest punch with sharp transient attack click at 800Hz',
    wubModulationProfile: 'Repetitive square-wave chomp wubs, resonant bandpass sweeps, rhythmic gate chopping',
    drumArchitecture: 'Snappy layered wooden claps instead of traditional snares, hollow transient kick, swinging 16th hats',
    spaceAndAtmosphere: 'Dry, tight room ambience with micro-gate silence cuts and fast vinyl turntable rewinds',
    mixPhilosophy: 'Minimalist punch: few stems playing simultaneously but maximum transient impact and rhythmic bounce',
    autoMixProfile: {
      subVolume: 0.98,
      wubVolume: 1.02,
      kickVolume: 1.0,
      snareVolume: 0.95,
      percVolume: 0.85,
      leadsVolume: 0.75,
      chordsVolume: 0.65,
      atmoVolume: 0.55,
      vocalsVolume: 0.85,
      fxVolume: 0.88,
      eqLowDb: 2.0,
      eqMidDb: 1.5,
      eqHighDb: 1.5,
      reverbWet: 0.18,
    },
    samplePrompt:
      'Trench style dubstep at 140 BPM with swinging square-wave chomp wubs, tight layered claps, punchy kick transients, repetitive hypnotic groove, and micro-gate silence cuts.',
  },
  {
    id: 'uk_sound_system_dmz',
    name: 'UK Sound System Original Dubplate (DMZ / Mala / Coki)',
    pioneers: ['Mala', 'Coki', 'Skream', 'Benga', 'Loefah', 'Distance', 'Kryptic Minds'],
    labels: ['DMZ', 'Tempa', 'Chestplate', 'Swamp81', 'Tectonic'],
    tempoBpm: 140,
    keyPreference: 'D Minor',
    subBassFrequency: '30Hz - 50Hz pure physical sound system vibration that rattles club walls',
    wubModulationProfile: 'Iconic Coki-style "Spongebob" wobble, lowpass filter resonance sweeps, and Loefah 40Hz sub thuds',
    drumArchitecture: 'Roots dub reggae half-time influence, live acoustic snare crack, shuffled hi-hats with swing groove',
    spaceAndAtmosphere: 'Roland Space Echo tape delays, spring reverb splashes, sirens, and Jamaican soundsystem MC dubplates',
    mixPhilosophy: 'Authentic dubplate weight: sub-bass carries the track, mids are warm analog tape saturated, highs are silky and uncompressed',
    autoMixProfile: {
      subVolume: 1.1,
      wubVolume: 0.88,
      kickVolume: 0.95,
      snareVolume: 0.92,
      percVolume: 0.78,
      leadsVolume: 0.8,
      chordsVolume: 0.82,
      atmoVolume: 0.75,
      vocalsVolume: 0.92,
      fxVolume: 0.85,
      eqLowDb: 4.0,
      eqMidDb: 0.5,
      eqHighDb: -0.5,
      reverbWet: 0.32,
    },
    samplePrompt:
      'UK sound system dubstep at 140 BPM inspired by DMZ and Mala, with warm 35Hz sub-bass weight, classic analog wobble, spring reverb splashes, tape delay echoes, and soundsystem vocal drops.',
  },
  {
    id: 'tearout_marauda_style',
    name: 'Aggressive Underground Tearout (Marauda Style)',
    pioneers: ['Marauda', 'Svdden Death', 'Nimda', 'Perry Wayne', 'Automhate'],
    labels: ['Malignant', 'Voyd', 'Subsidia Night'],
    tempoBpm: 140,
    keyPreference: 'G Minor',
    subBassFrequency: '45Hz overdriven sub foundation with multi-band clipping',
    wubModulationProfile: 'Screaming triple-detuned saw wubs, harsh metal FM screech, pitch down-dives with high Q resonance',
    drumArchitecture: 'Industrial gunshot snare with wide white noise tail, heavy 909-influenced kick distortion, metal clanks',
    spaceAndAtmosphere: 'Dark cinematic braam horns, industrial alarm sirens, apocalyptic war drones',
    mixPhilosophy: 'Maximum aggression and loudness: hard clipped transients, wide stereo mid-bass, dense sidechain ducking',
    autoMixProfile: {
      subVolume: 0.95,
      wubVolume: 1.08,
      kickVolume: 1.05,
      snareVolume: 1.05,
      percVolume: 0.8,
      leadsVolume: 0.9,
      chordsVolume: 0.65,
      atmoVolume: 0.7,
      vocalsVolume: 0.95,
      fxVolume: 0.92,
      eqLowDb: 1.5,
      eqMidDb: 2.5,
      eqHighDb: 3.0,
      reverbWet: 0.22,
    },
    samplePrompt:
      'Heavy underground tearout dubstep at 140 BPM with screaming detuned saw wubs, brutal gunshot snares, chest-crushing kick stomp, industrial sirens, and demonic pitch-shifted vocal screams.',
  },
  {
    id: 'leftfield_halftime_neuro',
    name: 'Leftfield Halftime & Neuro Bass (1985 / Alix Perez / Shades)',
    pioneers: ['Alix Perez', 'Eprom', 'Shades', 'Ivy Lab', 'Chee', 'Tsuruda'],
    labels: ['1985 Music', 'Deadbeats', '20/20 LDN', 'Division'],
    tempoBpm: 140,
    keyPreference: 'F# Minor',
    subBassFrequency: '30Hz - 60Hz modulating pitch glide sub with clean sub-harmonics',
    wubModulationProfile: '14Hz rapid neuro reese churn, granular squelch, phase cancellation wubs, modular synth chirps',
    drumArchitecture: 'Deconstructed syncopated percussion, vinyl micro-glitches, tight acoustic kick with sub boom, ghost claps',
    spaceAndAtmosphere: 'Granular reverb clouds, underwater hydrophone recordings, binaural stereo pans',
    mixPhilosophy: 'Pristine surgical clarity: ultra-wide neuro bass stereo field with perfectly anchored mono sub foundation',
    autoMixProfile: {
      subVolume: 1.0,
      wubVolume: 0.96,
      kickVolume: 0.95,
      snareVolume: 0.95,
      percVolume: 0.88,
      leadsVolume: 0.85,
      chordsVolume: 0.8,
      atmoVolume: 0.85,
      vocalsVolume: 0.82,
      fxVolume: 0.85,
      eqLowDb: 2.5,
      eqMidDb: 1.0,
      eqHighDb: 2.5,
      reverbWet: 0.35,
    },
    samplePrompt:
      'Leftfield halftime neuro bass at 140 BPM with intricate sound design, detuned reese churning wubs, deep 35Hz pitch slides, micro-glitch percussion, and dark atmospheric textures.',
  },
  {
    id: 'purple_sound_bristol',
    name: 'Bristol Purple City Sound (Joker / Gemmy / Rustie)',
    pioneers: ['Joker', 'Gemmy', 'Guido', 'Rustie', 'Ganja White Night'],
    labels: ['Kapsize', 'Planet Mu', 'SubCarbon'],
    tempoBpm: 140,
    keyPreference: 'A Minor',
    subBassFrequency: '35Hz - 55Hz warm Moog-style sub sine paired with glided 808s',
    wubModulationProfile: 'Talkbox wobble melodies, smooth portamento basslines, funky wah-wah formant envelopes',
    drumArchitecture: 'Crisp 808 electro-funk claps, sizzling open hi-hats, swinging rim clicks',
    spaceAndAtmosphere: 'Vintage 80s analog synth chords (Juno/Jupiter), shimmering arpeggios, nostalgic city light pads',
    mixPhilosophy: 'Harmonic richness: lush polyphonic synths sitting gracefully above deep rolling basslines',
    autoMixProfile: {
      subVolume: 0.95,
      wubVolume: 0.92,
      kickVolume: 0.95,
      snareVolume: 0.92,
      percVolume: 0.82,
      leadsVolume: 0.9,
      chordsVolume: 0.88,
      atmoVolume: 0.8,
      vocalsVolume: 0.85,
      fxVolume: 0.8,
      eqLowDb: 2.0,
      eqMidDb: 1.0,
      eqHighDb: 2.0,
      reverbWet: 0.28,
    },
    samplePrompt:
      'Purple dubstep at 140 BPM with lush retro synthesizer chords, talkbox vocaloid wub melodies, gliding 808 sub bass, crisp claps, and midnight cityscape nostalgia.',
  },
  {
    id: 'balanced_studio',
    name: 'Balanced Studio (Lo-Fi / Acoustic / General)',
    pioneers: [],
    labels: [],
    tempoBpm: 110,
    keyPreference: 'C Major',
    subBassFrequency: 'Controlled low end with mono-compatible bass fundamentals',
    wubModulationProfile: 'Subtle modulation only where present in the arrangement',
    drumArchitecture: 'Moderate transient levels with space for melodic content',
    spaceAndAtmosphere: 'Conservative reverb and centered low frequencies',
    mixPhilosophy: 'Balanced stem levels, restrained master EQ, and headroom for varied genres',
    autoMixProfile: {
      subVolume: 0.78,
      wubVolume: 0.68,
      kickVolume: 0.8,
      snareVolume: 0.76,
      percVolume: 0.62,
      leadsVolume: 0.72,
      chordsVolume: 0.72,
      atmoVolume: 0.62,
      vocalsVolume: 0.8,
      fxVolume: 0.56,
      eqLowDb: 0,
      eqMidDb: 0,
      eqHighDb: 0,
      reverbWet: 0.2,
    },
    samplePrompt: 'Balanced mix with clear transients, restrained low-frequency buildup, and natural stereo placement.',
  },
];
