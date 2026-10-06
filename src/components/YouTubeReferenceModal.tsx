import React, { useEffect, useState } from 'react';
import {
  BookmarkCheck,
  ExternalLink,
  LoaderCircle,
  Play,
  Plus,
  Search,
  Trash2,
  X,
  Youtube,
} from 'lucide-react';
import { MusicReference, YouTubeSearchResult } from '../types/music';

interface YouTubeReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  references: MusicReference[];
  onAddReference: (reference: MusicReference) => void;
  onRemoveReference: (videoId: string) => void;
  onUpdateInfluence: (videoId: string, influence: number) => void;
}

export const YouTubeReferenceModal: React.FC<YouTubeReferenceModalProps> = ({
  isOpen,
  onClose,
  references,
  onAddReference,
  onRemoveReference,
  onUpdateInfluence,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [savedReferences, setSavedReferences] = useState(references);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedReferences(references);
  }, [references]);

  if (!isOpen) return null;

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2 || isSearching) return;
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Search failed.');
      setResults(payload.results || []);
      if (!payload.results?.length) setError('No matching videos found.');
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const studyReference = async (videoId: string) => {
    if (analyzingId) return;
    setAnalyzingId(videoId);
    setError(null);
    try {
      const response = await fetch('/api/youtube/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Reference analysis failed.');
      const reference = payload.reference as MusicReference;
      onAddReference(reference);
      setSavedReferences((current) => [
        reference,
        ...current.filter((item) => item.videoId !== reference.videoId),
      ].slice(0, 12));
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Reference analysis failed.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const removeReference = (videoId: string) => {
    onRemoveReference(videoId);
    setSavedReferences((current) => current.filter((item) => item.videoId !== videoId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <Youtube size={19} className="text-rose-400" />
            <div>
              <h2 id="reference-title" className="text-sm font-bold text-white">Music References</h2>
              <p className="text-[11px] text-zinc-400">Search video metadata for broad production ideas</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close references" className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X size={17} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 border-b border-zinc-800 p-5 lg:border-b-0 lg:border-r">
            <form onSubmit={search} className="flex gap-2">
              <label className="sr-only" htmlFor="youtube-reference-query">Search YouTube</label>
              <input
                id="youtube-reference-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Artist, track, genre, or production style"
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-rose-400"
              />
              <button
                type="submit"
                disabled={isSearching || query.trim().length < 2}
                className="flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
              >
                {isSearching ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {error && <p role="status" className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">{error}</p>}

            {playingVideoId && (
              <div className="aspect-video overflow-hidden rounded-lg border border-zinc-700 bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${playingVideoId}?autoplay=1&rel=0`}
                  title="YouTube music reference preview"
                  allow="autoplay; encrypted-media; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}

            <div className="divide-y divide-zinc-800">
              {results.map((result) => {
                const alreadySaved = savedReferences.some((reference) => reference.videoId === result.videoId);
                return (
                  <article key={result.videoId} className="flex gap-3 py-3 first:pt-0">
                    {result.thumbnailUrl && (
                      <img src={result.thumbnailUrl} alt="" className="h-16 w-28 shrink-0 rounded object-cover" loading="lazy" />
                    )}
                    <div className="min-w-0 flex-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${result.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 text-xs font-semibold text-zinc-100 hover:text-rose-300"
                      >
                        {result.title} <ExternalLink size={11} className="inline" />
                      </a>
                      <p className="mt-1 truncate text-[10px] text-zinc-500">{result.channelTitle}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                          type="button"
                          onClick={() => setPlayingVideoId(result.videoId)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-300 hover:text-rose-200"
                        >
                          <Play size={12} /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => studyReference(result.videoId)}
                          disabled={alreadySaved || analyzingId !== null}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 disabled:text-zinc-500"
                        >
                          {analyzingId === result.videoId ? <LoaderCircle size={12} className="animate-spin" /> : alreadySaved ? <BookmarkCheck size={12} /> : <Plus size={12} />}
                          {alreadySaved ? 'In studio memory' : 'Analyze & remember'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-3 bg-zinc-900/40 p-5">
            <div>
              <h3 className="text-xs font-bold text-white">Saved reference notes</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                The latest three notes are automatically included in future generations. Only public metadata is analyzed; audio and lyrics are not fetched.
              </p>
            </div>
            {savedReferences.length === 0 ? (
              <p className="border-t border-zinc-800 py-3 text-xs text-zinc-500">No reference notes saved.</p>
            ) : savedReferences.map((reference) => (
              <article key={reference.videoId} className="border-t border-zinc-800 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <a href={reference.url} target="_blank" rel="noreferrer" className="line-clamp-2 text-[11px] font-semibold text-zinc-200 hover:text-rose-300">
                    {reference.title}
                  </a>
                  <button type="button" onClick={() => removeReference(reference.videoId)} aria-label={`Remove ${reference.title}`} title="Remove reference" className="shrink-0 p-1 text-zinc-500 hover:text-rose-300">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">{reference.channelTitle} · {reference.genre}{reference.bpm ? ` · ${reference.bpm} BPM` : ''}{reference.key ? ` · ${reference.key}` : ''}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{[...reference.moodCues, ...reference.productionCues].join(' · ') || 'No specific mood or production cues found in metadata.'}</p>
                <label className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                  <span className="shrink-0">Influence {Math.round((reference.influence ?? 0.5) * 100)}%</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={reference.influence ?? 0.5}
                    aria-label={`Reference influence for ${reference.title}`}
                    onChange={(event) => onUpdateInfluence(reference.videoId, Number(event.target.value))}
                    className="min-w-0 flex-1 accent-cyan-400"
                  />
                </label>
              </article>
            ))}
          </aside>
        </div>
      </section>
    </div>
  );
};