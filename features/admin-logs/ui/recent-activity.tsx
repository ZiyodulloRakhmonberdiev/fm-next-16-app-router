import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Activity, Plus, Edit2, Trash2, User, Newspaper, FolderTree, Settings } from 'lucide-react'
import type { IAdminLog } from '../model/admin-log.model'

function timeAgo(dateParam: Date | string) {
  const date = typeof dateParam === 'string' ? new Date(dateParam) : dateParam
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " yil avval";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " oy avval";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " kun avval";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " soat avval";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " daqiqa avval";
  return Math.floor(Math.max(seconds, 0)) + " soniya avval";
}

export async function RecentActivityAsync({ opts }: { opts: RequestInit }) {
  const res = await fetch(await getServerApiUrl('/api/dashboard/logs?limit=15'), opts)
  if (!res.ok) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-sm text-destructive">
          Faoliyat tarixini yuklab bo'lmadi.
        </CardContent>
      </Card>
    )
  }

  const { data: logs } = (await res.json()) as { data: IAdminLog[] }

  return (
    <Card className="h-full border border-border/60 bg-linear-to-b from-background to-muted/20">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="size-4 text-primary" />
          Oxirgi faoliyat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative p-6 px-4 sm:px-6">
          {/* Vertical line timeline */}
          <div className="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-px bg-border/60"></div>
          
          <div className="space-y-6">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-8">Hozircha faoliyat tarixi yo'q.</p>
            ) : (
              logs.map((log) => {
                const cfg = getLogConfig(log.action)
                return (
                  <div key={log._id} className="relative flex items-start gap-4 z-10">
                    <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 border bg-background mt-0.5 ${cfg.colorClass}`}>
                      <cfg.icon className="size-3.5 sm:size-4" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm leading-tight text-foreground">
                        <span className="font-semibold">{log.userName}</span>{' '}
                        {cfg.label}{' '}
                        {log.targetName && (
                          <span className="font-medium text-foreground">"{log.targetName}"</span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1">
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getLogConfig(action: string) {
  switch (action) {
    case 'CREATE_NEWS':
      return { icon: Plus, label: "yangi maqola qo'shdi", colorClass: 'text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' }
    case 'UPDATE_NEWS':
      return { icon: Edit2, label: "maqolani tahrirladi", colorClass: 'text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' }
    case 'DELETE_NEWS':
      return { icon: Trash2, label: "maqolani o'chirdi", colorClass: 'text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' }
    
    case 'CREATE_CATEGORY':
      return { icon: FolderTree, label: "kategoriya yaratdi", colorClass: 'text-purple-500 border-purple-500/20' }
    case 'UPDATE_CATEGORY':
      return { icon: Edit2, label: "kategoriyani yangiladi", colorClass: 'text-purple-500 border-purple-500/20' }
    case 'DELETE_CATEGORY':
      return { icon: Trash2, label: "kategoriyani o'chirdi", colorClass: 'text-rose-500 border-rose-500/20' }

    case 'CREATE_USER':
      return { icon: User, label: "yangi foydalanuvchi qo'shdi", colorClass: 'text-teal-500 border-teal-500/20' }
    case 'UPDATE_USER':
      return { icon: Edit2, label: "foydalanuvchi ma'lumotlarini tahrirladi", colorClass: 'text-teal-500 border-teal-500/20' }
    case 'DELETE_USER':
      return { icon: Trash2, label: "foydalanuvchini o'chirdi", colorClass: 'text-rose-500 border-rose-500/20' }
    
    default:
      return { icon: Settings, label: "tizimda o'zgarish qildi", colorClass: 'text-muted-foreground border-border' }
  }
}
