import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { getServerI18n } from "@/lib/i18n/server";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getServerI18n();

  const title = t(
    "homePage.title",
    "Courtly - Book Sports Courts, Build Teams, Play Together",
  );
  const description = t(
    "homePage.description",
    "Discover and book sports courts near you, create or join teams, and organize games with friends. The ultimate platform for sports enthusiasts.",
  );

  return {
    title: {
      default: title,
      template: "%s | Courtly",
    },
    description,
    keywords: [
      "sports court booking",
      "team management",
      "basketball courts",
      "football courts",
      "tennis courts",
      "padel courts",
      "badminton courts",
      "volleyball courts",
      "sports platform",
      "book court online",
      "sports teams near me",
    ],
    authors: [{ name: "Courtly Team" }],
    creator: "Courtly",
    publisher: "Courtly",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://courtly.app"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      siteName: "Courtly",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Courtly - Sports Court Booking Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@courtlyapp",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, direction, messages } = await getServerI18n();

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} bg-background font-sans text-foreground antialiased`}
      >
        <I18nProvider initialLocale={locale} messages={messages}>
          <QueryProvider>
            <PublicNavbar />
            {children}
            <Toaster position={direction === "rtl" ? "top-left" : "top-right"} richColors closeButton />
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
