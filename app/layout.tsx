import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fergana Media",
  description: "Fergana Media - O‘zbekiston va Jahon yangiliklari",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://ferganamedia.uz"),
};

// The locale layout renders the document, using params instead of request headers.
export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
