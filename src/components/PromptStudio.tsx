/**
 * DiffRhythm 2 - Advanced Prompt Studio with 100-Stage Melded Matrix & 100-Stem Explorer
 * Supports up to 25,000+ characters, real-time English/Music comprehension analysis,
 * latent variance control, 100 buildups & drops, and dark rolling wub modulation.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Sliders,
  Music,
  Gauge,
  Mic2,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Volume2,
  Activity,
  Zap,
  Radio,
  Search,
  Check,
  X,
  Compass,
  Flame,
} from 'lucide-react';
import { SongGenerationParams } from '../types/music';
import {
  STEM_LIBRARY_100,
  STEM_FAMILIES,
  analyzeMusicComprehension,
  StemDefinition,
} from '../data/stemLibrary100';
import {
  UNDERGROUND_DUBSTEP_STYLES,
  UndergroundDubstepStyle,
} from '../data/undergroundDubstepResearch';
import {
  evolutionaryEngine,
  EvolutionaryState,
} from '../services/evolutionaryLearningEngine';

interface PromptStudioProps {
  onGenerate: (params: SongGenerationParams) => void;
  isGenerating: boolean;
  diffusionStepProgress: number;
  generationStatus: string;
}

const GENRE_OPTIONS = [
  'Auto-detect',
  'Deep Dubstep',
  'Dark 140 Sub Dubstep',
  'Tearout / Riddim',
  'Neurofunk DnB',
  'Liquid Drum & Bass',
  'Synthwave',
  'City Pop',
  'Future Bass',
  'Lo-Fi Chillhop',
  'Cyberpunk EDM',
  'Neo-Soul / R&B',
  'Hyperpop',
  'Melodic Trap',
  'Dark Techno',
];

const VOCAL_STYLES = [
  'Dark Cyber Chant & Sub Vocoder',
  'Ominous Sub Formant Shouts',
  'Demon Pitch-Shifted Vocals',
  'Soaring Cyber-Pop Female',
  'Breathy Indie Soul',
  'Melodic Autotuned Rap',
  'Warm Breezy City Pop',
  'Raspy Rock Belt',
  'Ethereal Ambient Chorus',
  'Cybernetic Vocoder',
  'Warm Baritone Male',
];

const WUB_SPEED_OPTIONS = [
  { id: '1/8 Dark Rolling Wub', label: '1/8 Classic Dark Rolling Wub (3.5Hz)' },
  { id: '1/16 Neuro Churn', label: '1/16 High-Speed Neuro Churn (7.0Hz)' },
  { id: '1/8 Triplet Bounce', label: '1/8T Polymetric Triplet Bounce (5.25Hz)' },
  { id: 'Formant Yoi Growl', label: 'Formant Talkbox "Yoi-Yoi" Growl' },
  { id: 'Screaming Tearout Saw', label: 'Aggressive Multi-Detuned Tearout Saw' },
  { id: 'Acid 303 Sweep', label: 'Acid 303 High-Resonance Squelch' },
];

const PROMPT_SUGGESTIONS = [
  {
    title: 'Abyssal Dubstep (100 Stages · 3m 19s)',
    genre: 'Deep Dubstep',
    prompt:
      'Dark deep rolling bass dubstep at 140 BPM with subterranean 35Hz sub-bass, half-time heavy punch drums, gunshot snares, neuro wobble, and ominous vocal chants. Melded with 100 buildups and drops, micro-gate false drop cuts, and subterranean pressure swells.',
    bpm: 140,
    key: 'D Minor',
  },
  {
    title: 'Tearout 140 Wobble (3m 15s)',
    genre: 'Dark 140 Sub Dubstep',
    prompt:
      'Ominous 140 dark sub dubstep with rolling reese bass, chest-rumbling 40Hz sub-frequencies, gunshot snares, and pitch-shifted cyber chants with escalating snare rolls and screaming saw wubs.',
    bpm: 140,
    key: 'F Minor',
  },
  {
    title: 'Neon Overdrive (3m 12s)',
    genre: 'Synthwave',
    prompt:
      'Fast-paced cyberpunk synthwave with driving bassline, soaring neon female vocals, and gated analog drums about speeding through Neo-Tokyo in the rain with cascading arpeggios and vintage Rhodes keys.',
    bpm: 128,
    key: 'F# Minor',
  },
  {
    title: 'Tokyo Midnight (3m 06s)',
    genre: 'City Pop',
    prompt:
      '90s Japanese City Pop with funk slap bass, breezy electric piano, brass hits, and melancholic romantic vocals about midnight expressway lights with warm analog tape saturation.',
    bpm: 116,
    key: 'A Major',
  },
  {
    title: 'Coffee & Rain (3m+)',
    genre: 'Lo-Fi Chillhop',
    prompt:
      'Warm lo-fi hip hop chillhop with dusty Rhodes piano, vinyl crackle, gentle nylon guitar pluck, lazy sub bass and mellow nostalgic female hook about autumn afternoon study.',
    bpm: 82,
    key: 'Eb Major',
  },
];

export const PromptStudio: React.FC<PromptStudioProps> = ({
  onGenerate,
  isGenerating,
  diffusionStepProgress,
  generationStatus,
}) => {
  // Advanced Prompt State (Support for 25,000+ characters)
  const [prompt, setPrompt] = useState(
    'Dark deep rolling bass dubstep at 140 BPM with subterranean 35Hz sub-bass, half-time heavy punch drums, gunshot snares, neuro wobble, and ominous vocal chants. Melded with 100 buildups and drops, micro-gate false drop cuts, and subterranean pressure swells.'
  );
  const [selectedGenre, setSelectedGenre] = useState('Auto-detect');
  const [bpm, setBpm] = useState(140);
  const [bpmInput, setBpmInput] = useState('140');
  const [tempoAuto, setTempoAuto] = useState(true);
  const [selectedKey, setSelectedKey] = useState('Auto-detect');
  const [durationSec, setDurationSec] = useState<number>(199); // 3m 19s
  const [selectedVocalStyle, setSelectedVocalStyle] = useState('Auto-detect');

  // Variance & Wub Controls
  const [variance, setVariance] = useState<number>(0.85); // 0 to 1
  const [wubSpeed, setWubSpeed] = useState<string>('Auto-detect');
  const [buildDropCount, setBuildDropCount] = useState<number>(100);

  // 100-Stem Matrix Selection
  const [selected100Stems, setSelected100Stems] = useState<string[]>([]);

  // Modals & Drawers
  const [showStemMatrixModal, setShowStemMatrixModal] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evolutionState, setEvolutionState] = useState<EvolutionaryState>(evolutionaryEngine.getState());
  const [stemSearchQuery, setStemSearchQuery] = useState('');
  const [activeStemFamilyFilter, setActiveStemFamilyFilter] = useState<string>('all');
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const updateBpm = (value: number) => {
    const nextBpm = Math.max(30, Math.min(240, Math.round(value)));
    setBpm(nextBpm);
    setBpmInput(String(nextBpm));
    setTempoAuto(false);
  };

  useEffect(() => {
    setEvolutionState(evolutionaryEngine.getState());
  }, [isGenerating]);

  // Lyrics settings
  const [lyricsMode, setLyricsMode] = useState<'auto' | 'custom'>('auto');
  const [customLyrics, setCustomLyrics] = useState('');

  // Live Real-Time English & Music Comprehension Analysis
  const musicComprehension = useMemo(() => {
    return analyzeMusicComprehension(prompt, {
      variance,
      bpm: tempoAuto ? undefined : bpm,
      key: selectedKey === 'Auto-detect' ? undefined : selectedKey,
      genre: selectedGenre === 'Auto-detect' ? undefined : selectedGenre,
      wubSpeed: wubSpeed === 'Auto-detect' ? undefined : wubSpeed,
      buildDropCount,
    });
  }, [prompt, variance, bpm, tempoAuto, selectedKey, selectedGenre, wubSpeed, buildDropCount]);
  const effectiveGenre = selectedGenre === 'Auto-detect' ? musicComprehension.extractedGenre : selectedGenre;
  const effectiveBpm = tempoAuto ? musicComprehension.detectedBpm : bpm;
  const effectiveKey = selectedKey === 'Auto-detect' ? musicComprehension.detectedKey : selectedKey;
  const adaptiveModelUpdates = Object.values(evolutionState.mixModel ?? {})
    .flatMap((profiles) => Object.values(profiles))
    .reduce((total, profile) => total + profile.outcomes, 0);

  const toggle100Stem = (id: string) => {
    setSelected100Stems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (item: (typeof PROMPT_SUGGESTIONS)[0]) => {
    setPrompt(item.prompt);
    setSelectedGenre(item.genre);
    updateBpm(item.bpm);
    setSelectedKey(item.key);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre: selectedGenre === 'Auto-detect' ? undefined : selectedGenre,
          bpm: tempoAuto ? undefined : bpm,
          key: selectedKey === 'Auto-detect' ? undefined : selectedKey,
          vocalStyle: selectedVocalStyle === 'Auto-detect' ? undefined : selectedVocalStyle,
          wubSpeed: wubSpeed === 'Auto-detect' ? undefined : wubSpeed,
          buildDropDensity: buildDropCount,
          selectedStems: selected100Stems,
        }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (e) {
      console.error('Enhancement error:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt,
      genre: selectedGenre === 'Auto-detect' ? undefined : selectedGenre,
      durationSec,
      vocalStyle: selectedVocalStyle === 'Auto-detect' ? undefined : selectedVocalStyle,
      lyricsMode,
      customLyrics: lyricsMode === 'custom' ? customLyrics : undefined,
      bpm: tempoAuto ? undefined : bpm,
      key: selectedKey === 'Auto-detect' ? undefined : selectedKey,
      variance,
      wubSpeed: wubSpeed === 'Auto-detect' ? undefined : wubSpeed,
      buildDropDensity: buildDropCount,
      selectedStems: selected100Stems,
    });
  };

  // Filter 100 Stems for the modal
  const filtered100Stems = useMemo(() => {
    return STEM_LIBRARY_100.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(stemSearchQuery.toLowerCase()) ||
        s.instrument.toLowerCase().includes(stemSearchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(stemSearchQuery.toLowerCase());
      const matchesFamily =
        activeStemFamilyFilter === 'all' || s.family === activeStemFamilyFilter;
      return matchesSearch && matchesFamily;
    });
  }, [stemSearchQuery, activeStemFamilyFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Quick Inspiration Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-zinc-500 font-medium shrink-0 flex items-center gap-1 font-mono">
          <Sparkles size={12} className="text-cyan-400" />
          <span>Presets:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="shrink-0 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Researched Underground Dubstep Styles Selector (Sound System Grounded) */}
      <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
            <Radio size={13} className="text-amber-400 animate-pulse" />
            <span>Underground Dubstep Subgenres & Sound System Styles:</span>
          </span>
          <span className="text-zinc-500 text-[10px]">140 BPM Subwoofer Research</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          {UNDERGROUND_DUBSTEP_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                setPrompt(style.samplePrompt);
                setSelectedGenre(style.name.split('(')[0].trim());
                updateBpm(style.tempoBpm);
                setSelectedKey(style.keyPreference);
              }}
              className="shrink-0 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{style.name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Local generation and feedback memory */}
      <div className="p-3 bg-gradient-to-r from-purple-950/30 via-zinc-950 to-cyan-950/30 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Cpu size={14} className="text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">
                Local Generation Memory ({evolutionState.currentGeneration} songs)
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                {adaptiveModelUpdates} model updates
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              {evolutionState.vocabularySize} prompt tokens learned · Listening outcomes and ratings steer future mixes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEvolutionState(evolutionaryEngine.getState());
            setShowEvolutionModal(true);
          }}
          className="px-3 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/40 rounded-lg text-xs font-mono transition-colors cursor-pointer shrink-0"
        >
          View Evolved 7-Step Pipeline
        </button>
      </div>

      {/* Main Studio Prompt Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl space-y-5">
        {/* Header: Title, Enhancer & Massive 25,000 Char Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Music size={16} className="text-cyan-400" />
            <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              English Prompt Studio & 100-Stage Composition Matrix
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Wand2 size={13} className={isEnhancing ? 'animate-spin' : ''} />
              <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance Prompt'}</span>
            </button>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-300">
              {prompt.length.toLocaleString()} / 30,000 chars · Deep Comprehension
            </span>
          </div>
        </div>

        {/* Big English Prompt Textarea (Up to 30,000+ characters) */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={30000}
            rows={4}
            placeholder="Describe your song in English: elaborate freely with full lore, wub modulation speeds, sub-bass hz, drops, buildups, vocal chants, instruments, or multi-paragraph lyrics (Up to 30,000+ characters)..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Real-Time Music Comprehension & Sonic Blueprint Badge Matrix */}
        <div className="p-4 bg-zinc-950/90 border border-cyan-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Prompt Analysis & Sound Design Blueprint
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Local music-brief analysis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Sub-Genre */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">Detected Genre</span>
              <span className="block text-xs font-bold text-cyan-300 truncate">
                {effectiveGenre}
              </span>
            </div>

            {/* 2. Key & Scale */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">Key & Scale</span>
              <span className="block text-xs font-bold text-purple-300 truncate">
                {effectiveKey}
              </span>
            </div>

            {/* 3. Tempo */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">Target Tempo</span>
              <span className="block text-xs font-bold text-amber-300 font-mono">
                {effectiveBpm} BPM
              </span>
            </div>

            {/* 4. Sub-Bass Profile */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">Subwoofer Hz</span>
              <span className="block text-xs font-bold text-emerald-300 truncate" title={musicComprehension.subBassProfile}>
                {musicComprehension.subBassProfile}
              </span>
            </div>

            {/* 5. Arrangement Stages */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">Melded Stages</span>
              <span className="block text-xs font-bold text-rose-300 font-mono">
                {buildDropCount} Arrangement Stages
              </span>
            </div>

            {/* 6. Active Stems Matrix */}
            <div className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg">
              <span className="block text-[9px] uppercase font-mono text-zinc-500 mb-0.5">100-Stem Matrix</span>
              <span className="block text-xs font-bold text-blue-300 font-mono">
                {selected100Stems.length ? `${selected100Stems.length} Selected` : 'Automatic Selection'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
            <span>
              <strong className="text-zinc-300">Wub Architecture:</strong> {musicComprehension.wubArchitecture}
            </span>
            <span className="text-cyan-400">
              Variance Factor: {Math.round(variance * 100)}%
            </span>
          </div>
        </div>

        {/* 3+ Minute Song Duration Architecture Selector */}
        <div className="p-3.5 bg-zinc-950/80 border border-cyan-500/20 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Full-Length Song Architecture
              </span>
            </div>
            <span className="text-[11px] text-cyan-300 font-mono">
              {buildDropCount} arrangement stages across 3 movements
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { sec: 180, label: '3:00 Min (180s)', sub: 'Standard Full Song' },
              { sec: 199, label: '3:19 Min (199s)', sub: 'Abyssal 100-Stage Mix' },
              { sec: 215, label: '3:35 Min (215s)', sub: 'Extended Journey' },
              { sec: 240, label: '4:00 Min (240s)', sub: 'Epic Masterpiece' },
            ].map((dur) => (
              <button
                key={dur.sec}
                type="button"
                onClick={() => setDurationSec(dur.sec)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  durationSec === dur.sec
                    ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-sm shadow-cyan-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span className="font-mono font-bold text-xs text-cyan-300">{dur.label}</span>
                <span className="text-[10px] text-zinc-500">{dur.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variance & Wub Modulation Engine Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
          {/* 1. Variance Slider & Presets (As explicitly requested by user) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
                <Sliders size={13} className="text-cyan-400" />
                <span>Latent Variance & Sonic Chaos:</span>
              </span>
              <span className="font-mono font-bold text-cyan-400">{Math.round(variance * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={variance}
              onChange={(e) => setVariance(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            {/* Quick Variance Preset Buttons */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setVariance(0.15)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  variance <= 0.25 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                15% Quantized
              </button>
              <button
                type="button"
                onClick={() => setVariance(0.50)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  variance > 0.25 && variance <= 0.65 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                50% Organic
              </button>
              <button
                type="button"
                onClick={() => setVariance(0.85)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  variance > 0.65 && variance <= 0.90 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                85% High Chaos
              </button>
              <button
                type="button"
                onClick={() => setVariance(1.00)}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  variance > 0.90 ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                100% Abyssal Chaos
              </button>
            </div>
          </div>

          {/* 2. 100 Buildups & Drops Stage Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
                <Flame size={13} className="text-amber-400" />
                <span>Melded Stages & Buildups/Drops Density:</span>
              </span>
              <span className="font-mono font-bold text-amber-300">{buildDropCount} Stages</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={buildDropCount}
              onChange={(e) => setBuildDropCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Standard (20)</span>
              <span>Rich Motion (60)</span>
              <span className="text-amber-400 font-bold">100 Melded Pieces (Max)</span>
            </div>
          </div>

          {/* 2. Wub Speed & Modulation Engine */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300 font-mono">
              Wub Modulation & Rolling Speed
            </label>
            <select
              value={wubSpeed}
              onChange={(e) => setWubSpeed(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Auto-detect" className="bg-zinc-900 text-white">Auto-select for genre and tempo</option>
              {WUB_SPEED_OPTIONS.map((w) => (
                <option key={w.id} value={w.id} className="bg-zinc-900 text-white">
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Core Musical Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-zinc-800/80">
          {/* Genre */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">Musical Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-zinc-900 text-white">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Tempo BPM */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-400 font-mono">Tempo (BPM)</label>
              <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                <input
                  type="checkbox"
                  checked={tempoAuto}
                  onChange={(event) => {
                    const useAutoTempo = event.currentTarget.checked;
                    setTempoAuto(useAutoTempo);
                    if (!useAutoTempo) {
                      setBpm(musicComprehension.detectedBpm);
                      setBpmInput(String(musicComprehension.detectedBpm));
                    }
                  }}
                  className="accent-cyan-400"
                />
                Auto
              </label>
              <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                <input
                  type="number"
                  min={30}
                  max={240}
                  step={1}
                  value={tempoAuto ? musicComprehension.detectedBpm : bpmInput}
                  disabled={tempoAuto}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setBpmInput(value);
                    if (/^\d+$/.test(value)) {
                      const parsed = Number(value);
                      if (parsed >= 30 && parsed <= 240) setBpm(parsed);
                    }
                  }}
                  onBlur={() => updateBpm(Number(bpmInput) || bpm)}
                  aria-label="Tempo in beats per minute"
                  className="w-16 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-right text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500"
                />
                BPM
              </label>
            </div>
            <input
              type="range"
              min={30}
              max={240}
              step={1}
              value={effectiveBpm}
              onChange={(e) => updateBpm(parseInt(e.target.value, 10))}
              disabled={tempoAuto}
              aria-label="Tempo slider"
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Musical Key */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">Key & Scale</label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              <option value="Auto-detect">Auto-detect from prompt</option>
              <option value="D Minor">D Minor (The Holy Grail 35Hz Sub Key)</option>
              <option value="F Minor">F Minor (140 Deep Sub Bass)</option>
              <option value="F# Minor">F# Minor (Cyberpunk / Outrun)</option>
              <option value="A Major">A Major (Warm City Pop)</option>
              <option value="Eb Major">Eb Major (Lo-Fi Jazzy)</option>
              <option value="C# Minor">C# Minor (Future Bass / Melodic)</option>
              <option value="A Minor">A Minor (Melancholic)</option>
              <option value="G Minor">G Minor (Heavy Tearout)</option>
            </select>
          </div>

          {/* Vocal Style */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">Vocal Timbre</label>
            <select
              value={selectedVocalStyle}
              onChange={(e) => setSelectedVocalStyle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              <option value="Auto-detect">Auto-select for genre and mood</option>
              {VOCAL_STYLES.map((v) => (
                <option key={v} value={v} className="bg-zinc-900 text-white">
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 100-Stem Architecture Trigger Banner */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                100 Unique Specialized Stems Library
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              {selected100Stems.length ? `${selected100Stems.length} selected sound-design layers` : 'Automatic core stems'} across 10 sound families
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowStemMatrixModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shrink-0"
          >
            <Compass size={14} />
            <span>Customize 100 Stems ({selected100Stems.length}/100)</span>
          </button>
        </div>

        {/* Advanced lyric controls */}
        <div className="pt-1 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowAdvancedParams(!showAdvancedParams)}
            className="flex items-center justify-between w-full py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 font-mono">
              <Cpu size={14} className="text-cyan-400" />
              <span>Lyrics and Arrangement Options</span>
            </div>
            {showAdvancedParams ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvancedParams && (
            <div className="grid grid-cols-1 gap-4 p-4 mt-3 bg-zinc-950/80 border border-zinc-800 rounded-xl animate-in fade-in duration-200">
              {/* Custom Lyrics Option */}
              <div className="col-span-1 pt-3 border-t border-zinc-800/80">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs text-zinc-400 font-mono">Lyric Generation Mode:</span>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="lyricsMode"
                      checked={lyricsMode === 'auto'}
                      onChange={() => setLyricsMode('auto')}
                      className="accent-cyan-400"
                    />
                    <span>Auto-Compose from English Prompt</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="lyricsMode"
                      checked={lyricsMode === 'custom'}
                      onChange={() => setLyricsMode('custom')}
                      className="accent-cyan-400"
                    />
                    <span>Provide Custom Lyrics</span>
                  </label>
                </div>

                {lyricsMode === 'custom' && (
                  <textarea
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                    rows={4}
                    placeholder="Enter your custom lyrics with [Verse], [Drop], [Chorus] tags..."
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 font-mono resize-none focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit & Progress */}
        <div>
          {isGenerating ? (
            <div className="p-4 bg-zinc-950 border border-cyan-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-cyan-300 font-mono font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{generationStatus}</span>
                </span>
                <span className="text-cyan-400 font-mono">{diffusionStepProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 transition-all duration-300 ease-out"
                  style={{ width: `${diffusionStepProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 text-center font-mono">
                Arrangement, stem balancing, and playback are processed in sequence.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/10 transition-all transform active:scale-[0.99] cursor-pointer"
            >
              <Sparkles size={18} />
              <span>Generate {effectiveGenre} Composition</span>
            </button>
          )}
        </div>
      </form>

      {/* 100-STEM MATRIX MODAL */}
      {showStemMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Layers size={20} className="text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    100 Unique Stems Studio Matrix
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selected100Stems.length} of 100 Stems Enabled for Composition & Synthesis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStemMatrixModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search 100 stems (e.g. 35Hz, wub, snare, laser)..."
                  value={stemSearchQuery}
                  onChange={(e) => setStemSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Family Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveStemFamilyFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    activeStemFamilyFilter === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All (100)
                </button>
                {STEM_FAMILIES.map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => setActiveStemFamilyFilter(fam.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                      activeStemFamilyFilter === fam.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{fam.icon}</span>
                    <span>{fam.label.split('.')[1]?.trim() || fam.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stems Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered100Stems.map((stem) => {
                const isSelected = selected100Stems.includes(stem.id);
                return (
                  <div
                    key={stem.id}
                    onClick={() => toggle100Stem(stem.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stem.color }}
                        />
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400">
                          {stem.frequencyRange}
                        </span>
                      </div>
                      <h5 className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                        {stem.name}
                      </h5>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {stem.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500">{stem.familyLabel}</span>
                      <span className={isSelected ? 'text-cyan-400 font-bold flex items-center gap-0.5' : 'text-zinc-600'}>
                        {isSelected ? (
                          <>
                            <Check size={10} /> Active
                          </>
                        ) : (
                          'Disabled'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected100Stems(STEM_LIBRARY_100.map((s) => s.id))}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                >
                  Enable All 100 Stems
                </button>
                <button
                  type="button"
                  onClick={() => setSelected100Stems(STEM_LIBRARY_100.slice(0, 18).map((s) => s.id))}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                >
                  Reset Essential 18
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowStemMatrixModal(false)}
                className="px-5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono rounded-xl transition-colors cursor-pointer"
              >
                Apply Stems ({selected100Stems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVOLUTIONARY SELF-LEARNING & 7-STEP PIPELINE MODAL */}
      {showEvolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Cpu size={20} className="text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>DiffRhythm 2 Evolutionary Self-Learning Engine</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                      Gen #{evolutionState.currentGeneration}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {evolutionState.currentGeneration} generations · {evolutionState.vocabularySize} prompt tokens · {evolutionState.totalCharactersParsed.toLocaleString()} prompt characters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEvolutionModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Evolved 7-Step Pipeline Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Generation and Feedback Pipeline</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">Automatic listening + rating signals</span>
                </div>

                <div className="space-y-2">
                  {evolutionState.evolvedPipelineSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-white font-mono">{step.title}</h5>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{step.description}</p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                          {step.efficiencyGain}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evolutionary Memory & Learned Lexicon */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Radio size={14} className="text-amber-400" />
                  <span>Prompt Vocabulary Memory ({evolutionState.vocabularySize})</span>
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {evolutionState.learnedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-cyan-300"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Generation History */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Recent Generation DNA History
                </h4>

                <div className="space-y-2">
                  {evolutionState.history.slice(0, 4).map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <span className="text-white font-bold">Gen #{h.generationNumber}: {h.songTitle}</span>
                        <p className="text-[11px] text-zinc-400 truncate max-w-lg mt-0.5">"{h.promptSnippet}"</p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 text-cyan-400 border border-zinc-800">
                          {h.detectedBpm} BPM · {h.detectedKey}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                          {h.feedback === 'like' ? 'Liked' : h.feedback === 'dislike' ? 'Disliked' : h.listeningRatio !== undefined ? `${Math.round(h.listeningRatio * 100)}% heard` : 'Not rated'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-zinc-500">
                Local adaptive memory · Listening and explicit ratings tune future mixes
              </span>
              <button
                type="button"
                onClick={() => setShowEvolutionModal(false)}
                className="px-5 py-1.5 bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs font-mono rounded-xl transition-colors cursor-pointer"
              >
                Close Engine View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
