# MY SHOP — Cambodian E-commerce Platform

A production-ready e-commerce platform built for Cambodia with **Bakong KHQR** payment integration. Features a user-facing **Progressive Web App (PWA)** , an **admin dashboard**, and a **Node.js + Express API** backed by MongoDB — with **fully automated CI/CD** via GitHub Actions.

---

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend User     │     │   Frontend Admin    │
│   (Vue 3 + PWA)     │     │   (Vue 3)           │
│   Vercel (CDN)      │     │   Vercel (CDN)      │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         └──────────┬────────────────┘
                    │ HTTP / Socket.IO
                    ▼
         ┌─────────────────────┐     ┌─────────────────┐
         │   Backend API       │────▶│   MongoDB Atlas │
         │   Express + TS      │     │   (Mongoose)    │
         │   PM2 + Debian VM   │     └─────────────────┘
         │   (Home Server)     │
         └────────┬────────────┘
                  │
        ┌─────────┼────────────┐
        ▼         ▼            ▼
   ┌────────┐ ┌────────┐ ┌──────────┐
   │Bakong  │ │ABA     │ │Cloudinary│
   │KHQR API│ │PayWay  │ │(Images)  │
   └────────┘ └────────┘ └──────────┘
```

### Deployment Architecture

```
GitHub.com ─────────────── GitHub Actions ──────────────── Telegram
    │                            │                            │
    │                            ├── Backend Deploy ──────►   │
    │  push to main              │   (self-hosted runner)     │
    │  triggers workflows        │   on Debian VM             │
    │                            │                            │
    │                            ├── Frontend Deploy ────►   │
    │                            │   (Vercel deploy hooks)    │
    │                            │                            │
    └────────────────────────────┴────────────────────────────┘

          Backend Pipeline                          Frontend Pipeline
  ┌─────────────────────────┐        ┌───────────────────────────┐
  │ git fetch + reset --hard│        │ POST Vercel Deploy Hooks  │
  │ ./backend/deploy.sh     │        │ (User + Admin)            │
  │   ├─ npm ci / install   │        │ Vercel builds on their    │
  │   ├─ tsc (build)        │        │ servers automatically     │
  │   ├─ PM2 gracefulReload │        └───────────────────────────┘
  │   └─ Health check       │
  ├─ Vercel frontend hooks  │
  └─ Telegram notification  │
