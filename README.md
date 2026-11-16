# Productivity OSHAPP

Productivity OSHAPP is a Next.js application using Prisma and PostgreSQL.

The website can be found at www.productivity.co.ke.

## Database setup

Set `DATABASE_URL` in the environment to the PostgreSQL connection string supplied by the host. Keep credentials in the host's environment-variable settings or a local, untracked `.env` file; never commit secrets.

For local development, create and apply migrations with:

```bash
npm run db:migrate:dev
```

For staging and production deployments, apply committed migrations with:

```bash
npm run db:migrate:deploy
```

To create the first production administrator, run `npm run admin:create` from the application directory after the production database migration. Node loads the server's `.env` file for `DATABASE_URL` and related variables.

After signing in, use the administrator's User Accounts screen to create workplace users. Set their role to `user`, assign their organisation and county, and provide a new temporary password through the onboarding workflow.

Do not use `db:push` or `db:reset` against staging or production. The first migration creates the schema in an empty PostgreSQL database. It does not copy data from the old SQLite development database.

Use a separate database and separate secrets for staging and production. Keep the staging app on a staging hostname until its deployment and workflows have been verified.

The payment simulator can be enabled on staging only by setting `APP_ENV=staging`, `PAYMENT_MODE=mock`, and `STAGING_HOSTNAME=staging.productivity.co.ke` on the staging app, and setting `NEXT_PUBLIC_APP_ENV=staging` and `NEXT_PUBLIC_PAYMENT_MODE=mock` on the browser.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
