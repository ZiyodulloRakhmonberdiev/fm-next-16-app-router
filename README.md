This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Public-page caching

Public locale pages use on-demand ISR: pages are generated on first request, with a 300-second revalidation interval. News listings that depend on the public list cache revalidate every 60 seconds. News writes invalidate the `news` tag and locale layouts; team writes invalidate the team cache and team pages. Authentication, dashboard, user and saved-news routes remain dynamic.

Article sidebars send at most 10 localized card records to the browser. Metadata and article rendering share one request-scoped article query. Public server listings read the database through a tagged cache instead of requesting this deployment's own API.

Verification commands:

```bash
node --test tests/public-rendering.test.cjs
npm run build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3107
# In a second terminal; read-only HTTP checks, restricted to localhost:
node scripts/check-isr.mjs
```

The HTTP checks need configured database access and a published article. They cover public ISR, locale documents, anonymous access protection and 404 responses; they do not exercise signed-in browser interactions.

## Development server

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
