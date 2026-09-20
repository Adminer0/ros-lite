import React, { useEffect, useRef } from 'react';
import { Database, ShieldCheck, User } from 'lucide-react';
import { gsapMotion } from '../../lib/animations';

interface NeonAuthBadgeProps {
  currentUser: any | null;
  onOpenAuthModal: () => void;
  isLiveConnected: boolean;
}

export function NeonAuthBadge({ currentUser, onOpenAuthModal, isLiveConnected }: NeonAuthBadgeProps) {
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (dotRef.current) {
      const tween = gsapMotion.pulseLiveBadge(dotRef.current);
      return () => {
        tween.kill();
      };
    }
  }, []);

  return (
    <button
      onClick={onOpenAuthModal}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all text-xs font-semibold text-stone-700 shadow-2xs group"
      title="Neon PostgreSQL & Neon Auth Status. Click to login as admin/admin or yiic/yiic."
    >
      <div className="flex items-center gap-1.5">
        <span
          ref={dotRef}
          className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
        />
        <Database className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-stone-900 hidden sm:inline text-xs">Neon DB</span>
      </div>

      <div className="h-3.5 w-px bg-stone-200" />

      {currentUser ? (
        <div className="flex items-center gap-1 text-emerald-900 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span className="truncate max-w-[80px] sm:max-w-[100px] text-xs">
            {currentUser.username}
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1 rounded font-bold uppercase">
            {currentUser.role}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-stone-500 group-hover:text-emerald-800">
          <User className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-xs font-bold">Sign In</span>
          <span className="text-[10px] bg-stone-200 text-stone-600 px-1 rounded font-bold">
            admin / yiic
          </span>
        </div>
      )}
    </button>
  );
}
