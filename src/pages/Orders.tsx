import { useEffect, useMemo, useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { Modal } from '../components/common/Modal';
import {
  ConfidenceIndicator,
  OrderStatusLabel,
  PaymentModeLabel,
} from '../components/common/StatusLabel';
import { AudioPlayerCard } from '../components/audio/AudioPlayerCard';
import { useEchoDashboardData } from '../hooks/useEchoData';
import { patchOrderStatus } from '../api/orders.api';
import { formatApiError } from '../api/client';
import { createDemoVoiceNoteWavUrl } from '../utils/audio';
import { formatDateTime, formatINR, formatShortDate } from '../utils/format';
import { useToast } from '../hooks/useToast';
import type { OrderRecord, OrderStatus } from '../types';

const STATUS_OPTIONS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'needs_confirmation', label: 'Needs confirmation' },
  { value: 'packed', label: 'Packed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const NEXT_STATUS_LIST: OrderStatus[] = [
  'received',
  'needs_confirmation',
  'packed',
  'delivered',
  'cancelled',
];

export default function Orders() {
  const { orders, loading } = useEchoDashboardData();
  const { pushToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    order: OrderRecord;
    nextStatus: OrderStatus;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const drawerAudioUrl = useMemo(() => {
    if (!selectedOrder) return null;
    return createDemoVoiceNoteWavUrl(
      selectedOrder.audioDurationSec || 8,
      selectedOrder.orderNumber.charCodeAt(selectedOrder.orderNumber.length - 1)
    );
  }, [selectedOrder]);

  useEffect(() => {
    return () => {
      if (drawerAudioUrl) URL.revokeObjectURL(drawerAudioUrl);
    };
  }, [drawerAudioUrl]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((ord) => {
      if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
      if (dateFilter === 'today') {
        const isToday = ord.createdAt.startsWith('2026-11-18') ||
          new Date(ord.createdAt).toDateString() === new Date().toDateString();
        if (!isToday) return false;
      }
      if (q) {
        const inId = ord.orderNumber.toLowerCase().includes(q);
        const inCust = ord.customerName.toLowerCase().includes(q);
        const inItems = ord.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!inId && !inCust && !inItems) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const confirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setUpdatingStatus(true);
    try {
      await patchOrderStatus(pendingStatusChange.order.id, pendingStatusChange.nextStatus);
      pushToast({
        variant: 'success',
        title: `Order ${pendingStatusChange.order.orderNumber} updated`,
        description: `Status changed to ${pendingStatusChange.nextStatus.replace('_', ' ')}.`,
      });
      setPendingStatusChange(null);
    } catch (err) {
      pushToast({
        variant: 'error',
        title: 'Status update failed',
        description: formatApiError(err),
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardLayout
      title="Orders"
      subtitle="Search, filter, inspect original voice transcripts, and update order statuses"
    >
      <div className="space-y-6">
        <ModeBanner compact />

        {/* Filters Bar */}
        <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#929292] absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, customer, or product..."
                aria-label="Search orders"
                className="w-full rounded-xl bg-[#101010] border border-white/[0.1] pl-10 pr-4 py-2.5 text-sm text-[#F5F0E8] placeholder:text-[#929292] focus:border-[#FF7139] focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | '7d')}
              className="rounded-xl bg-[#101010] border border-white/[0.1] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none sm:w-44"
            >
              <option value="all" className="bg-[#1B1B1B]">
                All dates
              </option>
              <option value="today" className="bg-[#1B1B1B]">
                Today
              </option>
              <option value="7d" className="bg-[#1B1B1B]">
                Last 7 days
              </option>
            </select>
          </div>

          {/* Interactive Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === opt.value
                    ? 'bg-[#FF7139] text-[#101010]'
                    : 'bg-[#141414] text-[#929292] hover:text-[#F5F0E8] border border-white/[0.06]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-[#1B1B1B] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] text-[#929292]">
                  <th className="py-3.5 px-5 font-medium">Order ID</th>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Items</th>
                  <th className="py-3.5 px-4 font-medium text-right">Total</th>
                  <th className="py-3.5 px-4 font-medium">Payment</th>
                  <th className="py-3.5 px-4 font-medium">Date</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#929292]">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#929292]">
                      No orders match your current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/[0.02]">
                      <td className="py-4 px-5 font-mono tabular-nums text-[#F5F0E8] whitespace-nowrap">
                        {ord.orderNumber}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#F5F0E8] whitespace-nowrap">
                          {ord.customerName}
                        </p>
                        {ord.customerPhone && (
                          <p className="text-[11px] font-mono text-[#929292]">{ord.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-[#929292] max-w-[230px] truncate">
                        {ord.items
                          .map((i) => `${i.quantity ?? '?'} ${i.unit} ${i.productName}`)
                          .join(', ')}
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums text-right text-[#F5F0E8] whitespace-nowrap">
                        {formatINR(ord.totalAmountInr)}
                      </td>
                      <td className="py-4 px-4">
                        <PaymentModeLabel mode={ord.paymentMode} />
                      </td>
                      <td className="py-4 px-4 font-mono tabular-nums text-[#929292] whitespace-nowrap">
                        {formatShortDate(ord.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <OrderStatusLabel status={ord.status} />
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <select
                            aria-label={`Change status for ${ord.orderNumber}`}
                            value={ord.status}
                            onChange={(e) =>
                              setPendingStatusChange({
                                order: ord,
                                nextStatus: e.target.value as OrderStatus,
                              })
                            }
                            className="rounded-lg bg-[#101010] border border-white/[0.1] px-2 py-1.5 text-[11px] text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
                          >
                            {NEXT_STATUS_LIST.map((st) => (
                              <option key={st} value={st} className="bg-[#1B1B1B]">
                                {st.replace('_', ' ')}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(ord.id)}
                            aria-label={`Inspect ${ord.orderNumber}`}
                            className="p-2 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#F5F0E8] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-6 text-center text-xs text-[#929292]">
              No matching orders found.
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs text-[#FF7139]">{ord.orderNumber}</span>
                    <h3 className="text-sm font-semibold text-[#F5F0E8]">{ord.customerName}</h3>
                  </div>
                  <OrderStatusLabel status={ord.status} />
                </div>

                <p className="text-xs text-[#929292] leading-relaxed">
                  {ord.items
                    .map((i) => `${i.quantity ?? '?'} ${i.unit} ${i.productName}`)
                    .join(', ')}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.07] text-xs">
                  <span className="font-mono tabular-nums text-[#F5F0E8] font-semibold">
                    {formatINR(ord.totalAmountInr)}
                  </span>
                  <PaymentModeLabel mode={ord.paymentMode} />
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(ord.id)}
                    className="text-[#FF7139] font-medium"
                  >
                    Inspect details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <Modal
        open={Boolean(pendingStatusChange)}
        onClose={() => setPendingStatusChange(null)}
        title="Confirm order status change"
        description={
          pendingStatusChange
            ? `Update ${pendingStatusChange.order.orderNumber} (${pendingStatusChange.order.customerName}) from "${pendingStatusChange.order.status.replace('_', ' ')}" to "${pendingStatusChange.nextStatus.replace('_', ' ')}"?`
            : undefined
        }
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPendingStatusChange(null)}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-white/[0.12] text-[#F5F0E8] hover:bg-[#242424] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={updatingStatus}
            onClick={confirmStatusUpdate}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors"
          >
            {updatingStatus ? 'Updating...' : 'Confirm status'}
          </button>
        </div>
      </Modal>

      {/* Order Detail Slide-Over Drawer */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Order details for ${selectedOrder.orderNumber}`}
          className="fixed inset-0 z-50 flex justify-end"
        >
          <div
            onClick={() => setSelectedOrderId(null)}
            className="fixed inset-0 bg-black/75"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-full max-w-lg bg-[#161616] border-l border-white/[0.1] h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <p className="text-xs font-mono text-[#FF7139]">{selectedOrder.orderNumber}</p>
                <h2 className="font-display text-xl font-semibold text-[#F5F0E8] mt-0.5">
                  {selectedOrder.customerName}
                </h2>
                <p className="text-xs font-mono text-[#929292] mt-0.5">
                  {selectedOrder.customerPhone ? `${selectedOrder.customerPhone} · ` : ''}
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                aria-label="Close order drawer"
                className="p-2 rounded-lg text-[#929292] hover:text-[#F5F0E8] hover:bg-[#242424]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original Voice Note Reference */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F5F0E8]">Original Voice Note</span>
                <ConfidenceIndicator value={selectedOrder.overallConfidence} />
              </div>
              {drawerAudioUrl && (
                <AudioPlayerCard
                  src={drawerAudioUrl}
                  fileName={selectedOrder.audioFileName}
                  durationSec={selectedOrder.audioDurationSec}
                  languageLabel={selectedOrder.language}
                  compact
                />
              )}
              <div className="rounded-xl bg-[#101010] border border-white/[0.08] p-3.5">
                <p className="text-[11px] text-[#929292] mb-1">Transcription</p>
                <p className="text-sm text-[#F5F0E8] leading-relaxed">
                  &ldquo;{selectedOrder.transcription}&rdquo;
                </p>
              </div>
            </div>

            {/* Extracted Items */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-[#F5F0E8]">Extracted Items</h3>
              <div className="divide-y divide-white/[0.07] rounded-xl bg-[#1B1B1B] border border-white/[0.08] overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="text-[#F5F0E8] font-medium">{item.productName}</p>
                      <p className="text-[11px] text-[#929292] font-mono tabular-nums">
                        {item.quantity} {item.unit} × {formatINR(item.unitPriceInr ?? 0)}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-[#F5F0E8]">
                      {formatINR((item.quantity ?? 0) * (item.unitPriceInr ?? 0))}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-3 bg-[#141414] flex items-center justify-between text-sm font-semibold">
                  <span className="text-[#929292]">Total</span>
                  <span className="font-mono tabular-nums text-[#F5F0E8]">
                    {formatINR(selectedOrder.totalAmountInr)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Status Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#1B1B1B] border border-white/[0.08] p-3.5">
                <p className="text-[#929292] mb-1">Payment mode</p>
                <PaymentModeLabel mode={selectedOrder.paymentMode} />
              </div>
              <div className="rounded-xl bg-[#1B1B1B] border border-white/[0.08] p-3.5">
                <p className="text-[#929292] mb-1">Current status</p>
                <OrderStatusLabel status={selectedOrder.status} />
              </div>
            </div>

            {selectedOrder.deliveryInstructions && (
              <div className="rounded-xl bg-[#1B1B1B] border border-white/[0.08] p-3.5 text-xs">
                <p className="text-[#929292] mb-1">Delivery instructions</p>
                <p className="text-[#F5F0E8]">{selectedOrder.deliveryInstructions}</p>
              </div>
            )}

            {/* Order Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#F5F0E8]">Order Timeline</h3>
              <ol className="space-y-3 border-l border-white/[0.12] pl-4 ml-1">
                {selectedOrder.timeline.map((evt) => (
                  <li key={evt.id} className="space-y-0.5">
                    <p className="text-xs font-medium text-[#F5F0E8]">{evt.label}</p>
                    <p className="text-[11px] text-[#929292]">
                      {evt.actor} · {formatDateTime(evt.timestamp)}
                    </p>
                    {evt.detail && (
                      <p className="text-[11px] text-[#929292]">{evt.detail}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </DashboardLayout>
  );
}
