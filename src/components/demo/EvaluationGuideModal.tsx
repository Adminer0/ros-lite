import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Table2,
  ChefHat,
  Receipt,
  Smartphone,
  Brain,
  X,
} from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface EvaluationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export function EvaluationGuideModal({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  onResetDemo,
  isResetting,
}: EvaluationGuideModalProps) {
  const steps = [
    {
      step: 1,
      name: 'Customer QR Ordering',
      route: 'customer-order',
      params: { restaurantId: 'the-green-table', tableId: 'table-5' },
      desc: 'Open Table 5 guest menu, customize Dahi Kebab with extra add-ons, and place live order.',
    },
    {
      step: 2,
      name: 'Floor Plan Table Turnover',
      route: 'floor',
      desc: 'Verify Table 5 immediately turns to OCCUPIED on the visual layout with elapsed dine timer.',
    },
    {
      step: 3,
      name: 'POS Terminal Order Taking',
      route: 'orders',
      desc: 'Create or add dishes directly from waitstaff terminal with instant ticket creation.',
    },
    {
      step: 4,
      name: 'Kitchen Display System (KDS)',
      route: 'kds',
      desc: 'Watch the ticket land in NEW with audible chime. Click "Start Preparing" then "Mark Ready".',
    },
    {
      step: 5,
      name: 'GST Tax Billing & Invoice',
      route: 'billing',
      desc: 'View generated tax invoice with split CGST/SGST and promotional discount sliders.',
    },
    {
      step: 6,
      name: 'Dynamic UPI Intent & QR',
      route: 'billing',
      desc: 'Scan the live dynamic QR or click the UPI Intent link (auto-filled with amount and merchant VPA).',
    },
    {
      step: 7,
      name: 'Table Release & Settlement',
      route: 'floor',
      desc: 'Confirm payment to instantly free Table 5 back to AVAILABLE and increment revenue velocity.',
    },
    {
      step: 8,
      name: 'Continuous Ledger Analytics',
      route: 'analytics',
      desc: 'Review gross turnover, settlement distributions, hourly dining peaks, and top sellers.',
    },
    {
      step: 9,
      name: 'RestIQ Smart Insights',
      route: 'restiq',
      desc: 'Inspect automated menu matrix opportunities and kitchen prep velocity suggestions.',
    },
    {
      step: 10,
      name: 'QR Tent Card Generator',
      route: 'settings',
      desc: 'Generate printable QR standee cards for each table with direct routing and VPA configuration.',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="RestOS Lite • Evaluation & Verification Guide"
      description="10-stage end-to-end product workflow verification"
    >
      <div className="space-y-4 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-emerald-950 block text-xs">Pristine Shift Ledger</span>
            <p className="text-[11px] text-emerald-800">
              Reset shift anytime back to the default Indiranagar restaurant baseline state.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onResetDemo}
            disabled={isResetting}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-7 text-xs shrink-0"
          >
            <RotateCcw className={`w-3 h-3 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Ledger'}</span>
          </Button>
        </div>

        {/* Step List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {steps.map((s) => {
            const isCurrent = currentRoute === s.route;
            return (
              <div
                key={s.step}
                onClick={() => {
                  onNavigate(s.route, s.params);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full font-extrabold text-[11px] flex items-center justify-center font-mono shrink-0 ${
                      isCurrent ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {s.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                          Active View
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-snug mt-0.5">{s.desc}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-stone-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            Close Guide
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
