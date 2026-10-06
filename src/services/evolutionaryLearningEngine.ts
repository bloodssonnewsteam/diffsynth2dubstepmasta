/**
 * DiffRhythm 2 - Local preference memory for prompt vocabulary, mix profiles, and synth patches.
 */

import { MusicReference, Song, SongGenerationParams, SynthPatch, SynthPatchFamily } from '../types/music';
import { UNDERGROUND_DUBSTEP_STYLES } from '../data/undergroundDubstepResearch';

export interface GenerationMemoryRecord {
  songId: string;
  generationNumber: number;
  timestamp: string;
  songTitle: string;
  promptSnippet: string;
  promptCharLength: number;
  detectedGenre: string;
  detectedKey: string;
  detectedBpm: number;
  subBassProfile: string;
  mixProfileId?: string;
  synthPatches: Partial<Record<SynthPatchFamily, SynthPatch>>;
  recentMotif: string[];
  feedback?: 'like' | 'dislike';
  listeningRatio?: number;
  modelReward?: number;
  modelContext?: string;
  learnedTokens: string[];
}

export interface MixProfilePosterior {
  alpha: number;
  beta: number;
  exposures: number;
  outcomes: number;
}

export interface EvolvedPipelineStep {
  stepNumber: number;
  title: string;
  description: string;
  efficiencyGain: string;
  status: 'optimized' | 'evolving' | 'active';
}

export interface EvolutionaryState {
  currentGeneration: number;
  totalCharactersParsed: number;
  vocabularySize: number;
  learnedSubBassProfilesCount: number;
  soundSystemMasteryLevel: string;
  learnedKeywords: string[];
  references: MusicReference[];
  mixModel: Record<string, Record<string, MixProfilePosterior>>;
  history: GenerationMemoryRecord[];
  evolvedPipelineSteps: EvolvedPipelineStep[];
}

const STORAGE_KEY = 'diffrhythm2_preference_memory_v3';
const LEGACY_STORAGE_KEY = 'diffrhythm2_preference_memory_v2';
const STOP_WORDS = new Set(['about', 'after', 'again', 'also', 'been', 'could', 'from', 'have', 'into', 'just', 'more', 'some', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'very', 'with', 'your']);

