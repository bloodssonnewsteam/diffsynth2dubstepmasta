/**
 * Audio math, frequency mapping, and WAV file encoder for DiffRhythm 2
 */

// Note to Frequency mapping (A4 = 440Hz)
const NOTE_SEMITONES: Record<string, number> = {
  C: -9,
  'C#': -8,
  Db: -8,
  D: -7,
  'D#': -6,
  Eb: -6,
  E: -5,
  F: -4,
  'F#': -3,
  Gb: -3,
  G: -2,
  'G#': -1,
  Ab: -1,
  A: 0,
  'A#': 1,
  Bb: 1,
  B: 2,
};

export function noteToFreq(noteStr: string): number {
  if (!noteStr) return 440;
  // Parse e.g. "C4", "F#3", "Bb5"
  const match = noteStr.trim().match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return 440;
  const noteName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const octave = parseInt(match[2], 10);
  const semitoneOffset = NOTE_SEMITONES[noteName] ?? 0;
  // A4 is octave 4
  const semitonesFromA4 = semitoneOffset + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// Convert audio buffer to a standard 16-bit PCM WAV Blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Interleave and write samples
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit PCM integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
