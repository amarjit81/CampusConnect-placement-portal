# CampusConnect

CampusConnect is a placement-management application for students and Training
and Placement administrators. It has a React/Vite frontend and an
Express/MongoDB backend.

## Current features

### Student workspace

- Browse, search, and filter placement opportunities.
- Check eligibility against the demo student profile.
- Bookmark opportunities in browser storage.
- Maintain a personal application tracker in browser storage.
- Review upcoming events and announcements.
- Mark announcements as read or unread.

### Administrator workspace

- Review placement activity from the dashboard.
- Create and browse persistent opportunities.
- Create and browse persistent announcements.

Opportunities and announcements are stored in MongoDB. Authentication,
bookmarks, applications, profiles, and events are the next backend-integration
milestones. Until authentication is added, new API records are associated with
the active seeded Admin account.

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
```

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

## Demo accounts

The database seed creates these accounts for the upcoming authentication
milestone:

- Admin: `admin@campusconnect.edu` / `Admin@123`
- Student: `student@campusconnect.edu` / `Student@123`

The current login screen still uses role-based demo access and does not accept
these credentials yet.

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
