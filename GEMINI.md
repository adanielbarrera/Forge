# GEMINI.md - Forge Project Context

## Project Overview
**Forge** is a workout tracking application designed for small gyms (like "Olympia Gym Box"). It provides personalized AI-driven feedback for members and a management dashboard for trainers.

### Architecture
The project is a monorepo-style structure with separate `frontend` and `backend` directories.
- **Frontend:** React 18 SPA (Vite).
- **Backend:** Node.js Express REST API.
- **Database:** PostgreSQL managed via Prisma ORM.

## Tech Stack
### Frontend
- **Framework:** React 19 (using `react-router-dom` v7).
- **Styling:** Tailwind CSS 4 (using `@tailwindcss/vite`).
- **Data Fetching:** Axios.
- **Charts:** Recharts (for progress visualization).
- **Icons:** Phosphor Icons (recommended in design docs).

### Backend
- **Runtime:** Node.js (CommonJS).
- **Framework:** Express 5.
- **ORM:** Prisma with PostgreSQL.
- **Authentication:** JWT + bcrypt.
- **Security:** Helmet, CORS, Express Rate Limit.
- **External APIs:** OpenAI (AI Feedback), Stripe (Payments).

## Design System (High Priority)
The project follows a strict design system documented in `docs/forge-design.md`.

### Core Principles
1. **Data First:** Performance numbers (kg, reps, series) are protagonists. Use **DM Mono** font for numbers.
2. **Touch Generous:** Minimum tap target of 44x44px in mobile.
3. **Context Aware:** 
   - **Mobile (Member):** Dark theme (`#0A0A0E`), immersive.
   - **Desktop (Trainer/Admin):** Light theme (`#FAFAF7`), data-dense.
4. **AI as Guide:** AI content is identified with **Pulse Blue** (`#6B7AFF`).

### Color Palette
- **Orange (`#E05C2A`):** Primary CTAs and registration actions only.
- **Iron (`#0A0A0E`):** Mobile background / Desktop primary text.
- **Chalk (`#F5F0E8`):** Dark theme primary text.
- **Brass (`#C8A96E`):** Personal Records (PRs) and achievements.
- **Blue (`#6B7AFF`):** AI-related content.

### Typography
- **Syne (800):** Display, screen titles.
- **Figtree (400, 500, 600):** UI, body, labels, buttons.
- **DM Mono (400, 500):** Numerical data (kg, reps, time).

## Development Guide

### Prerequisites
- Node.js installed.
- PostgreSQL database (or Supabase for cloud).
- `.env` file in `backend/` (see `.env.example`).

### Getting Started
1. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate       # Generates client
   npx prisma migrate dev    # Applies migrations
   npm run dev               # Starts with nodemon + tsx
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev            # Starts Vite dev server
   ```

### Database Schema (Prisma)
Key models:
- **User:** Role-based (MEMBER, TRAINER).
- **Workout:** Contains exercises and sets.
- **Exercise:** Catalog of movements.
- **WorkoutSet:** Specific series, reps, and weight.
- **Membership:** Tracking for gym access.

*Note: Database fields use Spanish names (e.g., `nombre`, `peso`, `fecha`).*

### Coding Conventions
- **Backend:** 
  - Controllers in `src/controllers/`.
  - Routes in `src/routes/`.
  - Prisma client initialized in `src/prisma.js`.
  - Use `require` (CommonJS).
- **Frontend:**
  - Pages in `src/pages/`.
  - Components in `src/components/`.
  - Use ESM (`import`/`export`).
  - Follow Tailwind CSS utility patterns.

## Important Routes
- `/auth`: Login/Register.
- `/api/workouts`: CRUD for training sessions.
- `/api/memberships`: Subscription management.
- `/api/stats`: Performance analytics.
- `/health`: Health check endpoint.

## Project Vision
Forge aims to bridge the gap between "just tracking" and "coaching" by using AI to analyze session data and provide actionable motivational feedback directly to the athlete.
