"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileAvatarUploaderProps {
  initialAvatarUrl: string;
  fallbackText: string;
  onUploadComplete: (avatarUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProfileAvatarUploader({
  initialAvatarUrl,
  fallbackText,
  onUploadComplete,
}: ProfileAvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialAvatarUrl);
    }
  }, [initialAvatarUrl, selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileSelection = (file?: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Choose an image before uploading");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { avatarUrl?: string; error?: string };

      if (!response.ok || !payload.avatarUrl) {
        throw new Error(payload.error || "Failed to upload avatar");
      }

      setSelectedFile(null);
      setPreviewUrl(payload.avatarUrl);
      onUploadComplete(payload.avatarUrl);
      toast.success("Avatar updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(initialAvatarUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-accent/16 p-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar className="size-28 border border-border/70">
            <AvatarImage src={previewUrl} alt={`${fallbackText} avatar`} />
            <AvatarFallback className="bg-primary/10 font-display text-3xl font-semibold text-primary">
              {(fallbackText || "P").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full border border-border/80"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Profile image</p>
            <p className="text-sm text-muted-foreground">
              Choose a clear photo, preview it locally, then upload it to the `avatars` bucket.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus data-icon="inline-start" />
              {selectedFile ? "Replace image" : "Choose image"}
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload data-icon="inline-start" />}
              Upload avatar
            </Button>
            {selectedFile ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={resetSelection}
                disabled={uploading}
              >
                <RefreshCw data-icon="inline-start" />
                Reset preview
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            {selectedFile
              ? `Previewing ${selectedFile.name}. This image is not saved until you upload it.`
              : "Supported formats depend on the browser. Keep files under 5MB for faster uploads."}
          </p>
        </div>
      </div>
    </div>
  );
}
