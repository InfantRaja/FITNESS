# FitTrack — Personal Fitness Tracker Web Application

> A modern, responsive, full-stack fitness tracker web application built with Vanilla HTML5, CSS3, ES6 JavaScript, Node.js, Express, and MongoDB Atlas.

---

## 📸 Overview & Features

FitTrack empowers users, students, and gym-goers to track their daily wellness journey with precision:
- **Secure Authentication:** User registration, password hashing with bcrypt, JWT token authentication, and password reset.
- **Daily Dashboard:** 4 key stat widgets (Daily Calories, Hydration, Workout Minutes, Body Weight) and live activity feed.
- **Dynamic Workout Tracker:** Log exercises with customized sets, repetitions, weights (kg), categories, and duration.
- **Nutrition & Macro Tracker:** Real-time calculation of daily calories, protein (g), carbohydrates (g), and fats (g) across Breakfast, Lunch, Dinner, and Snacks.
- **Hydration Tracker:** Visual animated water cup, one-click quick add (+250ml, +500ml, +750ml), and daily percentage target.
- **Milestone Goals:** Set and update targets for weight loss, workout frequency, and hydration.
- **Interactive Analytics:** Powered by **Chart.js** displaying 7-day caloric balance, body weight trajectory, and workout frequency.
- **Activity History & CSV Export:** Search and filter past activities, with 1-click export of data to CSV.
- **Theme Switcher:** Seamless Dark Navy / Clean Light theme toggle.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System with CSS variables), Vanilla JavaScript (ES6+), Chart.js (CDN)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (M0 Free Tier) with Mongoose ODM
- **Security:** Helmet, CORS, Express-Rate-Limit, Bcrypt.js, JsonWebToken
- **Hosting:**
  - Frontend: **Vercel**
  - Backend: **Render**
  - Database: **MongoDB Atlas**
  - Domain: Connected via DNS `A` and `CNAME` records

---

## 📂 Project Architecture

```
IR FITNESS/
├── backend/
│   ├── config/db.js                 # MongoDB connection handler
│   ├── controllers/                 # Business logic for auth, workouts, food, water, goals, metrics
│   ├── middleware/                  # JWT auth, centralized error handler, rate limiting
│   ├── models/                      # Mongoose schemas (User, Workout, FoodLog, WaterLog, Goal, BodyMetric)
│   ├── routes/                      # REST API routes (/api/v1/...)
│   ├── utils/                       # JWT token helper, CSV serializer
│   ├── .env.example                 # Environment variables template
│   ├── package.json                 # Backend dependencies & scripts
│   └── server.js                    # Express app server entry point
│
├── frontend/
│   ├── assets/
│   │   ├── css/ (main.css, components.css, layout.css, pages.css)
│   │   └── js/ (api.js, ui.js, auth.js, dashboard.js, workouts.js, nutrition.js, water.js, goals.js, analytics.js, history.js, profile.js)
│   ├── index.html                   # Landing page
│   ├── login.html                   # Login page
│   ├── register.html                # Register page
│   ├── forgot-password.html         # Password recovery
│   ├── dashboard.html               # Main dashboard
│   ├── workouts.html                # Workout logging
│   ├── nutrition.html               # Meal & macro tracker
│   ├── water.html                   # Hydration tracker
│   ├── goals.html                   # Fitness goals milestones
│   ├── analytics.html               # Chart.js graphs
│   ├── history.html                 # History & CSV export
│   ├── profile.html                 # Profile & settings
│   ├── 404.html                     # Error page
│   └── vercel.json                  # Vercel routing
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18.x or newer) installed.
- **VS Code** with the *Live Server* extension (recommended for frontend preview).
- **MongoDB** (Local instance or free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)).

### 2. Configure Backend
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy environment template:
   ```bash
   copy .env.example .env
   ```
3. Update `.env` with your MongoDB connection string:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=*
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   node server.js
   ```
   The backend will start on `http://localhost:5000` with health check at `http://localhost:5000/api/v1/health`.

### 3. Run Frontend
1. Open the `frontend/` folder in VS Code.
2. Right click on `index.html` and choose **"Open with Live Server"** (or double-click `index.html` to open in any web browser).
3. The frontend will communicate with your local backend (`http://localhost:5000/api/v1`). If the backend is temporarily offline, the frontend includes built-in live preview fallbacks.

---

## 🌐 Production Deployment Guide

### Step 1: Deploy Backend to Render
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service** and connect your GitHub repository.
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_production_secret_key`
   - `CLIENT_URL`: `*` (or your frontend domain)
6. Click **Deploy**. Note your service URL (e.g. `https://fittrack-api.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** and import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. In `frontend/assets/js/api.js`, update the production API URL:
   ```javascript
   const API_BASE_URL = isLocalhost
     ? 'http://localhost:5000/api/v1'
     : 'https://fittrack-api.onrender.com/api/v1';
   ```
5. Click **Deploy**. Vercel will assign a production URL (e.g. `https://fittrack.vercel.app`).

### Step 3: Connect Custom Domain (.com / .in)
1. In your **Vercel Project Dashboard**, navigate to **Settings** -> **Domains**.
2. Enter your custom domain (e.g. `yourfitnesssite.com` and `www.yourfitnesssite.com`).
3. Log in to your domain registrar (Namecheap, GoDaddy, Hostinger, Cloudflare) and open the **DNS Management** page.
4. Add the following DNS records:
   - **Apex / Root Domain (`@`):**
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
   - **WWW Subdomain:**
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com.`
5. Vercel will automatically verify domain ownership and provision an SSL certificate (HTTPS) within a few minutes.

---

## 📄 License
MIT License &copy; 2026 FitTrack. Built for fitness excellence.
