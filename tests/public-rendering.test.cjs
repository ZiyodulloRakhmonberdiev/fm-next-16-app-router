const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
// Run the real TypeScript functions with only framework/DB boundaries replaced.
function loader(stubs = {}) {
  const modules = new Map()
  function load(filename) {
    const absolute = path.resolve(root, filename)
    if (modules.has(absolute)) return modules.get(absolute).exports
    const module = { exports: {} }
    modules.set(absolute, module)
    const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText
    const localRequire = (id) => {
      if (Object.hasOwn(stubs, id)) return stubs[id]
      if (id.startsWith('@/') || id.startsWith('.')) {
        const resolved = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(absolute), id)
        return load(resolved + '.ts')
      }
      return require(id)
    }
    new Function('require', 'module', 'exports', source)(localRequire, module, module.exports)
    return module.exports
  }
  return load
}

const localeStubs = {
  '@/shared/common/lib/seed-helpers': { getCategoryName: (slug) => slug, getTagNames: (slugs) => slugs ?? [] },
}
const { selectSidebarNews } = loader(localeStubs)('features/news/lib/sidebar-news.ts')
const { publicCardPayload } = loader(localeStubs)('features/news/lib/public-card-payload.ts')
const { selectHomeNews } = loader(localeStubs)('features/news/lib/home-news-selection.ts')
const { getNewsListForLocale } = loader(localeStubs)('features/news/model/types.ts')
function news(index, overrides = {}) {
  return {
    slug: `story-${index}`, title: { uz: `Yangilik ${index}`, ru: `Новость ${index}` },
    images: [`https://media.example/${index}.jpg`, 'extra.jpg'], hasImage: true,
    description: { uz: 'large description'.repeat(100) }, content: { uz: 'private article payload'.repeat(100) },
    categorySlug: 'world', tagSlugs: [], minutes: 3, views: index, author: 'Author',
    publishedAt: new Date(2026, 0, index + 1), status: 'published', ...overrides,
  }
}

test('sidebar keeps the newest 10 eligible stories, excludes current story, strips large/admin fields', () => {
  const input = Array.from({ length: 25 }, (_, i) => news(i, { createdBy: { userId: 'admin' } }))
  const before = JSON.stringify(input)
  input[24].hasImage = false
  const output = selectSidebarNews(input, 'ru', 'story-23')
  assert.equal(output.length, 10)
  assert.equal(output[0].slug, 'story-22')
  assert.equal(output[0].title, 'Новость 22')
  assert.equal(output[9].slug, 'story-13')
  for (const item of output) {
    assert.equal(item.images.length, 1)
    for (const key of ['content', 'description', 'createdBy', 'telegramPushReason']) assert.equal(key in item, false)
  }
  input[24].hasImage = true
  assert.equal(JSON.stringify(input), before, 'selection must not mutate cached records')
  assert.ok(Buffer.byteLength(JSON.stringify(output)) < 10000)
})

test('sidebar preserves locale fallback and legacy image detection, including an empty feed', () => {
  const input = [news(1, { title: { uz: 'Fallback title', ru: '' }, hasImage: undefined })]
  assert.equal(selectSidebarNews(input, 'ru')[0].title, 'Fallback title')
  assert.deepEqual(selectSidebarNews([], 'uz'), [])
})

function matches(row, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return value.some((part) => matches(row, part))
    if (value && typeof value === 'object') return Object.entries(value).every(([op, expected]) => {
      if (op === '$ne') return row[key] !== expected
      if (op === '$in') return expected.includes(row[key])
      if (op === '$nin') return !expected.includes(row[key])
      if (op === '$exists') return (row[key] !== undefined) === expected
      throw new Error(`Unimplemented fixture operator ${op}`)
    })
    return row[key] === value
  })
}

