# Admin Dashboard (ADMINIS)

Brief description
- A full-stack Admin Dashboard application with an Angular frontend and a Node.js (Express) backend. It provides user management, content management, analytics, reports, and system settings. A simple landing page is implemented as the default unauthenticated route.

**Contents**
- `Dashboard/backend` — Node.js/Express API, models, controllers, middleware, tests.
- `Dashboard/frontend` — Angular application (Material) with the landing page, auth, dashboard and management UIs.

**Key Features**
- Authentication (login, reset password, forgot password).
- Role-based access control (RBAC) for routes and features.
- User management (list, create, edit users).
- Content management and reports.
- Analytics and audit logs.
- WebSocket support for real-time notifications (socket integration).
- Landing page with hero, features grid, CTAs and a contact form.

<img width="1920" height="1078" alt="Application Overview " src="https://github.com/user-attachments/assets/65e4cd8b-2c3b-4f29-90d4-831436ae2942" />

---

**Architecture & Tech**
- Frontend: Angular (Material), TypeScript, responsive CSS.
- Backend: Node.js + Express, MongoDB (Mongoose models), JWT auth.
- Dev container friendly and can be run with Docker Compose (see `Dashboard/docker-compose.yml`).

---

Getting started (development)

Prerequisites
- Node.js 18+ and `npm` (or your Node version manager)
- Optional: Docker & Docker Compose (for containerized run)
- MongoDB (local) or MongoDB Atlas connection string

1) Clone repository

```bash
git clone <repo-url>
cd Admin--Dashboard/Dashboard
```

2) Backend setup

- Copy environment example and edit values:

```bash
cd backend
cp env.example .env
# Edit .env to include MONGODB_URI, JWT_SECRET, PORT, etc.
```

- Install and run backend in dev mode:

```bash
npm install
npm run dev   # or `npm start` depending on scripts
```

Notes: Backend project files are under `Dashboard/backend/src` including `server.js`, `controllers/`, `models/`, `routes/` and `middleware/`.

3) Frontend setup

```bash
cd ../frontend
npm install
npm start   # runs Angular dev server (usually on http://localhost:4200)
```

The landing page is the default route (`/`). Use the Sign In button to navigate to the login page.

4) Running with Docker (optional)

- See `Dashboard/docker-compose.yml` — you can start services with:

```bash
cd Dashboard
docker-compose up --build
```

---

Landing page details (what was added/updated)
- Located at `frontend/src/app/components/landing/`:
  - `landing.component.ts` — features array, IntersectionObserver reveal, contact form handler.
  - `landing.component.html` — header, hero, features grid (3 × 2 on desktop), CTA and contact form (after footer as requested).
  - `landing.component.scss` — responsive layout, animations, floating bg, hover micro-interactions.

Notes & decisions
- Icons used are inline SVGs (lucide-style) in the landing component to avoid adding a new dependency.
- Feature cards reveal on scroll using `IntersectionObserver`. Cards are equal-height using flexbox.
- The `app.component.scss` was updated to allow page scrolling for unauthenticated routes (replaced `height:100vh; overflow:hidden` with `min-height:100vh`).

---

![C72B03FD-9656-4FFB-9E12-BEC063D33C4F_1_206_a](https://github.com/user-attachments/assets/06d7b1d0-b198-473c-b05e-4d4ba9386a4a)

---

Environment variables (backend)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret used for JWT tokens
- `PORT` — backend server port

Check `Dashboard/backend/env.example` for the full list.

---

Testing
- Backend unit tests are under `Dashboard/backend/src/tests` and can be run via the backend's test script, for example:

```bash
cd Dashboard/backend
npm test
```

---

Deployment
- Typical steps:
  1. Build backend image or deploy Node app to your server/host.
 2. Build frontend production bundle: `cd Dashboard/frontend && npm run build`.
 3. Serve `dist` with Nginx or include the bundle into a container.
 4. Set production env variables (MongoDB URI, JWT secret).

---

Troubleshooting / Tips
- If the landing page does not scroll: ensure `Dashboard/frontend/src/app/app.component.scss` does not set `overflow:hidden` on `.app-wrapper` (this repository updates that file already).
- If templates fail to compile, check Angular template expressions (avoid using `new` inside templates). The `currentYear` is computed in the component.
- If you see Material-related build errors, confirm your Angular Material packages are installed and matched to your Angular version.

Security & Next steps
- Add proper server-side validation for the contact form before sending messages to any email or backend endpoint.
- Replace `alert()` on form submit with `MatSnackBar` or in-app notification.
- Add rate-limiting on the contact endpoint to prevent spam.

Contributors
- See `README.md` in `Dashboard/` or repository contributors on GitHub.
