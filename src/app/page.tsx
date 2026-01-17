import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "Courtly - Book Sports Courts, Build Teams, Play Together",
  description:
    "Discover and book sports courts near you, create or join teams, and organize games with friends. The ultimate platform for sports enthusiasts.",
  keywords: [
    "sports court booking",
    "team management",
    "basketball courts",
    "football courts",
    "tennis courts",
    "sports platform",
  ],
  openGraph: {
    title: "Courtly - Book Sports Courts, Build Teams, Play Together",
    description:
      "Discover and book sports courts near you, create or join teams, and organize games with friends.",
    type: "website",
    locale: "en_US",
    siteName: "Courtly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Courtly - Book Sports Courts, Build Teams, Play Together",
    description:
      "Discover and book sports courts near you, create or join teams, and organize games with friends.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
