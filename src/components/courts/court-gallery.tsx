"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
    sortedImages[0]?.url || null,
  );

  if (!images || images.length === 0) {
    return (
      <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] h-96 flex items-center justify-center shadow-inner">
        <span className="text-white text-6xl font-bold">
          {courtName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div
        layoutId="main-image"
        className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl overflow-hidden shadow-lg border border-white/10 ring-1 ring-black/5"
      >
        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={selectedImage}
                alt={courtName}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600">
              <span className="text-white text-6xl font-black">
                {courtName.charAt(0)}
              </span>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {sortedImages.map((image, index) => (
            <motion.button
              key={image.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImage(image.url)}
              className={`relative h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                selectedImage === image.url
                  ? "border-blue-600 ring-4 ring-blue-500/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-800 hover:border-blue-400"
              }`}
            >
              <Image
                src={image.url}
                alt={`${courtName} - ${image.display_order}`}
                fill
                className="object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
