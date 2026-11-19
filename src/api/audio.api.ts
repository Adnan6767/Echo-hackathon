import { apiClient, isMockModeEnabled } from './client';
import { ENDPOINTS } from './endpoints';
import { PRELOADED_DEMO_SAMPLES } from '../mocks/data';
import type { AudioUpload, ExtractedOrder, SupportedLanguage, Transcription } from '../types';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadAudioFile(
  file: File,
  language: SupportedLanguage,
  durationSec: number,
  onProgress?: (percent: number) => void
): Promise<AudioUpload> {
  if (isMockModeEnabled()) {
    for (const p of [20, 48, 76, 100]) {
      await delay(140);
      onProgress?.(p);
    }
    return {
      id: `aud-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'audio/ogg',
      durationSec,
      language,
      uploadedAt: new Date().toISOString(),
      audioUrl: URL.createObjectURL(file),
      source: 'demo',
    };
  }

  // Real multipart/form-data upload — intentionally DO NOT set Content-Type manually
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await apiClient.post<AudioUpload>(ENDPOINTS.audio.upload, formData, {
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return { ...response.data, source: 'live' };
}

export async function transcribeAudio(
  audioId: string,
  language: SupportedLanguage,
  sampleId?: string
): Promise<Transcription> {
  if (isMockModeEnabled()) {
    await delay(850);
    const matched =
      PRELOADED_DEMO_SAMPLES.find((s) => s.id === sampleId) ?? PRELOADED_DEMO_SAMPLES[0];

    return {
      audioId,
      rawText: matched.transcription,
      normalizedText: matched.normalizedText,
      detectedLanguage: matched.languageLabel,
      confidence: matched.extracted.overallConfidence,
      durationSec: matched.durationSec,
      engine: 'Simulated Demo Response (Sarvam Saaras target)',
      source: 'demo',
    };
  }

  const response = await apiClient.post<Transcription>(ENDPOINTS.audio.transcribe, {
    audio_id: audioId,
    language,
  });
  return { ...response.data, source: 'live' };
}

export async function extractOrderFromTranscription(
  audioId: string,
  transcription: string,
  language: SupportedLanguage,
  sampleId?: string
): Promise<ExtractedOrder> {
  if (isMockModeEnabled()) {
    await delay(920);
    const matched =
      PRELOADED_DEMO_SAMPLES.find((s) => s.id === sampleId) ?? PRELOADED_DEMO_SAMPLES[0];

    return {
      id: `ext-${Date.now()}`,
      audioId,
      ...matched.extracted,
      customerName: '',
      customerPhone: '',
      items: matched.extracted.items.map((item) => ({
        ...item,
        unitPriceInr: null,
      })),
      createdAt: new Date().toISOString(),
      source: 'demo',
    };
  }

  const response = await apiClient.post<ExtractedOrder>(ENDPOINTS.orders.extract, {
    audio_id: audioId,
    transcription,
    language,
  });
  return {
    ...response.data,
    customerName: '',
    customerPhone: '',
    items: response.data.items.map((item) => ({
      ...item,
      unitPriceInr: null,
    })),
    source: 'live',
  };
}