function listFixture() {
  const rows = Array.from({ length: 24 }, (_, i) => news(i, { authorId: 'author-1' }))
  rows.push(news(100, { status: 'pending' }), news(101, { ad: true }), news(102, { stats: true }))
  rows[2].audioUrl = 'audio.mp3'
  rows[3].hasVideo = true
  rows[4].isBreaking = true
  rows[4].themeId = 'theme-1'
  let dbReads = 0
  let fail = false
  const cache = new Map()
  const invalidatedPaths = []
  const cacheApi = {
    unstable_cache: (fn, key, options) => {
      assert.ok(options.tags.includes('news'), 'news writes must invalidate this cache')
      return async (arg) => {
        const k = JSON.stringify([key, arg])
        if (!cache.has(k)) cache.set(k, { value: await fn(arg), tags: options.tags })
        return cache.get(k).value
      }
    },
    revalidateTag: (tag) => {
      for (const [key, entry] of cache) if (entry.tags.includes(tag)) cache.delete(key)
    },
    revalidatePath: (path) => invalidatedPaths.push(path),
  }
  const load = loader({
    ...localeStubs,
    'next/cache': cacheApi,
    '@/shared/common/lib/db': { dbConnect: async () => { if (fail) throw new Error('Database unavailable') } },
    '@/features/news/model/news.model': { NewsModel: {
      find(filter) {
        dbReads++
        let selected = rows.filter((row) => matches(row, filter))
        const query = {
          select() { return query },
          sort(sort) {
            selected.sort((a, b) => {
              for (const [key, direction] of Object.entries(sort)) {
                if (a[key] !== b[key]) return (a[key] > b[key] ? 1 : -1) * direction
              }
              return 0
            })
            return query
          },
          limit(n) { selected = selected.slice(0, n); return query },
          lean: async () => selected,
        }
        return query
      },
      countDocuments: async (filter) => rows.filter((row) => matches(row, filter)).length,
    } },
    '@/features/users/model/user.model': { UserModel: { find: () => ({ select: () => ({ lean: async () => [{ _id: 'author-1', full_name: { uz: 'Author', ru: 'Автор' } }] }) }) } },
    '@/features/news/model/comment.model': { NewsCommentModel: { aggregate: async () => [{ _id: 'story-23', count: 2 }] } },
    '@/features/news/model/reaction.model': { NewsReactionModel: { aggregate: async () => [{ _id: 'story-23', count: 3 }] } },
  })
  const { revalidateNewsPublicCache } = load('shared/server/revalidate-public-cache.ts')
  return {
    ...load('shared/server/public-news-list.ts'),
    reads: () => dbReads, fail: () => { fail = true },
    invalidate: () => revalidateNewsPublicCache('story-23'),
    updateTitle: () => { rows[23].title.ru = 'Updated title' },
    invalidatedPaths,
  }
}

test('public listing preserves pagination, locale, counts and excludes drafts/ads/stats', async () => {
  const fixture = listFixture()
  const options = { locale: 'ru', pageSize: 10, pageCount: 2 }
  const result = await fixture.getPublicNewsPage(options)
  assert.equal(result.items.length, 20)
  assert.equal(result.page, 2)
  assert.equal(result.totalPages, 3)
  assert.equal(result.items[0].slug, 'story-23')
  assert.equal(result.items[0].author, 'Автор')
  assert.equal(result.items[0].commentCount, 2)
  assert.equal(result.items[0].reactionCount, 3)
  assert.equal(result.items.some((item) => item.slug === 'story-100'), false)
  await fixture.getPublicNewsPage(options)
  assert.equal(fixture.reads(), 1)
  fixture.updateTitle()
  assert.equal((await fixture.getPublicNewsPage(options)).items[0].title, 'Новость 23')
  fixture.invalidate()
  assert.equal((await fixture.getPublicNewsPage(options)).items[0].title, 'Updated title')
  assert.equal(fixture.reads(), 2)
  for (const locale of ['uz', 'uzb', 'ru', 'en']) {
    assert.ok(fixture.invalidatedPaths.includes(`/${locale}`))
    assert.ok(fixture.invalidatedPaths.includes(`/${locale}/news/story-23`))
  }
})

