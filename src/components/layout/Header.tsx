import React, { useState } from 'react';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Table2,
  ClipboardList,
  ChefHat,
  Receipt,
  BookOpen,
  BarChart3,
  Brain,
  Settings,
  QrCode,
  UserCheck,
  Globe,
  Radio,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  restaurantName: string;
  isLiveConnected: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
  { id: 'floor', label: 'Floor Plan', icon: Table2, roles: ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'] },
  { id: 'orders', label: 'POS & Orders', icon: ClipboardList, roles: ['OWNER', 'MANAGER', 'CASHIER', 'WAITER'] },
  { id: 'kds', label: 'KDS', icon: ChefHat, roles: ['OWNER', 'MANAGER', 'KITCHEN'] },
  { id: 'menu', label: 'Menu', icon: BookOpen, roles: ['OWNER', 'MANAGER'] },
  { id: 'billing', label: 'Billing', icon: Receipt, roles: ['OWNER', 'CASHIER'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['OWNER', 'MANAGER'] },
  { id: 'restiq', label: 'RestIQ', icon: Brain, roles: ['OWNER', 'MANAGER'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['OWNER'] },
];

export function Header({
  currentRoute,
  onNavigate,
  currentRole,
  onChangeRole,
  restaurantName,
  isLiveConnected,
}: HeaderProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const availableNav = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const rolesList: { role: UserRole; desc: string }[] = [
    { role: 'OWNER', desc: 'Full administrative access' },
    { role: 'MANAGER', desc: 'Floor, orders, menu, KDS & analytics' },
    { role: 'CASHIER', desc: 'Floor, orders, invoices & billing' },
    { role: 'KITCHEN', desc: 'Dedicated kitchen display screen' },
    { role: 'WAITER', desc: 'Table management & order intake' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand & Restaurant */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-emerald-900 transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-base tracking-tight leading-none block">
                RestOS <span className="text-emerald-800 font-semibold text-xs tracking-normal">Lite</span>
              </span>
              <span className="text-[11px] text-stone-500 font-medium leading-none block mt-0.5">
                {restaurantName}
              </span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1 text-xs text-stone-400 pl-3 border-l border-stone-200">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-stone-600 font-medium text-[11px]">
              {isLiveConnected ? 'Live State Sync' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          {/* Customer QR Simulator Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('customer-order', { restaurantId: 'the-green-table', tableId: 'table-5' })}
            className="h-8 px-2.5 text-xs text-stone-700 hover:text-emerald-800 hover:border-emerald-600 gap-1.5"
            title="Preview Customer Mobile QR Order View"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Customer QR (T-05)</span>
          </Button>

          {/* Landing page link */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate('landing')}
            className="h-8 px-2 text-xs text-stone-600 hover:text-stone-900"
            title="View Product Landing Page"
          >
            <Globe className="w-3.5 h-3.5 mr-1" />
            <span className="hidden lg:inline">Overview</span>
          </Button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Role: {currentRole}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Select User Role for Auth Testing
                </div>
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      onChangeRole(item.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-stone-50 transition-colors ${
                      currentRole === item.role ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <span className="font-bold">{item.role}</span>
                    <span className="text-[11px] text-stone-500 font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation tabs bar */}
      <div className="border-t border-stone-100 bg-stone-50/70 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          {availableNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-emerald-900 font-bold shadow-2xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-800' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