export class EvolutionaryLearningEngine {
  private static instance: EvolutionaryLearningEngine | null = null;
  private state: EvolutionaryState;

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): EvolutionaryLearningEngine {
    if (!EvolutionaryLearningEngine.instance) {
      EvolutionaryLearningEngine.instance = new EvolutionaryLearningEngine();
    }
    return EvolutionaryLearningEngine.instance;
  }

  private loadState(): EvolutionaryState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as EvolutionaryState;
        return {
          ...state,
          references: state.references ?? [],
          mixModel: state.mixModel ?? {},
          evolvedPipelineSteps: (state.evolvedPipelineSteps ?? []).map((step) =>
            step.stepNumber === 6
              ? { ...step, title: 'Local Preference Memory', description: 'Stores prompt tokens, generated motifs, passive listening outcomes, and optional ratings in this browser.', efficiencyGain: 'Automatic local updates' }
              : step.stepNumber === 7
                ? { ...step, title: 'Contextual Mix and Synth Learner', description: 'A genre/tempo contextual Beta bandit updates from listening and ratings, then balances expected reward with exploration.', efficiencyGain: 'Persistent posterior model' }
                : step
          ),
          history: (state.history ?? []).map((record) => ({
            ...record,
            recentMotif: record.recentMotif ?? [],
          })),
        };
      }
    } catch (_) {}

    return {
      currentGeneration: 0,
      totalCharactersParsed: 0,
      vocabularySize: 0,
      learnedSubBassProfilesCount: 0,
      soundSystemMasteryLevel: 'Waiting for generation feedback',
      learnedKeywords: [],
      references: [],
      mixModel: {},
      history: [],
      evolvedPipelineSteps: [
        {
          stepNumber: 1,
          title: 'Prompt and Genre Analysis',
          description: 'Combines the prompt with explicit genre, tempo, key, and sound-design controls.',
          efficiencyGain: 'Rule-based + optional Gemini',
          status: 'active',
        },
        {
          stepNumber: 2,
          title: 'Procedural Arrangement',
          description: 'Builds timed sections, transitions, notes, and a tempo-aligned stage map.',
          efficiencyGain: '100 timed stages',
          status: 'active',
        },
        {
          stepNumber: 3,
          title: 'Procedural Stem Synthesis',
          description: 'Renders the generated note events through the browser Web Audio synthesizers.',
          efficiencyGain: '10 primary tracks',
          status: 'active',
        },
        {
          stepNumber: 4,
          title: 'Adaptive Auto-Mix',
          description: 'Applies a style profile to stem levels, pan, equalization, and reverb.',
          efficiencyGain: 'Profile-based',
          status: 'active',
        },
        {
          stepNumber: 5,
          title: 'Peak-Safe Master Render',
          description: 'Uses bus compression, a safety limiter, matching offline processing, and peak control on full-song WAVs.',
          efficiencyGain: '-1 dBFS sample peak target',
          status: 'active',
        },
        {
          stepNumber: 6,
          title: 'Local Preference Memory',
          description: 'Stores prompt tokens, generated motifs, passive listening outcomes, and optional ratings in this browser.',
          efficiencyGain: 'Automatic local updates',
          status: 'active',
        },
        {
          stepNumber: 7,
          title: 'Contextual Mix and Synth Learner',
          description: 'A genre/tempo contextual Beta bandit updates from listening and ratings, then balances expected reward with exploration.',
          efficiencyGain: 'Persistent posterior model',
          status: 'evolving',
        },
      ],
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (_) {}
  }

  private getMixContext(genre: string, bpm: number): string {
    const genreKey = genre.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
    const tempoKey = bpm < 100 ? 'slow' : bpm < 140 ? 'mid' : 'fast';
    return `${genreKey}:${tempoKey}`;
  }

  private getOrCreatePosterior(context: string, profileId: string): MixProfilePosterior {
    const profiles = this.state.mixModel[context] ??= {};
    return profiles[profileId] ??= { alpha: 1, beta: 1, exposures: 0, outcomes: 0 };
  }

  private applyModelOutcome(record: GenerationMemoryRecord, reward: number) {
    if (!record.mixProfileId) return;
    const context = record.modelContext || this.getMixContext(record.detectedGenre, record.detectedBpm);
    const posterior = this.getOrCreatePosterior(context, record.mixProfileId);
    if (record.modelReward !== undefined) {
      posterior.alpha = Math.max(1, posterior.alpha - record.modelReward);
      posterior.beta = Math.max(1, posterior.beta - (1 - record.modelReward));
    } else {
      posterior.outcomes += 1;
    }
    const boundedReward = Math.max(0, Math.min(1, reward));
    posterior.alpha += boundedReward;
    posterior.beta += 1 - boundedReward;
    record.modelReward = boundedReward;
    record.modelContext = context;
  }

  /** Store generation context, motif novelty, and the applied mix-profile exposure. */
  public recordSongGeneration(song: Song, params?: SongGenerationParams): EvolutionaryState {
    const nextGen = this.state.currentGeneration + 1;
    const promptText = params?.prompt || song.prompt || '';
    const promptLen = promptText.length;
    const words = [...new Set(promptText.toLowerCase().match(/\b[a-z0-9_-]{4,20}\b/g) || [])]
      .filter((word) => !STOP_WORDS.has(word));
    const knownWords = new Set(this.state.learnedKeywords);
    const newlyLearned = words.filter((word) => !knownWords.has(word));
    this.state.learnedKeywords = [...this.state.learnedKeywords, ...newlyLearned].slice(-200);
    const modelContext = this.getMixContext(song.genre, song.bpm);

    const memoryRecord: GenerationMemoryRecord = {
      songId: song.id,
      generationNumber: nextGen,
      timestamp: new Date().toISOString(),
      songTitle: song.title,
      promptSnippet: promptText.slice(0, 140) + (promptText.length > 140 ? '...' : ''),
      promptCharLength: promptLen,
      detectedGenre: song.genre,
      detectedKey: song.key,
      detectedBpm: song.bpm,
      subBassProfile: song.comprehension?.subBassProfile || 'Not detected',
      mixProfileId: song.mixProfileId,
      modelContext,
      synthPatches: this.collectSynthPatches(song),
      recentMotif: song.motifSignature?.slice(0, 8)
        || (song.stems.lead_synth?.notes || []).slice(0, 8).map((note) => note.pitch),
      learnedTokens: newlyLearned,
    };

    this.state.currentGeneration = nextGen;
    this.state.totalCharactersParsed += promptLen;
    this.state.vocabularySize = this.state.learnedKeywords.length;
    this.state.learnedSubBassProfilesCount = new Set(
      [memoryRecord, ...this.state.history]
        .map((record) => record.subBassProfile)
        .filter((profile) => profile !== 'Not detected')
    ).size;
    this.state.history.unshift(memoryRecord);
    if (memoryRecord.mixProfileId) {
      this.getOrCreatePosterior(modelContext, memoryRecord.mixProfileId).exposures += 1;
    }
    if (this.state.history.length > 25) {
      this.state.history.pop();
    }
    this.updateMemorySummary();

    this.saveState();
    return this.state;
  }

  public recordSongFeedback(songId: string, feedback: 'like' | 'dislike'): boolean {
    const record = this.state.history.find((item) => item.songId === songId);
    if (!record) return false;
    record.feedback = feedback;
    this.applyModelOutcome(record, feedback === 'like' ? 1 : 0);
    this.updateMemorySummary();
    this.saveState();
    return true;
  }

  public recordSongEngagement(songId: string, listeningRatio: number): void {
    const record = this.state.history.find((item) => item.songId === songId);
    if (!record) return;
    const ratio = Math.max(0, Math.min(1, listeningRatio));
    if (ratio <= (record.listeningRatio ?? 0)) return;
    record.listeningRatio = ratio;
    if (!record.feedback) this.applyModelOutcome(record, ratio);
    this.saveState();
  }

  public getPreferredMixStyle(genre: string, bpm: number = 140): string | undefined {
    const context = this.getMixContext(genre, bpm);
    const profiles = this.state.mixModel[context];
    if (!profiles || !Object.values(profiles).some((profile) => profile.outcomes > 0)) return undefined;
    const totalExposures = Math.max(1, Object.values(profiles).reduce((sum, profile) => sum + profile.exposures, 0));

    return UNDERGROUND_DUBSTEP_STYLES
      .map((style) => {
        const posterior = profiles[style.id] ?? { alpha: 1, beta: 1, exposures: 0, outcomes: 0 };
        const mean = posterior.alpha / (posterior.alpha + posterior.beta);
        const exploration = 0.25 * Math.sqrt(Math.log(totalExposures + 1) / (posterior.exposures + 1));
        return { id: style.id, score: mean + exploration };
      })
      .sort((left, right) => right.score - left.score)[0]?.id;
  }

  public getPreferredSynthPatch(genre: string, family: SynthPatchFamily, bpm: number = 140): SynthPatch | undefined {
    const context = this.getMixContext(genre, bpm);
    const samples = this.state.history
      .filter((record) => record.detectedGenre.toLowerCase() === genre.toLowerCase()
        && (record.modelContext || this.getMixContext(record.detectedGenre, record.detectedBpm)) === context
        && record.feedback !== 'dislike'
        && (record.feedback === 'like' || (record.modelReward ?? 0) >= 0.7))
      .map((record) => record.synthPatches?.[family])
      .filter((patch): patch is SynthPatch => Boolean(patch));
    if (samples.length === 0) return undefined;

    const waves = new Map<OscillatorType, number>();
    for (const patch of samples) {
      waves.set(patch.oscillatorType, (waves.get(patch.oscillatorType) ?? 0) + 1);
    }
    const oscillatorType = [...waves.entries()].sort(([, left], [, right]) => right - left)[0][0];
    const average = (key: keyof Omit<SynthPatch, 'oscillatorType'>) =>
      samples.reduce((total, patch) => total + patch[key], 0) / samples.length;

    return {
      oscillatorType,
      detuneCents: average('detuneCents'),
      filterCutoffHz: average('filterCutoffHz'),
      resonance: average('resonance'),
      attackSeconds: average('attackSeconds'),
      releaseSeconds: average('releaseSeconds'),
      lfoRateHz: average('lfoRateHz'),
      distortion: average('distortion'),
    };
  }

  public addMusicReference(reference: MusicReference): void {
    this.state.references = [
      reference,
      ...this.state.references.filter((item) => item.videoId !== reference.videoId),
    ].slice(0, 12);
    this.saveState();
  }

  public removeMusicReference(videoId: string): void {
    this.state.references = this.state.references.filter((item) => item.videoId !== videoId);
    this.saveState();
  }

  public getMusicReferences(): MusicReference[] {
    return [...this.state.references];
  }

  public getReferenceNotes(): string {
    return this.state.references
      .slice(0, 3)
      .filter((reference) => reference.influence > 0)
      .map((reference) => `Influence ${Math.round(reference.influence * 100)}%: ${reference.styleNotes}`)
      .join('\n');
  }

  public updateMusicReferenceInfluence(videoId: string, influence: number): void {
    this.state.references = this.state.references.map((reference) =>
      reference.videoId === videoId
        ? { ...reference, influence: Math.max(0, Math.min(1, influence)) }
        : reference
    );
    this.saveState();
  }

  public getRecentMotifs(genre: string): string[][] {
    const normalizedGenre = genre.trim().toLowerCase();
    return this.state.history
      .filter((record) => !normalizedGenre || record.detectedGenre.toLowerCase() === normalizedGenre)
      .slice(0, 8)
      .map((record) => record.recentMotif)
      .filter((motif) => motif?.length > 0);
  }

  private collectSynthPatches(song: Song): Partial<Record<SynthPatchFamily, SynthPatch>> {
    const patches: Partial<Record<SynthPatchFamily, SynthPatch>> = {};
    for (const [stemId, stem] of Object.entries(song.stems)) {
      if (!stem.synthPatch) continue;
      const lowerId = stemId.toLowerCase();
      const family: SynthPatchFamily | undefined =
        lowerId === 'mid_bass' || lowerId === 'bass' || lowerId.startsWith('wub_')
          ? 'bass'
          : lowerId === 'lead_synth' || lowerId === 'lead' || (lowerId.startsWith('lead_') && lowerId !== 'lead_vocals')
            ? 'lead'
            : lowerId === 'chords_harmony' || lowerId === 'chords' || lowerId.startsWith('chord_') || lowerId === 'atmosphere_pad' || lowerId.startsWith('atmo_')
              ? 'pad'
              : undefined;
      if (family && !patches[family]) patches[family] = stem.synthPatch;
    }
    return patches;
  }

  private updateMemorySummary() {
    const ratedCount = this.state.history.filter((record) => record.feedback).length;
    this.state.soundSystemMasteryLevel = ratedCount
      ? `${ratedCount} rated songs in local memory`
      : 'Waiting for generation feedback';
  }

  public getState(): EvolutionaryState {
    return { ...this.state };
  }

  public resetEvolution() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    return this.state;
  }
}

export const evolutionaryEngine = EvolutionaryLearningEngine.getInstance();
