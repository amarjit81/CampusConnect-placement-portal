# CampusConnect deployment

CampusConnect is designed for a static frontend, a Node.js API service, and a
MongoDB database. Deploy the frontend and backend separately unless the chosen
platform provides a combined service.

## Production environment

Backend variables:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/campusconnect
JWT_SECRET=use-a-long-random-production-secret
CORS_ORIGIN=https://your-frontend.example.com
```

Frontend build variable:

```env
VITE_API_URL=https://your-api.example.com/api
```

Never commit real secrets or the local `backend/.env` file.

## Release commands

Frontend verification and build:

```powershell
npm ci
npm run check
```

Backend verification:

```powershell
cd backend
npm ci
npm test
npm run db:verify
```

Start the API with `npm start`. Publish the generated root `dist/` directory to
the static frontend host.

## Database preparation

For a demonstration environment, run `npm run db:seed` once. For a real campus
environment, create administrator and student accounts through an approved
administrative import or onboarding process instead of using seeded passwords.

## Release checklist

- Use HTTPS for both services.
- Restrict `CORS_ORIGIN` to the deployed frontend origin.
- Store `JWT_SECRET` and `MONGODB_URI` in the hosting provider's secret store.
- Confirm `GET /` returns the backend health message.
- Verify student and administrator login.
- Verify students cannot access draft or admin-audience records.
- Verify opportunity, announcement, event, profile, bookmark, and tracker writes.
- Enable database backups and hosting logs.
- Run the GitHub Actions workflow on the release commit.
