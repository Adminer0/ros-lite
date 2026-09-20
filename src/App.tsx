import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Restaurant,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  Order,
  KitchenOrder,
  Invoice,
  AnalyticsSummary,
  RestIQInsight,
  UserRole,
} from './types';
import { api } from './lib/api';
import { soundManager } from './lib/sound';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { EvaluationGuideModal } from './components/demo/EvaluationGuideModal';

import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { FloorPlanView } from './components/floor/FloorPlanView';
import { OrdersView } from './components/orders/OrdersView';
import { KdsView } from './components/kds/KdsView';
import { MenuView } from './components/menu/MenuView';
import { BillingView } from './components/billing/BillingView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RestiqView } from './components/restiq/RestiqView';
import { SettingsView } from './components/settings/SettingsView';
import { CustomerOrderView } from './components/customer/CustomerOrderView';

const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  OWNER: ['dashboard', 'floor', 'orders', 'kds', 'billing', 'menu', 'analytics', 'restiq', 'settings', 'landing', 'customer-order'],
  MANAGER: ['dashboard', 'floor', 'orders', 'kds', 'menu', 'analytics', 'restiq', 'landing', 'customer-order'],
  CASHIER: ['floor', 'orders', 'billing', 'landing', 'customer-order'],
  KITCHEN: ['kds', 'landing', 'customer-order'],
  WAITER: ['floor', 'orders', 'landing', 'customer-order'],
};

const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  OWNER: 'dashboard',
  MANAGER: 'dashboard',
  CASHIER: 'billing',
  KITCHEN: 'kds',
  WAITER: 'floor',
};

