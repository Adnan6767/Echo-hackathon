import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PIPELINE_STEPS = [
  {
    number: '01',
    title: 'Voice capture',
    description:
      'Upload or forward a WhatsApp-style voice note (.ogg, .opus, .wav, .mp3, .m4a) with language preference.',
    outputHint: 'multipart/form-data → POST /api/audio/upload',
  },
  {
    number: '02',
    title: 'Speech recognition',
    description:
      'Convert conversational Hindi, Indian English, or code-mixed Hinglish speech into clean text transcripts.',
    outputHint: 'Sarvam Saaras ASR → POST /api/audio/transcribe',
  },
  {
    number: '03',
    title: 'AI extraction',
    description:
      'Extract customer name, items, quantities, units, payment mode (udhaar/UPI/cash), and confidence warnings.',
    outputHint: 'Gemini Structured JSON → POST /api/orders/extract',
  },
  {
    number: '04',
    title: 'Structured record',
    description:
      'Shopkeeper confirms or edits low-confidence fields before committing the order and updating the credit ledger.',
    outputHint: 'Python API + SQLite → POST /api/orders',
  },
];

const TECH_STACK: {
  name: string;
  role: string;
  status: 'Active Architecture' | 'Optional Alternative';
}[] = [
  { name: 'Sarvam Saaras', role: 'Indic Speech-to-Text', status: 'Active Architecture' },
  { name: 'Gemini', role: 'Structured Order Extraction', status: 'Active Architecture' },
  { name: 'Structured JSON', role: 'Validated Schema Output', status: 'Active Architecture' },
  { name: 'Python', role: 'Backend API (In Development)', status: 'Active Architecture' },
  { name: 'SQLite', role: 'Lightweight Store Database', status: 'Active Architecture' },
  { name: 'Whisper / PostgreSQL', role: 'Self-hosted ASR & Cloud DB', status: 'Optional Alternative' },
];

export function SceneHowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hiw-timeline',
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 0.5,
              onUpdate: (self) => {
                const idx = Math.min(3, Math.floor(self.progress * 4));
                setActiveIndex(idx);
              },
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 sm:py-32 border-b border-white/[0.08]"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-xs font-mono text-[#929292] mb-3">04 / 07 · How It Works</p>
            <h2
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.08] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.35rem)' }}
            >
              Four steps.
              <br />
              <span className="text-[#929292]">Zero manual transcription.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#929292] max-w-md leading-relaxed">
            Every stage is transparent and verifiable. Uncertain quantities are flagged for human
            review rather than silently written into financial records.
          </p>
        </div>

        {/* Connected 4-Stage Timeline */}
        <div className="hiw-timeline relative mb-16">
          {/* Desktop horizontal connecting rail */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-5 left-0 right-0 h-[1px] bg-white/[0.1]"
          />
          <div
            ref={lineRef}
            aria-hidden="true"
            className="hidden lg:block absolute top-5 left-0 right-0 h-[2px] bg-[#FF7139] origin-left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PIPELINE_STEPS.map((step, index) => {
              const highlighted = index <= activeIndex;
              return (
                <div
                  key={step.number}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`relative pt-10 lg:pt-12 pb-6 px-5 rounded-2xl border transition-colors duration-200 ${
                    highlighted
                      ? 'bg-[#1B1B1B] border-[#FF7139]/35'
                      : 'bg-[#151515] border-white/[0.08]'
                  }`}
                >
                  {/* Node indicator on the timeline rail */}
                  <div
                    className={`w-3 h-3 rounded-full absolute top-3.5 left-5 transition-colors duration-200 ${
                      highlighted ? 'bg-[#FF7139]' : 'bg-[#2E2E2E]'
                    }`}
                    aria-hidden="true"
                  />

                  <span
                    className={`text-xs font-mono tabular-nums ${
                      highlighted ? 'text-[#FF7139]' : 'text-[#929292]'
                    }`}
                  >
                    {step.number}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#F5F0E8]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-[#929292] leading-relaxed">
                    {step.description}
                  </p>
                  <p className="mt-5 pt-3 border-t border-white/[0.07] text-[11px] font-mono text-[#929292] truncate">
                    {step.outputHint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Architecture Stack Legend — Honest Active vs Optional Labels */}
        <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-[#F5F0E8]">
                System Architecture &amp; Technology Stack
              </h3>
              <p className="text-xs text-[#929292] mt-0.5">
                Frontend is API-ready for the Python backend currently under development; interactive
                demo runs in simulated mode until connected.
              </p>
            </div>
            <span className="text-xs font-mono text-[#929292]">REST + JSON Contract</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="flex items-baseline justify-between gap-3 py-2 border-b border-white/[0.06]"
              >
                <div>
                  <span className="text-sm font-medium text-[#F5F0E8]">{tech.name}</span>
                  <span className="text-xs text-[#929292] block">{tech.role}</span>
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    tech.status === 'Active Architecture' ? 'text-[#FF7139]' : 'text-[#929292]'
                  }`}
                >
                  {tech.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
