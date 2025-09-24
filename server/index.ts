import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import {LanguageDetector,handle} from 'i18next-http-middleware';
import path from 'path';


import * as dotenv from 'dotenv';
dotenv.config({path : "../.env"});

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

app.use(express.json());
