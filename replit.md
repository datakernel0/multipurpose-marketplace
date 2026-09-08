# MartPlace Next.js

## App root

The runnable application is in `mplace-nextjs/`.

## Development

From the repository root:

```sh
cd mplace-nextjs
npm run dev -- --hostname 0.0.0.0 --port 5000
```

The Replit workflow named `Start application` runs this command.

## Environment

Copy `mplace-nextjs/.env.example` to `mplace-nextjs/.env` and provide the local
or hosted PostgreSQL connection plus the NextAuth settings before using
database-backed or authenticated flows. Optional OAuth and SMTP settings are
also documented there.

## Verification snapshot

- `npm install` completed and created `mplace-nextjs/package-lock.json`.
- Prisma Client generation completed.
- TypeScript check and production build completed.
- Lint currently reports existing errors and warnings.
- The development server starts on port 5000; core requested routes return
  HTTP 200. Database-backed content requires a configured database with the
  included migrations applied.