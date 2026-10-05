/**
 * Song Library Service
 * Handles persistent storage (LocalStorage + Firestore sync), categorization,
 * tags, custom notes, searching, filtering, and export.
 */

import { Song } from '../types/music';
import { PRESET_SONGS } from '../data/presets';
import {
  auth,
  saveSongToFirestore,
  fetchUserSongsFromFirestore,
  deleteSongFromFirestore,
  updateSongMetaInFirestore,
  SavedSongItem,
} from './firebase';

const LOCAL_STORAGE_KEY = 'diffrhythm2_saved_songs_v1';
const LOCAL_CATEGORIES_KEY = 'diffrhythm2_categories_v1';

export const DEFAULT_CATEGORIES = [
  'All Songs',
  'Favorites',
  'Deep Dubstep & Rolling Bass',
  'Cyberpunk & Synthwave',
  'City Pop & Funk',
  'Lo-Fi & Chill',
  'Vocal Hits',
  'Work in Progress',
];

export class LibraryService {
  private static instance: LibraryService;

  public static getInstance(): LibraryService {
    if (!LibraryService.instance) {
      LibraryService.instance = new LibraryService();
    }
    return LibraryService.instance;
  }

  // Get all saved songs (merging local and Firestore if authenticated)
  public async getSongs(): Promise<SavedSongItem[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const cloudSongs = await fetchUserSongsFromFirestore(user.uid);
        if (cloudSongs.length > 0) {
          return cloudSongs;
        }
      } catch (err) {
        console.warn('Error reading from Firestore, falling back to local storage:', err);
      }
    }

    // LocalStorage fallback
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the stored songs are old short versions, inject the new 3+ minute deep dubstep preset
          const hasDubstep = parsed.some((p: any) => p.id === 'diffrhythm-preset-dubstep-abyssal-rolling');
          if (!hasDubstep) {
            const dubstepSeed = {
              id: PRESET_SONGS[0].id,
              userId: 'system',
              title: PRESET_SONGS[0].title,
              prompt: PRESET_SONGS[0].prompt,
              genre: PRESET_SONGS[0].genre,
              bpm: PRESET_SONGS[0].bpm,
              key: PRESET_SONGS[0].key,
              scale: PRESET_SONGS[0].scale,
              vocalStyle: PRESET_SONGS[0].vocalStyle,
              mood: PRESET_SONGS[0].mood,
              category: 'Deep Dubstep & Rolling Bass',
              notes: 'Flagship 3+ Minute Dark Deep Rolling Bass Dubstep. 140 BPM, D Minor, subterranean 35Hz wobble, half-time heavy punch drums.',
              tags: ['Deep Dubstep', 'Rolling Bass', '140 BPM', 'D Minor', '3-Min Full Mix'],
              durationSec: PRESET_SONGS[0].durationSec,
              songData: PRESET_SONGS[0],
              createdAt: PRESET_SONGS[0].diffusionMeta.generatedAt,
              updatedAt: PRESET_SONGS[0].diffusionMeta.generatedAt,
            };
            const updated = [dubstepSeed, ...parsed];
            this.saveLocalSongs(updated);
            return updated;
          }
          return parsed;
        }
      } catch (_) {}
    }

    // Initialize with presets as default saved songs
    const seeded = PRESET_SONGS.map((song) => ({
      id: song.id,
      userId: 'system',
      title: song.title,
      prompt: song.prompt,
      genre: song.genre,
      bpm: song.bpm,
      key: song.key,
      scale: song.scale,
      vocalStyle: song.vocalStyle,
      mood: song.mood,
      category: song.genre.includes('Dubstep')
        ? 'Deep Dubstep & Rolling Bass'
        : song.genre.includes('Synth')
        ? 'Cyberpunk & Synthwave'
        : song.genre.includes('City')
        ? 'City Pop & Funk'
        : 'Lo-Fi & Chill',
      notes: `Generated with DiffRhythm 2. DiT-Audio-Large model, ${song.diffusionMeta.steps} denoising steps.`,
      tags: [song.genre, song.vocalStyle, `${song.bpm} BPM`, song.key],
      durationSec: song.durationSec,
      songData: song,
      createdAt: song.diffusionMeta.generatedAt,
      updatedAt: song.diffusionMeta.generatedAt,
    }));

    this.saveLocalSongs(seeded);
    return seeded;
  }

  // Save or update a song in library
  public async saveSong(
    song: Song,
    category: string = 'All Songs',
    notes: string = '',
    tags: string[] = []
  ): Promise<SavedSongItem> {
    const user = auth.currentUser;
    const now = new Date().toISOString();

    const cleanTags = tags.length > 0 ? tags : [song.genre, song.vocalStyle, `${song.bpm} BPM`];

    const newItem: SavedSongItem = {
      id: song.id,
      userId: user ? user.uid : 'guest',
      title: song.title,
      prompt: song.prompt,
      genre: song.genre,
      bpm: song.bpm,
      key: song.key,
      scale: song.scale,
      vocalStyle: song.vocalStyle,
      mood: song.mood,
      category: category || 'All Songs',
      notes: notes || '',
      tags: cleanTags,
      durationSec: song.durationSec,
      songData: song,
      createdAt: now,
      updatedAt: now,
    };

    // If logged in, save to Firestore
    if (user) {
      try {
        await saveSongToFirestore(user.uid, song, category, notes, cleanTags);
      } catch (e) {
        console.warn('Could not sync to Firestore, saved locally:', e);
      }
    }

    // Always update local storage
    const current = await this.getSongs();
    const existingIndex = current.findIndex((s) => s.id === song.id);
    let updated: SavedSongItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newItem;
    } else {
      updated = [newItem, ...current];
    }
    this.saveLocalSongs(updated);
    return newItem;
  }

  // Update metadata (category, notes, tags, title)
  public async updateSongMeta(
    songId: string,
    updates: Partial<Pick<SavedSongItem, 'category' | 'notes' | 'tags' | 'title'>>
  ): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateSongMetaInFirestore(user.uid, songId, updates);
      } catch (e) {
        console.warn('Firestore update error:', e);
      }
    }

    const current = await this.getSongs();
    const target = current.find((s) => s.id === songId);
    if (target) {
      Object.assign(target, updates, { updatedAt: new Date().toISOString() });
      this.saveLocalSongs(current);
    }
  }

  // Delete a song from library
  public async deleteSong(songId: string): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteSongFromFirestore(user.uid, songId);
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }

    const current = await this.getSongs();
    const filtered = current.filter((s) => s.id !== songId);
    this.saveLocalSongs(filtered);
  }

  // Categories management
  public getCategories(): string[] {
    const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (_) {}
    }
    return DEFAULT_CATEGORIES;
  }

  public addCategory(cat: string): string[] {
    const current = this.getCategories();
    if (!current.includes(cat.trim())) {
      const updated = [...current, cat.trim()];
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  }

  private saveLocalSongs(songs: SavedSongItem[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(songs));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }
}

export const libraryService = LibraryService.getInstance();
