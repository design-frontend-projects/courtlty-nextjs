"use client";

import { useState } from "react";
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
import { Loader2, Upload, User } from "lucide-react";

interface ProfileClientProps {
  initialProfile: Profile | null;
  userEmail: string;
}

export default function ProfileClient({
  initialProfile,
  userEmail,
}: ProfileClientProps) {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialProfile?.full_name || "",
      phone: initialProfile?.phone || "",
      avatar_url: initialProfile?.avatar_url || "",
      favorite_sports: initialProfile?.favorite_sports || [],
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          avatar_url: avatarUrl || null,
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
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile information and manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-indigo-100">
                <AvatarImage
                  src={avatarUrl}
                  alt={initialProfile?.full_name || ""}
                />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl">
                  {initialProfile?.full_name?.charAt(0) || (
                    <User className="h-12 w-12" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="avatar_url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a URL for your profile picture
                </p>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed here. Contact support if needed.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1234567890"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Role Badge */}
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {initialProfile?.role || "player"}
                </span>
                <p className="text-sm text-muted-foreground">
                  Your account role
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
