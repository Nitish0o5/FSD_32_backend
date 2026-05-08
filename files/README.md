# 🎓 Skillpath — EdTech Enrollment Platform

> *Chart your learning journey.* A modern EdTech backend API for online course enrollment, progress tracking, and certification.

---

## Tech Stack

- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database
- **JWT** — Authentication
- **Helmet + Rate Limiting** — Security

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/skillpath-backend.git
cd skillpath-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET

# 4. Run in development
npm run dev
```

---

## API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register as learner or instructor | Public |
| POST | `/login` | Login and get JWT token | Public |
| GET | `/me` | Get current user profile | Private |
| PUT | `/me` | Update profile | Private |

### Courses `/api/courses`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all published courses (filterable) | Public |
| GET | `/:slug` | Get single course by slug | Public |
| POST | `/` | Create a new course | Instructor/Admin |
| PUT | `/:id` | Update course | Instructor/Admin |
| DELETE | `/:id` | Delete course | Instructor/Admin |
| GET | `/instructor/my-courses` | Get instructor's courses | Instructor |

### Enrollments `/api/enrollments`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/:courseId` | Enroll in a course | Learner |
| GET | `/my-learning` | Get all my enrolled courses | Learner |
| PUT | `/:courseId/progress` | Mark lesson complete + update progress | Learner |
| PUT | `/:courseId/review` | Submit rating & review | Learner |
| DELETE | `/:courseId` | Drop a course | Learner |

### Admin `/api/admin`
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Platform stats (users, courses, enrollments) | Admin |
| GET | `/users` | List all users | Admin |
| PUT | `/users/:id/toggle` | Activate/deactivate user | Admin |
| PUT | `/courses/:id/status` | Publish/archive a course | Admin |

---

## Roles

| Role | Capabilities |
|------|-------------|
| `learner` | Browse courses, enroll, track progress, earn certificates |
| `instructor` | Create and manage their own courses |
| `admin` | Full platform control |

---

## Features

- ✅ JWT-based authentication with role-based access control
- ✅ Course catalog with filters (category, level, free/paid, search)
- ✅ Enrollment with progress tracking (lesson-by-lesson)
- ✅ Auto-completion + certificate issuance on 100% progress
- ✅ Ratings & reviews (only for completed courses)
- ✅ Waitlist system when a course hits max enrollment
- ✅ Instructor dashboard (manage own courses)
- ✅ Admin stats dashboard
- ✅ Rate limiting on auth routes
- ✅ Helmet security headers
- ✅ Centralized error handling

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS |
| `NODE_ENV` | `development` or `production` |
