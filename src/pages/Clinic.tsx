import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Clock, Stethoscope, User } from 'lucide-react';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { AudioPlayerCard } from '../components/audio/AudioPlayerCard';
import { ConfidenceIndicator } from '../components/common/StatusLabel';
import { CLINIC_SAMPLE_REQUESTS } from '../mocks/data';
import { createDemoVoiceNoteWavUrl } from '../utils/audio';
import { useToast } from '../hooks/useToast';
import type { ClinicAppointmentExtraction } from '../types';

export default function Clinic() {
  const { pushToast } = useToast();
  const [requests, setRequests] = useState<ClinicAppointmentExtraction[]>(CLINIC_SAMPLE_REQUESTS);
  const [selectedId, setSelectedId] = useState<string>(CLINIC_SAMPLE_REQUESTS[0].id);
  const [processing, setProcessing] = useState(false);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];

  const audioUrl = useMemo(
    () => createDemoVoiceNoteWavUrl(selected.durationSec, selected.id.charCodeAt(selected.id.length - 1)),
    [selected.id, selected.durationSec]
  );

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const updateSelected = (patch: Partial<ClinicAppointmentExtraction>) => {
    setRequests((prev) =>
      prev.map((item) => (item.id === selected.id ? { ...item, ...patch } : item))
    );
  };

  const handleSimulateSwitch = (id: string) => {
    setSelectedId(id);
    setProcessing(true);
    window.setTimeout(() => setProcessing(false), 380);
  };

  const handleConfirm = () => {
    updateSelected({ status: 'confirmed' });
    pushToast({
      variant: 'success',
      title: 'Prototype appointment marked confirmed',
      description: `${selected.patientName} with ${selected.doctor} on ${selected.requestedDate} at ${selected.requestedTime} (simulated local state).`,
    });
  };

  const handleReschedule = () => {
    updateSelected({ status: 'reschedule_requested' });
    pushToast({
      variant: 'warning',
      title: 'Marked for receptionist callback',
      description: 'Patient will be asked for an alternate time slot (prototype preview).',
    });
  };

  return (
    <MarketingLayout>
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#E8B75B] mb-2">
              Secondary Concept Prototype · Simulated Demo (No live EHR / Clinic Booking Integration)
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#F5F0E8] tracking-tight">
              Clinic Appointment Voice Intake
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#929292] max-w-2xl">
              Demonstrating how the same ECHO voice-to-structured-record engine adapts beyond
              kirana stores to convert patient voice requests into receptionist-ready appointment
              previews.
            </p>
          </div>

          <Link
            to="/demo"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FF7139] hover:underline whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Kirana Demo</span>
          </Link>
        </div>

        {/* Sample Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {requests.map((req) => {
            const active = req.id === selected.id;
            return (
              <button
                key={req.id}
                type="button"
                onClick={() => handleSimulateSwitch(req.id)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  active
                    ? 'bg-[#242424] border-[#FF7139]/55'
                    : 'bg-[#1B1B1B] border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#F5F0E8]">{req.patientName}</span>
                  <span
                    className={
                      req.status === 'confirmed'
                        ? 'text-[#40C98A]'
                        : req.status === 'reschedule_requested'
                        ? 'text-[#E8B75B]'
                        : 'text-[#929292]'
                    }
                  >
                    {req.status === 'confirmed'
                      ? 'Confirmed'
                      : req.status === 'reschedule_requested'
                      ? 'Callback'
                      : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[#929292] mt-1">
                  {req.doctor} · {req.requestedDate} · {req.requestedTime}
                </p>
              </button>
            );
          })}
        </div>

        {/* 2-Column Flow: Voice + Transcript -> Structured Appointment Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 space-y-5">
            <div className="pb-4 border-b border-white/[0.08]">
              <p className="text-xs font-mono text-[#FF7139]">01 · Patient Voice Request</p>
              <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
                Audio &amp; Transcription
              </h2>
            </div>

            <AudioPlayerCard
              src={audioUrl}
              fileName={selected.audioLabel}
              durationSec={selected.durationSec}
              languageLabel={selected.language}
            />

            <div className="rounded-xl bg-[#101010] border border-white/[0.08] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F5F0E8]">Transcribed Speech</span>
                <ConfidenceIndicator value={selected.confidence} />
              </div>
              <p className="text-sm text-[#F5F0E8]/90 leading-relaxed">
                &ldquo;{selected.transcription}&rdquo;
              </p>
            </div>

            <p className="text-xs text-[#929292] leading-relaxed">
              Prototype disclaimer: Transcripts and extracted slots shown here are simulated locally
              to illustrate future healthcare intake capability.
            </p>
          </div>

          <div className="lg:col-span-7 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <p className="text-xs font-mono text-[#FF7139]">
                    02 · Appointment Extraction &amp; Confirmation Preview
                  </p>
                  <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
                    Arogya Care Clinic — Reception Draft
                  </h2>
                </div>
                <span
                  className={`text-xs font-medium ${
                    selected.status === 'confirmed'
                      ? 'text-[#40C98A]'
                      : selected.status === 'reschedule_requested'
                      ? 'text-[#E8B75B]'
                      : 'text-[#F5F0E8]'
                  }`}
                >
                  {selected.status === 'confirmed'
                    ? 'Confirmed'
                    : selected.status === 'reschedule_requested'
                    ? 'Reschedule requested'
                    : 'Awaiting confirmation'}
                </span>
              </div>

              {processing ? (
                <div className="py-12 text-center text-sm text-[#929292]">
                  Extracting appointment fields...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#929292] flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
                      Patient name
                    </label>
                    <input
                      type="text"
                      value={selected.patientName}
                      onChange={(e) => updateSelected({ patientName: e.target.value })}
                      className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#929292] flex items-center gap-1.5 mb-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
                      Doctor
                    </label>
                    <input
                      type="text"
                      value={selected.doctor}
                      onChange={(e) => updateSelected({ doctor: e.target.value })}
                      className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#929292] flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
                      Requested date
                    </label>
                    <input
                      type="date"
                      value={selected.requestedDate}
                      onChange={(e) => updateSelected({ requestedDate: e.target.value })}
                      className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm font-mono text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#929292] flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF7139]" aria-hidden="true" />
                      Requested time
                    </label>
                    <input
                      type="time"
                      value={selected.requestedTime}
                      onChange={(e) => updateSelected({ requestedTime: e.target.value })}
                      className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm font-mono text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[#929292] mb-1.5">
                      Visit reason / notes ({selected.department})
                    </label>
                    <input
                      type="text"
                      value={selected.symptomsNote}
                      onChange={(e) => updateSelected({ symptomsNote: e.target.value })}
                      className="w-full rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#40C98A] hover:bg-[#52d699] text-[#101010] transition-colors"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                Confirm appointment slot
              </button>
              <button
                type="button"
                onClick={handleReschedule}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-white/[0.12] hover:border-white/[0.24] text-[#F5F0E8] bg-[#242424] transition-colors"
              >
                Request alternate slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
