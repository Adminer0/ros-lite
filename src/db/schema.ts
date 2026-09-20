import { pgTable, text, integer, timestamp, boolean, numeric, jsonb, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN', 'WAITER']);
export const tableStatusEnum = pgEnum('table_status', ['AVAILABLE', 'ORDERING', 'OCCUPIED', 'PAYMENT_PENDING', 'RESERVED']);
export const orderSourceEnum = pgEnum('order_source', ['QR', 'POS', 'WAITER']);
export const orderStatusEnum = pgEnum('order_status', [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SERVED',
  'BILLED',
  'PAID',
  'CANCELLED',
]);
export const kitchenOrderStatusEnum = pgEnum('kitchen_order_status', ['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'UPI_QR', 'UPI_INTENT', 'CARD']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED']);

// 1. Restaurants
export const restaurants = pgTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo_url: text('logo_url').default(''),
  description: text('description').default(''),
  phone: text('phone').default(''),
  address: text('address').default(''),
  gst_number: text('gst_number').default(''),
  restaurant_type: text('restaurant_type').default('Dine-in'),
  upi_vpa: text('upi_vpa').default('thegreentable@okaxis'),
  tax_percentage: numeric('tax_percentage', { precision: 5, scale: 2 }).default('5.00'),
  primary_color: text('primary_color').default('#15803d'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Branches
export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address').default(''),
  opening_time: text('opening_time').default('11:00 AM'),
  closing_time: text('closing_time').default('11:00 PM'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 3. Users
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branch_id: text('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').default('OWNER').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 4. Restaurant Settings
export const restaurant_settings = pgTable('restaurant_settings', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  currency_symbol: text('currency_symbol').default('₹'),
  enable_qr_ordering: boolean('enable_qr_ordering').default(true),
  enable_upi_payments: boolean('enable_upi_payments').default(true),
  auto_accept_qr_orders: boolean('auto_accept_qr_orders').default(false),
  default_discount_pct: numeric('default_discount_pct', { precision: 5, scale: 2 }).default('0.00'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 5. Tables
export const tables = pgTable('tables', {
  id: text('id').primaryKey(),
  branch_id: text('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  table_number: text('table_number').notNull(),
  capacity: integer('capacity').default(4).notNull(),
  status: tableStatusEnum('status').default('AVAILABLE').notNull(),
  position_x: integer('position_x').default(0).notNull(),
  position_y: integer('position_y').default(0).notNull(),
  current_order_id: text('current_order_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 6. Menu Categories
export const menu_categories = pgTable('menu_categories', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
});

// 7. Menu Items
export const menu_items = pgTable('menu_items', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  category_id: text('category_id').notNull().references(() => menu_categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').default(''),
  image_url: text('image_url').default(''),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  vegetarian: boolean('vegetarian').default(true).notNull(),
  available: boolean('available').default(true).notNull(),
  preparation_time: integer('preparation_time').default(15).notNull(), // in minutes
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 8. Menu Item Variants
export const menu_item_variants = pgTable('menu_item_variants', {
  id: text('id').primaryKey(),
  menu_item_id: text('menu_item_id').notNull().references(() => menu_items.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Small, Medium, Large
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

// 9. Menu Item Add-ons
export const menu_item_addons = pgTable('menu_item_addons', {
  id: text('id').primaryKey(),
  menu_item_id: text('menu_item_id').notNull().references(() => menu_items.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Extra Cheese, Jalapeno, Olives
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

// 10. Orders
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  branch_id: text('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  table_id: text('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  order_number: text('order_number').notNull(),
  source: orderSourceEnum('source').default('QR').notNull(),
  status: orderStatusEnum('status').default('NEW').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  payment_status: paymentStatusEnum('payment_status').default('PENDING').notNull(),
  customer_name: text('customer_name'),
  customer_phone: text('customer_phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Order Items
export const order_items = pgTable('order_items', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  menu_item_id: text('menu_item_id').notNull().references(() => menu_items.id),
  menu_item_name: text('menu_item_name').notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  variant_name: text('variant_name'),
  variant_price: numeric('variant_price', { precision: 10, scale: 2 }),
  addons_json: jsonb('addons_json'), // Array of { name, price }
  notes: text('notes'),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
});

// 12. Kitchen Orders
export const kitchen_orders = pgTable('kitchen_orders', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  table_id: text('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  table_number: text('table_number').notNull(),
  order_number: text('order_number').notNull(),
  status: kitchenOrderStatusEnum('status').default('NEW').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Kitchen Order Items
export const kitchen_order_items = pgTable('kitchen_order_items', {
  id: text('id').primaryKey(),
  kitchen_order_id: text('kitchen_order_id').notNull().references(() => kitchen_orders.id, { onDelete: 'cascade' }),
  order_item_id: text('order_item_id').notNull().references(() => order_items.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  variant: text('variant'),
  addons: jsonb('addons'), // string[]
});

// 14. Invoices
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  invoice_number: text('invoice_number').notNull(),
  table_number: text('table_number').notNull(),
  items_json: jsonb('items_json').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull(),
  tax_percentage: numeric('tax_percentage', { precision: 5, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method'),
  payment_status: paymentStatusEnum('payment_status').default('PENDING').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 15. Payments
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  order_id: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  invoice_id: text('invoice_id').references(() => invoices.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').default('PENDING').notNull(),
  transaction_ref: text('transaction_ref'),
  is_demo: boolean('is_demo').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 16. QR Codes
export const qr_codes = pgTable('qr_codes', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  table_id: text('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  qr_svg: text('qr_svg'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 17. Customers
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: text('name'),
  phone: text('phone'),
  email: text('email'),
  total_orders: integer('total_orders').default(0).notNull(),
  total_spent: numeric('total_spent', { precision: 10, scale: 2 }).default('0.00').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 18. Audit Logs
export const audit_logs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  restaurant_id: text('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  actor_role: text('actor_role').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
