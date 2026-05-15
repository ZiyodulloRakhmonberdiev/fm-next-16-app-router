import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ScrollToTopButton } from "@/shared/common/components/molecules/scroll-to-top-button";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <ScrollToTopButton />
    </NextIntlClientProvider>
  );
}
