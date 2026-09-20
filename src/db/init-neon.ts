import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

export async function initNeonDatabase() {
  console.log('[Neon DB] Initializing PostgreSQL database tables on Neon...');

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      logo_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      gst_number TEXT DEFAULT '',
      restaurant_type TEXT DEFAULT 'Dine-in',
      upi_vpa TEXT DEFAULT 'restos@upi',
      tax_percentage NUMERIC(5, 2) DEFAULT 5.00,
      primary_color TEXT DEFAULT '#15803d',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT DEFAULT '',
      opening_time TEXT DEFAULT '11:00 AM',
      closing_time TEXT DEFAULT '11:00 PM',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      branch_id TEXT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'OWNER',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS restaurant_settings (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      currency_symbol TEXT DEFAULT '₹',
      enable_qr_ordering BOOLEAN DEFAULT TRUE,
      enable_upi_payments BOOLEAN DEFAULT TRUE,
      auto_accept_qr_orders BOOLEAN DEFAULT FALSE,
      default_discount_pct NUMERIC(5, 2) DEFAULT 0.00,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      capacity INTEGER DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      position_x INTEGER DEFAULT 0,
      position_y INTEGER DEFAULT 0,
      current_order_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      price NUMERIC(10, 2) NOT NULL,
      vegetarian BOOLEAN DEFAULT TRUE,
      available BOOLEAN DEFAULT TRUE,
      preparation_time INTEGER DEFAULT 15,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      branch_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      source TEXT DEFAULT 'QR',
      status TEXT NOT NULL DEFAULT 'NEW',
      subtotal NUMERIC(10, 2) NOT NULL,
      discount NUMERIC(10, 2) DEFAULT 0.00,
      tax NUMERIC(10, 2) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      payment_status TEXT DEFAULT 'PENDING',
      customer_name TEXT,
      customer_phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL,
      menu_item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price NUMERIC(10, 2) NOT NULL,
      variant_name TEXT,
      notes TEXT,
      total_price NUMERIC(10, 2) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kitchen_orders (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      table_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      order_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NEW',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS kitchen_order_items (
      id TEXT PRIMARY KEY,
      kitchen_order_id TEXT NOT NULL REFERENCES kitchen_orders(id) ON DELETE CASCADE,
      order_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      variant TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      invoice_number TEXT NOT NULL,
      table_number TEXT NOT NULL,
      items_json JSONB NOT NULL,
      subtotal NUMERIC(10, 2) NOT NULL,
      discount NUMERIC(10, 2) NOT NULL,
      tax NUMERIC(10, 2) NOT NULL,
      tax_percentage NUMERIC(5, 2) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      invoice_id TEXT,
      amount NUMERIC(10, 2) NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      transaction_ref TEXT,
      is_demo BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );
  `;

  console.log('[Neon DB] Tables created successfully.');

  // Check if a restaurant already exists
  const existingRestaurants = await sql`SELECT id FROM restaurants LIMIT 1`;
  if (existingRestaurants.length === 0) {
    console.log('[Neon DB] Seeding single real restaurant entry in Neon database...');
    const restId = 'rest-01';
    const branchId = 'branch-01';

    await sql`
      INSERT INTO restaurants (id, name, slug, logo_url, description, phone, address, gst_number, upi_vpa, tax_percentage)
      VALUES (
        ${restId},
        'The Green Table',
        'the-green-table',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=80',
        'Farm-to-table organic dining & artisan culinary lounge',
        '+91 98765 43210',
        '104 Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560001',
        '29AAAAA0000A1Z5',
        'thegreentable@okaxis',
        5.00
      )
    `;

    await sql`
      INSERT INTO branches (id, restaurant_id, name, address, opening_time, closing_time)
      VALUES (${branchId}, ${restId}, 'Main Outlet - Lavelle Rd', 'Lavelle Road, Bengaluru', '11:00 AM', '11:00 PM')
    `;

    await sql`
      INSERT INTO restaurant_settings (id, restaurant_id, currency_symbol, enable_qr_ordering, enable_upi_payments, auto_accept_qr_orders, default_discount_pct)
      VALUES ('set-01', ${restId}, '₹', TRUE, TRUE, FALSE, 0.00)
    `;

    // Add admin / owner credentials: admin/admin and yiic/yiic
    await sql`
      INSERT INTO users (id, restaurant_id, branch_id, name, username, email, password_hash, role)
      VALUES 
        ('usr-admin', ${restId}, ${branchId}, 'Admin Operator', 'admin', 'admin@restos.internal', 'admin', 'OWNER'),
        ('usr-yiic', ${restId}, ${branchId}, 'Yiic Executive', 'yiic', 'yiic@restos.internal', 'yiic', 'OWNER')
    `;

    // Seed real dining tables
    const initialTables = [
      { id: 'tbl-1', number: 'T-01', capacity: 2, x: 80, y: 80, status: 'AVAILABLE' },
      { id: 'tbl-2', number: 'T-02', capacity: 4, x: 260, y: 80, status: 'AVAILABLE' },
      { id: 'tbl-3', number: 'T-03', capacity: 4, x: 440, y: 80, status: 'AVAILABLE' },
      { id: 'tbl-4', number: 'T-04', capacity: 6, x: 80, y: 240, status: 'AVAILABLE' },
      { id: 'tbl-5', number: 'T-05', capacity: 4, x: 260, y: 240, status: 'AVAILABLE' },
      { id: 'tbl-6', number: 'T-06', capacity: 2, x: 440, y: 240, status: 'AVAILABLE' },
    ];

    for (const t of initialTables) {
      await sql`
        INSERT INTO tables (id, branch_id, table_number, capacity, status, position_x, position_y)
        VALUES (${t.id}, ${branchId}, ${t.number}, ${t.capacity}, ${t.status}, ${t.x}, ${t.y})
      `;
    }

    // Seed real menu categories
    const categories = [
      { id: 'cat-starters', name: 'Starters & Small Plates', sort: 1 },
      { id: 'cat-mains', name: 'Artisan Mains', sort: 2 },
      { id: 'cat-beverages', name: 'Handcrafted Beverages', sort: 3 },
      { id: 'cat-desserts', name: 'Pastries & Desserts', sort: 4 },
    ];

    for (const c of categories) {
      await sql`
        INSERT INTO menu_categories (id, restaurant_id, name, sort_order)
        VALUES (${c.id}, ${restId}, ${c.name}, ${c.sort})
      `;
    }

    // Seed real menu items
    const menuItems = [
      { id: 'itm-1', cat: 'cat-starters', name: 'Truffle Mushroom Bruschetta', desc: 'Toasted sourdough with wild forest mushrooms, garlic truffle glaze and micro herbs', price: 340, veg: true, prep: 12 },
      { id: 'itm-2', cat: 'cat-starters', name: 'Paneer Tikka Charcoal Skewer', desc: 'Cottage cheese steeped in Kashmiri chili yogurt roasted over clay charcoal', price: 380, veg: true, prep: 15 },
      { id: 'itm-3', cat: 'cat-mains', name: 'Slow-Simmered Dal Makhani & Roti', desc: 'Black lentils slow-cooked overnight with churned butter and hand-rolled tandoori rotis', price: 420, veg: true, prep: 15 },
      { id: 'itm-4', cat: 'cat-mains', name: 'Wood-Fired Margherita Pizza', desc: 'San Marzano tomatoes, fresh buffalo mozzarella, virgin olive oil and torn basil', price: 490, veg: true, prep: 18 },
      { id: 'itm-5', cat: 'cat-mains', name: 'Wild Mushroom Risotto', desc: 'Arborio rice cooked in vegetable stock with porcini, parmesan shavings, and truffle oil', price: 540, veg: true, prep: 20 },
      { id: 'itm-6', cat: 'cat-beverages', name: 'Cold Pressed Hibiscus Cooler', desc: 'Organic Egyptian hibiscus with mint, kaffir lime and sparkling mineral water', price: 190, veg: true, prep: 5 },
      { id: 'itm-7', cat: 'cat-beverages', name: 'Signature Filter Coffee Brew', desc: 'Chikmagalur dark roast chicory blend brewed traditionally with frothed milk', price: 160, veg: true, prep: 5 },
      { id: 'itm-8', cat: 'cat-desserts', name: 'Warm Belgian Dark Chocolate Fondant', desc: 'Molten center dark chocolate lava cake paired with Madagascar vanilla bean gelato', price: 290, veg: true, prep: 12 },
    ];

    for (const m of menuItems) {
      await sql`
        INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, vegetarian, available, preparation_time)
        VALUES (${m.id}, ${restId}, ${m.cat}, ${m.name}, ${m.desc}, ${m.price}, ${m.veg}, TRUE, ${m.prep})
      `;
    }

    console.log('[Neon DB] Seeded single real restaurant entry with live menu and tables.');
  } else {
    // Ensure admin and yiic users exist even if tables were previously created
    const userRows = await sql`SELECT username FROM users WHERE username IN ('admin', 'yiic')`;
    const existingUsernames = userRows.map(r => r.username);
    const restId = existingRestaurants[0].id;
    const branches = await sql`SELECT id FROM branches WHERE restaurant_id = ${restId} LIMIT 1`;
    const branchId = branches.length > 0 ? branches[0].id : null;

    if (!existingUsernames.includes('admin')) {
      await sql`
        INSERT INTO users (id, restaurant_id, branch_id, name, username, email, password_hash, role)
        VALUES ('usr-admin', ${restId}, ${branchId}, 'Admin Operator', 'admin', 'admin@restos.internal', 'admin', 'OWNER')
      `;
    }
    if (!existingUsernames.includes('yiic')) {
      await sql`
        INSERT INTO users (id, restaurant_id, branch_id, name, username, email, password_hash, role)
        VALUES ('usr-yiic', ${restId}, ${branchId}, 'Yiic Executive', 'yiic', 'yiic@restos.internal', 'yiic', 'OWNER')
      `;
    }
    console.log('[Neon DB] Verified admin/admin and yiic/yiic owner credentials in Neon DB.');
  }
}

if (process.argv[1]?.includes('init-neon.ts')) {
  initNeonDatabase()
    .then(() => {
      console.log('[Neon DB] Ready!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Neon DB] Initialization failed:', err);
      process.exit(1);
    });
}
