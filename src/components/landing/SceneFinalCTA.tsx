import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { WaveformVisualizer } from '../audio/WaveformVisualizer';

export function SceneFinalCTA() {
  return (
    <>
      {/* Scene 7: Final CTA */}
      <section className="py-28 sm:py-36 border-b border-white/[0.08] relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,113,57,0.11),transparent_60%)]"
        />

        <div className="relative max-w-[1360px] mx-auto px-5 sm:px-8 text-center">
          <p className="text-xs font-mono text-[#929292] mb-4">07 / 07 · From Voice to Action</p>

          <h2
            className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.06] max-w-4xl mx-auto text-balance"
            style={{ fontSize: 'clamp(2.25rem, 4.6vw, 4.1rem)' }}
          >
            Don&apos;t change how India speaks.
            <br />
            <span className="text-[#FF7139]">Change what happens after.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#929292] max-w-xl mx-auto">
            Every voice note deserves a structured record.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap"
            >
              <span>Try the demo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-xl border border-white/[0.14] hover:border-white/[0.28] text-[#F5F0E8] bg-[#1B1B1B] transition-colors whitespace-nowrap"
            >
              <span>Explore ECHO</span>
            </Link>
          </div>

          <div className="mt-14 max-w-md mx-auto opacity-75">
            <WaveformVisualizer bars={36} active heightClass="h-10" />
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="bg-[#101010] py-14">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
            <div className="md:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#F5F0E8]">
                <span className="inline-flex items-end gap-[2.5px] h-4" aria-hidden="true">
                  <span className="w-[2.5px] h-2 bg-[#FF7139] rounded-full" />
                  <span className="w-[2.5px] h-4 bg-[#FF7139] rounded-full" />
                  <span className="w-[2.5px] h-2.5 bg-[#FF7139] rounded-full" />
                </span>
                <span>ECHO</span>
              </div>
              <p className="text-sm text-[#929292] max-w-sm leading-relaxed">
                Voice-first business record infrastructure for Indian neighborhood stores. Built to
                turn everyday spoken orders into structured workflows and transparent credit
                ledgers.
              </p>
              <p className="text-xs text-[#929292] pt-1">
                Team ECHO · National Hackathon Submission · Voice-First Bharat Track
              </p>
            </div>

            <div className="md:col-span-3 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#F5F0E8]">Platform</h3>
              <ul className="space-y-2 text-sm text-[#929292]">
                <li>
                  <Link to="/demo" className="hover:text-[#F5F0E8] transition-colors">
                    Interactive Voice Demo
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#F5F0E8] transition-colors">
                    Business Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/orders" className="hover:text-[#F5F0E8] transition-colors">
                    Order Management
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/ledger" className="hover:text-[#F5F0E8] transition-colors">
                    Customer Udhaar Ledger
                  </Link>
                </li>
                <li>
                  <Link to="/clinic" className="hover:text-[#F5F0E8] transition-colors">
                    Clinic Prototype
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#F5F0E8]">Architecture &amp; Stack</h3>
              <p className="text-sm text-[#929292] leading-relaxed">
                React · TypeScript · Tailwind CSS · GSAP ScrollTrigger · Lenis · Recharts
              </p>
              <p className="text-xs text-[#929292] leading-relaxed pt-1">
                Planned backend stack: Python FastAPI, Sarvam Saaras ASR, Gemini structured
                extraction, and SQLite. Demo mode runs locally with simulated responses when the
                backend server is offline.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#929292]">
            <span>© {new Date().getFullYear()} ECHO — From Voice to Action.</span>
            <span>Designed for Indian Kirana Stores · Hindi / Hinglish Voice-First</span>
          </div>
        </div>
      </footer>
    </>
  );
}
