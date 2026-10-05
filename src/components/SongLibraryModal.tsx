/**
 * DiffRhythm 2 - Song Library Feature
 * Categorization, custom notes, tags, search, play, download, and delete.
 */

import React, { useState, useEffect } from 'react';
import {
  Library,
  X,
  Play,
  Download,
  Trash2,
  Tag,
  FileText,
  Search,
  Plus,
  Check,
  Music,
  Clock,
  Sliders,
  FolderPlus,
} from 'lucide-react';
import { Song, StemType } from '../types/music';
import { SavedSongItem } from '../services/firebase';
import { libraryService } from '../services/libraryStorage';
import { audioEngine } from '../services/audioEngine';
import { downloadBlob, formatTime } from '../utils/audioMath';

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  currentSong: Song | null;
  onSaveCurrentSong: (category: string, notes: string, tags: string[]) => Promise<void>;
}

export const SongLibraryModal: React.FC<SongLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  currentSong,
  onSaveCurrentSong,
}) => {
  const [songs, setSongs] = useState<SavedSongItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Editing state for notes and tags
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');

  // Save current song drawer
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [saveCategory, setSaveCategory] = useState('All Songs');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveTags, setSaveTags] = useState('');

  // New category creation input
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLibraryData();
    }
  }, [isOpen]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const items = await libraryService.getSongs();
      setSongs(items);
      const cats = libraryService.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error('Error loading library:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter songs by category and search query
  const filteredSongs = songs.filter((s) => {
    const matchesCategory =
      selectedCategory === 'All Songs' || s.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  const handlePlaySong = (item: SavedSongItem) => {
    onSelectSong(item.songData);
    onClose();
  };

  const handleDownloadWav = async (item: SavedSongItem) => {
    setDownloadingId(item.id);
    try {
      const wavBlob = await audioEngine.exportToWav(item.songData);
      const safeTitle = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadBlob(wavBlob, `${safeTitle}-master.wav`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (confirm('Are you sure you want to delete this song from your library?')) {
      await libraryService.deleteSong(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const startEditSong = (item: SavedSongItem) => {
    setEditingSongId(item.id);
    setEditNotes(item.notes || '');
    setEditCategory(item.category || 'All Songs');
    setEditTagsInput((item.tags || []).join(', '));
  };

  const saveEditSong = async (id: string) => {
    const tagsArray = editTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await libraryService.updateSongMeta(id, {
      category: editCategory,
      notes: editNotes,
      tags: tagsArray,
    });

    setSongs((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, category: editCategory, notes: editNotes, tags: tagsArray }
          : s
      )
    );
    setEditingSongId(null);
  };

  const handleCreateCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = libraryService.addCategory(newCatInput.trim());
    setCategories(updated);
    setSelectedCategory(newCatInput.trim());
    setNewCatInput('');
    setShowAddCat(false);
  };

  const handleSaveCurrentSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSong) return;
    const tagsArr = saveTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onSaveCurrentSong(saveCategory, saveNotes, tagsArr);
    setIsSavingCurrent(false);
    loadLibraryData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800/90 flex items-center justify-between gap-4 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Library size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Song Library & Stems Vault</h2>
              <p className="text-xs text-zinc-400">
                {songs.length} saved songs · Persistent multi-track recordings, categories, and custom notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSong && (
              <button
                type="button"
                onClick={() => setIsSavingCurrent(!isSavingCurrent)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Save Active Song</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Save Current Song Drawer */}
        {isSavingCurrent && currentSong && (
          <form
            onSubmit={handleSaveCurrentSongSubmit}
            className="p-4 bg-zinc-900 border-b border-zinc-800 space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Music size={14} className="text-amber-400" />
                <span>Saving "{currentSong.title}" to Library</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSavingCurrent(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Playlist / Category</label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g. Cyberpunk, Vocal Anthem, Synthwave"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Custom Notes</label>
                <input
                  type="text"
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="e.g. Master take with heavy 808 and reverb lead"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Confirm Save to Library
              </button>
            </div>
          </form>
        )}

        {/* Search & Category Filter Navigation */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}

            {showAddCat ? (
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Category Name"
                  className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white w-28 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="p-1 bg-amber-500 text-black rounded-lg"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCat(false)}
                  className="p-1 text-zinc-400"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddCat(true)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <FolderPlus size={12} />
                <span>+ Category</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, prompt, tags..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredSongs.length === 0 ? (
            <div className="py-16 text-center">
              <Library size={36} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-sm font-semibold text-zinc-400">No songs found in this category</p>
              <p className="text-xs text-zinc-600 mt-1">
                Generate a song from prompt and click "Save to Library" to build your collection!
              </p>
            </div>
          ) : (
            filteredSongs.map((item) => {
              const isEditing = editingSongId === item.id;
              const isDownloading = downloadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-zinc-700 transition-all shadow-md space-y-3"
                >
                  {/* Top Line: Title, Genre, Category & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlaySong(item)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/10 cursor-pointer shrink-0 transition-transform active:scale-95"
                        title="Load & Play Song in Studio"
                      >
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-white">{item.title}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-cyan-300 border border-zinc-700">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span>{item.genre}</span>
                          <span>·</span>
                          <span className="font-mono text-cyan-400">{item.bpm} BPM</span>
                          <span>·</span>
                          <span className="font-mono">{item.key}</span>
                          <span>·</span>
                          <span>{formatTime(item.durationSec)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadWav(item)}
                        disabled={isDownloading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        title="Export Master WAV file"
                      >
                        <Download size={13} />
                        <span>{isDownloading ? 'Rendering...' : 'Download WAV'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? saveEditSong(item.id) : startEditSong(item)
                        }
                        className={`p-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                          isEditing
                            ? 'bg-amber-500 text-black border-amber-400 font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
                        }`}
                        title={isEditing ? 'Save Changes' : 'Edit Notes & Tags'}
                      >
                        {isEditing ? <Check size={14} /> : <FileText size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSong(item.id)}
                        className="p-2 bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
                        title="Delete from Library"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* English Prompt Quote */}
                  <div className="text-xs text-zinc-300 italic bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    "{item.prompt}"
                  </div>

                  {/* Inline Metadata & Notes Editor */}
                  {isEditing ? (
                    <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Playlist Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={editTagsInput}
                            onChange={(e) => setEditTagsInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Custom Notes / Production Remarks</label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your mixing notes, arrangement ideas, or lyrical annotations..."
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSongId(null)}
                          className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditSong(item.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Tags Bar */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag size={12} className="text-zinc-500" />
                          {item.tags.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* User Custom Notes */}
                      {item.notes && (
                        <div className="flex items-start gap-2 text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
                          <FileText size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
