"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { slugFromCategory } from "@/shared/common/lib/category"
import { RelatedNews } from "@/shared/common/components/molecules"

type NewsItem = {
  slug: string
  title: string
  description: string
  content: string
  image: string
  category: string
}

type NewsPageContentProps = {
  news: NewsItem
}

export function NewsPageContent({ news }: NewsPageContentProps) {
  const router = useRouter()
  const categorySlug = slugFromCategory(news.category)

  return (
    <article className="pb-8">
      <div className="mb-6 flex flex-col gap-3">
        {/* <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden className="select-none">/</li>
            <li>
              <Link
                href={`/category/${categorySlug}`}
                className="hover:text-foreground transition-colors"
              >
                {news.category}
              </Link>
            </li>
            <li aria-hidden className="select-none">/</li>
            <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {news.slug}
            </li>
          </ol>
        </nav> */}
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Title */}
      <h1 className="mb-6 text-2xl font-bold leading-tight md:text-3xl">
        {news.title}
      </h1>

      {/* Image */}
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Description */}
      <p className="mb-6 text-muted-foreground leading-relaxed">
        {news.description}
      </p>

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {news.content}
      </div>

      {/* Related news */}
      <RelatedNews category={news.category} excludeSlug={news.slug} />
    </article>
  )
}
