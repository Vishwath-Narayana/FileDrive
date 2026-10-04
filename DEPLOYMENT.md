# Deployment guide

Frontend: **Vercel** (unchanged). Backend: **Fly.io** (always-on; any Docker host works).
Files: **Cloudflare R2**. Database: **MongoDB Atlas** (unchanged). Auth: **Supabase** (unchanged).

## 0. Do this first: rotate leaked credentials

`backend/.env` and `frontend/.env` were committed to a public repository. Removing them from the
latest commit does not remove them from git history. Treat all of these as compromised and replace them:

- MongoDB Atlas database user password (and consider a new user)
- Cloudinary API secret (until you finish migrating files off Cloudinary)
- Gmail app password (nothing in the code uses it; just revoke it)
- Supabase anon key is public by design, but the project URL was exposed too; check the Auth logs for odd sign-ins

Optionally purge history with `git filter-repo --path backend/.env --path frontend/.env --invert-paths`
and force-push, but rotation is what actually protects you.

## 1. Supabase

1. **Authentication > URL Configuration**: set *Site URL* to your Vercel URL and add it (plus any preview
   domain) to *Redirect URLs*. Password reset and invite links fail silently without this.
2. **Authentication > Providers > Email**: set *Minimum password length* to 8, keep *Confirm email* on.
3. **Authentication > Multi-Factor**: make sure TOTP is enabled (default on hosted projects).
4. **Project Settings > API**: copy `service_role` key (backend only, never in the frontend) and note the project URL.
   If *JWT Keys* shows the legacy HS256 secret in use, also set `SUPABASE_JWT_SECRET`.

## 2. Cloudflare R2

1. Create a bucket (e.g. `filedrive`). Keep it **private**.
2. *Manage R2 API tokens*: create a token with *Object Read & Write* on that bucket. Note the account ID,
   access key ID and secret.
3. For avatars only: enable a public access domain (r2.dev or a custom domain) and set it as `R2_PUBLIC_URL`.
   Only the `avatars/` prefix is ever linked publicly; user files are served via 5-minute signed URLs.
4. Add a CORS rule on the bucket so browsers can preview files:
   `AllowedOrigins: [your Vercel URL]`, `AllowedMethods: [GET, HEAD]`, `AllowedHeaders: [*]`.

## 3. Backend on Fly.io

```bash
cd backend
fly launch --no-deploy --copy-config      # pick a unique app name; keep fly.toml
fly secrets set \
  MONGO_URI='...' FRONTEND_URL='https://your-app.vercel.app' \
  SUPABASE_URL='https://xxx.supabase.co' SUPABASE_SERVICE_ROLE_KEY='...' \
  R2_ACCOUNT_ID='...' R2_ACCESS_KEY_ID='...' R2_SECRET_ACCESS_KEY='...' \
  R2_BUCKET='filedrive' R2_PUBLIC_URL='https://pub-xxxx.r2.dev'
fly deploy
curl https://<app>.fly.dev/health          # {"ok":true,"db":"up",...}
```

Keep it at **one machine**: Socket.io rooms live in process memory. To scale out later, add the
Redis adapter (`@socket.io/redis-adapter`). Atlas: allow the Fly egress IPs, or use `0.0.0.0/0` with a strong DB password.

Other hosts (Railway, Koyeb, Render paid) work with the same `Dockerfile`. A free Render instance sleeps
after ~15 minutes idle, which drops websockets and makes the first request slow; that was the main
"works, then breaks when left alone" cause.

## 4. Frontend on Vercel

Set environment variables (Production and Preview) and redeploy:

```
VITE_API_URL=https://<app>.fly.dev/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## 5. Migrate existing files from Cloudinary

Files uploaded before this change still live in Cloudinary and show "not migrated" until copied.

```bash
cd backend
node scripts/migrate-cloudinary-to-r2.js --dry-run
node scripts/migrate-cloudinary-to-r2.js
```

It copies each file and avatar to R2 and updates the database. Cloudinary originals are left untouched
so you can verify first and delete them yourself later. Re-running is safe.

## 6. Two-step verification (TOTP)

Users turn it on in *Settings > Two-step verification*. After that, login asks for a code, and the API
rejects tokens that did not pass the code step (needs `SUPABASE_SERVICE_ROLE_KEY`). Supabase has no
recovery codes: a user who loses their authenticator must be reset by an admin
(Supabase dashboard > Authentication > Users > the user > remove factor).

## Environment variable reference

See `backend/.env.example` and `frontend/.env.example`.
