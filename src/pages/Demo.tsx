import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import {
  VoiceInputPanel,
  type SelectedAudioState,
} from '../components/demo/VoiceInputPanel';
import {
  PipelinePanel,
  type PipelineStageState,
} from '../components/demo/PipelinePanel';
import { StructuredOutputPanel } from '../components/demo/StructuredOutputPanel';
import { PRELOADED_DEMO_SAMPLES } from '../mocks/data';
import { createDemoVoiceNoteWavUrl, readAudioDuration } from '../utils/audio';
import {
  extractOrderFromTranscription,
  transcribeAudio,
  uploadAudioFile,
} from '../api/audio.api';
import { createOrder } from '../api/orders.api';
import { formatApiError } from '../api/client';
import { useApiMode } from '../hooks/useEchoData';
import { useToast } from '../hooks/useToast';
import type { ExtractedOrder, SupportedLanguage, Transcription } from '../types';

const INITIAL_STAGES: PipelineStageState = {
  upload: 'waiting',
  transcribe: 'waiting',
  extract: 'waiting',
  record: 'waiting',
};

export default function Demo() {
  const { isMockMode } = useApiMode();
  const { pushToast } = useToast();

  const [language, setLanguage] = useState<SupportedLanguage>('hinglish');
  const [selectedAudio, setSelectedAudio] = useState<SelectedAudioState | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stages, setStages] = useState<PipelineStageState>(INITIAL_STAGES);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [draft, setDraft] = useState<ExtractedOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

  // Preload first sample on initial mount so the user can immediately play or run it
  useEffect(() => {
    const first = PRELOADED_DEMO_SAMPLES[0];
    const url = createDemoVoiceNoteWavUrl(first.durationSec, first.seed);
    setSelectedAudio({
      mode: 'sample',
      sampleId: first.id,
      fileName: first.fileName,
      fileSize: first.durationSec * 32000 + 44,
      durationSec: first.durationSec,
      audioUrl: url,
      languageLabel: first.languageLabel,
    });
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleSelectSample = (sampleId: string) => {
    const sample = PRELOADED_DEMO_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;

    if (selectedAudio?.audioUrl) {
      URL.revokeObjectURL(selectedAudio.audioUrl);
    }

    const url = createDemoVoiceNoteWavUrl(sample.durationSec, sample.seed);
    setLanguage(sample.language);
    setSelectedAudio({
      mode: 'sample',
      sampleId: sample.id,
      fileName: sample.fileName,
      fileSize: sample.durationSec * 32000 + 44,
      durationSec: sample.durationSec,
      audioUrl: url,
      languageLabel: sample.languageLabel,
    });
    setStages(INITIAL_STAGES);
    setTranscription(null);
    setDraft(null);
    setErrorMessage(null);
    setConfirmedOrderNumber(null);
    setUploadProgress(0);
  };

  const handleSelectFile = async (
    file: File,
    sourceMode: 'file' | 'recorded' = 'file',
    knownDurationSec?: number
  ) => {
    const duration =
      typeof knownDurationSec === 'number' && knownDurationSec > 0
        ? knownDurationSec
        : await readAudioDuration(file);

    if (selectedAudio?.audioUrl) {
      URL.revokeObjectURL(selectedAudio.audioUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedAudio({
      mode: sourceMode,
      file,
      fileName: file.name,
      fileSize: file.size,
      durationSec: duration,
      audioUrl: url,
      languageLabel: language === 'hinglish' ? 'Hindi / Hinglish' : language,
    });
    setStages(INITIAL_STAGES);
    setTranscription(null);
    setDraft(null);
    setErrorMessage(null);
    setConfirmedOrderNumber(null);
    setUploadProgress(0);

    if (sourceMode === 'recorded') {
      pushToast({
        variant: 'info',
        title: 'Audio recording captured',
        description: `Saved ${file.name} (${duration}s). Click "Convert voice to order" to process it.`,
      });
    }
  };

  const runPipeline = async () => {
    if (!selectedAudio) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setConfirmedOrderNumber(null);
    setTranscription(null);
    setDraft(null);
    setUploadProgress(0);
    setStages({
      upload: 'processing',
      transcribe: 'waiting',
      extract: 'waiting',
      record: 'waiting',
    });

    try {
      // Prepare File object even for preloaded sample so multipart contract stays consistent
      let fileToUpload = selectedAudio.file;
      if (!fileToUpload) {
        const res = await fetch(selectedAudio.audioUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], selectedAudio.fileName, { type: 'audio/wav' });
      }

      // Stage 1: Upload
      const uploadResult = await uploadAudioFile(
        fileToUpload,
        language,
        selectedAudio.durationSec,
        (pct) => setUploadProgress(pct)
      );

      setStages({
        upload: 'completed',
        transcribe: 'processing',
        extract: 'waiting',
        record: 'waiting',
      });

      // Stage 2: Transcribe
      const transResult = await transcribeAudio(
        uploadResult.id,
        language,
        selectedAudio.sampleId
      );
      setTranscription(transResult);

      setStages({
        upload: 'completed',
        transcribe: 'completed',
        extract: 'processing',
        record: 'waiting',
      });

      // Stage 3: Extract
      const extracted = await extractOrderFromTranscription(
        uploadResult.id,
        transResult.rawText,
        language,
        selectedAudio.sampleId
      );
      setDraft(extracted);

      setStages({
        upload: 'completed',
        transcribe: 'completed',
        extract: 'completed',
        record: 'waiting',
      });

      pushToast({
        variant: extracted.warnings.length > 0 ? 'warning' : 'success',
        title:
          extracted.warnings.length > 0
            ? 'Extraction complete — review flagged fields'
            : 'Structured order ready for confirmation',
        description: isMockMode
          ? 'Generated in Simulated Demo Mode. Edit any field before saving.'
          : 'Extracted via connected Python backend.',
      });
    } catch (err) {
      const msg = formatApiError(err);
      setErrorMessage(msg);
      setStages((prev) => ({
        upload: prev.upload === 'processing' ? 'failed' : prev.upload,
        transcribe: prev.transcribe === 'processing' ? 'failed' : prev.transcribe,
        extract: prev.extract === 'processing' ? 'failed' : prev.extract,
        record: prev.record === 'processing' ? 'failed' : prev.record,
      }));
      pushToast({
        variant: 'error',
        title: 'Voice processing failed',
        description: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!draft || !selectedAudio) return;
    setIsSaving(true);
    setStages((prev) => ({ ...prev, record: 'processing' }));

    try {
      const total = draft.items.reduce(
        (sum, it) => sum + (it.quantity ?? 0) * (it.unitPriceInr ?? 0),
        0
      );

      const saved = await createOrder({
        customerId: '',
        customerName: draft.customerName.trim(),
        customerPhone: draft.customerPhone?.trim() || '',
        items: draft.items,
        totalAmountInr: total,
        paymentMode: draft.paymentMode,
        status: 'received',
        audioDurationSec: selectedAudio.durationSec,
        audioFileName: selectedAudio.fileName,
        transcription: draft.transcription,
        language: draft.language,
        deliveryInstructions: draft.deliveryInstructions,
        overallConfidence: draft.overallConfidence,
        source: isMockMode ? 'demo' : 'live',
      });

      setConfirmedOrderNumber(saved.orderNumber);
      setStages((prev) => ({ ...prev, record: 'completed' }));
      pushToast({
        variant: 'success',
        title: `Order ${saved.orderNumber} confirmed`,
        description:
          draft.paymentMode === 'udhaar'
            ? `Recorded ₹${total} to ${saved.customerName}'s udhaar ledger.`
            : `Order saved to the dashboard (${draft.paymentMode.toUpperCase()}).`,
      });
    } catch (err) {
      const msg = formatApiError(err);
      setStages((prev) => ({ ...prev, record: 'failed' }));
      pushToast({
        variant: 'error',
        title: 'Could not save order',
        description: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectOrder = () => {
    setDraft(null);
    setConfirmedOrderNumber(null);
    setStages(INITIAL_STAGES);
    pushToast({
      variant: 'info',
      title: 'Extraction rejected',
      description: 'No order or ledger entry was saved.',
    });
  };

  return (
    <MarketingLayout>
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-[#FF7139] mb-2">Interactive Voice-to-Order Demo</p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F0E8] tracking-tight">
              Test a voice note end-to-end.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#929292] max-w-2xl">
              Upload an audio clip, record a voice note directly in your browser, or pick a
              preloaded Hindi/Hinglish sample to inspect every stage from intake to confirmation.
            </p>
          </div>

          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#F5F0E8] hover:text-[#FF7139] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Orders Dashboard</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Transparent Mode Indicator */}
        <ModeBanner />

        {/* Three-Panel Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <VoiceInputPanel
            selectedAudio={selectedAudio}
            language={language}
            onLanguageChange={setLanguage}
            onSelectFile={handleSelectFile}
            onSelectSample={handleSelectSample}
            uploadProgress={uploadProgress}
            isProcessing={isProcessing}
            onRunPipeline={runPipeline}
            validationError={null}
          />

          <PipelinePanel
            stages={stages}
            transcription={transcription}
            errorMessage={errorMessage}
            onRetry={runPipeline}
            isMockMode={isMockMode}
          />

          <StructuredOutputPanel
            draft={draft}
            onChangeDraft={setDraft}
            onConfirmOrder={handleConfirmOrder}
            onRejectOrder={handleRejectOrder}
            onRetry={runPipeline}
            confirmedOrderNumber={confirmedOrderNumber}
            isSaving={isSaving}
          />
        </div>
      </div>
    </MarketingLayout>
  );
}
