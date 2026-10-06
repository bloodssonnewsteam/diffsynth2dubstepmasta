/**
 * DiffRhythm 2 - Full-Stack AI Music & Song Generation Web Application
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { MusicReference, Song, StemType, SongGenerationParams } from './types/music';
import { PRESET_SONGS } from './data/presets';
import { audioEngine } from './services/audioEngine';
import { evolutionaryEngine } from './services/evolutionaryLearningEngine';
import { autoMixer } from './services/autoMixerEngine';

// Components
import { Header } from './components/Header';
import { PlayerTransport } from './components/PlayerTransport';

const PromptStudio = lazy(async () => ({ default: (await import('./components/PromptStudio')).PromptStudio }));
const MultiTrackMixer = lazy(async () => ({ default: (await import('./components/MultiTrackMixer')).MultiTrackMixer }));
const LyricsTeleprompter = lazy(async () => ({ default: (await import('./components/LyricsTeleprompter')).LyricsTeleprompter }));
const ArrangementTimeline = lazy(async () => ({ default: (await import('./components/ArrangementTimeline')).ArrangementTimeline }));
const SongLibraryModal = lazy(async () => ({ default: (await import('./components/SongLibraryModal')).SongLibraryModal }));
const AuthModal = lazy(async () => ({ default: (await import('./components/AuthModal')).AuthModal }));
const DiffusionVisualizer = lazy(async () => ({ default: (await import('./components/DiffusionVisualizer')).DiffusionVisualizer }));
const YouTubeReferenceModal = lazy(async () => ({ default: (await import('./components/YouTubeReferenceModal')).YouTubeReferenceModal }));

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
  const [generationStatus, setGenerationStatus] = useState('Studio ready');

  // Modals & Drawers
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [musicReferences, setMusicReferences] = useState(() => evolutionaryEngine.getMusicReferences());
  const [user, setUser] = useState<User | null>(null);
  const [savedSongsCount, setSavedSongsCount] = useState<number>(0);
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
    const unsubComplete = audioEngine.onSongComplete((songId) => {
      evolutionaryEngine.recordSongEngagement(songId, 1);
    });

    return () => {
      unsubTime();
      unsubState();
      unsubComplete();
    };
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};
    let cancelInitialization = () => {};
    const initializeAccountServices = async () => {
      try {
        const [{ auth }, { onAuthStateChanged }] = await Promise.all([
          import('./services/firebase'),
          import('firebase/auth'),
        ]);
        if (disposed) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          void refreshLibraryCount();
        });
        void refreshLibraryCount();
      } catch (error) {
        console.warn('Account services unavailable; using local studio mode.', error);
      }
    };
    const idleWindow = window as unknown as { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(() => void initializeAccountServices(), { timeout: 1600 })
      : window.setTimeout(() => void initializeAccountServices(), 300);
    cancelInitialization = idleWindow.requestIdleCallback
      ? () => idleWindow.cancelIdleCallback?.(idleId)
      : () => window.clearTimeout(idleId);

    return () => {
      disposed = true;
      unsubscribe();
      cancelInitialization();
    };
  }, []);

  const refreshLibraryCount = async () => {
    try {
      const { libraryService } = await import('./services/libraryStorage');
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
    recordCurrentListeningProgress();
    audioEngine.pause();
  };

  const handleStop = () => {
    recordCurrentListeningProgress();
    audioEngine.stop();
  };

  const recordCurrentListeningProgress = () => {
    const duration = currentSong?.durationSec || 0;
    if (duration > 0) {
      evolutionaryEngine.recordSongEngagement(currentSong.id, currentTime / duration);
    }
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
  };

  // Load song from library or presets
  const handleSelectSong = (song: Song) => {
    recordCurrentListeningProgress();
    audioEngine.stop();
    setCurrentSong(song);
    audioEngine.loadSong(song);
    audioEngine.seek(0);
    audioEngine.play();
    refreshLibraryCount();
    showToast(`Loaded "${song.title}" into studio`);
  };

  // Update Stem mixer channels
  const handleUpdateStem = (stemType: StemType | string, updates: any) => {
    if (!currentSong) return;
    const typedStemType = stemType as StemType;
    const updatedStems = {
      ...currentSong.stems,
      [stemType]: {
        ...currentSong.stems[typedStemType],
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
      const { libraryService } = await import('./services/libraryStorage');
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
    setDiffusionStepProgress(5);
    setGenerationStatus('Starting audio engine');
    let audioReady = false;
    let compositionReady = false;
    let mixReady = false;

    // Stop current playback
    recordCurrentListeningProgress();
    audioEngine.stop();

    try {
      await audioEngine.resumeContext();
      audioReady = true;
      setGenerationStatus('Composing arrangement');
      setDiffusionStepProgress(15);

      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          referenceNotes: evolutionaryEngine.getReferenceNotes(),
          recentMotifs: evolutionaryEngine.getRecentMotifs(params.genre || ''),
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const newSong: Song = await response.json();
      if (!newSong?.title || !newSong.stems || !newSong.durationSec) {
        throw new Error('The generation service returned an incomplete song.');
      }
      compositionReady = true;

      setGenerationStatus('Balancing stems and preparing the master');
      setDiffusionStepProgress(75);
      const preferredMixStyle = evolutionaryEngine.getPreferredMixStyle(newSong.genre, newSong.bpm);
      const autoMixed = autoMixer.autoMixSong(newSong, preferredMixStyle);
      const readySong = autoMixed.updatedSong;
      mixReady = true;

      setGenerationStatus('Loading and starting the finished mix');
      setDiffusionStepProgress(92);
      setCurrentSong(readySong);
      audioEngine.loadSong(readySong);
      audioEngine.seek(0);
      await audioEngine.play();

      const evolvedState = evolutionaryEngine.recordSongGeneration(readySong, params);
      refreshLibraryCount();
      setDiffusionStepProgress(100);
      setGenerationStatus('Song fully generated, mixed, and playing');
      showToast(`Song fully generated, mixed, and ready: "${readySong.title}" (Gen #${evolvedState.currentGeneration})`);
    } catch (err) {
      console.error('Generation error:', err);
      const failureMessage = !audioReady
        ? 'Audio engine could not start. Check browser audio permissions and try again.'
        : !compositionReady
          ? 'Song generation failed. Check the server connection and try again.'
          : !mixReady
            ? 'The song was created, but final mix processing failed.'
            : 'The song was generated and mixed, but playback could not start. Press Play to retry.';
      setGenerationStatus(failureMessage);
      setDiffusionStepProgress(0);
      showToast(failureMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRateSong = (feedback: 'like' | 'dislike') => {
    if (!currentSong) return;
    const updatedSong = { ...currentSong, userFeedback: feedback };
    setCurrentSong(updatedSong);
    audioEngine.loadSong(updatedSong);
    const recorded = evolutionaryEngine.recordSongFeedback(updatedSong.id, feedback);
    showToast(
      recorded
        ? `Feedback saved for future ${updatedSong.genre} mixes`
        : 'Generate a song before rating its mix profile'
    );
  };

  const handleLogout = async () => {
    const { logoutUser } = await import('./services/firebase');
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
        onOpenReferences={() => setIsReferenceOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 px-4 py-2.5 bg-zinc-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl shadow-2xl shadow-cyan-500/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}

      <Suspense fallback={<div className="flex-1 p-6 text-center text-xs font-mono text-zinc-400">Loading studio tools…</div>}>
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-time Spectrum Analyser & Oscilloscope Bar */}
        <DiffusionVisualizer
          isPlaying={isPlaying}
          isGenerating={isGenerating}
          diffusionStepProgress={diffusionStepProgress}
          generationStatus={generationStatus}
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
          onRateSong={handleRateSong}
          isSaved={isCurrentSongSaved}
        />

        {/* Dynamic Studio Views */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'studio' && (
            <PromptStudio
              onGenerate={handleGenerateSong}
              isGenerating={isGenerating}
              diffusionStepProgress={diffusionStepProgress}
              generationStatus={generationStatus}
            />
          )}

          {activeTab === 'mixer' && currentSong && (
            <MultiTrackMixer
              song={currentSong}
              onUpdateStem={handleUpdateStem}
              onApplySong={(song: Song) => {
                setCurrentSong(song);
                audioEngine.loadSong(song);
              }}
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
          <span>DiffRhythm · Procedural Web Audio Studio · Key-aware arrangement</span>
          <span className="font-mono text-zinc-500">44.1kHz PCM WAV export</span>
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
        onSuccess={(u: User) => {
          setUser(u);
          showToast(`Welcome back, ${u.displayName || u.email}!`);
        }}
      />

      <YouTubeReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
        onAddReference={(reference: MusicReference) => {
          evolutionaryEngine.addMusicReference(reference);
          setMusicReferences(evolutionaryEngine.getMusicReferences());
          showToast(`Reference notes saved for future compositions`);
        }}
        onRemoveReference={(videoId: string) => {
          evolutionaryEngine.removeMusicReference(videoId);
          setMusicReferences(evolutionaryEngine.getMusicReferences());
        }}
        onUpdateInfluence={(videoId: string, influence: number) => {
          evolutionaryEngine.updateMusicReferenceInfluence(videoId, influence);
          setMusicReferences(evolutionaryEngine.getMusicReferences());
        }}
        references={musicReferences}
      />
      </Suspense>
    </div>
  );
}