test('audio/video/breaking/category/theme filters and short/empty pages retain their behavior', async () => {
  const fixture = listFixture()
  for (const [filter, slug] of [[{ audio: true }, 'story-2'], [{ video: true }, 'story-3'], [{ breaking: true, themeIds: ['theme-1'] }, 'story-4']]) {
    const result = await fixture.getPublicNewsPage({ locale: 'uz', pageSize: 9, ...filter })
    assert.deepEqual(result.items.map((item) => item.slug), [slug])
    assert.equal(result.page, 1)
    assert.equal(result.totalPages, 1)
  }
  const empty = await fixture.getPublicNewsPage({ locale: 'uz', pageSize: 10, pageCount: 2, categorySlugs: ['missing'] })
  assert.equal(empty.items.length, 0)
  assert.equal(empty.page, 1)
  assert.equal(empty.totalPages, 1)
})

test('DB failure propagates so failed ISR regeneration cannot replace a good page with an empty one', async () => {
  const fixture = listFixture()
  fixture.fail()
  await assert.rejects(fixture.getPublicNewsPage({ locale: 'uz', pageSize: 10 }), /Database unavailable/)
})

test('localized card payload retains visible text, fallback and media without content/admin/other-language data', () => {
  const rows = [news(1, { isTop: true, authorsChoice: true, videoUrl: 'video.mp4', audioUrl: 'audio.mp3',
    pushedToTelegram: true, telegramPushReason: 'internal', createdBy: { userId: 'admin' } }),
    news(2, { title: { uz: 'Fallback', ru: '' } })]
  const before = JSON.stringify(rows)
  for (const locale of ['uz', 'uzb', 'ru', 'en']) {
    const output = publicCardPayload(rows, locale)
    const originalCards = getNewsListForLocale(rows, locale)
    const cards = getNewsListForLocale(output, locale)
    for (let i = 0; i < cards.length; i++) {
      for (const field of ['slug', 'title', 'description', 'categorySlug', 'videoUrl', 'audioUrl', 'isTop', 'hasImage']) {
        assert.deepEqual(cards[i][field], originalCards[i][field], `${locale}: ${field}`)
      }
      assert.deepEqual(Object.keys(output[i].title), ['uz'])
      for (const field of ['content', 'createdBy', 'telegramPushReason', 'pushedToTelegram', 'updatedAt']) {
        assert.equal(field in output[i], false)
      }
    }
    assert.equal(output[0].authorsChoice, true)
    assert.ok(Buffer.byteLength(JSON.stringify(output)) < Buffer.byteLength(before) / 2)
  }
  assert.equal(JSON.stringify(rows), before)
})

test('home sections retain existing ordering, filters, limits and legacy media flags', () => {
  const rows = Array.from({ length: 45 }, (_, i) => news(i, {
    isTop: i % 2 === 0, authorsChoice: i % 3 === 0, isBreaking: i % 4 === 0,
    categorySlug: i % 2 ? 'world' : 'science',
  }))
  const before = JSON.stringify(rows)
  assert.deepEqual(selectHomeNews(rows, 'banner', 'world').map(x => x.slug),
    rows.filter(x => x.categorySlug === 'world').reverse().slice(0, 9).map(x => x.slug))
  assert.equal(selectHomeNews(rows, 'row').length, 28)
  assert.equal(selectHomeNews(rows, 'top').length, 10)
  assert.ok(selectHomeNews(rows, 'top').every(x => x.isTop))
  assert.equal(selectHomeNews(rows, 'authors').length, 6)
  assert.ok(selectHomeNews(rows, 'authors').every(x => x.authorsChoice))
  assert.equal(selectHomeNews(rows, 'breaking').length, 7)
  assert.equal(selectHomeNews(rows, 'slide', 'world').length, 22, 'keep existing carousel cards')
  assert.deepEqual(selectHomeNews(rows, 'banner', 'empty'), [])
  assert.equal(selectHomeNews([news(1, { hasVideo: undefined, videoUrl: 'legacy.mp4' })], 'video').length, 1)
  assert.equal(selectHomeNews([news(1, { hasVideo: false, videoUrl: 'hidden.mp4' })], 'video').length, 0)
  assert.equal(selectHomeNews([news(1, { stats: true, images: [], audioUrl: 'a.mp3' })], 'stats').length, 1)
  assert.equal(selectHomeNews([news(1, { ad: true, images: [], audioUrl: 'a.mp3' })], 'ads').length, 0)
  assert.equal(JSON.stringify(rows), before)
})

