import { Card, CardContent, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Button } from '@/shared/common/components/ui/button'
import {Link} from '@/i18n/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yangilikni tahrirlash</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Slug: <code className="rounded bg-muted px-1">{slug}</code>. Tahrirlash formasi keyingi qadamda qo‘shiladi.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/news">Orqaga</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
