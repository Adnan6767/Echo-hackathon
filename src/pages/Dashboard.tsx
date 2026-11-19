import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { OrderStatusLabel, PaymentModeLabel } from '../components/common/StatusLabel';
import { useEchoDashboardData } from '../hooks/useEchoData';
import { useToast } from '../hooks/useToast';
import { formatINR, formatRelativeTime } from '../utils/format';

export default function Dashboard() {
  const { orders, reviewQueue, summary, loading, error, resetDemoData } =
    useEchoDashboardData(7);
  const { pushToast } = useToast();

  const handleReset = () => {
    resetDemoData();
    pushToast({
      variant: 'info',
      title: 'Demo data restored',
      description: 'Orders, udhaar ledger, and review queue reset to initial sample state.',
    });
  };

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Daily kirana orders, udhaar credit summary, and voice review queue"
    >
      <div className="space-y-6">
        <ModeBanner onResetDemo={handleReset} compact />

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-[#E56D65]/10 border border-[#E56D65]/35 p-5 text-sm text-[#F5F0E8]"
          >
            <p className="font-semibold text-[#E56D65]">Backend connection unavailable</p>
            <p className="text-xs text-[#F5F0E8]/85 mt-1">{error}</p>
          </div>
        )}

        {/* 4 KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading || !summary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-[#1B1B1B] border border-white/[0.08] p-5 animate-pulse"
              />
            ))
          ) : (
            <>
              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
                <p className="text-xs text-[#929292]">Orders today</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#F5F0E8] tabular-nums">
                  {summary.ordersToday}
                </p>
                <p className="mt-1.5 text-xs text-[#40C98A]">
                  {formatINR(summary.dailySalesInr)} gross sales
                </p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
                <p className="text-xs text-[#929292]">Completed orders</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#40C98A] tabular-nums">
                  {summary.completedOrders}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">Delivered &amp; settled</p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
                <p className="text-xs text-[#929292]">Pending orders</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#E8B75B] tabular-nums">
                  {summary.pendingOrders}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">
                  {summary.needsReviewCount} awaiting audio review
                </p>
              </div>

              <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
                <p className="text-xs text-[#929292]">Outstanding udhaar</p>
                <p className="mt-2 font-display text-3xl font-semibold text-[#FF7139] tabular-nums">
                  {formatINR(summary.outstandingUdhaarInr)}
                </p>
                <p className="mt-1.5 text-xs text-[#929292]">Tracked in customer ledger</p>
              </div>
            </>
          )}
        </div>

        {/* Daily Order Chart + Pending Confirmation Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                  Daily Voice Orders (Last 7 Days)
                </h2>
                <p className="text-xs text-[#929292] mt-0.5">
                  Confirmed daily order volume from voice intake
                </p>
              </div>
              <Link
                to="/dashboard/analytics"
                className="text-xs text-[#FF7139] hover:underline whitespace-nowrap"
              >
                Full analytics →
              </Link>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary?.dailySeries ?? []}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="label"
                    stroke="#929292"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#929292" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      backgroundColor: '#101010',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#F5F0E8',
                    }}
                  />
                  <Bar dataKey="orders" name="Orders" fill="#FF7139" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Confirmation Widget */}
          <div className="lg:col-span-4 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                  Pending Confirmation
                </h2>
                <span className="text-xs font-mono tabular-nums text-[#E8B75B]">
                  {reviewQueue.length} queued
                </span>
              </div>

              {reviewQueue.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <p className="text-sm font-medium text-[#40C98A]">All voice notes reviewed</p>
                  <p className="text-xs text-[#929292]">
                    Low-confidence or incomplete extractions will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewQueue.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#141414] border border-white/[0.07] p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-[#F5F0E8] truncate">
                          {item.customerName}
                        </span>
                        <span className="font-mono tabular-nums text-[#E8B75B] shrink-0">
                          {Math.round(item.overallConfidence * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-[#929292] line-clamp-2 leading-relaxed">
                        {item.reasonSummary}
                      </p>
                      <p className="text-[11px] text-[#E8B75B] inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{item.fieldsNeedingReview.join(' · ')}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/dashboard/review"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#242424] hover:bg-[#2d2d2d] text-[#F5F0E8] transition-colors"
            >
              <span>Open review queue</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Recent Orders + Top Products + Customer Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Recent Orders Table */}
          <div className="xl:col-span-7 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                Recent Orders
              </h2>
              <Link
                to="/dashboard/orders"
                className="text-xs text-[#FF7139] hover:underline"
              >
                View all orders
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[11px] text-[#929292]">
                    <th className="py-3 px-5 font-medium">Order</th>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                    <th className="py-3 px-4 font-medium">Payment</th>
                    <th className="py-3 px-5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-5 font-mono tabular-nums text-[#F5F0E8] whitespace-nowrap">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#F5F0E8] font-medium whitespace-nowrap">
                        {ord.customerName}
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

          {/* Top Products & Customer Activity */}
          <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
            <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
                <h2 className="font-display text-sm font-semibold text-[#F5F0E8]">
                  Top Ordered Products
                </h2>
                <span className="text-[11px] text-[#929292]">14-day volume</span>
              </div>
              <div className="space-y-3">
                {(summary?.topProducts ?? []).slice(0, 4).map((prod) => (
                  <div
                    key={prod.productName}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="text-[#F5F0E8] font-medium truncate">{prod.productName}</p>
                      <p className="text-[11px] text-[#929292] font-mono tabular-nums">
                        {prod.ordersCount} orders · {prod.totalQuantityLabel}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums text-[#F5F0E8] shrink-0">
                      {formatINR(prod.revenueInr)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
                <h2 className="font-display text-sm font-semibold text-[#F5F0E8]">
                  Recent Customer Activity
                </h2>
                <Link
                  to="/dashboard/ledger"
                  className="text-xs text-[#FF7139] hover:underline"
                >
                  Ledger
                </Link>
              </div>
              <div className="space-y-3">
                {(summary?.recentActivity ?? []).slice(0, 4).map((act) => (
                  <div key={act.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[#F5F0E8] font-medium truncate">{act.customerName}</p>
                      <p className="text-[11px] text-[#929292] truncate">{act.action}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {act.amountInr !== undefined && (
                        <p className="font-mono tabular-nums text-[#F5F0E8]">
                          {formatINR(act.amountInr)}
                        </p>
                      )}
                      <p className="text-[10px] text-[#929292]">
                        {formatRelativeTime(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
