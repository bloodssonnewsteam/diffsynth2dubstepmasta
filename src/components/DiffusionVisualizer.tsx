/**
 * DiffRhythm 2 - Real-Time Audio Visualizer & Latent Diffusion Spectrogram
 */

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Radio, Eye } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface DiffusionVisualizerProps {
  isPlaying: boolean;
  isGenerating: boolean;
  diffusionStepProgress: number;
}

export const DiffusionVisualizer: React.FC<DiffusionVisualizerProps> = ({
  isPlaying,
  isGenerating,
  diffusionStepProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visualMode, setVisualMode] = useState<'fft' | 'oscilloscope' | 'spectrogram'>('fft');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const analyser = audioEngine.getAnalyser();

    const bufferLength = analyser ? analyser.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      // Dark futuristic background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      if (isGenerating) {
        // Render Latent Diffusion Denoising Simulation
        // As stepProgress increases, noise transitions to harmonic bands
        const noiseFactor = Math.max(0, 1 - diffusionStepProgress / 100);
        const harmonicFactor = diffusionStepProgress / 100;

        const cols = 48;
        const colWidth = width / cols;

        for (let i = 0; i < cols; i++) {
          const noise = (Math.random() * 2 - 1) * noiseFactor * (height * 0.7);
          const harmonic =
            Math.sin(i * 0.35) * Math.cos(i * 0.15) * harmonicFactor * (height * 0.45);
          const barHeight = Math.max(4, Math.abs(noise + harmonic) + 10);

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#6366f1');
          grad.addColorStop(1, '#ec4899');

          ctx.fillStyle = grad;
          ctx.fillRect(i * colWidth, height - barHeight, colWidth - 2, barHeight);
        }

        // Overlay text
        ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.font = '10px monospace';
        ctx.fillText(
          `DIFFRHYTHM-2 LATENT DENOISING: STEP ${Math.round(diffusionStepProgress)}%`,
          12,
          18
        );
        return;
      }

      if (!analyser || !isPlaying) {
        // Idle ambient wave
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const t = performance.now() * 0.002;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.02 + t) * 8 * Math.cos(x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(161, 161, 170, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText('ENGINE READY // 44.1kHz STEREO BUS', 12, 18);
        return;
      }

      if (visualMode === 'fft') {
        // Frequency Bars Visualizer
        analyser.getByteFrequencyData(dataArray);
        const bars = 54;
        const barWidth = width / bars;

        for (let i = 0; i < bars; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = (val / 255) * (height - 20);

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.6, '#3b82f6');
          grad.addColorStop(1, '#f43f5e');

          ctx.fillStyle = grad;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);

          // Peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(i * barWidth, height - barHeight - 2, barWidth - 2, 2);
        }
      } else {
        // Oscilloscope Waveform
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isGenerating, diffusionStepProgress, visualMode]);

  return (
    <div className="relative w-full h-24 bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={720}
        height={96}
        className="w-full h-full block"
      />

      {/* Visualizer Mode Switcher */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/80 p-0.5 rounded-lg">
        <button
          type="button"
          onClick={() => setVisualMode('fft')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
            visualMode === 'fft' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          SPECTRUM
        </button>
        <button
          type="button"
          onClick={() => setVisualMode('oscilloscope')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
            visualMode === 'oscilloscope' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          WAVE
        </button>
      </div>
    </div>
  );
};
