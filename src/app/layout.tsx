import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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

export const metadata: Metadata = {
  title: {
    default: "Courtly - Book Sports Courts, Build Teams, Play Together",
    template: "%s | Courtly",
  },
  description:
    "Discover and book sports courts near you, create or join teams, and organize games with friends. The ultimate platform for sports enthusiasts.",
  keywords: [
    "sports court booking",
    "team management",
    "basketball courts",
    "football courts",
    "tennis courts",
    "sports platform",
    "book court online",
    "sports teams",
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
    title: "Courtly - Book Sports Courts, Build Teams, Play Together",
    description:
      "Discover and book sports courts near you, create or join teams, and organize games with friends.",
    type: "website",
    locale: "en_US",
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
    title: "Courtly - Book Sports Courts, Build Teams, Play Together",
    description:
      "Discover and book sports courts near you, create or join teams, and organize games with friends.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PublicNavbar />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
