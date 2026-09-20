import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { neonStore, subscribeToEvents } from './src/db/neon-store';
import { generateUPIIntentUrl } from './src/lib/utils';
import QRCode from 'qrcode';

async function startServer() {
  // Initialize Neon DB connection and tables
  await neonStore.init();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // API Routes (FIRST)
  // ----------------------------------------------------

  // 1. Health & Database Status
  app.get('/api/health', (req: Request, res: Response) => {
    const isNeonConfigured = Boolean(process.env.DATABASE_URL);
    res.json({
      status: 'ok',
      service: 'RestOS Lite Core Engine',
      database: 'Neon PostgreSQL (Cloud Active)',
      neonConfigured: isNeonConfigured,
      neonAuthUrl: process.env.NEON_AUTH_BASE_URL || null,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Real-time Events (Server-Sent Events)
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial keep-alive
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

    const unsubscribe = subscribeToEvents((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    req.on('close', () => {
      unsubscribe();
    });
  });

  // 3. Neon Auth & Owner Credentials (admin/admin, yiic/yiic)
  app.get('/api/auth/info', (req: Request, res: Response) => {
    res.json({
      enabled: true,
      provider: 'Neon Auth (Fastify/Better-Auth backend)',
      neonAuthUrl: process.env.NEON_AUTH_BASE_URL || '',
      defaultAccounts: [
        { username: 'admin', role: 'OWNER', label: 'Admin (Master)' },
        { username: 'yiic', role: 'OWNER', label: 'Yiic (Executive)' },
      ],
    });
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      const result = await neonStore.authenticateUser(username, password);
      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Authentication failed' });
    }
  });

  app.get('/api/auth/session', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '') || (req.query.token as string);
      if (!token) return res.status(401).json({ user: null });
      const user = await neonStore.getSession(token);
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to verify session' });
    }
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '') || req.body.token;
      if (token) await neonStore.logout(token);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  // 4. Demo Reset (Clean state in Neon DB)
  app.post('/api/demo/reset', async (req: Request, res: Response) => {
    const result = await neonStore.resetDemoData();
    res.json(result);
  });

  // 5. Restaurant & Settings
  app.get('/api/restaurant', (req: Request, res: Response) => {
    res.json(neonStore.getRestaurant());
  });

  app.patch('/api/restaurant', async (req: Request, res: Response) => {
    const updated = await neonStore.updateRestaurant(req.body);
    res.json(updated);
  });

  // 6. Tables & Visual Floor
  app.get('/api/tables', (req: Request, res: Response) => {
    res.json(neonStore.getTables());
  });

  app.get('/api/tables/:id', (req: Request, res: Response) => {
    const table = neonStore.getTable(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const currentOrder = neonStore.getCurrentOrderByTableId(table.id);
    res.json({ ...table, current_order: currentOrder || null });
  });

  app.patch('/api/tables/:id/status', async (req: Request, res: Response) => {
    const { status } = req.body;
    const table = await neonStore.updateTableStatus(req.params.id, status);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  });

  app.patch('/api/tables/:id/position', async (req: Request, res: Response) => {
    const { position_x, position_y } = req.body;
    const table = await neonStore.updateTablePosition(req.params.id, position_x, position_y);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  });

  // 7. Menu Management
  app.get('/api/menu/categories', (req: Request, res: Response) => {
    res.json(neonStore.getCategories());
  });

  app.get('/api/menu/items', (req: Request, res: Response) => {
    const categoryId = req.query.category_id as string | undefined;
    res.json(neonStore.getMenuItems(categoryId));
  });

  app.post('/api/menu/items', async (req: Request, res: Response) => {
    const item = await neonStore.addMenuItem(req.body);
    res.json(item);
  });

  app.patch('/api/menu/items/:id/availability', async (req: Request, res: Response) => {
    const { available } = req.body;
    const item = await neonStore.updateMenuItemAvailability(req.params.id, Boolean(available));
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  });

  // 8. Orders & Central State Machine
  app.get('/api/orders', (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    res.json(neonStore.getOrders(status));
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = neonStore.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const order = await neonStore.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    const { status } = req.body;
    const result = await neonStore.transitionOrderStatus(req.params.id, status);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result.order);
  });

  // 9. Kitchen Display System (KDS)
  app.get('/api/kds', (req: Request, res: Response) => {
    res.json(neonStore.getKitchenOrders());
  });

  app.patch('/api/kds/:id/status', async (req: Request, res: Response) => {
    const { status } = req.body;
    const ko = await neonStore.updateKitchenOrderStatus(req.params.id, status);
    if (!ko) return res.status(404).json({ error: 'Kitchen order not found' });
    res.json(ko);
  });

  // 10. Billing & Invoices
  app.get('/api/invoices', (req: Request, res: Response) => {
    res.json(neonStore.getInvoices());
  });

  app.get('/api/invoices/:orderId', (req: Request, res: Response) => {
    const invoice = neonStore.getInvoiceByOrderId(req.params.orderId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  });

  app.post('/api/billing/generate', async (req: Request, res: Response) => {
    const { order_id, discount } = req.body;
    const invoice = await neonStore.generateInvoice(order_id, discount);
    if (!invoice) return res.status(404).json({ error: 'Order not found' });
    res.json(invoice);
  });

  // 11. UPI Intent & QR Generation
  app.get('/api/payments/upi-info', async (req: Request, res: Response) => {
    const orderId = req.query.order_id as string;
    const order = neonStore.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const restaurant = neonStore.getRestaurant();
    const upiIntentUrl = generateUPIIntentUrl({
      pa: restaurant.upi_vpa || 'thegreentable@okaxis',
      pn: restaurant.name || 'The Green Table',
      am: order.total,
      tn: `RestOS Order ${order.order_number}`,
      tr: `RESTOS-${order.id}`,
    });

    try {
      const qrDataUrl = await QRCode.toDataURL(upiIntentUrl, {
        margin: 1,
        width: 320,
        color: {
          dark: '#15803d',
          light: '#ffffff',
        },
      });

      res.json({
        upiIntentUrl,
        qrDataUrl,
        vpa: restaurant.upi_vpa,
        payeeName: restaurant.name,
        amount: order.total,
        orderNumber: order.order_number,
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });

  // 12. Payments & Demo Payment Confirmation
  app.post('/api/payments/confirm-demo', async (req: Request, res: Response) => {
    const { order_id, payment_method = 'UPI_QR' } = req.body;
    const result = await neonStore.confirmPayment(order_id, payment_method, true);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  // 13. Analytics & RestIQ
  app.get('/api/analytics', (req: Request, res: Response) => {
    res.json(neonStore.getAnalytics());
  });

  app.get('/api/restiq', (req: Request, res: Response) => {
    res.json(neonStore.getRestIQInsights());
  });

  // 14. Live Environment Simulation (SSE Auto-Updates)
  let autoSimInterval: NodeJS.Timeout | null = null;

  app.get('/api/simulate/status', (req: Request, res: Response) => {
    res.json({ active: Boolean(autoSimInterval) });
  });

  app.post('/api/simulate/tick', async (req: Request, res: Response) => {
    const result = await neonStore.simulateLiveEvent();
    res.json(result);
  });

  app.post('/api/simulate/toggle', (req: Request, res: Response) => {
    const { enabled } = req.body;
    const shouldEnable = enabled !== undefined ? Boolean(enabled) : !autoSimInterval;

    if (shouldEnable && !autoSimInterval) {
      autoSimInterval = setInterval(async () => {
        try {
          await neonStore.simulateLiveEvent();
        } catch (e) {
          console.error('Simulation error:', e);
        }
      }, 12000);
      return res.json({ active: true, message: 'Live dining shift simulator started (12s interval)' });
    } else if (!shouldEnable && autoSimInterval) {
      clearInterval(autoSimInterval);
      autoSimInterval = null;
      return res.json({ active: false, message: 'Live simulator paused' });
    }

    res.json({ active: Boolean(autoSimInterval) });
  });

  // ----------------------------------------------------
  // Vite Middleware Setup
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RestOS Lite] Server running on http://0.0.0.0:${PORT} with Neon PostgreSQL`);
  });
}

startServer();
