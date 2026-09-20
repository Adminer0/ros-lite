import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChefHat,
  Receipt,
  QrCode,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  Restaurant,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  Order,
  SelectedVariant,
  SelectedAddon,
} from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Dialog } from '../ui/Dialog';
import { Sheet } from '../ui/Sheet';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';

interface CustomerOrderViewProps {
  restaurant: Restaurant;
  table: RestaurantTable;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onBackToStaff: () => void;
  onOrderPlaced?: (order: Order) => void;
}

interface CustomerCartItem {
  menuItem: MenuItem;
  quantity: number;
  variant?: SelectedVariant;
  addons?: SelectedAddon[];
  notes?: string;
}

export function CustomerOrderView({
  restaurant,
  table,
  categories,
  menuItems,
  onBackToStaff,
  onOrderPlaced,
}: CustomerOrderViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Customizer modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [tempVariant, setTempVariant] = useState<SelectedVariant | undefined>();
  const [tempAddons, setTempAddons] = useState<SelectedAddon[]>([]);
  const [tempNotes, setTempNotes] = useState('');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    if (!item.available) return false;
    const matchesCat = selectedCategory === 'ALL' || item.category_id === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesVeg = !vegOnly || item.vegetarian;
    return matchesCat && matchesSearch && matchesVeg;
  });

  const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const subtotal = cart.reduce((acc, c) => {
    const base = c.variant ? c.variant.price : c.menuItem.price;
    const adds = (c.addons || []).reduce((a, ad) => a + ad.price, 0);
    return acc + (base + adds) * c.quantity;
  }, 0);
  const tax = Math.round(subtotal * (restaurant.tax_percentage / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

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

  const handleAddItem = (item: MenuItem) => {
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      handleOpenCustomize(item);
      return;
    }

    setCart((prev) => {
      const exist = prev.find((c) => c.menuItem.id === item.id && !c.variant && (!c.addons || c.addons.length === 0));
      if (exist) {
        return prev.map((c) => (c === exist ? { ...c, quantity: c.quantity + 1 } : c));
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

  const handleUpdateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const target = copy[idx];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        copy.splice(idx, 1);
      } else {
        copy[idx] = { ...target, quantity: newQty };
      }
      return copy;
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const order = await api.createOrder({
        table_id: table.id,
        source: 'QR',
        customer_name: guestName.trim() || undefined,
        customer_phone: guestPhone.trim() || undefined,
        items: cart.map((c) => ({
          menu_item_id: c.menuItem.id,
          quantity: c.quantity,
          notes: c.notes,
          variant: c.variant,
          addons: c.addons,
        })),
      });

      setPlacedOrder(order);
      setCart([]);
      setIsCartOpen(false);
      if (onOrderPlaced) onOrderPlaced(order);
    } catch (e: any) {
      alert(e.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200 shadow-xl flex flex-col justify-between relative pb-20">
      {/* Customer Mobile Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="p-3 flex items-center justify-between">
          <button
            onClick={onBackToStaff}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider block">
              Table {table.table_number}
            </span>
            <span className="text-xs font-bold text-stone-900 leading-none block">
              {restaurant.name}
            </span>
          </div>
        </div>

        {/* Search & Veg Filter */}
        <div className="px-3 pb-3 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <Input
              placeholder="Search food or beverage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8 bg-stone-50"
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Category horizontal pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-[280px]">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                vegOnly ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-white text-stone-600 border-stone-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Veg</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 space-y-3">
        {placedOrder ? (
          /* Real-Time Order Placed Confirmation Card */
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 text-center shadow-lg space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 block">
                ORDER #{placedOrder.order_number}
              </span>
              <h2 className="text-lg font-extrabold text-stone-900">
                Order Sent to Kitchen!
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Your dishes are being prepared fresh at {restaurant.name}.
              </p>
            </div>

            {/* Live Progress Stages */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Order Placed & Confirmed</span>
              </div>
              <div className="flex items-center gap-2.5 text-blue-700 font-bold">
                <ChefHat className="w-4 h-4 text-blue-600 animate-bounce" />
                <span>Kitchen Preparing Dishes</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-400">
                <Clock className="w-4 h-4" />
                <span>Ready for Table Delivery</span>
              </div>
            </div>

            {/* Placed Items Summary */}
            <div className="text-left text-xs border-t border-stone-200 pt-3 space-y-1">
              <span className="font-bold text-stone-700 block mb-1">Your Order Items:</span>
              {placedOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-stone-600">
                  <span>
                    {it.quantity} × {it.menu_item_name}
                  </span>
                  <span className="font-mono font-semibold">{formatCurrency(it.total_price)}</span>
                </div>
              ))}
              <div className="flex justify-between font-extrabold text-stone-900 pt-1 border-t border-stone-100 text-sm">
                <span>Total Amount</span>
                <span>{formatCurrency(placedOrder.total)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-10"
              onClick={() => setPlacedOrder(null)}
            >
              Order More Items
            </Button>
          </div>
        ) : (
          /* Dish Catalog */
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddItem(item)}
                className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs hover:border-emerald-600 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`w-2 h-2 rounded-full border ${
                        item.vegetarian ? 'bg-emerald-600 border-emerald-700' : 'bg-rose-600 border-rose-700'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-stone-900">{item.name}</h3>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span className="font-mono font-extrabold text-stone-900">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-stone-400">⏱ {item.preparation_time}m</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Cart Footer Bar */}
      {cartCount > 0 && !placedOrder && (
        <div className="fixed bottom-3 inset-x-0 max-w-md mx-auto px-3 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl p-3 shadow-lg flex items-center justify-between transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-950 flex items-center justify-center font-bold text-xs">
                {cartCount}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold block">View Dining Cart</span>
                <span className="text-[10px] text-emerald-200 font-mono">
                  {formatCurrency(total)} (incl. GST)
                </span>
              </div>
            </div>

            <span className="text-xs font-extrabold flex items-center gap-1">
              <span>Checkout</span>
              <span>→</span>
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer Sheet */}
      <Sheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`Table ${table.table_number} Dining Cart`}
        description={`${cartCount} items selected`}
      >
        <div className="space-y-4 text-xs">
          {/* Guest Info (Optional) */}
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-2">
            <span className="font-bold text-stone-700 block text-[11px]">Guest Details (Optional)</span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Your Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="text-xs h-8"
              />
              <Input
                placeholder="Mobile (for bill)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1 space-y-2">
            {cart.map((c, idx) => {
              const basePrice = c.variant ? c.variant.price : c.menuItem.price;
              const addsPrice = (c.addons || []).reduce((a, ad) => a + ad.price, 0);
              const itemTotal = (basePrice + addsPrice) * c.quantity;

              return (
                <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-stone-900 block">{c.menuItem.name}</span>
                    {c.variant && <span className="text-[11px] text-stone-500 block">({c.variant.name})</span>}
                    {c.addons && c.addons.length > 0 && (
                      <span className="text-[10px] text-emerald-800 block">
                        +{c.addons.map((a) => a.name).join(', ')}
                      </span>
                    )}
                    {c.notes && <span className="text-[10px] text-amber-700 block italic">Note: {c.notes}</span>}
                    <span className="font-mono font-bold text-stone-900 text-xs">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-100 rounded p-1">
                    <button
                      onClick={() => handleUpdateQty(idx, -1)}
                      className="w-5 h-5 bg-white rounded flex items-center justify-center text-stone-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs">{c.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(idx, 1)}
                      className="w-5 h-5 bg-white rounded flex items-center justify-center text-stone-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bill breakdown */}
          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>GST ({restaurant.tax_percentage}%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-stone-900 pt-1.5 border-t border-stone-200 text-sm">
              <span>Grand Total</span>
              <span className="text-emerald-900 font-mono">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11 text-xs shadow-md"
          >
            {isPlacingOrder ? 'Sending to Kitchen...' : `Place Order (₹${total})`}
          </Button>
        </div>
      </Sheet>

      {/* Item Customizer Modal */}
      <Dialog
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        title={customizingItem?.name || ''}
        description="Choose portions and add-ons"
      >
        {customizingItem && (
          <div className="space-y-4 text-xs">
            {customizingItem.variants && customizingItem.variants.length > 0 && (
              <div>
                <span className="font-bold text-stone-700 block mb-1.5">Select Portion</span>
                <div className="grid grid-cols-2 gap-2">
                  {customizingItem.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setTempVariant({ variant_id: v.id, name: v.name, price: v.price })}
                      className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                        tempVariant?.variant_id === v.id
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-stone-200 bg-white'
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

            {customizingItem.addons && customizingItem.addons.length > 0 && (
              <div>
                <span className="font-bold text-stone-700 block mb-1.5">Add-ons</span>
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
                          isSelected ? 'border-emerald-800 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 bg-white'
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

            <div>
              <span className="font-bold text-stone-700 block mb-1.5">Special Instructions</span>
              <Input
                placeholder="e.g. Less spicy, no butter"
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-9 mt-2"
              onClick={handleConfirmCustomize}
            >
              Add to Order
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
