"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  Star,
  Trash2,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

interface CourtImage {
  id: string;
  court_id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

interface CourtImageUploaderProps {
  courtId: string;
  initialImages?: CourtImage[];
}

export default function CourtImageUploader({
  courtId,
  initialImages = [],
}: CourtImageUploaderProps) {
  const [images, setImages] = useState<CourtImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/courts/${courtId}/images`);
      const data = await res.json();
      if (res.ok) {
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [courtId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${courtId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("court-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("court-images").getPublicUrl(fileName);

      // Save to database
      const isPrimary = images.length === 0; // First image is primary
      const displayOrder = images.length;

      const res = await fetch(`/api/courts/${courtId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: publicUrl,
          is_primary: isPrimary,
          display_order: displayOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save image");
      }

      toast.success("Image uploaded successfully!");
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courts/${courtId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId, is_primary: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Primary image updated");
      fetchImages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/courts/${courtId}/images?image_id=${imageId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Image deleted");
      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      // Create a fake event to reuse the handler
      const fakeEvent = {
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await handleFileSelect(fakeEvent);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courtId, images.length],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          Court Images
        </CardTitle>
        <CardDescription>
          Upload images to showcase your court (max 5MB each)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images
              .sort((a, b) => a.display_order - b.display_order)
              .map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-xl overflow-hidden border-2 aspect-video bg-muted"
                >
                  <Image
                    src={image.url}
                    alt="Court image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-yellow-950 gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Primary
                      </Badge>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <GripVertical className="absolute top-2 left-2 h-5 w-5 text-white/70" />

                    {!image.is_primary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimary(image.id)}
                        disabled={loading}
                        className="gap-1"
                      >
                        <Star className="h-4 w-4" />
                        Set Primary
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove this image from the
                            court.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(image.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
