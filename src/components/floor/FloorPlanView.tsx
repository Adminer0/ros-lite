import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Receipt,
  Check,
  RotateCcw,
  Sparkles,
  Move,
  Clock,
  ArrowUpRight,
  Utensils,
  CreditCard,
} from 'lucide-react';
import { RestaurantTable, TableStatus, Order } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Sheet } from '../ui/Sheet';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';

interface FloorPlanViewProps {
  tables: RestaurantTable[];
  orders: Order[];
  onSelectTableForOrder: (tableId: string) => void;
  onNavigate: (route: string, params?: any) => void;
  onRefresh: () => void;
}

export function FloorPlanView({
  tables,
  orders,
  onSelectTableForOrder,
  onNavigate,
  onRefresh,
}: FloorPlanViewProps) {
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Find active order for a table
  const getTableOrder = (table: RestaurantTable): Order | undefined => {
    return orders.find(
      (o) => o.table_id === table.id && o.status !== 'PAID' && o.status !== 'CANCELLED'
    );
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          badge: 'success' as const,
          pill: 'bg-emerald-600',
          label: 'Available',
        };
      case 'ORDERING':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'warning' as const,
          pill: 'bg-amber-500',
          label: 'Ordering',
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-blue-50 border-blue-300 text-blue-900',
          badge: 'info' as const,
          pill: 'bg-blue-600',
          label: 'Occupied',
        };
      case 'PAYMENT_PENDING':
        return {
          bg: 'bg-purple-50 border-purple-300 text-purple-900',
          badge: 'purple' as const,
          pill: 'bg-purple-600',
          label: 'Bill Generated',
        };
      case 'RESERVED':
        return {
          bg: 'bg-stone-100 border-stone-300 text-stone-700',
          badge: 'secondary' as const,
          pill: 'bg-stone-400',
          label: 'Reserved',
        };
    }
  };

  // Status counts
  const counts = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    ordering: tables.filter((t) => t.status === 'ORDERING').length,
    payment: tables.filter((t) => t.status === 'PAYMENT_PENDING').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
  };

  const filteredTables = tables.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const activeOrder = selectedTable ? getTableOrder(selectedTable) : null;

  const handleUpdateStatus = async (status: TableStatus) => {
    if (!selectedTable) return;
    try {
      await api.updateTableStatus(selectedTable.id, status);
      setSelectedTable({ ...selectedTable, status });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e: React.DragEvent, tableId: string) => {
    if (!editMode) return;
    const container = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!container) return;
    const x = Math.max(20, Math.min(container.width - 140, e.clientX - container.left - 60));
    const y = Math.max(20, Math.min(container.height - 140, e.clientY - container.top - 60));
    api.updateTablePosition(tableId, Math.round(x), Math.round(y)).then(() => onRefresh());
  };

  return (
    <div className="space-y-4">
      {/* Floor Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Visual Floor Plan</h1>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded font-medium">
              Indiranagar Main Dining
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time table turnover, dining statuses, and bill requests.
          </p>
        </div>

        {/* Filter Badges and Mode Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterStatus === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setFilterStatus('AVAILABLE')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterStatus === 'AVAILABLE' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Available ({counts.available})
          </button>
          <button
            onClick={() => setFilterStatus('OCCUPIED')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterStatus === 'OCCUPIED' ? 'bg-blue-800 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Occupied ({counts.occupied})
          </button>
          <button
            onClick={() => setFilterStatus('PAYMENT_PENDING')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              filterStatus === 'PAYMENT_PENDING' ? 'bg-purple-800 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Bill Due ({counts.payment})
          </button>

          <Button
            size="sm"
            variant={editMode ? 'default' : 'outline'}
            onClick={() => setEditMode(!editMode)}
            className="h-7 text-xs ml-2"
          >
            <Move className="w-3 h-3 mr-1" />
            <span>{editMode ? 'Done Positioning' : 'Rearrange'}</span>
          </Button>
        </div>
      </div>

      {/* Visual Canvas / Floor Grid */}
      <div className="bg-stone-100/70 border border-stone-300 rounded-xl p-6 min-h-[540px] relative overflow-hidden shadow-inner">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#78716c 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-stone-200 rounded-lg p-2 text-[11px] shadow-xs flex items-center gap-3 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-stone-700">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-stone-700">Ordering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-stone-700">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="text-stone-700">Bill Due</span>
          </div>
        </div>

        {/* Tables Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-0">
          {filteredTables.map((table) => {
            const statusConfig = getStatusColor(table.status);
            const currentOrd = getTableOrder(table);
            const isSelected = selectedTable?.id === table.id;

            return (
              <div
                key={table.id}
                draggable={editMode}
                onDragEnd={(e) => handleDrag(e, table.id)}
                onClick={() => setSelectedTable(table)}
                className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 relative bg-white shadow-xs hover:shadow-md ${
                  statusConfig.bg
                } ${isSelected ? 'ring-2 ring-stone-900 ring-offset-2 scale-[1.02]' : ''}`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-extrabold tracking-tight text-stone-900">
                    {table.table_number}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-white/80 px-1.5 py-0.5 rounded border border-stone-200">
                    <Users className="w-3 h-3 text-stone-500" />
                    {table.capacity}
                  </span>
                </div>

                {/* Status Indicator Pill */}
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`w-2 h-2 rounded-full ${statusConfig.pill}`} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Current Active Order Summary */}
                {currentOrd ? (
                  <div className="pt-2 border-t border-stone-200/80 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="font-mono text-[11px] font-semibold">{currentOrd.order_number}</span>
                      <span className="font-bold text-stone-900">{formatCurrency(currentOrd.total)}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mt-0.5">
                      {currentOrd.items.length} item{currentOrd.items.length > 1 ? 's' : ''} • {currentOrd.status}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-200/60 text-xs text-stone-400 italic">
                    Ready for guests
                  </div>
                )}

                {/* Hover CTA prompt */}
                <div className="absolute inset-x-2 -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                  <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Manage Table
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Sheet for Selected Table Management */}
      <Sheet
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        title={selectedTable ? `Manage Table ${selectedTable.table_number}` : ''}
        description={selectedTable ? `${selectedTable.capacity} Seats • Dining Area` : ''}
      >
        {selectedTable && (
          <div className="space-y-5">
            {/* Status overview */}
            <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">Current Status</span>
                <Badge variant={getStatusColor(selectedTable.status).badge}>
                  {getStatusColor(selectedTable.status).label}
                </Badge>
              </div>

              {/* Status change actions */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-200">
                <button
                  onClick={() => handleUpdateStatus('AVAILABLE')}
                  className={`text-xs py-1.5 px-2 rounded font-medium text-center border transition-colors ${
                    selectedTable.status === 'AVAILABLE'
                      ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  Set Available
                </button>
                <button
                  onClick={() => handleUpdateStatus('OCCUPIED')}
                  className={`text-xs py-1.5 px-2 rounded font-medium text-center border transition-colors ${
                    selectedTable.status === 'OCCUPIED'
                      ? 'bg-blue-800 text-white border-blue-900 font-bold'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  Set Occupied
                </button>
                <button
                  onClick={() => handleUpdateStatus('ORDERING')}
                  className={`text-xs py-1.5 px-2 rounded font-medium text-center border transition-colors ${
                    selectedTable.status === 'ORDERING'
                      ? 'bg-amber-600 text-white border-amber-700 font-bold'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  Set Ordering
                </button>
                <button
                  onClick={() => handleUpdateStatus('RESERVED')}
                  className={`text-xs py-1.5 px-2 rounded font-medium text-center border transition-colors ${
                    selectedTable.status === 'RESERVED'
                      ? 'bg-stone-800 text-white border-stone-900 font-bold'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                  }`}
                >
                  Set Reserved
                </button>
              </div>
            </div>

            {/* Active Order Details */}
            {activeOrder ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Active Order: {activeOrder.order_number}
                  </h4>
                  <Badge variant="outline">{activeOrder.status}</Badge>
                </div>

                <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
                  <div className="max-h-52 overflow-y-auto divide-y divide-stone-100 p-2">
                    {activeOrder.items.map((item, i) => (
                      <div key={i} className="py-1.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-stone-800">
                            {item.quantity} × {item.menu_item_name}
                          </span>
                          {item.variant && (
                            <span className="text-[11px] text-stone-500 block">
                              ({item.variant.name})
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] text-amber-700 block italic">
                              Note: {item.notes}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-medium text-stone-900">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-stone-50 p-3 border-t border-stone-200 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(activeOrder.subtotal)}</span>
                    </div>
                    {activeOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount</span>
                        <span>-{formatCurrency(activeOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>GST (5%)</span>
                      <span>{formatCurrency(activeOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-stone-200">
                      <span>Total Amount</span>
                      <span>{formatCurrency(activeOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Workflow Actions for Table Order */}
                <div className="space-y-2 pt-2">
                  {activeOrder.status === 'READY' && (
                    <Button
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white"
                      onClick={async () => {
                        await api.updateOrderStatus(activeOrder.id, 'SERVED');
                        onRefresh();
                        setSelectedTable(null);
                      }}
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Mark Order as Served
                    </Button>
                  )}

                  <Button
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white"
                    onClick={() => {
                      onNavigate('billing', { orderId: activeOrder.id });
                      setSelectedTable(null);
                    }}
                  >
                    <Receipt className="w-4 h-4 mr-1.5" />
                    Generate Bill / Settle UPI & Cash
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-stone-700"
                    onClick={() => {
                      onSelectTableForOrder(selectedTable.id);
                      onNavigate('orders', { tableId: selectedTable.id });
                      setSelectedTable(null);
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Add More Items (POS)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-stone-300 rounded-lg bg-stone-50">
                <Utensils className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-stone-700">No active order for this table</p>
                <p className="text-[11px] text-stone-500 mt-0.5 mb-4">
                  Create a new guest order via POS or scan the table QR code.
                </p>

                <div className="flex flex-col gap-2 max-w-xs mx-auto">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white"
                    onClick={() => {
                      onSelectTableForOrder(selectedTable.id);
                      onNavigate('orders', { tableId: selectedTable.id });
                      setSelectedTable(null);
                    }}
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    New Order for Table {selectedTable.table_number}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onNavigate('customer-order', {
                        restaurantId: 'the-green-table',
                        tableId: selectedTable.id,
                      });
                      setSelectedTable(null);
                    }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
                    Open Customer QR Menu
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
