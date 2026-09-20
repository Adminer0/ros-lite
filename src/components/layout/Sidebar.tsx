import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isLiveConnected: boolean;
  pendingKdsCount: number;
  restaurantName: string;
}

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  roles?: UserRole[];
  onClick?: () => void;
}

interface SidebarGroup {
  group: string;
  items: SidebarNavItem[];
}

export function Sidebar({
  currentRoute,
  onNavigate,
  currentRole,
  onChangeRole,
  isLiveConnected,
  pendingKdsCount,
  restaurantName,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: SidebarGroup[] = [
    {
      group: 'OPERATIONS',
      items: [
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
          badgeColor: 'bg-amber-500 text-stone-950 font-bold',
          roles: ['OWNER', 'MANAGER', 'KITCHEN'],
        },
        {
          id: 'billing',
          label: 'Billing & Cash',
          icon: Receipt,
          roles: ['OWNER', 'CASHIER'],
        },
      ],
    },
    {
      group: 'MANAGEMENT',
      items: [
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
          badge: 'Smart',
          badgeColor: 'bg-purple-100 text-purple-800',
          roles: ['OWNER', 'MANAGER'],
        },
        {
          id: 'settings',
          label: 'Settings & QR',
          icon: Settings,
          roles: ['OWNER'],
        },
      ],
    },
    {
      group: 'PREVIEWS',
      items: [
        {
          id: 'customer-order',
          label: 'Customer QR View',
          icon: Smartphone,
          onClick: () => onNavigate('customer-order', { restaurantId: 'the-green-table', tableId: 'table-5' }),
        },
        { id: 'landing', label: 'Product Landing', icon: Globe },
      ],
    },
  ];

  // Filter out any navigation items not accessible by the active staff role
  const visibleGroups = navItems
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => !item.roles || item.roles.includes(currentRole)),
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="hidden md:flex flex-col bg-stone-900 text-stone-300 border-r border-stone-800 z-30 select-none h-screen sticky top-0 shrink-0"
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-stone-800 px-4 flex items-center justify-between">
        {!collapsed ? (
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-extrabold text-white text-base shadow-sm group-hover:bg-emerald-600 transition-colors">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm text-white tracking-tight">RestOS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                  Lite
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block truncate max-w-[120px] mt-0.5">
                {restaurantName}
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('dashboard')}
            className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-extrabold text-white text-base mx-auto cursor-pointer"
          >
            R
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5 no-scrollbar">
        {visibleGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {grp.group}
              </span>
            )}

            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => (item.onClick ? item.onClick() : onNavigate(item.id))}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative group ${
                    isActive
                      ? 'bg-emerald-800 text-white font-bold shadow-xs'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`} />

                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-tight ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Role & Live Status */}
      <div className="border-t border-stone-800 p-3 space-y-2.5 bg-stone-950/40">
        {/* Role Selector */}
        {!collapsed ? (
          <div className="bg-stone-850 p-2 rounded-lg border border-stone-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Staff Role
              </span>
              <span className="text-emerald-400">{currentRole}</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="w-full bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded py-1 px-1.5 font-bold focus:outline-hidden focus:border-emerald-500"
            >
              <option value="OWNER">Owner (Full Access)</option>
              <option value="MANAGER">Manager (Ops & Menu)</option>
              <option value="CASHIER">Cashier (POS & Bill)</option>
              <option value="KITCHEN">Kitchen Line (KDS)</option>
              <option value="WAITER">Waiter (Floor & POS)</option>
            </select>
          </div>
        ) : (
          <div
            title={`Role: ${currentRole}`}
            className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto text-emerald-400 text-xs font-bold cursor-pointer"
          >
            {currentRole[0]}
          </div>
        )}

        {/* Live SSE Connection Indicator */}
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] ${
            collapsed ? 'justify-center' : ''
          } ${isLiveConnected ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          <span className="relative flex h-2 w-2">
            {isLiveConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>

          {!collapsed && (
            <span className="font-mono text-[10px]">
              {isLiveConnected ? 'Live Ledger Synced' : 'Offline'}
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
