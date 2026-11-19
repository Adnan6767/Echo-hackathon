import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, CheckCircle2, X } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { ConfidenceIndicator } from '../components/common/StatusLabel';
import { useEchoDashboardData } from '../hooks/useEchoData';
import { resolveReviewItem } from '../api/orders.api';
import { formatApiError } from '../api/client';
import { formatDateTime, formatDuration, formatINR } from '../utils/format';
import { useToast } from '../hooks/useToast';
import type { OrderItem, PaymentMode, ReviewItem } from '../types';

export default function ReviewQueue() {
  const { reviewQueue } = useEchoDashboardData();
  const { pushToast } = useToast();

  // Keep local editable copies keyed by review ID
  const [drafts, setDrafts] = useState<Record<string, ReviewItem>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      reviewQueue.forEach((item) => {
        if (!next[item.id]) {
          next[item.id] = {
            ...item,
            customerName: '',
            customerPhone: '',
            extractedItems: item.extractedItems.map((i) => ({
              ...i,
              unitPriceInr: null,
            })),
          };
        }
      });
      return next;
    });
  }, [reviewQueue]);

  const updateDraft = (id: string, patch: Partial<ReviewItem>) => {
    setDrafts((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const updateItem = (reviewId: string, itemId: string, patch: Partial<OrderItem>) => {
    setDrafts((prev) => {
      const current = prev[reviewId];
      if (!current) return prev;
      return {
        ...prev,
        [reviewId]: {
          ...current,
          extractedItems: current.extractedItems.map((it) =>
            it.id === itemId ? { ...it, ...patch } : it
          ),
        },
      };
    });
  };

  const handleConfirm = async (reviewId: string) => {
    const edited = drafts[reviewId];
    if (!edited) return;

    const hasMissingCustomer = !edited.customerName.trim();
    const hasInvalid = edited.extractedItems.some(
      (i) =>
        i.quantity === null ||
        i.quantity <= 0 ||
        i.unitPriceInr === null ||
        i.unitPriceInr < 0 ||
        !i.productName.trim()
    );
    if (hasMissingCustomer || hasInvalid || edited.paymentMode === 'pending') {
      pushToast({
        variant: 'warning',
        title: 'Complete missing fields first',
        description:
          'Enter the customer name, numeric quantity, material price, and payment mode before saving.',
      });
      return;
    }

    setBusyId(reviewId);
    try {
      const created = await resolveReviewItem(reviewId, 'confirm', {
        customerName: edited.customerName.trim(),
        customerPhone: edited.customerPhone?.trim() || '',
        items: edited.extractedItems,
        paymentMode: edited.paymentMode,
        deliveryInstructions: edited.deliveryInstructions,
      });

      pushToast({
        variant: 'success',
        title: created ? `Confirmed as ${created.orderNumber}` : 'Order confirmed',
        description: `${edited.customerName.trim()}'s reviewed voice order has been added to Orders.`,
      });
    } catch (err) {
      pushToast({
        variant: 'error',
        title: 'Could not confirm review item',
        description: formatApiError(err),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reviewId: string, customerName: string) => {
    setBusyId(reviewId);
    try {
      await resolveReviewItem(reviewId, 'reject');
      pushToast({
        variant: 'info',
        title: 'Voice extraction rejected',
        description: `Removed ${customerName}'s unclear audio from the queue without creating a ledger entry.`,
      });
    } catch (err) {
      pushToast({
        variant: 'error',
        title: 'Could not reject item',
        description: formatApiError(err),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout
      title="Review Queue"
      subtitle="Low-confidence or incomplete voice notes requiring explicit shopkeeper confirmation"
    >
      <div className="space-y-6">
        <ModeBanner compact />

        <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl px-5 py-3.5 text-xs text-[#929292] flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#E8B75B] shrink-0" aria-hidden="true" />
          <span>
            Financial safety rule: ECHO never auto-confirms uncertain quantities, missing pack
            sizes, or ambiguous payment terms. Review and fix highlighted fields below.
          </span>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl py-16 px-6 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#40C98A] mx-auto" aria-hidden="true" />
            <h2 className="font-display text-lg font-semibold text-[#F5F0E8]">
              Review queue is clear
            </h2>
            <p className="text-sm text-[#929292] max-w-md mx-auto">
              Every flagged voice note has been verified or dismissed. Try uploading a noisy voice
              note in the live demo to see how ECHO flags uncertainty.
            </p>
            <div className="pt-2">
              <Link
                to="/demo"
                className="inline-flex items-center px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#FF7139] text-[#101010]"
              >
                Open Voice Demo
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reviewQueue.map((item) => {
              const draft = drafts[item.id] ?? {
                ...item,
                customerName: '',
                customerPhone: '',
                extractedItems: item.extractedItems.map((i) => ({ ...i, unitPriceInr: null })),
              };
              const missingCustomer = !draft.customerName.trim();
              const missingQty = draft.extractedItems.some(
                (i) => i.quantity === null || i.quantity <= 0
              );
              const missingPrice = draft.extractedItems.some(
                (i) => i.unitPriceInr === null || i.unitPriceInr < 0
              );
              const missingPayment = draft.paymentMode === 'pending';
              const estTotal = draft.extractedItems.reduce(
                (sum, i) =>
                  sum +
                  (i.quantity && i.quantity > 0 ? i.quantity : 0) * (i.unitPriceInr ?? 0),
                0
              );

              return (
                <article
                  key={item.id}
                  className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#929292]">
                        <span className="font-mono">{item.audioFileName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatDuration(item.audioDurationSec)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.language}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDateTime(item.receivedAt)}</span>
                      </div>
                      <p className="text-sm text-[#E8B75B] font-medium mt-1.5">
                        {item.reasonSummary}
                      </p>
                    </div>
                    <ConfidenceIndicator value={item.overallConfidence} />
                  </div>

                  {/* Original Transcription */}
                  <div className="rounded-xl bg-[#101010] border border-white/[0.08] p-4 space-y-1.5">
                    <p className="text-[11px] text-[#929292]">Original Transcription</p>
                    <p className="text-sm text-[#F5F0E8] leading-relaxed">
                      &ldquo;{item.transcription}&rdquo;
                    </p>
                    <p className="text-[11px] text-[#E8B75B] pt-1">
                      Fields needing review: {item.fieldsNeedingReview.join(' · ')}
                    </p>
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#929292] mb-1">
                        Customer name
                      </label>
                      <input
                        type="text"
                        value={draft.customerName}
                        placeholder="Enter customer name"
                        onChange={(e) =>
                          updateDraft(item.id, { customerName: e.target.value })
                        }
                        className={`w-full rounded-lg bg-[#101010] border px-3 py-2 text-xs text-[#F5F0E8] placeholder:text-[#929292]/60 focus:outline-none ${
                          missingCustomer
                            ? 'border-[#E8B75B]/50 focus:border-[#FF7139]'
                            : 'border-white/[0.1] focus:border-[#FF7139]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#929292] mb-1">
                        Phone number (optional)
                      </label>
                      <input
                        type="tel"
                        value={draft.customerPhone ?? ''}
                        placeholder="Optional phone number"
                        onChange={(e) =>
                          updateDraft(item.id, { customerPhone: e.target.value })
                        }
                        className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-3 py-2 text-xs font-mono text-[#F5F0E8] placeholder:text-[#929292]/60 focus:border-[#FF7139] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#929292] mb-1">
                        Payment mode {missingPayment && <span className="text-[#E56D65]">(Required)</span>}
                      </label>
                      <select
                        value={draft.paymentMode}
                        onChange={(e) =>
                          updateDraft(item.id, {
                            paymentMode: e.target.value as PaymentMode,
                          })
                        }
                        className={`w-full rounded-lg bg-[#101010] border px-3 py-2 text-xs text-[#F5F0E8] focus:outline-none ${
                          missingPayment
                            ? 'border-[#E56D65] focus:border-[#E56D65]'
                            : 'border-white/[0.1] focus:border-[#FF7139]'
                        }`}
                      >
                        <option value="pending" className="bg-[#1B1B1B]">
                          Select payment mode...
                        </option>
                        <option value="udhaar" className="bg-[#1B1B1B]">
                          Udhaar (Credit)
                        </option>
                        <option value="upi" className="bg-[#1B1B1B]">
                          UPI
                        </option>
                        <option value="cash" className="bg-[#1B1B1B]">
                          Cash
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Editable Extracted Items */}
                  <div className="space-y-2.5">
                    {draft.extractedItems.map((it) => {
                      const isMissing = it.quantity === null || it.quantity <= 0;
                      return (
                        <div
                          key={it.id}
                          className={`rounded-xl bg-[#141414] border p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center ${
                            isMissing || it.needsReview
                              ? 'border-[#E8B75B]/45'
                              : 'border-white/[0.07]'
                          }`}
                        >
                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              value={it.productName}
                              onChange={(e) =>
                                updateItem(item.id, it.id, { productName: e.target.value })
                              }
                              className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-2.5 py-1.5 text-xs text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                            />
                            {it.note && (
                              <p className="text-[11px] text-[#E8B75B] mt-1">{it.note}</p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min={0}
                              step="0.5"
                              placeholder="Qty?"
                              value={it.quantity ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateItem(item.id, it.id, {
                                  quantity: v === '' ? null : Number(v),
                                  needsReview: v === '' || Number(v) <= 0,
                                });
                              }}
                              className={`w-full rounded-lg bg-[#101010] border px-2.5 py-1.5 text-xs font-mono tabular-nums text-[#F5F0E8] focus:outline-none ${
                                isMissing
                                  ? 'border-[#E56D65]'
                                  : 'border-white/[0.1] focus:border-[#FF7139]'
                              }`}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={it.unit}
                              onChange={(e) =>
                                updateItem(item.id, it.id, { unit: e.target.value })
                              }
                              className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-2.5 py-1.5 text-xs text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min={0}
                              placeholder="Price ₹"
                              aria-label="Material price (INR)"
                              value={it.unitPriceInr ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateItem(item.id, it.id, {
                                  unitPriceInr: v === '' ? null : Math.max(0, Number(v)),
                                });
                              }}
                              className={`w-full rounded-lg bg-[#101010] border px-2.5 py-1.5 text-xs font-mono tabular-nums text-[#F5F0E8] placeholder:text-[#929292]/60 focus:outline-none ${
                                it.unitPriceInr === null
                                  ? 'border-[#E8B75B]/50 focus:border-[#FF7139]'
                                  : 'border-white/[0.1] focus:border-[#FF7139]'
                              }`}
                            />
                          </div>
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                            <ConfidenceIndicator value={it.confidence} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-[#929292]">
                      Estimated total:{' '}
                      <span className="font-mono tabular-nums text-[#F5F0E8] font-semibold">
                        {formatINR(estTotal)}
                      </span>
                      {(missingCustomer || missingQty || missingPrice || missingPayment) && (
                        <span className="text-[#E56D65] ml-2">
                          · Enter customer name, quantity, material price &amp; payment mode to confirm
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleReject(item.id, draft.customerName || item.customerName)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl border border-[#E56D65]/35 text-[#E56D65] hover:bg-[#E56D65]/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={
                          busyId === item.id ||
                          missingCustomer ||
                          missingQty ||
                          missingPrice ||
                          missingPayment
                        }
                        onClick={() => handleConfirm(item.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#40C98A] hover:bg-[#52d699] disabled:opacity-45 disabled:cursor-not-allowed text-[#101010] transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Confirm &amp; Create Order
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
