import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UtensilsCrossed,
  QrCode,
  ChefHat,
  Receipt,
  BarChart3,
  Brain,
  ArrowRight,
  CheckCircle2,
  Table2,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Smartphone,
  Check,
  Star,
  Activity,
  CreditCard,
  Building2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onOpenCustomerQr: () => void;
}

export function LandingPage({ onLaunchDemo, onOpenCustomerQr }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'kds' | 'floor' | 'billing' | 'qr'>('kds');

  return (
    <div className="space-y-20 py-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
            R
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-stone-900 tracking-tight">RestOS</span>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded tracking-wide">
              LITE
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
          <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-stone-900 transition-colors">Workflow</a>
          <a href="#architecture" className="hover:text-stone-900 transition-colors">Architecture</a>
          <a href="#pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCustomerQr}
            className="text-xs font-bold border-stone-300 text-stone-700 hidden sm:flex"
          >
            <Smartphone className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            Guest QR View
          </Button>

          <Button
            size="sm"
            onClick={onLaunchDemo}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm"
          >
            Launch Console →
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>The Next-Generation Restaurant Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight"
        >
          One unified system for your entire dining room.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed"
        >
          Eliminate disconnected billing hardware, paper KOT tickets, and manual UPI reconciliation. RestOS Lite coordinates customer QR orders, kitchen displays, table turns, and payment settlement on a single real-time ledger.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Button
            size="lg"
            onClick={onLaunchDemo}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md h-11 px-6 gap-2"
          >
            <span>Enter Staff Console</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onOpenCustomerQr}
            className="border-stone-300 text-stone-800 hover:bg-stone-50 font-bold text-sm h-11 px-5 gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-800" />
            <span>Simulate Customer QR Scan</span>
          </Button>
        </motion.div>

        {/* Value Prop Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-stone-500">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Zero Hardware Lock-In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Sub-second SSE Real-time Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Direct UPI Intent Deep Links</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Deterministic RestIQ Insights</span>
          </div>
        </div>
      </section>

      {/* Interactive Live Product Preview Showcase */}
      <section className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Interactive System Preview
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              Experience the core modules in action
            </h3>
          </div>

          {/* Module Tab Selector */}
          <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700 overflow-x-auto no-scrollbar">
            {[
              { id: 'kds', label: 'Kitchen Display', icon: ChefHat },
              { id: 'floor', label: 'Floor Plan', icon: Table2 },
              { id: 'billing', label: 'UPI Settlement', icon: Receipt },
              { id: 'qr', label: 'Mobile QR Menu', icon: Smartphone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-stone-950 rounded-xl p-5 border border-stone-800 min-h-[280px] flex flex-col justify-center">
          {activePreviewTab === 'kds' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">KITCHEN LINE • 3 ACTIVE TICKETS</span>
                <span className="text-stone-400">Elapsed: 04:12m</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-stone-900 p-3 rounded-lg border-2 border-amber-500/80 space-y-2">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-amber-400">#ORD-1041</span>
                    <span className="bg-amber-500/20 text-amber-300 px-1.5 rounded text-[10px]">NEW</span>
                  </div>
                  <span className="font-extrabold text-white block">Table T-05</span>
                  <p className="text-stone-400 text-[11px]">2× Dahi Ke Kebab • 1× Dal Makhani</p>
                  <span className="text-[10px] text-amber-200 block italic">Note: Less spicy</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-lg border-2 border-blue-500/80 space-y-2">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-blue-400">#ORD-1040</span>
                    <span className="bg-blue-500/20 text-blue-300 px-1.5 rounded text-[10px]">PREPARING</span>
                  </div>
                  <span className="font-extrabold text-white block">Table T-02</span>
                  <p className="text-stone-400 text-[11px]">2× Butter Naan • 1× Paneer Tikka</p>
                  <span className="text-[10px] text-blue-300 block">Chef preparing on Station 2</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-lg border-2 border-emerald-500/80 space-y-2">
                  <div className="flex justify-between font-mono font-bold">
                    <span className="text-emerald-400">#ORD-1039</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 rounded text-[10px]">READY</span>
                  </div>
                  <span className="font-extrabold text-white block">Table T-08</span>
                  <p className="text-stone-400 text-[11px]">1× Alphonso Mango Lassi • 1× Biryani</p>
                  <span className="text-[10px] text-emerald-400 font-bold block">Ready for runner pickup</span>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'floor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">LIVE FLOOR PLAN • 10 TABLES</span>
                <span className="text-stone-400">4 Occupied • 5 Available • 1 Billed</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {['T-01 (Free)', 'T-02 (Dine)', 'T-03 (Free)', 'T-04 (Free)', 'T-05 (Dine)', 'T-06 (Free)', 'T-07 (Dine)', 'T-08 (Bill Due)', 'T-09 (Free)', 'T-10 (Free)'].map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-center font-bold ${
                      t.includes('Dine')
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                        : t.includes('Bill')
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                        : 'bg-stone-900 border-stone-700 text-stone-400'
                    }`}
                  >
                    <span className="block">{t.split(' ')[0]}</span>
                    <span className="text-[10px] font-medium opacity-75">{t.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePreviewTab === 'billing' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-2">
                <span className="text-emerald-400 font-mono font-bold block">TAX INVOICE #INV-1041</span>
                <div className="text-stone-300 space-y-1">
                  <div className="flex justify-between gap-6"><span>Subtotal:</span><span className="font-mono">₹900.00</span></div>
                  <div className="flex justify-between gap-6"><span>GST (5%):</span><span className="font-mono">₹45.00</span></div>
                  <div className="flex justify-between gap-6 font-extrabold text-white text-sm border-t border-stone-800 pt-1">
                    <span>Total Due:</span><span className="font-mono text-emerald-400">₹945.00</span>
                  </div>
                </div>
              </div>
              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-center space-y-1.5">
                <span className="text-[10px] text-stone-400 block font-mono">UPI INTENT DEEP LINK</span>
                <code className="text-[11px] text-emerald-300 block bg-black/40 px-2 py-1 rounded max-w-xs truncate">
                  upi://pay?pa=thegreentable@okaxis&am=945.00
                </code>
                <span className="text-[10px] text-stone-500 block">Instant deep link opens GPay / PhonePe / Paytm</span>
              </div>
            </div>
          )}

          {activePreviewTab === 'qr' && (
            <div className="text-center space-y-2">
              <span className="text-xs font-mono text-emerald-400 block font-bold">CUSTOMER MOBILE QR ORDERING</span>
              <p className="text-xs text-stone-300 max-w-md mx-auto">
                No app download needed. Diners point their smartphone camera at the table tent card to browse photos, customize spices, choose portion sizes, and submit orders directly to line cooks.
              </p>
              <Button
                size="sm"
                onClick={onOpenCustomerQr}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold mt-2"
              >
                Open Simulated Customer View →
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Product Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Engineered for high-volume, independent dining operations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Table2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Visual Floor Plan</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Color-coded table states (Available, Dining, Bill Due) with drag-to-rearrange floor layouts and 1-click bill settlement.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Kitchen Display System (KDS)</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Eliminate paper tickets. Cook stations track prep times, audible chimes alert on incoming tickets, and dish modifiers are clearly emphasized.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Dynamic UPI Intent & QR</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Generates genuine `upi://pay` intent URLs and dynamic amount-encoded QR codes. Releases tables immediately upon settlement without soundbox lag.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Continuous Analytics</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Live gross revenue velocity, AOV trends, top selling dishes, and peak dining hours computed automatically from your database.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-800" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">RestIQ Smart Insights</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              No generic chatbot filler. 100% deterministic operational intelligence: menu engineering matrix, prep speed bottlenecks, and cross-sell combos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Role-Based Access (RBAC)</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tailored views for Owner, Manager, Cashier, Kitchen, or Waiter profiles with instant client and server permission boundary validation.
            </p>
          </div>
        </div>
      </section>

      {/* Operator Testimonials */}
      <section className="bg-stone-50 rounded-2xl p-8 border border-stone-200 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Trusted by Operators
          </span>
          <h3 className="text-xl font-extrabold text-stone-900">
            Real impact on daily service velocity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-stone-600 italic leading-relaxed">
              "Switching from physical paper KOTs to RestOS KDS shaved 7 minutes off our starter prep times on Friday dinner rush."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <span className="font-bold text-stone-900 block">Chef Rohan V.</span>
              <span className="text-[11px] text-stone-500">The Saffron Table, Indiranagar</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-stone-600 italic leading-relaxed">
              "The dynamic UPI intent link is a game changer. Customers pay on their phone without waiting for the waiter to bring a card machine."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <span className="font-bold text-stone-900 block">Ananya K.</span>
              <span className="text-[11px] text-stone-500">Managing Partner, Coast & Co.</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-stone-600 italic leading-relaxed">
              "RestIQ flagged that our Mango Lassi had a 44% attach rate on starters. We paired it on the menu and saw beverage revenue jump 18%."
            </p>
            <div className="pt-2 border-t border-stone-100">
              <span className="font-bold text-stone-900 block">Vikram Mehta</span>
              <span className="text-[11px] text-stone-500">General Manager, Brew & Hearth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section id="pricing" className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Fair, predictable pricing for growing restaurants
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
            <div>
              <h4 className="font-extrabold text-stone-900 text-base">Starter</h4>
              <p className="text-xs text-stone-500 mt-1">For small cafés and quick-service counters.</p>
              <div className="mt-3">
                <span className="text-2xl font-extrabold font-mono text-stone-900">₹0</span>
                <span className="text-xs text-stone-500"> / month</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> Up to 5 tables</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> POS Terminal</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> Dynamic UPI Payments</li>
            </ul>
            <Button variant="outline" className="w-full text-xs font-bold" onClick={onLaunchDemo}>
              Get Started
            </Button>
          </div>

          <div className="bg-stone-900 text-white p-6 rounded-xl border-2 border-emerald-600 shadow-xl space-y-4 relative">
            <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h4 className="font-extrabold text-white text-base">Growth Pro</h4>
              <p className="text-xs text-stone-400 mt-1">For busy full-service restaurants.</p>
              <div className="mt-3">
                <span className="text-2xl font-extrabold font-mono text-white">₹1,999</span>
                <span className="text-xs text-stone-400"> / month</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited tables & floor layout</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Real-time Kitchen Display (KDS)</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> QR Tent Card Generator</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> RestIQ Smart Insights Engine</li>
            </ul>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold" onClick={onLaunchDemo}>
              Launch Shift Demo
            </Button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
            <div>
              <h4 className="font-extrabold text-stone-900 text-base">Multi-Outlet</h4>
              <p className="text-xs text-stone-500 mt-1">For expanding hospitality groups & chains.</p>
              <div className="mt-3">
                <span className="text-2xl font-extrabold font-mono text-stone-900">Custom</span>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> Multi-branch centralized ledger</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> Custom ERP / Accounting exports</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-700" /> Dedicated account manager</li>
            </ul>
            <Button variant="outline" className="w-full text-xs font-bold" onClick={onLaunchDemo}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-emerald-800 text-white rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Experience RestOS Lite live in action
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
          Open the operational shift console, inspect live table states, and watch real-time order progression from QR scan to UPI payment.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={onLaunchDemo}
            className="bg-white text-emerald-950 hover:bg-stone-100 font-extrabold text-xs h-10 px-5 shadow-md"
          >
            Launch Operating Console →
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onOpenCustomerQr}
            className="border-emerald-600 text-white hover:bg-emerald-900 font-bold text-xs h-10 px-4"
          >
            Open Guest Menu
          </Button>
        </div>
      </section>
    </div>
  );
}
