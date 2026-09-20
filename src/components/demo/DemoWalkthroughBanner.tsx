import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';

interface DemoWalkthroughProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const DEMO_STEPS = [
  { step: 1, title: 'Open Floor', route: 'floor', description: 'View real-time visual table layout' },
  { step: 2, title: 'Select Table 5', route: 'floor', description: 'Click Table T-05 to open order panel' },
  { step: 3, title: 'Order Food', route: 'orders', description: 'Add Paneer Tikka, Butter Chicken, Naan' },
  { step: 4, title: 'Send to Kitchen', route: 'orders', description: 'Submit order to Central State Engine' },
  { step: 5, title: 'Open KDS', route: 'kds', description: 'Kitchen receives order in real time' },
  { step: 6, title: 'Accept Order', route: 'kds', description: 'Move order from NEW to PREPARING' },
  { step: 7, title: 'Mark Ready', route: 'kds', description: 'Kitchen marks order READY for pickup' },
  { step: 8, title: 'Generate Bill', route: 'billing', description: 'Compute GST, subtotal, and tax invoice' },
  { step: 9, title: 'Select UPI QR', route: 'billing', description: 'Generate UPI Intent URL & Dynamic QR' },
  { step: 10, title: 'Complete DEMO Payment', route: 'billing', description: 'Simulate instant verified UPI settlement' },
  { step: 11, title: 'Return to Floor', route: 'floor', description: 'Inspect updated table occupancy' },
  { step: 12, title: 'Table Available', route: 'floor', description: 'Table 5 returns automatically to AVAILABLE' },
  { step: 13, title: 'Open RestIQ', route: 'restiq', description: 'Analyze intelligent operational insights' },
  { step: 14, title: 'Check Analytics', route: 'analytics', description: 'Verify live revenue & chart updates' },
];

export function DemoWalkthroughBanner({ currentRoute, onNavigate, onResetDemo, isResetting }: DemoWalkthroughProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = DEMO_STEPS[activeStepIndex];

  const handleNext = () => {
    const nextIdx = (activeStepIndex + 1) % DEMO_STEPS.length;
    setActiveStepIndex(nextIdx);
    onNavigate(DEMO_STEPS[nextIdx].route);
  };

  const handleStepClick = (idx: number) => {
    setActiveStepIndex(idx);
    onNavigate(DEMO_STEPS[idx].route);
  };

  return (
    <div className="bg-stone-900 text-white text-xs border-b border-stone-800 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Badge & Step Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>YIIC DEMO MODE</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-stone-300">
            <span className="font-bold text-white bg-stone-800 px-2 py-0.5 rounded text-[11px]">
              Step {activeStep.step} of 14
            </span>
            <span className="font-semibold text-emerald-400">{activeStep.title}:</span>
            <span className="text-stone-300">{activeStep.description}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate(activeStep.route)}
            className="h-7 px-2.5 text-xs text-stone-300 hover:text-white hover:bg-stone-800"
          >
            Go to {activeStep.route.toUpperCase()}
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleNext}
            className="h-7 px-3 text-xs bg-emerald-700 hover:bg-emerald-600 text-white gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onResetDemo}
            disabled={isResetting}
            className="h-7 px-2.5 text-xs border-stone-700 bg-stone-800/80 text-stone-200 hover:bg-stone-700 hover:text-white gap-1.5"
            title="Reset to clean baseline data"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </Button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-800"
            title={isCollapsed ? 'Expand Steps Checklist' : 'Collapse Checklist'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Step Pill Navigator */}
      {!isCollapsed && (
        <div className="border-t border-stone-800/80 bg-stone-950/60 px-4 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            {DEMO_STEPS.map((s, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <button
                  key={s.step}
                  onClick={() => handleStepClick(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : isDone
                      ? 'bg-stone-800/90 text-emerald-400 hover:bg-stone-800'
                      : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="w-3.5 text-center font-bold opacity-80">{s.step}</span>
                  )}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
