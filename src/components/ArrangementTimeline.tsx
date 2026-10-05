/**
 * DiffRhythm 2 - DAW Multi-Track Arrangement Timeline & 100-Stage Mastered Matrix
 * Interactive 100 Buildups/Drops Navigator, Wub Modulation Inspector, Tension Curves & Stem Lanes
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Bookmark,
  Zap,
  Radio,
  Flame,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Activity,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { Song, StemType, SongStageBlock } from '../types/music';
import { formatTime } from '../utils/audioMath';
import { generate100Stages } from '../data/stemLibrary100';

interface ArrangementTimelineProps {
  song: Song;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const ArrangementTimeline: React.FC<ArrangementTimelineProps> = ({
  song,
  currentTime,
  onSeek,
}) => {
  const duration = song.durationSec || 199;
  const bpm = song.bpm || 140;
  const secPerBeat = 60 / bpm;

  // View Mode: 'unified' | '100_stages' | 'daw_stems'
  const [viewMode, setViewMode] = useState<'unified' | '100_stages' | 'daw_stems'>('unified');
  const [stageFilter, setStageFilter] = useState<'all' | 'drops' | 'buildups' | 'wubs' | 'sub_dives'>('all');

  // Stages fallback if not explicitly provided
  const stages: SongStageBlock[] = useMemo(() => {
    if (song.stages && song.stages.length >= 100) return song.stages;
    const isDub =
      song.genre?.toLowerCase().includes('dubstep') ||
      song.prompt?.toLowerCase().includes('dubstep') ||
      song.prompt?.toLowerCase().includes('rolling bass');
    return generate100Stages(duration, bpm, isDub);
  }, [song.stages, duration, bpm, song.genre, song.prompt]);

  // Current active stage
  const currentStageIndex = useMemo(() => {
    const idx = stages.findIndex((s) => currentTime >= s.startSec && currentTime < s.endSec);
    return idx !== -1 ? idx : Math.min(stages.length - 1, Math.floor((currentTime / duration) * stages.length));
  }, [stages, currentTime, duration]);

  const activeStage = stages[currentStageIndex] || stages[0];

  // 10-Stem Matrix
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

  const playheadPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(clickRatio * duration);
  };

  // Default parts if not defined on song
  const parts = song.parts || [
    {
      partIndex: 1 as const,
      name: 'Part I: Atmosphere & Build (0:00 - 1:05)',
      startSec: 0,
      endSec: Math.round(duration * 0.33),
      sections: ['Intro', 'Verse 1', 'Build-up'] as any[],
      description: 'Opening exposition, subterranean 35Hz rumble, and escalating 140 BPM snare rolls',
    },
    {
      partIndex: 2 as const,
      name: 'Part II: Main Drop & Rolling Bass (1:05 - 2:13)',
      startSec: Math.round(duration * 0.33),
      endSec: Math.round(duration * 0.68),
      sections: ['Drop 1', 'Breakdown', 'Verse 2'] as any[],
      description: 'Colossal first drop with 35Hz sub-bass, gunshot snares, and rolling neuro wobble',
    },
    {
      partIndex: 3 as const,
      name: 'Part III: Colossal Drop 2 & Outro (2:13 - 3:19+)',
      startSec: Math.round(duration * 0.68),
      endSec: duration,
      sections: ['Build-up 2', 'Drop 2', 'Outro'] as any[],
      description: 'Maximum sub overload, chaotic tearout mutations, and atmospheric sub dissipation',
    },
  ];

  // Helper for stage colors
  const getStageColor = (type: SongStageBlock['type']) => {
    switch (type) {
      case 'drop':
        return '#f43f5e'; // Crimson Rose
      case 'tearout':
        return '#ea580c'; // Fiery Orange
      case 'buildup':
        return '#ec4899'; // Electric Pink
      case 'wub_roll':
        return '#f97316'; // Deep Wub Orange
      case 'sub_dive':
        return '#eab308'; // Sub Golden Yellow
      case 'fakeout':
        return '#a855f7'; // Purple Silence Gate
      case 'breakdown':
        return '#06b6d4'; // Deep Cyan
      case 'transition':
      default:
        return '#6366f1'; // Indigo
    }
  };

  // Filter stages based on selected filter
  const filteredStages = useMemo(() => {
    if (stageFilter === 'all') return stages;
    if (stageFilter === 'drops') return stages.filter((s) => s.type === 'drop' || s.type === 'tearout');
    if (stageFilter === 'buildups') return stages.filter((s) => s.type === 'buildup' || s.type === 'fakeout');
    if (stageFilter === 'wubs') return stages.filter((s) => s.type === 'wub_roll');
    if (stageFilter === 'sub_dives') return stages.filter((s) => s.type === 'sub_dive' || s.type === 'breakdown');
    return stages;
  }, [stages, stageFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <Zap size={20} className="text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  100-Stage Mastered Sequence & Buildup/Drop Matrix
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  100 Melded Pieces
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {formatTime(duration)} Total Length · {stages.length} Mastered Micro-Stages · 140 BPM Dark Rolling Dubstep
              </p>
            </div>
          </div>

          {/* View Switcher & Stage Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'unified'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Unified Master
              </button>
              <button
                type="button"
                onClick={() => setViewMode('100_stages')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === '100_stages'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                100 Stages Matrix
              </button>
              <button
                type="button"
                onClick={() => setViewMode('daw_stems')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'daw_stems'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DAW Stem Lanes
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE STAGE SPOTLIGHT INSPECTOR (Shows live stage at current playhead) */}
        {activeStage && (
          <div className="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-xl relative overflow-hidden shadow-lg">
            <div
              className="absolute top-0 bottom-0 left-0 w-1.5"
              style={{ backgroundColor: getStageColor(activeStage.type) }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Column: Stage Identity & Description */}
              <div className="space-y-1 pl-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{
                      backgroundColor: `${getStageColor(activeStage.type)}25`,
                      color: getStageColor(activeStage.type),
                      border: `1px solid ${getStageColor(activeStage.type)}60`,
                    }}
                  >
                    {activeStage.type.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>{activeStage.name}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-300">
                    [{formatTime(activeStage.startSec)} - {formatTime(activeStage.endSec)}]
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  {activeStage.description}
                </p>
              </div>

              {/* Center / Right: Live Tension Meter & Wub Modulation */}
              <div className="flex flex-wrap items-center gap-3 pl-2 lg:pl-0">
                {/* Wub Modulation */}
                <div className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-center">
                  <span className="block text-[9px] uppercase font-mono text-zinc-500">Wub Modulation</span>
                  <span className="text-xs font-bold font-mono text-amber-300">
                    {activeStage.wubModulation}
                  </span>
                </div>

                {/* Tension Level */}
                <div className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg min-w-32">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1">
                    <span>Tension Level</span>
                    <span className="text-rose-400 font-bold">{activeStage.tensionLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${activeStage.tensionLevel}%`,
                        backgroundColor: getStageColor(activeStage.type),
                      }}
                    />
                  </div>
                </div>

                {/* Quick Stage Steppers */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prevIdx = Math.max(0, currentStageIndex - 1);
                      onSeek(stages[prevIdx].startSec);
                    }}
                    disabled={currentStageIndex === 0}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Previous Stage"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = Math.min(stages.length - 1, currentStageIndex + 1);
                      onSeek(stages[nextIdx].startSec);
                    }}
                    disabled={currentStageIndex === stages.length - 1}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Next Stage"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Part Multi-Movement Navigation Banner */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bookmark size={12} className="text-cyan-400" />
              <span>3 Master Movements (Click to Jump):</span>
            </div>
            <span className="text-zinc-500 font-mono">100 Micro-Stages Distributed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {parts.map((p, pIdx) => {
              const isActive = currentTime >= p.startSec && currentTime < p.endSec;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => onSeek(p.startSec)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800/80 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-cyan-300 truncate">{p.name}</span>
                    <span className="text-[10px] text-zinc-400 shrink-0 ml-1">
                      {formatTime(p.startSec)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 1: 100-STAGE MASTERED MATRIX & TENSION STRIP (Visible in unified or 100_stages) */}
        {(viewMode === 'unified' || viewMode === '100_stages') && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-amber-400" />
                <span className="font-bold text-white uppercase text-[11px]">
                  100 Melded Micro-Stages & Tension Blueprint
                </span>
                <span className="text-zinc-500 text-[10px]">
                  (Click any stage to audition piece)
                </span>
              </div>

              {/* Stage Filter Chips */}
              <div className="flex items-center gap-1 text-[10px]">
                {[
                  { id: 'all', label: 'All 100' },
                  { id: 'drops', label: 'Drops & Tearouts' },
                  { id: 'buildups', label: 'Buildups & Risers' },
                  { id: 'wubs', label: 'Rolling Wubs' },
                  { id: 'sub_dives', label: 'Sub Dives & Drones' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStageFilter(f.id as any)}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      stageFilter === f.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 100-STAGE INTERACTIVE RACK (100 distinct bars across the 3-minute width) */}
            <div
              onClick={handleTimelineClick}
              className="relative h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-2 cursor-pointer select-none overflow-hidden flex items-end gap-[1px]"
            >
              {/* Playhead Vertical Beam */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)] z-30 pointer-events-none transition-all duration-75"
                style={{ left: `${playheadPercent}%` }}
              >
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full -translate-x-[4px] -translate-y-1 shadow-md shadow-cyan-400/80" />
              </div>

              {/* 100 Micro-Stage Bars */}
              {stages.map((stage, idx) => {
                const isCurrent = idx === currentStageIndex;
                const barColor = getStageColor(stage.type);
                const heightPct = Math.max(15, stage.tensionLevel);

                return (
                  <div
                    key={stage.id || idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(stage.startSec);
                    }}
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: barColor,
                    }}
                    className={`flex-1 rounded-t-[1px] transition-all hover:opacity-100 relative group cursor-pointer ${
                      isCurrent
                        ? 'opacity-100 ring-1 ring-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] scale-y-105'
                        : 'opacity-65 hover:scale-y-110'
                    }`}
                    title={`${stage.name} (${formatTime(stage.startSec)} - ${formatTime(stage.endSec)}) | Tension: ${stage.tensionLevel}% | ${stage.wubModulation}`}
                  >
                    {/* Key Drop Stage Markers */}
                    {(stage.type === 'drop' || stage.type === 'fakeout') && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                        style={{ backgroundColor: barColor }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stage Quick Landmarks (Drop 1, Fakeout, Drop 2, Outro) */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
              <span className="text-zinc-500">Stage 01: Sub Drone (0:00)</span>
              <button
                type="button"
                onClick={() => onSeek(stages[28]?.startSec || 58)}
                className="hover:text-pink-400 transition-colors cursor-pointer text-pink-400/80"
              >
                Stage 29: Buildup 1 (0:58)
              </button>
              <button
                type="button"
                onClick={() => onSeek(stages[38]?.startSec || 78)}
                className="hover:text-purple-400 transition-colors cursor-pointer text-purple-400/80"
              >
                Stage 39: Fakeout Silence
              </button>
              <button
                type="button"
                onClick={() => onSeek(stages[39]?.startSec || 80)}
                className="hover:text-rose-400 transition-colors cursor-pointer font-bold text-rose-400"
              >
                Stage 40: DROP 1 (1:20)
              </button>
              <button
                type="button"
                onClick={() => onSeek(stages[72]?.startSec || 145)}
                className="hover:text-pink-400 transition-colors cursor-pointer text-pink-400/80"
              >
                Stage 73: Buildup 2 (2:25)
              </button>
              <button
                type="button"
                onClick={() => onSeek(stages[83]?.startSec || 168)}
                className="hover:text-rose-400 transition-colors cursor-pointer font-bold text-rose-400"
              >
                Stage 84: DROP 2 (2:48)
              </button>
              <span className="text-zinc-500">Stage 100: Dissolve ({formatTime(duration)})</span>
            </div>
          </div>
        )}

        {/* SECTION 2: DAW MULTI-TRACK NOTE LANES (Visible in unified or daw_stems) */}
        {(viewMode === 'unified' || viewMode === 'daw_stems') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                <span>DAW Multi-Track Stem Lanes ({activeStemsList.length} Stems)</span>
              </span>
              <span className="text-zinc-500 text-[10px]">
                Playhead Scrub Active · Lossless WAV Architecture
              </span>
            </div>

            {/* Lyric Sections Top Ruler */}
            <div className="relative h-6 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex items-center">
              {song.lyrics.map((l) => {
                const leftPct = (l.startTime / duration) * 100;
                const widthPct = ((l.endTime - l.startTime) / duration) * 100;
                return (
                  <div
                    key={l.id}
                    onClick={() => onSeek(l.startTime)}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className="absolute top-0 bottom-0 border-r border-zinc-800 px-2 flex items-center text-[9px] font-mono font-bold text-cyan-300 hover:bg-cyan-500/15 cursor-pointer transition-colors truncate"
                    title={`${l.section}: ${l.text}`}
                  >
                    {l.section}
                  </div>
                );
              })}
            </div>

            {/* Multi-Track Grid Container */}
            <div
              onClick={handleTimelineClick}
              className="relative bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 space-y-2 cursor-pointer select-none overflow-hidden"
            >
              {/* Moving Playhead Indicator */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.95)] z-20 pointer-events-none transition-all duration-75"
                style={{ left: `${playheadPercent}%` }}
              >
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full -translate-x-[4px] -translate-y-1 shadow-md shadow-cyan-400/50" />
              </div>

              {/* Stem Lanes */}
              {activeStemsList.map((stemId) => {
                const stem = song.stems[stemId];
                if (!stem) return null;

                return (
                  <div key={stemId} className="flex items-center gap-3">
                    {/* Lane Label */}
                    <div className="w-28 shrink-0 flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-300 truncate text-[11px]">
                        {stem.name}
                      </span>
                      <div
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: stem.color }}
                      />
                    </div>

                    {/* Note Blocks Lane */}
                    <div className="relative flex-1 h-7 bg-zinc-900/80 rounded-lg border border-zinc-800/80 overflow-hidden">
                      {/* Measure grid vertical lines (every 16 bars) */}
                      {Array.from({ length: 16 }).map((_, barIdx) => (
                        <div
                          key={barIdx}
                          className="absolute top-0 bottom-0 w-[1px] bg-zinc-800/40 pointer-events-none"
                          style={{ left: `${(barIdx / 16) * 100}%` }}
                        />
                      ))}

                      {/* Render Note Blocks */}
                      {(stem.notes || []).map((note, nIdx) => {
                        const noteStartTime = note.time * secPerBeat;
                        const noteDurationSec = (note.duration || 0.5) * secPerBeat;
                        const leftPct = (noteStartTime / duration) * 100;
                        const widthPct = Math.max(0.4, (noteDurationSec / duration) * 100);

                        if (leftPct > 100) return null;

                        return (
                          <div
                            key={nIdx}
                            className="absolute top-1 bottom-1 rounded-[2px] border border-white/10 opacity-85 transition-opacity hover:opacity-100"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              backgroundColor: stem.color,
                            }}
                            title={`${note.pitch} (${note.duration} beats)`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chords Progression Bottom Ruler */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs font-mono text-zinc-400 scrollbar-none">
          <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] shrink-0">
            Harmonic Progression:
          </span>
          {song.chordsProgression.map((chord, cIdx) => (
            <div
              key={cIdx}
              onClick={() => onSeek(chord.time)}
              className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-cyan-300 font-bold cursor-pointer transition-colors shrink-0 text-[11px]"
            >
              Bar {chord.bar}: {chord.chord}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
