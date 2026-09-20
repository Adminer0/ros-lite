import React from 'react';
import {
  LayoutDashboard,
  Table2,
  ShoppingCart,
  ChefHat,
  Receipt,
  BookOpen,
  BarChart3,
  Brain,
  Settings,
  Smartphone,
  Globe,
  X,
  Shield,
} from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { UserRole } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  pendingKdsCount: number;
}

export function MobileNav({
  isOpen,
  onClose,
  currentRoute,
  onNavigate,
  currentRole,
  onChangeRole,
  pendingKdsCount,
}: MobileNavProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'floor',
      label: 'Floor Plan',
      icon: Table2,
      roles: ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'],
    },
    {
      id: 'orders',
      label: 'POS Terminal',
      icon: ShoppingCart,
      roles: ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'],
    },
    {
      id: 'kds',
      label: 'Kitchen Display',
      icon: ChefHat,
      badge: pendingKdsCount > 0 ? `${pendingKdsCount}` : undefined,
      roles: ['OWNER', 'MANAGER', 'KITCHEN'],
    },
    {
      id: 'billing',
      label: 'Billing & Cash',
      icon: Receipt,
      roles: ['OWNER', 'CASHIER'],
    },
    {
      id: 'menu',
      label: 'Menu Catalog',
      icon: BookOpen,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'restiq',
      label: 'RestIQ Insights',
      icon: Brain,
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'settings',
      label: 'Settings & QR',
      icon: Settings,
      roles: ['OWNER'],
    },
    {
      id: 'customer-order',
      label: 'Customer QR Mobile View',
      icon: Smartphone,
      onClick: () => onNavigate('customer-order', { restaurantId: 'the-green-table', tableId: 'table-5' }),
    },
    { id: 'landing', label: 'Product Landing Page', icon: Globe },
  ];

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(currentRole));

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="RestOS Lite Navigation">
      <div className="space-y-4 py-2 text-xs">
        {/* Role Selector */}
        <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 space-y-1">
          <label className="font-bold text-stone-700 flex items-center gap-1 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-800" />
            Switch Active Staff Role
          </label>
          <select
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="w-full bg-white border border-stone-300 rounded p-1.5 font-semibold text-xs"
          >
            <option value="OWNER">Owner (Full Access)</option>
            <option value="MANAGER">Manager</option>
            <option value="CASHIER">Cashier</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="WAITER">Waiter</option>
          </select>
        </div>

        {/* Links */}
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg font-bold text-xs transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-stone-900 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