export function App() {
  // Navigation & Role State
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [routeParams, setRouteParams] = useState<any>({});
  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Live Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulatingTick, setIsSimulatingTick] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Real-time Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Domain State
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<RestIQInsight[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all live data
  const fetchData = useCallback(async () => {
    try {
      const [
        restData,
        tablesData,
        catsData,
        itemsData,
        ordersData,
        kdsData,
        invoicesData,
        analyticsData,
        insightsData,
        simStatus,
      ] = await Promise.all([
        api.getRestaurant(),
        api.getTables(),
        api.getCategories(),
        api.getMenuItems(),
        api.getOrders(),
        api.getKitchenOrders(),
        api.getInvoices(),
        api.getAnalytics(),
        api.getRestIQ(),
        api.getSimulationStatus().catch(() => ({ active: false })),
      ]);

      setRestaurant(restData);
      setTables(tablesData);
      setCategories(catsData);
      setMenuItems(itemsData);
      setOrders(ordersData);
      setKitchenOrders(kdsData);
      setInvoices(invoicesData);
      setAnalytics(analyticsData);
      setInsights(insightsData);
      setIsSimulating(Boolean(simStatus.active));
      setInitialLoading(false);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  }, []);

  // Server-Sent Events (SSE) Live Reactive Listener
  useEffect(() => {
    fetchData();

    // Connect to SSE stream
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (!payload || !payload.type) return;

        // Reactive state refresh for all ledger mutations
        if (
          [
            'ORDER_CREATED',
            'ORDER_UPDATED',
            'KDS_UPDATED',
            'TABLE_UPDATED',
            'INVOICE_GENERATED',
            'PAYMENT_CONFIRMED',
            'DEMO_RESET',
            'MENU_UPDATED',
            'RESTAURANT_UPDATED',
            'STATE_UPDATED',
          ].includes(payload.type)
        ) {
          fetchData();
        }

        // Auditory chimes & visual real-time toasts
        if (payload.type === 'ORDER_CREATED') {
          if (audioEnabled) soundManager.playNewOrderChime();
          const ord = payload.payload;
          addToast({
            title: `New Order #${ord.order_number || ''}`,
            description: `Table ${ord.table_number || ''} placed an order for ₹${ord.total || 0}`,
            type: 'kds',
          });
        } else if (payload.type === 'KDS_UPDATED') {
          const ko = payload.payload?.kitchenOrder;
          if (ko) {
            if (ko.status === 'READY') {
              if (audioEnabled) soundManager.playOrderReadyChime();
              addToast({
                title: `Order #${ko.order_number} Ready!`,
                description: `Table ${ko.table_number} dishes are plated for serving.`,
                type: 'success',
              });
            } else if (ko.status === 'PREPARING') {
              addToast({
                title: `KDS: Order #${ko.order_number} In Prep`,
                description: `Kitchen cook started preparing Table ${ko.table_number} ticket.`,
                type: 'info',
              });
            }
          }
        } else if (payload.type === 'PAYMENT_CONFIRMED') {
          const payment = payload.payload;
          addToast({
            title: 'Payment Confirmed',
            description: `Settlement completed. Table released to Available.`,
            type: 'success',
          });
        }
      } catch (err) {
        // keep-alive or heartbeat
      }
    };

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchData, audioEnabled, addToast]);

  // Role change handler: automatically switches to worker's designated default view
  const handleChangeRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const allowed = ROLE_ALLOWED_ROUTES[newRole] || [];
    if (!allowed.includes(currentRoute)) {
      const target = ROLE_DEFAULT_ROUTE[newRole] || 'dashboard';
      setCurrentRoute(target);
      setRouteParams({});
    }
  };

  // Safe navigation handler
  const handleNavigate = (route: string, params: any = {}) => {
    const allowed = ROLE_ALLOWED_ROUTES[currentRole] || [];
    if (!allowed.includes(route)) {
      // Auto-elevate role to OWNER if requested via a guide shortcut
      setCurrentRole('OWNER');
    }
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset Demo
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      await fetchData();
      addToast({
        title: 'Shift Reset',
        description: 'Ledger restored to baseline Indiranagar restaurant state.',
        type: 'info',
      });
      handleNavigate('dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  // Simulation controls
  const handleToggleSimulation = async () => {
    try {
      const next = !isSimulating;
      const res = await api.toggleSimulation(next);
      setIsSimulating(res.active);
      addToast({
        title: res.active ? '⚡ Live Traffic Enabled' : 'Live Traffic Paused',
        description: res.active
          ? 'Simulating realistic diner orders, kitchen prep, and bill requests every 12s.'
          : 'Live operational simulation stopped.',
        type: res.active ? 'kds' : 'info',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateTick = async () => {
    setIsSimulatingTick(true);
    try {
      const result = await api.simulateTick();
      if (result.message) {
        addToast({
          title: 'Simulation Step',
          description: result.message,
          type: 'kds',
        });
      }
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulatingTick(false);
    }
  };

  // Guard against any invalid routes for the current worker role
  useEffect(() => {
    const allowed = ROLE_ALLOWED_ROUTES[currentRole] || [];
    if (!allowed.includes(currentRoute)) {
      setCurrentRoute(ROLE_DEFAULT_ROUTE[currentRole] || 'dashboard');
    }
  }, [currentRole, currentRoute]);

  if (initialLoading || !restaurant || !analytics) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg animate-bounce">
          R
        </div>
        <h2 className="text-base font-extrabold text-stone-100 mt-4 tracking-tight">RestOS Lite</h2>
        <p className="text-xs text-stone-400 mt-1 font-mono">Initializing continuous ledger & SSE connection...</p>
      </div>
    );
  }

  // If customer order view is active, render mobile-first customer screen
  if (currentRoute === 'customer-order') {
    const targetTable = tables.find((t) => t.id === routeParams.tableId) || tables[4] || tables[0];
    return (
      <CustomerOrderView
        restaurant={restaurant}
        table={targetTable}
        categories={categories}
        menuItems={menuItems}
        onBackToStaff={() => handleNavigate('floor')}
        onOrderPlaced={() => fetchData()}
      />
    );
  }

  const pendingKdsCount = kitchenOrders.filter((k) => k.status === 'NEW' || k.status === 'PREPARING').length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* Real-time Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 10-Step Evaluation Checklist Modal */}
      <EvaluationGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        onChangeRole={handleChangeRole}
        pendingKdsCount={pendingKdsCount}
      />

      {/* Left Sidebar Navigation Pane (Desktop/Tablet) */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        onChangeRole={handleChangeRole}
        isLiveConnected={isLiveConnected}
        pendingKdsCount={pendingKdsCount}
        restaurantName={restaurant.name}
      />

      {/* Main Body Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Uncluttered Topbar */}
        <Topbar
          currentRoute={currentRoute}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          onSimulateTick={handleSimulateTick}
          isSimulatingTick={isSimulatingTick}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          onOpenGuide={() => setGuideModalOpen(true)}
          currentRole={currentRole}
          onChangeRole={handleChangeRole}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {currentRoute === 'landing' && (
                <LandingPage
                  onLaunchDemo={() => handleNavigate('dashboard')}
                  onOpenCustomerQr={() =>
                    handleNavigate('customer-order', { restaurantId: restaurant.slug, tableId: 'table-5' })
                  }
                />
              )}

              {currentRoute === 'dashboard' && (
                <DashboardView
                  restaurant={restaurant}
                  tables={tables}
                  orders={orders}
                  analytics={analytics}
                  insights={insights}
                  onNavigate={handleNavigate}
                  onSelectTableForOrder={(tableId) => handleNavigate('orders', { tableId })}
                />
              )}

              {currentRoute === 'floor' && (
                <FloorPlanView
                  tables={tables}
                  orders={orders}
                  onSelectTableForOrder={(tableId) => handleNavigate('orders', { tableId })}
                  onNavigate={handleNavigate}
                  onRefresh={fetchData}
                />
              )}

              {currentRoute === 'orders' && (
                <OrdersView
                  categories={categories}
                  menuItems={menuItems}
                  tables={tables}
                  orders={orders}
                  initialTableId={routeParams.tableId}
                  onNavigate={handleNavigate}
                  onRefresh={fetchData}
                />
              )}

              {currentRoute === 'kds' && (
                <KdsView kitchenOrders={kitchenOrders} onRefresh={fetchData} />
              )}

              {currentRoute === 'menu' && (
                <MenuView categories={categories} menuItems={menuItems} onRefresh={fetchData} />
              )}

              {currentRoute === 'billing' && (
                <BillingView
                  orders={orders}
                  restaurant={restaurant}
                  selectedOrderId={routeParams.orderId}
                  onNavigate={handleNavigate}
                  onRefresh={fetchData}
                />
              )}

              {currentRoute === 'analytics' && <AnalyticsView analytics={analytics} />}

              {currentRoute === 'restiq' && (
                <RestiqView insights={insights} onNavigate={handleNavigate} />
              )}

              {currentRoute === 'settings' && (
                <SettingsView
                  restaurant={restaurant}
                  tables={tables}
                  onNavigate={handleNavigate}
                  onRefresh={fetchData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Streamlined Footer */}
        <footer className="border-t border-stone-200 bg-white py-3 text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-bold text-stone-800">
              RestOS Lite • Modern Restaurant Operating System
            </span>
            <div className="flex items-center gap-3 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Continuous SSE Sync
              </span>
              <span>•</span>
              <span>UPI Intent Ready</span>
              <span>•</span>
              <button
                onClick={() => setGuideModalOpen(true)}
                className="text-emerald-800 font-bold hover:underline"
              >
                Evaluation Checklist
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
