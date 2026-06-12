import type { Metadata } from "next";
import { Geist, Roboto  } from "next/font/google";
import { getLocale } from "next-intl/server";
import "@/shared/common/styles/globals.css";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Fergana Media",
  description: "Fergana Media - O‘zbekiston va Jahon yangiliklari",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://ferganamedia.uz"),
};

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const locale = await getLocale();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-765D6GVS6H";
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${roboto.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
