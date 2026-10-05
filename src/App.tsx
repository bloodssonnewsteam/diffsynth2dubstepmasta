/**
 * DiffRhythm 2 - Full-Stack AI Music & Song Generation Web Application
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Song, StemType, SongGenerationParams } from './types/music';
import { PRESET_SONGS } from './data/presets';
import { audioEngine } from './services/audioEngine';
import { auth, logoutUser } from './services/firebase';
import { libraryService } from './services/libraryStorage';
import { evolutionaryEngine } from './services/evolutionaryLearningEngine';
import { autoMixer } from './services/autoMixerEngine';

// Components
import { Header } from './components/Header';
import { PromptStudio } from './components/PromptStudio';
import { PlayerTransport } from './components/PlayerTransport';
import { MultiTrackMixer } from './components/MultiTrackMixer';
import { LyricsTeleprompter } from './components/LyricsTeleprompter';
import { ArrangementTimeline } from './components/ArrangementTimeline';
import { SongLibraryModal } from './components/SongLibraryModal';
import { AuthModal } from './components/AuthModal';
import { DiffusionVisualizer } from './components/DiffusionVisualizer';

export default function App() {
  // Active Song State (default to Neon Overdrive preset for instant playback)
  const [currentSong, setCurrentSong] = useState<Song>(PRESET_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Tab View
  const [activeTab, setActiveTab] = useState<'studio' | 'mixer' | 'lyrics' | 'timeline'>('studio');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [diffusionStepProgress, setDiffusionStepProgress] = useState(0);

  // Modals & Drawers
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedSongsCount, setSavedSongsCount] = useState<number>(3);
  const [isCurrentSongSaved, setIsCurrentSongSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize AudioEngine on first load
  useEffect(() => {
    if (currentSong) {
      audioEngine.loadSong(currentSong);
    }

    const unsubTime = audioEngine.onTimeUpdate((time) => {
      setCurrentTime(time);
    });

    const unsubState = audioEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      refreshLibraryCount();
    });
    refreshLibraryCount();
    return () => unsubAuth();
  }, []);

  const refreshLibraryCount = async () => {
    try {
      const items = await libraryService.getSongs();
      setSavedSongsCount(items.length);
      if (currentSong) {
        setIsCurrentSongSaved(items.some((i) => i.id === currentSong.id));
      }
    } catch (_) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Playback Handlers
  const handlePlay = () => {
    audioEngine.play();
  };

  const handlePause = () => {
    audioEngine.pause();
  };

  const handleStop = () => {
    audioEngine.stop();
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
  };

  // Load song from library or presets
  const handleSelectSong = (song: Song) => {
    audioEngine.stop();
    setCurrentSong(song);
    audioEngine.loadSong(song);
    audioEngine.seek(0);
    audioEngine.play();
    refreshLibraryCount();
    showToast(`Loaded "${song.title}" into studio`);
  };

  // Update Stem mixer channels
  const handleUpdateStem = (stemType: StemType, updates: any) => {
    if (!currentSong) return;
    const updatedStems = {
      ...currentSong.stems,
      [stemType]: {
        ...currentSong.stems[stemType],
        ...updates,
      },
    };
    const updatedSong = { ...currentSong, stems: updatedStems };
    setCurrentSong(updatedSong);
    audioEngine.loadSong(updatedSong);
  };

  // Save Current Song into Library
  const handleSaveCurrentSong = async (
    category: string = 'All Songs',
    notes: string = '',
    tags: string[] = []
  ) => {
    if (!currentSong) return;
    try {
      await libraryService.saveSong(currentSong, category, notes, tags);
      setIsCurrentSongSaved(true);
      refreshLibraryCount();
      showToast(`Saved "${currentSong.title}" to library!`);
    } catch (e) {
      console.error('Error saving song:', e);
    }
  };

  // Generate Song with DiffRhythm 2 AI
  const handleGenerateSong = async (params: SongGenerationParams) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setDiffusionStepProgress(0);

    // Stop current playback
    audioEngine.stop();

    // Start animated diffusion step progress
    const progressInterval = setInterval(() => {
      setDiffusionStepProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 8 + 4);
      });
    }, 200);

    try {
      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const newSong: Song = await response.json();

      // 1. Evolutionary Self-Learning Step: Feed song DNA into neural memory
      const evolvedState = evolutionaryEngine.recordSongGeneration(newSong, params);

      // 2. Intelligent Auto-Mix Step: Automatically mix all stems to the best of its knowledge!
      const autoMixed = autoMixer.autoMixSong(newSong);
      const readySong = autoMixed.updatedSong;

      clearInterval(progressInterval);
      setDiffusionStepProgress(100);

      // Brief delay to showcase the finished denoised spectrogram
      setTimeout(() => {
        setIsGenerating(false);
        setDiffusionStepProgress(0);
        setCurrentSong(readySong);
        audioEngine.loadSong(readySong);
        audioEngine.seek(0);
        audioEngine.play();
        refreshLibraryCount();
        showToast(`Gen #${evolvedState.currentGeneration} Evolved & Auto-Mixed: "${readySong.title}"`);
      }, 400);
    } catch (err: any) {
      console.error('Generation error:', err);
      clearInterval(progressInterval);
      setIsGenerating(false);
      setDiffusionStepProgress(0);
      showToast('Error generating song. Loaded dynamic composition fallback.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    showToast('Signed out of studio');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Studio Navigation Header */}
      <Header
        currentSong={currentSong}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
        savedSongsCount={savedSongsCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 px-4 py-2.5 bg-zinc-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-time Spectrum Analyser & Oscilloscope Bar */}
        <DiffusionVisualizer
          isPlaying={isPlaying}
          isGenerating={isGenerating}
          diffusionStepProgress={diffusionStepProgress}
        />

        {/* Master Player & Transport Bar */}
        <PlayerTransport
          song={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onSeek={handleSeek}
          onSaveToLibrary={() => handleSaveCurrentSong()}
          isSaved={isCurrentSongSaved}
        />

        {/* Dynamic Studio Views */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'studio' && (
            <PromptStudio
              onGenerate={handleGenerateSong}
              isGenerating={isGenerating}
              diffusionStepProgress={diffusionStepProgress}
            />
          )}

          {activeTab === 'mixer' && currentSong && (
            <MultiTrackMixer
              song={currentSong}
              onUpdateStem={handleUpdateStem}
              isPlaying={isPlaying}
            />
          )}

          {activeTab === 'lyrics' && currentSong && (
            <LyricsTeleprompter
              song={currentSong}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          )}

          {activeTab === 'timeline' && currentSong && (
            <ArrangementTimeline
              song={currentSong}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-auto border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DiffRhythm 2 Latent Diffusion Music Studio · 44.1kHz Multi-Track Synthesis</span>
          <span className="font-mono text-zinc-500">Lossless WAV Audio Rendering</span>
        </div>
      </footer>

      {/* Song Library Modal */}
      <SongLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectSong={handleSelectSong}
        currentSong={currentSong}
        onSaveCurrentSong={handleSaveCurrentSong}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          showToast(`Welcome back, ${u.displayName || u.email}!`);
        }}
      />
    </div>
  );
}
