import express, { type Request, Response, NextFunction,RequestHandler } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { v4 as uuidv4 } from 'uuid'
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { storage } from "./storage";
import transporter from "./mailer";
import { unless }  from 'express-unless'; // You would need to install this: npm install express-unless

import {LanguageDetector,handle} from 'i18next-http-middleware';
import path from 'path';

import Stripe from 'stripe';

import * as dotenv from 'dotenv';
dotenv.config({path : "../.env"});

const stripe = new Stripe("pk_live_51RdqmFAJosTY6SBeGtrKbHfRNQYJdvejjCQye6HhzUDOCbrPWBrW1KUTmuxzdWQzSSNqU7ojjiunzaDaV1aIYiYU00Cf0L90nn", {
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
const myMiddleware: RequestHandler = (req, res, next) => {
    // ... middleware logic
  next();
}
    
(myMiddleware as any).unless = unless; 

// Or, if using a custom type for middleware with unless:
interface MiddlewareWithUnless extends RequestHandler {
  unless: typeof unless;
}

let jsonBodyParser: MiddlewareWithUnless = Object.assign(myMiddleware, { unless: unless });
jsonBodyParser = unless({ path: ['/api/webhook'] })


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
    
    const signature = req.headers['stripe-signature'];
    const endpointSignature = "whsec_ardTC6a2P2mLwoxVnWY8GrK6n9mN8KKg";
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
      //console.log(session);

      const userId = parseInt(session.metadata!.userId);
      const cartItems = JSON.parse(session.metadata!.cartItems);

      const shippingDetails = session!.customer_details;
      const orderData = {
        userId: userId,
        orderNumber: uuidv4(),
        totalAmount: parseInt((session.amount_total! / 100).toString()),
        paymentStatus : "processed",
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
        const subject = "We've Received Your Order"
        const to = shippingDetails?.email;
        //const to = 'noreply@creazionilaser.com';
        const messageBody = `<h3>Hi ${shippingDetails?.name},</h3>
                              <p>We have successfully received your order,Following are the order details for your info:</p>
                              <ul style="list-style:none !important;">
                                <li><b>Order# : </b>ORD-${order.id}</li>
                                <li><b>Order Total : </b>€${parseInt((session.amount_total! / 100).toString())}</li>
                                <li><b>Payment Status : </b>Processed</li>
                            </ul>`;

        await sendEmailHtmlTemplate(to,subject,messageBody);
        console.log(`Order created for user ${userId}`);
      } catch (error) {
        console.error(`Error creating order for user ${userId}:`, error);
      }
    }

    res.json({received: true});
});

app.use(express.json());



async function sendEmailHtmlTemplate(to : any,subject : any,messageBody : any){
  
  // Define Message Body with HTML
  const htmlBody = ` <div style="background: #f5f5f5;">
                      <table border="0" cellspacing="0" cellpadding="0" width="602" align="center" style=" width: 97%;margin: 0 auto; max-width:600px;">
                          <tbody>
                          <tr>
                              <td align="left" style="font-family:Arial;font-size:12px;color:#000000;display:flex;justify-content:center;">
                                <img src='https://ci3.googleusercontent.com/meips/ADKq_NaaWlXYZ84iHXOhdcCjlvS-ORWqLTJZOSvy7Ny4_tZpG_O-P4THqJYp297V5Bf1yJHJvQog2n9r5dmBtU4YN8XYxWGEkJdh2V1OggWEd5kd7yW9AXFMXKVu=s0-d-e1-ft#https://creazionilaser.com/uploads/86c865afac2283f69423030f427ef09a' alt='Logo Image' target='_blank' style='height:150px;width:auto;' />
                              </td>
                          </tr>

                          <tr>
                              <td align="left"
                                  style="font-family:Arial;font-size:12px;color:#37404a;border: solid 1px #c8c8c8;border-right:solid 1px #c8c8c8;
                                  padding:40px 40px 50px 40px; line-height:18px;background: #fff;">
                                  ${messageBody}
                              </td>
                          </tr>
                          <td align="left" style="font-family:Arial;font-size:12px;color:#000000">
                              <br><br><br><br>
                          </td>
                          

                          </tbody>
                      </table>
                    </div>`;

  // Define email options
  let mailOptions = {
      from: 'admin@efficientitconsulting.com', // Sender
      to: to, // Recipient(s)
      subject: subject, // Subject
      html: `${htmlBody}` // Message Body
  };

  // Send the email
  transporter.sendMail(mailOptions,(error,info)=>{
    if (error) {
        console.log('Error sending email:', error);
    } else {
        console.log('Email sent successfully: %s', info.response);
    }
  });
}
