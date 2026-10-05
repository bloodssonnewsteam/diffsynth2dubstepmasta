/**
 * Firebase Client Setup, Authentication & Firestore persistence
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Song } from '../types/music';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by Firebase integration guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline check:', error.message);
    }
  }
}
testFirestoreConnection();

// --- Auth Utilities ---

export async function registerUser(email: string, pass: string, displayName: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  // Store user document
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      userId: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || cred.user.email?.split('@')[0],
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to write user doc:', e);
  }
  return cred.user;
}

export async function loginUser(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// --- Song Library Persistence in Firestore ---

export interface SavedSongItem {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  genre: string;
  bpm: number;
  key: string;
  scale?: string;
  vocalStyle: string;
  mood: string;
  category: string;
  notes: string;
  tags: string[];
  durationSec: number;
  songData: Song; // Full multi-track song object
  createdAt: string;
  updatedAt: string;
}

export async function saveSongToFirestore(
  userId: string,
  song: Song,
  category: string = 'My Creations',
  notes: string = '',
  tags: string[] = []
): Promise<SavedSongItem> {
  const songDocRef = doc(db, 'users', userId, 'savedSongs', song.id);
  const now = new Date().toISOString();

  const item: SavedSongItem = {
    id: song.id,
    userId,
    title: song.title,
    prompt: song.prompt,
    genre: song.genre,
    bpm: song.bpm,
    key: song.key,
    scale: song.scale,
    vocalStyle: song.vocalStyle,
    mood: song.mood,
    category: category || 'My Creations',
    notes: notes || '',
    tags: tags && tags.length > 0 ? tags : [song.genre, song.vocalStyle],
    durationSec: song.durationSec,
    songData: song,
    createdAt: now,
    updatedAt: now,
  };

  // Convert songData to JSON string or clean object for Firestore
  await setDoc(songDocRef, {
    ...item,
    songData: JSON.stringify(song),
    serverTimestamp: serverTimestamp(),
  });

  return item;
}

export async function fetchUserSongsFromFirestore(userId: string): Promise<SavedSongItem[]> {
  try {
    const colRef = collection(db, 'users', userId, 'savedSongs');
    const snapshot = await getDocs(colRef);
    const items: SavedSongItem[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      let parsedSong = data.songData;
      if (typeof data.songData === 'string') {
        try {
          parsedSong = JSON.parse(data.songData);
        } catch (_) {}
      }
      items.push({
        id: d.id,
        userId: data.userId || userId,
        title: data.title || 'Untitled Song',
        prompt: data.prompt || '',
        genre: data.genre || 'Electronic',
        bpm: data.bpm || 120,
        key: data.key || 'C Major',
        scale: data.scale || 'minor',
        vocalStyle: data.vocalStyle || 'Pop',
        mood: data.mood || 'Energetic',
        category: data.category || 'My Creations',
        notes: data.notes || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        durationSec: data.durationSec || 60,
        songData: parsedSong,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    return items;
  } catch (err) {
    console.error('Error fetching songs from Firestore:', err);
    return [];
  }
}

export async function deleteSongFromFirestore(userId: string, songId: string): Promise<void> {
  const songDocRef = doc(db, 'users', userId, 'savedSongs', songId);
  await deleteDoc(songDocRef);
}

export async function updateSongMetaInFirestore(
  userId: string,
  songId: string,
  updates: Partial<Pick<SavedSongItem, 'category' | 'notes' | 'tags' | 'title'>>
): Promise<void> {
  const songDocRef = doc(db, 'users', userId, 'savedSongs', songId);
  await setDoc(
    songDocRef,
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
