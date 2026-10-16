# 📦 ExpiryBox — Personal Deadline & Renewal Operating System

> **“One place to manage everything in your life that has a deadline, renewal, warranty, payment, or important document.”**

ExpiryBox is a full-stack **MERN** application built with a **human-crafted warm light design** (paper neutrals `#FAF9F6`, crisp white cards, and organic earth tones). It organizes household records around a clean 4-tier domain model:

$$\text{PERSON} \longrightarrow \text{ASSET} \longrightarrow \text{DOCUMENT} \longrightarrow \text{DEADLINE}$$

---

## 🌟 Advanced Features Implemented

### 1. 🔔 Snooze, Escalation & Missed-Reminder Recovery
- **Smart Snooze Options**: Postpone any alert until tomorrow (`+1 day`), next week (`+7 days`), or select a custom date with an optional reason note.
- **Missed-Reminder Recovery Modal**: When opening the app, immediately detects and surfaces deadlines that passed or triggered while away, enabling one-click Snooze or Renewal.
- **Dynamic Status State**: Snoozed items show a distinct purple badge and pause recurring alerts until the chosen wake date.

### 2. 🧾 Renewal History & Document Versioning
- **Year-over-Year Archive**: When renewing insurance, warranties, or licences, previous records are automatically archived.
- **Versioned Attachments**: Retain previous policy schedules and invoices alongside new renewals.
- **Activity History Audit Log**: Chronological trail of what changed, who performed it, and when (`created`, `snoozed`, `renewed`, `resolved`, `checklist_updated`).

### 3. 🔄 Recurring Schedules & Grace Periods
- **Automatic Cycle Roll-Forward**: Supports Monthly, Quarterly, Half-Yearly, and Annual recurring deadlines (e.g. Netflix, Rent, EMI, Subscriptions).
- **Grace Period Protection**: Tracks statutory grace periods (e.g. 15-day vehicle insurance grace period or 30-day health insurance buffer).

### 4. 👥 Shared Responsibility & Delegated Tasks
- Assign tasks to specific family members (e.g. Document Owner: *Aswin*, Task Delegated to: *Dad*).
- Clear assignee badges on cards and detail modals to coordinate household duties.

### 5. 🚗 Asset Hub & Garage View
- Dedicated portfolio view for physical assets: **Vehicles, Electronics, Appliances, and Bank Accounts**.
- Open a single asset (e.g. *Honda Activa 6G*) to view its complete nested records: **Insurance, PUC, Warranty, Service history**, and odometer reading without duplicate asset records.

### 6. ✅ Smart Renewal Preparation Checklists
- Pre-populated step-by-step checklists for Vehicle Insurance, Driving Licences, Electronics Warranties, and Health Policies.
- Direct links to official government and insurer portals:
  - **Parivahan Sarathi** (Driving Licence renewals)
  - **HDFC ERGO** (Vehicle insurance instant renewal)
  - **Star Health** (Cashless network and NCB claim check)
  - **State Bank of India** (FD maturity proceeds and Form 15G)

### 7. 📄 Printable Reports & Portable CSV Export
- **Printable Executive Summary**: Clean table formatted for offline printing (`window.print()`).
- **One-Click CSV Export**: Downloads complete inventory (`ExpiryBox_Inventory.csv`) with all owners, dates, amounts, and statuses.

### 8. 🌐 Indian Language Support (🇮🇳 മലയാളം + English)
- Instant language toggle in the top navigation bar.
- Fully localized interface for Kerala households (ഡാഷ്‌ബോർഡ്, കാലാവധി കഴിഞ്ഞവ, വരാനിരിക്കുന്നവ, ആസ്തികൾ, പുതുക്കുക, സ്നൂസ്).

### 9. 🔒 Privacy Controls Per Item
- Mark sensitive financial or identity items as **Private** (requires PIN unlock).
- Family-visible items remain accessible across household members in the Family Vault.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, i18n |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose 8) |
| **File Storage** | Multer (`/server/uploads/`) with image rotation & preview controls |
| **Design** | Human-Crafted Warm Light Palette (`#FAF9F6`, `#FFFFFF`, `#111827`) |

---

## 🚀 Running the Application

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Seeds realistic Indian household data with renewal history
node server.js   # Listens on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Opens http://localhost:5173
```

---

## 📱 Live Endpoints

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Missed Reminders**: [http://localhost:5000/api/items/missed-reminders](http://localhost:5000/api/items/missed-reminders)
- **CSV Data Export**: [http://localhost:5000/api/items/export/csv](http://localhost:5000/api/items/export/csv)
- **JSON Full Backup**: [http://localhost:5000/api/items/backup/export](http://localhost:5000/api/items/backup/export)
