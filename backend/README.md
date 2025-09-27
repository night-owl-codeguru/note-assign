# Backend (Bun + Hono + MongoDB)

Scripts:
- bun run dev
- bun run start

Environment:
- Copy `.env.example` to `.env` and fill values:
	- `MONGODB_URI`, `JWT_SECRET`, `MAILERSEND_API_KEY`, `MAIL_FROM_EMAIL`, `GOOGLE_CLIENT_ID`, `CORS_ORIGIN`, `COOKIE_DOMAIN`

Email OTP:
- Uses MailerSend API via fetch. If `MAILERSEND_API_KEY` is missing, OTP is logged server-side for development.
- OTP codes are stored in Mongo (`Otp` model) with a TTL field. Default validity is 5 minutes.
- Rate limiting for `/auth/request-otp` uses `OtpRequest` Mongo logs with short TTLs and enforces:
	- per-email: 3/min and 10/hour
	- per-IP: 10/min
	Return codes 429 on limit exceeded.

Endpoints:
- POST `/auth/request-otp` { email, name, dob }
- POST `/auth/verify-otp` { email, otp, keepSignedIn? }
- POST `/auth/google` { idToken, keepSignedIn? }
- GET  `/auth/me` -> { user }
- GET  `/notes` (auth)
- POST `/notes` (auth) { content }
- DELETE `/notes/:id` (auth)

Models:
- `User`(name, dob, email, googleId)
- `Note`(userId, content)
- `Otp`(email, code, name?, dob?, expiresAt) — TTL index on expiresAt
- `OtpRequest`(email, ip, expiresAt) — TTL index to purge logs automatically
