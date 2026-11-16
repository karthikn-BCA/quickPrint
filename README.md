# CampusPrint: Smart College Xerox & Online Printing Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite Version](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

> **"Your Documents. Our Printer. Zero Waiting."**

**CampusPrint** is a production-oriented web application and automated printing system engineered for a college campus Xerox and printing center. It eliminates morning campus queues by allowing students to upload assignments and reports online, configure printing options (single/double-sided, color/black & white, copies, custom page subsets), review calculated sheet costs, pay online via Razorpay, and have documents automatically output by a local Windows Print Agent directly on the shop's printer.

---

## 🌟 Key Features

- **SaaS-Grade Modern UI**: Built with React, Vite, Tailwind CSS, and Lucide Icons. Clean, mobile-first responsive design.
- **Secure Document Upload**: Drag-and-drop file upload for PDF, JPG, JPEG, and PNG files with size limits (up to 25MB) and automatic PDF page count detection.
- **Granular Print Configuration**:
  - Color Mode: Black & White vs Vivid Colour
  - Printing Sides: Single-sided vs Double-sided (Duplex)
  - Number of Copies
  - Page Range Selection: All pages or custom subsets (e.g. `1-5, 8, 10-12`)
  - Paper Size: Standard A4
- **Accurate Physical Sheet Pricing Engine**:
  - Automatically calculates physical sheets according to duplex math:
    - Single-sided: $\text{Sheets} = \text{Pages} \times \text{Copies}$
    - Double-sided: $\text{Sheets} = \lceil\text{Pages} / 2\rceil \times \text{Copies}$
  - Prices are dynamically configured by the shopkeeper (never hardcoded in frontend).
  - All amounts are independently verified on the backend.
- **Razorpay Online Payments**:
  - Integrated with Razorpay test mode (INR).
  - Strict server-side HMAC SHA-256 signature verification.
  - Test sandbox simulation mode available when running without live bank credentials.
  - Unpaid or unverified orders **never** enter the print queue.
- **Automated Windows Print Agent**:
  - Dedicated background application running locally on the shopkeeper's Windows PC.
  - Connects to backend via WebSockets (Socket.IO) and authenticated polling fallback.
  - Slices requested page ranges via `pdf-lib` and sends jobs to the connected physical printer.
  - Safe Hardware Simulation mode (`--simulate`) allows testing the entire pipeline without wasting physical paper.
  - Built-in duplicate-print protection.
- **Real-Time Order Tracking**:
  - Live 4-step visual progress stepper: *Payment Successful* ➔ *Order Queued* ➔ *Printing* ➔ *Ready for Collection*.
  - Push notifications via WebSockets.
  - Protected by Customer Data Isolation (Order ID + Mobile verification).
- **Admin & Shopkeeper Dashboard**:
  - Live revenue analytics, today's order counts, printer status indicator.
  - Queue management: filter by status, search by order ID or phone number.
  - Order actions: Preview document, mark printed, handover to student, retry failed jobs.
  - Dynamic pricing editor: modify B&W and Color rates in real-time.

---

## 🏗️ System Architecture

```
Student Browser (React / Vite)
        │
        ▼
Node.js + Express Backend (Port 5000)
        │
        ├── Mongoose / MongoDB (Database & Pricing Store)
        ├── Multer (Private Secure File Storage)
        ├── Razorpay Payment Signature Verification (HMAC SHA-256)
        └── Socket.IO Real-Time Dispatch Hub
                    │
                    ▼
Windows Print Agent (Shopkeeper PC)
        │
        ├── Document Download Stream
        ├── Page Range Slicing (pdf-lib)
        └── Windows Print Spooler / Simulation Mode
                    │
                    ▼
Connected Physical Printer ➔ Ready at Campus Counter
```

---

## 🚀 Quick Start (Running Locally)

### 1. Clone the Repository
```powershell
git clone https://github.com/karthikn-BCA/quickPrint.git
cd quickPrint
```

### 2. Start Local MongoDB
Ensure MongoDB is running on port 27017:
```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "c:\project\backend\data\db" --port 27017
```

### 3. Start the Backend API
```powershell
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 4. Start the Windows Print Agent (Simulation Mode)
In a new terminal window:
```powershell
cd print-agent
npm install
npm run simulate
```

### 5. Start the Frontend Application
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser!*

---

## 🔑 Default Credentials

- **Admin Portal**: `http://localhost:5173/admin/login`
- **Email**: `admin@campusprint.edu`
- **Password**: `Admin@CampusPrint2026`
- **Agent API Key**: `cp_agent_key_campusprint_secure_2026`

---

## 📁 Repository Structure

```
├── backend/               # Node.js + Express API & Socket.IO server
│   ├── src/
│   │   ├── config/        # Database & Razorpay setup
│   │   ├── controllers/   # Auth, Orders, Documents, Payments, Admin, Agent
│   │   ├── middleware/    # Auth, Multer, Rate Limiting, Error handling
│   │   ├── models/        # Mongoose schemas (User, Order, Document, etc.)
│   │   ├── routes/        # REST endpoints
│   │   ├── services/      # Pricing engine, PDF inspection, WebSockets
│   │   └── server.js      # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/              # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/    # Navbar, Footer, UploadZone, ConfigCard, etc.
│   │   ├── context/       # CartContext, AuthContext, SocketContext
│   │   ├── pages/         # Home, Upload, Cart, Checkout, Tracking, Admin
│   │   ├── services/      # API client & helpers
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── print-agent/           # Windows Print Agent daemon
│   ├── src/
│   │   ├── agent.js       # WebSocket & Polling agent
│   │   ├── printer.js     # Windows spooler & simulation handler
│   │   └── config.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PHYSICAL_PRINTER_SETUP.md
│   ├── DEPLOYMENT.md
│   └── SECURITY_AUDIT_REPORT.md
├── .gitignore
└── README.md
```

---

## 🛡️ Security Hardening

- **Private Document Storage**: Uploads are stored in private directories outside the web root. Files are never publicly accessible via direct URLs.
- **Server-Side Pricing**: Prices and sheet counts are recalculated and validated on the backend. Frontend prices are never trusted.
- **Payment Verification**: Payments must pass cryptographic HMAC-SHA256 signature checks before entering the printing queue.
- **Rate Limiting**: Multi-tier rate limiting for login, document uploads, and general API calls.
- **Customer Isolation**: Order details require matching mobile number or session token.

---

## 📄 License
This project is licensed under the MIT License.
