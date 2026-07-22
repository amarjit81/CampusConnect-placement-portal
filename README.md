# CampusConnect

CampusConnect is a placement-management application for students and Training
and Placement administrators. It has a React/Vite frontend and an
Express/MongoDB backend.

## Current features

### Student workspace

- Browse, search, and filter placement opportunities.
- Check eligibility against the authenticated student's database profile.
- Bookmark opportunities with persistent database-backed state.
- Maintain a persistent personal application tracker.
- Review upcoming events and announcements.
- Mark announcements as read or unread.

### Administrator workspace

- Review placement activity from the dashboard.
- Create, edit, close, and delete persistent opportunities.
- Create, edit, target, and delete persistent announcements.
- Create, edit, and delete placement events.

### Platform capabilities

- JWT authentication with student/admin role authorization.
- Student-specific draft and audience visibility rules.
- Authoritative database writes with clear API validation errors.
- Security headers, request-size limits, login rate limiting, and configurable CORS.
- Automated frontend, backend, API, visibility, and security tests.

The frontend is integrated with the server APIs for opportunities,
announcements, events, bookmarks, applications, profiles, and announcement
read state. Email/password login uses an eight-hour JWT session, and the API
enforces administrator and student permissions. Saved browser data remains
available as an offline fallback after sign-in.

## Requirements

- Node.js 18 or newer
- MongoDB running locally

## Initial setup

Install frontend dependencies from the project root:

```powershell
npm install
```

Install backend dependencies and create the local environment file:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run db:seed
```

The default connection is:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=replace-with-a-long-random-secret
```

The frontend defaults to `http://localhost:8080/api`. To use another API host,
set `VITE_API_URL` in a root `.env` file.

## Run locally

Start the backend from `backend/`:

```powershell
npm run dev
```

In another terminal, start the frontend from the project root:

```powershell
npm run dev
```

Open the Vite address, normally `http://localhost:5173`. The API runs at
`http://localhost:8080`.

If the backend is unavailable, the frontend remains usable with its saved or
seed mock data and displays an offline-data notice.

## Useful commands

From the project root:

```powershell
npm run dev
npm run lint
npm test
npm run check
npm run build
npm run preview
```

From `backend/`:

```powershell
npm run dev
npm test
npm run db:seed
npm run db:verify
```

## API

All feature endpoints require `Authorization: Bearer <token>`.

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`

### Opportunities

- `GET /api/opportunities`
- `GET /api/opportunities/:id`
- `POST /api/opportunities`
- `PUT /api/opportunities/:id`
- `DELETE /api/opportunities/:id`

### Announcements

- `GET /api/announcements`
- `GET /api/announcements/:id`
- `POST /api/announcements`
- `PUT /api/announcements/:id`
- `DELETE /api/announcements/:id`

### Events

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Bookmarks

- `GET /api/bookmarks`
- `POST /api/bookmarks/:opportunityId`
- `DELETE /api/bookmarks/:opportunityId`

### Applications

- `GET /api/applications`
- `GET /api/applications/:id`
- `POST /api/applications`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`

### Student profile

- `GET /api/profile`
- `PUT /api/profile`

### Announcement read state

- `GET /api/announcement-reads`
- `PUT /api/announcement-reads/:announcementId`
- `DELETE /api/announcement-reads/:announcementId`

## Seeded development accounts

The database seed creates these accounts for local development:

- Admin: `admin@campusconnect.edu` / `Admin@123`
- Student: `student@campusconnect.edu` / `Student@123`

The login screen accepts these credentials and routes each account to its
role-specific workspace.

## Production preparation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables, build commands,
hosting layout, database preparation, health checks, and release verification.

## Project structure

```text
CampusConnect/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- models/
|   |-- routes/
|   |-- scripts/
|   `-- test/
|-- src/
|   |-- components/
|   |-- context/
|   |-- data/
|   |-- pages/
|   |-- routes/
|   |-- styles/
|   `-- utils/
|-- package.json
`-- vite.config.js
```
