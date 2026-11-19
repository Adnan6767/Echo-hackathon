import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import type { ExtractedOrder, OrderItem, PaymentMode } from '../../types';
import { ConfidenceIndicator } from '../common/StatusLabel';
import { formatINR } from '../../utils/format';

interface StructuredOutputPanelProps {
  draft: ExtractedOrder | null;
  onChangeDraft: (next: ExtractedOrder) => void;
  onConfirmOrder: () => void;
  onRejectOrder: () => void;
  onRetry: () => void;
  confirmedOrderNumber: string | null;
  isSaving: boolean;
}

const UNITS = ['kg', 'g', 'litre', 'ml', 'packet', 'pack', 'bottle', 'piece', 'loaf'];

export function StructuredOutputPanel({
  draft,
  onChangeDraft,
  onConfirmOrder,
  onRejectOrder,
  onRetry,
  confirmedOrderNumber,
  isSaving,
}: StructuredOutputPanelProps) {
  if (!draft) {
    return (
      <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
            <div>
              <p className="text-xs font-mono text-[#FF7139]">Step 03</p>
              <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
                Structured Output
              </h2>
            </div>
            <span className="text-xs text-[#929292]">Awaiting Extraction</span>
          </div>

          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-medium text-[#F5F0E8]">No extracted record yet</p>
            <p className="text-xs text-[#929292] max-w-xs mx-auto leading-relaxed">
              Upload an audio file, record a voice note, or select a preloaded sample and click
              &ldquo;Convert voice to order&rdquo; to edit and confirm the structured order.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] text-xs text-[#929292]">
          Shopkeepers always review extracted fields before financial records are saved.
        </div>
      </div>
    );
  }

  const updateItem = (itemId: string, patch: Partial<OrderItem>) => {
    const nextItems = draft.items.map((it) =>
      it.id === itemId ? { ...it, ...patch } : it
    );
    onChangeDraft({ ...draft, items: nextItems });
  };

  const removeItem = (itemId: string) => {
    onChangeDraft({
      ...draft,
      items: draft.items.filter((it) => it.id !== itemId),
    });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productName: '',
      quantity: 1,
      unit: 'kg',
      unitPriceInr: null,
      confidence: 1,
    };
    onChangeDraft({
      ...draft,
      items: [...draft.items, newItem],
    });
  };

  const hasMissingCustomerName = !draft.customerName.trim();

  const hasMissingQty = draft.items.some(
    (it) => it.quantity === null || Number.isNaN(it.quantity) || it.quantity <= 0 || !it.productName.trim()
  );

  const hasMissingPrice = draft.items.some(
    (it) => it.unitPriceInr === null || Number.isNaN(it.unitPriceInr) || it.unitPriceInr < 0
  );

  const estimatedTotal = draft.items.reduce(
    (sum, it) =>
      sum +
      (it.quantity && it.quantity > 0 ? it.quantity : 0) *
        (it.unitPriceInr !== null && it.unitPriceInr >= 0 ? it.unitPriceInr : 0),
    0
  );

  return (
    <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
          <div>
            <p className="text-xs font-mono text-[#FF7139]">Step 03</p>
            <h2 className="font-display text-lg font-semibold text-[#F5F0E8] mt-0.5">
              Structured Output
            </h2>
          </div>
          <ConfidenceIndicator value={draft.overallConfidence} />
        </div>

        {/* Confirmed Banner */}
        {confirmedOrderNumber && (
          <div className="rounded-xl bg-[#40C98A]/10 border border-[#40C98A]/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#40C98A]">
                Saved as {confirmedOrderNumber} ({draft.source === 'demo' ? 'Demo Store' : 'Live DB'})
              </p>
              <p className="text-xs text-[#F5F0E8]/85 mt-0.5">
                Order added to dashboard{draft.paymentMode === 'udhaar' ? ' and customer udhaar ledger.' : '.'}
              </p>
            </div>
            <Link
              to="/dashboard/orders"
              className="text-xs font-medium text-[#40C98A] hover:underline whitespace-nowrap"
            >
              View in Orders →
            </Link>
          </div>
        )}

        {/* Warnings / Missing Information */}
        {(draft.warnings.length > 0 || hasMissingQty || hasMissingCustomerName || hasMissingPrice) && (
          <div className="rounded-xl bg-[#E8B75B]/10 border border-[#E8B75B]/35 p-3.5 space-y-1.5">
            <p className="text-xs font-semibold text-[#E8B75B] inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Needs Shopkeeper Review
            </p>
            {draft.warnings.map((w, idx) => (
              <p key={idx} className="text-xs text-[#F5F0E8]/90 leading-relaxed">
                · {w}
              </p>
            ))}
            {hasMissingCustomerName && (
              <p className="text-xs text-[#E8B75B]">
                · Enter the customer name manually before confirming.
              </p>
            )}
            {hasMissingQty && (
              <p className="text-xs text-[#E56D65]">
                · Fill in all product names and numeric quantities before confirming.
              </p>
            )}
            {hasMissingPrice && (
              <p className="text-xs text-[#E8B75B]">
                · Enter the material price for each item before confirming.
              </p>
            )}
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="demo-customer-name"
              className="block text-[11px] text-[#929292] mb-1"
            >
              Customer name
            </label>
            <input
              id="demo-customer-name"
              type="text"
              value={draft.customerName}
              placeholder="Enter customer name"
              onChange={(e) => onChangeDraft({ ...draft, customerName: e.target.value })}
              className={`w-full rounded-lg bg-[#101010] border px-3 py-2 text-sm text-[#F5F0E8] placeholder:text-[#929292]/60 focus:outline-none ${
                hasMissingCustomerName
                  ? 'border-[#E8B75B]/50 focus:border-[#FF7139]'
                  : 'border-white/[0.1] focus:border-[#FF7139]'
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="demo-customer-phone"
              className="block text-[11px] text-[#929292] mb-1"
            >
              Phone number (optional)
            </label>
            <input
              id="demo-customer-phone"
              type="tel"
              value={draft.customerPhone ?? ''}
              onChange={(e) => onChangeDraft({ ...draft, customerPhone: e.target.value })}
              placeholder="Optional phone number"
              className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-3 py-2 text-sm font-mono text-[#F5F0E8] placeholder:text-[#929292]/60 focus:border-[#FF7139] focus:outline-none"
            />
          </div>
        </div>

        {/* Editable Items List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#F5F0E8]">
              Extracted items ({draft.items.length})
            </span>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#FF7139] hover:text-[#ff824f] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add item
            </button>
          </div>

          <div className="space-y-2.5">
            {draft.items.map((item) => {
              const missing = item.quantity === null || item.quantity <= 0;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl bg-[#101010] border p-3 space-y-2.5 ${
                    missing || item.needsReview
                      ? 'border-[#E8B75B]/45'
                      : 'border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="Product name"
                      value={item.productName}
                      placeholder="Product name"
                      onChange={(e) => updateItem(item.id, { productName: e.target.value })}
                      className="flex-1 min-w-0 rounded-lg bg-[#1B1B1B] border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.productName || 'item'}`}
                      className="p-1.5 rounded-lg text-[#929292] hover:text-[#E56D65] hover:bg-[#1B1B1B] transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#929292] mb-1">Qty</label>
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={item.quantity ?? ''}
                        placeholder="?"
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateItem(item.id, {
                            quantity: raw === '' ? null : Number(raw),
                            needsReview: raw === '' || Number(raw) <= 0,
                          });
                        }}
                        className={`w-full rounded-lg bg-[#1B1B1B] border px-2.5 py-1.5 text-xs font-mono tabular-nums text-[#F5F0E8] focus:outline-none ${
                          missing
                            ? 'border-[#E56D65] focus:border-[#E56D65]'
                            : 'border-white/[0.08] focus:border-[#FF7139]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#929292] mb-1">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                        className="w-full rounded-lg bg-[#1B1B1B] border border-white/[0.08] px-2 py-1.5 text-xs text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u} className="bg-[#1B1B1B]">
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#929292] mb-1">Material price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPriceInr ?? ''}
                        placeholder="Enter price"
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateItem(item.id, {
                            unitPriceInr: raw === '' ? null : Math.max(0, Number(raw)),
                          });
                        }}
                        className={`w-full rounded-lg bg-[#1B1B1B] border px-2.5 py-1.5 text-xs font-mono tabular-nums text-[#F5F0E8] placeholder:text-[#929292]/60 focus:outline-none ${
                          item.unitPriceInr === null
                            ? 'border-[#E8B75B]/50 focus:border-[#FF7139]'
                            : 'border-white/[0.08] focus:border-[#FF7139]'
                        }`}
                      />
                    </div>
                  </div>

                  {item.note && (
                    <p className="text-[11px] text-[#E8B75B]">Note: {item.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Mode & Delivery Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="demo-payment-mode"
              className="block text-[11px] text-[#929292] mb-1"
            >
              Payment mode
            </label>
            <select
              id="demo-payment-mode"
              value={draft.paymentMode}
              onChange={(e) =>
                onChangeDraft({ ...draft, paymentMode: e.target.value as PaymentMode })
              }
              className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-3 py-2 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
            >
              <option value="udhaar" className="bg-[#1B1B1B]">
                Udhaar (Customer Credit)
              </option>
              <option value="upi" className="bg-[#1B1B1B]">
                UPI
              </option>
              <option value="cash" className="bg-[#1B1B1B]">
                Cash
              </option>
              <option value="pending" className="bg-[#1B1B1B]">
                Unconfirmed
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="demo-delivery-note"
              className="block text-[11px] text-[#929292] mb-1"
            >
              Delivery instructions
            </label>
            <input
              id="demo-delivery-note"
              type="text"
              value={draft.deliveryInstructions ?? ''}
              onChange={(e) =>
                onChangeDraft({ ...draft, deliveryInstructions: e.target.value })
              }
              placeholder="Optional delivery note"
              className="w-full rounded-lg bg-[#101010] border border-white/[0.1] px-3 py-2 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#101010] border border-white/[0.08]">
          <span className="text-xs text-[#929292]">Estimated Order Total</span>
          <span className="font-mono tabular-nums text-base font-semibold text-[#F5F0E8]">
            {formatINR(estimatedTotal)}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
        <button
          type="button"
          disabled={
            hasMissingCustomerName ||
            hasMissingQty ||
            hasMissingPrice ||
            draft.items.length === 0 ||
            isSaving ||
            Boolean(confirmedOrderNumber)
          }
          onClick={onConfirmOrder}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-[#40C98A] hover:bg-[#52d699] disabled:opacity-45 disabled:cursor-not-allowed text-[#101010] transition-colors"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>
            {confirmedOrderNumber
              ? `Confirmed (${confirmedOrderNumber})`
              : isSaving
              ? 'Saving record...'
              : 'Confirm & Save Order'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-white/[0.1] hover:border-white/[0.22] text-[#F5F0E8] bg-[#141414] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </button>
          <button
            type="button"
            onClick={onRejectOrder}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[#E56D65]/30 hover:bg-[#E56D65]/10 text-[#E56D65] transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
