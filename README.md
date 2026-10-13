This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Public page caching

Detailed change record (Uzbek): [Vercel resurslarini tejash — 2026-10-13](docs/vercel-resource-optimization-2026-10-13.md).

- Home and `/articles`: one-hour fallback revalidation. News writes invalidate these pages on the next visit.
- `/[locale]/news/[slug]`: one-day fallback. Create/edit/unpublish/delete handlers invalidate the affected slug in all four languages; renames invalidate both slugs.
- Other public pages retain their previous route freshness. Their leaf exports are explicit because a short locale-layout TTL would also cap the article and home TTLs.
- `revalidate-public-cache.ts` invalidates news listings and affected articles, not entire locale layouts. Any future news import/write path must call `revalidateNewsPublicCache` after a successful write.
- An article's initial latest-news sidebar is a snapshot, independent of the shared news cache. On desktop, `/api/news/sidebar/{locale}` refreshes those cards without regenerating the article. It returns eleven public cards so the current article can be excluded. The endpoint is invalidated on news writes; the browser query stays fresh for five minutes and does not poll. If loading fails, the snapshot remains visible.
- Home sections receive only their selected, localized card fields. Do not seed the shared multilingual query cache with these partial lists. The full search feed loads when the search dialog opens.

Validation (no production writes):

```bash
node --test tests/public-rendering.test.cjs
npm run build
npm start -- -p 3107
# In another terminal, against the local production server:
node scripts/check-isr.mjs http://127.0.0.1:3107
```

Metadata and article rendering still share one request-scoped query. The smoke check reads the configured database and does not exercise signed-in browser interactions. Use a staging database for manual create/edit/unpublish/delete checks. After deploying, compare equal traffic/time windows for CPU and ISR write units; accumulated monthly usage does not reset after a fix.

## Running locally

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
