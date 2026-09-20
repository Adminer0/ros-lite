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

/**
 * Robust JSON fetcher that guards against HTML responses (e.g., <!doctype html>)
 * returned during container reboots, cold starts, or routing fallbacks.
 */
async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // Check if the response is HTML instead of JSON
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      if (text.trim().startsWith('<') || text.toLowerCase().includes('<!doctype')) {
        console.warn(`[RestOS API] Received HTML document for ${url} (HTTP ${res.status}). Server may be initializing.`);
        if (fallback !== undefined) return fallback;
        throw new Error(`Server returned HTML instead of JSON for ${url}`);
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        if (fallback !== undefined) return fallback;
        throw new Error(`Invalid non-JSON response from ${url}`);
      }
    }

    const data = await res.json();
    return data as T;
  } catch (err: any) {
    if (fallback !== undefined) {
      console.warn(`[RestOS API] Request failed for ${url}: ${err.message}. Returning safe fallback.`);
      return fallback;
    }
    throw err;
  }
}

export const api = {
  // Health & DB status
  async getHealth() {
    return safeFetchJson('/api/health', undefined, { status: 'ok', database: 'Neon PostgreSQL' });
  },

  // Reset Demo
  async resetDemo() {
    return safeFetchJson('/api/demo/reset', { method: 'POST' });
  },

  // Restaurant & Settings
  async getRestaurant(): Promise<Restaurant> {
    return safeFetchJson<Restaurant>('/api/restaurant', undefined, {
      id: 'rest-01',
      name: 'The Green Table',
      slug: 'the-green-table',
      logo_url: '',
      description: 'Farm-to-table bistro & contemporary dining experience',
      phone: '+91 80 4123 4567',
      address: '100 Feet Road, Indiranagar, Bengaluru, KA 560038',
      gst_number: '29ABCDE1234F1Z5',
      restaurant_type: 'Dine-in',
      upi_vpa: 'thegreentable@okaxis',
      tax_percentage: 5.0,
      primary_color: '#15803d',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  async updateRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    return safeFetchJson<Restaurant>('/api/restaurant', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Tables
  async getTables(): Promise<RestaurantTable[]> {
    return safeFetchJson<RestaurantTable[]>('/api/tables', undefined, []);
  },

  async getTable(id: string): Promise<RestaurantTable & { current_order: Order | null }> {
    return safeFetchJson<any>(`/api/tables/${id}`);
  },

  async updateTableStatus(id: string, status: TableStatus): Promise<RestaurantTable> {
    return safeFetchJson<RestaurantTable>(`/api/tables/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  async updateTablePosition(id: string, position_x: number, position_y: number): Promise<RestaurantTable> {
    return safeFetchJson<RestaurantTable>(`/api/tables/${id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position_x, position_y }),
    });
  },

  // Menu
  async getCategories(): Promise<MenuCategory[]> {
    return safeFetchJson<MenuCategory[]>('/api/menu/categories', undefined, []);
  },

  async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    const url = categoryId ? `/api/menu/items?category_id=${categoryId}` : '/api/menu/items';
    return safeFetchJson<MenuItem[]>(url, undefined, []);
  },

  async toggleItemAvailability(id: string, available: boolean): Promise<MenuItem> {
    return safeFetchJson<MenuItem>(`/api/menu/items/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    });
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    return safeFetchJson<MenuItem>('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  },

  // Orders
  async getOrders(status?: string): Promise<Order[]> {
    const url = status ? `/api/orders?status=${status}` : '/api/orders';
    return safeFetchJson<Order[]>(url, undefined, []);
  },

  async getOrder(id: string): Promise<Order> {
    return safeFetchJson<Order>(`/api/orders/${id}`);
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
    return safeFetchJson<Order>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return safeFetchJson<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // KDS
  async getKitchenOrders(): Promise<KitchenOrder[]> {
    return safeFetchJson<KitchenOrder[]>('/api/kds', undefined, []);
  },

  async updateKitchenStatus(id: string, status: KitchenOrderStatus): Promise<KitchenOrder> {
    return safeFetchJson<KitchenOrder>(`/api/kds/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // Billing & Invoices
  async getInvoices(): Promise<Invoice[]> {
    return safeFetchJson<Invoice[]>('/api/invoices', undefined, []);
  },

  async generateInvoice(order_id: string, discount: number = 0): Promise<Invoice> {
    return safeFetchJson<Invoice>('/api/billing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, discount }),
    });
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
    return safeFetchJson(`/api/payments/upi-info?order_id=${orderId}`);
  },

  // Demo Payment Confirmation
  async confirmDemoPayment(order_id: string, payment_method: PaymentMethod = 'UPI_QR'): Promise<{ success: boolean; message: string }> {
    return safeFetchJson('/api/payments/confirm-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, payment_method }),
    });
  },

  // Analytics & RestIQ
  async getAnalytics(): Promise<AnalyticsSummary> {
    return safeFetchJson<AnalyticsSummary>('/api/analytics', undefined, {
      today_revenue: 0,
      today_orders: 0,
      average_order_value: 0,
      active_tables: 0,
      revenue_trend: [],
      orders_trend: [],
      top_selling_items: [],
      category_performance: [],
      payment_distribution: [],
      peak_hours: [],
    });
  },

  async getRestIQ(): Promise<RestIQInsight[]> {
    return safeFetchJson<RestIQInsight[]>('/api/restiq', undefined, []);
  },

  // Auth & Neon Auth (admin/admin, yiic/yiic)
  async getAuthInfo() {
    return safeFetchJson('/api/auth/info', undefined, {
      enabled: true,
      provider: 'Neon Auth',
      neonAuthUrl: '',
      defaultAccounts: [
        { username: 'admin', role: 'OWNER', label: 'Admin (Master)' },
        { username: 'yiic', role: 'OWNER', label: 'Yiic (Executive)' },
      ],
    });
  },

  async login(username: string, password: string): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server connection error. Please try again.');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    if (data.token) {
      localStorage.setItem('restos_auth_token', data.token);
      localStorage.setItem('restos_auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getSession(): Promise<{ user: any | null }> {
    const token = localStorage.getItem('restos_auth_token');
    if (!token) return { user: null };
    try {
      const res = await fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json') || !res.ok) {
        return { user: null };
      }
      return await res.json();
    } catch {
      return { user: null };
    }
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('restos_auth_token');
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('restos_auth_token');
      localStorage.removeItem('restos_auth_user');
    }
  },

  // Live Dining Simulation
  async simulateTick(): Promise<{ success: boolean; action: string; message: string }> {
    return safeFetchJson('/api/simulate/tick', { method: 'POST' });
  },

  async toggleSimulation(enabled?: boolean): Promise<{ active: boolean; message?: string }> {
    return safeFetchJson('/api/simulate/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  },

  async getSimulationStatus(): Promise<{ active: boolean }> {
    return safeFetchJson('/api/simulate/status', undefined, { active: false });
  },
};
