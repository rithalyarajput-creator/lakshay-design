# Lakshay Design — Amshine Jewellery E-Commerce

> **Live Site:** [https://clicksemrus.com](https://clicksemrus.com)
> **Admin Panel:** [https://clicksemrus.com/jaan](https://clicksemrus.com/jaan)

---

## Project Overview

A full-stack e-commerce web application for **Amshine Jewellery** — built with React (frontend + admin panel) and Node.js/Express backend, deployed on Hostinger shared hosting with auto-deploy via GitHub webhook.

**Features:**
- Customer-facing jewellery store with product listings, cart, and checkout
- Full admin dashboard to manage products, orders, categories, FAQs, blog, and more
- Blog system with publish/unpublish control
- Newsletter subscription management
- Import products directly from Meesho URL (title auto-filled from URL)
- CMS Pages — edit Privacy Policy, Shipping Policy, Terms, Return Policy, About, Contact
- 5-image photo grid section on homepage (desktop only)
- PHP Watchdog — auto-restarts backend if it goes down (every 5 minutes)
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
│   │   │   ├── Home/             # Homepage (PhotoGrid + WhyChooseUs + BlogPreview)
│   │   │   ├── Products/         # Product listing with filters
│   │   │   ├── ProductDetail/    # Product detail page
│   │   │   ├── Blog/             # Blog listing page
│   │   │   ├── Blog/BlogPost.js  # Blog post detail page
│   │   │   ├── Cart/             # Shopping cart + checkout (10-digit phone validation)
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
│   │   │   ├── CMS/              # CMS pages (privacy, shipping, terms, about, contact)
│   │   │   ├── HomePage/         # Banner & homepage content editor
│   │   │   └── Settings/         # Admin settings
│   │   ├── components/           # Table, Modal, Sidebar, Toast, ImageUpload
│   │   └── api/axios.js          # Axios instance (baseURL: clicksemrus.com/api)
│   └── package.json              # homepage: "/jaan" (served from /jaan path)
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
│   │   ├── blogRoutes.js         # Blog CRUD with slug generation
│   │   ├── otpRoutes.js          # OTP send/verify (Fast2SMS — needs recharge)
│   │   └── cmsRoutes.js          # CMS page content (MongoDB backed)
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
| Database  | MySQL (MariaDB) on Hostinger            |
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

| Detail   | Value                              |
|----------|------------------------------------|
| URL      | https://clicksemrus.com/jaan       |
| Email    | admin@amshine.com                  |
| Password | Admin@123                          |

> **Note:** Old URL `/admin` is blocked and redirects to homepage.

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
| **CMS Pages** | Edit Privacy Policy, Shipping Policy, Terms, Return Policy, About, Contact |
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

### CMS Pages
| Method | Endpoint | Description |
|---|---|---|
| GET | /cms/:slug | Get page content (public) |
| POST | /cms/:slug | Save page content (admin) |

Slugs: `about`, `contact`, `privacy-policy`, `shipping-policy`, `return-policy`, `terms-of-service`

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | /leads | Submit enquiry/lead |
| POST | /scrape | Import product from URL (Meesho) |
| POST | /otp/send | Send OTP to phone (Fast2SMS) |
| POST | /otp/verify | Verify OTP |
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
| `CmsPage` | CMS page content — slug, title, content (HTML), contactInfo |

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
| Public HTML | /home/u518768974/domains/clicksemrus.com/public_html |
| Admin dir | /home/u518768974/domains/clicksemrus.com/public_html/jaan |
| Process manager | PM2 (app: amshine-backend, port: 3000) |

### Backend Auto-Restart (Watchdog)

Backend is protected by a PHP watchdog that runs every 5 minutes via hPanel cron:

```
*/5 * * * * /home/u518768974/watchdog.sh
```

- Checks `curl http://localhost:3000/api/health`
- If down → runs `pm2 restart all` automatically
- Max downtime = 5 minutes
- Logs at `/home/u518768974/watchdog.log`

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

### PM2 Commands (SSH)
```bash
/home/u518768974/.npm-global/bin/pm2 status
/home/u518768974/.npm-global/bin/pm2 restart all
/home/u518768974/.npm-global/bin/pm2 logs --lines 50
```

---

## Local Development

### Run Frontend
```bash
cd Frontend/shopwave
npm install
REACT_APP_API_URL=https://clicksemrus.com/api npm start
```

### Run Admin
```bash
cd admin/admin
npm install
REACT_APP_API_URL=https://clicksemrus.com/api npm start
```

### Build for Production
```bash
# Frontend
cd Frontend/shopwave
REACT_APP_API_URL=https://clicksemrus.com/api npm run build

# Admin (homepage must be "/jaan" in package.json)
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
JWT_SECRET=supersecretjwt2024ecommerce
JWT_EXPIRE=7d
FAST2SMS_API_KEY=your_key_here   # needs ₹100 recharge at fast2sms.com
```

### MySQL (Hostinger)
Database: `u518768974_amshine`  
User: `u518768974_amshine_user`  
Config: `beckend/beckend/config/mysql.js` (uses unix socket `/tmp/mysql.sock`)

---

## Manual Deploy

If webhook fails, SSH and run manually:

```bash
ssh -p 65002 u518768974@145.79.25.65
/home/u518768974/deploy.sh
```

---

*Amshine Jewellery — Handcrafted with Love, BIS Hallmarked Gold*
