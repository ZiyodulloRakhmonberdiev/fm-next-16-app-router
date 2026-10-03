import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ScrollToTopButton } from "@/shared/common/components/molecules/scroll-to-top-button";
import { SiteDocument } from "../_components/site-document";
import { setPageLocale } from "@/i18n/set-page-locale";

// Generate localized pages on first request, without enumerating DB records at build time.
export function generateStaticParams() { return []; }
export const revalidate = 300;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  setPageLocale(locale);
  const messages = await getMessages({ locale });
  return (
    <SiteDocument locale={locale}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
        <ScrollToTopButton />
      </NextIntlClientProvider>
    </SiteDocument>
  );
}
