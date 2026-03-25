'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Label } from '@/shared/common/components/ui/label'
import { X } from 'lucide-react'

type ImageFormProps = {
  imageUrlInput: string
  imageUrls: string[]
  imageFiles: File[]
  imageFilePreviewUrls: string[]
  onImageUrlInputChange: (value: string) => void
  onAddImageUrl: () => void
  onAddImageFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImageUrl: (index: number) => void
  onRemoveImageFile: (index: number) => void
}

export function ImageForm({
  imageUrlInput,
  imageUrls,
  imageFiles,
  imageFilePreviewUrls,
  onImageUrlInputChange,
  onAddImageUrl,
  onAddImageFiles,
  onRemoveImageUrl,
  onRemoveImageFile,
}: ImageFormProps) {
  return (
    <Card className='pt-0 md:pt-4 border-none md:border-border shadow-none'>
      <CardHeader className='px-0'>
        <CardTitle>Rasmlar</CardTitle>
        <CardDescription>
          URL kiritish yoki shaxsiy PC dan rasm yuklash. Bir nechta rasm qo&apos;shish mumkin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="flex flex-wrap gap-2">
          <Input
            value={imageUrlInput}
            onChange={(e) => onImageUrlInputChange(e.target.value)}
            placeholder="Rasm URL"
            className="max-w-xs"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddImageUrl())}
          />
          <Button type="button" variant="outline" size="sm" onClick={onAddImageUrl}>
            URL qo&apos;shish
          </Button>
          <div className="space-y-2">
            <Label htmlFor="news-images-from-pc" className="sr-only">
              Rasm yuklash
            </Label>
            <input
              id="news-images-from-pc"
              type="file"
              accept="image/*"
              multiple
              className="block w-full min-w-0 text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              onChange={onAddImageFiles}
            />
          </div>
        </div>
        {(imageUrls.length > 0 || imageFiles.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageUrls.map((url, i) => (
              <div key={`url-${i}`} className="min-w-0 space-y-1">
                <div className="relative group rounded-lg border overflow-hidden bg-muted aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveImageUrl(i)}
                    className="absolute top-1 right-1 size-8 rounded-full bg-destructive/90 text-white flex items-center justify-center transition-opacity"
                    aria-label="O&apos;chirish"
                    title="O&apos;chirish"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground break-all">{url}</div>
              </div>
            ))}
            {imageFiles.map((file, i) => (
              <div key={`file-${i}`} className="min-w-0 space-y-1">
                <div className="relative group rounded-lg border overflow-hidden bg-muted aspect-square">
                  {imageFilePreviewUrls[i] ? (
                    <img
                      src={imageFilePreviewUrls[i]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-2">
                      {file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveImageFile(i)}
                    className="absolute top-1 right-1 size-8 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="O&apos;chirish"
                    title="O&apos;chirish"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="text-[11px] text-muted-foreground break-all">{file.name}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}