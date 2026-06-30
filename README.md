# CampusConnect

CampusConnect is a frontend-only placement management prototype built with
React and Vite. It uses mock JSON data, React Context, and browser local
storage. No backend or real authentication is included in Version 1.

## Run locally

1. Install Node.js 18 or newer.
2. Open a terminal in this project folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build in `dist`.
- `npm run preview` previews the production build locally.

## Project structure

```text
src/
├── components/
│   ├── announcements/
│   ├── common/
│   ├── layout/
│   ├── notifications/
│   └── opportunities/
├── context/
├── data/
├── pages/
│   ├── admin/
│   ├── shared/
│   └── student/
├── routes/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

## How the prototype works

- The mock login stores the selected role in local storage.
- Initial opportunities, announcements, notifications, and student details
  come from JSON files in `src/data`.
- `CampusContext.jsx` owns shared state and actions.
- Added opportunities and announcements, bookmarks, and read notifications
  are saved in local storage so they survive a page refresh.
- `eligibility.js` compares the mock student profile with each opportunity.
- `ProtectedRoute.jsx` keeps Admin and Student routes separate.

To reset the prototype data, clear this site's local storage in the browser.
