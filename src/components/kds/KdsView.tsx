import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { KitchenOrder, KitchenOrderStatus } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { api } from '../../lib/api';
import { soundManager } from '../../lib/sound';

interface KdsViewProps {
  kitchenOrders: KitchenOrder[];
  onRefresh: () => void;
}

export function KdsView({ kitchenOrders, onRefresh }: KdsViewProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Periodic tick for elapsed time display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (isoDate: string) => {
    const diffMins = Math.max(0, Math.floor((currentTime - new Date(isoDate).getTime()) / 60000));
    if (diffMins < 1) return 'Just now';
    return `${diffMins}m ago`;
  };

  const isUrgent = (isoDate: string) => {
    const diffMins = Math.floor((currentTime - new Date(isoDate).getTime()) / 60000);
    return diffMins >= 15;
  };

  const handleToggleItemCheck = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleUpdateStatus = async (orderId: string, status: KitchenOrderStatus) => {
    setUpdatingId(orderId);
    try {
      if (status === 'READY') {
        soundManager.playOrderReadyChime();
      }
      await api.updateKitchenStatus(orderId, status);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Split into columns
  const newOrders = kitchenOrders.filter((k) => k.status === 'NEW');
  const preparingOrders = kitchenOrders.filter((k) => k.status === 'PREPARING');
  const readyOrders = kitchenOrders.filter((k) => k.status === 'READY');

  return (
    <div className="space-y-3">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <ChefHat className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-mono font-bold bg-stone-900 text-emerald-400 px-2 py-0.5 rounded">
                LIVE QUEUE
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Real-time synchronized order display for prep lines, expeditors, and runners.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} className="h-8 text-xs font-semibold gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync Queue</span>
          </Button>
        </div>
      </div>

      {/* 3-Column KDS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]">
        {/* COLUMN 1: NEW */}
        <div className="bg-stone-100/70 rounded-xl border border-stone-200 flex flex-col overflow-hidden shadow-2xs">
          <div className="p-3 bg-amber-600 text-white font-extrabold text-xs flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 tracking-wider">
              <Clock className="w-4 h-4" />
              NEW ORDERS ({newOrders.length})
            </span>
            <span className="bg-amber-700/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
              STAGE 1
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {newOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 flex flex-col items-center justify-center text-stone-400 text-xs italic space-y-1"
                >
                  <ChefHat className="w-8 h-8 text-stone-300" />
                  <span>No incoming tickets</span>
                </motion.div>
              ) : (
                newOrders.map((ko) => (
                  <motion.div
                    key={ko.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`bg-white rounded-xl border-2 p-3.5 shadow-xs space-y-3 transition-shadow hover:shadow-md ${
                      isUrgent(ko.created_at) ? 'border-rose-400 bg-rose-50/30' : 'border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-stone-900 block">
                          {ko.order_number}
                        </span>
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded inline-block mt-0.5">
                          TABLE {ko.table_number}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {getElapsedTime(ko.created_at)}
                      </span>
                    </div>

                    {/* Items list */}
                    <div className="space-y-1.5 text-xs">
                      {ko.items.map((it) => (
                        <div
                          key={it.id}
                          onClick={() => handleToggleItemCheck(it.id)}
                          className={`p-1.5 rounded cursor-pointer transition-colors flex items-start justify-between ${
                            checkedItems[it.id] ? 'bg-stone-100 text-stone-400 line-through' : 'hover:bg-stone-50 text-stone-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-stone-900">
                              {it.quantity} × {it.name}
                            </span>
                            {it.variant && <span className="text-[11px] text-stone-500 block">({it.variant})</span>}
                            {it.notes && <span className="text-[10px] text-rose-700 block font-semibold italic">Note: {it.notes}</span>}
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(checkedItems[it.id])}
                            onChange={() => {}}
                            className="mt-1 rounded text-emerald-800"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleUpdateStatus(ko.id, 'PREPARING')}
                      disabled={updatingId === ko.id}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Accept & Start Prep</span>
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="bg-stone-100/70 rounded-xl border border-stone-200 flex flex-col overflow-hidden shadow-2xs">
          <div className="p-3 bg-blue-600 text-white font-extrabold text-xs flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 tracking-wider">
              <ChefHat className="w-4 h-4" />
              IN PREP ({preparingOrders.length})
            </span>
            <span className="bg-blue-700/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
              STAGE 2
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {preparingOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 flex flex-col items-center justify-center text-stone-400 text-xs italic space-y-1"
                >
                  <Clock className="w-8 h-8 text-stone-300" />
                  <span>No orders currently cooking</span>
                </motion.div>
              ) : (
                preparingOrders.map((ko) => (
                  <motion.div
                    key={ko.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="bg-white rounded-xl border-2 border-blue-300 p-3.5 shadow-xs space-y-3 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-stone-900 block">
                          {ko.order_number}
                        </span>
                        <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded inline-block mt-0.5">
                          TABLE {ko.table_number}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {getElapsedTime(ko.created_at)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {ko.items.map((it) => (
                        <div
                          key={it.id}
                          onClick={() => handleToggleItemCheck(it.id)}
                          className={`p-1.5 rounded cursor-pointer transition-colors flex items-start justify-between ${
                            checkedItems[it.id] ? 'bg-stone-100 text-stone-400 line-through' : 'hover:bg-stone-50 text-stone-900'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-stone-900">
                              {it.quantity} × {it.name}
                            </span>
                            {it.variant && <span className="text-[11px] text-stone-500 block">({it.variant})</span>}
                            {it.notes && <span className="text-[10px] text-rose-700 block font-semibold italic">Note: {it.notes}</span>}
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(checkedItems[it.id])}
                            onChange={() => {}}
                            className="mt-1 rounded text-emerald-800"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleUpdateStatus(ko.id, 'READY')}
                      disabled={updatingId === ko.id}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Dishes Ready & Plated</span>
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* COLUMN 3: READY */}
        <div className="bg-stone-100/70 rounded-xl border border-stone-200 flex flex-col overflow-hidden shadow-2xs">
          <div className="p-3 bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              READY FOR SERVICE ({readyOrders.length})
            </span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
              STAGE 3
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {readyOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 flex flex-col items-center justify-center text-stone-400 text-xs italic space-y-1"
                >
                  <CheckCircle2 className="w-8 h-8 text-stone-300" />
                  <span>No orders waiting at pickup counter</span>
                </motion.div>
              ) : (
                readyOrders.map((ko) => (
                  <motion.div
                    key={ko.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="bg-white rounded-xl border-2 border-emerald-400 p-3.5 shadow-xs space-y-3 bg-emerald-50/10 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-stone-900 block">
                          {ko.order_number}
                        </span>
                        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded inline-block mt-0.5">
                          TABLE {ko.table_number}
                        </span>
                      </div>
                      <Badge variant="success">Awaiting Runner</Badge>
                    </div>

                    <div className="space-y-1 text-xs text-stone-700">
                      {ko.items.map((it) => (
                        <div key={it.id} className="font-semibold">
                          {it.quantity} × {it.name}
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleUpdateStatus(ko.id, 'SERVED')}
                      disabled={updatingId === ko.id}
                      className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm Served to Table</span>
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
