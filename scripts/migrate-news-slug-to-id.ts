/**
 * One-off migration: set newsId from newsSlug for NewsComment, NewsReaction, SavedNews.
 * Run after deploying the newsId schema change. Existing DB documents may still have newsSlug.
 *
 * Usage: npx tsx scripts/migrate-news-slug-to-id.ts
 */

import { dbConnect } from "../shared/common/lib/db"
import { NewsCommentModel } from "../features/news/model/comment.model"
import { NewsReactionModel } from "../features/news/model/reaction.model"
import { SavedNewsModel } from "../features/news/model/saved-news.model"
import { NewsModel } from "../features/news/model/news.model"

async function migrate() {
  await dbConnect()

  type WithSlug = { _id: string; newsSlug?: string; newsId?: string }

  for (const [name, Model] of [
    ["NewsComment", NewsCommentModel],
    ["NewsReaction", NewsReactionModel],
    ["SavedNews", SavedNewsModel],
  ] as const) {
    const docs = (await Model.find({}).lean()) as WithSlug[]
    let updated = 0
    for (const d of docs) {
      const slug = d.newsSlug
      if (slug && !d.newsId) {
        const news = await NewsModel.findOne({ slug }).select("_id").lean()
        if (news) {
          await Model.updateOne(
            { _id: d._id },
            { $set: { newsId: String(news._id) }, $unset: { newsSlug: "" } }
          )
          updated++
        }
      }
    }
    console.log(`${name}: ${updated} documents updated`)
  }

  process.exit(0)
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
