# Productivity OSHAPP

Productivity OSHAPP is a Next.js application using Prisma and PostgreSQL.

The website can be found at https://productivity.co.ke.

## Database setup

Set `DATABASE_URL` in the environment to the PostgreSQL connection string supplied by the host. Keep credentials in the host's environment-variable settings or a local, untracked `.env` file; never commit secrets.
Set `AUTH_SECRET` to a randomly generated value of at least 32 characters in every deployed environment.

For local development, create and apply migrations with:

```bash
npm run db:migrate:dev
```

For staging and production deployments, apply committed migrations with:

```bash
npm run db:migrate:deploy
```

Before a production migration, take and verify a database backup. Deployments must apply migrations before starting the new application version. Do not run `db:push` or `db:reset` against staging or production.

Production builds use Webpack because the hosting server does not provide the native bindings required by Turbopack.

The roles-and-branches migration preserves existing records, maps legacy `user` accounts to `workplace_admin`, creates a `Main branch` for each existing client workplace, and promotes the account named `productivityAdmin` (or the oldest remaining `admin`) to `super_admin`. Review that promotion against the production account list before applying the migration, then verify that a Super Admin can sign in afterward.

Available roles are `super_admin`, `admin`, `technical`, `trainee`, `client_super_admin`, and `workplace_admin`. Use the administrator's User Accounts screen to create accounts; use Clients & branches and Staff assignments to scope access. Technical and Trainee staff can prepare audit drafts, but an authorised client account must review, type their name, confirm the declaration, and upload the scanned signature to submit. Audit evidence files are stored in PostgreSQL and are included in database backups.

The OSHA questionnaire covers Basic details, Safety and health policies, and Safety, health and welfare conditions. Required prompts and evidence follow the reference questionnaire; retained supplemental and legacy fields are optional and do not block sign-off or approval. Answers remain in the submission JSON; the additive `20261117000000_audit_evidence_field_key` migration associates uploaded documents with their individual audit prompts while preserving existing section-level evidence.

The initial migration creates the schema in an empty PostgreSQL database. It does not copy data from the old SQLite development database.

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
