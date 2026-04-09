# Lakshay Design — Amshine Jewellery E-Commerce

> **Live Site:** [https://clicksemrus.com](https://clicksemrus.com)
> **Admin Panel:** [https://clicksemrus.com/admin](https://clicksemrus.com/admin)

![Deploy](https://github.com/rithalyarajput-creator/lakshay-design/actions/workflows/deploy.yml/badge.svg)

---

## Project Overview

A full-stack e-commerce web application for **Amshine Jewellery** — built with React (frontend + admin panel) and Node.js/Express backend, deployed on Hostinger shared hosting with auto-deploy via GitHub webhook.

**Features:**
- Customer-facing jewellery store with product listings, cart, and checkout
- Full admin dashboard to manage products, orders, categories, FAQs, blog, and more
- Blog system with publish/unpublish control
- Newsletter subscription management
- Import products directly from Meesho URL (title auto-filled from URL)
- Fully mobile-responsive design
- BIS Hallmarked product catalog with image uploads

---

## Project Structure

```
lakshay-design/
├── Frontend/shopwave/            # Customer-facing React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Banner/           # Homepage banner slider
│   │   │   ├── CategorySection/  # Product category grid
│   │   │   ├── FeaturedProducts/ # Featured products section
│   │   │   ├── Footer/           # Site footer with newsletter
│   │   │   ├── HomeFAQs/         # FAQ accordion on homepage
│   │   │   └── Navbar/           # Top navigation with search
│   │   ├── pages/
│   │   │   ├── Home/             # Homepage (WhyChooseUs + BlogPreview)
│   │   │   ├── Products/         # Product listing with filters
│   │   │   ├── ProductDetail/    # Product detail page
│   │   │   ├── Blog/             # Blog listing page
│   │   │   ├── Blog/BlogPost.js  # Blog post detail page
│   │   │   ├── Cart/             # Shopping cart
│   │   │   ├── About/            # About us page
│   │   │   └── Contact/          # Contact form
│   │   ├── context/              # Auth & Cart context (React Context)
│   │   └── App.js                # Routes: /, /products, /blog, /blog/:slug, etc.
│   └── package.json              # homepage: "/" (served from root)
│
├── admin/admin/                  # Admin dashboard (React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/        # Stats overview
│   │   │   ├── Products/         # Product CRUD + Meesho URL import
│   │   │   ├── Categories/       # Category management
│   │   │   ├── Orders/           # Order management
│   │   │   ├── Customers/        # Customer list
│   │   │   ├── Leads/            # Customer enquiries
│   │   │   ├── Offers/           # Discount coupons
│   │   │   ├── FAQs/             # FAQ management
│   │   │   ├── Testimonials/     # Customer reviews
│   │   │   ├── Subscriptions/    # Newsletter subscribers
│   │   │   ├── Blog/             # Blog post management
│   │   │   ├── CMS/              # CMS pages (privacy, shipping, etc.)
│   │   │   ├── HomePage/         # Banner & homepage content editor
│   │   │   └── Settings/         # Admin settings
│   │   ├── components/           # Table, Modal, Sidebar, Toast, ImageUpload
│   │   └── api/axios.js          # Axios instance (baseURL: clicksemrus.com/api)
│   └── package.json              # homepage: "/admin" (served from /admin path)
│
├── beckend/beckend/              # Node.js + Express API
│   ├── models/                   # Mongoose models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── faqRoutes.js
│   │   ├── testimonialRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── scrapeRoutes.js       # Meesho/Amazon URL import
│   │   ├── newsletterRoutes.js   # Newsletter subscribe/unsubscribe
│   │   └── blogRoutes.js         # Blog CRUD with slug generation
│   ├── middleware/auth.js        # JWT protect + admin middleware
│   └── server.js
│
└── .github/workflows/
    └── deploy.yml                # Triggers webhook on push to main
```

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, CSS Modules  |
| Admin     | React 18, Axios, Recharts               |
| Backend   | Node.js 20, Express.js                  |
| Database  | MongoDB Atlas (cloud)                   |
| Auth      | JWT + bcryptjs                          |
| Hosting   | Hostinger Shared Hosting                |
| Server    | Apache + PHP proxy → Node.js (PM2)      |
| CI/CD     | GitHub Actions + Webhook auto-deploy    |

---

## Auto-Deploy (CI/CD)

Push to `main` → **automatically builds and deploys to live server in ~3-5 minutes.**

```bash
git add .
git commit -m "describe your change"
git push origin main
# Live at clicksemrus.com automatically
```

**Flow:**
```
git push → GitHub Actions → POST webhook → Hostinger server
                                                ↓
                               /home/u518768974/deploy.sh runs:
                               1. git pull origin main
                               2. npm run build (admin + frontend)
                               3. copy build files to public_html
                               4. pm2 reload amshine-backend
```

Check deploy logs on server:
```bash
cat /home/u518768974/deploy.log
```

---

## Admin Panel

| Detail   | Value                             |
|----------|-----------------------------------|
| URL      | https://clicksemrus.com/admin     |
| Email    | admin@amshine.com                 |
| Password | Admin@123                         |

### Admin Features

| Feature | Description |
|---|---|
| **Dashboard** | Revenue, orders, products, customer stats |
| **Products** | Add/edit/delete products, image upload, import from Meesho URL |
| **Categories** | Manage product categories with images |
| **Orders** | View and update customer orders |
| **Customers** | Registered user list |
| **Leads** | Customer enquiries from Contact page |
| **Offers / Coupons** | Create and manage discount codes |
| **FAQs** | Add/edit FAQs, toggle display on homepage |
| **Testimonials** | Customer reviews management |
| **Subscriptions** | Newsletter subscriber list |
| **Blog** | Create/edit/publish blog posts with tags, images, read time |
| **CMS Pages** | Edit Privacy Policy, Shipping Policy, Terms, Return Policy |
| **Home Page** | Manage homepage banners and content |
| **Settings** | Admin account settings |

---

## API Endpoints

Base URL: `https://clicksemrus.com/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/login | Login (returns JWT token) |
| POST | /auth/register | Register user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /products | Get all products |
| GET | /products/:id | Get single product |
| POST | /products | Create product (admin) |
| PUT | /products/:id | Update product (admin) |
| DELETE | /products/:id | Delete product (admin) |
| POST | /products/:id/upload | Upload product images (admin) |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | /categories | Get all categories |
| POST | /categories | Create category (admin) |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | /orders | Get all orders (admin) |
| PUT | /orders/:id | Update order status (admin) |

### FAQs
| Method | Endpoint | Description |
|---|---|---|
| GET | /faqs | Get all FAQs |
| GET | /faqs/active | Get active FAQs |

### Newsletter
| Method | Endpoint | Description |
|---|---|---|
| POST | /newsletter/subscribe | Subscribe email (public) |
| GET | /newsletter/subscribers | Get all subscribers (admin) |
| DELETE | /newsletter/subscribers/:id | Remove subscriber (admin) |

### Blog
| Method | Endpoint | Description |
|---|---|---|
| GET | /blog | Get all published posts (public) |
| GET | /blog/:slug | Get single post by slug (public) |
| GET | /blog/admin/all | Get all posts including drafts (admin) |
| POST | /blog | Create post (admin) |
| PUT | /blog/:id | Update post (admin) |
| DELETE | /blog/:id | Delete post (admin) |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | /leads | Submit enquiry/lead |
| POST | /scrape | Import product from URL (Meesho) |
| GET | /health | Backend health check |

---

## Database Models

| Model | Description |
|---|---|
| `User` | Customer and admin accounts (role: user/admin) |
| `Product` | Product catalog — title, price, images, category, stock |
| `Category` | Product categories with images |
| `Order` | Customer orders with items and status |
| `FAQ` | Frequently asked questions (showOnHome toggle) |
| `Lead` | Customer enquiries from contact form |
| `Coupon` | Discount codes with percentage/fixed amount |
| `Testimonial` | Customer reviews with ratings |
| `Newsletter` | Email subscribers (isActive toggle) |
| `Blog` | Blog posts — title, slug, content, tags, isPublished, readTime |

---

## Server Setup (Hostinger)

| Detail | Value |
|---|---|
| Server IP | 145.79.25.65 |
| SSH Port | 65002 |
| Username | u518768974 |
| Domain | clicksemrus.com |
| Node.js path | /opt/alt/alt-nodejs20/root/usr/bin/node |
| Backend dir | /home/u518768974/api_backend |
| Repo dir | /home/u518768974/ecommerce-template |
| Public HTML | /home/u518768974/domains/clicksemrus.com/public_html |
| Admin dir | /home/u518768974/domains/clicksemrus.com/public_html/admin |
| Process manager | PM2 (app: amshine-backend, port: 3000) |

### How Apache → Node.js works

```
Browser request
    ↓
Apache (.htaccess)
    ↓ /api/* routes
api.php (PHP proxy)
    ↓
Node.js :3000 (PM2)
    ↓
MongoDB Atlas
```

The `.htaccess` catches all API route patterns and passes them to `api.php`, which forwards to `localhost:3000`.

### PM2 Commands (SSH)
```bash
pm2 status                          # check if running
pm2 reload amshine-backend          # reload without downtime
pm2 start ecosystem.config.js       # start if not running
pm2 save                            # save process list
pm2 logs amshine-backend            # view live logs
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Run Frontend
```bash
cd Frontend/shopwave
npm install
REACT_APP_API_URL=https://clicksemrus.com/api npm start
# http://localhost:3000
```

### Run Admin
```bash
cd admin/admin
npm install
REACT_APP_API_URL=https://clicksemrus.com/api npm start
# http://localhost:3001
```

### Build for Production
```bash
# Frontend
cd Frontend/shopwave
REACT_APP_API_URL=https://clicksemrus.com/api npm run build

# Admin (must set homepage to /admin in package.json)
cd admin/admin
REACT_APP_API_URL=https://clicksemrus.com/api npm run build
```

---

## Environment Variables

### Frontend / Admin (set at build time)
```
REACT_APP_API_URL=https://clicksemrus.com/api
```

### Backend `.env`
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...@cluster0.oitjdhr.mongodb.net/ecommerce
JWT_SECRET=supersecretjwt2024ecommerce
JWT_EXPIRE=7d
```

---

## Manual Deploy

If webhook fails, SSH and run manually:

```bash
ssh -p 65002 u518768974@145.79.25.65
/home/u518768974/deploy.sh
```

---

*Amshine Jewellery — Handcrafted with Love, BIS Hallmarked Gold*
