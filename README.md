# MY SHOP — Cambodian E-commerce Platform

A production-ready e-commerce platform built for Cambodia with **Bakong KHQR** payment integration. Features a user-facing **Progressive Web App (PWA)** , an **admin dashboard**, and a **Node.js + Express API** backed by MongoDB.

---

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend User     │     │   Frontend Admin    │
│   (Vue 3 + PWA)     │     │   (Vue 3)           │
│   :5173             │     │   :5174             │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         └──────────┬────────────────┘
                    │ HTTP / Socket.IO
                    ▼
         ┌─────────────────────┐     ┌─────────────────┐
         │   Backend API       │────▶│   MongoDB Atlas │
         │   Express + TS      │     │   (Mongoose)    │
         │   :5000             │     └─────────────────┘
         └────────┬────────────┘
                  │
        ┌─────────┼────────────┐
        ▼         ▼            ▼
   ┌────────┐ ┌────────┐ ┌──────────┐
   │Bakong  │ │ABA     │ │Cloudinary│
   │KHQR API│ │PayWay  │ │(Images)  │
   └────────┘ └────────┘ └──────────┘
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

---

## Project Structure

```
root/
├── package.json                    # Root monorepo scripts
│
├── backend/                        # Express.js API server
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
├── frontend-user/                  # Customer-facing PWA
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
├── frontend-admin/                 # Admin dashboard
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

## Quick Start

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

### Backend
```bash
cd backend
npm run build          # Compile TypeScript → dist/
node dist/server.js    # Start production server
```

### Frontend User (PWA)
```bash
cd frontend-user
npm run build          # Outputs to dist/
# Serve dist/ with any static host (Netlify, Vercel, Nginx)
```

### Frontend Admin
```bash
cd frontend-admin
npm run build          # Outputs to dist/
```

See the [WIKI.md](WIKI.md) for detailed deployment instructions.

---

## License

Private — All rights reserved.
