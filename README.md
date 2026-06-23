# Trao — AI Travel Planner

An intelligent travel planning web application that generates personalized day-by-day itineraries using Google Gemini AI.

## Live Demo
- **Frontend:** https://your-vercel-url.vercel.app
- **Backend:** https://trao-ai-travel-planner-production.up.railway.app

## GitHub Repository
https://github.com/Thejesh1007/trao-ai-travel-planner

---

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React + Vite + Tailwind CSS | Familiar stack, fast dev, excellent DX |
| Backend | Node.js + Express | Lightweight, non-blocking, ideal for AI API calls |
| Database | MongoDB + Mongoose | Document model fits nested itinerary structure naturally |
| AI | Google Gemini 2.5 Flash | Free tier, fast response, reliable JSON output |
| Auth | JWT + bcryptjs | Stateless, scalable, industry standard |

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Gemini API key

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

---

## Architecture
Client (React + Vite)

│

│ HTTP + JWT

▼

Express REST API

│

├── Auth Middleware (JWT verify)

│

├── /api/auth → Register / Login

│

└── /api/trips → CRUD + AI Generation

│

├── MongoDB (trip storage)

└── Gemini API (itinerary generation)

---

## Authentication & Authorization

- Passwords hashed with **bcryptjs** (10 salt rounds) before storage
- On login/register, server returns a signed **JWT** (7 day expiry)
- Frontend stores token in **localStorage** and attaches it via Axios interceptor
- Every protected route passes through `auth.js` middleware which verifies the JWT
- Every database query filters by `userId` decoded from the JWT — never from request body
- This ensures **strict data isolation**: users can never access each other's trips

---

## AI Agent Design

The Gemini AI integration works as follows:

1. User submits destination, duration, budget tier, and interests
2. Backend constructs a structured prompt specifying exact JSON output format
3. Gemini 2.5 Flash returns a complete itinerary, hotel suggestions, and budget breakdown
4. Response is parsed and saved to MongoDB under the authenticated user's ID
5. **Exponential backoff** retries (1s → 2s → 4s → 8s) handle Gemini rate limits gracefully

---

## Creative Feature: Smart Regeneration with User Feedback

**Problem it solves:** Standard "regenerate" features blindly replace content with random output. This doesn't help travelers who have specific preferences.

**How it works:**
- Each day has a "Regenerate with feedback" button
- User types their reason: *"too many museums, I want street food"*
- The backend sends a context-aware prompt to Gemini including:
  - The original trip details (destination, interests, budget)
  - The current day's activities
  - The user's specific feedback
- Gemini regenerates **only that day** with the feedback directly addressed
- Result is saved back to MongoDB and UI updates instantly

This demonstrates **prompt engineering** — the output is meaningfully better than a blind regenerate.

---

## Key Design Decisions

**Why MongoDB over PostgreSQL?**
Trip itineraries are deeply nested documents (trip → days → activities). MongoDB's document model stores this naturally without complex JOIN queries.

**Why Gemini over OpenAI?**
Free tier with generous quota, sufficient quality for structured JSON generation, and no credit card required — appropriate for a project assessment.

**Why React + Vite over Next.js?**
Next.js App Router adds complexity (server components, hydration) that isn't needed here. Vite provides faster builds and simpler mental model, allowing focus on features over framework.

---

## Known Limitations

- Gemini free tier rate limits can cause 15-30 second delays on generation
- Railway free tier spins down after inactivity — first request after sleep takes ~30 seconds
- Budget estimates are AI-generated approximations, not real-time pricing

---

## If I Had More Time

- Add trip sharing via public read-only link
- Cache frequent destinations to reduce Gemini API calls
- Add rate limiting on AI endpoints to prevent abuse
- Add activity cost tracking that updates total budget dynamically