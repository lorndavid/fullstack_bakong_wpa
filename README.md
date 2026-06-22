# 🇰🇭 MY SHOP - Cambodian E-commerce PWA

A production-style e-commerce platform built for Cambodia with KHQR payment integration.

## Tech Stack

### Backend
- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Cloudinary + Multer
- **Payment:** Bakong KHQR API

### Frontend User (PWA)
- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **State:** Pinia
- **Routing:** Vue Router
- **Styling:** TailwindCSS
- **PWA:** vite-plugin-pwa (Offline, Installable)
- **HTTP:** Axios

### Frontend Admin
- **Framework:** Vue 3 + TypeScript
- **Build:** Vite
- **State:** Pinia
- **Routing:** Vue Router
- **Styling:** TailwindCSS
- **HTTP:** Axios

## Prerequisites

- Node.js >= 18
- MongoDB Atlas URI
- Cloudinary account
- Bakong API access

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 3. Run all three services
npm run dev
```

This will start:
- **Backend API:** http://localhost:5000
- **User Frontend:** http://localhost:5173
- **Admin Panel:** http://localhost:5174

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `BAKONG_API_URL` | Bakong API base URL |
| `MERCHANT_BAKONG_ID` | Your Bakong merchant ID |

## Project Structure

```
root/
├── backend/              # Express.js API server
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── services/     # Business logic (Cloudinary, Bakong)
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       ├── middlewares/   # Auth, upload, error handler
│       ├── config/       # DB, Cloudinary config
│       ├── utils/        # Helpers (JWT)
│       └── types/        # TypeScript types
├── frontend-user/        # Customer-facing PWA
│   └── src/
│       ├── pages/        # Vue pages
│       ├── layouts/      # Page layouts
│       ├── stores/       # Pinia stores
│       ├── services/     # API services
│       ├── composables/  # Vue composables
│       └── router/       # Vue Router config
├── frontend-admin/       # Admin dashboard
│   └── src/
│       ├── pages/        # Admin pages
│       ├── layouts/      # Dashboard layout
│       ├── stores/       # Admin stores
│       ├── services/     # API services
│       └── router/       # Vue Router config
└── package.json          # Root monorepo scripts
```

## Features

### User Features
- ✅ Homepage with hero banner, categories, flash sale
- ✅ Product listing with search, filter, sort
- ✅ Product detail with image gallery
- ✅ Shopping cart with coupon support
- ✅ Checkout with address & payment selection
- ✅ KHQR payment page with countdown & polling
- ✅ PWA installable on mobile (iOS/Android)
- ✅ Dark/Light mode
- ✅ Responsive design (320px - 1440px)

### Admin Features
- ✅ Dashboard with analytics & charts
- ✅ Product CRUD management
- ✅ Category management
- ✅ Order management with status updates
- ✅ User management
- ✅ Transaction history

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `GET /api/products/featured` - Featured products
- `GET /api/products/flash-sale` - Flash sale
- `GET /api/products/new-arrivals` - New arrivals
- `GET /api/products/:id` - Product detail
- `GET /api/products/:id/related` - Related products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User orders
- `GET /api/orders/:id` - Order detail

### Payments
- `POST /api/payments/create` - Create KHQR payment
- `GET /api/payments/check/:transactionId` - Check payment status
