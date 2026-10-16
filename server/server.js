const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const itemRoutes = require('./routes/items');
const personRoutes = require('./routes/persons');
const assetRoutes = require('./routes/assets');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
let rawMongoUri = process.env.MONGO_URI || (process.env.VERCEL ? null : 'mongodb://127.0.0.1:27017/ExpiryBox');
// Auto-match exact Atlas case [ExpiryBox] to prevent case-collision errors
const MONGO_URI = rawMongoUri ? rawMongoUri.replace(/\/expirybox(?=[/?]|$)/gi, '/ExpiryBox') : null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Silence favicon requests to prevent 500s
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve uploaded documents & photos (Safe for both Serverless /tmp and persistent disk)
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem fallback
}
app.use('/uploads', express.static(uploadsDir));

// Database connection logic for both Serverless & Long-running Node server
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!MONGO_URI) {
    if (process.env.VERCEL) {
      console.warn('⚠️ MONGO_URI environment variable is missing on Vercel dashboard!');
    }
    return null;
  }
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'ExpiryBox',
    });
    isConnected = true;
    console.log(' Connected to MongoDB');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    return null;
  }
};

mongoose.set('bufferCommands', false);

// Ensure DB connected on API requests or return clear immediate status
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }

  if (mongoose.connection.readyState !== 1 && MONGO_URI) {
    try {
      await connectDB();
    } catch (err) {}
  }

  // If request is targeting an API database route and Mongo is still not connected
  const isApiRoute = req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/items') || req.path.startsWith('/persons');
  if (isApiRoute && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB database is not connected. Please add your MONGO_URI in Vercel Project Settings → Environment Variables.',
      mongoConnected: false,
    });
  }

  next();
});

// Health check (supports /api/health and /health under serverless rewrites)
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    app: 'ExpiryBox API',
    version: '1.0.2-patch',
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);

// Mount Routes (supporting both /api/xxx and /xxx for Vercel rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/items', itemRoutes);
app.use('/items', itemRoutes);

app.use('/api/persons', personRoutes);
app.use('/persons', personRoutes);

app.use('/api/assets', assetRoutes);

// Serve client build if available (Unified production hosting like Render/VPS/Docker/Vercel fallback)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    // If request was for an API route or a static asset (js, css, etc.) that wasn't found by express.static,
    // do NOT return index.html because that causes "Failed to fetch dynamically imported module" syntax errors
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/items') ||
      req.path.startsWith('/assets') ||
      /\.(js|css|map|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf)$/i.test(req.path)
    ) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const { initNotificationCron } = require('./services/notificationService');

// If executed directly as entrypoint (not when imported as a serverless module), start server
if (require.main === module) {
  connectDB()
    .then(() => {
      try {
        initNotificationCron();
      } catch (e) {
        console.warn('Cron init warning:', e.message);
      }
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 ExpiryBox Server listening on http://0.0.0.0:${PORT}`);
      });
    })
    .catch(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`⚠️ ExpiryBox Server listening on http://0.0.0.0:${PORT} (without active MongoDB)`);
      });
    });
}

module.exports = app;
