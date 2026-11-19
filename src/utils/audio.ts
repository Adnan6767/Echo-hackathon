export const ACCEPTED_AUDIO_EXTENSIONS = ['.ogg', '.opus', '.wav', '.mp3', '.m4a', '.webm'];
export const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const lower = file.name.toLowerCase();
  const hasValidExt = ACCEPTED_AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const hasAudioMime = file.type.startsWith('audio/') || file.type === 'application/ogg';

  if (!hasValidExt && !hasAudioMime) {
    return {
      valid: false,
      error: `Unsupported audio format. Please upload ${ACCEPTED_AUDIO_EXTENSIONS.join(', ')} files.`,
    };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File exceeds the 15 MB limit. Please upload a shorter voice note.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'Audio file appears to be empty.',
    };
  }

  return { valid: true };
}

export function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 8;
      cleanup();
      resolve(Math.round(duration));
    };

    audio.onerror = () => {
      cleanup();
      resolve(8);
    };

    audio.src = url;
  });
}

/**
 * Generates a gentle, playable synthetic WAV Blob representing a simulated voice note
 * envelope so preloaded demo clips have real working HTML5 <audio> playback without
 * relying on external audio URLs.
 */
export function createDemoVoiceNoteWavUrl(durationSec = 8, seed = 1): string {
  const sampleRate = 16000;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Subtle warm speech-cadence harmonic envelope (pleasant low-volume acoustic pulse)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllableEnvelope =
      Math.max(0, Math.sin(t * (4.2 + (seed % 3) * 0.7) + seed)) *
      Math.max(0, Math.sin(t * 1.45 + seed * 0.5)) *
      (t > 0.25 && t < durationSec - 0.35 ? 1 : 0.15);

    const fundamental = 165 + (seed % 4) * 18 + Math.sin(t * 3.1) * 16;
    const tone =
      Math.sin(2 * Math.PI * fundamental * t) * 0.55 +
      Math.sin(2 * Math.PI * fundamental * 2.01 * t) * 0.25 +
      Math.sin(2 * Math.PI * fundamental * 3.0 * t) * 0.12;

    const sample = Math.max(-1, Math.min(1, tone * syllableEnvelope * 0.22));
    view.setInt16(44 + i * 2, Math.floor(sample * 32767), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
