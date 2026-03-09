import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(VISITORS_FILE)) {
  fs.writeFileSync(VISITORS_FILE, JSON.stringify([]));
}

// Helper to read/write data
const readData = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeData = (file: string, data: any) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Request Logger
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  /*
  ------------------------------------
  API ENDPOINTS (Must be before Vite/Static)
  ------------------------------------
  */

  // Health Check
  app.get("/backend/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running smoothly" });
  });

  // Register
  app.post(["/api/register", "/api/register/"], (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Tafadhali jaza sehemu zote muhimu" });
    }
    
    const users = readData(USERS_FILE);
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Barua pepe hii tayari imesajiliwa" });
    }

    const newUser = { 
      id: Date.now().toString(), 
      name, 
      email: normalizedEmail, 
      password, 
      role, 
      phone,
      registeredAt: new Date().toISOString()
    };
    users.push(newUser);
    writeData(USERS_FILE, users);
    
    res.json({ success: true, user: { id: newUser.id, name, email: normalizedEmail, role, phone } });
  });

  // Login
  app.post(["/api/login", "/api/login/"], (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Tafadhali ingiza barua pepe na neno la siri" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check for hardcoded admin first (always available)
    if (normalizedEmail === "admin@mitambo.tz" && password === "admin123") {
      const admin = { id: "1", name: "Admin", email: "admin@mitambo.tz", role: "Manager", registeredAt: new Date().toISOString() };
      return res.json({ success: true, user: admin });
    }

    const users = readData(USERS_FILE);
    const user = users.find((u: any) => u.email.toLowerCase() === normalizedEmail && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: "Barua pepe au neno la siri si sahihi" });
    }
    
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  });

  // Log Visit
  app.post("/api/log-visit", (req, res) => {
    const { email, userAgent } = req.body;
    const visitors = readData(VISITORS_FILE);
    
    const visit = {
      id: Date.now().toString(),
      ip: req.ip || '127.0.0.1',
      userEmail: email || 'Guest',
      userAgent: userAgent || req.headers['user-agent'] || 'Unknown',
      timestamp: new Date().toISOString()
    };
    visitors.push(visit);
    writeData(VISITORS_FILE, visitors);
    
    console.log('Visit Logged:', visit);
    res.json({ success: true });
  });

  // Admin Data
  app.get("/api/admin/data", (req, res) => {
    const users = readData(USERS_FILE);
    const visitors = readData(VISITORS_FILE);
    
    res.json({
      users: users.map((u: any) => ({ ...u, password: undefined })), // Don't send passwords
      visitors: visitors.slice(-100) // Send last 100 visitors
    });
  });

  // USSD / API ENDPOINT
  app.all("/ussd", (req, res) => {
    let text = (req.body.text as string) || (req.query.text as string) || "";
    let response = "";

    if (text === "") {
      response = `CON Karibu BENMASS MITAMBO
1. Akaunti
2. Salio
3. Msaada`;
    } else if (text === "1") {
      response = "END Akaunti yako imefunguliwa.";
    } else if (text === "2") {
      response = "END Salio lako ni Tsh 10,000.";
    } else if (text === "3") {
      response = "END Wasiliana na huduma kwa wateja.";
    } else {
      response = "END Chaguo sio sahihi.";
    }

    res.set("Content-Type", "text/plain");
    res.send(response);
  });

  /*
  ------------------------------------
  VITE / STATIC ASSETS
  ------------------------------------
  */
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      app.get("*", (req, res) => {
        res.status(200).send(`
          <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1>Dr Mitambo TZ - Karibu!</h1>
            <p>Mfumo wa Backend upo tayari (Running), lakini muonekano (Frontend) bado haujawekwa.</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; display: inline-block; margin-top: 20px;">
              <strong>Hatua ya Kufuata:</strong><br>
              Tafadhali upload folder la <code>dist</code> kwenye seva yako kwa kutumia File Manager.<br>
              (Seva ya Namecheap haina RAM ya kutosha kufanya <code>npm run build</code>).
            </div>
          </div>
        `);
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ina run kwenye port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
