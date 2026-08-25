import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';

// Adapters
import { MockCustomerAdapter } from './adapters/MockCustomerAdapter.js';
import { MockInvoiceAdapter } from './adapters/MockInvoiceAdapter.js';
import { MockPaymentAdapter } from './adapters/MockPaymentAdapter.js';
import { MockQueueAdapter } from './adapters/MockQueueAdapter.js';

// Services
import { AuthService } from './services/AuthService.js';
import { CustomerService } from './services/CustomerService.js';
import { BillingService } from './services/BillingService.js';
import { PaymentService } from './services/PaymentService.js';
import { QueueEngine } from './services/QueueEngine.js';
import { ComplaintService } from './services/ComplaintService.js';

// Routes
import { createAuthRouter } from './routes/auth.routes.js';
import { createCustomerRouter } from './routes/customer.routes.js';
import { createInvoiceRouter } from './routes/invoice.routes.js';
import { createPaymentRouter } from './routes/payment.routes.js';
import { createQueueRouter } from './routes/queue.routes.js';
import { createComplaintRouter } from './routes/complaint.routes.js';
import { createNewsRouter } from './routes/news.routes.js';
import { createBranchRouter } from './routes/branch.routes.js';

export function createApp(): Express {
  const app = express();

  // Core Middlewares
  app.use(cors());
  app.use(express.json());

  // Instantiate Adapters
  const customerAdapter = new MockCustomerAdapter();
  const invoiceAdapter = new MockInvoiceAdapter();
  const paymentAdapter = new MockPaymentAdapter();
  const queueAdapter = new MockQueueAdapter();

  // Instantiate Services
  const authService = new AuthService();
  const customerService = new CustomerService(customerAdapter);
  const billingService = new BillingService(invoiceAdapter);
  const paymentService = new PaymentService(paymentAdapter, invoiceAdapter);
  const queueEngine = new QueueEngine(queueAdapter);
  const complaintService = new ComplaintService();

  // Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'AquaFlow CAWACO API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Mount API v1 Routers
  app.use('/api/v1/auth', createAuthRouter(authService));
  app.use('/api/v1/customers', createCustomerRouter(customerService));
  app.use('/api/v1/invoices', createInvoiceRouter(billingService));
  app.use('/api/v1/payments', createPaymentRouter(paymentService));
  app.use('/api/v1/queue', createQueueRouter(queueEngine));
  app.use('/api/v1/complaints', createComplaintRouter(complaintService));
  app.use('/api/v1/news', createNewsRouter());
  app.use('/api/v1/branches', createBranchRouter());

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
