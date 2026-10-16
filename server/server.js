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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expirybox';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  if (!process.env.MONGO_URI && process.env.VERCEL) {
    console.warn('⚠️ MONGO_URI environment variable is missing on Vercel dashboard!');
  }
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(' Connected to MongoDB');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
};

// Ensure DB connected on API requests in serverless environments
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      // Continue so health check or fallback error responses can render
    }
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ExpiryBox API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/assets', assetRoutes);

// Serve client build if available (Unified production hosting like Render/VPS/Docker)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath) && !process.env.VERCEL) {
  console.log(`📦 Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
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
if (require.main === module && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      try {
        initNotificationCron();
      } catch (e) {
        console.warn('Cron init warning:', e.message);
      }
      app.listen(PORT, () => {
        console.log(`🚀 ExpiryBox Server listening on http://localhost:${PORT}`);
      });
    })
    .catch(() => {
      app.listen(PORT, () => {
        console.log(`⚠️ ExpiryBox Server listening on http://localhost:${PORT} (without active MongoDB)`);
      });
    });
}

module.exports = app;
