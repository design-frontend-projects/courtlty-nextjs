import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all courts to generate dynamic routes
  const { data: courts } = await supabase
    .from("courts")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  const courtEntries: MetadataRoute.Sitemap = (courts || []).map((court) => ({
    url: `https://courtly.app/courts/${court.id}`,
    lastModified: court.updated_at ? new Date(court.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: "https://courtly.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://courtly.app/courts",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [...staticEntries, ...courtEntries];
}
