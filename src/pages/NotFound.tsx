import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { WaveformVisualizer } from '../components/audio/WaveformVisualizer';

export default function NotFound() {
  return (
    <MarketingLayout>
      <div className="max-w-xl mx-auto px-5 py-28 text-center space-y-6">
        <p className="text-xs font-mono text-[#FF7139]">404 · Page Not Found</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#F5F0E8] tracking-tight">
          We couldn&apos;t hear that route.
        </h1>
        <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
          The page you requested does not exist in ECHO. Return to the main story, test the voice
          demo, or open the shopkeeper dashboard.
        </p>

        <div className="max-w-xs mx-auto py-4 opacity-70">
          <WaveformVisualizer bars={24} heightClass="h-8" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border border-white/[0.12] hover:border-white/[0.24] text-[#F5F0E8] bg-[#1B1B1B] transition-colors"
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
