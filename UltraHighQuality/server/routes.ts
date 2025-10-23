import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import multer from "multer";
import { storage } from "./storage";
import { UltraSecureLuaObfuscator } from "./obfuscator";
import { BotDetector } from "./bot-detection";
import { obfuscateRequestSchema, loginSchema, type ObfuscateResponse } from "@shared/schema";

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Track active WebSocket connections
let activeUsers = 0;
const wsClients = new Set<WebSocket>();

// Broadcast user count to all connected clients
function broadcastUserCount() {
  const message = JSON.stringify({
    type: "userCount",
    count: activeUsers,
  });

  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Session middleware for authentication
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "sof-ultra-secure-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // ==================== AUTHENTICATION ENDPOINTS ====================

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate request body with schema
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validationResult.error.errors,
        });
      }

      const { username, password } = validationResult.data;

      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        console.error("ADMIN_USERNAME or ADMIN_PASSWORD environment variables not set");
        return res.status(500).json({ message: "Server configuration error" });
      }

      if (username === adminUsername && password === adminPassword) {
        req.session.isAuthenticated = true;
        req.session.username = username;
        
        return res.json({
          success: true,
          message: "Login successful",
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Check authentication status
  app.get("/api/auth/check", (req: any, res) => {
    if (req.session.isAuthenticated) {
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // ==================== OBFUSCATION ENDPOINT ====================

  app.post(
    "/api/obfuscate",
    requireAuth,
    upload.single("file"),
    async (req: any, res) => {
      try {
        let code: string;
        let level: "simple" | "medium" | "extreme";

        // Get code from file upload or request body
        if (req.file) {
          code = req.file.buffer.toString("utf-8");
        } else if (req.body.code) {
          code = req.body.code;
        } else {
          return res.status(400).json({ error: "No code provided" });
        }

        // Parse and validate request
        const validationResult = obfuscateRequestSchema.safeParse({
          code,
          level: req.body.level || "medium",
        });

        if (!validationResult.success) {
          return res.status(400).json({
            error: "Validation failed",
            details: validationResult.error.errors,
          });
        }

        level = validationResult.data.level;
        const originalSize = code.length;

        // Perform obfuscation
        const obfuscator = new UltraSecureLuaObfuscator(code, level);
        const obfuscatedCode = obfuscator.obfuscate();
        const obfuscatedSize = obfuscatedCode.length;

        // Store the obfuscated script
        const script = await storage.createScript({
          code: obfuscatedCode,
          originalSize,
          obfuscatedSize,
          level,
          accessCount: 0,
        });

        // Generate URLs
        const host = req.get("host");
        const protocol = req.get("x-forwarded-proto") || req.protocol;
        const scriptUrl = `${protocol}://${host}/script/${script.id}`;
        const loadstring = `loadstring(game:HttpGet("${scriptUrl}"))()`;

        const response: ObfuscateResponse = {
          success: true,
          id: script.id,
          loadstring,
          url: scriptUrl,
          obfuscatedCode,
          originalSize,
          obfuscatedSize,
          level,
          compressionRatio: obfuscatedSize / originalSize,
        };

        return res.json(response);
      } catch (error) {
        console.error("Obfuscation error:", error);
        return res.status(500).json({
          error: "Obfuscation failed",
          message: (error as Error).message,
        });
      }
    }
  );

  // ==================== SCRIPT MANAGEMENT ENDPOINTS ====================

  // Get all scripts
  app.get("/api/scripts", requireAuth, async (req, res) => {
    try {
      const scripts = await storage.getAllScripts();
      
      const scriptList = scripts.map((script) => ({
        id: script.id,
        originalSize: script.originalSize,
        obfuscatedSize: script.obfuscatedSize,
        level: script.level,
        accessCount: script.accessCount,
        createdAt: script.createdAt.toISOString(),
      }));

      return res.json(scriptList);
    } catch (error) {
      console.error("Get scripts error:", error);
      return res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  // Delete a script
  app.delete("/api/scripts/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteScript(id);

      if (deleted) {
        return res.json({ success: true });
      }

      return res.status(404).json({ error: "Script not found" });
    } catch (error) {
      console.error("Delete script error:", error);
      return res.status(500).json({ error: "Failed to delete script" });
    }
  });

  // ==================== SECURE SCRIPT SERVING ====================

  app.get("/script/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Check bot detection
      if (BotDetector.shouldBlock(req)) {
        console.log(
          `Blocked access to script ${id} from: ${req.get("User-Agent")} | IP: ${req.ip}`
        );
        return res.send(BotDetector.getBlockedResponse());
      }

      // Fetch script
      const script = await storage.getScript(id);

      if (!script) {
        return res.status(404).send("-- Script not found");
      }

      // Increment access count
      await storage.incrementAccessCount(id);

      // Serve the obfuscated code
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      
      return res.send(script.code);
    } catch (error) {
      console.error("Script serving error:", error);
      return res.status(500).send("-- Server error");
    }
  });

  // ==================== WEBSOCKET SERVER ====================

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    activeUsers++;
    wsClients.add(ws);
    
    console.log(`WebSocket connected. Active users: ${activeUsers}`);
    broadcastUserCount();

    ws.on("close", () => {
      activeUsers--;
      wsClients.delete(ws);
      
      console.log(`WebSocket disconnected. Active users: ${activeUsers}`);
      broadcastUserCount();
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(ws);
    });
  });

  // ==================== HEALTH CHECK ====================

  app.get("/health", async (req, res) => {
    try {
      const scripts = await storage.getAllScripts();
      return res.json({
        status: "ok",
        scriptsCount: scripts.length,
        activeUsers,
      });
    } catch (error) {
      return res.status(500).json({ status: "error" });
    }
  });

  return httpServer;
}

// Extend session type to include our custom properties
declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    username: string;
  }
}
