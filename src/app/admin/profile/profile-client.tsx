"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Camera, Loader2, Mail, Phone, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/lib/validations/schemas";
import { Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionShell } from "@/components/shell/page-shell";

interface ProfileClientProps {
  initialProfile: Profile | null;
  userEmail: string;
}

export default function ProfileClient({ initialProfile, userEmail }: ProfileClientProps) {
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
      favorite_sports: [],
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", initialProfile?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setValue("avatar_url", publicUrl);
      toast.success("Avatar updated");
      router.refresh();
    } catch {
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialProfile?.id);

      if (error) {
        throw error;
      }

      toast.success("Profile updated");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionShell title="Account identity" description="Keep the operator account and avatar current across the admin surface.">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="operator-panel px-5 py-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Avatar className="size-28 border border-border/70">
                  <AvatarImage src={avatarUrl} alt={initialProfile?.full_name || "Operator avatar"} />
                  <AvatarFallback className="bg-primary/10 font-display text-3xl font-semibold text-primary">
                    {(initialProfile?.full_name || userEmail || "A").charAt(0)}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {initialProfile?.full_name || "Courtly operator"}
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full border-primary/20 bg-primary/10 text-primary"
                >
                  <ShieldCheck className="mr-1 size-3.5" />
                  {initialProfile?.role || "admin"}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Use a clean, recognizable profile image for approvals, support, and outbound notifications.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="admin_full_name">Full name</Label>
                <Input
                  id="admin_full_name"
                  {...register("full_name")}
                  className="h-12 rounded-2xl"
                  placeholder="Operator name"
                />
                {errors.full_name ? (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <Label htmlFor="admin_phone">Phone</Label>
                <Input
                  id="admin_phone"
                  {...register("phone")}
                  className="h-12 rounded-2xl"
                  placeholder="+20 100 000 0000"
                />
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-border/70 bg-accent/18 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="size-4 text-primary" />
                  Email
                </div>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <div className="rounded-[1.4rem] border border-border/70 bg-accent/18 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="size-4 text-primary" />
                  Support line
                </div>
                <p className="text-sm text-muted-foreground">
                  {initialProfile?.phone || "No phone registered yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-border/70 pt-6">
          <Button type="submit" className="rounded-full" disabled={loading || uploading}>
            {loading ? <Loader2 className="animate-spin" /> : <Save data-icon="inline-start" />}
            Save profile
          </Button>
        </div>
      </form>
    </SectionShell>
  );
}
