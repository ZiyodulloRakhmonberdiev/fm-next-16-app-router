'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/common/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import type { DashboardCategorySlice, DashboardMonthlyPoint } from '@/features/dashboard/lib/chart-data'

const lineConfig = {
  views: {
    label: "Ko'rishlar",
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const barConfig = {
  published: {
    label: 'Chop etilgan',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

type DashboardChartsProps = {
  monthly: DashboardMonthlyPoint[]
  categoryPie: DashboardCategorySlice[]
}

export function DashboardCharts({ monthly, categoryPie }: DashboardChartsProps) {
  const pieConfig: ChartConfig = Object.fromEntries(
    categoryPie.map((s) => [s.key, { label: s.name, color: s.fill }])
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Oylik ko‘rishlar</CardTitle>
          <CardDescription>
            Oxirgi 12 oy — chop etilgan yangiliklarning joriy ko‘rishlari (oy bo‘yicha yig‘indi)
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0 sm:pl-2">
          <ChartContainer
            config={lineConfig}
            className="aspect-auto h-[min(22rem,50vh)] w-full min-h-[240px]"
          >
            <LineChart data={monthly} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oylar bo‘yicha chop etish</CardTitle>
            <CardDescription>Oxirgi 12 oyda nashr qilingan yangiliklar soni</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer
              config={barConfig}
              className="aspect-auto h-[min(20rem,45vh)] w-full min-h-[220px]"
            >
              <BarChart data={monthly} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="published" fill="var(--color-published)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategoriyalar ulushi</CardTitle>
            <CardDescription>Nashr etilgan yangiliklar bo‘yicha</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pl-0 sm:pl-2">
            {categoryPie.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Ma’lumot yo‘q.</p>
            ) : (
              <ChartContainer
                config={pieConfig}
                className="aspect-square w-full max-w-md mx-auto h-[min(20rem,45vh)] min-h-[220px]"
              >
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={categoryPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="transparent"
                  >
                    {categoryPie.map((slice) => (
                      <Cell key={slice.key} fill={slice.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
