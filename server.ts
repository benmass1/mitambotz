
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import os from 'os';

const app = express();
const PORT = 3000;

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Ensure data directory exists
// Use /tmp in production to ensure write permissions
const DATA_DIR = path.join(os.tmpdir(), 'dr_mitambo_data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR);
    console.log(`Created data directory at ${DATA_DIR}`);
  } catch (err) {
    console.error(`Failed to create data directory at ${DATA_DIR}:`, err);
  }
} else {
  console.log(`Using existing data directory at ${DATA_DIR}`);
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json');

// Helper to read/write JSON
const readJson = (file: string) => {
  if (!fs.existsSync(file)) return [];
  try {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const writeJson = (file: string, data: any) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Helper to hash password (using simple crypto for demo)
import crypto from 'crypto';
const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// API Routes

// 1. Register User
app.post(['/backend/register', '/backend/register/'], (req, res) => {
  const { name, email, phone, role, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Jina, Email na Password vinahitajika' });
  }

  const users = readJson(USERS_FILE);
  
  // Check if email exists
  if (users.find((u: any) => u.email === email)) {
    return res.status(400).json({ error: 'Email hii tayari imeshasajiliwa' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    role: role || 'Technician',
    password: hashPassword(password), // Store hashed password
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  console.log(`New user registered: ${name} (${email})`);
  // Don't send password back
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, user: userWithoutPassword });
});

app.get(['/backend/register', '/backend/register/'], (req, res) => {
  res.status(405).json({ error: 'Njia ya GET hairuhusiwi hapa. Tafadhali tumia POST kujisajiri.' });
});

// 1.5 Login User
app.post(['/backend/login', '/backend/login/'], (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email na Password vinahitajika' });
  }

  const users = readJson(USERS_FILE);
  const user = users.find((u: any) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'Mtumiaji hajapatikana. Tafadhali jisajiri kwanza.' });
  }

  if (user.password !== hashPassword(password)) {
    return res.status(401).json({ error: 'Neno la siri siyo sahihi' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.get(['/backend/login', '/backend/login/'], (req, res) => {
  res.status(405).json({ error: 'Njia ya GET hairuhusiwi hapa. Tafadhali tumia POST kuingia.' });
});

// 2. Log Visitor
app.post('/backend/log-visit', (req, res) => {
  const { userAgent, referrer, screenWidth, screenHeight, userEmail } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const visitors = readJson(VISITORS_FILE);
  
  const visit = {
    id: Date.now().toString(),
    ip,
    userEmail: userEmail || 'Guest',
    userAgent,
    referrer,
    screen: `${screenWidth}x${screenHeight}`,
    timestamp: new Date().toISOString()
  };

  visitors.push(visit);
  
  // Keep only last 1000 visits
  if (visitors.length > 1000) {
    visitors.shift();
  }
  
  writeJson(VISITORS_FILE, visitors);
  res.json({ success: true });
});

// Seed Default Admin
const seedAdmin = () => {
  const users = readJson(USERS_FILE);
  if (!users.find((u: any) => u.email === 'admin@mitambo.com')) {
    const adminUser = {
      id: 'admin-seed',
      name: 'System Admin',
      email: 'admin@mitambo.com',
      phone: '+255 000 000 000',
      role: 'Manager',
      password: hashPassword('admin123'),
      registeredAt: new Date().toISOString()
    };
    users.push(adminUser);
    writeJson(USERS_FILE, users);
    console.log('Default admin seeded: admin@mitambo.com');
  }
};
seedAdmin();

// 3. Get Stats (Admin only)
app.get('/backend/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/backend/admin/data', (req, res) => {
  // In a real app, verify admin token here
  const users = readJson(USERS_FILE).map((u: any) => {
    const { password, ...rest } = u;
    return rest;
  });
  const visitors = readJson(VISITORS_FILE).reverse(); // Newest first
  
  res.json({
    users,
    visitors
  });
});

// Explicit 404 handler for API routes
app.use('/backend', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Backend endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Vite Middleware (Must be last)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import to avoid bundling issues in production if vite is missing
    // But here we use tsx so vite should be available or we skip this block
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Failed to start Vite server:', e);
    }
  } else {
    // In production, serve static files from dist
    const DIST_DIR = path.join(process.cwd(), 'dist');
    app.use(express.static(DIST_DIR));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
    console.log(`Serving static files from ${DIST_DIR}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
