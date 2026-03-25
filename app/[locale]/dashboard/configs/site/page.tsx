'use client'

import { HeadlineSection } from '@/features/dashboard/configs/ui/headline-section'
import { DescriptionSection } from '@/features/dashboard/configs/ui/description-section'
import { SiteConfigSection } from '@/features/dashboard/configs/ui/site-config-section'
import { SocialMediaSection, type UiSocialItem } from '@/features/dashboard/configs/ui/social-media-section'
import { LOCALES, LOCALE_LABELS } from '@/shared/common/lib/locale-constants'
import { useSiteSettings } from '@/features/dashboard/configs/site-settings-context'
import { ConfigsLoading, ConfigsPageShell } from '../_components/configs-page-shell'

export default function ConfigsSiteSettingsPage() {
  const {
    loading,
    data,
    savingHeadline,
    savingDescription,
    savingConfig,
    savingSocial,
    updateHeadline,
    setHeadlineEnabled,
    handleSaveHeadline,
    updateDescription,
    updateSiteConfig,
    updateAddress,
    handleSaveDescription,
    handleSaveConfig,
    addSocialItem,
    updateSocialHref,
    removeSocialItem,
    handleSaveSocial,
  } = useSiteSettings()
  if (loading || !data) return <ConfigsLoading />

  return (
    <ConfigsPageShell>
      <div className="space-y-1 px-2">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Sayt sozlamalari</h1>
        <p className="text-sm text-muted-foreground">
          Demo (headline), sayt haqida ma&apos;lumotlar va ijtimoiy tarmoqlar.
        </p>
      </div>

      <section className="space-y-3">
        {/* <h2 className="text-base font-semibold tracking-tight">Demo (headline)</h2>
        <p className="text-sm text-muted-foreground">Bosh sahifadagi yuqori banner xabari — tillar bo&apos;yicha.</p> */}
        <HeadlineSection
          locales={LOCALES}
          localeLabels={LOCALE_LABELS}
          enabled={data.headline.enabled}
          values={data.headline.message}
          onToggleEnabled={setHeadlineEnabled}
          onChange={updateHeadline}
          onSave={() => void handleSaveHeadline()}
          saving={savingHeadline}
        />
      </section>

      <section className="space-y-4">
        {/* <h2 className="text-base font-semibold tracking-tight">Sayt haqida</h2>
        <p className="text-sm text-muted-foreground">Tavsif, manzil, email va telefon.</p> */}
        <DescriptionSection
          locales={LOCALES}
          localeLabels={LOCALE_LABELS}
          values={data.description}
          onChange={updateDescription}
          onSave={() => void handleSaveDescription()}
          saving={savingDescription}
        />
        <SiteConfigSection
          locales={LOCALES}
          localeLabels={LOCALE_LABELS}
          value={data.siteConfig}
          onChangeField={updateSiteConfig}
          onChangeAddress={updateAddress}
          onSave={() => void handleSaveConfig()}
          saving={savingConfig}
        />
      </section>

      <section className="space-y-3">
        {/* <h2 className="text-base font-semibold tracking-tight">Ijtimoiy tarmoqlar</h2>
        <p className="text-sm text-muted-foreground">Havolalar va tartib.</p> */}
        <SocialMediaSection
          items={data.socialMedia as UiSocialItem[]}
          onAdd={addSocialItem}
          onUpdateHref={updateSocialHref}
          onRemove={removeSocialItem}
          onSave={() => void handleSaveSocial()}
          saving={savingSocial}
        />
      </section>
    </ConfigsPageShell>
  )
}
