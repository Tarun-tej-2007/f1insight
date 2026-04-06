# F1 Insight — Premium Formula 1 Analytics Platform

A full-stack, production-ready Formula 1 analytics platform built with React (Vite) + Express.js + MongoDB.

---

## 🏗️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT (jsonwebtoken + bcryptjs)           |

---

## 📁 Project Structure

```
f1-insight/
├── backend/
│   └── src/
│       ├── app.js                  # Express entry point
│       ├── controllers/            # Route handlers
│       ├── services/               # Analytics engine
│       ├── models/                 # Mongoose schemas
│       ├── routes/                 # Express routers
│       └── middleware/             # Auth + error handling
└── frontend/
    └── src/
        ├── App.jsx                 # Router
        ├── pages/                  # Home, Dashboard, Drivers, Teams, Races, Login, Register, Admin
        ├── components/
        │   ├── common/             # Navbar, Modal, FormInput, PosBadge, etc.
        │   └── charts/             # Recharts wrappers
        ├── context/                # AuthContext, ToastContext
        └── services/               # Axios API client
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and edit env vars
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/f1-insight
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Backend runs on **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`.

---

### 3. Create Your Admin Account

Register at http://localhost:5173/register, then manually promote to ADMIN in MongoDB:

```bash
mongosh f1-insight
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "ADMIN" } })
```

Then login and visit `/admin` to start adding data.

---

## 🔐 API Reference

### Auth
| Method | Endpoint              | Access | Description        |
|--------|-----------------------|--------|--------------------|
| POST   | `/api/auth/register`  | Public | Register user      |
| POST   | `/api/auth/login`     | Public | Login + get JWT    |
| GET    | `/api/auth/me`        | User   | Get current user   |

### Drivers
| Method | Endpoint              | Access | Description        |
|--------|-----------------------|--------|--------------------|
| GET    | `/api/drivers`        | Public | List all drivers   |
| GET    | `/api/drivers/:id`    | Public | Get one driver     |
| POST   | `/api/drivers`        | Admin  | Create driver      |
| PUT    | `/api/drivers/:id`    | Admin  | Update driver      |
| DELETE | `/api/drivers/:id`    | Admin  | Delete driver      |

### Teams
| Method | Endpoint           | Access | Description     |
|--------|--------------------|--------|-----------------|
| GET    | `/api/teams`       | Public | List all teams  |
| POST   | `/api/teams`       | Admin  | Create team     |
| PUT    | `/api/teams/:id`   | Admin  | Update team     |
| DELETE | `/api/teams/:id`   | Admin  | Delete team     |

### Races
| Method | Endpoint                      | Access | Description             |
|--------|-------------------------------|--------|-------------------------|
| GET    | `/api/races?season=2025`      | Public | List races (filterable) |
| POST   | `/api/races`                  | Admin  | Create race             |
| PUT    | `/api/races/:id`              | Admin  | Update race             |
| DELETE | `/api/races/:id`              | Admin  | Delete race             |

### Results
| Method | Endpoint                       | Access | Description             |
|--------|--------------------------------|--------|-------------------------|
| GET    | `/api/results?race=:id`        | Public | List results (filterable)|
| POST   | `/api/results`                 | Admin  | Add result (auto-points)|
| DELETE | `/api/results/:id`             | Admin  | Delete result           |

### Pit Stops
| Method | Endpoint             | Access | Description       |
|--------|----------------------|--------|-------------------|
| GET    | `/api/pitstops`      | Public | List pit stops    |
| POST   | `/api/pitstops`      | Admin  | Add pit stop      |
| DELETE | `/api/pitstops/:id`  | Admin  | Delete pit stop   |

### Analytics (Computed)
| Method | Endpoint          | Access | Description                              |
|--------|-------------------|--------|------------------------------------------|
| GET    | `/api/analytics`  | Public | Standings, progression, ratings, pit efficiency |

### Users
| Method | Endpoint                            | Access | Description            |
|--------|-------------------------------------|--------|------------------------|
| GET    | `/api/users/profile`                | User   | Get profile + favorites|
| POST   | `/api/users/favorites/drivers/:id`  | User   | Toggle driver favorite |
| POST   | `/api/users/favorites/teams/:id`    | User   | Toggle team favorite   |

---

## 📊 Analytics Engine

All analytics are **dynamically computed** on every request — no cached/static data.

### Performance Rating (0–100)
```
consistency  = 100 - (avg_position - 1) * 5
win_bonus    = wins * 5          (capped at 25)
podium_bonus = podiums * 2       (capped at 15)
points_bonus = total_pts / 15   (capped at 20)
trend_bonus  = improvement_over_season (capped at 10)

rating = consistency*0.4 + win_bonus + podium_bonus + points_bonus + trend_bonus
```

### Pit Stop Efficiency
- Avg time, best time, worst time per team
- Standard deviation for consistency scoring
- Efficiency score: `100 - avg*10 - stdDev*5`

### Points Progression
- Cumulative points per driver per race (sorted chronologically)
- Used for the line chart on Dashboard

---

## 🎨 Design System

- **Font**: Rubik (Google Fonts)
- **Primary Red**: `#EE3F2C`
- **Style**: Black background, glassmorphism cards, clipped corner buttons
- **Charts**: Recharts with custom dark theme
- **Animations**: Framer Motion (hero, card hovers, mobile menu)

---

## 🚢 Production Build

```bash
# Frontend
cd frontend && npm run build
# Outputs to frontend/dist/

# Serve frontend dist with Express (add to backend/src/app.js):
# app.use(express.static(path.join(__dirname, '../../frontend/dist')))

# Set env vars on your server:
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
```

---

## 📦 Data Flow

```
Browser → React (Vite) → /api/* proxy → Express → MongoDB
                                ↓
                        Analytics Engine
                    (computed from Results + PitStops)
```
