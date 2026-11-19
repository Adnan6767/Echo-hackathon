import { CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { Transcription } from '../../types';
import { formatConfidencePercent } from '../../utils/format';

export type StageStatus = 'waiting' | 'processing' | 'completed' | 'failed';

export interface PipelineStageState {
  upload: StageStatus;
  transcribe: StageStatus;
  extract: StageStatus;
  record: StageStatus;
}

interface PipelinePanelProps {
  stages: PipelineStageState;
  transcription: Transcription | null;
  errorMessage: string | null;
  onRetry: () => void;
  isMockMode: boolean;
}

const STAGE_META: { key: keyof PipelineStageState; num: string; title: string; detail: string }[] = [
  {
    key: 'upload',
    num: '01',
    title: 'Audio uploaded',
    detail: 'Validated multipart audio payload staged for ASR.',
  },
  {
    key: 'transcribe',
    num: '02',
    title: 'Transcription',
    detail: 'Hindi / Hinglish spoken audio converted into text.',
  },
  {
    key: 'extract',
    num: '03',
    title: 'AI extraction',
    detail: 'Items, quantities, units, payment mode, and ambiguity flags parsed.',
  },
  {
    key: 'record',
    num: '04',
    title: 'Record creation',
    detail: 'Awaiting shopkeeper confirmation before committing to ledger.',
  },
];

function StageStatusIndicator({ status }: { status: StageStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#40C98A]">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        Completed
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FF7139]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Processing
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E56D65]">
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#929292]">
      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
      Waiting
    </span>
  );
}

export function PipelinePanel({
  stages,
  transcription,
  errorMessage,
  onRetry,
  isMockMode,
}: PipelinePanelProps) {
  return (
    <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-6">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-xs font-mono text-[#FF7139]">Step 02</p>
            <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
              Processing Pipeline
            </h2>
          </div>
          <span className="text-xs text-[#929292]">
            {isMockMode ? 'Simulated Pipeline' : 'Live API'}
          </span>
        </div>

        {/* 4 Stages */}
        <ol className="space-y-3">
          {STAGE_META.map((stage) => {
            const status = stages[stage.key];
            return (
              <li
                key={stage.key}
                className={`rounded-xl p-4 border transition-colors ${
                  status === 'processing'
                    ? 'bg-[#242424] border-[#FF7139]/50'
                    : status === 'completed'
                    ? 'bg-[#141414] border-[#40C98A]/25'
                    : status === 'failed'
                    ? 'bg-[#141414] border-[#E56D65]/40'
                    : 'bg-[#141414] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono tabular-nums text-[#929292]">
                      {stage.num}
                    </span>
                    <h3 className="text-sm font-medium text-[#F5F0E8]">{stage.title}</h3>
                  </div>
                  <StageStatusIndicator status={status} />
                </div>
                <p className="mt-1.5 text-xs text-[#929292] leading-relaxed pl-6">
                  {stage.detail}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Error Panel */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl bg-[#E56D65]/10 border border-[#E56D65]/35 p-4 space-y-3"
          >
            <p className="text-xs font-medium text-[#E56D65]">Pipeline Error</p>
            <p className="text-xs text-[#F5F0E8]/90 leading-relaxed">{errorMessage}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-[#F5F0E8] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Retry processing
            </button>
          </div>
        )}

        {/* Live Transcription Output */}
        <div className="rounded-xl bg-[#101010] border border-white/[0.08] p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#F5F0E8]">Transcription Output</span>
            {transcription && (
              <span className="font-mono tabular-nums text-[#40C98A]">
                {formatConfidencePercent(transcription.confidence)}
              </span>
            )}
          </div>

          {transcription ? (
            <>
              <p className="text-sm text-[#F5F0E8] leading-relaxed">
                &ldquo;{transcription.rawText}&rdquo;
              </p>
              <p className="text-xs text-[#929292] leading-relaxed pt-2 border-t border-white/[0.07]">
                Normalized: {transcription.normalizedText}
              </p>
              <p className="text-[11px] font-mono text-[#929292] pt-1">
                Source: {transcription.engine}
              </p>
            </>
          ) : (
            <p className="text-xs text-[#929292] leading-relaxed">
              Run a voice note on the left to inspect live speech-to-text output and extraction
              diagnostics.
            </p>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.08] text-[11px] text-[#929292] leading-relaxed">
        {isMockMode
          ? 'Demo notice: Responses below are simulated locally to demonstrate the exact Python API contract.'
          : 'Live notice: Requests are sent directly to your configured VITE_API_BASE_URL.'}
      </div>
    </div>
  );
}
