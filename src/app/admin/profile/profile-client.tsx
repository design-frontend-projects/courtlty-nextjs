"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/lib/validations/schemas";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Upload, User, ImagePlus } from "lucide-react";

interface ProfileClientProps {
  initialProfile: Profile | null;
  userEmail: string;
}

export default function ProfileClient({
  initialProfile,
  userEmail,
}: ProfileClientProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialProfile?.full_name || "",
      phone: initialProfile?.phone || "",
      avatar_url: initialProfile?.avatar_url || "",
      favorite_sports: (initialProfile as any)?.favorite_sports || [],
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setValue("avatar_url", publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          avatar_url: avatarUrl || data.avatar_url,
          favorite_sports: data.favorite_sports,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialProfile?.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Personal Information
          </CardTitle>
          <CardDescription className="text-lg">
            Update your profile information and manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:flex-row gap-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl dark:border-slate-700 transition-transform group-hover:scale-105 duration-300">
                  <AvatarImage
                    src={avatarUrl}
                    alt={initialProfile?.full_name || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                    {initialProfile?.full_name?.charAt(0) || (
                      <User className="h-16 w-16" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <h4 className="text-xl font-semibold">Profile Picture</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Upload a professional photo to enhance your profile
                  visibility. Supports JPG, PNG or WebP (max 2MB).
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Change Avatar
                </Button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid gap-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Registered Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="h-12 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 rounded-xl font-medium cursor-not-allowed opacity-80"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="full_name"
                    className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border-2 focus-visible:ring-indigo-500 transition-all"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-rose-500 font-medium">
                      {errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+1234567890"
                    className="h-12 rounded-xl border-2 focus-visible:ring-indigo-500 transition-all font-mono"
                  />
                  {errors.phone && (
                    <p className="text-sm text-rose-500 font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Badge */}
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Account Role
                </Label>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md uppercase tracking-tighter">
                    {initialProfile?.role || "player"}
                  </span>
                  <p className="text-sm text-muted-foreground italic">
                    Permissions are managed by administrators.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading || uploading}
                className="h-12 px-6 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="h-12 px-8 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Save Profile Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
