import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDownLeft, ArrowUpRight, Plus, Search, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { Modal } from '../components/common/Modal';
import { useEchoDashboardData } from '../hooks/useEchoData';
import { addCustomerTransaction, fetchCustomerLedger } from '../api/customers.api';
import { formatApiError } from '../api/client';
import { formatDateTime, formatINR, formatShortDate } from '../utils/format';
import { useToast } from '../hooks/useToast';
import type { LedgerEntry } from '../types';

const transactionSchema = z.object({
  amountInr: z
    .number({ message: 'Enter a valid amount' })
    .positive('Amount must be greater than ₹0')
    .max(500000, 'Amount exceeds single entry limit'),
  paymentChannel: z.enum(['cash', 'upi', 'manual_credit']),
  note: z.string().trim().min(3, 'Enter a short audit note (at least 3 characters)').max(160),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function Ledger() {
  const { customers } = useEchoDashboardData();
  const { pushToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id ?? '');
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [modalMode, setModalMode] = useState<'payment' | 'credit' | null>(null);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) ?? customers[0] ?? null;

  useEffect(() => {
    if (!selectedCustomer) return;
    let active = true;
    setLoadingLedger(true);
    fetchCustomerLedger(selectedCustomer.id)
      .then((list) => {
        if (!active) return;
        setEntries(list);
        setLoadingLedger(false);
      })
      .catch(() => {
        if (!active) return;
        setLoadingLedger(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCustomer, customers]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amountInr: 500,
      paymentChannel: 'upi',
      note: '',
    },
  });

  const openModal = (mode: 'payment' | 'credit') => {
    reset({
      amountInr: mode === 'payment' ? Math.min(500, selectedCustomer?.outstandingBalanceInr || 500) : 250,
      paymentChannel: mode === 'payment' ? 'upi' : 'manual_credit',
      note: '',
    });
    setModalMode(mode);
  };

  const onSubmit = async (values: TransactionFormValues) => {
    if (!selectedCustomer || !modalMode) return;
    try {
      await addCustomerTransaction(selectedCustomer.id, {
        type: modalMode,
        amountInr: values.amountInr,
        paymentChannel: modalMode === 'credit' ? 'manual_credit' : values.paymentChannel,
        note: values.note,
      });
      const refreshed = await fetchCustomerLedger(selectedCustomer.id);
      setEntries(refreshed);
      setModalMode(null);
      pushToast({
        variant: 'success',
        title: modalMode === 'payment' ? 'Payment recorded' : 'Credit entry appended',
        description: `${formatINR(values.amountInr)} appended to ${selectedCustomer.name}'s audit ledger.`,
      });
    } catch (err) {
      pushToast({
        variant: 'error',
        title: 'Transaction failed',
        description: formatApiError(err),
      });
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalanceInr, 0);

  return (
    <DashboardLayout
      title="Customer Ledger"
      subtitle="Append-only udhaar accounts with transparent running balances and audit hashes"
    >
      <div className="space-y-6">
        <ModeBanner compact />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Customer List Column */}
          <div className="lg:col-span-5 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F5F0E8]">
                  Customers ({customers.length})
                </span>
                <span className="font-mono tabular-nums text-[#FF7139]">
                  Total Due: {formatINR(totalOutstanding)}
                </span>
              </div>

              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#929292] absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer or phone..."
                  aria-label="Search customers"
                  className="w-full rounded-xl bg-[#101010] border border-white/[0.1] pl-9 pr-3 py-2 text-xs text-[#F5F0E8] placeholder:text-[#929292] focus:border-[#FF7139] focus:outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-white/[0.06] max-h-[600px] overflow-y-auto">
              {filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`w-full text-left px-4 py-3.5 transition-colors ${
                      isSelected ? 'bg-[#242424]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#F5F0E8] truncate">
                        {cust.name}
                      </span>
                      <span
                        className={`text-sm font-mono tabular-nums font-semibold shrink-0 ${
                          cust.outstandingBalanceInr > 0 ? 'text-[#FF7139]' : 'text-[#40C98A]'
                        }`}
                      >
                        {formatINR(cust.outstandingBalanceInr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-[#929292]">
                      <span className="font-mono">{cust.phone || 'No phone provided'}</span>
                      <span>Last: {formatShortDate(cust.lastTransactionAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#929292] font-mono tabular-nums">
                      <span>Bought {formatINR(cust.totalPurchasesInr)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Paid {formatINR(cust.amountPaidInr)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Customer Ledger Panel */}
          <div className="lg:col-span-7 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
            {!selectedCustomer ? (
              <p className="text-sm text-[#929292] py-12 text-center">
                Select a customer to view their credit ledger.
              </p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/[0.08]">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#F5F0E8]">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-xs text-[#929292] mt-1">
                      {selectedCustomer.phone ? `${selectedCustomer.phone} · ` : ''}
                      {selectedCustomer.address}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openModal('payment')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#40C98A] hover:bg-[#52d699] text-[#101010] transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      Add payment
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal('credit')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-white/[0.14] hover:border-white/[0.28] text-[#F5F0E8] bg-[#242424] transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      Add credit entry
                    </button>
                  </div>
                </div>

                {/* Account Totals */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-3.5">
                    <p className="text-[11px] text-[#929292]">Total purchases</p>
                    <p className="mt-1 font-mono tabular-nums text-base sm:text-lg font-semibold text-[#F5F0E8]">
                      {formatINR(selectedCustomer.totalPurchasesInr)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-3.5">
                    <p className="text-[11px] text-[#929292]">Amount paid</p>
                    <p className="mt-1 font-mono tabular-nums text-base sm:text-lg font-semibold text-[#40C98A]">
                      {formatINR(selectedCustomer.amountPaidInr)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#141414] border border-white/[0.07] p-3.5">
                    <p className="text-[11px] text-[#929292]">Outstanding</p>
                    <p className="mt-1 font-mono tabular-nums text-base sm:text-lg font-semibold text-[#FF7139]">
                      {formatINR(selectedCustomer.outstandingBalanceInr)}
                    </p>
                  </div>
                </div>

                {/* Immutable Audit Notice */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#101010] border border-white/[0.07] text-xs text-[#929292]">
                  <ShieldCheck className="w-4 h-4 text-[#40C98A] shrink-0" aria-hidden="true" />
                  <span>
                    Append-only audit trail: previous financial transactions are never edited or
                    silently overwritten.
                  </span>
                </div>

                {/* Transaction History */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#F5F0E8]">
                    Transaction History ({entries.length})
                  </h3>

                  {loadingLedger ? (
                    <p className="text-xs text-[#929292] py-6">Loading ledger entries...</p>
                  ) : entries.length === 0 ? (
                    <p className="text-xs text-[#929292] py-6">
                      No credit or payment transactions recorded for this customer yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {entries.map((entry) => {
                        const isPayment = entry.type === 'payment';
                        return (
                          <div
                            key={entry.id}
                            className="rounded-xl bg-[#141414] border border-white/[0.07] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isPayment
                                    ? 'bg-[#40C98A]/15 text-[#40C98A]'
                                    : 'bg-[#FF7139]/15 text-[#FF7139]'
                                }`}
                                aria-hidden="true"
                              >
                                {isPayment ? (
                                  <ArrowDownLeft className="w-4 h-4" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4" />
                                )}
                              </span>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-medium text-[#F5F0E8]">
                                    {isPayment ? 'Payment Received' : 'Udhaar Credit Added'}
                                  </span>
                                  {entry.referenceOrderNumber && (
                                    <span className="font-mono text-[#FF7139]">
                                      {entry.referenceOrderNumber}
                                    </span>
                                  )}
                                  <span className="font-mono text-[11px] text-[#929292]">
                                    #{entry.immutableHash}
                                  </span>
                                </div>
                                <p className="text-xs text-[#929292] mt-1 leading-relaxed">
                                  {entry.note}
                                </p>
                                <p className="text-[11px] text-[#929292] mt-1">
                                  {formatDateTime(entry.timestamp)} · Recorded by {entry.recordedBy}
                                </p>
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 pl-10 sm:pl-0">
                              <p
                                className={`font-mono tabular-nums text-sm font-semibold ${
                                  isPayment ? 'text-[#40C98A]' : 'text-[#FF7139]'
                                }`}
                              >
                                {isPayment ? '−' : '+'} {formatINR(entry.amountInr)}
                              </p>
                              <p className="text-[11px] font-mono tabular-nums text-[#929292] mt-0.5">
                                Bal: {formatINR(entry.runningBalanceInr)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Payment / Add Credit Modal */}
      <Modal
        open={Boolean(modalMode)}
        onClose={() => setModalMode(null)}
        title={modalMode === 'payment' ? 'Record Customer Payment' : 'Add Manual Credit Entry'}
        description={
          selectedCustomer
            ? `Appends an immutable entry to ${selectedCustomer.name}'s udhaar ledger.`
            : undefined
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="ledger-amount" className="block text-xs text-[#929292] mb-1.5">
              Amount (INR)
            </label>
            <input
              id="ledger-amount"
              type="number"
              step="1"
              {...register('amountInr', { valueAsNumber: true })}
              className="w-full rounded-xl bg-[#101010] border border-white/[0.12] px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
            />
            {errors.amountInr && (
              <p className="text-xs text-[#E56D65] mt-1">{errors.amountInr.message}</p>
            )}
          </div>

          {modalMode === 'payment' && (
            <div>
              <label htmlFor="ledger-channel" className="block text-xs text-[#929292] mb-1.5">
                Payment channel
              </label>
              <select
                id="ledger-channel"
                {...register('paymentChannel')}
                className="w-full rounded-xl bg-[#101010] border border-white/[0.12] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
              >
                <option value="upi" className="bg-[#1B1B1B]">
                  UPI (GPay / PhonePe / Paytm)
                </option>
                <option value="cash" className="bg-[#1B1B1B]">
                  Cash at counter
                </option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="ledger-note" className="block text-xs text-[#929292] mb-1.5">
              Audit note
            </label>
            <input
              id="ledger-note"
              type="text"
              placeholder={
                modalMode === 'payment'
                  ? 'e.g., Partial UPI settlement received'
                  : 'e.g., Counter purchase added to monthly khata'
              }
              {...register('note')}
              className="w-full rounded-xl bg-[#101010] border border-white/[0.12] px-3.5 py-2.5 text-sm text-[#F5F0E8] focus:border-[#FF7139] focus:outline-none"
            />
            {errors.note && <p className="text-xs text-[#E56D65] mt-1">{errors.note.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-white/[0.12] text-[#F5F0E8] hover:bg-[#242424]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#FF7139] hover:bg-[#ff824f] text-[#101010]"
            >
              {isSubmitting ? 'Saving...' : 'Append entry'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
