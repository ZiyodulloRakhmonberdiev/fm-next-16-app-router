"use client"

import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"

type ImageSectionProps = {
  hasVideo: boolean
  displayImages: string[]
  title: string
  imageCaption?: string
  imagesLabel: string
}

const getSafeImageSrc = (raw?: string) => {
  if (!raw?.trim()) return ""
  const candidate =
    raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
      ? raw
      : `/uploads/images/${raw}`
  try {
    new URL(candidate, "http://localhost")
    return candidate
  } catch {
    return ""
  }
}

export function ImageSection({
  hasVideo,
  displayImages,
  title,
  imageCaption,
  imagesLabel,
}: ImageSectionProps) {
  const hasManyImages = displayImages.length > 1

  return (
    <>
      {!hasVideo && displayImages.length === 1 && (
        <div className="relative mb-6 w-full">
          {getSafeImageSrc(displayImages[0]) ? (
            <img
              src={getSafeImageSrc(displayImages[0])}
              alt={title}
              className="block w-full h-auto rounded-lg"
            />
          ) : (
            <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-muted px-2 text-sm text-muted-foreground text-center">
              Rasmni yuklab bo&apos;lmadi
            </div>
          )}
          {imageCaption ? (
            <p className="px-2 py-1 text-xs mt-1">
              {imageCaption}
            </p>
          ) : null}
        </div>
      )}

      {!hasVideo && hasManyImages && (
        <div className="relative mb-6 w-full">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="ml-0">
              {displayImages.map((src, i) => (
                <CarouselItem key={`${src}-${i}`} className="pl-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    {getSafeImageSrc(src) ? (
                      <Image
                        src={getSafeImageSrc(src)}
                        alt={`${title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                        Rasmni yuklab bo&apos;lmadi
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute right-2 top-2 z-10 flex translate-y-0 gap-2">
              <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
              <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
            </div>
          </Carousel>
          {imageCaption ? (
            <p className="px-2 py-1 text-xs">
              {imageCaption}
            </p>
          ) : null}
        </div>
      )}

      {hasVideo && displayImages.length > 0 && (
        <div className="mb-6 w-full">
          <p className="mb-3 text-sm font-medium text-muted-foreground">{imagesLabel}</p>
          {displayImages.length === 1 ? (
            getSafeImageSrc(displayImages[0]) ? (
              <img
                src={getSafeImageSrc(displayImages[0])}
                alt={`${title} — 1`}
                className="block w-full h-auto rounded-lg"
              />
            ) : (
              <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-muted px-2 text-sm text-muted-foreground text-center">
                Rasmni yuklab bo&apos;lmadi
              </div>
            )
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="ml-0">
                {displayImages.map((src, i) => (
                  <CarouselItem key={`${src}-${i}`} className="pl-0">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {getSafeImageSrc(src) ? (
                        <Image
                          src={getSafeImageSrc(src)}
                          alt={`${title} — ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                          Rasmni yuklab bo&apos;lmadi
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute right-2 top-2 z-10 flex translate-y-0 gap-2">
                <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
                <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
              </div>
            </Carousel>
          )}
        </div>
      )}
    </>
  )
}