```

---

## Tech Stack

### Backend (`backend/`)
| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime |
| **Express 4** | HTTP framework |
| **TypeScript** | Type safety |
| **MongoDB Atlas** | Database (NoSQL) |
| **Mongoose 8** | ODM / schema modeling |
| **JWT** | Authentication |
| **Socket.IO** | Real-time (chat, notifications) |
| **Cloudinary** | Image hosting |
| **Bakong KHQR** | Cambodian QR payment |
| **ABA PayWay** | Alternative payment |
| **Multer** | File upload handling |
| **bcryptjs** | Password hashing |
| **Google Auth Library** | Google OAuth |
| **PM2** | Process manager (production) |

### Frontend User (`frontend-user/`)
| Technology | Purpose |
|---|---|
| **Vue 3** | UI framework (Composition API) |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Pinia** | State management |
| **Vue Router** | Routing |
| **TailwindCSS** | Utility-first styling |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time |
| **lucide-vue-next** | Icon library |
| **vue-i18n** | Internationalization (EN/KM) |
| **canvas-confetti** | Celebration effects |
| **vite-plugin-pwa** | PWA support |
| **@vueuse/core** | Composition utilities |

### Frontend Admin (`frontend-admin/`)
| Technology | Purpose |
|---|---|
| **Vue 3** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Pinia** | State management |
| **Vue Router** | Routing |
| **TailwindCSS** | Styling |
| **Axios** | HTTP client |
| **Chart.js + vue-chartjs** | Analytics charts |
| **vue-i18n** | Internationalization |

### DevOps & CI/CD
| Technology | Purpose |
|---|---|
| **GitHub Actions** | CI/CD pipeline automation |
| **Self-hosted runner** | Debian VM (back-end builds) |
| **Vercel Deploy Hooks** | Front-end auto-deploy |
| **PM2** | Process management, zero-downtime reload |
| **Telegram Bot** | Deployment notifications |

---

## Project Structure

```
root/
├── package.json                    # Root monorepo scripts
│
├── .github/workflows/              # GitHub Actions CI/CD
│   ├── backend-deploy.yml          # Backend auto-deploy pipeline
│   └── frontend-deploy.yml         # Frontend auto-deploy pipeline
│
├── backend/                        # Express.js API server
│   ├── deploy.sh                   # Zero-downtime deployment script
│   ├── ecosystem.config.js         # PM2 configuration
│   ├── releases/                   # Versioned release directories
│   ├── current -> releases/v2     # Active release symlink
│   ├── deploy.log                  # Deployment log
│   └── src/
│       ├── server.ts               # Entry point
│       ├── config/                 # DB, Cloudinary config
│       ├── controllers/            # Route handlers (13)
│       ├── middlewares/            # Auth, upload, error handler
│       ├── models/                 # Mongoose schemas (16)
│       ├── modules/                # Payment module (factory pattern)
│       ├── routes/                 # API routes (14)
│       ├── services/               # Biz logic (bakong, cloudinary, socket, etc.)
│       ├── types/                  # TypeScript interfaces
│       └── utils/                  # Helpers (JWT generation)
│
├── frontend-user/                  # Customer-facing PWA (Vercel)
│   └── src/
│       ├── App.vue                 # Root component
│       ├── main.ts                 # Entry point
│       ├── assets/                 # CSS, static assets
│       ├── components/             # Reusable components
│       │   ├── chat/               # Live chat widget
│       │   ├── coupon/             # Coupon cards
│       │   ├── khqr/               # KHQR payment components
│       │   └── skeleton/           # Loading skeletons
│       ├── composables/            # Vue composables (usePWA, useNetwork, etc.)
│       ├── i18n/                   # Translations (en/km)
│       ├── layouts/                # Page layouts
│       ├── pages/                  # Route pages (14)
│       ├── router/                 # Vue Router config
│       ├── services/               # API services (axios, auth, payment)
│       └── stores/                 # Pinia stores
│
├── frontend-admin/                 # Admin dashboard (Vercel)
│   └── src/
│       ├── App.vue
│       ├── main.ts
│       ├── assets/                 # CSS
│       ├── components/             # Admin components
│       ├── i18n/                   # Translations
│       ├── layouts/                # Dashboard layout
│       ├── pages/                  # Admin pages (18)
│       ├── router/                 # Admin routes
│       ├── services/               # API services
│       └── stores/                 # Admin Pinia stores
│
└── scripts/                        # Utility scripts
```

---

## Features

### User Features
| Feature | Status |
|---|---|
| Homepage: Hero banner, categories, flash sale, promotions, coupons | ✅ |
| Product listing with search, filter, sort, pagination | ✅ |
| Product detail with image gallery, quantity selector | ✅ |
| Shopping cart with coupon & promotion support | ✅ |
| Checkout: address, payment method selection | ✅ |
| KHQR payment flow with QR code, countdown, polling | ✅ |
| ABA PayWay payment flow | ✅ |
| Order management with status timeline | ✅ |
| Coupon center with tabs (available/used/expired/upcoming) | ✅ |
| User profile with orders & settings | ✅ |
| Live chat support with file upload | ✅ |
| Notifications center with grouping (Today/Yesterday/Week/Month) | ✅ |
| Dark/Light mode | ✅ |
| Internationalization (English / Khmer) | ✅ |
| Voice search | ✅ |
| Responsive design (320px – 1440px) | ✅ |

### PWA Features
| Feature | Status |
|---|---|
| Installable (manifest, service worker) | ✅ |
| Custom install modal with benefits & confetti | ✅ |
| Offline page with browsing capabilities | ✅ |
| Smart workbox caching (10 strategies) | ✅ |
| Auto-update on new deployment | ✅ |
| 6 app shortcuts (Search, Cart, Wishlist, Sale, Orders, Coupons) | ✅ |
| Background sync for offline data | ✅ |
| Network status pill (online/offline/syncing) | ✅ |
| Skeleton loading (7 types) | ✅ |
| Page transitions (slide, fade, scale) | ✅ |
| Pull-to-refresh | ✅ |
| Full-screen search overlay with trending | ✅ |

### Admin Features
| Feature | Status |
|---|---|
| Dashboard with analytics & charts | ✅ |
| Product CRUD (create, read, update, delete) | ✅ |
| Category management | ✅ |
| Order management with status updates | ✅ |
| User management with details | ✅ |
| Coupon system (create, track usage) | ✅ |
| Promotion management | ✅ |
| Transaction history | ✅ |
| Inventory system (warehouses, suppliers, stock movements) | ✅ |
| Hero slide management | ✅ |
| Live chat dashboard | ✅ |
| Notification management & scheduling | ✅ |
| Payment gateway configuration | ✅ |
| Settings & branding customization | ✅ |

---

## CI/CD Pipeline

The project uses **GitHub Actions** with two separate workflows for automated deployment.

### Workflow 1: Backend Deploy (`backend-deploy.yml`)

**Triggers:** When `backend/**` or `.github/workflows/backend-deploy.yml` changes on `main`

| Step | What Happens |
|------|-------------|
| 1. Self-hosted Runner | Runs on Debian VM (no SSH needed) |
| 2. Pull Latest Code | `git fetch origin main && git reset --hard origin/main` |
| 3. Run Deploy Script | `bash -x ./backend/deploy.sh` |
| 4. Health Check | Curls `https://api.lorndavid.online/api/health` (5 retries) |
| 5. Vercel Deploy | Triggers deploy hooks for both frontends |
| 6. Telegram Notification | Sends status update with commit info |

**Self-hosted Runner Setup:**
```bash
# On the Debian VM:
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download and configure (get token from GitHub → Settings → Actions → Runners)
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64-2.321.0.tar.gz
./config.sh --url https://github.com/lorndavid/fullstack_bakong_wpa --token YOUR_TOKEN

# Install as a service (starts on boot)
sudo ./svc.sh install
sudo ./svc.sh start
```

### Workflow 2: Frontend Deploy (`frontend-deploy.yml`)

**Triggers:** When `frontend-user/**`, `frontend-admin/**`, or `.github/workflows/frontend-deploy.yml` changes on `main`

| Step | What Happens |
|------|-------------|
| 1. Vercel User Hook | POSTs to Vercel deploy hook → auto-builds user frontend |
| 2. Vercel Admin Hook | POSTs to Vercel deploy hook → auto-builds admin dashboard |
| 3. Telegram Notification | Sends status update with commit info |

### Which Pipeline Runs?

| You change... | Workflow triggered |
|---|---|
| `backend/**` | ✅ Backend Deploy (builds on VM + deploys frontends) |
| `frontend-user/**` or `frontend-admin/**` | ✅ Frontend Deploy (Vercel only) |
| Both in same commit | ✅ Both run in parallel |

### Deployment Script (`backend/deploy.sh`)

The `deploy.sh` script provides **zero-downtime deployments** with:

- **Release versioning** — Each deploy creates `releases/v1`, `v2`, etc.
- **Atomic symlink swap** — `current` symlink switches instantly
- **PM2 graceful reload** — Handles existing connections before restarting
- **Health check** — Verifies the API is responding before completing
- **Automatic rollback** — Reverts to previous release if health check fails
- **Cleanup** — Keeps last 5 releases, removes older ones

```bash
# Usage
./backend/deploy.sh              # Normal deployment
./backend/deploy.sh --rollback   # Rollback to previous release
./backend/deploy.sh --status     # Show deployment status
```

### Required GitHub Secrets

| Secret | Used By | Description |
|--------|---------|-------------|
| `VERCEL_USER_DEPLOY_HOOK` | Both workflows | Vercel deploy hook URL for user frontend |
| `VERCEL_ADMIN_DEPLOY_HOOK` | Both workflows | Vercel deploy hook URL for admin frontend |
| `TELEGRAM_BOT_TOKEN` | Both workflows | Telegram bot token for notifications |
| `TELEGRAM_CHAT_ID` | Both workflows | Telegram chat ID to send notifications to |

> **Note:** SSH secrets (`SERVER_HOST`, `SERVER_PORT`, `SSH_PRIVATE_KEY`, etc.) are **no longer needed** — the self-hosted runner handles deployment directly on the VM.

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** >= 18
- **MongoDB Atlas** account (free tier)
- **Cloudinary** account (free tier)
- **Bakong KHQR** merchant access

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd bakong-ecommerce

# 2. Install all dependencies (root, backend, frontends)
npm run install:all

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 4. Run all three services
npm run dev
```

This starts:
- **Backend API:** `http://localhost:5000`
- **User Frontend:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5174`

### Seed Data

```bash
# Seed sample products, categories, etc.
npm run seed --prefix backend

# Or for minimal seed data:
npm run seed:sample --prefix backend
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default: 5000) |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API secret |
| `BAKONG_API_URL` | **Yes** | Bakong API base URL |
| `MERCHANT_BAKONG_ID` | **Yes** | Your Bakong merchant ID |
| `MERCHANT_NAME` | No | Merchant display name |
| `FRONTEND_USER_URL` | No | User frontend URL (CORS) |
| `FRONTEND_ADMIN_URL` | No | Admin frontend URL (CORS) |
| `VITE_GOOGLE_CLIENT_ID` | For Google Auth | Google OAuth client ID |

---

## API Endpoints

See the [WIKI.md](WIKI.md) for the complete API reference.

### Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | API health check |

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register with email/password |
| `POST` | `/api/auth/login` | No | Login with email/password |
| `POST` | `/api/auth/google` | No | Google OAuth |
| `GET` | `/api/auth/me` | User | Get current user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (search, filter, sort, paginate) |
| `GET` | `/api/products/featured` | Featured products |
| `GET` | `/api/products/flash-sale` | Flash sale products |
| `GET` | `/api/products/new-arrivals` | New arrivals |
| `GET` | `/api/products/:id` | Product detail |
| `GET` | `/api/products/:id/related` | Related products |
| `POST` | `/api/products` | Create product (admin) |
| `PUT` | `/api/products/:id` | Update product (admin) |
| `DELETE` | `/api/products/:id` | Delete product (admin) |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | User | Create order |
| `GET` | `/api/orders` | User | List user orders |
| `GET` | `/api/orders/:id` | User | Order detail |

### Coupons
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/coupons/available` | User | List user's coupons |
| `GET` | `/api/coupons/highlighted` | No | Highlighted/promoted coupons |
| `POST` | `/api/coupons/validate` | User | Validate a coupon code |
| `POST` | `/api/coupons/apply` | User | Apply coupon to cart |
| `POST` | `/api/coupons/best-coupon` | User | Find best coupon for cart |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create` | Create KHQR payment |
| `GET` | `/api/payments/check/:transactionId` | Check payment status |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | User | List notifications |
| `GET` | `/api/notifications/unread-count` | User | Unread count |
| `PUT` | `/api/notifications/:id/read` | User | Mark as read |
| `PUT` | `/api/notifications/read-all` | User | Mark all as read |
| `DELETE` | `/api/notifications/:id` | User | Delete notification |

### Categories, Promotions, Chat, Settings, etc.
See the [WIKI.md](WIKI.md) for the full API reference.

---

## Deployment

### Production URLs
| Service | URL | Hosting |
|---------|-----|---------|
| Backend API | `https://api.lorndavid.online` | Debian VM (home server) via Cloudflare Tunnel |
| User Frontend | User-facing PWA URL | Vercel |
| Admin Dashboard | Admin panel URL | Vercel |

### How Deployments Work

1. **Edit code** in VS Code on your Windows machine
2. **Commit and push** to the `main` branch
3. **GitHub Actions** automatically triggers the appropriate workflow:
   - Backend changes → builds on your Debian VM, reloads PM2
   - Frontend changes → Vercel rebuilds and deploys
4. **Telegram bot** sends a status notification

### Manual Commands (if needed)

```bash
# SSH into VM
ssh david@<vm-ip>

# Update code and deploy manually
cd ~/fullstack_bakong_wpa
git pull origin main
cd backend
./deploy.sh

# Check deployment status
./deploy.sh --status

# Rollback if needed
./deploy.sh --rollback

# View PM2 logs
pm2 logs myshop-backend
pm2 monit
```

> **Note:** Manual deployment is rarely needed — the CI/CD pipeline handles everything automatically on push.

---

## License

Private — All rights reserved.
