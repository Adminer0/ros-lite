import React, { useState, useEffect, useRef } from 'react';
import {
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Order, Invoice, PaymentMethod, Restaurant } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Dialog } from '../ui/Dialog';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { gsapMotion } from '../../lib/animations';

interface BillingViewProps {
  orders: Order[];
  restaurant: Restaurant;
  selectedOrderId?: string;
  onNavigate: (route: string, params?: any) => void;
  onRefresh: () => void;
}

export function BillingView({
  orders,
  restaurant,
  selectedOrderId,
  onNavigate,
  onRefresh,
}: BillingViewProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiData, setUpiData] = useState<{
    upiIntentUrl: string;
    qrDataUrl: string;
    vpa: string;
    payeeName: string;
    amount: number;
    orderNumber: string;
  } | null>(null);
  const [isLoadingUpi, setIsLoadingUpi] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Set active order if passed from floor/orders
  useEffect(() => {
    if (selectedOrderId) {
      const match = orders.find((o) => o.id === selectedOrderId);
      if (match) setActiveOrder(match);
    } else if (!activeOrder && orders.length > 0) {
      // Pick the first unbilled or billed order
      const pending = orders.find((o) => o.status !== 'PAID' && o.status !== 'CANCELLED');
      if (pending) setActiveOrder(pending);
    }
  }, [selectedOrderId, orders]);

  // GSAP animation on active order change
  useEffect(() => {
    if (receiptRef.current && activeOrder) {
      gsapMotion.unfoldReceipt(receiptRef.current);
    }
  }, [activeOrder?.id]);

  // GSAP animation for payment success notice
  useEffect(() => {
    if (noticeRef.current && paymentSuccessNotice) {
      gsapMotion.slideNotification(noticeRef.current);
    }
  }, [paymentSuccessNotice]);

  const handleSelectOrder = (ord: Order) => {
    setActiveOrder(ord);
    setDiscountInput(ord.discount || 0);
  };

  const handleOpenUPI = async (order: Order) => {
    setIsLoadingUpi(true);
    setShowUpiModal(true);
    try {
      const data = await api.getUPIInfo(order.id);
      setUpiData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingUpi(false);
    }
  };

  const handleConfirmDemoPayment = async (orderId: string, method: PaymentMethod) => {
    setIsProcessingPayment(true);
    try {
      const res = await api.confirmDemoPayment(orderId, method);
      setPaymentSuccessNotice(
        `Payment verified (${method}). Order status set to PAID. Table has returned to AVAILABLE!`
      );
      setShowUpiModal(false);
      onRefresh();

      // Refresh local active order
      setTimeout(() => {
        setPaymentSuccessNotice(null);
      }, 6000);
    } catch (e: any) {
      alert(e.message || 'Payment confirmation failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Billing & Payments</h1>
          <p className="text-xs text-stone-500">
            GST compliant invoicing, instant UPI Intent / Dynamic QR settlement, and cash drawer management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} className="h-8 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Refresh Invoices
          </Button>
        </div>
      </div>

      {paymentSuccessNotice && (
        <div ref={noticeRef} className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{paymentSuccessNotice}</span>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate('floor')}
            className="h-7 px-3 bg-emerald-800 text-white text-xs font-bold shrink-0 ml-3"
          >
            Check Floor Plan →
          </Button>
        </div>
      )}

      {/* Main Billing Grid: Order List (Left) + Invoice Checkout Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Orders Awaiting Settlement (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Active Dining Tickets ({orders.filter((o) => o.status !== 'PAID').length})
            </span>
            <span className="text-[11px] text-stone-500 font-medium">Select to Bill</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              const isPaid = ord.status === 'PAID';

              return (
                <div
                  key={ord.id}
                  onClick={() => handleSelectOrder(ord)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-800'
                      : isPaid
                      ? 'border-stone-200 bg-stone-50/60 opacity-75 hover:opacity-100'
                      : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-stone-900">
                          {ord.order_number}
                        </span>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          Table {ord.table_number}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-1">
                        {ord.items.length} item{ord.items.length > 1 ? 's' : ''} • {ord.source}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold font-mono text-stone-900 block">
                        {formatCurrency(ord.total)}
                      </span>
                      <Badge
                        variant={
                          isPaid
                            ? 'success'
                            : ord.status === 'BILLED'
                            ? 'purple'
                            : ord.status === 'READY'
                            ? 'info'
                            : 'secondary'
                        }
                        className="mt-1"
                      >
                        {ord.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Invoice Preview & Payment Gate (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-5 space-y-4 shadow-xs">
          {activeOrder ? (
            <div ref={receiptRef} className="space-y-4">
              {/* Receipt Header */}
              <div className="flex items-start justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                    {restaurant.name}
                  </h3>
                  <p className="text-[11px] text-stone-500">{restaurant.address}</p>
                  <p className="text-[11px] text-stone-500 font-mono">GSTIN: {restaurant.gst_number}</p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-stone-900 block">
                    TAX INVOICE #{activeOrder.order_number.replace('ORD-', 'INV-')}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    Table {activeOrder.table_number} • {new Date(activeOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                      activeOrder.payment_status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    PAYMENT {activeOrder.payment_status}
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {activeOrder.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/60">
                        <td className="p-2.5 text-stone-900">
                          <span className="font-semibold block">{it.menu_item_name}</span>
                          {it.variant && <span className="text-[10px] text-stone-500">Option: {it.variant.name}</span>}
                          {it.notes && <span className="text-[10px] text-amber-700 italic block">Chef Note: {it.notes}</span>}
                        </td>
                        <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-stone-600">{formatCurrency(it.unit_price)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-stone-900">
                          {formatCurrency(it.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(activeOrder.subtotal)}</span>
                </div>

                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Special Discount</span>
                    <span className="font-mono">-{formatCurrency(activeOrder.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>GST ({restaurant.tax_percentage}%)</span>
                  <span className="font-mono">{formatCurrency(activeOrder.tax)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-300">
                  <span>Grand Total Payable</span>
                  <span className="font-mono text-emerald-900">{formatCurrency(activeOrder.total)}</span>
                </div>
              </div>

              {/* Payment Settlement Methods */}
              {activeOrder.status !== 'PAID' ? (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    Choose Settlement Method
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* UPI Option */}
                    <button
                      onClick={() => handleOpenUPI(activeOrder)}
                      className="p-3 rounded-xl border-2 border-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-900 block group-hover:text-emerald-900">
                          UPI QR & Intent URL
                        </span>
                        <span className="text-[11px] text-stone-500 leading-snug block mt-0.5">
                          Instant scan with GPay, PhonePe, Paytm or UPI Intent
                        </span>
                      </div>
                    </button>

                    {/* Cash Option */}
                    <button
                      onClick={() => handleConfirmDemoPayment(activeOrder.id, 'CASH')}
                      className="p-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-left transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-900 block group-hover:text-stone-950">
                          Cash Payment
                        </span>
                        <span className="text-[11px] text-stone-500 leading-snug block mt-0.5">
                          Collect physical cash at register
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>This ticket is fully settled & marked PAID. Table is freed.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-7 text-xs bg-white"
                  >
                    <Printer className="w-3 h-3 mr-1" />
                    Print Receipt
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs italic">
              Select an active ticket from the left panel to preview invoice
            </div>
          )}
        </div>
      </div>

      {/* UPI Intent & Dynamic QR Modal */}
      <Dialog
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        title="UPI Payment Gateway & Dynamic QR"
        description="Scan with any UPI app (Google Pay, PhonePe, Paytm, BHIM) or tap intent link."
      >
        {activeOrder && (
          <div className="space-y-4 text-center">
            {isLoadingUpi ? (
              <div className="py-8 text-stone-400 text-xs">Generating verified UPI payload...</div>
            ) : upiData ? (
              <div className="space-y-4">
                {/* Dynamic QR Display */}
                <div className="bg-white p-4 rounded-xl border border-stone-200 inline-block shadow-inner">
                  <img
                    src={upiData.qrDataUrl}
                    alt="UPI Dynamic QR Code"
                    className="w-52 h-52 mx-auto rounded-lg"
                  />
                  <span className="text-[11px] font-mono font-bold text-stone-700 block mt-2">
                    VPA: {upiData.vpa}
                  </span>
                </div>

                {/* Amount and Order Detail */}
                <div>
                  <span className="text-2xl font-extrabold font-mono text-stone-900 block">
                    {formatCurrency(activeOrder.total)}
                  </span>
                  <span className="text-xs text-stone-500">
                    Order {activeOrder.order_number} • {restaurant.name}
                  </span>
                </div>

                {/* Direct UPI Intent Link for mobile / simulator */}
                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-left text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                    <span>UPI Intent URI</span>
                    <a
                      href={upiData.upiIntentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 flex items-center gap-1 hover:underline"
                    >
                      Launch UPI App <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <code className="text-[10px] text-stone-500 break-all font-mono block bg-stone-100 p-1.5 rounded">
                    {upiData.upiIntentUrl}
                  </code>
                </div>

                {/* Controlled Demo Settlement Notice & Action */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Controlled Demo Mode Verification
                      </span>
                      <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                        For this YIIC product prototype, the real UPI intent QR is live. You can simulate the verified webhook settlement by clicking below to advance order to PAID and free the table.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleConfirmDemoPayment(activeOrder.id, 'UPI_QR')}
                    disabled={isProcessingPayment}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>
                      {isProcessingPayment ? 'Verifying Transaction...' : 'Confirm Demo UPI Payment (Success)'}
                    </span>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </div>
  );
}
