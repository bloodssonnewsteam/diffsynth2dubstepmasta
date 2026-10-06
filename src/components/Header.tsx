/**
 * DiffRhythm 2 - Studio Header Component
 */

import React from 'react';
import { Disc3, Library, User as UserIcon, LogOut, Sparkles, Layers, Sliders, Music2, Youtube } from 'lucide-react';
import { Song } from '../types/music';

interface HeaderProps {
  currentSong: Song | null;
  activeTab: 'studio' | 'mixer' | 'lyrics' | 'timeline';
  setActiveTab: (tab: 'studio' | 'mixer' | 'lyrics' | 'timeline') => void;
  onOpenLibrary: () => void;
  onOpenAuth: () => void;
  user: any;
  onLogout: () => void;
  savedSongsCount: number;
  onOpenReferences: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSong,
  activeTab,
  setActiveTab,
  onOpenLibrary,
  onOpenAuth,
  user,
  onLogout,
  savedSongsCount,
  onOpenReferences,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Model Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-fuchsia-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                <Disc3 size={17} className="text-cyan-400 animate-[spin_8s_linear_infinite]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">DiffRhythm</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-none">Procedural Multi-Track Synthesis</p>
            </div>
          </div>

          {/* Current Song Pill / Info */}
          {currentSong && (
            <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-zinc-800 text-xs text-zinc-300">
              <span className="font-semibold text-white max-w-[180px] truncate">{currentSong.title}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{currentSong.genre}</span>
              <span className="text-zinc-600">/</span>
              <span className="font-mono text-cyan-400">{currentSong.bpm} BPM</span>
              <span className="text-zinc-600">/</span>
              <span className="font-mono text-zinc-400">{currentSong.key}</span>
            </div>
          )}
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'studio' ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Prompt Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'mixer' ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders size={13} />
            <span>Stem Mixer</span>
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lyrics' ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music2 size={13} />
            <span>Sync Lyrics</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'timeline' ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={13} />
            <span>Arrangement</span>
          </button>
        </div>

        {/* Right Tools: Library & User Auth */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenReferences}
            title="Search YouTube and save metadata-based music references"
            aria-label="Open YouTube music references"
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-rose-300 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <Youtube size={15} />
          </button>
          {/* Song Library Button */}
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Library size={14} className="text-amber-400" />
            <span>Song Library</span>
            {savedSongsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-semibold">
                {savedSongsCount}
              </span>
            )}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-black uppercase">
                  {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                </div>
                <span className="text-xs font-medium text-zinc-300 max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <UserIcon size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
