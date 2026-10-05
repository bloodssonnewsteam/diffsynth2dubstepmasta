/**
 * DiffRhythm 2 - Synchronized Karaoke Lyrics Teleprompter
 */

import React, { useEffect, useRef } from 'react';
import { Music, Play, Edit3, Sparkles } from 'lucide-react';
import { Song, LyricLine } from '../types/music';
import { formatTime } from '../utils/audioMath';

interface LyricsTeleprompterProps {
  song: Song;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const LyricsTeleprompter: React.FC<LyricsTeleprompterProps> = ({ song, currentTime, onSeek }) => {
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active lyric into view smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Teleprompter Card */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <Music size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Synchronized Vocal Lyrics Teleprompter
            </h3>
          </div>
          <span className="text-xs text-zinc-400">Click any line to jump audio playback</span>
        </div>

        {/* Scrolling Lyrics Container */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-700">
          {song.lyrics.map((line: LyricLine) => {
            const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
            const isPast = currentTime > line.endTime;

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.startTime)}
                className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                    : isPast
                    ? 'bg-zinc-950/40 border-zinc-800/40 opacity-50 hover:opacity-80 hover:bg-zinc-900/60'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                {/* Section & Time header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`font-mono font-bold uppercase tracking-wider ${
                      isActive ? 'text-cyan-400' : 'text-zinc-500'
                    }`}
                  >
                    [{line.section}]
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                    <span>
                      {formatTime(line.startTime)} - {formatTime(line.endTime)}
                    </span>
                    <Play size={10} className={isActive ? 'text-cyan-400 fill-cyan-400' : ''} />
                  </div>
                </div>

                {/* Lyrics Text with Word-level Highlight */}
                <div
                  className={`text-lg sm:text-xl font-bold tracking-tight transition-colors leading-relaxed ${
                    isActive ? 'text-white' : isPast ? 'text-zinc-400' : 'text-zinc-300'
                  }`}
                >
                  {line.words && line.words.length > 0 ? (
                    <span className="flex flex-wrap gap-x-2 gap-y-1">
                      {line.words.map((w, wIdx) => {
                        const isWordActive =
                          isActive && currentTime >= w.start && currentTime <= w.end;
                        return (
                          <span
                            key={wIdx}
                            className={`transition-colors duration-100 ${
                              isWordActive
                                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] font-extrabold'
                                : ''
                            }`}
                          >
                            {w.word}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span>{line.text}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
