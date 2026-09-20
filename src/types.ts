export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'KITCHEN' | 'WAITER';

export type TableStatus = 'AVAILABLE' | 'ORDERING' | 'OCCUPIED' | 'PAYMENT_PENDING' | 'RESERVED';

export type OrderSource = 'QR' | 'POS' | 'WAITER';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'PAID'
  | 'CANCELLED';

export type KitchenOrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'UPI_QR' | 'UPI_INTENT' | 'CARD';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  slogan?: string;
  phone: string;
  address: string;
  gst_number: string;
  restaurant_type: string;
  upi_vpa: string;
  tax_percentage: number;
  primary_color: string;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  opening_time: string;
  closing_time: string;
  created_at: string;
}

export interface User {
  id: string;
  restaurant_id: string;
  branch_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  branch_id: string;
  table_number: string;
  capacity: number;
  status: TableStatus;
  position_x: number;
  position_y: number;
  current_order_id?: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItemVariant {
  id: string;
  name: string; // e.g. Small, Medium, Large
  price: number;
}

export interface MenuItemAddon {
  id: string;
  name: string; // e.g. Extra Cheese, Olives, Jalapenos
  price: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  image_url?: string;
  price: number;
  vegetarian: boolean;
  available: boolean;
  preparation_time: number; // in minutes
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  created_at: string;
}

export interface SelectedAddon {
  addon_id: string;
  name: string;
  price: number;
}

export interface SelectedVariant {
  variant_id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  variant?: SelectedVariant | null;
  addons?: SelectedAddon[];
  notes?: string;
  total_price: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  branch_id: string;
  table_id: string;
  table_number: string;
  order_number: string;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_status: PaymentStatus;
  customer_name?: string;
  customer_phone?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface KitchenOrder {
  id: string;
  order_id: string;
  table_id: string;
  table_number: string;
  order_number: string;
  status: KitchenOrderStatus;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes?: string;
    variant?: string;
    addons?: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  restaurant_id: string;
  order_id: string;
  invoice_number: string;
  table_number: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  tax_percentage: number;
  total: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  invoice_id?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref?: string;
  is_demo: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  today_revenue: number;
  today_orders: number;
  average_order_value: number;
  active_tables: number;
  revenue_trend: Array<{ time: string; revenue: number }>;
  orders_trend: Array<{ time: string; orders: number }>;
  top_selling_items: Array<{ name: string; quantity: number; revenue: number }>;
  category_performance: Array<{ category: string; revenue: number; count: number }>;
  payment_distribution: Array<{ name: string; value: number; count: number }>;
  peak_hours: Array<{ hour: string; orders: number }>;
}

export interface RestIQInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'highlight';
  title: string;
  metric: string;
  description: string;
  recommendation: string;
  confidence: string;
}
