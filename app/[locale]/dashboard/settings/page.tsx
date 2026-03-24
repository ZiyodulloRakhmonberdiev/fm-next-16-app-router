import dynamic from 'next/dynamic'

function SettingsRouteLoading() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 pb-4 md:max-w-xl" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-md bg-muted/80" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-muted/60" />
      <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
    </div>
  )
}

const DashboardUserSettingsPage = dynamic(
  () =>
    import('../_components/user-settings-page').then((mod) => ({
      default: mod.DashboardUserSettingsPage,
    })),
  { loading: () => <SettingsRouteLoading /> }
)

export default function DashboardSettingsRoute() {
  return <DashboardUserSettingsPage />
}
