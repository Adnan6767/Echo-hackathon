import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WAVE_BARS = [
  24, 52, 82, 44, 96, 68, 38, 86, 60, 92, 48, 76, 36, 90, 62, 84, 42, 70, 56, 88, 34, 66, 46, 28,
];

const STAGES = [
  {
    index: 0,
    label: '01 · Raw Voice Note',
    caption: 'A single 8-second Hinglish voice note enters ECHO.',
  },
  {
    index: 1,
    label: '02 · Acoustic Transit',
    caption: 'The waveform carries spoken intent across the processing stage without losing context.',
  },
  {
    index: 2,
    label: '03 · Structural Alignment',
    caption: 'Spoken phrases stretch into discrete product, quantity, unit, and credit rows.',
  },
  {
    index: 3,
    label: '04 · Actionable Order Card',
    caption: 'One verified digital record — with the original orange voice signature preserved inside.',
  },
];

export function SceneTransformation() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const morphCardRef = useRef<HTMLDivElement | null>(null);
  const waveBandRef = useRef<HTMLDivElement | null>(null);
  const voiceCaptionRef = useRef<HTMLDivElement | null>(null);
  const rowsContainerRef = useRef<HTMLDivElement | null>(null);
  const cardHeaderRef = useRef<HTMLDivElement | null>(null);
  const cardFooterRef = useRef<HTMLDivElement | null>(null);

  const [activeStage, setActiveStage] = useState(0);
  const [manualStage, setManualStage] = useState<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) {
      setActiveStage(3);
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=2200',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              const next = p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3;
              setActiveStage(next);
            },
          },
        });

        // Initial Stage 1 state: voice-note bar anchored on the left
        gsap.set(morphCardRef.current, {
          xPercent: -24,
          scale: 0.96,
        });
        gsap.set(cardHeaderRef.current, { opacity: 0, y: -10 });
        gsap.set(rowsContainerRef.current, { opacity: 0, y: 18, scaleY: 0.88 });
        gsap.set('.morph-data-row', { opacity: 0, x: -24 });
        gsap.set(cardFooterRef.current, { opacity: 0, y: 12 });

        // Stage 1 -> Stage 2: Entire voice-note object glides horizontally across screen
        tl.to(
          morphCardRef.current,
          {
            xPercent: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power2.inOut',
          },
          0
        );

        // Stage 2 -> Stage 3: Same object expands; waveform compresses cleanly into the integrated header spine while structured rows unfold directly beneath it
        tl.to(
          waveBandRef.current,
          {
            scaleY: 0.52,
            opacity: 0.85,
            duration: 1,
            ease: 'power2.inOut',
          },
          1.1
        )
          .to(
            voiceCaptionRef.current,
            {
              opacity: 0.65,
              duration: 0.7,
            },
            1.15
          )
          .to(
            cardHeaderRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
            },
            1.25
          )
          .to(
            rowsContainerRef.current,
            {
              opacity: 1,
              y: 0,
              scaleY: 1,
              duration: 0.85,
              ease: 'power2.out',
            },
            1.3
          )
          .to(
            '.morph-data-row',
            {
              opacity: 1,
              x: 0,
              stagger: 0.18,
              duration: 0.65,
              ease: 'power2.out',
            },
            1.45
          );

        // Stage 3 -> Stage 4: Settles into verified order card with footer confirmation
        tl.to(
          cardFooterRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          2.25
        ).to(
          morphCardRef.current,
          {
            borderColor: 'rgba(255, 113, 57, 0.45)',
            duration: 0.6,
          },
          2.3
        );
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const displayedStage = manualStage !== null ? manualStage : activeStage;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#101010] border-b border-white/[0.08] py-20 lg:py-0 lg:min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Subtle acoustic axis grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #F5F0E8 1px, transparent 1px), linear-gradient(to bottom, #F5F0E8 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative max-w-[1360px] w-full mx-auto px-5 sm:px-8 py-8">
        {/* Top Heading Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono text-[#FF7139] mb-2.5">
              03 / 07 · The ECHO Transformation
            </p>
            <h2
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.06] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.4rem)' }}
            >
              One voice note.
              <br />
              One actionable record.
            </h2>
          </div>

          <p className="text-sm text-[#929292] max-w-md leading-relaxed">
            {STAGES[displayedStage].caption}
          </p>
        </div>

        {/* Desktop Continuous Morph Cinema Stage */}
        <div
          ref={stageRef}
          className="hidden lg:flex items-center justify-center min-h-[430px] rounded-2xl border border-white/[0.08] bg-[#141414] px-10 py-10 relative overflow-hidden"
        >
          {/* Subtle directional track behind the transforming object */}
          <div
            aria-hidden="true"
            className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-[#FF7139]/40 via-white/10 to-[#FF7139]/40"
          />

          {/* THE SINGLE CONTINUOUSLY TRANSFORMING OBJECT */}
          <div
            ref={morphCardRef}
            className="relative w-full max-w-[660px] rounded-2xl bg-[#1B1B1B] border border-white/[0.12] p-7 shadow-2xl"
          >
            {/* Card Header (appears as voice settles into record) */}
            <div
              ref={cardHeaderRef}
              className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-white/[0.08]"
            >
              <div>
                <p className="text-xs text-[#929292]">Structured Order Record · ORD-1042</p>
                <p className="text-base font-display font-semibold text-[#F5F0E8] mt-0.5">
                  Sunita Sharma · Flat 4B
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#40C98A] inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Verified Structure
              </span>
            </div>

            {/* Persistent Glowing Orange Waveform — NEVER disappears, subtly integrates into the final card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#929292]">
                <span className="text-[#FF7139]">Acoustic Voice Spine · Hindi / Hinglish</span>
                <span>0:08</span>
              </div>

              <div
                ref={waveBandRef}
                className="flex items-center gap-[5px] h-20 origin-top"
                aria-hidden="true"
              >
                {WAVE_BARS.map((amp, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-[#FF7139] echo-wave-bar"
                    style={
                      {
                        height: `${amp}%`,
                        opacity: 0.45 + (amp / 100) * 0.55,
                        boxShadow: '0 0 14px rgba(255, 113, 57, 0.24)',
                        '--wave-dur': `${1.2 + (i % 5) * 0.2}s`,
                        '--wave-delay': `${(i % 6) * 0.1}s`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              <div ref={voiceCaptionRef} className="text-xs sm:text-sm text-[#F5F0E8]/85">
                &ldquo;Bhaiya, do kilo aata aur ek litre tel bhej dena. Mera udhaar mein likh
                dena.&rdquo;
              </div>
            </div>

            {/* Structured Data Rows unfolding directly out of the waveform */}
            <div
              ref={rowsContainerRef}
              className="mt-5 pt-5 border-t border-white/[0.08] space-y-2.5 origin-top"
            >
              <div className="morph-data-row flex items-center justify-between px-4 py-3 rounded-xl bg-[#101010] border border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-5 rounded-full bg-[#FF7139]/70" aria-hidden="true" />
                  <span className="font-display font-semibold tracking-wide text-[#F5F0E8]">
                    AATA
                  </span>
                  <span className="text-xs text-[#929292]">Wheat Flour</span>
                </div>
                <span className="font-mono tabular-nums text-sm font-semibold text-[#F5F0E8]">
                  2 KG
                </span>
              </div>

              <div className="morph-data-row flex items-center justify-between px-4 py-3 rounded-xl bg-[#101010] border border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-5 rounded-full bg-[#FF7139]/70" aria-hidden="true" />
                  <span className="font-display font-semibold tracking-wide text-[#F5F0E8]">
                    OIL
                  </span>
                  <span className="text-xs text-[#929292]">Cooking Oil</span>
                </div>
                <span className="font-mono tabular-nums text-sm font-semibold text-[#F5F0E8]">
                  1 LITRE
                </span>
              </div>

              <div className="morph-data-row flex items-center justify-between px-4 py-3 rounded-xl bg-[#101010] border border-[#FF7139]/30">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-5 rounded-full bg-[#FF7139]" aria-hidden="true" />
                  <span className="font-display font-semibold tracking-wide text-[#F5F0E8]">
                    PAYMENT
                  </span>
                  <span className="text-xs text-[#929292]">Customer Ledger</span>
                </div>
                <span className="font-mono tabular-nums text-sm font-semibold text-[#FF7139]">
                  UDHAAR
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div
              ref={cardFooterRef}
              className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#929292]"
            >
              <span>Ready for one-tap shopkeeper confirmation</span>
              <span className="font-mono tabular-nums text-[#F5F0E8]">Est. ₹261 · 95% conf.</span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Simplified Interactive Sequence (No mandatory scroll-pinning) */}
        <div className="lg:hidden space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAGES.map((stage) => (
              <button
                key={stage.index}
                type="button"
                onClick={() => setManualStage(stage.index)}
                className={`px-3 py-2.5 rounded-xl text-left text-xs font-medium border transition-colors ${
                  displayedStage === stage.index
                    ? 'bg-[#242424] border-[#FF7139]/50 text-[#F5F0E8]'
                    : 'bg-[#1B1B1B] border-white/[0.08] text-[#929292]'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#1B1B1B] border border-white/[0.1] p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#929292]">
              <span className="text-[#FF7139]">Voice Spine · Hindi / Hinglish</span>
              <span>0:08</span>
            </div>

            <div className="flex items-center gap-[4px] h-12" aria-hidden="true">
              {WAVE_BARS.slice(0, 20).map((amp, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-[#FF7139] echo-wave-bar"
                  style={
                    {
                      height: `${amp}%`,
                      opacity: displayedStage >= 2 ? 0.65 : 0.95,
                      '--wave-dur': `${1.2 + (i % 4) * 0.2}s`,
                      '--wave-delay': `${(i % 5) * 0.1}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <p className="text-xs text-[#F5F0E8]/90 leading-relaxed">
              &ldquo;Bhaiya, do kilo aata aur ek litre tel bhej dena. Mera udhaar mein likh
              dena.&rdquo;
            </p>

            {displayedStage >= 2 && (
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#101010] text-sm">
                  <span className="font-display font-semibold">AATA</span>
                  <span className="font-mono tabular-nums">2 KG</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#101010] text-sm">
                  <span className="font-display font-semibold">OIL</span>
                  <span className="font-mono tabular-nums">1 LITRE</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#101010] border border-[#FF7139]/30 text-sm">
                  <span className="font-display font-semibold">PAYMENT</span>
                  <span className="font-mono tabular-nums text-[#FF7139]">UDHAAR</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Stage Indicator Bar */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mt-8">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.index;
            const isPassed = activeStage >= stage.index;
            return (
              <div
                key={stage.index}
                className="pt-3 border-t transition-colors duration-200"
                style={{
                  borderColor: isPassed ? '#FF7139' : 'rgba(255,255,255,0.1)',
                }}
              >
                <p
                  className={`text-xs font-mono ${
                    isActive ? 'text-[#FF7139]' : isPassed ? 'text-[#F5F0E8]' : 'text-[#929292]'
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
