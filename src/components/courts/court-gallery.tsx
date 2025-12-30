"use client";

import { useState } from "react";
import Image from "next/image";

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
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const [selectedImage, setSelectedImage] = useState(
    sortedImages[0]?.url || null
  );

  if (!images || images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl h-96 flex items-center justify-center">
        <span className="text-white text-6xl font-bold">
          {courtName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={courtName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-white text-6xl font-bold">
              {courtName.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {sortedImages.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image.url)}
              className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === image.url
                  ? "border-blue-600 ring-2 ring-blue-600"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              <Image
                src={image.url}
                alt={`${courtName} - ${image.display_order}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
