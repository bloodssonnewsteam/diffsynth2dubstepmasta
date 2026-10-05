/**
 * DiffRhythm 2 - Web Audio API Full-Stack Synthesis & Playback Engine
 */

import { Song, StemType, NoteEvent, ChordEvent } from '../types/music';
import { noteToFreq, audioBufferToWav } from '../utils/audioMath';

// Formant vowel frequencies for vocal synthesizer
const VOWEL_FORMANTS: Record<string, { f1: number; f2: number; q1: number; q2: number }> = {
  a: { f1: 800, f2: 1250, q1: 6, q2: 7 },
  e: { f1: 530, f2: 1840, q1: 5, q2: 8 },
  i: { f1: 280, f2: 2250, q1: 5, q2: 9 },
  o: { f1: 500, f2: 900, q1: 6, q2: 6 },
  u: { f1: 320, f2: 800, q1: 5, q2: 6 },
};

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ctx: AudioContext | null = null;

  private isPlaying: boolean = false;
  private playbackStartTime: number = 0;
  private pausedAtTime: number = 0;
  private songDuration: number = 60;
  private currentSong: Song | null = null;

  // Master Nodes
  private masterGain: GainNode | null = null;
  private eqLow: BiquadFilterNode | null = null;
  private eqMid: BiquadFilterNode | null = null;
  private eqHigh: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;

  // Stem channel nodes
  private stemNodes: Record<string, { gain: GainNode; panner: StereoPannerNode }> = {};

  // Noise buffers for drums
  private noiseBuffer: AudioBuffer | null = null;

  // Timer loop for scheduling notes
  private scheduleInterval: number | null = null;
  private nextBeatToSchedule: number = 0;
  private lookaheadMs: number = 100;
  private scheduleAheadSec: number = 0.25;

  // Active oscillator cleanup registry
  private activeScheduledNodes: { stop: (time: number) => void }[] = [];

  // Listeners
  private onTimeUpdateCallbacks: Set<(currentTime: number) => void> = new Set();
  private onStateChangeCallbacks: Set<(isPlaying: boolean) => void> = new Set();

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Create Master Chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    this.eqLow = this.ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 250;
    this.eqLow.gain.value = 0;

    this.eqMid = this.ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1500;
    this.eqMid.Q.value = 1.0;
    this.eqMid.gain.value = 0;

    this.eqHigh = this.ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 5000;
    this.eqHigh.gain.value = 0;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.15;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    // Build Algorithmic Reverb Impulse
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.buildImpulseResponse(this.ctx, 2.2, 2.0);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.22;

    // Master wiring:
    // masterGain -> eqLow -> eqMid -> eqHigh -> compressor -> analyser -> destination
    this.masterGain.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    this.eqHigh.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Reverb loop
    this.reverbGain.connect(this.masterGain);

    // Init stem channels for 10-stem architecture (with legacy stem aliases)
    const stemTypes: (StemType | string)[] = [
      'lead_vocals',
      'backing_vocals',
      'lead_synth',
      'chords_harmony',
      'atmosphere_pad',
      'sub_bass',
      'mid_bass',
      'drums_kick_snare',
      'percussion_cymbals',
      'fx_transitions',
      // Legacy aliases
      'vocals',
      'lead',
      'chords',
      'bass',
      'drums',
      'fx',
    ];
    for (const stem of stemTypes) {
      const gain = this.ctx.createGain();
      gain.gain.value = 0.85;

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : (this.ctx.createGain() as any);
      gain.connect(panner);
      panner.connect(this.masterGain);

      // Reverb send for melodic and atmospheric stems
      if (['lead_vocals', 'backing_vocals', 'lead_synth', 'chords_harmony', 'atmosphere_pad', 'fx_transitions', 'vocals', 'lead', 'chords', 'fx'].includes(stem)) {
        const sendGain = this.ctx.createGain();
        sendGain.gain.value = stem.includes('backing') || stem.includes('atmosphere') ? 0.45 : 0.28;
        gain.connect(sendGain);
        sendGain.connect(this.reverbNode);
      }

      this.stemNodes[stem as any] = { gain, panner };
    }

    if (this.reverbNode) {
      this.reverbNode.connect(this.reverbGain);
    }

    // Build reusable white noise buffer (2 seconds)
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private buildImpulseResponse(ctx: AudioContext | BaseAudioContext, duration: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  public async resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public loadSong(song: Song) {
    this.currentSong = song;
    this.songDuration = song.durationSec || 60;
    this.updateStemRouting();
  }

  public updateStemRouting() {
    if (!this.currentSong || !this.ctx) return;
    const anySolo = Object.values(this.currentSong.stems).some((s) => s.solo);

    for (const [stemId, stem] of Object.entries(this.currentSong.stems) as [string, any][]) {
      let channel = this.stemNodes[stemId];
      if (!channel && this.ctx && this.masterGain) {
        const gain = this.ctx.createGain();
        gain.gain.value = stem.volume ?? 0.85;
        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : (this.ctx.createGain() as any);
        gain.connect(panner);
        panner.connect(this.masterGain);
        channel = { gain, panner };
        this.stemNodes[stemId] = channel;
      }
      if (!channel) continue;

      let effectiveGain = stem.volume;
      if (stem.muted) {
        effectiveGain = 0;
      } else if (anySolo && !stem.solo) {
        effectiveGain = 0;
      }

      channel.gain.gain.setTargetAtTime(effectiveGain, this.ctx.currentTime, 0.02);
      if (channel.panner && 'pan' in channel.panner) {
        channel.panner.pan.setTargetAtTime(stem.pan ?? 0, this.ctx.currentTime, 0.02);
      }
    }
  }

  public setMasterVolume(val: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, val)), this.ctx.currentTime, 0.02);
  }

  public setEqualizer(low: number, mid: number, high: number) {
    if (!this.ctx) return;
    if (this.eqLow) this.eqLow.gain.setTargetAtTime(low, this.ctx.currentTime, 0.05);
    if (this.eqMid) this.eqMid.gain.setTargetAtTime(mid, this.ctx.currentTime, 0.05);
    if (this.eqHigh) this.eqHigh.gain.setTargetAtTime(high, this.ctx.currentTime, 0.05);
  }

  public setReverbLevel(val: number) {
    if (!this.reverbGain || !this.ctx) return;
    this.reverbGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public async play(fromTime?: number) {
    await this.resumeContext();
    if (!this.ctx || !this.currentSong) return;

    if (this.isPlaying) {
      this.pause();
    }

    const seekTime = fromTime !== undefined ? fromTime : this.pausedAtTime;
    this.pausedAtTime = seekTime;
    this.playbackStartTime = this.ctx.currentTime - seekTime;
    this.isPlaying = true;

    this.startScheduler();
    this.notifyStateChange(true);
  }

  public pause() {
    if (!this.isPlaying) return;
    if (this.ctx) {
      this.pausedAtTime = Math.max(0, this.ctx.currentTime - this.playbackStartTime);
    }
    this.stopScheduler();
    this.killActiveVoices();
    this.isPlaying = false;
    this.notifyStateChange(false);
  }

  public stop() {
    this.pause();
    this.pausedAtTime = 0;
    this.notifyTimeUpdate(0);
  }

  public seek(timeSeconds: number) {
    const wasPlaying = this.isPlaying;
    this.stopScheduler();
    this.killActiveVoices();

    this.pausedAtTime = Math.max(0, Math.min(this.songDuration, timeSeconds));
    if (this.ctx) {
      this.playbackStartTime = this.ctx.currentTime - this.pausedAtTime;
    }
    this.notifyTimeUpdate(this.pausedAtTime);

    if (wasPlaying) {
      this.play(this.pausedAtTime);
    }
  }

  public getCurrentTime(): number {
    if (!this.ctx) return 0;
    if (this.isPlaying) {
      const cur = this.ctx.currentTime - this.playbackStartTime;
      if (cur >= this.songDuration) {
        // Loop back to start
        this.seek(0);
        return 0;
      }
      return Math.min(cur, this.songDuration);
    }
    return this.pausedAtTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startScheduler() {
    this.stopScheduler();
    if (!this.currentSong || !this.ctx) return;

    const bpm = this.currentSong.bpm || 120;
    const secPerBeat = 60 / bpm;
    const currentSongTime = this.getCurrentTime();
    this.nextBeatToSchedule = Math.floor(currentSongTime / secPerBeat);

    this.scheduleInterval = window.setInterval(() => {
      this.scheduleLoop();
    }, this.lookaheadMs);
  }

  private stopScheduler() {
    if (this.scheduleInterval !== null) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  private scheduleLoop() {
    if (!this.ctx || !this.currentSong || !this.isPlaying) return;

    const currentSongTime = this.getCurrentTime();
    this.notifyTimeUpdate(currentSongTime);

    const bpm = this.currentSong.bpm || 120;
    const secPerBeat = 60 / bpm;
    const scheduleWindowEnd = currentSongTime + this.scheduleAheadSec;

    // Schedule all notes that fall into [currentSongTime, scheduleWindowEnd]
    const stems = this.currentSong.stems;
    for (const [stemType, stem] of Object.entries(stems) as [StemType, any][]) {
      if (!stem || !stem.notes) continue;

      for (const note of stem.notes as NoteEvent[]) {
        const noteStartTime = note.time * secPerBeat;
        if (noteStartTime >= currentSongTime && noteStartTime < scheduleWindowEnd) {
          const audioStartTime = this.playbackStartTime + noteStartTime;
          const noteDurationSec = Math.max(0.05, (note.duration || 0.5) * secPerBeat);
          this.triggerNoteVoice(stemType, note, audioStartTime, noteDurationSec, this.ctx, this.stemNodes[stemType].gain);
        }
      }
    }
  }

  // Real-time voice triggering
  private triggerNoteVoice(
    stemType: StemType | string,
    note: NoteEvent,
    startTime: number,
    duration: number,
    ctx: AudioContext | BaseAudioContext,
    destinationNode: AudioNode
  ) {
    const freq = note.frequency || noteToFreq(note.pitch);

    const sType = String(stemType).toLowerCase();

    if (sType.startsWith('sub_') || sType === 'sub_bass') {
      this.synthSubBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
    } else if (sType.startsWith('wub_') || sType === 'mid_bass' || sType === 'bass') {
      this.synthBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, note.wobbleRate, note.pitch);
    } else if (sType.startsWith('drum_') || sType === 'drums_kick_snare' || sType === 'drums') {
      this.synthDrumHit(ctx, note.pitch, startTime, destinationNode, note.velocity);
    } else if (sType.startsWith('perc_') || sType === 'percussion_cymbals') {
      this.synthDrumHit(ctx, note.pitch, startTime, destinationNode, note.velocity);
    } else if (sType.startsWith('lead_') || sType === 'lead_synth' || sType === 'lead') {
      this.synthLeadVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
    } else if (sType.startsWith('chord_') || sType === 'chords_harmony' || sType === 'chords') {
      this.synthChordVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
    } else if (sType.startsWith('atmo_') || sType === 'atmosphere_pad') {
      this.synthAtmosphereVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
    } else if (sType.includes('backing') || sType.startsWith('vocal_whisper')) {
      this.synthVocalVoice(ctx, freq, startTime, duration, destinationNode, note.vowel || 'o', (note.velocity || 0.8) * 0.75, true);
    } else if (sType.startsWith('vocal_') || sType === 'lead_vocals' || sType === 'vocals') {
      this.synthVocalVoice(ctx, freq, startTime, duration, destinationNode, note.vowel || 'a', note.velocity);
    } else if (sType.startsWith('rise_') || sType.startsWith('drop_') || sType === 'fx_transitions' || sType === 'fx') {
      this.synthFxVoice(ctx, startTime, duration, destinationNode, note.pitch);
    } else {
      // General fallback based on pitch
      if (freq < 75) {
        this.synthSubBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
      } else if (freq < 300) {
        this.synthBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, note.wobbleRate, note.pitch);
      } else {
        this.synthLeadVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
      }
    }
  }

  // Pure Subwoofer Sub-Bass (30Hz - 60Hz fundamental)
  private synthSubBassVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.95
  ) {
    if (freq < 20 || freq > 250) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    // Subtle punch downsweep on attack
    osc.frequency.setValueAtTime(freq * 1.3, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(0.75 * vel, time + 0.02);
    amp.gain.setValueAtTime(0.75 * vel, Math.max(time + 0.02, time + duration - 0.06));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(amp);
    amp.connect(dest);

    osc.start(time);
    osc.stop(time + duration);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc.stop();
        } catch (_) {}
      },
    });
  }

  // Cinematic Atmosphere Drone Pad
  private synthAtmosphereVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.7
  ) {
    if (freq < 30 || freq > 3500) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(1600, time + duration * 0.5);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(0.35 * vel, time + 0.3); // atmospheric slow swell
    amp.gain.setValueAtTime(0.35 * vel, Math.max(time + 0.3, time + duration - 0.4));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.3);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(amp);
    amp.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.3);
    osc2.stop(time + duration + 0.3);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (_) {}
      },
    });
  }

  // --- SYNTHESIZERS ---

  // 1. Formant Vocaloid Synthesizer
  private synthVocalVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vowel: 'a' | 'e' | 'i' | 'o' | 'u',
    vel: number = 0.8,
    isBacking: boolean = false
  ) {
    if (freq < 40 || freq > 2000) return;

    // Sawtooth source with slight vibrato (or stereo detuned saw for backing)
    const osc = ctx.createOscillator();
    osc.type = isBacking ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq * (isBacking ? 1.004 : 1.0), time);

    // Vibrato LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(isBacking ? 4.8 : 5.5, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(isBacking ? 2.0 : 3.5, time);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Dual Formant Bandpass Filters (F1 and F2)
    const formants = VOWEL_FORMANTS[vowel] || VOWEL_FORMANTS.a;

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(formants.f1, time);
    f1.Q.setValueAtTime(formants.q1, time);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(formants.f2, time);
    f2.Q.setValueAtTime(formants.q2, time);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    // Smooth attack and release for natural singing
    amp.gain.linearRampToValueAtTime(0.4 * vel, time + 0.04);
    amp.gain.setValueAtTime(0.4 * vel, Math.max(time + 0.04, time + duration - 0.06));
    amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(f1);
    osc.connect(f2);
    f1.connect(amp);
    f2.connect(amp);
    amp.connect(dest);

    osc.start(time);
    lfo.start(time);
    osc.stop(time + duration);
    lfo.stop(time + duration);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc.stop();
          lfo.stop();
        } catch (_) {}
      },
    });
  }

  // 2. Rich Detuned Saw Lead Synthesizer
  private synthLeadVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.8
  ) {
    if (freq < 30 || freq > 4000) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Detune by 8 cents for thick chorus effect
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.004, time);

    // Resonant Filter Envelope
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(4.0, time);
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 4.5, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.8, time + duration);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(0.35 * vel, time + 0.02);
    amp.gain.setValueAtTime(0.35 * vel, Math.max(time + 0.02, time + duration - 0.04));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(amp);
    amp.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (_) {}
      },
    });
  }

  // 3. Polyphonic Warm Pad / Chords Synthesizer
  private synthChordVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.7
  ) {
    if (freq < 40 || freq > 3000) return;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(1.2, time);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(0.22 * vel, time + 0.08); // warm swell
    amp.gain.setValueAtTime(0.22 * vel, Math.max(time + 0.08, time + duration - 0.1));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.05);

    osc.connect(filter);
    filter.connect(amp);
    amp.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.05);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc.stop();
        } catch (_) {}
      },
    });
  }

  // 4. Dark Deep Rolling Bass & 808 Analog Sub Synthesizer
  private synthBassVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.9,
    wobbleRate?: number,
    pitchStr?: string
  ) {
    if (freq < 20 || freq > 600) return;

    const isDubstep =
      (wobbleRate && wobbleRate > 0) ||
      (pitchStr && (pitchStr.includes('wobble') || pitchStr.includes('roll') || pitchStr.includes('neuro'))) ||
      (this.currentSong?.genre?.toLowerCase().includes('dubstep'));

    if (isDubstep) {
      // --- DARK DEEP ROLLING BASS DUBSTEP SYNTHESIS ---
      // 1. Pure Sub-Bass Sine Wave (30Hz - 60Hz foundation)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq, time);

      // 2. Dual Detuned Sawtooth Waves for gritty neuro mid-range
      const saw1 = ctx.createOscillator();
      const saw2 = ctx.createOscillator();
      saw1.type = 'sawtooth';
      saw2.type = 'sawtooth';
      saw1.frequency.setValueAtTime(freq, time);
      saw2.frequency.setValueAtTime(freq * 1.008, time); // detuned by ~14 cents

      // 3. Resonant Lowpass Filter with high Q for rolling wobble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(5.8, time);

      // Modulate filter cutoff with LFO for deep rolling effect
      const lfoRate = wobbleRate || 3.5; // default 3.5Hz (1/8 note at 140 BPM)
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(lfoRate, time);

      const lfoGain = ctx.createGain();
      // Cutoff sweeps between ~120Hz and 1600Hz
      lfoGain.gain.setValueAtTime(750, time);
      filter.frequency.setValueAtTime(950, time);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Distortion / Soft-Clipper Drive
      const waveShaper = ctx.createWaveShaper();
      waveShaper.curve = this.makeDistortionCurve(18) as any;
      waveShaper.oversample = '2x';

      const sawGain = ctx.createGain();
      sawGain.gain.setValueAtTime(0.4, time);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.7, time);

      saw1.connect(sawGain);
      saw2.connect(sawGain);
      sawGain.connect(filter);
      filter.connect(waveShaper);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0, time);
      amp.gain.linearRampToValueAtTime(0.65 * vel, time + 0.02);
      amp.gain.setValueAtTime(0.65 * vel, Math.max(time + 0.02, time + duration - 0.04));
      amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

      waveShaper.connect(amp);
      subOsc.connect(subGain);
      subGain.connect(amp);
      amp.connect(dest);

      subOsc.start(time);
      saw1.start(time);
      saw2.start(time);
      lfo.start(time);

      subOsc.stop(time + duration);
      saw1.stop(time + duration);
      saw2.stop(time + duration);
      lfo.stop(time + duration);

      this.activeScheduledNodes.push({
        stop: () => {
          try {
            subOsc.stop();
            saw1.stop();
            saw2.stop();
            lfo.stop();
          } catch (_) {}
        },
      });
      return;
    }

    // Standard 808 / Analog Bass
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.4, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.04);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(freq, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, time);
    subOsc.connect(filter);
    filter.connect(subGain);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(0.55 * vel, time + 0.015);
    amp.gain.setValueAtTime(0.55 * vel, Math.max(time + 0.015, time + duration - 0.05));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(amp);
    subGain.connect(amp);
    amp.connect(dest);

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + duration);
    subOsc.stop(time + duration);

    this.activeScheduledNodes.push({
      stop: () => {
        try {
          osc.stop();
          subOsc.stop();
        } catch (_) {}
      },
    });
  }

  // Helper: Soft-clipping distortion curve
  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = typeof amount === 'number' ? amount : 20;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // 5. Procedural Synthesized Drum Kit
  private synthDrumHit(
    ctx: AudioContext | BaseAudioContext,
    type: string,
    time: number,
    dest: AudioNode,
    vel: number = 0.9
  ) {
    const drum = type.toLowerCase();

    if (drum.includes('dubstep_kick') || (drum.includes('kick') && this.currentSong?.genre?.toLowerCase().includes('dubstep'))) {
      // Massive 140 Dubstep Punch Kick (fast transient dive down to 34Hz sub fundamental)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(1.15 * vel, time);
      amp.gain.exponentialRampToValueAtTime(0.001, time + 0.48);

      // Click transient (pitch sweep at top)
      const click = ctx.createOscillator();
      click.type = 'triangle';
      click.frequency.setValueAtTime(500, time);
      click.frequency.exponentialRampToValueAtTime(120, time + 0.02);

      const clickAmp = ctx.createGain();
      clickAmp.gain.setValueAtTime(0.5 * vel, time);
      clickAmp.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

      click.connect(clickAmp);
      clickAmp.connect(dest);
      osc.connect(amp);
      amp.connect(dest);

      osc.start(time);
      click.start(time);
      osc.stop(time + 0.48);
      click.stop(time + 0.025);
    } else if (drum.includes('kick')) {
      // 808/909 Style Kick
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(1.0 * vel, time);
      amp.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(amp);
      amp.connect(dest);

      osc.start(time);
      osc.stop(time + 0.35);
    } else if (drum.includes('dubstep_snare') || drum.includes('gunshot') || (drum.includes('snare') && this.currentSong?.genre?.toLowerCase().includes('dubstep'))) {
      // Colossal Dubstep Gunshot Snare (Tight 195Hz transient + gated metallic noise)
      const toneOsc = ctx.createOscillator();
      toneOsc.type = 'triangle';
      toneOsc.frequency.setValueAtTime(210, time);
      toneOsc.frequency.exponentialRampToValueAtTime(95, time + 0.08);

      const toneAmp = ctx.createGain();
      toneAmp.gain.setValueAtTime(0.75 * vel, time);
      toneAmp.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
      toneOsc.connect(toneAmp);
      toneAmp.connect(dest);

      toneOsc.start(time);
      toneOsc.stop(time + 0.16);

      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1600, time);
        noiseFilter.Q.setValueAtTime(1.8, time);

        const noiseAmp = ctx.createGain();
        noiseAmp.gain.setValueAtTime(0.9 * vel, time);
        noiseAmp.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseAmp);
        noiseAmp.connect(dest);

        noise.start(time);
        noise.stop(time + 0.3);
      }
    } else if (drum.includes('snare')) {
      // Snappy Snare (Tone + Filtered Noise)
      const toneOsc = ctx.createOscillator();
      toneOsc.type = 'triangle';
      toneOsc.frequency.setValueAtTime(190, time);
      toneOsc.frequency.exponentialRampToValueAtTime(90, time + 0.06);

      const toneAmp = ctx.createGain();
      toneAmp.gain.setValueAtTime(0.6 * vel, time);
      toneAmp.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      toneOsc.connect(toneAmp);
      toneAmp.connect(dest);

      toneOsc.start(time);
      toneOsc.stop(time + 0.12);

      // Noise component
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1200, time);

        const noiseAmp = ctx.createGain();
        noiseAmp.gain.setValueAtTime(0.7 * vel, time);
        noiseAmp.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseAmp);
        noiseAmp.connect(dest);

        noise.start(time);
        noise.stop(time + 0.22);
      }
    } else if (drum.includes('hihat') || drum.includes('hat')) {
      // Crisp Hi-Hat
      const isOpen = drum.includes('open');
      const decay = isOpen ? 0.28 : 0.055;

      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(8500, time);
        filter.Q.setValueAtTime(2.5, time);

        const amp = ctx.createGain();
        amp.gain.setValueAtTime(0.4 * vel, time);
        amp.gain.exponentialRampToValueAtTime(0.001, time + decay);

        noise.connect(filter);
        filter.connect(amp);
        amp.connect(dest);

        noise.start(time);
        noise.stop(time + decay);
      }
    } else if (drum.includes('clap')) {
      // Multi-tap 808 Clap
      if (this.noiseBuffer) {
        const taps = [0, 0.012, 0.024];
        for (let i = 0; i < taps.length; i++) {
          const tapTime = time + taps[i];
          const isFinal = i === taps.length - 1;
          const decay = isFinal ? 0.22 : 0.02;

          const noise = ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1600, tapTime);
          filter.Q.setValueAtTime(1.8, tapTime);

          const amp = ctx.createGain();
          amp.gain.setValueAtTime((isFinal ? 0.6 : 0.4) * vel, tapTime);
          amp.gain.exponentialRampToValueAtTime(0.001, tapTime + decay);

          noise.connect(filter);
          filter.connect(amp);
          amp.connect(dest);

          noise.start(tapTime);
          noise.stop(tapTime + decay);
        }
      }
    } else if (drum.includes('crash')) {
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, time);

        const amp = ctx.createGain();
        amp.gain.setValueAtTime(0.45 * vel, time);
        amp.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

        noise.connect(filter);
        filter.connect(amp);
        amp.connect(dest);

        noise.start(time);
        noise.stop(time + 1.2);
      }
    }
  }

  // 6. FX Riser / Sub Impact
  private synthFxVoice(
    ctx: AudioContext | BaseAudioContext,
    time: number,
    duration: number,
    dest: AudioNode,
    type: string
  ) {
    if (this.noiseBuffer && type.includes('riser')) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(5000, time + duration);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.05, time);
      amp.gain.linearRampToValueAtTime(0.35, time + duration - 0.05);
      amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(amp);
      amp.connect(dest);

      noise.start(time);
      noise.stop(time + duration);
    } else {
      // Sub drop
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + Math.min(1.5, duration));

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.4, time);
      amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(amp);
      amp.connect(dest);

      osc.start(time);
      osc.stop(time + duration);
    }
  }

  private killActiveVoices() {
    for (const voice of this.activeScheduledNodes) {
      try {
        voice.stop(0);
      } catch (_) {}
    }
    this.activeScheduledNodes = [];
  }

  // --- WAV EXPORTER (Full Mix or Isolated Stems) ---

  public async exportToWav(song: Song, isolatedStem?: StemType): Promise<Blob> {
    const bpm = song.bpm || 120;
    const secPerBeat = 60 / bpm;
    const totalDuration = song.durationSec || 60;
    const sampleRate = 44100;
    const totalSamples = Math.ceil(totalDuration * sampleRate);

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    // Recreate master chain in offline context
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 0.85;

    const compressor = offlineCtx.createDynamicsCompressor();
    masterGain.connect(compressor);
    compressor.connect(offlineCtx.destination);

    // Create noise buffer for offline context
    const offlineNoise = offlineCtx.createBuffer(1, sampleRate * 2, sampleRate);
    const nData = offlineNoise.getChannelData(0);
    for (let i = 0; i < nData.length; i++) {
      nData[i] = Math.random() * 2 - 1;
    }
    const prevNoise = this.noiseBuffer;
    this.noiseBuffer = offlineNoise;

    const stemsToRender: [StemType, any][] = isolatedStem
      ? [[isolatedStem, song.stems[isolatedStem]]]
      : (Object.entries(song.stems) as [StemType, any][]);

    for (const [stemType, stem] of stemsToRender) {
      if (!stem || stem.muted || !stem.notes) continue;

      const stemGain = offlineCtx.createGain();
      stemGain.gain.value = stem.volume ?? 0.8;
      stemGain.connect(masterGain);

      for (const note of stem.notes as NoteEvent[]) {
        const noteStartTime = note.time * secPerBeat;
        if (noteStartTime >= totalDuration) continue;
        const noteDurationSec = Math.max(0.05, (note.duration || 0.5) * secPerBeat);

        this.triggerNoteVoice(stemType, note, noteStartTime, noteDurationSec, offlineCtx, stemGain);
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    this.noiseBuffer = prevNoise;
    return audioBufferToWav(renderedBuffer);
  }

  // --- Live Interactive Audition / Preview for Any of the 100 Stems ---
  public async previewStem(stemId: string, durationSec: number = 2.2): Promise<void> {
    await this.resumeContext();
    if (!this.ctx || !this.masterGain) return;

    const sType = String(stemId).toLowerCase();
    const now = this.ctx.currentTime + 0.05;

    // Direct audition channel
    const previewGain = this.ctx.createGain();
    previewGain.gain.setValueAtTime(0.9, now);
    previewGain.connect(this.masterGain);

    if (sType.startsWith('sub_') || sType.includes('sub')) {
      const freq = sType.includes('30hz') ? 30 : sType.includes('35hz') ? 35 : sType.includes('45hz') ? 45 : 36.7;
      this.synthSubBassVoice(this.ctx, freq, now, durationSec, previewGain, 1.0);
    } else if (sType.startsWith('wub_') || sType.includes('wobble') || sType.includes('wub') || sType.includes('bass')) {
      const wobble = sType.includes('1_16') ? 7.0 : sType.includes('triplet') ? 5.25 : sType.includes('tearout') ? 8.5 : 3.5;
      this.synthBassVoice(this.ctx, 73.4, now, durationSec, previewGain, 1.0, wobble, 'D2');
    } else if (sType.startsWith('drum_') || sType.includes('kick') || sType.includes('snare')) {
      const isKick = sType.includes('kick');
      this.synthDrumHit(this.ctx, isKick ? 'dubstep_kick' : 'snare', now, previewGain, 1.0);
      if (durationSec > 0.8) {
        this.synthDrumHit(this.ctx, isKick ? 'dubstep_kick' : 'snare', now + 0.5, previewGain, 0.9);
      }
    } else if (sType.startsWith('perc_') || sType.includes('hat') || sType.includes('percussion') || sType.includes('cymbal')) {
      this.synthDrumHit(this.ctx, sType.includes('crash') ? 'crash' : 'hihat_open', now, previewGain, 0.85);
      this.synthDrumHit(this.ctx, 'hihat_closed', now + 0.25, previewGain, 0.7);
      this.synthDrumHit(this.ctx, 'hihat_closed', now + 0.5, previewGain, 0.7);
    } else if (sType.startsWith('lead_') || sType.includes('lead') || sType.includes('laser')) {
      this.synthLeadVoice(this.ctx, 293.66, now, 0.5, previewGain, 0.9);
      this.synthLeadVoice(this.ctx, 349.23, now + 0.5, 0.5, previewGain, 0.9);
      this.synthLeadVoice(this.ctx, 440.0, now + 1.0, 0.8, previewGain, 0.95);
    } else if (sType.startsWith('chord_') || sType.includes('chord') || sType.includes('rhodes')) {
      this.synthChordVoice(this.ctx, 146.83, now, durationSec, previewGain, 0.8);
      this.synthChordVoice(this.ctx, 174.61, now, durationSec, previewGain, 0.8);
      this.synthChordVoice(this.ctx, 220.0, now, durationSec, previewGain, 0.8);
    } else if (sType.startsWith('atmo_') || sType.includes('drone') || sType.includes('atmosphere')) {
      this.synthAtmosphereVoice(this.ctx, 73.4, now, durationSec, previewGain, 0.85);
    } else if (sType.startsWith('vocal_') || sType.includes('vocal') || sType.includes('chant')) {
      this.synthVocalVoice(this.ctx, 146.83, now, 0.8, previewGain, 'a', 0.9);
      this.synthVocalVoice(this.ctx, 130.81, now + 0.9, 0.9, previewGain, 'o', 0.95);
    } else if (sType.startsWith('rise_') || sType.startsWith('drop_') || sType.includes('fx')) {
      this.synthFxVoice(this.ctx, now, durationSec, previewGain, sType.startsWith('rise_') ? 'riser' : 'sub_drop');
    } else {
      this.synthLeadVoice(this.ctx, 220.0, now, durationSec, previewGain, 0.8);
    }
  }

  // Callbacks
  public onTimeUpdate(cb: (t: number) => void) {
    this.onTimeUpdateCallbacks.add(cb);
    return () => this.onTimeUpdateCallbacks.delete(cb);
  }

  public onStateChange(cb: (p: boolean) => void) {
    this.onStateChangeCallbacks.add(cb);
    return () => this.onStateChangeCallbacks.delete(cb);
  }

  private notifyTimeUpdate(t: number) {
    this.onTimeUpdateCallbacks.forEach((cb) => cb(t));
  }

  private notifyStateChange(p: boolean) {
    this.onStateChangeCallbacks.forEach((cb) => cb(p));
  }
}

export const audioEngine = AudioEngine.getInstance();
