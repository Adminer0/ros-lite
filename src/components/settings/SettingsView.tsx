import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  QrCode,
  Printer,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard,
  Percent,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Restaurant, RestaurantTable } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { api } from '../../lib/api';

interface SettingsViewProps {
  restaurant: Restaurant;
  tables: RestaurantTable[];
  onNavigate: (route: string, params?: any) => void;
  onRefresh: () => void;
}

export function SettingsView({ restaurant, tables, onNavigate, onRefresh }: SettingsViewProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    slogan: restaurant.slogan || '',
    address: restaurant.address,
    phone: restaurant.phone,
    gst_number: restaurant.gst_number,
    tax_percentage: restaurant.tax_percentage,
    upi_vpa: restaurant.upi_vpa,
    currency: restaurant.currency,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<string>(tables[4]?.id || tables[0]?.id);
  const [tableQrDataUrl, setTableQrDataUrl] = useState<string>('');

  const activeTable = tables.find((t) => t.id === selectedTableForQr) || tables[0];

  // Generate Table QR
  useEffect(() => {
    if (!activeTable) return;
    const url = `${window.location.origin}/order/${restaurant.slug}/${activeTable.id}`;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 260,
      color: {
        dark: '#15803d',
        light: '#ffffff',
      },
    }).then(setTableQrDataUrl);
  }, [activeTable, restaurant.slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateRestaurant(formData);
      setSavedSuccess(true);
      onRefresh();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Restaurant Settings & QR Generation</h1>
          <p className="text-xs text-stone-500">
            Brand configuration, GST compliance, UPI merchant details, and table QR tent cards.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <Building2 className="w-4 h-4 text-emerald-800" />
                Restaurant Profile & Location
              </h3>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Restaurant Trading Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Slogan / Tagline</label>
                <Input
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Phone</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Address / Landmark</label>
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* GST & Tax Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <Percent className="w-4 h-4 text-emerald-800" />
                GST Tax & Invoicing Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">GSTIN Number</label>
                  <Input
                    required
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Applicable GST (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="28"
                    required
                    value={formData.tax_percentage}
                    onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* UPI Merchant VPA */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 pb-2 border-b border-stone-100">
                <CreditCard className="w-4 h-4 text-emerald-800" />
                UPI Merchant Virtual Payment Address (VPA)
              </h3>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Merchant UPI VPA (ID)</label>
                <Input
                  required
                  value={formData.upi_vpa}
                  onChange={(e) => setFormData({ ...formData, upi_vpa: e.target.value })}
                  placeholder="e.g. yourrestaurant@okaxis"
                  className="text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-stone-500 block mt-1">
                  Used dynamically to generate instant UPI QR codes and Intent URIs for guest settlement.
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-9 mt-4 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>{isSaving ? 'Updating...' : 'Save Restaurant Configuration'}</span>
            </Button>
          </form>
        </div>

        {/* Right: Table QR Tent Card Generator (5 cols) */}
        <div className="lg:col-span-5 bg-stone-50 p-5 rounded-xl border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-800" />
                Table QR Tent Card
              </span>
              <select
                value={selectedTableForQr}
                onChange={(e) => setSelectedTableForQr(e.target.value)}
                className="text-xs font-bold py-1 px-2 border border-stone-300 rounded bg-white text-stone-900"
              >
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.table_number} ({t.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            {/* Printable Tent Card Mockup */}
            <div className="mt-4 bg-white p-5 rounded-xl border-2 border-dashed border-stone-300 text-center shadow-xs space-y-3">
              <div>
                <span className="text-xs font-extrabold text-emerald-900 tracking-wider uppercase block">
                  {restaurant.name}
                </span>
                <span className="text-[11px] text-stone-500">{restaurant.slogan}</span>
              </div>

              {tableQrDataUrl ? (
                <div className="inline-block p-3 bg-stone-50 rounded-xl border border-stone-200 shadow-inner">
                  <img
                    src={tableQrDataUrl}
                    alt={`QR Code for Table ${activeTable?.table_number}`}
                    className="w-44 h-44 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 mx-auto flex items-center justify-center bg-stone-100 rounded-xl">
                  <QrCode className="w-10 h-10 text-stone-400" />
                </div>
              )}

              <div>
                <span className="text-base font-extrabold text-stone-900 block">
                  TABLE {activeTable?.table_number}
                </span>
                <span className="text-xs font-semibold text-emerald-800 block mt-0.5">
                  Scan to View Menu & Order
                </span>
                <span className="text-[10px] text-stone-400 block mt-1">
                  Powered by RestOS Lite
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3">
            <Button
              className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold h-9"
              onClick={() => {
                onNavigate('customer-order', {
                  restaurantId: restaurant.slug,
                  tableId: activeTable?.id,
                });
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open Customer Mobile Ordering View
            </Button>

            <Button
              variant="outline"
              className="w-full text-xs font-bold h-9 bg-white"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Table QR Standee
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
