import { gunzipSync } from 'node:zlib'
import type { Buffer } from 'node:buffer'
import { dbConnect } from '@/shared/common/lib/db'
import { AdModel } from '@/features/ads/model/ads.model'
import { AdFeedbackModel } from '@/features/ads/model/ad-feedback.model'
import { CategoryModel } from '@/features/category/model/category.model'
import { SiteSettingsModel } from '@/features/dashboard/configs/site-settings.model'
import { SITE_SETTINGS_DOCUMENT_ID } from '@/features/dashboard/configs/site-settings.model'
import { NewsCommentModel } from '@/features/news/model/comment.model'
import { NewsReactionModel } from '@/features/news/model/reaction.model'
import { NewsModel } from '@/features/news/model/news.model'
import { SavedNewsModel } from '@/features/news/model/saved-news.model'
import { TagModel } from '@/features/tags/model/tag.model'
import { TeamMemberModel } from '@/features/team/model/team.model'
import { UserModel } from '@/features/users/model/user.model'

export type DatabaseRestoreResult = {
  ok: true
  inserted: Record<string, number>
} | {
  ok: false
  error: string
}

type BackupArchive = {
  version?: number
  exportedAt?: string
  collections?: {
    news?: unknown[]
    users?: unknown[]
    categories?: unknown[]
    tags?: unknown[]
    siteSettings?: unknown[]
    ads?: unknown[]
    adFeedback?: unknown[]
    newsComments?: unknown[]
    newsReactions?: unknown[]
    savedNews?: unknown[]
    teamMembers?: unknown[]
  }
}

function isGzip(buffer: Buffer): boolean {
  // gzip magic: 1f 8b
  return buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b
}

function parseJsonFromArchiveBuffer(buffer: Buffer): BackupArchive {
  const text = buffer.toString('utf-8')
  const parsed = JSON.parse(text) as BackupArchive
  return parsed
}

export async function restoreDatabaseFromArchiveBuffer(
  input: { buffer: Buffer; filename: string }
): Promise<DatabaseRestoreResult> {
  try {
    await dbConnect()

    const uncompressed = isGzip(input.buffer) ? gunzipSync(input.buffer) : input.buffer
    const archive = parseJsonFromArchiveBuffer(uncompressed)
    const collections = archive.collections ?? {}

    // Full restore: avval kolleksiyalarni tozalaymiz.
    await Promise.all([
      NewsModel.deleteMany({}),
      UserModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      TagModel.deleteMany({}),
      AdModel.deleteMany({}),
      AdFeedbackModel.deleteMany({}),
      NewsCommentModel.deleteMany({}),
      NewsReactionModel.deleteMany({}),
      SavedNewsModel.deleteMany({}),
      TeamMemberModel.deleteMany({}),
      SiteSettingsModel.deleteMany({ _id: SITE_SETTINGS_DOCUMENT_ID }),
    ])

    const inserted: Record<string, number> = {}

    const collectionsNews = Array.isArray(collections.news) ? collections.news : []
    const collectionsUsers = Array.isArray(collections.users) ? collections.users : []
    const collectionsCategories = Array.isArray(collections.categories) ? collections.categories : []
    const collectionsTags = Array.isArray(collections.tags) ? collections.tags : []
    const collectionsSiteSettings = Array.isArray(collections.siteSettings) ? collections.siteSettings : []
    const collectionsAds = Array.isArray(collections.ads) ? collections.ads : []
    const collectionsAdFeedback = Array.isArray(collections.adFeedback) ? collections.adFeedback : []
    const collectionsNewsComments = Array.isArray(collections.newsComments) ? collections.newsComments : []
    const collectionsNewsReactions = Array.isArray(collections.newsReactions) ? collections.newsReactions : []
    const collectionsSavedNews = Array.isArray(collections.savedNews) ? collections.savedNews : []
    const collectionsTeamMembers = Array.isArray(collections.teamMembers) ? collections.teamMembers : []

    if (collectionsNews.length) {
      await NewsModel.insertMany(collectionsNews, { ordered: false })
      inserted.news = collectionsNews.length
    }
    if (collectionsUsers.length) {
      await UserModel.insertMany(collectionsUsers, { ordered: false })
      inserted.users = collectionsUsers.length
    }
    if (collectionsCategories.length) {
      await CategoryModel.insertMany(collectionsCategories, { ordered: false })
      inserted.categories = collectionsCategories.length
    }
    if (collectionsTags.length) {
      await TagModel.insertMany(collectionsTags, { ordered: false })
      inserted.tags = collectionsTags.length
    }
    if (collectionsSiteSettings.length) {
      await SiteSettingsModel.insertMany(collectionsSiteSettings as any[], { ordered: false })
      inserted.siteSettings = collectionsSiteSettings.length
    }
    if (collectionsAds.length) {
      await AdModel.insertMany(collectionsAds, { ordered: false })
      inserted.ads = collectionsAds.length
    }
    if (collectionsAdFeedback.length) {
      await AdFeedbackModel.insertMany(collectionsAdFeedback, { ordered: false })
      inserted.adFeedback = collectionsAdFeedback.length
    }
    if (collectionsNewsComments.length) {
      await NewsCommentModel.insertMany(collectionsNewsComments, { ordered: false })
      inserted.newsComments = collectionsNewsComments.length
    }
    if (collectionsNewsReactions.length) {
      await NewsReactionModel.insertMany(collectionsNewsReactions, { ordered: false })
      inserted.newsReactions = collectionsNewsReactions.length
    }
    if (collectionsSavedNews.length) {
      await SavedNewsModel.insertMany(collectionsSavedNews, { ordered: false })
      inserted.savedNews = collectionsSavedNews.length
    }
    if (collectionsTeamMembers.length) {
      await TeamMemberModel.insertMany(collectionsTeamMembers, { ordered: false })
      inserted.teamMembers = collectionsTeamMembers.length
    }

    return { ok: true, inserted }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Restore xatosi: ${msg}` }
  }
}

