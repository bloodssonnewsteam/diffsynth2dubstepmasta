/**
 * DiffRhythm 2 - Studio Master Transport & Audio Player
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  Download,
  BookmarkPlus,
  Copy,
  Check,
  Music,
  Share2,
} from 'lucide-react';
import { Song, StemType } from '../types/music';
import { formatTime, downloadBlob } from '../utils/audioMath';
import { audioEngine } from '../services/audioEngine';

interface PlayerTransportProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onSaveToLibrary: () => void;
  isSaved?: boolean;
}

export const PlayerTransport: React.FC<PlayerTransportProps> = ({
  song,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onSaveToLibrary,
  isSaved = false,
}) => {
  const [masterVolume, setMasterVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [isLooping, setIsLooping] = useState(true);

  if (!song) return null;

  const duration = song.durationSec || 195;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));

  // Determine parts
  const p1Start = 0;
  const p2Start = song.parts?.[1]?.startSec || Math.round(duration * 0.33);
  const p3Start = song.parts?.[2]?.startSec || Math.round(duration * 0.68);

  // Determine current active lyric line / section
  const activeLyric = song.lyrics.find(
    (l) => currentTime >= l.startTime && currentTime <= l.endTime
  );

  const handleVolumeChange = (val: number) => {
    setMasterVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
    audioEngine.setMasterVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setMasterVolume(masterVolume);
    } else {
      setIsMuted(true);
      audioEngine.setMasterVolume(0);
    }
  };

  // Export full song master WAV
  const handleExportMasterWav = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgressText('Rendering 44.1kHz Lossless Master WAV (Full 3+ Minutes)...');

    try {
      const wavBlob = await audioEngine.exportToWav(song);
      const safeTitle = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlob(wavBlob, `${safeTitle}-master.wav`);
    } catch (err) {
      console.error('Master export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // Export all isolated stems
  const handleExportStems = async () => {
    if (isExporting) return;
    setIsExporting(true);
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
    const has10 = tenStemsOrder.some((k) => !!song.stems[k]);
    const stemTypes: StemType[] = has10
      ? tenStemsOrder.filter((k) => !!song.stems[k])
      : (['vocals', 'lead', 'chords', 'bass', 'drums', 'fx'] as StemType[]);

    const safeTitle = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      for (let i = 0; i < stemTypes.length; i++) {
        const stemId = stemTypes[i];
        setExportProgressText(`Rendering Stem ${i + 1}/${stemTypes.length} (${stemId.toUpperCase()})...`);
        const wavBlob = await audioEngine.exportToWav(song, stemId);
        downloadBlob(wavBlob, `${safeTitle}-stem-${stemId}.wav`);
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Stem export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  const handleCopyLyrics = () => {
    if (!song.lyrics) return;
    const text = song.lyrics
      .map((l) => `[${l.section}]\n${l.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-lg space-y-3">
      {/* Top Bar: Title, Active Lyric Teleprompter Snippet, and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Song Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
            <Music size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">{song.title}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {song.genre}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-mono text-cyan-400">{song.bpm} BPM</span>
              <span>·</span>
              <span className="font-mono">{song.key}</span>
              <span>·</span>
              <span>{song.vocalStyle}</span>
            </div>
          </div>
        </div>

        {/* Current Sing-along Lyric Snippet */}
        <div className="flex-1 max-w-md mx-auto hidden md:block text-center px-4 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          {activeLyric ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 mr-2">
                [{activeLyric.section}]
              </span>
              <span className="text-xs text-zinc-100 font-medium">{activeLyric.text}</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-500 italic">Instrumental bridge / transition</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSaveToLibrary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
          >
            <BookmarkPlus size={14} className={isSaved ? 'text-amber-400' : ''} />
            <span>{isSaved ? 'In Library' : 'Save to Library'}</span>
          </button>

          <button
            onClick={handleExportMasterWav}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Exporting...' : 'Export WAV'}</span>
          </button>

          <button
            onClick={handleExportStems}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Download individual stems as separate WAV tracks"
          >
            <span>Stems</span>
          </button>

          <button
            onClick={handleCopyLyrics}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Copy Song Lyrics"
          >
            {copiedLyrics ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Export Status Banner */}
      {isExporting && (
        <div className="p-2 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-xs text-cyan-300 text-center animate-pulse">
          {exportProgressText}
        </div>
      )}

      {/* Timeline Scrubber & Section Markers */}
      <div className="space-y-1">
        <div className="relative w-full h-3 bg-zinc-900 rounded-lg overflow-hidden group cursor-pointer border border-zinc-800/80">
          {/* Progress bar fill */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Section markers */}
          {song.lyrics.map((lyric) => {
            const leftPct = (lyric.startTime / duration) * 100;
            return (
              <div
                key={lyric.id}
                className="absolute top-0 bottom-0 w-[1px] bg-white/20 pointer-events-none"
                style={{ left: `${leftPct}%` }}
                title={`${lyric.section} (${formatTime(lyric.startTime)})`}
              />
            );
          })}

          {/* Full-width transparent range slider for seamless scrubbing */}
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Time Indicators */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            {song.lyrics.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onSeek(l.startTime)}
                className={`text-[10px] hover:text-cyan-400 transition-colors shrink-0 ${
                  activeLyric?.id === l.id ? 'text-cyan-400 font-bold underline' : 'text-zinc-500'
                }`}
              >
                {l.section}
              </button>
            ))}
          </div>
          <span className="text-zinc-300 font-semibold">{formatTime(duration)}</span>
        </div>

        {/* 3 Movement Quick-Jumps for 3-Minute Songs */}
        <div className="flex items-center justify-center gap-2 pt-1 border-t border-zinc-900">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">Movements:</span>
          <button
            type="button"
            onClick={() => onSeek(p1Start)}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
              currentTime < p2Start
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            Part I: Build (0:00)
          </button>
          <button
            type="button"
            onClick={() => onSeek(p2Start)}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
              currentTime >= p2Start && currentTime < p3Start
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            Part II: Drop 1 ({formatTime(p2Start)})
          </button>
          <button
            type="button"
            onClick={() => onSeek(p3Start)}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
              currentTime >= p3Start
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            Part III: Drop 2 / Climax ({formatTime(p3Start)})
          </button>
        </div>
      </div>

      {/* Transport Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={onStop}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Stop & Return to Start"
          >
            <Square size={14} fill="currentColor" />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2.5 border rounded-xl transition-colors cursor-pointer ${
              isLooping
                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title="Loop Song"
          >
            <Repeat size={14} />
          </button>
        </div>

        {/* Master Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || masterVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1.2}
            step={0.05}
            value={isMuted ? 0 : masterVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-[10px] text-zinc-400 w-8">
            {isMuted ? 'MUTE' : `${Math.round(masterVolume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
