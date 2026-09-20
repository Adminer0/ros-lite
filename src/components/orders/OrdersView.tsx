import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Sparkles,
  ShoppingBag,
  ListFilter,
  Check,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import {
  MenuCategory,
  MenuItem,
  RestaurantTable,
  Order,
  OrderItem,
  SelectedVariant,
  SelectedAddon,
} from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Dialog } from '../ui/Dialog';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';

interface OrdersViewProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  orders: Order[];
  initialTableId?: string;
  onNavigate: (route: string, params?: any) => void;
  onRefresh: () => void;
}

interface CartItemDraft {
  menuItem: MenuItem;
  quantity: number;
  variant?: SelectedVariant;
  addons?: SelectedAddon[];
  notes?: string;
}

export function OrdersView({
  categories,
  menuItems,
  tables,
  orders,
  initialTableId,
  onNavigate,
  onRefresh,
}: OrdersViewProps) {
  const [viewMode, setViewMode] = useState<'pos' | 'history'>('pos');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId || 'table-5');
  const [cart, setCart] = useState<CartItemDraft[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Customize item modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [tempVariant, setTempVariant] = useState<SelectedVariant | undefined>();
  const [tempAddons, setTempAddons] = useState<SelectedAddon[]>([]);
  const [tempNotes, setTempNotes] = useState('');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategoryId === 'ALL' || item.category_id === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate totals
  const subtotal = cart.reduce((acc, c) => {
    const base = c.variant ? c.variant.price : c.menuItem.price;
    const addPrice = (c.addons || []).reduce((a, ad) => a + ad.price, 0);
    return acc + (base + addPrice) * c.quantity;
  }, 0);

  const discount = Math.min(subtotal, Math.max(0, discountAmount));
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.05 * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  const handleOpenCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    if (item.variants && item.variants.length > 0) {
      setTempVariant({ variant_id: item.variants[0].id, name: item.variants[0].name, price: item.variants[0].price });
    } else {
      setTempVariant(undefined);
    }
    setTempAddons([]);
    setTempNotes('');
  };

  const handleAddDirect = (item: MenuItem) => {
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      handleOpenCustomize(item);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id && !c.variant && (!c.addons || c.addons.length === 0));
      if (existing) {
        return prev.map((c) => (c === existing ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleConfirmCustomize = () => {
    if (!customizingItem) return;
    setCart((prev) => [
      ...prev,
      {
        menuItem: customizingItem,
        quantity: 1,
        variant: tempVariant,
        addons: tempAddons,
        notes: tempNotes.trim() || undefined,
      },
    ]);
    setCustomizingItem(null);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const target = updated[index];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...target, quantity: newQty };
      }
      return updated;
    });
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderPayload = {
        table_id: selectedTableId,
        source: 'POS' as const,
        discount,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
          notes: c.notes,
          variant: c.variant,
          addons: c.addons,
        })),
      };

      const order = await api.createOrder(orderPayload);
      setSuccessMessage(`Order #${order.order_number} submitted! Sent to Kitchen KDS and Table marked Occupied.`);
      setCart([]);
      setDiscountAmount(0);
      onRefresh();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (e: any) {
      alert(e.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top POS / Orders Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Restaurant POS & Orders</h1>
          <p className="text-xs text-stone-500">
            Speed-optimized order entry, kitchen ticket dispatch, and guest billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('pos')}
            className={`px-3 py-1.5 text-xs rounded-md font-bold transition-colors ${
              viewMode === 'pos'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Active POS Terminal
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1.5 text-xs rounded-md font-bold transition-colors ${
              viewMode === 'history'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Order Master List ({orders.length})
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={() => onNavigate('kds')}
            className="h-6 px-2 text-[11px] bg-emerald-800 text-white"
          >
            View on KDS →
          </Button>
        </div>
      )}

      {viewMode === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
          {/* LEFT: Categories Sidebar (2 cols) */}
          <div className="lg:col-span-2 bg-stone-100/80 p-2.5 rounded-xl border border-stone-200 space-y-1.5 h-full">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2 block mb-1">
              Menu Sections
            </span>
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                selectedCategoryId === 'ALL'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              <span>All Items</span>
              <span className="text-[10px] opacity-75">{menuItems.length}</span>
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((m) => m.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategoryId === cat.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-200/70'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-75">{count}</span>
                </button>
              );
            })}
          </div>

          {/* CENTER: Items Catalog (6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search dishes by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[540px] pr-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddDirect(item)}
                  className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-3 hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border ${
                            item.vegetarian
                              ? 'bg-emerald-600 border-emerald-700'
                              : 'bg-rose-600 border-rose-700'
                          }`}
                          title={item.vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <h4 className="text-xs font-bold text-stone-900 leading-snug group-hover:text-emerald-900">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold text-stone-900 font-mono">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-[11px]">
                    <span className="text-stone-400">⏱ {item.preparation_time} mins</span>
                    <button
                      type="button"
                      className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Current Order Cart (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl flex flex-col justify-between shadow-xs overflow-hidden">
            {/* Cart Header with Table selector */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-800" />
                  Active POS Ticket
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </div>

              {/* Table Picker */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-stone-600 whitespace-nowrap">Table:</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full text-xs font-semibold py-1 px-2 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {tables.map((tbl) => (
                    <option key={tbl.id} value={tbl.id}>
                      {tbl.table_number} ({tbl.capacity} seats) — {tbl.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[320px] divide-y divide-stone-100">
              {cart.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-stone-400 text-xs">
                  <ShoppingBag className="w-8 h-8 text-stone-300 mb-1" />
                  <span>No items added to ticket</span>
                  <span className="text-[11px] text-stone-400">Click dishes from the center menu</span>
                </div>
              ) : (
                cart.map((cartItem, idx) => {
                  const basePrice = cartItem.variant ? cartItem.variant.price : cartItem.menuItem.price;
                  const addonsPrice = (cartItem.addons || []).reduce((a, ad) => a + ad.price, 0);
                  const itemTotal = (basePrice + addonsPrice) * cartItem.quantity;

                  return (
                    <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h5 className="text-xs font-bold text-stone-900 leading-tight">
                          {cartItem.menuItem.name}
                        </h5>
                        {cartItem.variant && (
                          <span className="text-[11px] text-stone-600 font-medium block">
                            Option: {cartItem.variant.name}
                          </span>
                        )}
                        {cartItem.addons && cartItem.addons.length > 0 && (
                          <span className="text-[10px] text-emerald-800 block">
                            Add-ons: {cartItem.addons.map((a) => a.name).join(', ')}
                          </span>
                        )}
                        {cartItem.notes && (
                          <span className="text-[10px] text-amber-700 italic block">
                            Note: {cartItem.notes}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-stone-900">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1.5 bg-stone-100 rounded-md p-1">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="w-5 h-5 rounded bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="w-5 h-5 rounded bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations & Submit Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Apply Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 text-right text-xs py-0.5 px-1 border border-stone-300 rounded bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>GST (5%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold text-stone-900 pt-1.5 border-t border-stone-200">
                <span>Payable Total</span>
                <span className="text-emerald-900 font-mono text-base">{formatCurrency(total)}</span>
              </div>

              <Button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSendToKitchen}
                className="w-full h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs gap-1.5 mt-1 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Ticket...' : 'Send Order to Kitchen'}</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Order History View */
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Centralized Order Registry</span>
            <span className="text-xs text-stone-500">QR, POS & Waiter Engine</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Table</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Items Summary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80">
                    <td className="p-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                    <td className="p-3 font-semibold">{ord.table_number}</td>
                    <td className="p-3">
                      <span className="bg-stone-100 text-stone-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {ord.source}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate text-stone-600">
                      {ord.items.map((it) => `${it.quantity}× ${it.menu_item_name}`).join(', ')}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          ord.status === 'PAID'
                            ? 'success'
                            : ord.status === 'READY'
                            ? 'info'
                            : ord.status === 'PREPARING'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900">{formatCurrency(ord.total)}</td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          ord.payment_status === 'SUCCESS' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate('billing', { orderId: ord.id })}
                        className="h-7 text-[11px]"
                      >
                        Bill
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Customizer Modal */}
      <Dialog
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        title={customizingItem ? customizingItem.name : ''}
        description="Select portion variant, add-ons, or custom chef notes."
      >
        {customizingItem && (
          <div className="space-y-4 text-xs">
            {/* Variants */}
            {customizingItem.variants && customizingItem.variants.length > 0 && (
              <div>
                <span className="font-bold text-stone-700 block mb-1.5">Portion / Variant</span>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setTempVariant({ variant_id: v.id, name: v.name, price: v.price })}
                      className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                        tempVariant?.variant_id === v.id
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-800'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{v.name}</span>
                        <span className="font-mono">{formatCurrency(v.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {customizingItem.addons && customizingItem.addons.length > 0 && (
              <div>
                <span className="font-bold text-stone-700 block mb-1.5">Optional Add-ons</span>
                <div className="space-y-1.5">
                  {customizingItem.addons.map((add) => {
                    const isSelected = tempAddons.some((a) => a.addon_id === add.id);
                    return (
                      <button
                        key={add.id}
                        onClick={() => {
                          if (isSelected) {
                            setTempAddons(tempAddons.filter((a) => a.addon_id !== add.id));
                          } else {
                            setTempAddons([...tempAddons, { addon_id: add.id, name: add.name, price: add.price }]);
                          }
                        }}
                        className={`w-full p-2 rounded-lg border text-left font-medium transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-50/70 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <span>{add.name}</span>
                        <span className="font-mono">+{formatCurrency(add.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <span className="font-bold text-stone-700 block mb-1.5">Kitchen Note</span>
              <Input
                placeholder="e.g. Less oil, extra green chilies, allergy alert"
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold mt-2"
              onClick={handleConfirmCustomize}
            >
              Add to Ticket
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
