import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope, Store } from 'lucide-react';

const KIRANA_IMG = '/src/assets/images/echo_kirana_editorial_1795074878519.jpg';
const CLINIC_IMG = '/src/assets/images/echo_clinic_editorial_1795074879435.jpg';

export function SceneBeyondKirana() {
  const [kiranaImgErr, setKiranaImgErr] = useState(false);
  const [clinicImgErr, setClinicImgErr] = useState(false);

  return (
    <section id="solutions" className="py-24 sm:py-32 border-b border-white/[0.08]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-mono text-[#929292] mb-3">06 / 07 · Beyond Kirana</p>
            <h2
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.08] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.35rem)' }}
            >
              One voice-first engine.
              <br />
              <span className="text-[#929292]">More everyday workflows.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#929292] max-w-md leading-relaxed">
            Kirana stores are our primary workflow. The same voice-to-structured-record pipeline
            extends naturally to local appointment scheduling — shown below as a secondary concept.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Primary Use Case: Kirana */}
          <div className="lg:col-span-7 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
            <div className="aspect-[16/9] bg-[#141414] relative overflow-hidden">
              {!kiranaImgErr ? (
                <img
                  src={KIRANA_IMG}
                  alt="Indian kirana store counter with wheat flour sacks and spice jars"
                  referrerPolicy="no-referrer"
                  onError={() => setKiranaImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#929292]">
                  <Store className="w-10 h-10" />
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/25 to-transparent"
              />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-medium text-[#FF7139]">Primary Use Case · Full Workflow</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#F5F0E8]">
                  Kirana &amp; Neighborhood Retail
                </h3>
                <p className="mt-2.5 text-sm text-[#929292] leading-relaxed">
                  Hindi and Hinglish voice orders become verified item lists, order statuses, and
                  immutable customer udhaar ledger entries — with a dedicated confirmation queue for
                  unclear recordings.
                </p>

                <div className="mt-5 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#929292] block">Spoken input</span>
                    <span className="text-[#F5F0E8] font-medium mt-0.5 block">
                      &ldquo;Do kilo aata, ek litre tel, udhaar&rdquo;
                    </span>
                  </div>
                  <div>
                    <span className="text-[#929292] block">Structured record</span>
                    <span className="text-[#40C98A] font-medium mt-0.5 block">
                      Order + Customer Ledger Entry
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap"
                >
                  <span>Try kirana voice demo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-[#F5F0E8] hover:text-[#FF7139] transition-colors"
                >
                  Open kirana dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Use Case: Clinic Prototype */}
          <div className="lg:col-span-5 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
            <div className="aspect-[16/9] bg-[#141414] relative overflow-hidden">
              {!clinicImgErr ? (
                <img
                  src={CLINIC_IMG}
                  alt="Modern neighborhood clinic reception desk in India during evening hours"
                  referrerPolicy="no-referrer"
                  onError={() => setClinicImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#929292]">
                  <Stethoscope className="w-10 h-10" />
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/25 to-transparent"
              />
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-medium text-[#E8B75B]">
                  Secondary Prototype · Concept Demo
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#F5F0E8]">
                  Neighborhood Clinics
                </h3>
                <p className="mt-2.5 text-sm text-[#929292] leading-relaxed">
                  A patient sends a quick voice note requesting a doctor visit. ECHO extracts
                  patient name, doctor, date, and preferred slot into a receptionist confirmation
                  preview.
                </p>
                <p className="mt-3 text-xs text-[#929292] leading-relaxed">
                  Note: Demonstrated as a simulated secondary prototype without live clinic EHR
                  booking integration.
                </p>
              </div>

              <div>
                <Link
                  to="/clinic"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-white/[0.14] hover:border-white/[0.28] text-[#F5F0E8] bg-[#242424] transition-colors whitespace-nowrap"
                >
                  <span>View clinic prototype</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
