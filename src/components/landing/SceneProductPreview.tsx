import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEchoDashboardData } from '../../hooks/useEchoData';
import { formatINR, formatRelativeTime } from '../../utils/format';
import { OrderStatusLabel, PaymentModeLabel } from '../common/StatusLabel';

export function SceneProductPreview() {
  const { orders, summary } = useEchoDashboardData(7);

  const totalOrders = summary?.ordersToday ?? 28;
  const pendingOrders = summary?.pendingOrders ?? 3;
  const dailySales = summary?.dailySalesInr ?? 11640;
  const outstandingUdhaar = summary?.outstandingUdhaarInr ?? 12960;

  return (
    <section className="py-24 sm:py-32 border-b border-white/[0.08]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-mono text-[#929292] mb-3">05 / 07 · Product Preview</p>
            <h2
              className="font-display font-semibold text-[#F5F0E8] tracking-tight leading-[1.08] text-balance"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.35rem)' }}
            >
              From scattered messages
              <br />
              <span className="text-[#929292]">to one clear view.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <span className="text-xs text-[#E8B75B]">
              Illustrative demo data · Live interactive workspace
            </span>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-[#FF7139] hover:bg-[#ff824f] text-[#101010] transition-colors whitespace-nowrap"
            >
              <span>Explore the dashboard</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Realistic Shopkeeper Dashboard Frame */}
        <div className="rounded-2xl border border-white/[0.1] bg-[#161616] overflow-hidden shadow-2xl">
          {/* Top Application Bar */}
          <div className="px-6 py-4 bg-[#1B1B1B] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-display font-semibold text-[#F5F0E8]">
                Sharma Kirana &amp; General Store
              </span>
              <span className="text-[#929292]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#929292]">Daily Operations Overview</span>
            </div>
            <span className="text-xs font-mono text-[#929292]">Demo Environment · INR</span>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 4 KPI Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-5">
                <p className="text-xs text-[#929292]">Total orders today</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#F5F0E8] tabular-nums">
                  {totalOrders}
                </p>
                <p className="mt-1.5 text-xs text-[#40C98A]">Voice + verified intake</p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-5">
                <p className="text-xs text-[#929292]">Pending orders</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#E8B75B] tabular-nums">
                  {pendingOrders}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">Awaiting packing or review</p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-5">
                <p className="text-xs text-[#929292]">Daily sales</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#F5F0E8] tabular-nums">
                  {formatINR(dailySales)}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">UPI, cash &amp; credit</p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-5">
                <p className="text-xs text-[#929292]">Outstanding udhaar</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#FF7139] tabular-nums">
                  {formatINR(outstandingUdhaar)}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">Across 5 active accounts</p>
              </div>
            </div>

            {/* Recent Orders + Customer Activity Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Orders Table */}
              <div className="lg:col-span-8 bg-[#1B1B1B] border border-white/[0.08] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#F5F0E8]">Recent Voice Orders</h3>
                  <Link
                    to="/dashboard/orders"
                    className="text-xs text-[#FF7139] hover:underline"
                  >
                    Manage all orders
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-[11px] text-[#929292]">
                        <th className="py-3 px-5 font-medium">Order</th>
                        <th className="py-3 px-4 font-medium">Customer</th>
                        <th className="py-3 px-4 font-medium">Items</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                        <th className="py-3 px-4 font-medium">Payment</th>
                        <th className="py-3 px-5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-xs">
                      {orders.slice(0, 4).map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-5 font-mono tabular-nums text-[#F5F0E8] whitespace-nowrap">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-4 text-[#F5F0E8] font-medium whitespace-nowrap">
                            {ord.customerName}
                          </td>
                          <td className="py-3.5 px-4 text-[#929292] max-w-[200px] truncate">
                            {ord.items
                              .map((i) => `${i.quantity ?? '?'} ${i.unit} ${i.productName}`)
                              .join(', ')}
                          </td>
                          <td className="py-3.5 px-4 font-mono tabular-nums text-right text-[#F5F0E8] whitespace-nowrap">
                            {formatINR(ord.totalAmountInr)}
                          </td>
                          <td className="py-3.5 px-4">
                            <PaymentModeLabel mode={ord.paymentMode} />
                          </td>
                          <td className="py-3.5 px-5">
                            <OrderStatusLabel status={ord.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Activity */}
              <div className="lg:col-span-4 bg-[#1B1B1B] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
                    <h3 className="text-sm font-semibold text-[#F5F0E8]">Customer Activity</h3>
                    <Link
                      to="/dashboard/ledger"
                      className="text-xs text-[#FF7139] hover:underline"
                    >
                      Open ledger
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {(summary?.recentActivity ?? []).slice(0, 4).map((act) => (
                      <div key={act.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-[#F5F0E8] truncate">
                            {act.customerName}
                          </span>
                          <span className="font-mono tabular-nums text-[#929292] shrink-0">
                            {formatRelativeTime(act.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs text-[#929292]">
                          <span className="truncate">{act.action}</span>
                          {act.amountInr !== undefined && (
                            <span className="font-mono tabular-nums text-[#F5F0E8] shrink-0">
                              {formatINR(act.amountInr)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-[#929292]">
                  Every confirmed voice order automatically updates customer balances.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
