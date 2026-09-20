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
  TableStatus,
  OrderStatus,
  KitchenOrderStatus,
  PaymentMethod,
} from '../types';

export const api = {
  // Health & DB status
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Reset Demo
  async resetDemo() {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    return res.json();
  },

  // Restaurant & Settings
  async getRestaurant(): Promise<Restaurant> {
    const res = await fetch('/api/restaurant');
    return res.json();
  },

  async updateRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    const res = await fetch('/api/restaurant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Tables
  async getTables(): Promise<RestaurantTable[]> {
    const res = await fetch('/api/tables');
    return res.json();
  },

  async getTable(id: string): Promise<RestaurantTable & { current_order: Order | null }> {
    const res = await fetch(`/api/tables/${id}`);
    return res.json();
  },

  async updateTableStatus(id: string, status: TableStatus): Promise<RestaurantTable> {
    const res = await fetch(`/api/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async updateTablePosition(id: string, position_x: number, position_y: number): Promise<RestaurantTable> {
    const res = await fetch(`/api/tables/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position_x, position_y }),
    });
    return res.json();
  },

  // Menu
  async getCategories(): Promise<MenuCategory[]> {
    const res = await fetch('/api/menu/categories');
    return res.json();
  },

  async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    const url = categoryId ? `/api/menu/items?category_id=${categoryId}` : '/api/menu/items';
    const res = await fetch(url);
    return res.json();
  },

  async toggleItemAvailability(id: string, available: boolean): Promise<MenuItem> {
    const res = await fetch(`/api/menu/items/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    });
    return res.json();
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    const res = await fetch('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },

  // Orders
  async getOrders(status?: string): Promise<Order[]> {
    const url = status ? `/api/orders?status=${status}` : '/api/orders';
    const res = await fetch(url);
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    return res.json();
  },

  async createOrder(data: {
    table_id: string;
    source: 'QR' | 'POS' | 'WAITER';
    items: Array<{
      menu_item_id: string;
      quantity: number;
      notes?: string;
      variant?: { variant_id: string; name: string; price: number };
      addons?: Array<{ addon_id: string; name: string; price: number }>;
    }>;
    customer_name?: string;
    customer_phone?: string;
    discount?: number;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update order status');
    }
    return res.json();
  },

  // KDS
  async getKitchenOrders(): Promise<KitchenOrder[]> {
    const res = await fetch('/api/kds');
    return res.json();
  },

  async updateKitchenStatus(id: string, status: KitchenOrderStatus): Promise<KitchenOrder> {
    const res = await fetch(`/api/kds/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Billing & Invoices
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch('/api/invoices');
    return res.json();
  },

  async generateInvoice(order_id: string, discount: number = 0): Promise<Invoice> {
    const res = await fetch('/api/billing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, discount }),
    });
    return res.json();
  },

  // UPI Info
  async getUPIInfo(orderId: string): Promise<{
    upiIntentUrl: string;
    qrDataUrl: string;
    vpa: string;
    payeeName: string;
    amount: number;
    orderNumber: string;
  }> {
    const res = await fetch(`/api/payments/upi-info?order_id=${orderId}`);
    return res.json();
  },

  // Demo Payment Confirmation
  async confirmDemoPayment(order_id: string, payment_method: PaymentMethod = 'UPI_QR'): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/payments/confirm-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, payment_method }),
    });
    return res.json();
  },

  // Analytics & RestIQ
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  async getRestIQ(): Promise<RestIQInsight[]> {
    const res = await fetch('/api/restiq');
    return res.json();
  },

  // Live Dining Simulation
  async simulateTick(): Promise<{ success: boolean; action: string; message: string }> {
    const res = await fetch('/api/simulate/tick', { method: 'POST' });
    return res.json();
  },

  async toggleSimulation(enabled?: boolean): Promise<{ active: boolean; message?: string }> {
    const res = await fetch('/api/simulate/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  },

  async getSimulationStatus(): Promise<{ active: boolean }> {
    const res = await fetch('/api/simulate/status');
    return res.json();
  },
};
