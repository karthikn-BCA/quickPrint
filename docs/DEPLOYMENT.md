# CampusPrint Deployment & Local Development Guide

## 1. Quick Local Development Setup

### A. Prerequisites
- **Node.js**: v18+ (Node v20+ recommended)
- **MongoDB**: v6.0+ running on `localhost:27017`

### B. Starting MongoDB
```powershell
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "c:\project\backend\data\db" --port 27017
```

### C. Starting Backend API
```powershell
cd c:\project\backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### D. Starting Windows Print Agent
```powershell
cd c:\project\print-agent
npm install
npm run simulate
```

### E. Starting Frontend Website
```powershell
cd c:\project\frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 2. Production Deployment

### Frontend (Static SPA):
- Build production assets: `cd frontend && npm run build`
- Deploy `frontend/dist` to Cloudflare Pages, Netlify, Vercel, or AWS S3 + CloudFront.

### Backend (Node.js API + WebSockets):
- Set `NODE_ENV=production`.
- Provide MongoDB Atlas connection string `MONGODB_URI`.
- Set high-entropy `JWT_SECRET`.
- Configure production Razorpay Keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- Configure allowed CORS origins `ALLOWED_ORIGINS=https://your-campus-print-domain.edu`.
- Deploy using Docker, PM2, Railway, Render, or an AWS EC2 instance.

### Print Agent:
- Runs permanently on the on-premise Windows computer at the campus Xerox shop.
- Connects securely to the production backend using `PRINT_AGENT_API_KEY`.
