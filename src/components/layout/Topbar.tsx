import React, { useState } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Menu,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { UserRole } from '../../types';

interface TopbarProps {
  currentRoute: string;
  onOpenMobileNav: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onSimulateTick: () => void;
  isSimulatingTick: boolean;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenGuide: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

const ROUTE_LABELS: Record<string, { title: string; section: string }> = {
  dashboard: { title: 'Shift Dashboard', section: 'Operations' },
  floor: { title: 'Floor & Table Plan', section: 'Operations' },
  orders: { title: 'POS Terminal', section: 'Operations' },
  kds: { title: 'Kitchen Display System', section: 'Operations' },
  billing: { title: 'Billing & Payments', section: 'Operations' },
  menu: { title: 'Menu Catalog', section: 'Management' },
  analytics: { title: 'Business Analytics', section: 'Management' },
  restiq: { title: 'RestIQ Smart Insights', section: 'Management' },
  settings: { title: 'Settings & QR Standees', section: 'Management' },
  landing: { title: 'Product Overview', section: 'Public' },
};

export function Topbar({
  currentRoute,
  onOpenMobileNav,
  isSimulating,
  onToggleSimulation,
  onSimulateTick,
  isSimulatingTick,
  onResetDemo,
  isResetting,
  onOpenGuide,
  currentRole,
  onChangeRole,
  audioEnabled,
  onToggleAudio,
}: TopbarProps) {
  const currentInfo = ROUTE_LABELS[currentRoute] || { title: 'RestOS Lite', section: 'App' };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Nav Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
          <span className="hidden sm:inline text-stone-400">{currentInfo.section}</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-stone-300" />
          <h1 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions & Live Simulator Controls */}
      <div className="flex items-center gap-2">
        {/* Audio Chime Toggle */}
        <button
          onClick={onToggleAudio}
          title={audioEnabled ? 'Kitchen sound chimes enabled' : 'Muted'}
          className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:flex items-center gap-1 font-bold ${
            audioEnabled
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-stone-100 border-stone-200 text-stone-400'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[10px] hidden lg:inline">Chime</span>
        </button>

        {/* Live Traffic Simulator Button */}
        <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              isSimulating
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
            title="Auto-simulates realistic dining orders, kitchen cooking, and bill requests every 12s"
          >
            {isSimulating ? (
              <>
                <Pause className="w-3 h-3 text-emerald-200 animate-pulse" />
                <span className="hidden sm:inline">Live Traffic Active</span>
                <span className="sm:hidden">Live</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-700" />
                <span className="hidden sm:inline">Simulate Traffic</span>
                <span className="sm:hidden">Sim</span>
              </>
            )}
          </button>

          <button
            onClick={onSimulateTick}
            disabled={isSimulatingTick}
            className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
            title="Trigger an immediate dining event step (Order -> Prep -> Ready -> Bill -> Pay)"
          >
            <Zap className={`w-3 h-3 text-amber-600 ${isSimulatingTick ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-[11px]">Step Tick</span>
          </button>
        </div>

        {/* Verification Guide Drawer Trigger */}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenGuide}
          className="h-8 text-xs font-bold text-stone-700 border-stone-200 gap-1.5 hidden md:flex"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>Evaluation Guide</span>
        </Button>

        {/* Reset Shift Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetDemo}
          disabled={isResetting}
          className="h-8 text-xs font-semibold text-stone-500 hover:text-rose-700 hover:bg-rose-50 px-2.5"
          title="Reset shift back to baseline Indiranagar restaurant data"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-rose-600' : ''}`} />
          <span className="hidden xl:inline ml-1">{isResetting ? 'Resetting...' : 'Reset Shift'}</span>
        </Button>
      </div>
    </header>
  );
}