test('editing or renaming a story invalidates its old/new pages and listings, never unrelated article layouts', () => {
  const calls = [], tags = []
  const { revalidateNewsPublicCache, revalidateAdsPublicCache } = loader({
    'next/cache': { revalidatePath: (...args) => calls.push(args), revalidateTag: (...args) => tags.push(args) },
  })('shared/server/revalidate-public-cache.ts')
  revalidateNewsPublicCache('old-slug')
  revalidateNewsPublicCache('new-slug')
  for (const locale of ['uz', 'uzb', 'ru', 'en']) {
    for (const suffix of ['', '/articles', '/news/old-slug', '/news/new-slug']) {
      assert.ok(calls.some(([path]) => path === `/${locale}${suffix}`))
    }
    assert.ok(calls.some(([path]) => path === `/api/news/sidebar/${locale}`))
  }
  assert.ok(tags.some(([tag, options]) => tag === 'news' && options.expire === 0))
  assert.equal(calls.some(([, type]) => type === 'layout'), false)
  assert.equal(calls.some(([path]) => path === '/[locale]/news/[slug]'), false)
  calls.length = 0
  revalidateAdsPublicCache()
  assert.equal(calls.some(([path]) => path.includes('/news/')), false)
})

test('shared sidebar serves eleven cards so each article can exclude itself without losing a card', () => {
  const rows = Array.from({ length: 20 }, (_, i) => news(i))
  const payload = selectSidebarNews(rows, 'uz', undefined, 11)
  for (const slug of ['story-19', 'story-15', 'outside-feed']) {
    const result = payload.filter(item => item.slug !== slug).slice(0, 10)
    assert.equal(result.length, 10)
    assert.ok(result.every(item => item.slug !== slug))
  }
})

test('section props and a closed search do not fetch or seed a truncated global news feed', () => {
  const { usePublicNewsQuery } = loader({
    '@tanstack/react-query': { useQuery: (options) => options },
    '@/shared/server/public-site-settings-query': { usePublicSiteSettingsQuery: () => ({ data: undefined }) },
    './public-news-initial': { usePublicNewsInitial: () => undefined },
  })('features/news/model/public-news-query.ts')
  for (const serverItems of [[], publicCardPayload([news(1)], 'ru')]) {
    const options = usePublicNewsQuery(serverItems)
    assert.equal(options.enabled, false)
    assert.equal(options.initialData, undefined)
  }
  assert.equal(usePublicNewsQuery(undefined, false).enabled, false)
  assert.equal(usePublicNewsQuery(undefined, true).enabled, true)
})

test('article fallback sidebar has no shared news-cache dependency and excludes the current story', async () => {
  const rows = Array.from({ length: 15 }, (_, i) => news(i))
  const query = { select: () => query, sort: () => query, limit: () => query, lean: async () => rows }
  const { getArticleSidebarSnapshot } = loader({
    ...localeStubs,
    '@/shared/common/lib/db': { dbConnect: async () => {} },
    '@/features/news/model/news.model': { NewsModel: { find: () => query } },
    'next/cache': { unstable_cache: () => { throw new Error('Must not depend on the global feed cache') } },
  })('shared/server/article-sidebar-snapshot.ts')
  const result = await getArticleSidebarSnapshot('uz', 'story-14')
  assert.equal(result.length, 10)
  assert.equal(result[0].slug, 'story-13')
})
