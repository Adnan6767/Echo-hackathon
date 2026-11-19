import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ModeBanner } from '../components/common/ModeBanner';
import { useEchoDashboardData } from '../hooks/useEchoData';
import { formatINR } from '../utils/format';

export default function Analytics() {
  const [range, setRange] = useState<7 | 14>(14);
  const { summary, loading } = useEchoDashboardData(range);

  const totalRangeOrders = (summary?.dailySeries ?? []).reduce((s, d) => s + d.orders, 0);
  const totalRangeSales = (summary?.dailySeries ?? []).reduce((s, d) => s + d.salesInr, 0);

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Daily orders, sales revenue, top products, and payment mode breakdown"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <ModeBanner compact />
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-[#1B1B1B] border border-white/[0.08] shrink-0 self-start">
            <button
              type="button"
              onClick={() => setRange(7)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                range === 7
                  ? 'bg-[#FF7139] text-[#101010]'
                  : 'text-[#929292] hover:text-[#F5F0E8]'
              }`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setRange(14)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                range === 14
                  ? 'bg-[#FF7139] text-[#101010]'
                  : 'text-[#929292] hover:text-[#F5F0E8]'
              }`}
            >
              Last 14 days
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-[#929292]">Orders ({range}d)</p>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#F5F0E8] tabular-nums">
              {loading ? '—' : totalRangeOrders}
            </p>
          </div>
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-[#929292]">Total sales ({range}d)</p>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#40C98A] tabular-nums">
              {loading ? '—' : formatINR(totalRangeSales)}
            </p>
          </div>
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-[#929292]">Outstanding credit</p>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#FF7139] tabular-nums">
              {loading || !summary ? '—' : formatINR(summary.outstandingUdhaarInr)}
            </p>
          </div>
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-xs text-[#929292]">Pending orders</p>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-[#E8B75B] tabular-nums">
              {loading || !summary ? '—' : summary.pendingOrders}
            </p>
          </div>
        </div>

        {/* Row 1: Orders by Day + Daily Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
              Orders by Day
            </h2>
            <p className="text-xs text-[#929292] mt-0.5 mb-5">
              Count of voice-originated orders processed per day
            </p>
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
                  <Bar dataKey="orders" name="Orders" fill="#FF7139" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
              Daily Sales (INR)
            </h2>
            <p className="text-xs text-[#929292] mt-0.5 mb-5">
              Gross daily sales across UPI, Cash, and Udhaar orders
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary?.dailySeries ?? []}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40C98A" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#40C98A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="label"
                    stroke="#929292"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#929292"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(Number(value))}
                    contentStyle={{
                      backgroundColor: '#101010',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#F5F0E8',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="salesInr"
                    name="Sales"
                    stroke="#40C98A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Most Ordered Products + Payment Mode Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
              Most Ordered Products
            </h2>
            <p className="text-xs text-[#929292] mt-0.5 mb-5">
              Revenue and volume leaders across kirana staples
            </p>

            <div className="space-y-4">
              {(summary?.topProducts ?? []).map((prod) => {
                const maxRev = Math.max(
                  ...(summary?.topProducts ?? []).map((p) => p.revenueInr),
                  1
                );
                const widthPct = Math.round((prod.revenueInr / maxRev) * 100);
                return (
                  <div key={prod.productName} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#F5F0E8]">{prod.productName}</span>
                      <span className="font-mono tabular-nums text-[#929292]">
                        {prod.ordersCount} orders · {prod.totalQuantityLabel} ·{' '}
                        <span className="text-[#F5F0E8]">{formatINR(prod.revenueInr)}</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#101010] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF7139]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1B1B1B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#F5F0E8]">
                Payment Mode Distribution
              </h2>
              <p className="text-xs text-[#929292] mt-0.5 mb-4">
                Share of UPI, Udhaar (credit), and Cash over the selected range
              </p>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary?.paymentDistribution ?? []}
                      dataKey="amountInr"
                      nameKey="mode"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {(summary?.paymentDistribution ?? []).map((entry) => (
                        <Cell key={entry.mode} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatINR(Number(value))}
                      contentStyle={{
                        backgroundColor: '#101010',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#F5F0E8',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
              {(summary?.paymentDistribution ?? []).map((item) => (
                <div
                  key={item.mode}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="inline-flex items-center gap-2 text-[#F5F0E8]">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span>{item.mode}</span>
                  </span>
                  <span className="font-mono tabular-nums text-[#929292]">
                    {item.value}% ·{' '}
                    <span className="text-[#F5F0E8]">{formatINR(item.amountInr)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
