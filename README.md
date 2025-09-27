# Note Assign — Full‑stack Notes App (Bun + Hono + React + MongoDB)

A professional, mobile‑friendly note‑taking application with Email OTP and Google sign‑in. Users can create and delete notes, with JWT-based authorization. The UI follows a clean blue theme (#367AFF) and adapts for mobile vs large screens (shows `side.png` on wide viewports).

## Tech Stack
- Frontend: React + TypeScript (Vite), Tailwind CSS, Framer Motion, react-swipeable
- Backend: Bun + Hono (TypeScript), MongoDB (Mongoose), Zod, jose (JWT)
- Email: MailerSend (free tier) for OTP emails
- Auth: Email + OTP, optional Google sign‑in (Google Identity Services)
- Deployment: Any Node-compatible host (Render/Railway/Fly) for backend, Vercel/Netlify for frontend

## Features
- Sign up with Name, Date of Birth, Email + OTP flow (animated OTP reveal)
- Login via Email + OTP or Google account
- “Keep me signed in” option for login (longer JWT expiry)
- Authenticated dashboard with user name/email and notes list
- Create notes, delete via swipe-to-delete (mobile) or delete button
- Fully responsive and themed (#367AFF)

## Repo layout
- `backend/` — Hono API server (TypeScript, Bun)
- `frontend/` — React app (TypeScript, Vite + Tailwind)
- `assets/` — Static design assets (ensure `side.png` is present)

## Environment variables

Create your own `.env` files based on the examples below. Do NOT commit real secrets.

### backend/.env.example
```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-strong-secret
# MailerSend
MAILERSEND_API_KEY=your-mailersend-api-key
MAIL_FROM_EMAIL=no-reply@yourdomain.com
MAIL_FROM_NAME=Note Assign
# Google Sign-In (optional)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
CORS_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=localhost
```

### frontend/.env.example
```
VITE_API_URL=http://localhost:3000
# Optional Google sign-in client id
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

## Local setup
Prereqs: Bun, Node 18+ (for tooling), and MongoDB connection string.

1) Install dependencies
- Backend: `cd backend && bun install`
- Frontend: `cd frontend && bun install`

2) Configure env files
- Copy `backend/.env.example` to `backend/.env` and fill values
- Copy `frontend/.env.example` to `frontend/.env`

3) Run
- Backend: `bun run dev` (from `backend/`)
- Frontend: `bun run dev` (from `frontend/`)

Frontend runs at http://localhost:5173 and talks to API at `VITE_API_URL`.

Troubleshooting
- If OTP emails don’t arrive on free plan, ensure `MAIL_FROM_EMAIL` is a verified sender in MailerSend and check spam.
- For local testing without MailerSend, the server logs the OTP when `MAILERSEND_API_KEY` is missing.
- If Google sign‑in fails: confirm the origin http://localhost:5173 is added in Google Cloud OAuth client and both frontend and backend use the same client id.

## MailerSend setup (OTP)
- Create a MailerSend account (free tier)
- Generate an API key and add it to `MAILERSEND_API_KEY`
- Use a verified sender (domain or trial sender address) for `MAIL_FROM_EMAIL`

## Google Sign-In (optional)
- Create a project in Google Cloud Console
- Enable “OAuth consent screen” and create a Web client
- Add authorized JavaScript origins (e.g., http://localhost:5173) and redirect URIs if needed
- Put the client id in both `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend)

## Deployment
- Backend: Render/Railway/Fly — set environment variables from `backend/.env.example`.
	- Build command: bun install
	- Start command: bun src/index.ts
	- Expose port in env `PORT`
	- CORS: set `CORS_ORIGIN` to your frontend URL
	- Cookies: set `COOKIE_DOMAIN` to your apex/domain
- Frontend: Vercel/Netlify
	- Build: bun install && bun run build
	- Output dir: dist
	- Env: `VITE_API_URL` pointing to API URL, optional `VITE_GOOGLE_CLIENT_ID`

## Design and UX
- Primary theme color: #367AFF
- On large screens, the auth page shows `side.png` alongside the form
- On small screens, only fields and buttons are shown
- OTP input appears with animation after clicking “Get OTP”
- Login/Signup OTP step includes “Keep me signed in”.
- Dashboard shows user name/email, notes list, Create button, and swipe/delete.

## Scripts (once scaffolded)
- Backend: `bun run dev` (watch), `bun run start`
- Frontend: `bun run dev`, `bun run build`, `bun run preview`

## Commit policy
Commit after each meaningful feature:
- README and scaffolding
- OTP request/verify
- JWT and auth middleware
- Notes CRUD
- Google sign-in
- Frontend pages and wiring

## License
MIT
