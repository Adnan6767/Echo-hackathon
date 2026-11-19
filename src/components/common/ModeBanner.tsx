import { RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';
import { useApiMode } from '../../hooks/useEchoData';

interface ModeBannerProps {
  onResetDemo?: () => void;
  compact?: boolean;
}

export function ModeBanner({ onResetDemo, compact = false }: ModeBannerProps) {
  const { isMockMode, setMockMode } = useApiMode();

  return (
    <div
      className={`border border-white/[0.08] bg-[#1B1B1B] rounded-xl flex flex-wrap items-center justify-between gap-3 ${
        compact ? 'px-4 py-2.5' : 'px-5 py-3.5'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
        <span
          className={`font-medium ${
            isMockMode ? 'text-[#E8B75B]' : 'text-[#40C98A]'
          }`}
        >
          {isMockMode ? 'Simulated Demo Mode' : 'Live Python API Mode'}
        </span>
        <span className="text-[#929292]" aria-hidden="true">
          ·
        </span>
        <span className="text-[#929292]">
          {isMockMode
            ? 'Using preloaded sample audio and local simulated records (not live WhatsApp or backend AI).'
            : `Connected to ${API_BASE_URL}`}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isMockMode && onResetDemo && (
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 text-xs text-[#929292] hover:text-[#F5F0E8] px-2.5 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.16] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset demo data
          </button>
        )}

        <div className="inline-flex items-center p-0.5 rounded-lg bg-[#101010] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setMockMode(true)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              isMockMode
                ? 'bg-[#242424] text-[#F5F0E8]'
                : 'text-[#929292] hover:text-[#F5F0E8]'
            }`}
          >
            Demo data
          </button>
          <button
            type="button"
            onClick={() => setMockMode(false)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              !isMockMode
                ? 'bg-[#242424] text-[#F5F0E8]'
                : 'text-[#929292] hover:text-[#F5F0E8]'
            }`}
          >
            Live API
          </button>
        </div>
      </div>
    </div>
  );
}
