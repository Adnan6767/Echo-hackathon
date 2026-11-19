import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, Pause, Play, Volume2 } from 'lucide-react';
import { WaveformVisualizer } from '../audio/WaveformVisualizer';
import { createDemoVoiceNoteWavUrl } from '../../utils/audio';

const HERO_POSTER_URL = '/src/assets/images/echo_hero_poster_1795074880463.jpg';

export function SceneHero() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const demoAudioUrl = useMemo(() => createDemoVoiceNoteWavUrl(8, 1), []);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(demoAudioUrl);
    };
  }, [demoAudioUrl]);

  const toggleSamplePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlayingSample) {
      el.pause();
      setIsPlayingSample(false);
    } else {
      el.play()
        .then(() => setIsPlayingSample(true))
        .catch(() => setIsPlayingSample(false));
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
      <audio
        ref={audioRef}
        src={demoAudioUrl}
        onTimeUpdate={(e) => {
          const d = e.currentTarget.duration || 8;
          setAudioProgress(e.currentTarget.currentTime / d);
        }}
        onEnded={() => {
          setIsPlayingSample(false);
          setAudioProgress(0);
        }}
      />

      {/* Subtle warm radial depth — no neon or purple */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(255,113,57,0.09),transparent_58%)]"
      />

      <div className="relative max-w-[1360px] w-full mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Statement */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs sm:text-sm font-medium text-[#929292] tracking-wide">
              ECHO · From Voice to Action
            </p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.05] text-balance"
              style={{ fontSize: 'clamp(2.5rem, 4.7vw, 4.35rem)' }}
            >
              India doesn&apos;t need to type.
              <br />
              <span className="text-[#FF7139]">It needs to be heard.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-[#929292] max-w-xl leading-relaxed"
            >
              Turning everyday voice notes into structured, actionable business records. Built for
              Indian kirana stores managing daily orders and customer udhaar on WhatsApp.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/demo"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap"
              >
                <span>Try Live Demo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium rounded-xl border border-white/[0.14] hover:border-white/[0.28] text-[#F5F0E8] bg-[#1B1B1B] transition-colors whitespace-nowrap"
              >
                <span>Open Dashboard</span>
              </Link>
            </motion.div>

            {/* Unboxed Clean Metadata */}
            <div className="pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#929292]">
              <span>Hindi &amp; Hinglish voice intake</span>
              <span aria-hidden="true">·</span>
              <span>Structured order cards</span>
              <span aria-hidden="true">·</span>
              <span>Auditable udhaar ledger</span>
            </div>
          </div>

          {/* Right 16:9 Cinema Hero Visual + Floating Voice-Note Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#161616] aspect-[16/10] sm:aspect-[16/10] shadow-2xl">
              {/* Provided 10-second video with graceful fallback to editorial poster & animated waveform */}
              {!videoFailed ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={HERO_POSTER_URL}
                  onError={() => setVideoFailed(true)}
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/echo-transformation.mp4" type="video/mp4" />
                </video>
              ) : !posterFailed ? (
                <img
                  src={HERO_POSTER_URL}
                  alt="Indian neighborhood kirana store counter illuminated in warm dusk light"
                  referrerPolicy="no-referrer"
                  onError={() => setPosterFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,113,57,0.18),#141414_70%)] flex items-center justify-center p-10">
                  <WaveformVisualizer bars={36} active heightClass="h-24 w-full" />
                </div>
              )}

              {/* Measured Scrim for 4.5:1 text legibility */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#101010]/95 via-[#101010]/45 to-[#101010]/20"
              />

              {/* Top Overlay Metadata */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#F5F0E8]/90 font-medium">
                  Hindi / Hinglish · Voice Intake
                </span>
                <span className="font-mono tabular-nums text-[#F5F0E8]/80">0:08</span>
              </div>

              {/* Floating Voice-Note Interface + Output Preview */}
              <div className="absolute bottom-4 left-4 right-4 space-y-3">
                <div className="bg-[#1B1B1B]/95 border border-white/[0.12] rounded-xl p-3.5 sm:p-4">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={toggleSamplePlay}
                      aria-label={isPlayingSample ? 'Pause sample voice waveform' : 'Play sample voice waveform'}
                      className="w-10 h-10 rounded-full bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] flex items-center justify-center transition-colors shrink-0"
                    >
                      {isPlayingSample ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-medium text-[#F5F0E8] flex items-center gap-1.5 truncate">
                          <Volume2 className="w-3.5 h-3.5 text-[#FF7139] shrink-0" aria-hidden="true" />
                          <span>Customer Voice Note</span>
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-[#929292] shrink-0">
                          0:08 · Hindi / Hinglish
                        </span>
                      </div>

                      <WaveformVisualizer
                        bars={32}
                        active
                        progress={isPlayingSample ? audioProgress : 0}
                        heightClass="h-8"
                      />
                    </div>
                  </div>

                  <p className="mt-3 pt-2.5 border-t border-white/[0.07] text-xs sm:text-sm text-[#F5F0E8]/90 leading-relaxed">
                    &ldquo;Bhaiya, do kilo aata aur ek litre tel bhej dena. Mera udhaar mein likh
                    dena.&rdquo;
                  </p>
                </div>

                {/* Compact Output Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono tabular-nums">
                  <span className="text-[#F5F0E8]">
                    AATA 2 KG <span className="text-[#929292] mx-1.5">·</span> OIL 1 LITRE
                  </span>
                  <span className="text-[#FF7139] font-medium">PAYMENT: UDHAAR</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="relative max-w-[1360px] w-full mx-auto px-5 sm:px-8 pb-6 flex items-center justify-between text-xs text-[#929292]">
        <a
          href="#the-problem"
          className="inline-flex items-center gap-2 hover:text-[#F5F0E8] transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
          <span>Scroll to see how an 8-second voice note becomes a record</span>
        </a>
        <span className="hidden sm:inline font-mono tabular-nums">01 / 07</span>
      </div>
    </section>
  );
}
