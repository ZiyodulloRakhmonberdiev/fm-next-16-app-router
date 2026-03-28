import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { NewsModel } from '@/features/news/model/news.model'
import { NewsCommentModel } from '@/features/news/model/comment.model'
import { NewsReactionModel } from '@/features/news/model/reaction.model'
import { CategoryModel } from '@/features/category/model/category.model'
import { TagModel } from '@/features/tags/model/tag.model'
import { AdModel } from '@/features/ads/model/ads.model'
import { AdFeedbackModel } from '@/features/ads/model/ad-feedback.model'
import { UserModel } from '@/features/users/model/user.model'
import { ContactMessageModel } from '@/features/contact/model/contact-message.model'

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range')
    let filterDate: Date | undefined
    if (range === '7d') {
      filterDate = new Date()
      filterDate.setDate(filterDate.getDate() - 7)
    } else if (range === '30d') {
      filterDate = new Date()
      filterDate.setDate(filterDate.getDate() - 30)
    } else if (range === '1y') {
      filterDate = new Date()
      filterDate.setFullYear(filterDate.getFullYear() - 1)
    }
    
    // Asosiy vaqt filtri
    const dateFilter = filterDate ? { createdAt: { $gte: filterDate } } : {}
    // Yangiliklar uchun filter (tarixga mos)
    const newsDateFilter = filterDate ? { publishedAt: { $gte: filterDate } } : {}

    await dbConnect()

    // Faqat kerakli chart ma'lumotlarini olish (xotira tejamkorligi uchun limit qo'yishimiz mumkin yoki barchasini select qilish)
    // 500 limit eskisidek saqlab qolinsa bo'ladi, lekin faqat kerakli maydonlar
    const chartNews = await NewsModel.find(newsDateFilter)
      .select('publishedAt views status categorySlug')
      .sort({ publishedAt: -1 })
      .limit(500)
      .lean()

    const [
      totalCount,
      publishedCount,
      totalViewsAgg,
      categoriesCount,
      tagsCount,
      commentsCount,
      pendingCommentsCount,
      reactionsCount,
      adsCount,
      adsFeedbackCount,
      usersCount,
      contactTotal,
      contactNew,
      categories,
    ] = await Promise.all([
      filterDate ? NewsModel.countDocuments(newsDateFilter) : NewsModel.estimatedDocumentCount(),
      NewsModel.countDocuments({ ...newsDateFilter, status: { $in: ['published', null] } }), // Aksariyat holatlarda null ham published sifatida process qilingan
      NewsModel.aggregate<{ _id: null, total: number }>([
        ...(filterDate ? [{ $match: newsDateFilter }] : []),
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      filterDate ? CategoryModel.countDocuments(dateFilter) : CategoryModel.estimatedDocumentCount(),
      filterDate ? TagModel.countDocuments(dateFilter) : TagModel.estimatedDocumentCount(),
      filterDate ? NewsCommentModel.countDocuments(dateFilter) : NewsCommentModel.estimatedDocumentCount(),
      NewsCommentModel.countDocuments({ ...dateFilter, status: 'pending' }),
      filterDate ? NewsReactionModel.countDocuments(dateFilter) : NewsReactionModel.estimatedDocumentCount(),
      filterDate ? AdModel.countDocuments(dateFilter) : AdModel.estimatedDocumentCount(),
      filterDate ? AdFeedbackModel.countDocuments(dateFilter) : AdFeedbackModel.estimatedDocumentCount(),
      filterDate ? UserModel.countDocuments(dateFilter) : UserModel.estimatedDocumentCount(),
      filterDate ? ContactMessageModel.countDocuments(dateFilter) : ContactMessageModel.estimatedDocumentCount(),
      ContactMessageModel.countDocuments({ ...dateFilter, status: 'new' }),
      CategoryModel.find({}).select('slug name').lean(),
    ])

    const totalViews = totalViewsAgg[0]?.total ?? 0

    return Response.json({
      stats: {
        totalCount,
        publishedCount,
        totalViews,
        categoriesCount,
        tagsCount,
        commentsCount,
        pendingCommentsCount,
        reactionsCount,
        adsCount,
        adsFeedbackCount,
        usersCount,
        contactTotal,
        contactNew,
      },
      chartNews,
      categories,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/dashboard/stats GET]', message)
    return Response.json(
      { error: "Dashboard ma'lumotlarini hisoblashda xatolik yuz berdi", details: message },
      { status: 500 }
    )
  }
}
