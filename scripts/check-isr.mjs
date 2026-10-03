import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

// Read-only smoke checks against `next start`, never against the live deployment.
const origin = process.argv[2] ?? 'http://127.0.0.1:3107'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname), 'Use a local production server')
const headers = { accept: 'text/html', referer: `${origin}/uz` }
async function page(path, locale) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const response = await fetch(`${origin}${path}`, { headers, redirect: 'manual' })
    const html = await response.text()
    assert.equal(response.status, 200, `${path}: HTTP status`)
    assert.ok(html.includes(`<html lang="${locale}"`), `${path}: document language`)
    assert.equal((html.match(/<html\b/g) ?? []).length, 1, `${path}: one document root`)
    assert.equal((html.match(/<body\b/g) ?? []).length, 1, `${path}: one body`)
    assert.ok(!html.includes('NEXT_HTTP_ERROR_FALLBACK;500'), `${path}: no streamed server error`)
    const cache = response.headers.get('cache-control') ?? ''
    assert.match(cache, /s-maxage=[1-9]\d*/, `${path}: shared ISR cache`)
    assert.doesNotMatch(cache, /private|no-store/, `${path}: public page`)
    if (attempt >= 1 && response.headers.get('x-nextjs-cache') === 'HIT') {
      console.log(`PASS ${path}: HIT, ${Buffer.byteLength(html)} bytes, ${cache}`)
      return
    }
    // An expired ISR entry is served while its replacement renders in the background.
    await setTimeout(500)
  }
  assert.fail(`${path}: ISR did not reach HIT within the polling window`)
}

for (const locale of ['uz', 'uzb', 'ru', 'en']) await page(`/${locale}`, locale)
for (const suffix of ['news', 'news/latest', 'news/trending', 'news/video', 'news/audio', 'news/breaking', 'news/authors-choice', 'about', 'contact', 'privacy', 'terms', 'team', 'menu', 'articles', 'announcements', 'partners']) {
  await page(`/uz/${suffix}`, 'uz')
}

for (const suffix of ['auth/login', 'auth/register', 'news/saved']) {
  const response = await fetch(`${origin}/uz/${suffix}`, { headers })
  const html = await response.text()
  assert.equal(response.status, 200, `${suffix}: HTTP status`)
  assert.ok(html.includes('<html lang="uz"'), `${suffix}: document language`)
  assert.match(response.headers.get('cache-control') ?? '', /private|no-store/, `${suffix}: not shared in ISR`)
  console.log(`PASS /uz/${suffix}: dynamic, HTTP 200`)
}

const feedResponse = await fetch(`${origin}/api/news?status=published&limit=1`, { headers })
assert.equal(feedResponse.status, 200)
const { data } = await feedResponse.json()
assert.ok(data?.length, 'Need a published article to exercise dynamic slug ISR')
for (const locale of ['uz', 'uzb', 'ru', 'en']) await page(`/${locale}/news/${encodeURIComponent(data[0].slug)}`, locale)
await page(`/uz/category/${encodeURIComponent(data[0].categorySlug)}`, 'uz')
if (data[0].authorId) await page(`/uz/author/${encodeURIComponent(data[0].authorId)}`, 'uz')
const themeResponse = await fetch(`${origin}/api/themes`, { headers })
assert.equal(themeResponse.status, 200)
const themes = await themeResponse.json()
if (themes[0]?.slug) await page(`/uz/theme/${encodeURIComponent(themes[0].slug)}`, 'uz')

const rootResponse = await fetch(origin, { headers, redirect: 'manual' })
assert.ok([307, 308].includes(rootResponse.status), 'Root redirects to the locale')
assert.equal(new URL(rootResponse.headers.get('location'), origin).pathname, '/uz')
console.log('PASS /: redirects to /uz')

for (const path of ['/uz/user', '/ru/user', '/uz/dashboard']) {
  const response = await fetch(`${origin}${path}`, { headers, redirect: 'manual' })
  const body = await response.text()
  const location = response.headers.get('location') ?? ''
  assert.ok([307, 308].includes(response.status) || body.includes('NEXT_REDIRECT'), `${path}: login protection`)
  if (location) assert.ok(location.includes('/auth/login'), `${path}: login destination`)
  assert.notEqual(response.headers.get('x-nextjs-cache'), 'HIT', `${path}: no shared private response`)
  assert.doesNotMatch(response.headers.get('cache-control') ?? '', /s-maxage=[1-9]/, `${path}: no public cache`)
  console.log(`PASS ${path}: protected, not shared in ISR`)
}

for (const path of ['/uz/news/isr-check-missing-article', '/zz/about', '/uz/isr-check-missing-page']) {
  const response = await fetch(`${origin}${path}`, { headers, redirect: 'follow' })
  const html = await response.text()
  assert.ok(response.status === 404 || html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `${path}: not-found behavior`)
  assert.equal((html.match(/<html\b/g) ?? []).length, 1, `${path}: valid 404 document`)
  console.log(`PASS ${path}: 404`)
}
