import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore, subscribeToEvents } from './src/db/store';
import { generateUPIIntentUrl } from './src/lib/utils';
import QRCode from 'qrcode';

async function startServer() {
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
      database: isNeonConfigured ? 'Neon PostgreSQL (Connected)' : 'Neon PostgreSQL Fallback / Local Store Active',
      neonConfigured: isNeonConfigured,
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

  // 3. Demo Reset
  app.post('/api/demo/reset', (req: Request, res: Response) => {
    const result = dbStore.resetDemoData();
    res.json(result);
  });

  // 4. Restaurant & Settings
  app.get('/api/restaurant', (req: Request, res: Response) => {
    res.json(dbStore.getRestaurant());
  });

  app.patch('/api/restaurant', (req: Request, res: Response) => {
    const updated = dbStore.updateRestaurant(req.body);
    res.json(updated);
  });

  // 5. Tables & Visual Floor
  app.get('/api/tables', (req: Request, res: Response) => {
    res.json(dbStore.getTables());
  });

  app.get('/api/tables/:id', (req: Request, res: Response) => {
    const table = dbStore.getTable(req.params.id);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    const currentOrder = dbStore.getCurrentOrderByTableId(table.id);
    res.json({ ...table, current_order: currentOrder || null });
  });

  app.patch('/api/tables/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const table = dbStore.updateTableStatus(req.params.id, status);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  });

  app.patch('/api/tables/:id/position', (req: Request, res: Response) => {
    const { position_x, position_y } = req.body;
    const table = dbStore.updateTablePosition(req.params.id, position_x, position_y);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    res.json(table);
  });

  // 6. Menu Management
  app.get('/api/menu/categories', (req: Request, res: Response) => {
    res.json(dbStore.getCategories());
  });

  app.get('/api/menu/items', (req: Request, res: Response) => {
    const categoryId = req.query.category_id as string | undefined;
    res.json(dbStore.getMenuItems(categoryId));
  });

  app.post('/api/menu/items', (req: Request, res: Response) => {
    const item = dbStore.addMenuItem(req.body);
    res.json(item);
  });

  app.patch('/api/menu/items/:id/availability', (req: Request, res: Response) => {
    const { available } = req.body;
    const item = dbStore.updateMenuItemAvailability(req.params.id, Boolean(available));
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  });

  // 7. Orders & Central State Machine
  app.get('/api/orders', (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    res.json(dbStore.getOrders(status));
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = dbStore.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const order = dbStore.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const result = dbStore.transitionOrderStatus(req.params.id, status);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result.order);
  });

  // 8. Kitchen Display System (KDS)
  app.get('/api/kds', (req: Request, res: Response) => {
    res.json(dbStore.getKitchenOrders());
  });

  app.patch('/api/kds/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const ko = dbStore.updateKitchenOrderStatus(req.params.id, status);
    if (!ko) return res.status(404).json({ error: 'Kitchen order not found' });
    res.json(ko);
  });

  // 9. Billing & Invoices
  app.get('/api/invoices', (req: Request, res: Response) => {
    res.json(dbStore.getInvoices());
  });

  app.get('/api/invoices/:orderId', (req: Request, res: Response) => {
    const invoice = dbStore.getInvoiceByOrderId(req.params.orderId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  });

  app.post('/api/billing/generate', (req: Request, res: Response) => {
    const { order_id, discount } = req.body;
    const invoice = dbStore.generateInvoice(order_id, discount);
    if (!invoice) return res.status(404).json({ error: 'Order not found' });
    res.json(invoice);
  });

  // 10. UPI Intent & QR Generation
  app.get('/api/payments/upi-info', async (req: Request, res: Response) => {
    const orderId = req.query.order_id as string;
    const order = dbStore.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const restaurant = dbStore.getRestaurant();
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

  // 11. Payments & Demo Payment Confirmation
  app.post('/api/payments/confirm-demo', (req: Request, res: Response) => {
    const { order_id, payment_method = 'UPI_QR' } = req.body;
    const result = dbStore.confirmPayment(order_id, payment_method, true);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json(result);
  });

  // 12. Analytics & RestIQ
  app.get('/api/analytics', (req: Request, res: Response) => {
    res.json(dbStore.getAnalytics());
  });

  app.get('/api/restiq', (req: Request, res: Response) => {
    res.json(dbStore.getRestIQInsights());
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
    console.log(`[RestOS Lite] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
