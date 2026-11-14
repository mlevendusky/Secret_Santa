# Secret Santa

Gift list app. Each person adds a list (or uploads a CSV). Others claim items and see who is buying what. The person being bought for only sees "Picked".

## Deploy (GitHub + Vercel + Neon)

1. **GitHub** — create a new repository and upload the contents of this folder.
2. **Vercel** — Add New → Project → import the repository. Framework is detected as Next.js; leave build settings as default.
3. **Neon** — in the Vercel project: Storage → Create / Connect Database → Neon → connect it to the project.
   This should add `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct). Check Settings → Environment Variables; if the direct URL has a different name, add `DATABASE_URL_UNPOOLED` with that value.
4. **AUTH_SECRET** — Settings → Environment Variables → add `AUTH_SECRET` with a long random string (e.g. output of `npx auth secret` or any 32+ random characters).
5. **Deploy** — Deployments → Redeploy. The build runs `prisma migrate deploy`, which creates the tables in Neon.

Then open the site, register, and share the link.

## CSV format

```
title,link,price,notes
Wool scarf,https://www.example.com/scarf,25,Navy or grey
```

Only `title` is required. Links must start with `http://` or `https://`. See `test-list.csv` for a sample.

## Run locally

```
npm install
cp .env.example .env   # fill in your Postgres URL and AUTH_SECRET
npx prisma migrate dev
npm run dev
```
# Secret_Santa
# Secret_Santa
# Secret_Santa
