import React, { useRef, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  Table2,
  ChefHat,
  Receipt,
  PlusCircle,
  ArrowRight,
  Sparkles,
  QrCode,
  Clock,
  CheckCircle2,
  Brain,
  Database,
} from 'lucide-react';
import {
  Restaurant,
  RestaurantTable,
  Order,
  AnalyticsSummary,
  RestIQInsight,
} from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { gsapMotion } from '../../lib/animations';

interface DashboardViewProps {
  restaurant: Restaurant;
  tables: RestaurantTable[];
  orders: Order[];
  analytics: AnalyticsSummary;
  insights: RestIQInsight[];
  onNavigate: (route: string, params?: any) => void;
  onSelectTableForOrder: (tableId: string) => void;
}

export function DashboardView({
  restaurant,
  tables,
  orders,
  analytics,
  insights,
  onNavigate,
  onSelectTableForOrder,
}: DashboardViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const revenueRef = useRef<HTMLSpanElement>(null);
  const activeOrdersRef = useRef<HTMLSpanElement>(null);

  const pendingOrders = orders.filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED');
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
  const paymentPendingTables = tables.filter((t) => t.status === 'PAYMENT_PENDING').length;

  const topInsight = insights[0];

  // GSAP motion graphics on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Stagger KPI cards entrance
    const kpiCards = containerRef.current.querySelectorAll('.gsap-kpi-card');
    if (kpiCards.length > 0) {
      gsapMotion.staggerEntrance(kpiCards, { duration: 0.4, stagger: 0.07, y: 12 });
    }

    // Number tickers with GSAP
    if (revenueRef.current) {
      gsapMotion.counter(revenueRef.current, analytics.today_revenue, { isCurrency: true, duration: 0.7 });
    }
    if (activeOrdersRef.current) {
      gsapMotion.counter(activeOrdersRef.current, pendingOrders.length, { duration: 0.5 });
    }
  }, [analytics.today_revenue, pendingOrders.length]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Shift Operations Center</h1>
            <Badge variant="success">Live Shift</Badge>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              Neon DB
            </span>
          </div>
          <p className="text-xs text-stone-500">
            {restaurant.name} • {restaurant.address} • Real-time PostgreSQL Ledger
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onNavigate('floor')}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold h-8 gap-1.5"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold h-8 gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-800" />
            <span>New POS Order</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('kds')}
            className="text-xs font-bold h-8 gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            <span>Kitchen Display</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (Animated with GSAP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-white gsap-kpi-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Today's Revenue</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              <span ref={revenueRef}>{formatCurrency(analytics.today_revenue)}</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              {analytics.today_orders} settled checks
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white gsap-kpi-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Floor Occupancy</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {analytics.active_tables} / {tables.length} Tables
            </div>
            <span className="text-[11px] text-stone-500 font-medium block mt-1">
              {occupiedTables} occupied • {availableTables} available
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white gsap-kpi-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Active Dining Tickets</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              <span ref={activeOrdersRef}>{pendingOrders.length}</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block mt-1">
              {pendingOrders.filter((o) => o.status === 'PREPARING').length} in kitchen prep
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white gsap-kpi-card shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Bills Awaiting Settlement</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-xl font-extrabold font-mono text-stone-900">
              {paymentPendingTables}
            </div>
            <span className="text-[11px] text-purple-700 font-semibold block mt-1">
              Ready for UPI / Cash collection
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Floor Status + RestIQ Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Floor Plan Miniature (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Table Turnover Overview</h3>
              <p className="text-[11px] text-stone-500">{tables.length} dining tables in main dining section.</p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('floor')}
              className="h-7 text-xs font-bold"
            >
              <span>Manage Floor Plan</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* Quick Tables Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {tables.map((t) => {
              const isAvailable = t.status === 'AVAILABLE';
              const isOccupied = t.status === 'OCCUPIED';
              const isPayment = t.status === 'PAYMENT_PENDING';
              const isOrdering = t.status === 'ORDERING';

              return (
                <div
                  key={t.id}
                  onClick={() => onNavigate('floor')}
                  className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all hover:scale-105 ${
                    isAvailable
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isOccupied
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : isPayment
                      ? 'bg-purple-50 border-purple-300 text-purple-900'
                      : isOrdering
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  <span className="font-extrabold text-xs block">{t.table_number}</span>
                  <span className="text-[10px] font-semibold opacity-80 block truncate">
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top RestIQ Insight (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-extrabold">
                <Brain className="w-4 h-4" />
                <span>RESTIQ HIGH IMPACT</span>
              </div>
              <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                Confidence: {topInsight?.confidence || '98%'}
              </span>
            </div>

            <h4 className="text-sm font-bold leading-snug">{topInsight?.title}</h4>
            <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
              {topInsight?.description}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 truncate max-w-[200px]">
              {topInsight?.recommendation}
            </span>
            <Button
              size="sm"
              onClick={() => onNavigate('restiq')}
              className="h-7 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
            >
              View Insights →
            </Button>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Real-Time Active Order Tickets ({pendingOrders.length})
            </h3>
            <p className="text-[11px] text-stone-500">Live order state machine synchronized across POS and KDS in Neon DB.</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('orders')}
            className="h-7 text-xs"
          >
            Open All Orders
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Table</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Items Summary</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pendingOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400 italic">
                    All tables settled. Ready for new guests!
                  </td>
                </tr>
              ) : (
                pendingOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                    <td className="p-3 font-bold">{ord.table_number}</td>
                    <td className="p-3">
                      <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {ord.source}
                      </span>
                    </td>
                    <td className="p-3 text-stone-600 max-w-xs truncate">
                      {ord.items.map((it) => `${it.quantity}× ${it.menu_item_name}`).join(', ')}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          ord.status === 'READY'
                            ? 'info'
                            : ord.status === 'PREPARING'
                            ? 'warning'
                            : ord.status === 'BILLED'
                            ? 'purple'
                            : 'secondary'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900">{formatCurrency(ord.total)}</td>
                    <td className="p-3 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('billing', { orderId: ord.id })}
                        className="h-6 px-2 text-[11px] font-bold"
                      >
                        Bill / Pay
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onNavigate('kds')}
                        className="h-6 px-2 text-[11px] text-emerald-800"
                      >
                        KDS →
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
