# CampusConnect database

CampusConnect uses MongoDB locally and Mongoose in the Express backend.

The opportunity and announcement APIs currently read and write these MongoDB
collections directly. Other frontend features still use mock data or browser
storage and will be migrated in later milestones.

## Connection

The development database is configured in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
```

Use `127.0.0.1` instead of `localhost` to avoid IPv6 connection differences on
some Node.js installations.

## Collections

- `users`: login identity, role, account state, and password hash.
- `studentprofiles`: academic and placement-eligibility information for a
  student user.
- `opportunities`: placement and internship postings created by an admin.
- `applications`: a student's application and current selection progress.
- `bookmarks`: opportunities saved by a student.
- `announcements`: notices published by an admin.
- `events`: workshops, drives, interviews, and deadlines.

## Relationships

```text
User (admin)    1 ─── creates ─── * Opportunity
User (admin)    1 ─── creates ─── * Announcement
User (admin)    1 ─── creates ─── * Event

User (student)  1 ─── has ─────── 1 StudentProfile
User (student)  1 ─── applies ─── * Application * ─── belongs to ─── 1 Opportunity
User (student)  1 ─── saves ───── * Bookmark    * ─── points to ──── 1 Opportunity
```

MongoDB references are used where the related record has its own lifecycle.
Small data owned by one record, such as an announcement attachment, is embedded.

## Important constraints

- User email is unique.
- Student enrollment number is unique.
- A user can have only one student profile.
- A student can apply to an opportunity only once.
- A student can bookmark an opportunity only once.
- CGPA must be between 0 and 10.
- Event end time cannot be before its start time.
- Enum fields reject unsupported roles, statuses, audiences, and event types.

## Development commands

Run these commands from `backend/`:

```powershell
npm run db:seed
npm run db:verify
npm run dev
```

`db:seed` is idempotent: it updates the same demo records when rerun instead of
creating duplicates. `db:verify` prints collection counts and populates a sample
application to prove that its user and opportunity references work.

## Demo accounts

These accounts are for local development only:

- Admin: `admin@campusconnect.edu` / `Admin@123`
- Student: `student@campusconnect.edu` / `Student@123`

Passwords are stored as bcrypt hashes, not as plain text.

Until JWT authentication is implemented, opportunity and announcement create
requests are associated with the first active seeded Admin account. Run
`npm run db:seed` before using those endpoints in a fresh database.
