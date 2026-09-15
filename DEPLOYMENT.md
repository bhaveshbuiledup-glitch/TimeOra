# TIMEORA Watch Store - Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

## Setup

### 1. Clone and Install

```bash
cd watch-store
npm install
cd server
npm install
cd ../client
npm install
```

### 2. Environment Variables

Copy `server/.env.example` to `server/.env` and fill in values:

```bash
cp server/.env.example server/.env
```

Required variables:
- `MONGO_URI` or `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Strong random secret (min 32 chars)
- `RAZORPAY_KEY_ID` - From Razorpay dashboard
- `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - SMTP config

### 3. Start Development

```bash
# Terminal 1: Backend
cd watch-store/server
npm run server

# Terminal 2: Frontend
cd watch-store/client
npm run dev
```

## MongoDB Backup Strategy

### Local MongoDB

```bash
# Backup
mongodump --db timeora_watches --out ./backup/$(date +%Y%m%d)

# Restore
mongorestore --db timeora_watches ./backup/20240101/timeora_watches
```

### MongoDB Atlas

Use Atlas automatic backups (included in free tier):
1. Go to Atlas → Database → Backups
2. Configure retention and schedule
3. Test restore periodically

## Production Deployment

### Backend (Vercel/Railway/Fly.io)

1. Set all environment variables
2. Build command: `node server/server.js`
3. Ensure MongoDB URI is production-grade
4. Set `NODE_ENV=production`

### Frontend (Vercel)

1. Push to GitHub
2. Vercel auto-detects and builds
3. Set `VITE_API_URL` to production API URL

### Environment Variables for Production

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/timeora_watches
JWT_SECRET=<strong-random-secret>
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
CLIENT_URL=https://yourdomain.com
```

## Migration/Seed Process

### Seed Database with Products

```bash
cd watch-store/server
node -e "
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const cats = ['Chronograph', 'Dress', 'Diver', 'Complication', 'Skeleton', 'Minimalist', 'Vintage', 'Haute Horlogerie'];
  for (const c of cats) {
    await Category.create({ name: c, slug: c.toLowerCase(), isActive: true });
  }
  console.log('Categories seeded');
  process.exit(0);
});
"
```

## Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running: `pgrep mongod`
- Check connection string in `.env`
- For Atlas: verify IP whitelist includes your IP

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```
