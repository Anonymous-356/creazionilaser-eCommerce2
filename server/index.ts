import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { v4 as uuidv4 } from 'uuid'
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { storage } from "./storage";
import { unless }  from 'express-unless'; // You would need to install this: npm install express-unless

import {LanguageDetector,handle} from 'i18next-http-middleware';
import path from 'path';

import Stripe from 'stripe';

import * as dotenv from 'dotenv';
dotenv.config({path : "../.env"});

const stripe = new Stripe("sk_test_51RdqmFAJosTY6SBe3nh6nKuUDeol0ETTtCQA4RDSMt4AoxcM66P0nizSdOEcMV4o3o12s2Sa8WcnWwjTtgSeSFeY00rqw0spTy", {
  //apiVersion: '2024-04-10.basil',
});


i18next
  .use(Backend)                     // Connects the file system backend
  .use(LanguageDetector)            // Enables automatic language detection
  .init({
    backend: {
      loadPath: path.join(process.cwd(), '../client/src/i18n/', '{{lng}}', '{{ns}}.json'), // Path to translation files
    },
    detection: {
      order: ['querystring', 'cookie'],  // Priority: URL query string first, then cookies
      caches: ['cookie'],                // Cache detected language in cookies
    },
    fallbackLng: 'en',                   // Default language when no language is detected
    preload: ['en', 'it'],               // Preload these languages at startup
});

const app = express();

// Apply express.json() globally but exclude specific paths
// let jsonMiddleware = express.json();
// jsonMiddleware = unless({ path: ['/api/webhook'] }); // Add the unless method to your middleware

// app.use(express.json().unless({ path: ['/api/webhook'] })); // Exclude /api/upload from JSON parsing

app.use(express.urlencoded({ extended: false }));
app.use(handle(i18next));

app.use((req, res, next) => {

  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error("Error:", err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable for production deployment (Render)
  // Default to 5000 for local development
  const port = parseInt(process.env.PORT || "8080", 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();

app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    
    console.log('Webhook...');
    
    const signature = req.headers['stripe-signature'];
    const endpointSignature = "whsec_kgjRih569Y6uUpkXrAFY8Vd10RIAK0uI";
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signature!,endpointSignature);
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(session);

      return;

      const userId = parseInt(session.metadata!.userId);
      const cartItems = JSON.parse(session.metadata!.cartItems);

      const shippingDetails = session!.customer_details;
      const orderData = {
        userId: userId,
        orderNumber: uuidv4(),
        totalAmount: parseInt((session.amount_total! / 100).toString()),
        shippingAddress: {
          name: shippingDetails?.name,
          address: `${shippingDetails?.address?.line1} ${shippingDetails?.address?.line2 || ''}`,
          city: shippingDetails?.address?.city,
          zipCode: shippingDetails?.address?.postal_code,
          country: shippingDetails?.address?.country,
        },
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const items = cartItems.map((item: any) => ({
        orderId: 0, // This will be set by the storage layer
        productId: parseInt(item.productId),
        // designId: item.design?.id,
        quantity: parseInt(item.quantity),
        unitPrice: parseInt(item.price),
        customization: item.customization,
      }));

      try {
        const order = await storage.createOrder(orderData, items);
        console.log(order);
        console.log(`Order created for user ${userId}`);
      } catch (error) {
        console.error(`Error creating order for user ${userId}:`, error);
      }
    }

    res.json({received: true});
});

app.use(express.json());
