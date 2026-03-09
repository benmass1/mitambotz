import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  // Simple In-Memory User Store (for demo purposes)
  const users: any[] = [];

  // Register
  app.post("/backend/register", (req, res) => {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = { id: Date.now().toString(), name, email, password, role, phone };
    users.push(newUser);
    
    res.json({ success: true, user: { id: newUser.id, name, email, role, phone } });
  });

  // Login
  app.post("/backend/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      // For demo, if no users exist yet, let's allow a default login or return error
      if (users.length === 0 && email === "admin@mitambo.tz" && password === "admin123") {
        const admin = { id: "1", name: "Admin", email: "admin@mitambo.tz", role: "Manager" };
        return res.json({ success: true, user: admin });
      }
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  });

  // Log Visit
  app.post("/backend/log-visit", (req, res) => {
    console.log('Visit Logged:', req.body);
    res.json({ success: true });
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
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ina run kwenye port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
