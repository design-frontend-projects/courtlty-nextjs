import { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import CourtDetailClient from "./court-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const court = await prisma.courts.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      city: true,
      address: true,
    },
  });

  if (!court) {
    return { title: "Court Not Found" };
  }

  const courtCity = court.city || "Unknown city";
  const courtAddress = court.address || "address unavailable";
  const title = `${court.name} in ${courtCity} | Book Sports Courts on Courtly`;
  const description =
    court.description ||
    `Book ${court.name} located at ${courtAddress}, ${courtCity}. Professional sports facility available for booking on Courtly.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://courtly.app/courts/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CourtDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CourtDetailClient courtId={id} />;
}
