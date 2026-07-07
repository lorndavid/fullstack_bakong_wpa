# MY SHOP — WIKI Documentation

> **Version:** 1.0.0
> **Last Updated:** July 7, 2026

---

## Table of Contents

1. [Project Charter](#1-project-charter)
2. [System Analysis](#2-system-analysis)
3. [System Design](#3-system-design)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Deployment Guide](#6-deployment-guide)

---

## 1. Project Charter

### 1.1 Project Title
**MY SHOP** — Modern Cambodian E-commerce Platform

### 1.2 Project Description
A full-stack, production-ready e-commerce platform built specifically for the Cambodian market. It integrates **Bakong KHQR** (the National Bank of Cambodia's QR payment standard) as a primary payment method, alongside **ABA PayWay**. The platform consists of three core applications:

- **User-facing PWA**: A Progressive Web App for customers to browse, purchase, and manage orders
- **Admin Dashboard**: A full-featured admin panel for managing products, orders, users, inventory, coupons, promotions, and content
- **Backend API**: A RESTful API with real-time capabilities (Socket.IO) for live chat and notifications

### 1.3 Business Objectives
| Objective | Description |
|---|---|
| **Cambodian-first payments** | Enable seamless payments via Bakong KHQR and ABA PayWay |
| **High engagement PWA** | Installable, offline-capable, with push notifications and app shortcuts |
| **Mobile-first UX** | Responsive design from 320px to 1440px, touch-optimized |
| **Bilingual support** | Full English and Khmer (Cambodian) language support |
| **Real-time engagement** | Live chat support with auto-responder, real-time notifications |
| **Inventory management** | Track stock across warehouses, manage suppliers and purchase orders |
| **Promotions engine** | Coupons (auto-apply, best-coupon), flash sales, promotions |
| **Admin productivity** | Analytics dashboard, order management, content management |

### 1.4 Target Audience
| Segment | Description |
|---|---|
| **Shoppers** | Cambodian consumers, ages 18–45, mobile-first users |
| **Admin staff** | Store managers, customer support, inventory managers |

### 1.5 Stakeholders
| Stakeholder | Role |
|---|---|
| **Admin / Store Owner** | Manages products, orders, promotions, content, and team |
| **Customer** | Browsers, buyers, and users of the shopping experience |
| **Customer Support** | Handles live chat, order issues, and user inquiries |
| **Developer** | Maintains, extends, and deploys the platform |

### 1.6 Key Deliverables
| Deliverable | Description |
|---|---|
| **Backend API** | Node.js + Express + TypeScript REST API with Socket.IO |
| **Frontend User PWA** | Vue 3 + TypeScript + TailwindCSS + Pinia |
| **Frontend Admin** | Vue 3 + TypeScript + TailwindCSS + Chart.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Payment Integration** | Bakong KHQR SDK + ABA PayWay integration |
| **Documentation** | README, WIKI, API reference |

---

## 2. System Analysis

### 2.1 Functional Requirements

#### User-Facing Features
| Module | Features |
|---|---|
| **Authentication** | Email/password login, Google OAuth, JWT token management, refresh tokens |
| **Product Browsing** | Search, category filter, sort by price/popularity/newest, pagination |
| **Product Detail** | Image gallery, quantity selector, related products |
| **Shopping Cart** | Add/remove/update items, coupon & promotion auto-application |
| **Checkout** | Address collection, shipping method, payment method selection |
| **Payments** | Bakong KHQR (QR code, countdown timer, polling), ABA PayWay |
| **Orders** | Order list, order detail with status timeline, cancellation |
| **Coupons** | Coupon center (available/used/expired/upcoming), auto-apply, best-coupon |
| **Promotions** | Active promotions display, flash sale countdown timers |
| **Live Chat** | Real-time messaging, file upload, auto-responder for common queries |
| **Notifications** | CRUD, grouping (Today/Yesterday/Week/Month), unread badge, real-time push |
| **Profile** | Account info, order history, wishlist, settings |
| **PWA** | Installable, offline browsing, background sync, app shortcuts, auto-update |

#### Admin Features
| Module | Features |
|---|---|
| **Dashboard** | Sales analytics, order stats, user growth, charts (Chart.js) |
| **Products** | CRUD, image upload (Cloudinary), stock tracking, low-stock alerts |
| **Categories** | CRUD, category-product association |
| **Orders** | List, detail view, status updates (pending→confirmed→shipping→delivered), cancellation |
| **Users** | List, detail, login history, role management, bulk delete |
| **Coupons** | CRUD, analytics per coupon, usage tracking, status management |
| **Promotions** | CRUD, product assignment, banner image, active/inactive management |
| **Hero Slides** | CRUD for home page banner carousel |
| **Inventory** | Warehouses CRUD, suppliers CRUD, stock movements, purchase orders |
| **Live Chat** | Conversations list, assign staff, close conversations, chat stats |
| **Notifications** | Broadcast to all/role, schedule, stats, delete |
| **Payment Gateway** | Configure Bakong account ID, merchant name, ABA PayWay settings |
| **Settings** | Site name, logo upload, social links, contact info, theme customization |

### 2.2 Non-Functional Requirements
| Requirement | Specification |
|---|---|
| **Performance** | Lighthouse score target: >80 PWA, >90 Accessibility |
| **Offline Support** | 10 caching strategies via Workbox (CacheFirst, StaleWhileRevalidate, NetworkFirst) |
| **Responsiveness** | 320px – 1440px breakpoints |
| **Dark Mode** | Full dark mode support with TailwindCSS dark variants |
| **Internationalization** | vue-i18n with English and Khmer (KM) locale files |
| **Real-time** | Socket.IO for live chat, notifications, payment status polling |
| **Security** | JWT authentication, role-based authorization (user/admin), CORS |

### 2.3 Use Case Diagram (Textual)

```
┌─────────────────────────────────────────────────────┐
│                    Customer                          │
├─────────────────────────────────────────────────────┤
│ • Register / Login (email, Google)                  │
│ • Browse products by category / search              │
│ • View product details                              │
│ • Add to cart, apply coupons                        │
│ • Checkout via KHQR or ABA PayWay                   │
│ • View & track orders                               │
│ • Chat with support                                 │
│ • Manage profile & settings                         │
│ • Receive notifications                             │
│ • Install PWA                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    Admin                             │
├─────────────────────────────────────────────────────┤
│ • View analytics dashboard                          │
│ • Manage products, categories, orders               │
│ • Manage users & roles                              │
│ • Create & manage coupons / promotions              │
│ • Manage hero slides & settings                     │
│ • Manage inventory (warehouses, suppliers, PO)      │
│ • Respond to chat conversations                     │
│ • Send broadcast notifications                      │
│ • Configure payment gateway                         │
└─────────────────────────────────────────────────────┘
```

### 2.4 Data Flow Diagram (Context Level)

```
Customer ──(HTTPS)──► Vue 3 PWA ──(Axios)──► Express API ──(Mongoose)──► MongoDB
                      (Socket.IO) ◄─────►    (Socket.IO)              │
                        │                      │                       │
                        ▼                      ▼                       ▼
                  Service Worker         Bakong API ◄────────────  Cloudinary
                  (Cache/Offline)        ABA PayWay API
```

---

## 3. System Design

### 3.1 Architecture Overview

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'primaryColor': '#10B981', 'primaryTextColor': '#fff', 'lineColor': '#94A3B8', 'fontSize': '13px', 'tertiaryColor': '#F1F5F9'}}}%%
graph TB
    subgraph Client["Client Layer"]
        direction LR
        UP["User PWA<br/><small>Vue 3 + TS + Tailwind</small>"]
        AP["Admin Panel<br/><small>Vue 3 + TS + Chart.js</small>"]
    end

    subgraph External["External Services"]
        BK["Bakong KHQR API"]
        AB["ABA PayWay API"]
        GO["Google OAuth"]
        CL["Cloudinary API"]
    end

    subgraph Backend["Backend Layer - Express :5000"]
        direction TB
        subgraph Routes["REST API Routes"]
            A1["Auth"]
            A2["Products"]
            A3["Categories"]
            A4["Orders"]
            A5["Payments"]
            A6["Coupons"]
            A7["Promotions"]
            A8["Chat"]
            A9["Notifications"]
            A10["Inventory"]
            A11["Settings"]
            A12["Users"]
        end
        subgraph Services["Services Layer"]
            S1["Bakong KHQR SDK"]
            S2["ABA PayWay"]
            S3["Cloudinary Upload"]
            S4["Notification Service"]
            S5["Auto-Responder"]
            S6["Login History"]
            S7["Payment Watcher"]
        end
        SOCK["Socket.IO<br/><small>Chat / Notifications</small>"]
    end

    subgraph Data["Data Layer"]
        DB["MongoDB Atlas<br/><small>Mongoose ODM</small>"]
    end

    UP -->|HTTP / Socket.IO| Backend
    AP -->|HTTP / Socket.IO| Backend
    Backend -->|Mongoose| DB
    Backend --> CL
    S1 --> BK
    S2 --> AB
    UP --> GO
```

### 3.2 Payment Flow (KHQR)

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '13px'}}}%%
sequenceDiagram
    actor C as Customer
    participant PWA as PWA App
    participant BE as Backend
    participant BK as Bakong API

    C->>PWA: Select KHQR payment
    PWA->>+BE: POST /payment/create<br/>{orderId, amount, provider}
    Note over BE: Generate KHQR locally<br/>(bakong-khqr SDK — offline)
    Note over BE: Create Transaction (PENDING)<br/>Create Order
    BE-->>-PWA: {qrImage, md5, tranId, expireInSec}
    PWA->>C: Show QR code + 180s countdown

    C->>BK: Scan QR with banking app
    Note over BK: User authenticates &<br/>confirms payment

    loop Every 5s until paid or expired
        PWA->>+BE: GET /payment/subscribe/:md5
        BE->>+BK: POST /check_transaction_by_md5<br/>Authorization: Bearer <token>
        alt Payment Confirmed
            BK-->>-BE: responseCode: 0, status: SUCCESS
            Note over BE: Update Transaction (PAID)<br/>Update Order (confirmed)<br/>Send push notification
            BE-->>-PWA: {success: true, status: PAID}
            PWA->>C: Show SUCCESS screen
        else Not Yet Paid
            BK-->>-BE: responseCode: 1, status: PENDING
            BE-->>-PWA: {success: false, status: PENDING}
        end
    end

    Note over BE: Geo-restriction: Bakong API<br/>only accessible from<br/>Cambodia-based servers
```

> **Note:** The Bakong KHQR SDK generates QR codes **locally** (offline) per EMVCo standard — no external API call is needed for QR generation. The online Bakong API is only used for payment status verification via `check_transaction_by_md5`.

### 3.3 PWA Caching Strategy

| Cache Name | Strategy | URL Pattern | Max Age | Max Entries |
|---|---|---|---|---|
| `app-shell` | CacheFirst | JS, CSS, HTML, JSON | 30 days | 60 |
| `product-images` | StaleWhileRevalidate | Images (png, jpg, webp) | 14 days | 200 |
| `categories` | CacheFirst | `/api/categories` | 1 day | 5 |
| `home-banner` | StaleWhileRevalidate | `/api/hero-slides` | 1 day | 5 |
| `products` | StaleWhileRevalidate | `/api/products` | 2 hours | 30 |
| `product-details` | NetworkFirst | `/api/products/:id` | 4 hours | 30 |
| `settings` | CacheFirst | `/api/settings` | 1 day | 2 |
| `promotions` | StaleWhileRevalidate | `/api/promotions/active` | 1 hour | 5 |
| `coupons` | StaleWhileRevalidate | `/api/coupons/highlighted` | 1 hour | 5 |
| `flash-sale` | StaleWhileRevalidate | `/api/products/flash-sale` | 30 mins | 3 |

### 3.4 Socket.IO Event Map

#### Client → Server Events
| Event | Payload | Description |
|---|---|---|
| `chat:join` | `conversationId: string` | Join a conversation room |
| `chat:leave` | `conversationId: string` | Leave a conversation room |
| `chat:send` | `{ conversationId, content, messageType?, fileUrl?, fileName? }` | Send a message |
| `chat:mark-read` | `conversationId: string` | Mark messages as read (admin) |
| `chat:typing` | `{ conversationId, isTyping }` | Typing indicator |
| `admin:assign` | `{ conversationId, adminId, adminName }` | Assign staff (admin) |
| `admin:close` | `conversationId: string` | Close conversation (admin) |
| `notification:mark-read` | `notificationId: string` | Mark notification read |
| `notification:mark-all-read` | — | Mark all notifications read |

#### Server → Client Events
| Event | Payload | Target |
|---|---|---|
| `chat:message` | `Message` object | Conversation room |
| `chat:assigned` | `{ conversationId, assignedTo }` | Conversation room |
| `chat:read` | `{ conversationId, readBy }` | Conversation room |
| `chat:closed` | `{ conversationId }` | Conversation room |
| `chat:typing` | `{ conversationId, userId, userName, isTyping }` | Conversation room |
| `notification:new` | `Notification` object | `user:{userId}` room |
| `notification:updated` | `{ notificationId, read }` | `user:{userId}` room |
| `notification:all-read` | — | `user:{userId}` room |
| `admin:new-message` | `{ conversationId, lastMessage, ... }` | `admin:notifications` room |
| `admin:unread-update` | `{ conversationId, unreadCount }` | `admin:notifications` room |
| `admin:conversation-updated` | `Conversation` object | `admin:notifications` room |

---

## 4. Database Schema

### 4.1 Entity-Relationship Diagram

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '13px'}}}%%
erDiagram
    User ||--o{ Order : places
    User ||--o{ Notification : receives
    User ||--o{ LoginHistory : logs
    User ||--o{ Conversation : chats

    Order ||--o{ Transaction : pays
    Order ||--o{ Product : contains

    Product }o--|| Category : belongs_to
    Product }o--o{ Promotion : included_in
    Product ||--o{ StockMovement : tracks

    Warehouse ||--o{ StockMovement : records
    Warehouse ||--o{ PurchaseOrder : receives

    Supplier ||--o{ PurchaseOrder : supplies

    Conversation ||--o{ Message : has

    Coupon }o--o{ Product : applicable_to

    Settings ||--|| Settings : singleton

    HeroSlide ||--|| HeroSlide : independent
```

**Legend:**
- `||--o{` = One-to-Many
- `}o--o{` = Many-to-Many
- `||--||` = One-to-One

### 4.2 Key Relationships

| Source | Relation | Target | Cardinality | Description |
|---|---|---|---|---|
| **User** | → | Order | 1:N | A user can place many orders |
| **User** | → | Notification | 1:N | A user receives many notifications |
| **User** | → | LoginHistory | 1:N | A user has many login events |
| **User** | → | Conversation | 1:N | A user can have many chat conversations |
| **Order** | → | Transaction | 1:N | An order can have multiple payment attempts (one active) |
| **Order** | → | Product | M:N | An order contains many products (embedded) |
| **Product** | → | Category | N:1 | Many products belong to one category |
| **Product** | → | Promotion | M:N | Products can be in many promotions |
| **Product** | → | StockMovement | 1:N | Stock movements track product changes |
| **Warehouse** | → | StockMovement | 1:N | Warehouse records many stock movements |
| **Warehouse** | → | PurchaseOrder | 1:N | Warehouse receives many purchase orders |
| **Supplier** | → | PurchaseOrder | 1:N | A supplier provides many purchase orders |
| **Conversation** | → | Message | 1:N | A conversation has many messages |
| **Coupon** | → | Product | M:N | A coupon can apply to many products |
| **Settings** | — | — | Singleton | Single document pattern |
| **HeroSlide** | — | — | Independent | Standalone collection |

### 4.2 Collection Schemas

#### User
```javascript
{
  _id: ObjectId,
  name: String,                    // required
  email: String,                   // required, unique, lowercase
  password: String,                // bcrypt hashed, select: false
  role: String,                    // 'user' | 'admin', default: 'user'
  googleId: String,                // unique, sparse
  avatar: String,                  // URL
  provider: String,                // 'email' | 'google', default: 'email'
  isVerified: Boolean,             // default: true
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { email: 1 }, { googleId: 1 }
// Methods: comparePassword()
```

#### Product
```javascript
{
  _id: ObjectId,
  name: String,                    // required
  description: String,             // required
  price: Number,                   // required, min: 0
  stock: Number,                   // default: 0, min: 0
  discount: Number,                // default: 0, min: 0, max: 100
  images: [{ public_id: String, secure_url: String }],
  category: ObjectId,              // ref: 'Category'
  rating: Number,                  // default: 0
  numReviews: Number,              // default: 0
  sold: Number,                    // default: 0
  featured: Boolean,               // default: false
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { name: 'text', description: 'text' }, { category: 1 }, { featured: -1 }
```

#### Category
```javascript
{
  _id: ObjectId,
  name: String,                    // required, unique
  icon: String,                    // icon name
  createdAt: Date,
  updatedAt: Date
}
```

#### Order
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: 'User'
  products: [{
    productId: ObjectId,
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  shipping: Number,                // default: 0
  promotionDiscount: Number,       // default: 0
  total: Number,
  coupon: String,                  // coupon code used
  discountAmount: Number,          // coupon discount amount
  appliedPromotions: [{ promotionId, name, discountPercent }],
  status: String,                  // 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  shippingAddress: { fullName: String, phone: String },
  paymentMethod: String,           // 'khqr' | 'cod' | 'aba_payway'
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { userId: 1, createdAt: -1 }
```

#### Transaction
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,               // ref: 'Order'
  amount: Number,
  provider: String,                // 'BAKONG' | 'ABA_PAYWAY'
  tranId: String,                  // transaction ID from provider
  providerReference: String,       // reference from ABA PayWay
  tran: String,                    // Bakong tran
  md5: String,                     // Bakong MD5 hash
  qr: String,                      // Base64 QR image data URL
  status: String,                  // 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  expireAt: Date,
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { orderId: 1 }, { md5: 1 }, { status: 1 }
```

#### Coupon
```javascript
{
  _id: ObjectId,
  code: String,                    // required, uppercase, unique
  name: String,
  description: String,
  bannerImage: String,             // URL
  discountType: String,            // 'percentage' | 'fixed' | 'free_shipping'
  discountValue: Number,           // percentage value or fixed amount
  minOrderValue: Number,           // minimum cart total to apply
  maxDiscount: Number,             // max discount for percentage coupons
  maxUses: Number,                 // total usage limit
  currentUses: Number,             // current usage count
  maxUsesPerUser: Number,          // per-user limit
  startDate: Date,
  endDate: Date,
  isActive: Boolean,               // default: true
  isHighlighted: Boolean,          // show on coupon center
  autoApply: Boolean,              // auto-apply to eligible carts
  category: String,                // coupon category/tag
  applicableProducts: [ObjectId],  // specific product refs
  createdAt: Date,
  updatedAt: Date
}
```

#### Promotion
```javascript
{
  _id: ObjectId,
  name: String,                    // required
  description: String,
  bannerImage: String,             // URL
  discountPercent: Number,         // required, 0–100
  products: [ObjectId],            // ref: 'Product'
  startDate: Date,
  endDate: Date,
  isActive: Boolean,               // default: true
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification
```javascript
{
  _id: ObjectId,
  user: ObjectId,                  // ref: 'User' (null for system)
  type: String,                    // 'order_confirmed' | 'payment_successful' | 'shipping_update' | 'flash_sale' | 'new_coupon' | 'wishlist_price_drop' | 'admin_broadcast'
  title: String,
  message: String,
  data: Object,                    // arbitrary metadata
  link: String,                    // deep link URL
  read: Boolean,                   // default: false
  readAt: Date,
  channels: [String],              // ['in_app', 'email', 'push']
  scheduledFor: Date,              // for scheduled broadcasts
  sentAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: { user: 1, createdAt: -1 }, { user: 1, read: 1 }
```

#### Chat — Conversation
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: 'User'
  userName: String,
  userEmail: String,
  status: String,                  // 'waiting' | 'active' | 'closed'
  assignedTo: { adminId, adminName },
  lastMessage: String,
  lastMessageAt: Date,
  unreadCount: Number,             // default: 0
  greeted: Boolean,                // default: false
  createdAt: Date,
  updatedAt: Date
}
```

#### Chat — Message
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,        // ref: 'Conversation'
  sender: String,                  // 'user' | 'admin' | 'system'
  senderId: String,
  senderName: String,
  content: String,
  messageType: String,             // 'text' | 'file' | 'system'
  fileUrl: String,
  fileName: String,
  read: Boolean,                   // default: false
  createdAt: Date
}
// Indexes: { conversationId: 1, createdAt: 1 }
```

#### HeroSlide
```javascript
{
  _id: ObjectId,
  title: String,
  subtitle: String,
  image: String,                   // URL
  link: String,                    // click-through URL
  isActive: Boolean,               // default: true
  order: Number,                   // display order
  createdAt: Date,
  updatedAt: Date
}
```

#### Settings (Singleton)
```javascript
{
  _id: ObjectId,
  siteName: String,
  logo: String,                    // URL
  favicon: String,
  description: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialLinks: { facebook, instagram, telegram },
  theme: { primaryColor, secondaryColor },
  payment: { bakongAccountId, merchantName, merchantCity, abaPaywayEnabled, abaPaywayMerchantId },
  shipping: { freeShippingThreshold, shippingFee },
  seo: { metaTitle, metaDescription },
  updatedAt: Date
}
// Singleton pattern: Settings.getSingleton()
```

#### Warehouse
```javascript
{
  _id: ObjectId,
  name: String,                    // required
  location: String,
  contactPerson: String,
  contactPhone: String,
  isActive: Boolean,               // default: true
  createdAt: Date,
  updatedAt: Date
}
```

#### Supplier
```javascript
{
  _id: ObjectId,
  name: String,                    // required
  contactPerson: String,
  email: String,
  phone: String,
  address: String,
  isActive: Boolean,               // default: true
  createdAt: Date,
  updatedAt: Date
}
```

#### StockMovement
```javascript
{
  _id: ObjectId,
  productId: ObjectId,             // ref: 'Product'
  warehouseId: ObjectId,           // ref: 'Warehouse'
  type: String,                    // 'in' | 'out' | 'adjustment'
  quantity: Number,
  referenceType: String,           // 'purchase_order' | 'manual' | 'return' | 'damage'
  referenceId: ObjectId,           // ref to purchase order or other
  notes: String,
  performedBy: ObjectId,           // ref: 'User' (admin)
  createdAt: Date
}
```

#### PurchaseOrder
```javascript
{
  _id: ObjectId,
  orderNumber: String,             // auto-generated
  supplierId: ObjectId,            // ref: 'Supplier'
  warehouseId: ObjectId,           // ref: 'Warehouse'
  items: [{ productId, productName, quantity, unitCost, totalCost }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: String,                  // 'draft' | 'ordered' | 'received' | 'cancelled'
  notes: String,
  orderedAt: Date,
  receivedAt: Date,
  createdBy: ObjectId,             // ref: 'User' (admin)
  createdAt: Date,
  updatedAt: Date
}
```

#### LoginHistory
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: 'User'
  action: String,                  // 'login' | 'logout' | 'google_login'
  ip: String,
  userAgent: String,
  timestamp: Date
}
```

---

## 5. API Reference

Base URL: `http://localhost:5000/api`

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | — | Health check |

**Response:**
```json
{
  "success": true,
  "message": "Bakong E-commerce API is running",
  "timestamp": "2026-07-07T12:00:00.000Z"
}
```

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Admin login (email + password) |
| `POST` | `/auth/google` | — | Google OAuth login |
| `POST` | `/auth/refresh` | — | Refresh access token |
| `POST` | `/auth/logout` | User | Logout |
| `GET` | `/auth/me` | User | Get current user profile |

**POST `/auth/login`**
```json
// Request
{ "email": "admin@myshop.com", "password": "..." }
// Response
{ "success": true, "token": "jwt...", "user": { "id", "name", "email", "role", "avatar" } }
```

**POST `/auth/google`**
```json
// Request
{ "credential": "google_id_token..." }
// Response
{ "success": true, "accessToken": "jwt...", "refreshToken": "jwt...", "user": { "_id", "name", "email", "avatar" } }
```

**POST `/auth/refresh`**
```json
// Request
{ "refreshToken": "jwt..." }
// Response
{ "success": true, "accessToken": "jwt...", "refreshToken": "jwt..." }
```

### Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | — | List products (search, filter, sort, paginate) |
| `GET` | `/products/featured` | — | Featured products |
| `GET` | `/products/flash-sale` | — | Flash sale products |
| `GET` | `/products/new-arrivals` | — | New arrivals |
| `GET` | `/products/low-stock/overview` | — | Low stock products (admin) |
| `GET` | `/products/:id` | — | Product detail |
| `GET` | `/products/:id/related` | — | Related products |
| `POST` | `/products` | Admin | Create product |
| `PUT` | `/products/:id` | Admin | Update product |
| `DELETE` | `/products/:id` | Admin | Delete product |

**GET `/products` Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Text search (name, description) |
| `category` | ObjectId | Filter by category |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sort` | string | `price_asc`, `price_desc`, `newest`, `oldest`, `best_seller`, `discount` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

**POST `/products` (Admin)**
- Body: `multipart/form-data`
- Fields: `name`, `description`, `price`, `stock`, `discount`, `category`, `featured`
- Files: `images` (up to 5 files)

**Response (List):**
```json
{
  "success": true,
  "count": 12,
  "total": 48,
  "page": 1,
  "totalPages": 4,
  "products": [ { "_id", "name", "price", "images", "category", "rating", "sold", "discount" } ]
}
```

### Categories (`/api/categories`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | — | List all categories |
| `GET` | `/categories/:id` | — | Get single category |
| `GET` | `/categories/:id/products` | — | Get products by category |
| `POST` | `/categories` | Admin | Create category |
| `PUT` | `/categories/:id` | Admin | Update category |
| `DELETE` | `/categories/:id` | Admin | Delete category |

### Orders (`/api/orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | User | Create order |
| `GET` | `/orders` | User | List my orders |
| `GET` | `/orders/:id` | User | Get order detail |
| `PUT` | `/orders/:id/cancel` | User | Cancel order |
| `GET` | `/orders/admin/all` | Admin | List all orders |
| `PUT` | `/orders/admin/:id/status` | Admin | Update order status |
| `DELETE` | `/orders/admin/:id` | Admin | Delete order |
| `POST` | `/orders/admin/bulk-delete` | Admin | Bulk delete orders |

**POST `/orders`**
```json
// Request
{
  "products": [{ "productId": "...", "quantity": 2 }],
  "shippingAddress": { "fullName": "John", "phone": "012345678" },
  "paymentMethod": "khqr",
  "couponCode": "WELCOME10"
}
```

**PUT `/orders/admin/:id/status`**
```json
// Request
{ "status": "confirmed" }
// Valid statuses: pending, confirmed, shipping, delivered, cancelled
```

### Payments (`/api/payment`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payment/create` | — | Create payment (KHQR or ABA PayWay) |
| `POST` | `/payment/check` | — | Check payment status by provider |
| `GET` | `/payment/status/:md5` | — | Check Bakong status by MD5 |
| `POST` | `/payment/save` | — | Save transaction |
| `PUT` | `/payment/status/:md5` | — | Update payment status |
| `GET` | `/payment/subscribe/:md5` | — | SSE endpoint for payment push |
| `GET` | `/payment/subscribe/tran/:tranId` | — | SSE endpoint by tran ID |
| `POST` | `/payment/webhook` | — | Webhook for third-party |
| `GET` | `/payment/transactions` | Admin | List all transactions |
| `DELETE` | `/payment/transactions/:id` | Admin | Delete transaction |
| `GET` | `/payment/stream` | Admin | SSE stream for live transactions |

**POST `/payment/create`**
```json
// Request
{
  "orderId": "...",
  "amount": 25.50,
  "provider": "BAKONG"  // or "ABA_PAYWAY"
}
// Response (BAKONG)
{
  "success": true,
  "provider": "BAKONG",
  "qrString": "data:image/png;base64,...",
  "qrImage": "data:image/png;base64,...",
  "tranId": "KHQR_123456789_1234",
  "md5": "abc123...",
  "expireInSec": 180
}
```

### Coupons (`/api/coupons`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/coupons/available` | User | List user's coupons |
| `GET` | `/coupons/auto-apply` | — | Get auto-apply coupons |
| `GET` | `/coupons/highlighted` | — | Get highlighted/promoted coupons |
| `GET` | `/coupons/code/:code` | — | Get coupon by code |
| `POST` | `/coupons/validate` | — | Validate a coupon code |
| `POST` | `/coupons/apply` | User | Apply coupon to cart |
| `POST` | `/coupons/best-coupon` | — | Find best coupon for cart |
| `GET` | `/coupons/admin/all` | Admin | List all coupons |
| `GET` | `/coupons/admin/analytics` | Admin | Coupon analytics overview |
| `GET` | `/coupons/admin/:id` | Admin | Get single coupon |
| `GET` | `/coupons/admin/:id/analytics` | Admin | Single coupon analytics |
| `POST` | `/coupons/admin` | Admin | Create coupon |
| `PUT` | `/coupons/admin/:id` | Admin | Update coupon |
| `PATCH` | `/coupons/admin/:id/status` | Admin | Update coupon status |
| `DELETE` | `/coupons/admin/:id` | Admin | Delete coupon |

**POST `/coupons/validate`**
```json
// Request
{ "code": "WELCOME10", "cartTotal": 50 }
// Response
{ "success": true, "valid": true, "coupon": { ... }, "discountAmount": 5 }
```

**POST `/coupons/best-coupon`**
```json
// Request
{ "cartTotal": 85, "products": ["prod1", "prod2"] }
// Response
{ "success": true, "bestCoupon": { ... }, "savings": 15 }
```

### Promotions (`/api/promotions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/promotions/active` | — | Get active promotions |
| `GET` | `/promotions/products` | — | Get products for promotion selection |
| `GET` | `/promotions` | Admin | List all promotions |
| `GET` | `/promotions/:id` | Admin | Get single promotion |
| `POST` | `/promotions` | Admin | Create promotion |
| `PUT` | `/promotions/:id` | Admin | Update promotion |
| `DELETE` | `/promotions/:id` | Admin | Delete promotion |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | User | List my notifications |
| `GET` | `/notifications/unread-count` | User | Get unread count |
| `PUT` | `/notifications/:id/read` | User | Mark as read |
| `PUT` | `/notifications/read-all` | User | Mark all as read |
| `DELETE` | `/notifications/:id` | User | Delete notification |
| `GET` | `/notifications/admin/all` | Admin | List all notifications |
| `GET` | `/notifications/admin/stats` | Admin | Notification stats |
| `POST` | `/notifications/admin/create` | Admin | Create/broadcast notification |
| `DELETE` | `/notifications/admin/:id` | Admin | Delete notification (admin) |

**POST `/notifications/admin/create`**
```json
{
  "type": "admin_broadcast",
  "title": "Flash Sale Tomorrow!",
  "message": "Up to 50% off on all skincare products",
  "recipient": "allUsers",    // or { "role": "user" }
  "channels": ["in_app"],
  "scheduledFor": null
}
```

### Chat (`/api/chat`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/chat/conversation` | User | Get or create conversation |
| `GET` | `/chat/conversations` | User | List my conversations |
| `GET` | `/chat/conversations/:id/messages` | User | Get messages |
| `POST` | `/chat/conversations/:id/messages` | User | Send message |
| `POST` | `/chat/upload` | User | Upload file |
| `GET` | `/chat/admin/conversations` | Admin | List all conversations |
| `GET` | `/chat/admin/conversations/:id/messages` | Admin | Get messages (admin) |
| `PATCH` | `/chat/admin/conversations/:id/assign` | Admin | Assign staff |
| `PATCH` | `/chat/admin/conversations/:id/close` | Admin | Close conversation |
| `GET` | `/chat/admin/stats` | Admin | Get chat statistics |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List users |
| `GET` | `/users/stats` | Admin | Dashboard statistics |
| `GET` | `/users/:id` | Admin | Get user detail |
| `PUT` | `/users/:id` | Admin | Update user |
| `GET` | `/users/:id/orders` | Admin | Get user's orders |
| `GET` | `/users/:id/login-history` | Admin | Get login history |
| `DELETE` | `/users/:id` | Admin | Delete user |
| `DELETE` | `/users/bulk/delete` | Admin | Bulk delete users |
| `POST` | `/users/create-admin` | Admin | Create admin user |
| `GET` | `/users/permissions/list` | Admin | List permissions |

**GET `/users/stats`**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalOrders": 320,
    "totalRevenue": 12500.00,
    "totalProducts": 85,
    "ordersByStatus": { "pending": 12, "confirmed": 8, "shipping": 5, "delivered": 290, "cancelled": 5 },
    "revenueByDay": [ { "date": "2026-07-01", "revenue": 450 } ]
  }
}
```

### Inventory (`/api/inventory`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/inventory/overview` | Admin | Inventory summary overview |
| `GET` | `/inventory/warehouses` | Admin | List warehouses |
| `POST` | `/inventory/warehouses` | Admin | Create warehouse |
| `PUT` | `/inventory/warehouses/:id` | Admin | Update warehouse |
| `DELETE` | `/inventory/warehouses/:id` | Admin | Delete warehouse |
| `GET` | `/inventory/suppliers` | Admin | List suppliers |
| `POST` | `/inventory/suppliers` | Admin | Create supplier |
| `PUT` | `/inventory/suppliers/:id` | Admin | Update supplier |
| `DELETE` | `/inventory/suppliers/:id` | Admin | Delete supplier |
| `GET` | `/inventory/movements` | Admin | List stock movements |
| `GET` | `/inventory/purchase-orders` | Admin | List purchase orders |
| `POST` | `/inventory/purchase-orders` | Admin | Create purchase order |
| `PUT` | `/inventory/purchase-orders/:id` | Admin | Update purchase order |
| `POST` | `/inventory/purchase-orders/:id/receive` | Admin | Receive purchase order |

### Hero Slides (`/api/hero-slides`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/hero-slides` | — | Get active slides for homepage |
| `GET` | `/hero-slides/all` | Admin | Get all slides |
| `POST` | `/hero-slides` | Admin | Create slide |
| `PUT` | `/hero-slides/:id` | Admin | Update slide |
| `DELETE` | `/hero-slides/:id` | Admin | Delete slide |

### Settings (`/api/settings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/settings` | — | Get site settings |
| `PUT` | `/settings` | Admin | Update settings |

### Common Response Format

**Success:**
```json
{ "success": true, ...data }
```

**Error:**
```json
{ "success": false, "message": "Error description" }
```

**Auth Error:**
```json
{ "success": false, "message": "Not authorized, no token provided" }
```

---

## 6. Deployment Guide

### 6.1 Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | >= 18 | LTS recommended |
| **MongoDB Atlas** | Free tier (M0) | Or self-hosted MongoDB 6+ |
| **Cloudinary** | Free tier | For image uploads |
| **Bakong KHQR** | — | Merchant account + API token |
| **ABA PayWay** (optional) | — | Merchant account |

### 6.2 Environment Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd bakong-ecommerce

# 2. Install all dependencies
npm run install:all
# This runs: npm install --prefix backend && npm install --prefix frontend-user && npm install --prefix frontend-admin

# 3. Configure environment variables
cp backend/.env.example backend/.env
# Edit with your credentials
```

### 6.3 Essential Environment Variables

```bash
# ── Server ──
PORT=5000
NODE_ENV=production

# ── MongoDB ──
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/myshop

# ── JWT ──
JWT_SECRET=your-strong-secret-here
JWT_EXPIRES_IN=7d

# ── Cloudinary ──
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# ── Bakong KHQR ──
BAKONG_API_URL=https://api-bakong.nbc.gov.kh
BAKONG_API_TOKEN=your-bakong-jwt-token
MERCHANT_BAKONG_ID=your-bakong-account-id
MERCHANT_NAME=MY SHOP
MERCHANT_CITY=Phnom Penh

# ── CORS ──
FRONTEND_USER_URL=https://your-user-app.com
FRONTEND_ADMIN_URL=https://your-admin-app.com

# ── Google OAuth (optional) ──
GOOGLE_CLIENT_ID=your-google-client-id

# ── Email (optional) ──
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@myshop.com
```

### 6.4 Backend Deployment

#### Option A: VPS / Dedicated Server (e.g., DigitalOcean, Vultr)

```bash
# Build TypeScript
cd backend
npm run build

# Start with process manager (PM2)
npm install -g pm2
pm2 start dist/server.js --name myshop-api

# Or use the start script
NODE_ENV=production node dist/server.js
```

#### Option B: Railway / Render / Fly.io

```bash
# Railway: Auto-detects Node.js. Set build command:
cd backend && npm install && npm run build

# Start command:
npm run start
```

#### Option C: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### 6.5 Frontend User (PWA) Deployment

```bash
cd frontend-user

# Build
npm run build       # Output: dist/

# The PWA manifest, service worker, and all assets are generated automatically
# by vite-plugin-pwa during the build process.
```

#### Hosting Options

| Host | Notes |
|---|---|
| **Netlify** | Drag-and-drop `dist/` folder. Add redirect: `/* /index.html 200` |
| **Vercel** | Connect Git repo. Framework: Vite. Output: `dist` |
| **Cloudflare Pages** | Build: `npm run build`. Output: `dist` |
| **Nginx** | Serve `dist/` folder. Add SPA fallback: `try_files $uri $uri/ /index.html` |

#### Vercel Config
```json
// vercel.json (frontend-user)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```

### 6.6 Frontend Admin Deployment

```bash
cd frontend-admin
npm run build       # Output: dist/
```

Same hosting options as the user frontend.

### 6.7 Database Setup

```bash
# Seed sample data (products, categories, coupons, hero slides, settings)
cd backend
npm run seed

# Or for minimal seed data:
npm run seed:sample

# Clear all products:
npm run clear:products
```

### 6.8 Post-Deployment Checklist

- [ ] MongoDB Atlas IP whitelist configured (add `0.0.0.0/0` or your server IP)
- [ ] Environment variables set on production server
- [ ] Backend health check: `GET /api/health` returns 200
- [ ] Bakong API token verified (test KHQR payment flow)
- [ ] Cloudinary uploads working (test product image upload)
- [ ] CORS configured for both frontend URLs
- [ ] SSL/HTTPS enabled (Vercel/Netlify auto, VPS needs certbot/nginx)
- [ ] Service worker registered correctly (check DevTools → Application)
- [ ] PWA install prompt appears (check Lighthouse PWA audit)
- [ ] Socket.IO connections established (chat, notifications)
- [ ] Google OAuth credentials configured (if using)
- [ ] Email SMTP configured (if using notification emails)

### 6.9 Monitoring & Maintenance

```bash
# Check backend logs (PM2)
pm2 logs myshop-api

# Monitor memory/CPU
pm2 monit

# Restart
pm2 restart myshop-api

# Update
git pull
npm run install:all
cd backend && npm run build
pm2 restart myshop-api
```

---

## Appendix A: NPM Scripts

### Root
| Script | Description |
|---|---|
| `npm run dev` | Start all three services concurrently |
| `npm run install:all` | Install deps for all sub-projects |
| `npm run seed` | Seed database from root |

### Backend
| Script | Description |
|---|---|
| `npm run dev` | Start with ts-node-dev (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled JavaScript |
| `npm run seed` | Seed full dataset |
| `npm run seed:sample` | Seed minimal sample data |
| `npm run clear:products` | Remove all products |

### Frontend User
| Script | Description |
|---|---|
| `npm run dev` | Vite dev server on `:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

### Frontend Admin
| Script | Description |
|---|---|
| `npm run dev` | Vite dev server on `:5174` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

---

## Appendix B: Project Conventions

### Naming Conventions
| Element | Convention | Example |
|---|---|---|
| **Backend files** | camelCase | `authController.ts`, `bakong.ts` |
| **Models** | PascalCase | `User.ts`, `Product.ts` |
| **Routes** | camelCase | `authRoutes.ts` |
| **Frontend components** | PascalCase | `ProductCard.vue` |
| **Frontend pages** | PascalCase | `HomePage.vue` |
| **Frontend stores** | camelCase | `auth.ts`, `cart.ts` |
| **API endpoints** | kebab-case | `/flash-sale`, `/new-arrivals` |
| **MongoDB collections** | PascalCase | `User`, `HeroSlide` |
| **Environment variables** | UPPER_SNAKE_CASE | `MONGODB_URI` |

### Error Handling
- All controllers wrapped in try/catch with `next(error)` forwarding
- Global error handler in `middlewares/errorHandler.ts`
- Consistent response format: `{ success: boolean, message?: string, ...data }`
- HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### Authentication
- JWT tokens in `Authorization: Bearer <token>` header
- Two middleware: `protect` (any authenticated user) and `authorize('admin')` (role check)
- Tokens generated with user ID, role, and name encoded

---

*© 2026 MY SHOP. All rights reserved. Documentation maintained by the development team.*
