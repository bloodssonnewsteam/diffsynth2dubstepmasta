/**
 * DiffRhythm 2 - Web Audio API Full-Stack Synthesis & Playback Engine
 */

import { Song, StemType, NoteEvent, ChordEvent, SynthPatch, StemMixSettings, StemTrack } from '../types/music';
import { noteToFreq, audioBufferToWav } from '../utils/audioMath';

// Formant vowel frequencies for vocal synthesizer
const VOWEL_FORMANTS: Record<string, { f1: number; f2: number; q1: number; q2: number }> = {
  a: { f1: 800, f2: 1250, q1: 6, q2: 7 },
  e: { f1: 530, f2: 1840, q1: 5, q2: 8 },
  i: { f1: 280, f2: 2250, q1: 5, q2: 9 },
  o: { f1: 500, f2: 900, q1: 6, q2: 6 },
  u: { f1: 320, f2: 800, q1: 5, q2: 6 },
};

function defaultStemMixSettings(stemId: string, stemName: string): StemMixSettings {
  const id = stemId.toLowerCase();
  const name = stemName.toLowerCase();
  if ((id.startsWith('sub_') || id === 'sub_bass') && !id.includes('click')) return { lowCutHz: 25, highCutHz: 180, reverbSend: 0 };
  if (id === 'mid_bass' || id === 'bass' || id.startsWith('wub_')) return { lowCutHz: 65, highCutHz: 6500, reverbSend: 0.04 };
  if (id.includes('kick')) return { lowCutHz: 28, highCutHz: 9000, reverbSend: 0 };
  if (id.includes('snare') || id.includes('clap')) return { lowCutHz: 100, highCutHz: 14000, reverbSend: 0.08 };
  if (id.startsWith('perc_') || id === 'percussion_cymbals') return { lowCutHz: /hat|cymbal|ride/.test(`${id} ${name}`) ? 1600 : 300, highCutHz: 18000, reverbSend: 0.06 };
  if (id.includes('vocal')) return { lowCutHz: 100, highCutHz: 15000, reverbSend: id.includes('backing') ? 0.28 : 0.14 };
  if (id.startsWith('lead_') || id === 'lead') return { lowCutHz: 140, highCutHz: 16000, reverbSend: 0.12 };
  if (id.startsWith('chord_') || id.includes('chords')) return { lowCutHz: 110, highCutHz: 11000, reverbSend: 0.22 };
  if (id.startsWith('atmo_') || id.includes('atmosphere') || name.includes('drone')) return { lowCutHz: 70, highCutHz: 9000, reverbSend: 0.38 };
  if (id.startsWith('rise_') || id.startsWith('drop_') || id.includes('fx')) return { lowCutHz: 45, highCutHz: 16000, reverbSend: 0.12 };
  return { lowCutHz: 100, highCutHz: 16000, reverbSend: 0.1 };
}

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ctx: AudioContext | null = null;

  private isPlaying: boolean = false;
  private loopEnabled: boolean = true;
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
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private masterVolume = 0.85;
  private masterEq = { low: 0, mid: 0, high: 0 };
  private reverbWet = 0.22;

  // Stem channel nodes
  private stemNodes: Record<string, {
    gain: GainNode;
    lowCut: BiquadFilterNode;
    highCut: BiquadFilterNode;
    panner: StereoPannerNode;
    reverbSend: GainNode;
  }> = {};

  // Noise buffers for drums
  private noiseBuffer: AudioBuffer | null = null;

  // Timer loop for scheduling notes
  private scheduleInterval: number | null = null;
  private nextBeatToSchedule: number = 0;
  private lookaheadMs: number = 50;
  private scheduleAheadSec: number = 0.5;
  private scheduledNoteKeys = new Set<string>();

  // Active oscillator cleanup registry
  private activeScheduledNodes: { stop: (time: number) => void }[] = [];

  // Listeners
  private onTimeUpdateCallbacks: Set<(currentTime: number) => void> = new Set();
  private onStateChangeCallbacks: Set<(isPlaying: boolean) => void> = new Set();
  private onSongCompleteCallbacks: Set<(songId: string) => void> = new Set();

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
    this.masterGain.gain.value = this.masterVolume;

    this.eqLow = this.ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 250;
    this.eqLow.gain.value = this.masterEq.low;

    this.eqMid = this.ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1500;
    this.eqMid.Q.value = 1.0;
    this.eqMid.gain.value = this.masterEq.mid;

    this.eqHigh = this.ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 5000;
    this.eqHigh.gain.value = this.masterEq.high;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.15;

    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -1.5;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.08;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    // Build Algorithmic Reverb Impulse
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.buildImpulseResponse(this.ctx, 2.2, 2.0);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = this.reverbWet;

    // Master wiring:
    // masterGain -> eqLow -> eqMid -> eqHigh -> compressor -> analyser -> destination
    this.masterGain.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    this.eqHigh.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Reverb loop
    this.reverbGain.connect(this.masterGain);

    if (this.reverbNode) {
      this.reverbNode.connect(this.reverbGain);
    }

    this.updateStemRouting();

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

  private createStemChannel(stemId: string, stem: StemTrack) {
    if (!this.ctx || !this.masterGain || !this.reverbNode) return undefined;
    const gain = this.ctx.createGain();
    const lowCut = this.ctx.createBiquadFilter();
    lowCut.type = 'highpass';
    const highCut = this.ctx.createBiquadFilter();
    highCut.type = 'lowpass';
    const panner = this.ctx.createStereoPanner
      ? this.ctx.createStereoPanner()
      : (this.ctx.createGain() as unknown as StereoPannerNode);
    const reverbSend = this.ctx.createGain();
    const settings = stem.mixSettings ?? defaultStemMixSettings(stemId, stem.name);

    gain.gain.value = stem.volume ?? 0.85;
    lowCut.frequency.value = settings.lowCutHz;
    highCut.frequency.value = settings.highCutHz;
    reverbSend.gain.value = settings.reverbSend;
    gain.connect(lowCut);
    lowCut.connect(highCut);
    highCut.connect(panner);
    panner.connect(this.masterGain);
    highCut.connect(reverbSend);
    reverbSend.connect(this.reverbNode);

    return { gain, lowCut, highCut, panner, reverbSend };
  }

  public updateStemRouting() {
    if (!this.currentSong || !this.ctx) return;
    const anySolo = Object.values(this.currentSong.stems).some((s) => s.solo);

    for (const [stemId, stem] of Object.entries(this.currentSong.stems) as [string, any][]) {
      let channel = this.stemNodes[stemId];
      if (!channel && this.ctx && this.masterGain) {
        const createdChannel = this.createStemChannel(stemId, stem);
        if (!createdChannel) continue;
        channel = createdChannel;
        this.stemNodes[stemId] = createdChannel;
      }
      if (!channel) continue;

      let effectiveGain = stem.volume;
      if (stem.muted) {
        effectiveGain = 0;
      } else if (anySolo && !stem.solo) {
        effectiveGain = 0;
      }

      channel.gain.gain.setTargetAtTime(effectiveGain, this.ctx.currentTime, 0.02);
      const settings = stem.mixSettings ?? defaultStemMixSettings(stemId, stem.name);
      channel.lowCut.frequency.setTargetAtTime(settings.lowCutHz, this.ctx.currentTime, 0.03);
      channel.highCut.frequency.setTargetAtTime(settings.highCutHz, this.ctx.currentTime, 0.03);
      channel.reverbSend.gain.setTargetAtTime(settings.reverbSend, this.ctx.currentTime, 0.03);
      if (channel.panner && 'pan' in channel.panner) {
        channel.panner.pan.setTargetAtTime(stem.pan ?? 0, this.ctx.currentTime, 0.02);
      }
    }
  }

  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1.5, val));
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
  }

  public setEqualizer(low: number, mid: number, high: number) {
    this.masterEq = { low, mid, high };
    if (!this.ctx) return;
    if (this.eqLow) this.eqLow.gain.setTargetAtTime(low, this.ctx.currentTime, 0.05);
    if (this.eqMid) this.eqMid.gain.setTargetAtTime(mid, this.ctx.currentTime, 0.05);
    if (this.eqHigh) this.eqHigh.gain.setTargetAtTime(high, this.ctx.currentTime, 0.05);
  }

  public setReverbLevel(val: number) {
    this.reverbWet = Math.max(0, Math.min(1, val));
    if (!this.reverbGain || !this.ctx) return;
    this.reverbGain.gain.setTargetAtTime(this.reverbWet, this.ctx.currentTime, 0.05);
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
        if (this.currentSong) {
          for (const callback of this.onSongCompleteCallbacks) callback(this.currentSong.id);
        }
        if (this.loopEnabled) {
          this.seek(0);
          return 0;
        }
        this.pausedAtTime = this.songDuration;
        this.stopScheduler();
        this.killActiveVoices();
        this.isPlaying = false;
        this.notifyTimeUpdate(this.songDuration);
        this.notifyStateChange(false);
        return this.songDuration;
      }
      return Math.min(cur, this.songDuration);
    }
    return this.pausedAtTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setLoopEnabled(enabled: boolean) {
    this.loopEnabled = enabled;
  }

  private startScheduler() {
    this.stopScheduler();
    if (!this.currentSong || !this.ctx) return;

    const bpm = this.currentSong.bpm || 120;
    const secPerBeat = 60 / bpm;
    const currentSongTime = this.getCurrentTime();
    this.nextBeatToSchedule = Math.floor(currentSongTime / secPerBeat);
    this.scheduledNoteKeys.clear();
    this.scheduleLoop();

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

  private trackActiveVoice(sources: AudioScheduledSourceNode[]) {
    const voice = {
      stop: (when = 0) => {
        for (const source of sources) {
          try {
            source.stop(when);
          } catch (_) {}
        }
      },
    };
    const remaining = new Set(sources);
    const removeWhenEnded = (source: AudioScheduledSourceNode) => {
      remaining.delete(source);
      if (remaining.size === 0) {
        this.activeScheduledNodes = this.activeScheduledNodes.filter((active) => active !== voice);
      }
    };

    this.activeScheduledNodes.push(voice);
    for (const source of sources) {
      source.addEventListener('ended', () => removeWhenEnded(source), { once: true });
    }
  }

  private scheduleLoop() {
    if (!this.ctx || !this.currentSong || !this.isPlaying) return;

    const currentSongTime = this.getCurrentTime();
    this.notifyTimeUpdate(currentSongTime);

    const bpm = this.currentSong.bpm || 120;
    const secPerBeat = 60 / bpm;
    const currentAudioTime = this.ctx.currentTime;
    const scheduleWindowEnd = currentAudioTime + this.scheduleAheadSec;

    // Schedule all notes that fall into [currentSongTime, scheduleWindowEnd]
    const stems = this.currentSong.stems;
    const anySolo = Object.values(stems).some((stem) => stem?.solo);
    for (const [stemType, stem] of Object.entries(stems) as [StemType, any][]) {
      if (!stem || !stem.notes || stem.muted || (anySolo && !stem.solo)) continue;
      const channel = this.stemNodes[stemType];
      if (!channel) continue;

      for (const [noteIndex, note] of (stem.notes as NoteEvent[]).entries()) {
        const noteStartTime = note.time * secPerBeat;
        const audioStartTime = this.playbackStartTime + noteStartTime;
        const noteKey = `${stemType}:${noteIndex}`;
        if (
          audioStartTime >= currentAudioTime - 0.02 &&
          audioStartTime < scheduleWindowEnd &&
          !this.scheduledNoteKeys.has(noteKey)
        ) {
          this.scheduledNoteKeys.add(noteKey);
          const noteDurationSec = Math.max(0.05, (note.duration || 0.5) * secPerBeat);
          this.triggerNoteVoice(
            stemType,
            note,
            Math.max(audioStartTime, currentAudioTime + 0.005),
            noteDurationSec,
            this.ctx,
            channel.gain
          );
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
    const synthPatch = this.currentSong?.stems[stemType]?.synthPatch;

    if (sType.startsWith('sub_') || sType === 'sub_bass') {
      this.synthSubBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity);
    } else if (sType.startsWith('wub_') || sType === 'mid_bass' || sType === 'bass') {
      this.synthBassVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, note.wobbleRate, note.pitch, synthPatch);
    } else if (sType.startsWith('drum_') || sType === 'drums_kick_snare' || sType === 'drums') {
      this.synthDrumHit(ctx, note.pitch, startTime, destinationNode, note.velocity);
    } else if (sType.startsWith('perc_') || sType === 'percussion_cymbals') {
      this.synthDrumHit(ctx, note.pitch, startTime, destinationNode, note.velocity);
    } else if (sType === 'lead_synth' || sType === 'lead' || (sType.startsWith('lead_') && sType !== 'lead_vocals')) {
      this.synthLeadVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, synthPatch);
    } else if (sType.startsWith('chord_') || sType === 'chords_harmony' || sType === 'chords') {
      this.synthChordVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, synthPatch);
    } else if (sType.startsWith('atmo_') || sType === 'atmosphere_pad') {
      this.synthAtmosphereVoice(ctx, freq, startTime, duration, destinationNode, note.velocity, synthPatch);
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

    this.trackActiveVoice([osc]);
  }

  // Cinematic Atmosphere Drone Pad
  private synthAtmosphereVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.7,
    patch?: SynthPatch
  ) {
    if (freq < 30 || freq > 3500) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = patch?.oscillatorType ?? 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2 ** ((patch?.detuneCents ?? 5) / 1200), time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(patch?.filterCutoffHz ?? 800, time);
    filter.frequency.exponentialRampToValueAtTime(Math.min(5000, (patch?.filterCutoffHz ?? 800) * 1.8), time + duration * 0.5);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(patch?.lfoRateHz ?? 0.35, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(Math.min(220, (patch?.filterCutoffHz ?? 800) * 0.12), time);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    const attack = Math.min(patch?.attackSeconds ?? 0.3, duration * 0.5);
    const release = Math.min(patch?.releaseSeconds ?? 0.3, duration * 0.8);
    amp.gain.linearRampToValueAtTime(0.35 * vel, time + attack);
    amp.gain.setValueAtTime(0.35 * vel, Math.max(time + attack, time + duration - release));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    if ((patch?.distortion ?? 0) > 1) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(patch!.distortion) as any;
      shaper.oversample = '2x';
      filter.connect(shaper);
      shaper.connect(amp);
    } else {
      filter.connect(amp);
    }
    amp.connect(dest);

    osc1.start(time);
    osc2.start(time);
    lfo.start(time);
    osc1.stop(time + duration + 0.3);
    osc2.stop(time + duration + 0.3);
    lfo.stop(time + duration + 0.3);

    this.trackActiveVoice([osc1, osc2, lfo]);
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

    const vocalStyle = this.currentSong?.vocalStyle.toLowerCase() ?? '';
    const isBreathy = vocalStyle.includes('breathy') || vocalStyle.includes('ethereal');
    const isDemon = vocalStyle.includes('demon') || vocalStyle.includes('ominous');
    const isBaritone = vocalStyle.includes('baritone');
    const pitchShift = isDemon ? 0.5 : isBaritone ? 0.75 : 1;
    const osc = ctx.createOscillator();
    osc.type = isBacking || isBreathy ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq * pitchShift * (isBacking ? 1.004 : 1.0), time);

    // Vibrato LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(isBacking ? 4.8 : isBreathy ? 4.2 : vocalStyle.includes('soaring') ? 6.2 : 5.5, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(isBacking ? 2.0 : isBreathy ? 1.1 : isDemon ? 5.5 : 3.5, time);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Dual Formant Bandpass Filters (F1 and F2)
    const formants = VOWEL_FORMANTS[vowel] || VOWEL_FORMANTS.a;
    const formantShift = isBaritone ? 0.8 : isDemon ? 1.12 : 1;

    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(formants.f1 * formantShift, time);
    f1.Q.setValueAtTime(formants.q1, time);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(formants.f2 * formantShift, time);
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

    this.trackActiveVoice([osc, lfo]);
  }

  // 2. Rich Detuned Saw Lead Synthesizer
  private synthLeadVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.8,
    patch?: SynthPatch
  ) {
    if (freq < 30 || freq > 4000) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = patch?.oscillatorType ?? 'sawtooth';
    osc2.type = patch?.oscillatorType ?? 'sawtooth';

    // Detune by 8 cents for thick chorus effect
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2 ** ((patch?.detuneCents ?? 7) / 1200), time);

    // Resonant Filter Envelope
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(patch?.resonance ?? 4, time);
    const cutoff = Math.min(12000, Math.max(120, patch?.filterCutoffHz ?? freq * 1.5));
    filter.frequency.setValueAtTime(cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.min(16000, Math.max(cutoff, freq * 4.5)), time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(cutoff, time + duration);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(patch?.lfoRateHz ?? 4.5, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(Math.min(650, cutoff * 0.16), time);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    const attack = Math.min(patch?.attackSeconds ?? 0.02, duration * 0.5);
    const release = Math.min(patch?.releaseSeconds ?? 0.04, duration * 0.8);
    amp.gain.linearRampToValueAtTime(0.35 * vel, time + attack);
    amp.gain.setValueAtTime(0.35 * vel, Math.max(time + attack, time + duration - release));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    if ((patch?.distortion ?? 0) > 1) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(patch!.distortion) as any;
      shaper.oversample = '2x';
      filter.connect(shaper);
      shaper.connect(amp);
    } else {
      filter.connect(amp);
    }
    amp.connect(dest);

    osc1.start(time);
    osc2.start(time);
    lfo.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
    lfo.stop(time + duration);

    this.trackActiveVoice([osc1, osc2, lfo]);
  }

  // 3. Polyphonic Warm Pad / Chords Synthesizer
  private synthChordVoice(
    ctx: AudioContext | BaseAudioContext,
    freq: number,
    time: number,
    duration: number,
    dest: AudioNode,
    vel: number = 0.7,
    patch?: SynthPatch
  ) {
    if (freq < 40 || freq > 3000) return;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc.type = patch?.oscillatorType ?? 'triangle';
    osc2.type = patch?.oscillatorType ?? 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2 ** ((patch?.detuneCents ?? 3) / 1200), time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(patch?.filterCutoffHz ?? 1400, time);
    filter.Q.setValueAtTime(patch?.resonance ?? 1.2, time);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(patch?.lfoRateHz ?? 0.35, time);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime((patch?.filterCutoffHz ?? 1400) * 0.08, time);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0, time);
    const attack = Math.min(patch?.attackSeconds ?? 0.08, duration * 0.5);
    const release = Math.min(patch?.releaseSeconds ?? 0.1, duration * 0.8);
    amp.gain.linearRampToValueAtTime(0.22 * vel, time + attack);
    amp.gain.setValueAtTime(0.22 * vel, Math.max(time + attack, time + duration - release));
    amp.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    osc2.connect(filter);
    if ((patch?.distortion ?? 0) > 1) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(patch!.distortion) as any;
      shaper.oversample = '2x';
      filter.connect(shaper);
      shaper.connect(amp);
    } else {
      filter.connect(amp);
    }
    amp.connect(dest);

    osc.start(time);
    osc2.start(time);
    lfo.start(time);
    osc.stop(time + duration + 0.05);
    osc2.stop(time + duration + 0.05);
    lfo.stop(time + duration + 0.05);

    this.trackActiveVoice([osc, osc2, lfo]);
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
    pitchStr?: string,
    patch?: SynthPatch
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
      saw1.type = patch?.oscillatorType ?? 'sawtooth';
      saw2.type = patch?.oscillatorType ?? 'sawtooth';
      saw1.frequency.setValueAtTime(freq, time);
      saw2.frequency.setValueAtTime(freq * 2 ** ((patch?.detuneCents ?? 14) / 1200), time);

      // 3. Resonant Lowpass Filter with high Q for rolling wobble
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(patch?.resonance ?? 5.8, time);

      // Modulate filter cutoff with LFO for deep rolling effect
      const lfoRate = wobbleRate || patch?.lfoRateHz || 3.5;
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(lfoRate, time);

      const lfoGain = ctx.createGain();
      // Cutoff sweeps between ~120Hz and 1600Hz
      const cutoff = patch?.filterCutoffHz ?? 950;
      lfoGain.gain.setValueAtTime(cutoff * 0.65, time);
      filter.frequency.setValueAtTime(cutoff, time);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Distortion / Soft-Clipper Drive
      const waveShaper = ctx.createWaveShaper();
      waveShaper.curve = this.makeDistortionCurve(patch?.distortion ?? 18) as any;
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
      const attack = Math.min(patch?.attackSeconds ?? 0.02, duration * 0.5);
      const release = Math.min(patch?.releaseSeconds ?? 0.04, duration * 0.8);
      amp.gain.linearRampToValueAtTime(0.65 * vel, time + attack);
      amp.gain.setValueAtTime(0.65 * vel, Math.max(time + attack, time + duration - release));
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

      this.trackActiveVoice([subOsc, saw1, saw2, lfo]);
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

    this.trackActiveVoice([osc, subOsc]);
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

    // Recreate the live master chain in the offline renderer.
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = this.masterVolume;

    const eqLow = offlineCtx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.value = 250;
    eqLow.gain.value = this.masterEq.low;

    const eqMid = offlineCtx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1500;
    eqMid.Q.value = 1;
    eqMid.gain.value = this.masterEq.mid;

    const eqHigh = offlineCtx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 5000;
    eqHigh.gain.value = this.masterEq.high;

    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.15;

    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.value = -1.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.08;

    masterGain.connect(eqLow);
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(offlineCtx.destination);

    const reverbNode = offlineCtx.createConvolver();
    reverbNode.buffer = this.buildImpulseResponse(offlineCtx, 2.2, 2.0);
    const reverbGain = offlineCtx.createGain();
    reverbGain.gain.value = this.reverbWet;
    reverbNode.connect(reverbGain);
    reverbGain.connect(masterGain);

    // Create noise buffer for offline context
    const offlineNoise = offlineCtx.createBuffer(1, sampleRate * 2, sampleRate);
    const nData = offlineNoise.getChannelData(0);
    for (let i = 0; i < nData.length; i++) {
      nData[i] = Math.random() * 2 - 1;
    }
    const prevNoise = this.noiseBuffer;
    const previousSong = this.currentSong;
    this.noiseBuffer = offlineNoise;
    this.currentSong = song;

    const stemsToRender: [StemType, any][] = isolatedStem
      ? [[isolatedStem, song.stems[isolatedStem]]]
      : (Object.entries(song.stems) as [StemType, any][]);

    const anySolo = stemsToRender.some(([, stem]) => Boolean(stem?.solo));

    try {
      for (const [stemType, stem] of stemsToRender) {
        if (!stem || stem.muted || (anySolo && !stem.solo) || !stem.notes) continue;

        const stemGain = offlineCtx.createGain();
        stemGain.gain.value = stem.volume ?? 0.8;
        const settings = stem.mixSettings ?? defaultStemMixSettings(stemType, stem.name);
        const lowCut = offlineCtx.createBiquadFilter();
        lowCut.type = 'highpass';
        lowCut.frequency.value = settings.lowCutHz;
        const highCut = offlineCtx.createBiquadFilter();
        highCut.type = 'lowpass';
        highCut.frequency.value = settings.highCutHz;
        const panner = offlineCtx.createStereoPanner();
        panner.pan.value = stem.pan ?? 0;
        stemGain.connect(lowCut);
        lowCut.connect(highCut);
        highCut.connect(panner);
        panner.connect(masterGain);

        if (settings.reverbSend > 0) {
          const sendGain = offlineCtx.createGain();
          sendGain.gain.value = settings.reverbSend;
          highCut.connect(sendGain);
          sendGain.connect(reverbNode);
        }

        for (const note of stem.notes as NoteEvent[]) {
          const noteStartTime = note.time * secPerBeat;
          if (noteStartTime >= totalDuration) continue;
          const noteDurationSec = Math.max(0.05, (note.duration || 0.5) * secPerBeat);

          this.triggerNoteVoice(stemType, note, noteStartTime, noteDurationSec, offlineCtx, stemGain);
        }
      }

      const renderedBuffer = await offlineCtx.startRendering();
      return audioBufferToWav(renderedBuffer, isolatedStem ? null : 0.8913);
    } finally {
      this.noiseBuffer = prevNoise;
      this.currentSong = previousSong;
    }
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

  public onSongComplete(cb: (songId: string) => void) {
    this.onSongCompleteCallbacks.add(cb);
    return () => this.onSongCompleteCallbacks.delete(cb);
  }

  private notifyTimeUpdate(t: number) {
    this.onTimeUpdateCallbacks.forEach((cb) => cb(t));
  }

  private notifyStateChange(p: boolean) {
    this.onStateChangeCallbacks.forEach((cb) => cb(p));
  }
}

export const audioEngine = AudioEngine.getInstance();
