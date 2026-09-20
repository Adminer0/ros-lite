import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Bell, AlertTriangle, X, ChefHat, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'kds';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-stone-900/95 backdrop-blur-md text-white border border-stone-800 rounded-xl p-3.5 shadow-xl flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {toast.type === 'kds' ? (
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ChefHat className="w-3.5 h-3.5" />
                  </div>
                ) : toast.type === 'success' ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-stone-100 leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-500 hover:text-stone-300 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
