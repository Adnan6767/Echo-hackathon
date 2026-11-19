import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, Play } from 'lucide-react';
import { WaveformVisualizer } from '../audio/WaveformVisualizer';

gsap.registerPlugin(ScrollTrigger);

const INCOMING_VOICE_NOTES = [
  {
    id: 'vn-1',
    sender: 'Sunita Sharma · Flat 4B',
    time: '11:18 AM',
    duration: '0:08',
    transcript: '"Bhaiya, do kilo aata aur ek litre tel bhej dena. Mera udhaar mein likh dena."',
  },
  {
    id: 'vn-2',
    sender: 'Mahesh Gupta · Sector 14',
    time: '11:19 AM',
    duration: '0:14',
    transcript: '"Hello, thoda cheeni aur chai patti... nahi ruko 2 kilo nahi 3 kilo chawal bhi..."',
  },
  {
    id: 'vn-3',
    sender: 'Farida Begum · Noor Villa',
    time: '11:20 AM',
    duration: '0:09',
    transcript: '"Pichle hafte maine ₹500 de diye the, copy mein abhi tak purana balance kyun hai?"',
  },
];

const NOTEBOOK_LINES = [
  {
    id: 'nb-1',
    text: 'Sunita 4B — 2kg aata, oil (1L? 2L?)',
    flag: 'Replayed 3 times',
    unclear: true,
  },
  {
    id: 'nb-2',
    text: 'Mahesh — cheeni ??? + chawal 2kg  3kg',
    flag: 'Missed quantity',
    unclear: true,
  },
  {
    id: 'nb-3',
    text: 'Farida ji — ₹500 cash or UPI? Check Oct page...',
    flag: 'Udhaar dispute',
    unclear: true,
  },
  {
    id: 'nb-4',
    text: 'Rajesh — dal, namak (packed? pending?)',
    flag: 'No status tracking',
    unclear: false,
  },
];

const FIVE_PROBLEMS = [
  { num: '01', title: 'Replaying voice notes', detail: 'Scrubbing through 10+ audio clips during peak rush hour.' },
  { num: '02', title: 'Missed or incorrect orders', detail: 'Half-heard quantities lead to wrong items and returns.' },
  { num: '03', title: 'No order tracking', detail: 'Chats bury what is packed, dispatched, or still waiting.' },
  { num: '04', title: 'No searchable history', detail: 'You cannot search inside an audio file three weeks later.' },
  { num: '05', title: 'Udhaar disputes', detail: 'Unrecorded credit adjustments erode neighborhood trust.' },
];

export function SceneProblem() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.problem-voice-item', {
        opacity: 0,
        y: 26,
        stagger: 0.16,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.problem-split',
          start: 'top 76%',
          once: true,
        },
      });

      gsap.from('.problem-notebook-line', {
        opacity: 0,
        x: 20,
        stagger: 0.15,
        duration: 0.65,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.problem-split',
          start: 'top 74%',
          once: true,
        },
      });

      gsap.from('.problem-point', {
        opacity: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.problem-points-grid',
          start: 'top 82%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="the-problem"
      ref={sectionRef}
      className="py-24 sm:py-32 border-b border-white/[0.08]"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-mono text-[#929292] mb-3">02 / 07 · The Problem</p>
            <h2
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.08] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.35rem)' }}
            >
              An eight-second voice note.
              <br />
              <span className="text-[#929292]">A ten-minute problem.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#929292] max-w-md leading-relaxed">
            Customers speak naturally on WhatsApp. Shopkeepers still copy every item by hand into
            paper notebooks between serving walk-in customers.
          </p>
        </div>

        {/* Split-Screen Experience */}
        <div className="problem-split grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-16">
          {/* Left: Simulated WhatsApp-style Voice Notes */}
          <div className="lg:col-span-6 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F0E8]">
                    Incoming Customer Chats
                  </h3>
                  <p className="text-xs text-[#929292] mt-0.5">
                    3 unread voice notes in 2 minutes · Morning rush
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-[#FF7139]">31s audio</span>
              </div>

              <div className="space-y-4">
                {INCOMING_VOICE_NOTES.map((note) => (
                  <div
                    key={note.id}
                    className="problem-voice-item bg-[#141414] border border-white/[0.07] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
                      <span className="font-medium text-[#F5F0E8]">{note.sender}</span>
                      <span className="font-mono tabular-nums text-[#929292]">{note.time}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#242424] text-[#FF7139] flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
                      </span>
                      <WaveformVisualizer bars={26} heightClass="h-6 flex-1" />
                      <span className="text-xs font-mono tabular-nums text-[#929292]">
                        {note.duration}
                      </span>
                    </div>

                    <p className="text-xs text-[#929292] leading-relaxed">{note.transcript}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Shopkeeper's Handwritten Notebook */}
          <div className="lg:col-span-6 bg-[#181715] border border-white/[0.08] rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle ruled notebook lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent, transparent 43px, #F5F0E8 44px)',
              }}
            />

            <div className="relative">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.1]">
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F0E8]">
                    Shopkeeper&apos;s Paper Register
                  </h3>
                  <p className="text-xs text-[#929292] mt-0.5">
                    Manual transcription · Page 42 (Nov 18)
                  </p>
                </div>
                <span className="text-xs text-[#E8B75B] font-medium">3 unclear entries</span>
              </div>

              <div className="space-y-4">
                {NOTEBOOK_LINES.map((line) => (
                  <div
                    key={line.id}
                    className="problem-notebook-line py-3.5 px-4 rounded-xl bg-[#101010]/75 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <p className="text-sm text-[#F5F0E8]/90 font-mono">{line.text}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                        line.unclear ? 'text-[#E56D65]' : 'text-[#E8B75B]'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{line.flag}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#929292]">
              <span>Estimated manual time per busy hour</span>
              <span className="font-mono tabular-nums text-[#E56D65]">~42 min lost</span>
            </div>
          </div>
        </div>

        {/* Five Problems Grid */}
        <div className="problem-points-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 py-10 border-y border-white/[0.08]">
          {FIVE_PROBLEMS.map((item) => (
            <div key={item.num} className="problem-point space-y-2">
              <span className="text-xs font-mono tabular-nums text-[#FF7139]">{item.num}</span>
              <h3 className="text-sm font-semibold text-[#F5F0E8]">{item.title}</h3>
              <p className="text-xs text-[#929292] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Closing Statement */}
        <div className="mt-14 max-w-3xl">
          <p className="font-display text-2xl sm:text-3xl font-medium text-[#F5F0E8] leading-snug text-balance">
            The problem isn&apos;t communication.
            <br />
            <span className="text-[#FF7139]">It&apos;s what happens after communication.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
