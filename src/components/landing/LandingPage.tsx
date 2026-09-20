import React from 'react';
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
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onOpenCustomerQr: () => void;
}

export function LandingPage({ onLaunchDemo, onOpenCustomerQr }: LandingPageProps) {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>RestOS Lite • YIIC 2026 Production Prototype</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          One simple operating system for your restaurant.
        </h1>

        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          From QR-based table ordering to the kitchen line, billing counter, UPI settlement, and automated RestIQ intelligence — all unified on a single real-time ledger.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={onLaunchDemo}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md gap-2"
          >
            <span>Launch Operator Console</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onOpenCustomerQr}
            className="border-stone-300 text-stone-800 hover:bg-stone-100 font-bold text-sm gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-800" />
            <span>Test Customer QR (Table 5)</span>
          </Button>
        </div>

        {/* Highlight Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-stone-500">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Neon PostgreSQL Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>UPI Intent & Dynamic QR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Full KDS Workflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Deterministic RestIQ</span>
          </div>
        </div>
      </div>

      {/* The Problem We Solve */}
      <div className="bg-stone-900 text-white rounded-2xl p-8 max-w-5xl mx-auto shadow-xl">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            The Traditional Bottleneck
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Small restaurants juggle 4 disconnected tools every single shift.
          </h2>
          <p className="text-xs text-stone-400 mt-2 leading-relaxed">
            Paper KOTs get lost, UPI payments are matched manually from SMS alerts, floor capacity is guessed on whiteboards, and owner analytics exist only on paper registers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-rose-400 block">1. Paper KOT Chaos</span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Handwritten tickets smudge, kitchen prep times inflate, and items are forgotten.
            </p>
          </div>
          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-rose-400 block">2. Manual UPI Reconciling</span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Static soundboxes fail during rush hours, delaying table turnover by 8+ minutes.
            </p>
          </div>
          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-rose-400 block">3. Blind Floor Management</span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              No visual indication of dining vs billing tables leads to unseated guests waiting outside.
            </p>
          </div>
          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-rose-400 block">4. Zero Operational Insights</span>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              No visibility into recipe profitability, slow moving items, or peak kitchen hours.
            </p>
          </div>
        </div>
      </div>

      {/* The Complete RestOS Lite Workflow */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            End-To-End Architecture
          </span>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            The 6-Stage Continuous Service Loop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5">
          {[
            { step: '01', title: 'QR Menu', desc: 'Guest scans table QR code on phone' },
            { step: '02', title: 'Live Order', desc: 'Dishes customized & sent instantly' },
            { step: '03', title: 'Kitchen KDS', desc: 'Chefs view tickets & track prep timers' },
            { step: '04', title: 'Tax Invoice', desc: 'GST & breakdown calculated' },
            { step: '05', title: 'UPI Intent', desc: 'Dynamic QR scanned or intent opened' },
            { step: '06', title: 'Table Freed', desc: 'Table reset & RestIQ updated' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs space-y-1 text-center"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-900 font-extrabold text-xs mx-auto flex items-center justify-center font-mono">
                {item.step}
              </span>
              <h4 className="text-xs font-bold text-stone-900 pt-1">{item.title}</h4>
              <p className="text-[11px] text-stone-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            Core Modules
          </span>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Everything your staff needs to execute flawless shifts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Table2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Visual Floor Plan</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Color-coded table states (Available, Ordering, Occupied, Bill Due) with drag-to-rearrange floor layouts and 1-click bill drawer.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Kitchen Display (KDS)</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              3-stage visual queue (New, Preparing, Ready) with elapsed timers, audible chimes, and item checklists for line cooks.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Dynamic UPI & Billing</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Generates genuine `upi://pay` intent URLs and dynamic amount-encoded QR codes. Releases tables immediately upon settlement.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Continuous Analytics</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Live gross revenue velocity, AOV trends, top selling dishes, and peak dining hours with clean Recharts visualizers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">RestIQ Smart Insights</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              No generic AI chatbot fluff. Pure deterministic operational intelligence: menu engineering, prep speed, and cross-sell combos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Role-Aware Access Control</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Simulate Owner, Manager, Cashier, Kitchen, or Waiter profiles with instant permission boundary validation.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 max-w-3xl mx-auto text-center space-y-4">
        <h3 className="text-xl font-extrabold text-emerald-950">
          Ready to verify the 14-step prototype workflow?
        </h3>
        <p className="text-xs text-emerald-900 max-w-md mx-auto">
          Click below to enter the live operating console with preloaded Indiranagar restaurant demo data.
        </p>
        <Button
          size="lg"
          onClick={onLaunchDemo}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md"
        >
          Enter RestOS Lite Console →
        </Button>
      </div>
    </div>
  );
}
