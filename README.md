# Lakshay Design — E-Commerce Website

> **Live Site:** [https://clicksemrus.com](https://clicksemrus.com)
> **Admin Panel:** [https://clicksemrus.com/admin](https://clicksemrus.com/admin)

![Deploy](https://github.com/rithalyarajput-creator/lakshay-design/actions/workflows/deploy.yml/badge.svg)

---

## 🛍️ Project Overview

A full-stack e-commerce web application for jewellery — built with React (frontend + admin) and Node.js/Express backend, deployed on Hostinger shared hosting.

---

## 🏗️ Project Structure

```
lakshay-design/
├── Frontend/shopwave/        # Customer-facing React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Home, Products, Cart, Contact, About
│   │   ├── context/          # Auth & Cart context
│   │   └── App.js
│   └── package.json
│
├── admin/admin/              # Admin dashboard (React)
│   ├── src/
│   │   ├── pages/            # Products, Categories, FAQs, Orders, Leads, CMS
│   │   ├── components/       # Table, Modal, ImageUpload, Toast
│   │   └── api/axios.js      # API client
│   └── package.json
│
├── beckend/beckend/          # Node.js + Express API (original)
│   ├── controllers/
│   ├── models/               # MongoDB/Mongoose models
│   ├── routes/
│   └── server.js
│
└── .github/workflows/
    └── deploy.yml            # Auto-deploy on push to main
```

---

## ⚙️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router, CSS Modules |
| Admin     | React 18, Axios                     |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas (cloud)               |
| Auth      | JWT (JSON Web Tokens) + bcryptjs    |
| Hosting   | Hostinger Shared Hosting            |
| Server    | Apache + PHP proxy → Node.js PM2    |
| CI/CD     | GitHub Actions + Webhook            |

---

## 🚀 Auto-Deploy (CI/CD)

Push to `main` branch → **automatically deploys to live server**.

```bash
# Make your changes, then:
git add .
git commit -m "your change description"
git push origin main
# ✅ Live in 3-5 minutes at clicksemrus.com
```

**Deploy flow:**
```
git push → GitHub Actions → Webhook → Hostinger Server
                                           ↓
                                    git pull + npm build
                                           ↓
                                    clicksemrus.com LIVE
```

---

## 🔐 Admin Panel

| Detail   | Value                              |
|----------|------------------------------------|
| URL      | https://clicksemrus.com/admin      |
| Email    | admin@amshine.com                  |
| Password | Admin@123                          |

### Admin Features
- 📦 **Products** — Add/edit/delete with image upload, import from Meesho/Amazon/Flipkart URL
- 🗂️ **Categories** — Manage product categories with images
- ❓ **FAQs** — Add FAQs, toggle show on homepage
- 📋 **Orders** — View and manage customer orders
- 👥 **Leads** — Customer enquiries/leads management
- 🎟️ **Offers/Coupons** — Discount coupon management
- 👤 **Customers** — Registered users list
- 📝 **CMS** — Edit About page, banners, homepage content
- 🏠 **HomePage** — Manage banners and featured content
- 💬 **Testimonials** — Customer reviews

---

## 🌐 API Endpoints

Base URL: `https://clicksemrus.com/api/`

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | /auth/login            | Admin/User login         |
| POST   | /auth/register         | User registration        |
| GET    | /products              | Get all products         |
| POST   | /products              | Create product (admin)   |
| PUT    | /products/:id          | Update product (admin)   |
| DELETE | /products/:id          | Delete product (admin)   |
| POST   | /products/:id/upload   | Upload product images    |
| GET    | /categories            | Get all categories       |
| GET    | /faqs                  | Get all FAQs             |
| GET    | /faqs/home             | Get homepage FAQs        |
| GET    | /orders                | Get orders (admin)       |
| POST   | /leads                 | Submit lead/enquiry      |

---

## 🗄️ Database

- **MongoDB Atlas** — cloud hosted
- **Cluster:** cluster0.oitjdhr.mongodb.net
- **Database name:** ecommerce

### Models
- `User` — customers and admin accounts
- `Product` — product catalog with images, pricing, categories
- `Category` — product categories with images
- `Order` — customer orders
- `FAQ` — frequently asked questions (showOnHome flag)
- `Lead` — customer enquiries
- `Coupon` — discount codes
- `Testimonial` — customer reviews

---

## 🖥️ Server Setup (Hostinger)

| Detail          | Value                                      |
|-----------------|--------------------------------------------|
| Server IP       | 145.79.25.65                               |
| SSH Port        | 65002                                      |
| Domain          | clicksemrus.com                            |
| Node.js path    | /opt/alt/alt-nodejs20/root/usr/bin/node    |
| Backend dir     | /home/u518768974/api_backend               |
| Public HTML     | /home/u518768974/domains/clicksemrus.com/public_html |
| Process manager | PM2 (app name: amshine-backend)            |
| Backend port    | 3000 (internal, via PHP proxy)             |

### How Apache → Node.js works
```
Browser → Apache → api.php (PHP proxy) → Node.js :3000
```
The `api.php` file forwards all `/api/*` requests to `http://localhost:3000/api/*`.

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Clone repo
git clone https://github.com/rithalyarajput-creator/lakshay-design.git
cd lakshay-design

# Frontend
cd Frontend/shopwave
npm install
npm start        # runs on http://localhost:3000

# Admin (new terminal)
cd admin/admin
npm install
npm start        # runs on http://localhost:3001

# Backend (new terminal)
cd beckend/beckend
npm install
# create .env file:
# PORT=5000
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_secret
npm start
```

---

## 📁 Environment Variables

### Frontend / Admin (`.env.production`)
```
REACT_APP_API_URL=https://clicksemrus.com/api
```

### Backend (`.env`)
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=supersecretjwt2024ecommerce
JWT_EXPIRE=7d
```

---

## 📦 Deploy Manually

If auto-deploy fails, run this on your machine:

```bash
# SSH into server
ssh -p 65002 u518768974@145.79.25.65

# Run deploy script
/home/u518768974/deploy.sh
```

Or check deploy log:
```bash
cat /home/u518768974/deploy.log
```

---

## 📸 Screenshots

| Page | URL |
|------|-----|
| Home | https://clicksemrus.com/ |
| Products | https://clicksemrus.com/products |
| Admin Dashboard | https://clicksemrus.com/admin/ |

---

*Built and deployed with ❤️ — Auto-deploys on every push to main*
