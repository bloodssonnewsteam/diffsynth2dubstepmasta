/**
 * DiffRhythm 2 - Multi-Track Stem Mixer & 100-Stem Soundboard Matrix
 * 100 Unique Sound Design Stems across 10 Families, Live Audition, VU Meters, Pan, Solo/Mute & WAV Export
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Volume2,
  Download,
  Mic2,
  Disc,
  Waves,
  Activity,
  Sparkles,
  Filter,
  Search,
  Play,
  VolumeX,
  Volume1,
  Layers,
  Radio,
  Check,
  Compass,
} from 'lucide-react';
import { Song, StemType } from '../types/music';
import { audioEngine } from '../services/audioEngine';
import { downloadBlob } from '../utils/audioMath';
import { STEM_LIBRARY_100, STEM_FAMILIES, StemDefinition } from '../data/stemLibrary100';
import { autoMixer, AutoMixResult } from '../services/autoMixerEngine';
import { UNDERGROUND_DUBSTEP_STYLES, UndergroundDubstepStyle } from '../data/undergroundDubstepResearch';

interface MultiTrackMixerProps {
  song: Song;
  onUpdateStem: (stemType: StemType | string, updates: any) => void;
  onApplySong: (song: Song) => void;
  isPlaying: boolean;
}

export const MultiTrackMixer: React.FC<MultiTrackMixerProps> = ({
  song,
  onUpdateStem,
  onApplySong,
  isPlaying,
}) => {
  // Mixer Mode: 'standard_console' (10-channel strip) vs 'matrix_100_soundboard' (full 100-stem matrix)
  const [activeTab, setActiveTab] = useState<'standard_console' | 'matrix_100_soundboard'>('standard_console');

  // Auto-Mixing State
  const [selectedAutoMixStyle, setSelectedAutoMixStyle] = useState<string>('deep_dark_dangerous');
  const [isAutoMixing, setIsAutoMixing] = useState<boolean>(false);
  const [autoMixResult, setAutoMixResult] = useState<AutoMixResult | null>(null);
  const [showAutoMixReport, setShowAutoMixReport] = useState<boolean>(false);

  // Master EQ & Reverb state
  const [eqLow, setEqLow] = useState(0);
  const [eqMid, setEqMid] = useState(0);
  const [eqHigh, setEqHigh] = useState(0);
  const [reverbLevel, setReverbLevel] = useState(0.25);
  const [exportingStem, setExportingStem] = useState<string | null>(null);
  const [auditioningStem, setAuditioningStem] = useState<string | null>(null);

  // 10-Stem Standard Console category filter
  const [consoleCategory, setConsoleCategory] = useState<'all' | 'bass_drums' | 'melodic' | 'fx_vocals'>('all');

  // 100-Stem Soundboard filters
  const [stemSearch, setStemSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  // Animated VU meters simulation
  const [vuLevels, setVuLevels] = useState<Record<string, number>>({});

  // Core active stems
  const tenStemsOrder: StemType[] = [
    'sub_bass',
    'mid_bass',
    'drums_kick_snare',
    'percussion_cymbals',
    'lead_synth',
    'chords_harmony',
    'atmosphere_pad',
    'lead_vocals',
    'backing_vocals',
    'fx_transitions',
  ];

  const has10Stems = tenStemsOrder.some((k) => !!song.stems[k]);
  const activeStemsList: StemType[] = has10Stems
    ? tenStemsOrder.filter((k) => !!song.stems[k])
    : (['vocals', 'lead', 'chords', 'bass', 'drums', 'fx'] as StemType[]);

  // Filtered 10-stem console items
  const filteredConsoleStems = activeStemsList.filter((sId) => {
    if (consoleCategory === 'all') return true;
    if (consoleCategory === 'bass_drums') {
      return ['sub_bass', 'mid_bass', 'drums_kick_snare', 'percussion_cymbals', 'bass', 'drums'].includes(sId);
    }
    if (consoleCategory === 'melodic') {
      return ['lead_synth', 'chords_harmony', 'atmosphere_pad', 'lead', 'chords'].includes(sId);
    }
    if (consoleCategory === 'fx_vocals') {
      return ['lead_vocals', 'backing_vocals', 'fx_transitions', 'vocals', 'fx'].includes(sId);
    }
    return true;
  });

  // Filtered 100-stem library items
  const filtered100Stems = useMemo(() => {
    return STEM_LIBRARY_100.filter((stem) => {
      const matchesSearch =
        stem.name.toLowerCase().includes(stemSearch.toLowerCase()) ||
        stem.instrument.toLowerCase().includes(stemSearch.toLowerCase()) ||
        stem.description.toLowerCase().includes(stemSearch.toLowerCase()) ||
        stem.frequencyRange.toLowerCase().includes(stemSearch.toLowerCase());
      const matchesFamily = selectedFamily === 'all' || stem.family === selectedFamily;
      return matchesSearch && matchesFamily;
    });
  }, [stemSearch, selectedFamily]);

  // VU meter animation loop
  useEffect(() => {
    if (!isPlaying) {
      setVuLevels({});
      return;
    }

    const interval = setInterval(() => {
      const nextLevels: Record<string, number> = {};
      for (const sId of activeStemsList) {
        const stem = song.stems[sId];
        if (!stem || stem.muted) {
          nextLevels[sId] = 0;
        } else {
          const baseWeight = sId.includes('bass') || sId.includes('kick') ? 0.5 : 0.35;
          nextLevels[sId] = Math.min(1.0, baseWeight + Math.random() * 0.55 * (stem.volume ?? 0.8));
        }
      }
      setVuLevels(nextLevels);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, song.stems, activeStemsList.length]);

  const handleEqChange = (low: number, mid: number, high: number) => {
    setEqLow(low);
    setEqMid(mid);
    setEqHigh(high);
    audioEngine.setEqualizer(low, mid, high);
  };

  const handleReverbChange = (val: number) => {
    setReverbLevel(val);
    audioEngine.setReverbLevel(val);
  };

  const handleStemVolume = (type: string, val: number) => {
    onUpdateStem(type as any, { volume: val });
    audioEngine.updateStemRouting();
  };

  const handleStemPan = (type: string, val: number) => {
    onUpdateStem(type as any, { pan: val });
    audioEngine.updateStemRouting();
  };

  const toggleMute = (type: string) => {
    const curMuted = song.stems[type]?.muted || false;
    onUpdateStem(type as any, { muted: !curMuted });
    audioEngine.updateStemRouting();
  };

  const toggleSolo = (type: string) => {
    const curSolo = song.stems[type]?.solo || false;
    onUpdateStem(type as any, { solo: !curSolo });
    audioEngine.updateStemRouting();
  };

  // Live Audition of any stem
  const handleAuditionStem = async (stemId: string) => {
    setAuditioningStem(stemId);
    try {
      await audioEngine.previewStem(stemId, 2.0);
    } catch (e) {
      console.error('Stem audition error:', e);
    } finally {
      setTimeout(() => setAuditioningStem(null), 1800);
    }
  };

  // Export isolated WAV stem
  const handleDownloadStem = async (type: string) => {
    setExportingStem(type);
    try {
      const wavBlob = await audioEngine.exportToWav(song, type as any);
      const safeTitle = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlob(wavBlob, `${safeTitle}-${type}-stem.wav`);
    } catch (e) {
      console.error('Stem export failed:', e);
    } finally {
      setExportingStem(null);
    }
  };

  // Apply a deterministic mix profile to the current arrangement.
  const handleRunAutoMix = () => {
    setIsAutoMixing(true);
    try {
      const res = autoMixer.autoMixSong(song, selectedAutoMixStyle);
      onApplySong(res.updatedSong);
      setAutoMixResult(res);
      setEqLow(res.masterEq.lowDb);
      setEqMid(res.masterEq.midDb);
      setEqHigh(res.masterEq.highDb);
      setReverbLevel(res.reverbWetPercent / 100);
      setShowAutoMixReport(true);
    } catch (e) {
      console.error('Auto mix error:', e);
    } finally {
      setIsAutoMixing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Stem Console Rack Container */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Main Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <Sliders size={20} className="text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Multi-Track Stem Console & 100-Stem Studio Soundboard
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  100 Stems Available
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Individual Gain, Stereo Panning, Live Audition, Formant Filtering & Lossless WAV Stem Exports
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('standard_console')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'standard_console'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders size={13} />
              <span>Standard 10-Stem Console</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix_100_soundboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'matrix_100_soundboard'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass size={13} />
              <span>100-Stem Soundboard Matrix (100)</span>
            </button>
          </div>
        </div>

        {/* Profile-based auto-mix controls */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/30 via-zinc-950 to-purple-950/30 border border-cyan-500/40 rounded-xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Automatic Mix Profiles
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    Profile Based
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Applies stem gain and pan with the profile EQ and reverb. Song ratings influence future generated mixes.
                </p>
              </div>
            </div>

            {/* Auto-Mix Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedAutoMixStyle}
                onChange={(e) => setSelectedAutoMixStyle(e.target.value)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {UNDERGROUND_DUBSTEP_STYLES.map((style) => (
                  <option key={style.id} value={style.id} className="bg-zinc-950 text-white">
                    {style.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRunAutoMix}
                disabled={isAutoMixing}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold rounded-xl text-xs font-mono transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={13} className={isAutoMixing ? 'animate-spin' : ''} />
                <span>{isAutoMixing ? 'Balancing Stems...' : 'Apply Mix Profile'}</span>
              </button>
            </div>
          </div>

          {/* Auto-Mix Report / Engineering Insight Accordion */}
          {autoMixResult && showAutoMixReport && (
            <div className="pt-2 border-t border-zinc-800/80 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={13} />
                  <span>{autoMixResult.summary}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAutoMixReport(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400 max-h-40 overflow-y-auto pr-1">
                {autoMixResult.stemDecisions.slice(0, 9).map((dec) => (
                  <div key={dec.stemId} className="p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between text-white font-bold mb-0.5">
                      <span>{dec.stemName}</span>
                      <span className="text-cyan-400">Vol: {Math.round(dec.newVolume * 100)}%</span>
                    </div>
                    <p className="text-zinc-500 line-clamp-2">{dec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TAB 1: STANDARD 10-STEM MIXER CONSOLE */}
        {activeTab === 'standard_console' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setConsoleCategory('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    consoleCategory === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({activeStemsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleCategory('bass_drums')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    consoleCategory === 'bass_drums'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sub, Wubs & Drums
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleCategory('melodic')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    consoleCategory === 'melodic'
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Leads & Pads
                </button>
                <button
                  type="button"
                  onClick={() => setConsoleCategory('fx_vocals')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    consoleCategory === 'fx_vocals'
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Vocals & FX Transitions
                </button>
              </div>

              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline-block">
                Lossless 44.1kHz Channel Strips
              </span>
            </div>

            {/* Mixer Channel Strips Rack */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5 overflow-x-auto pb-2">
              {filteredConsoleStems.map((stemId) => {
                const stem = song.stems[stemId];
                if (!stem) return null;

                const level = vuLevels[stemId] || 0;
                const isAuditioning = auditioningStem === stemId;

                return (
                  <div
                    key={stemId}
                    className={`bg-zinc-950 border rounded-xl p-2.5 flex flex-col justify-between transition-colors min-h-[360px] ${
                      stem.solo
                        ? 'border-amber-400/80 shadow-md shadow-amber-400/10'
                        : stem.muted
                        ? 'border-zinc-800 opacity-60'
                        : 'border-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top: Header, Icon & Instrument */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: stem.color }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAuditionStem(stemId)}
                          disabled={isAuditioning}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Audition stem sound"
                        >
                          <Play size={10} className={isAuditioning ? 'animate-pulse text-amber-400' : ''} />
                        </button>
                      </div>

                      <h4 className="text-[11px] font-bold text-white truncate font-mono" title={stem.name}>
                        {stem.name}
                      </h4>
                      <p
                        className="text-[9px] text-zinc-400 truncate mb-2"
                        title={stem.synthPatch
                          ? `${stem.instrument} · ${stem.synthPatch.oscillatorType}, ${Math.round(stem.synthPatch.filterCutoffHz)}Hz filter, ${stem.synthPatch.lfoRateHz.toFixed(1)}Hz LFO`
                          : stem.instrument}
                      >
                        {stem.instrument}
                        {stem.synthPatch && (
                          <span className="text-cyan-300"> · {stem.synthPatch.oscillatorType} / {Math.round(stem.synthPatch.filterCutoffHz)}Hz</span>
                        )}
                      </p>

                      {/* Solo & Mute Buttons */}
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        <button
                          type="button"
                          onClick={() => toggleMute(stemId)}
                          className={`py-1 text-[10px] font-bold font-mono rounded transition-colors cursor-pointer ${
                            stem.muted
                              ? 'bg-rose-500 text-white'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          MUTE
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSolo(stemId)}
                          className={`py-1 text-[10px] font-bold font-mono rounded transition-colors cursor-pointer ${
                            stem.solo
                              ? 'bg-amber-400 text-black'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          SOLO
                        </button>
                      </div>
                    </div>

                    {/* Vertical Volume Fader & LED VU Meter */}
                    <div className="flex items-center justify-center gap-2.5 py-2 my-auto">
                      {/* Vertical Volume Slider */}
                      <div className="flex flex-col items-center">
                        <input
                          type="range"
                          min={0}
                          max={1.2}
                          step={0.01}
                          value={stem.volume}
                          onChange={(e) => handleStemVolume(stemId, parseFloat(e.target.value))}
                          className="accent-cyan-400 h-28 w-2 bg-zinc-800 rounded-lg cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                        />
                        <span className="text-[9px] font-mono text-zinc-400 mt-2">
                          {Math.round(stem.volume * 100)}%
                        </span>
                      </div>

                      {/* Dynamic LED VU Meter */}
                      <div className="w-2.5 h-28 bg-zinc-900 rounded-md p-0.5 flex flex-col-reverse justify-start gap-[2px] overflow-hidden border border-zinc-800">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const threshold = i / 14;
                          const active = level >= threshold;
                          let color = 'bg-cyan-500';
                          if (i > 11) color = 'bg-rose-500';
                          else if (i > 8) color = 'bg-amber-400';

                          return (
                            <div
                              key={i}
                              className={`w-full h-1 rounded-[1px] transition-opacity duration-75 ${
                                active ? `${color} opacity-100` : 'bg-zinc-800 opacity-20'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Pan Slider */}
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-400 mb-1">
                        <span>L</span>
                        <span>
                          {stem.pan === 0
                            ? 'C'
                            : stem.pan < 0
                            ? `L${Math.round(-stem.pan * 50)}`
                            : `R${Math.round(stem.pan * 50)}`}
                        </span>
                        <span>R</span>
                      </div>
                      <input
                        type="range"
                        min={-1}
                        max={1}
                        step={0.1}
                        value={stem.pan}
                        onChange={(e) => handleStemPan(stemId, parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Stem Export Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadStem(stemId)}
                      disabled={exportingStem === stemId}
                      className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-mono text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                      title="Export isolated stem WAV"
                    >
                      <Download size={10} />
                      <span>{exportingStem === stemId ? 'Exporting...' : 'WAV'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 100-STEM MASTER SOUNDBOARD & MATRIX */}
        {activeTab === 'matrix_100_soundboard' && (
          <div className="space-y-4">
            {/* Search Bar & Family Navigation */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search 100 stems (e.g. 35Hz sub, gunshot, wub, reese)..."
                  value={stemSearch}
                  onChange={(e) => setStemSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Family Filters */}
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedFamily('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedFamily === 'all'
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
                    onClick={() => setSelectedFamily(fam.id)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                      selectedFamily === fam.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{fam.icon}</span>
                    <span>{fam.label.split('.')[1]?.trim().split(' ')[0] || fam.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 100-Stem Cards Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filtered100Stems.map((stemDef) => {
                const liveStem = song.stems[stemDef.id];
                const volume = liveStem?.volume ?? stemDef.defaultVolume;
                const pan = liveStem?.pan ?? stemDef.defaultPan;
                const isMuted = liveStem?.muted || false;
                const isSolo = liveStem?.solo || false;
                const isAuditioning = auditioningStem === stemDef.id;

                return (
                  <div
                    key={stemDef.id}
                    className={`p-3 bg-zinc-950 border rounded-xl flex flex-col justify-between transition-all ${
                      isSolo
                        ? 'border-amber-400/80 shadow-md shadow-amber-400/10'
                        : isMuted
                        ? 'border-zinc-800 opacity-60'
                        : 'border-zinc-800/90 hover:border-cyan-500/50'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Color, Hz & Audition Play */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: stemDef.color }}
                        />
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {stemDef.frequencyRange}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAuditionStem(stemDef.id)}
                          disabled={isAuditioning}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Audition stem sound"
                        >
                          <Play size={10} className={isAuditioning ? 'animate-pulse text-amber-400' : ''} />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate font-mono" title={stemDef.name}>
                        {stemDef.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                        {stemDef.description}
                      </p>
                    </div>

                    {/* Controls Cluster */}
                    <div className="mt-3 pt-2 border-t border-zinc-800/80 space-y-2">
                      {/* Solo / Mute */}
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => toggleMute(stemDef.id)}
                          className={`py-0.5 text-[9px] font-bold font-mono rounded transition-colors cursor-pointer ${
                            isMuted
                              ? 'bg-rose-500 text-white'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          MUTE
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSolo(stemDef.id)}
                          className={`py-0.5 text-[9px] font-bold font-mono rounded transition-colors cursor-pointer ${
                            isSolo
                              ? 'bg-amber-400 text-black'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          SOLO
                        </button>
                      </div>

                      {/* Volume Slider */}
                      <div>
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-0.5">
                          <span>Vol</span>
                          <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1.2}
                          step={0.05}
                          value={volume}
                          onChange={(e) => handleStemVolume(stemDef.id, parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Pan Slider */}
                      <div>
                        <div className="flex justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
                          <span>Pan</span>
                          <span>{pan === 0 ? 'C' : pan < 0 ? `L${Math.round(-pan * 50)}` : `R${Math.round(pan * 50)}`}</span>
                        </div>
                        <input
                          type="range"
                          min={-1}
                          max={1}
                          step={0.1}
                          value={pan}
                          onChange={(e) => handleStemPan(stemDef.id, parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* WAV Export Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadStem(stemDef.id)}
                        disabled={exportingStem === stemDef.id}
                        className="w-full py-1 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-mono text-zinc-300 hover:text-white rounded border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Download size={9} />
                        <span>{exportingStem === stemDef.id ? 'Exporting...' : 'WAV Stem'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Master 3-Band Equalizer & Convolution Reverb Rack */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3-Band Studio EQ */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Master 3-Band Equalizer
              </h4>
            </div>
            <button
              type="button"
              onClick={() => handleEqChange(0, 0, 0)}
              className="text-[10px] text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Reset Flat
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-1">
            {/* Low Shelf (250Hz) - crucial for sub-bass punch */}
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Sub / Low (250Hz)</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqLow}
                onChange={(e) => handleEqChange(parseFloat(e.target.value), eqMid, eqHigh)}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="block text-xs font-mono font-bold text-cyan-400">
                {eqLow > 0 ? `+${eqLow}` : eqLow} dB
              </span>
            </div>

            {/* Mid Peaking (1500Hz) */}
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Mid Range (1.5kHz)</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqMid}
                onChange={(e) => handleEqChange(eqLow, parseFloat(e.target.value), eqHigh)}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="block text-xs font-mono font-bold text-cyan-400">
                {eqMid > 0 ? `+${eqMid}` : eqMid} dB
              </span>
            </div>

            {/* High Shelf (5000Hz) */}
            <div className="space-y-2 text-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">High Air (5kHz)</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={eqHigh}
                onChange={(e) => handleEqChange(eqLow, eqMid, parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="block text-xs font-mono font-bold text-cyan-400">
                {eqHigh > 0 ? `+${eqHigh}` : eqHigh} dB
              </span>
            </div>
          </div>
        </div>

        {/* Space Convolution Reverb & Master Limiter */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Waves size={15} className="text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Atmosphere & Space Reverb Send
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Algorithmic Room IR</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Reverb Wet/Dry Ratio</span>
              <span className="font-mono font-bold text-cyan-400">{Math.round(reverbLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.01}
              value={reverbLevel}
              onChange={(e) => handleReverbChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Dry / Direct Signal</span>
              <span>Lush Studio Hall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
