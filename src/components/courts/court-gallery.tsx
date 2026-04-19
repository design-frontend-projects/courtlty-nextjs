"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CourtGalleryProps {
  images: Array<{
    id: string;
    url: string;
    is_primary: boolean;
    display_order: number;
  }>;
  courtName: string;
}

export default function CourtGallery({ images, courtName }: CourtGalleryProps) {
  const sortedImages = [...images].sort((left, right) => {
    if (left.is_primary) return -1;
    if (right.is_primary) return 1;
    return left.display_order - right.display_order;
  });
  const [selectedImage, setSelectedImage] = useState(sortedImages[0]?.url || null);

  if (!images.length) {
    return (
      <div className="flex h-[27rem] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.14))]">
        <span className="brand-wordmark text-7xl font-semibold text-primary/50">{courtName.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <motion.div
        key={selectedImage}
        initial={{ opacity: 0.72 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative h-[27rem] overflow-hidden"
      >
        {selectedImage ? (
          <Image src={selectedImage} alt={courtName} fill priority className="object-cover" />
        ) : null}
      </motion.div>

      {sortedImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 border-t border-border/70 p-4 sm:grid-cols-6">
          {sortedImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image.url)}
              className={`relative h-18 overflow-hidden rounded-2xl border transition-all ${
                selectedImage === image.url
                  ? "border-primary shadow-sm ring-2 ring-primary/15"
                  : "border-border/70 opacity-82 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt={`${courtName} preview`} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
