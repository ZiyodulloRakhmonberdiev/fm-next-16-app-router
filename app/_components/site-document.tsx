import { Geist, Roboto } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Providers } from "../providers"
import "@/shared/common/styles/globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export function SiteDocument({ children, locale }: { children: React.ReactNode; locale: string }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-765D6GVS6H"
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${roboto.variable} antialiased`}>
        <Providers>{children}</Providers>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
