import React, { useEffect, useRef, useState } from 'react';
import { FileAudio, Mic, Play, Square, UploadCloud } from 'lucide-react';
import { PRELOADED_DEMO_SAMPLES, SUPPORTED_LANGUAGES } from '../../mocks/data';
import { ACCEPTED_AUDIO_EXTENSIONS, validateAudioFile } from '../../utils/audio';
import { formatDuration, formatFileSize } from '../../utils/format';
import { AudioPlayerCard } from '../audio/AudioPlayerCard';
import type { SupportedLanguage } from '../../types';

export interface SelectedAudioState {
  mode: 'sample' | 'file' | 'recorded';
  sampleId?: string;
  file?: File;
  fileName: string;
  fileSize: number;
  durationSec: number;
  audioUrl: string;
  languageLabel: string;
}

interface VoiceInputPanelProps {
  selectedAudio: SelectedAudioState | null;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onSelectFile: (file: File, sourceMode?: 'file' | 'recorded', knownDurationSec?: number) => void;
  onSelectSample: (sampleId: string) => void;
  uploadProgress: number;
  isProcessing: boolean;
  onRunPipeline: () => void;
  validationError: string | null;
}

function getPreferredRecordingMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function VoiceInputPanel({
  selectedAudio,
  language,
  onLanguageChange,
  onSelectFile,
  onSelectSample,
  uploadProgress,
  isProcessing,
  onRunPipeline,
  validationError,
}: VoiceInputPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const recordStartMsRef = useRef<number>(0);

  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const stopTracksAndTimer = () => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      stopTracksAndTimer();
    };
  }, []);

  const handleFileCandidate = (file: File | undefined) => {
    if (!file) return;
    const check = validateAudioFile(file);
    if (!check.valid) {
      setLocalError(check.error ?? 'Invalid audio file.');
      return;
    }
    setLocalError(null);
    onSelectFile(file, 'file');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileCandidate(e.dataTransfer.files?.[0]);
  };

  const startRecording = async () => {
    setLocalError(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setLocalError('Audio recording is not supported in this browser. Please upload an audio file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getPreferredRecordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recordedChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setLocalError('Recording failed unexpectedly. Please try again.');
        setIsRecording(false);
        stopTracksAndTimer();
      };

      recorder.onstop = () => {
        const elapsedSec = Math.max(1, Math.round((Date.now() - recordStartMsRef.current) / 1000));
        const resolvedMime = recorder.mimeType || mimeType || 'audio/webm';
        const ext = resolvedMime.includes('ogg')
          ? 'ogg'
          : resolvedMime.includes('mp4')
          ? 'm4a'
          : 'webm';

        const blob = new Blob(recordedChunksRef.current, { type: resolvedMime });
        stopTracksAndTimer();
        setIsRecording(false);
        setRecordingSeconds(0);

        if (blob.size === 0) {
          setLocalError('No audio was captured. Please check your microphone and try again.');
          return;
        }

        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(11, 19);
        const recordedFile = new File([blob], `recorded_voice_${stamp}.${ext}`, {
          type: resolvedMime,
        });

        onSelectFile(recordedFile, 'recorded', elapsedSec);
      };

      recordStartMsRef.current = Date.now();
      setRecordingSeconds(0);
      setIsRecording(true);
      recorder.start();

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - recordStartMsRef.current) / 1000));
      }, 250);
    } catch (err) {
      stopTracksAndTimer();
      setIsRecording(false);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setLocalError('Microphone permission was denied. Allow microphone access or upload an audio file.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setLocalError('No microphone detected on this device. You can still upload an audio file.');
      } else {
        setLocalError('Unable to access microphone. Please check browser permissions and try again.');
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      stopTracksAndTimer();
      setIsRecording(false);
    }
  };

  const errorMessage = localError || validationError;

  return (
    <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-xs font-mono text-[#FF7139]">Step 01</p>
            <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
              Voice Input
            </h2>
          </div>
          <span className="text-xs text-[#929292]">Upload or Record</span>
        </div>

        {/* Audio Upload + Record Audio Controls Side by Side */}
        <div className="space-y-2.5">
          <input
            ref={inputRef}
            id="echo-audio-upload"
            type="file"
            accept={ACCEPTED_AUDIO_EXTENSIONS.join(',')}
            onChange={(e) => {
              handleFileCandidate(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="sr-only"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Existing Drag-and-Drop / Browse Upload Option */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              aria-label="Upload audio voice note file"
              className={`cursor-pointer rounded-xl border border-dashed p-4 text-center flex flex-col items-center justify-center min-h-[126px] transition-colors ${
                dragging
                  ? 'border-[#FF7139] bg-[#FF7139]/10'
                  : 'border-white/[0.16] hover:border-[#FF7139]/60 bg-[#141414]'
              }`}
            >
              <UploadCloud
                className="w-5 h-5 text-[#FF7139] mb-2"
                aria-hidden="true"
              />
              <p className="text-xs font-medium text-[#F5F0E8]">
                Upload audio file
              </p>
              <p className="text-[11px] text-[#929292] mt-1">
                Drop or browse · Max 15 MB
              </p>
            </div>

            {/* Record Audio Option using MediaRecorder */}
            <div
              className={`rounded-xl border p-4 text-center flex flex-col items-center justify-center min-h-[126px] transition-colors ${
                isRecording
                  ? 'border-[#E56D65]/60 bg-[#E56D65]/10'
                  : 'border-white/[0.12] bg-[#141414]'
              }`}
            >
              {isRecording ? (
                <>
                  <span className="font-mono tabular-nums text-sm font-semibold text-[#E56D65] mb-1">
                    {formatDuration(recordingSeconds)}
                  </span>
                  <p className="text-[11px] text-[#F5F0E8] mb-2.5">Recording audio...</p>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E56D65] hover:bg-[#ec7d76] text-[#101010] transition-colors whitespace-nowrap"
                  >
                    <Square className="w-3 h-3 fill-current" aria-hidden="true" />
                    <span>Stop recording</span>
                  </button>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-[#FF7139] mb-2" aria-hidden="true" />
                  <p className="text-xs font-medium text-[#F5F0E8] mb-2.5">
                    Record voice note
                  </p>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#242424] hover:bg-[#2f2f2f] border border-white/[0.12] disabled:opacity-45 text-[#F5F0E8] transition-colors whitespace-nowrap"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
                    <span>Record Audio</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#929292]">
            Accepted formats: .ogg, .opus, .wav, .mp3, .m4a, .webm
          </p>

          {errorMessage && (
            <p role="alert" className="text-xs text-[#E56D65]">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Preloaded Sample Demo Voice Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#F5F0E8]">Or load a simulated sample</span>
            <span className="text-[#929292]">Preloaded audio</span>
          </div>

          <div className="space-y-2">
            {PRELOADED_DEMO_SAMPLES.map((sample) => {
              const isSelected =
                selectedAudio?.mode === 'sample' && selectedAudio.sampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    onSelectSample(sample.id);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-[#242424] border-[#FF7139]/55'
                      : 'bg-[#141414] border-white/[0.07] hover:border-white/[0.18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#F5F0E8] truncate">
                      {sample.label}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-[#929292] shrink-0">
                      {formatDuration(sample.durationSec)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#929292] mt-1 truncate">
                    {sample.customerHint} · {sample.languageLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <label
            htmlFor="echo-language-select"
            className="block text-xs font-medium text-[#F5F0E8] mb-2"
          >
            Spoken language preference
          </label>
          <select
            id="echo-language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="w-full rounded-xl bg-[#101010] border border-white/[0.12] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#1B1B1B]">
                {lang.label} — {lang.nativeLabel}{' '}
                {lang.backendStatus === 'beta' ? '(Beta)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Player & File Details */}
        {selectedAudio && (
          <div className="space-y-2.5">
            <AudioPlayerCard
              src={selectedAudio.audioUrl}
              fileName={selectedAudio.fileName}
              durationSec={selectedAudio.durationSec}
              languageLabel={selectedAudio.languageLabel}
              compact
            />

            <div className="flex items-center justify-between text-[11px] text-[#929292] px-1">
              <span className="inline-flex items-center gap-1.5 truncate">
                <FileAudio className="w-3.5 h-3.5 text-[#FF7139] shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {selectedAudio.mode === 'sample'
                    ? 'Preloaded demo clip'
                    : selectedAudio.mode === 'recorded'
                    ? 'Recorded audio clip'
                    : 'Uploaded local file'}
                </span>
              </span>
              <span className="font-mono tabular-nums shrink-0">
                {formatFileSize(selectedAudio.fileSize)}
              </span>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#929292]">
                  <span>Uploading audio...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#101010] overflow-hidden">
                  <div
                    className="h-full bg-[#FF7139] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Run Pipeline Action */}
      <button
        type="button"
        disabled={!selectedAudio || isProcessing || isRecording}
        onClick={onRunPipeline}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] disabled:opacity-45 disabled:cursor-not-allowed text-[#101010] transition-colors"
      >
        <Play className="w-4 h-4 fill-current" aria-hidden="true" />
        <span>{isProcessing ? 'Processing voice note...' : 'Convert voice to order'}</span>
      </button>
    </div>
  );
}
