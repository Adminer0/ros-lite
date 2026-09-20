import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Edit2,
  Tag,
  Utensils,
} from 'lucide-react';
import { MenuCategory, MenuItem } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Dialog } from '../ui/Dialog';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';

interface MenuViewProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  onRefresh: () => void;
}

export function MenuView({ categories, menuItems, onRefresh }: MenuViewProps) {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState(categories[0]?.id || '');
  const [newItemPrice, setNewItemPrice] = useState<number>(200);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemVeg, setNewItemVeg] = useState(true);
  const [newItemPrepTime, setNewItemPrepTime] = useState<number>(15);
  const [isSaving, setIsSaving] = useState(false);

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCat === 'ALL' || item.category_id === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesVeg = !vegOnly || item.vegetarian;
    return matchesCat && matchesSearch && matchesVeg;
  });

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleItemAvailability(id, !currentStatus);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsSaving(true);
    try {
      await api.addMenuItem({
        restaurant_id: 'the-green-table',
        category_id: newItemCat || categories[0]?.id,
        name: newItemName.trim(),
        description: newItemDesc.trim(),
        price: newItemPrice,
        vegetarian: newItemVeg,
        available: true,
        preparation_time: newItemPrepTime,
      });
      setShowAddModal(false);
      setNewItemName('');
      setNewItemDesc('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Menu Management</h1>
          <p className="text-xs text-stone-500">
            Catalog organization, instant 86-ing / item availability toggles, and pricing controls.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-8 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Menu Item
        </Button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <Input
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors whitespace-nowrap ${
              vegOnly
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category horizontal scroller */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-4 bg-white shadow-xs transition-all flex flex-col justify-between ${
              item.available ? 'border-stone-200' : 'border-stone-300 bg-stone-50/70 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border ${
                      item.vegetarian ? 'bg-emerald-600 border-emerald-700' : 'bg-rose-600 border-rose-700'
                    }`}
                  />
                  <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                </div>
                <span className="font-mono text-sm font-extrabold text-stone-900">
                  {formatCurrency(item.price)}
                </span>
              </div>

              <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {/* Variants and add-ons badges */}
              <div className="flex flex-wrap gap-1 mt-2">
                {item.variants && item.variants.length > 0 && (
                  <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                    {item.variants.length} portion variants
                  </span>
                )}
                {item.addons && item.addons.length > 0 && (
                  <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                    {item.addons.length} add-ons
                  </span>
                )}
                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {item.preparation_time}m
                </span>
              </div>
            </div>

            {/* Availability Toggle button */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.available ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-bold text-stone-600">
                  {item.available ? 'In Stock (Live)' : 'Sold Out / 86ed'}
                </span>
              </div>

              <Button
                size="sm"
                variant={item.available ? 'outline' : 'default'}
                onClick={() => handleToggleAvailability(item.id, item.available)}
                className={`h-7 px-2.5 text-[11px] font-bold ${
                  item.available
                    ? 'text-rose-700 border-rose-300 hover:bg-rose-50'
                    : 'bg-emerald-800 text-white hover:bg-emerald-900'
                }`}
              >
                {item.available ? 'Mark Out of Stock' : 'Mark In Stock'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Item Dialog */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Dish to Menu"
        description="Creates a new catalog item available in POS and Customer QR."
      >
        <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Dish Name *</label>
            <Input
              required
              placeholder="e.g. Malai Kofta Curry"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Category</label>
              <select
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 px-2.5 border border-stone-300 rounded-md bg-white text-stone-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Price (₹) *</label>
              <Input
                type="number"
                min="10"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Description</label>
            <Input
              placeholder="Short description of ingredients and preparation style..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Dietary</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewItemVeg(true)}
                  className={`flex-1 py-1.5 rounded border text-xs font-bold ${
                    newItemVeg ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-white border-stone-300'
                  }`}
                >
                  Pure Veg
                </button>
                <button
                  type="button"
                  onClick={() => setNewItemVeg(false)}
                  className={`flex-1 py-1.5 rounded border text-xs font-bold ${
                    !newItemVeg ? 'bg-rose-100 text-rose-900 border-rose-400' : 'bg-white border-stone-300'
                  }`}
                >
                  Non-Veg
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Prep Time (mins)</label>
              <Input
                type="number"
                min="2"
                max="60"
                value={newItemPrepTime}
                onChange={(e) => setNewItemPrepTime(parseInt(e.target.value) || 15)}
                className="text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-9 mt-3"
          >
            {isSaving ? 'Creating Dish...' : 'Add Item to Catalog'}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
