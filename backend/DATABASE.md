# CampusConnect database

CampusConnect uses MongoDB and Mongoose. The database and non-authenticated API
layers are defined for every current feature. The frontend still needs to be
connected to the newer APIs.

## Connection

Development configuration lives in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
```

Use `127.0.0.1` to avoid local IPv6 resolution differences.

## Collections

- `users`: login identity, role, account state, and password hash.
- `studentprofiles`: academic and eligibility details for a student.
- `opportunities`: placement and internship postings created by an Admin.
- `applications`: a student's application and selection progress.
- `bookmarks`: opportunities saved by a student.
- `announcements`: notices published by an Admin.
- `announcementreads`: per-student announcement read state.
- `events`: workshops, assessments, interviews, drives, and deadlines.

## Relationships

```text
User (admin)   1 --- creates ---> * Opportunity
User (admin)   1 --- creates ---> * Announcement
User (admin)   1 --- creates ---> * Event

User (student) 1 --- has -------> 1 StudentProfile
User (student) 1 --- applies ---> * Application ---> 1 Opportunity
User (student) 1 --- saves -----> * Bookmark -----> 1 Opportunity
User (student) 1 --- reads -----> * AnnouncementRead -> 1 Announcement
Event          * --- may link --> 1 Opportunity
```

MongoDB references are used when related records have separate lifecycles.
Small owned values, such as announcement attachment details, are embedded.

## Constraints

- User email and student enrollment number are unique.
- A user can have only one student profile.
- A student can apply to or bookmark an opportunity only once.
- A student has at most one read-state record per announcement.
- CGPA must be between 0 and 10.
- Backlog counts and graduation years must be whole numbers.
- Event end time cannot be before its start time.
- Branch names and skills are normalized and deduplicated.
- Stored application, resume, registration, and attachment URLs use HTTP(S).
- Enum fields reject unsupported roles, statuses, audiences, and event types.
- Tracker text fields have database-enforced length limits.

## Development commands

Run from `backend/`:

```powershell
npm run db:seed
npm run db:verify
npm test
```

`db:seed` is idempotent and prepares records in all eight collections.
`db:verify` checks indexes, minimum counts, populated references, and related
user roles without creating or deleting data.

## Demo accounts

- Admin: `admin@campusconnect.edu` / `Admin@123`
- Student: `student@campusconnect.edu` / `Student@123`

Passwords are stored as bcrypt hashes. Until authentication is implemented,
existing API create operations use the first active seeded Admin account.
