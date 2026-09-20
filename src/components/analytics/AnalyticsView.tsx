import React from 'react';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Users,
  Clock,
  ArrowUpRight,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { AnalyticsSummary } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary;
}

const PAYMENT_COLORS = ['#15803d', '#44403c', '#0284c7', '#a855f7'];

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  // Format payment breakdown
  const paymentPieData = (analytics.payment_distribution || []).filter((p) => p.value > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Business Analytics</h1>
        <p className="text-xs text-stone-500">
          Continuous operational intelligence computed directly from your Neon PostgreSQL ledger.
        </p>
      </div>

      {/* Primary KPI Metric Cards (4 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-white">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Today's Revenue</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {formatCurrency(analytics.today_revenue)}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +14.2% from yesterday
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Settled Orders</span>
            <div className="w-7 h-7 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {analytics.today_orders}
            </div>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              Active Dining Shift
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Avg. Order Value (AOV)</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {formatCurrency(analytics.average_order_value)}
            </div>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              Per dining party
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Dining Tables</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {analytics.active_tables} / 10
            </div>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              Real-time floor occupancy
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row: Revenue Over Time + Hourly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Revenue Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Revenue Velocity Trend</h3>
              <p className="text-[11px] text-stone-500">Gross turnover progression across service.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Today's Run Rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#15803d"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Settlement Distribution</h3>
            <p className="text-[11px] text-stone-500">UPI Intent vs Cash volume share.</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
            {paymentPieData.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[idx % PAYMENT_COLORS.length] }}
                  />
                  <span className="text-stone-700">{p.name}</span>
                </div>
                <span className="font-mono font-bold text-stone-900">{formatCurrency(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Top-Selling Dishes + Hourly Order Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Selling Dishes (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Top Velocity Menu Items</h3>
              <p className="text-[11px] text-stone-500">Highest grossing items in current service.</p>
            </div>
          </div>

          <div className="space-y-2">
            {(analytics.top_selling_items || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-extrabold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-stone-900">{item.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-stone-500 font-medium">{item.quantity} plates</span>
                  <span className="font-mono font-extrabold text-stone-900">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Dining Hours (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Peak Dining Distribution</h3>
            <p className="text-[11px] text-stone-500">Order traffic by hour of the day.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peak_hours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} orders`, 'Volume']}
                  contentStyle={{ backgroundColor: '#1c1917', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
