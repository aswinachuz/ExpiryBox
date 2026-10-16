# 📦 ExpiryBox — Publishing & App Installation Guide

ExpiryBox is engineered as an **Offline-First Progressive Web App (PWA)** backed by a unified **MERN** backend. You can run it on your local network, install it as a standalone app on your PC/Mac or phone, deploy it for free on cloud providers (Render, Railway, VPS), or package it into an Android APK.

---

## 🚀 1. Install ExpiryBox as an App (Zero Setup)

Because ExpiryBox is a compliant PWA with full app-manifest and service worker offline caching:

### 💻 Windows & Mac (Desktop App)
1. Open ExpiryBox in Google Chrome, Microsoft Edge, or Brave (`http://localhost:5000` or your deployed URL).
2. In the top navigation bar, click **Tools ▾** and select **📲 Install App (PC & Mobile)**.
   - *Alternatively*: Click the **Install ExpiryBox** icon that appears on the right side of your browser URL bar.
3. Click **Install**.
4. ExpiryBox will open in its own dedicated, frameless window with its own taskbar/dock icon and launcher shortcut.

### 📱 Android (Chrome / Brave / Samsung Internet)
1. Open your deployed ExpiryBox URL or local IP (e.g. `http://192.168.1.x:5000`) on your phone.
2. Tap the **Menu (hamburger)** or **Tools** in the app header and tap **📲 Install App (PC & Mobile)**.
   - *Alternatively*: Tap the 3 dots in Chrome and tap **"Add to Home screen"** or **"Install app"**.
3. ExpiryBox installs directly to your home screen and app drawer as a standalone native app with offline capability.

### 🍏 iPhone & iPad (Safari)
1. Open ExpiryBox in Safari.
2. Tap the **Share** button (the square icon with the arrow pointing up at the bottom of the screen).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. ExpiryBox will launch full screen without Safari browser chrome.

---

## ⚡ 2. Free Cloud Publishing on Vercel (Frontend + Serverless API)

ExpiryBox is configured for direct 1-click deployment on Vercel:

### Required Environment Variables on Vercel
Go to **Vercel Dashboard → Your Project (`expiry-box`) → Settings → Environment Variables** and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://admin:pass@cluster0.abcde.mongodb.net/expirybox?retryWrites=true&w=majority` | **Required**: MongoDB Atlas connection string |
| `JWT_SECRET` | `expirybox_jwt_secret_key_prod_2026_super_secure` | **Required**: Secret token encryption key |
| `NODE_ENV` | `production` | Recommended: Production runtime mode |
| `EMAIL_USER` | `your-email@gmail.com` | Optional: Gmail for automated deadline alerts |
| `EMAIL_PASS` | `abcd efgh ijkl mnop` | Optional: Gmail 16-char App Password |
| `NOTIFICATION_DEFAULT_EMAIL` | `your-email@gmail.com` | Optional: Recipient for email alerts |

### Step-by-Step Vercel Setup:
1. Push code to GitHub (`git push origin main`).
2. In Vercel, click **Redeploy** (under Deployments ▾ → Redeploy).
3. The Vite frontend will be served at edge speed from `client/dist`, and all `/api/*` requests will be routed to the serverless Express backend via `api/index.js`!

---

## ☁️ 3. Free Cloud Publishing (Render + MongoDB Atlas)

You can host ExpiryBox online with 100% free tiers:

### Step 1: Free MongoDB Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free M0 cluster.
2. Create a database user (e.g. `expirybox_admin` with a password).
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`).
4. Click **Connect** → **Drivers** and copy your connection string:
   ```
   mongodb+srv://expirybox_admin:<password>@cluster0.abcde.mongodb.net/expirybox?retryWrites=true&w=majority
   ```

### Step 2: 1-Click Deploy on Render
1. Push this repository to your GitHub account (`git push origin main`).
2. Log into [Render.com](https://render.com) and click **New +** → **Web Service** (or **Blueprint** using `render.yaml`).
3. Connect your GitHub repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection string from Step 1*
   - `JWT_SECRET`: *Any secure random string*
6. Click **Deploy Web Service**.
7. In ~2 minutes, Render will provide a live HTTPS URL (e.g. `https://expirybox.onrender.com`).

> [!TIP]
> Progressive Web Apps require **HTTPS** for service workers and native installation prompts. Render provides free automated SSL/HTTPS out of the box!

---

## 🐳 3. Self-Hosted Docker Deployment

If you have a Linux VPS (DigitalOcean, Hetzner, AWS, etc.) or local Docker:

1. Copy `.env.example` to `.env` and set your preferred passwords.
2. Run:
   ```bash
   docker compose up --build -d
   ```
3. ExpiryBox and MongoDB are now running with persistent storage volumes:
   - Web App & API: `http://localhost:5000`
   - MongoDB: `localhost:27017`

---

## 📱 4. Packaging into an Android APK (Google PWABuilder / TWA)

If you wish to distribute an `.apk` file or publish to Google Play Store:

1. **Option A — Web-based (PWABuilder)**:
   - Go to [pwabuilder.com](https://www.pwabuilder.com/).
   - Paste your deployed ExpiryBox URL (e.g. `https://expirybox.onrender.com`).
   - Click **Package for Stores** → **Android**.
   - Download the generated `.apk` or `.aab` package ready for installation or Play Console.

2. **Option B — Bubblewrap CLI**:
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest="https://your-domain.com/manifest.json"
   bubblewrap build
   ```

---

## 🛠️ 5. Local Development Commands

```bash
# Install dependencies in both client and server
npm run install:all

# Seed database with sample family members, assets, and tracked items
npm run seed

# Start server backend
npm run dev:server

# Start Vite client dev server
npm run dev:client

# Compile production PWA bundle
npm run build

# Run production unified server (serves frontend + API on port 5000)
npm start
```
