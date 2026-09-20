import React, { useState, useEffect, useCallback } from 'react';
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
import { Header } from './components/layout/Header';
import { DemoWalkthroughBanner } from './components/demo/DemoWalkthroughBanner';
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
import { ShieldAlert } from 'lucide-react';
import { Button } from './components/ui/Button';

export function App() {
  // Navigation & Role State
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [routeParams, setRouteParams] = useState<any>({});
  const [currentRole, setCurrentRole] = useState<UserRole>('OWNER');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
      setInitialLoading(false);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
  }, []);

  // Initial load & SSE connection
  useEffect(() => {
    fetchData();

    // Connect to Server-Sent Events
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      setIsLiveConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'STATE_UPDATED') {
          fetchData();
        }
      } catch (err) {
        // keep-alive or malformed
      }
    };

    eventSource.onerror = () => {
      setIsLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [fetchData]);

  // Navigate handler
  const handleNavigate = (route: string, params: any = {}) => {
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
      handleNavigate('dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  // Role permissions check
  const checkRolePermission = (): boolean => {
    if (currentRoute === 'landing' || currentRoute === 'customer-order') return true;
    switch (currentRole) {
      case 'OWNER':
        return true;
      case 'MANAGER':
        return ['dashboard', 'floor', 'orders', 'kds', 'menu', 'analytics', 'restiq'].includes(currentRoute);
      case 'CASHIER':
        return ['floor', 'orders', 'billing'].includes(currentRoute);
      case 'KITCHEN':
        return ['kds'].includes(currentRoute);
      case 'WAITER':
        return ['floor', 'orders'].includes(currentRoute);
      default:
        return true;
    }
  };

  if (initialLoading || !restaurant || !analytics) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md animate-pulse">
          R
        </div>
        <h2 className="text-sm font-bold text-stone-900 mt-3">Initializing RestOS Lite Core Engine</h2>
        <p className="text-xs text-stone-500 mt-0.5">Connecting to central ledger and table state...</p>
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

  const hasPermission = checkRolePermission();

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* 14-Step YIIC Demo Walkthrough Guide Banner */}
      <DemoWalkthroughBanner
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Staff Header with Role Switcher & Live Sync */}
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        onChangeRole={(role) => setCurrentRole(role)}
        restaurantName={restaurant.name}
        isLiveConnected={isLiveConnected}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {!hasPermission ? (
          /* Role Access Denied Guard */
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-md mx-auto my-12 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-base font-extrabold text-stone-900">Access Restricted for Role: {currentRole}</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              This module requires higher clearance. You can switch your role in the top-right header to OWNER or MANAGER to test this view.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => setCurrentRole('OWNER')}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
              >
                Switch Role to OWNER
              </Button>
            </div>
          </div>
        ) : (
          /* Active Route View */
          <>
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
          </>
        )}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-stone-200 bg-white py-3 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-stone-700">
            RestOS Lite • Lightweight Restaurant Operating System
          </span>
          <span className="text-[11px] text-stone-400">
            YIIC 2026 Production Prototype • Unified Neon Ledger
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
