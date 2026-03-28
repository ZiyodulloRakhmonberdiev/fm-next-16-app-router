'use client'

import { useState } from 'react'
import type { NewsStatus } from '@/features/news/model'
import { toast } from 'sonner'
import { SettingsForm } from './settings-section'

type EditNewsStatusFormProps = {
  initialStatus?: NewsStatus
}

export function EditNewsStatusForm({ initialStatus = 'pending' }: EditNewsStatusFormProps) {
  const [isTop, setIsTop] = useState(false)
  const [isTrending, setIsTrending] = useState(false)
  const [authorsChoice, setAuthorsChoice] = useState(false)
  const [isPopular, setIsPopular] = useState(false)
  const [isBreaking, setIsBreaking] = useState(false)
  const [pushedToTelegram, setPushedToTelegram] = useState(false)
  const [status, setStatus] = useState<NewsStatus>(initialStatus)

  const canPublish = true

  const handleSavePending = () => {
    setStatus('pending')
    toast.success("Status 'pending' holatida saqlandi")
  }

  const handlePublish = () => {
    setStatus('published')
    toast.success('Yangilik nashr qilingan (published) holatiga o‘tkazildi')
  }

  const handleStatusChange = (newStatus: NewsStatus) => {
    setStatus(newStatus)
    if (newStatus === 'published') toast.success('Yangilik nashr qilingan (published)')
    else if (newStatus === 'cancelled') toast.success('Yangilik bekor qilindi')
    else if (newStatus === 'deleted') toast.success("Yangilik Savatga o‘tkazildi")
    else if (newStatus === 'archived') toast.success('Yangilik arxivlandi')
  }

  return (
    <SettingsForm
      isTop={isTop}
      authorsChoice={authorsChoice}
      isBreaking={isBreaking}
      isTrending={isTrending}
      onChangeIsTrending={setIsTrending}
      isPopular={isPopular}
      pushedToTelegram={pushedToTelegram}
      onChangePushedToTelegram={setPushedToTelegram}
      canPublish={canPublish}
      onBack={() => {}}
      onChangeIsTop={setIsTop}
      onChangeAuthorsChoice={setAuthorsChoice}
      onChangeIsBreaking={setIsBreaking}
      onChangeIsPopular={setIsPopular}
      onSavePending={handleSavePending}
      onPublish={handlePublish}
      mode="edit"
      currentStatus={status}
      onStatusChange={handleStatusChange}
    />
  )
}

