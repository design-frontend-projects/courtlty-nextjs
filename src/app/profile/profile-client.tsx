"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  Camera,
  Clock3,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/lib/validations/schemas";
import { Profile } from "@/types";
import {
  ActionRail,
  EmptyState,
  MetricTile,
  PageHeader,
  SectionShell,
  WorkspaceShell,
} from "@/components/shell/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Team {
  id: string;
  name: string;
  sport: string;
  logo_url: string | null;
}

interface TeamMembership {
  id: string;
  role: string;
  status: string;
  team: Team | null;
}

interface Court {
  id: string;
  name: string;
  address: string | null;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  sport: string;
  court: Court | null;
}

interface ProfilePageClientProps {
  user: User;
  profile: Profile | null;
  teams: TeamMembership[];
  recentBookings: Booking[];
}

const statusTone: Record<Booking["status"], string> = {
  confirmed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  cancelled: "border-destructive/20 bg-destructive/10 text-destructive",
  completed: "border-primary/20 bg-primary/10 text-primary",
} as const;

export default function ProfilePageClient({
  user,
  profile,
  teams,
  recentBookings,
}: ProfilePageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
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
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url || "",
      favorite_sports: [],
    },
  });

  const completedBookings = recentBookings.filter((booking) => booking.status === "completed").length;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

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
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setValue("avatar_url", publicUrl);
      toast.success("Avatar updated");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);

    try {
      const fullName = `${data.first_name} ${data.last_name}`.trim() || data.full_name;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: fullName,
          avatar_url: avatarUrl || data.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Profile updated");
      setIsEditing(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceShell>
      <PageHeader
        eyebrow="Player profile"
        title={profile?.full_name || "Player profile"}
        description="Keep identity, bookings, and squad activity aligned in one operational view."
        actions={
          <ActionRail>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              type="button"
              variant={isEditing ? "outline" : "default"}
              className="rounded-full"
              onClick={() => setIsEditing((value) => !value)}
            >
              <Edit3 data-icon="inline-start" />
              {isEditing ? "Stop editing" : "Edit profile"}
            </Button>
          </ActionRail>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <SectionShell
          title="Identity"
          description="Primary contact data, role, and access state."
          className="xl:col-span-1"
          contentClassName="space-y-5"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="size-28 border border-border/70">
                <AvatarImage src={avatarUrl} alt={profile?.full_name || "Profile avatar"} />
                <AvatarFallback className="bg-primary/10 font-display text-3xl font-semibold text-primary">
                  {(profile?.full_name || user.email || "P").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full border border-border/80"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Camera />}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight">
                  {profile?.full_name || "Player"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile?.role === "admin"
                    ? "Administrative privileges are enabled on this account."
                    : "Player-facing account with booking and team access."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                  <ShieldCheck className="mr-1 size-3.5" />
                  {profile?.role || "player"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-border/70 bg-accent/18 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="size-4 text-primary" />
                Email
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-accent/18 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone className="size-4 text-primary" />
                Phone
              </div>
              <p className="text-sm text-muted-foreground">{profile?.phone || "Not provided"}</p>
            </div>
          </div>
        </SectionShell>

        <MetricTile
          label="Recent bookings"
          value={recentBookings.length}
          icon={CalendarDays}
          meta="Latest sessions visible across the booking flow."
        />
        <MetricTile
          label="Team memberships"
          value={teams.length}
          icon={Users}
          meta="Approved squads currently tied to your account."
        />
        <MetricTile
          label="Completed sessions"
          value={completedBookings}
          icon={Trophy}
          meta="Sessions that have already moved through the full flow."
        />
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-[1.5rem] border border-border/70 bg-accent/20 p-2">
          <TabsTrigger value="overview" className="rounded-full px-5">
            Overview
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-full px-5">
            Teams
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-5">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <SectionShell
            title="Recent booking activity"
            description="Upcoming and recently completed sessions in the order you need to scan them."
            actions={
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/courts">Book a court</Link>
              </Button>
            }
          >
            {recentBookings.length > 0 ? (
              <div className="grid gap-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-accent/18 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{booking.court?.name || "Unknown court"}</p>
                        <Badge
                          variant="secondary"
                          className={`rounded-full border ${statusTone[booking.status] || "border-border/70"}`}
                        >
                          {booking.status}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full capitalize">
                          {booking.sport}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-4 text-primary" />
                          {booking.booking_date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-4 text-primary" />
                          {booking.start_time} - {booking.end_time}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-primary" />
                          {booking.court?.address || "Address pending"}
                        </span>
                      </div>
                    </div>
                    {booking.court?.id ? (
                      <Button asChild variant="ghost" className="rounded-full">
                        <Link href={`/courts/${booking.court.id}`}>Open court</Link>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No booking activity yet"
                description="Once you reserve a court, your schedule, status, and venue context will stay visible here."
                action={
                  <Button asChild className="rounded-full">
                    <Link href="/courts">Discover courts</Link>
                  </Button>
                }
              />
            )}
          </SectionShell>
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <SectionShell
            title="Team workspace"
            description="Squads connected to your account, including role and recruiting context."
            actions={
              <Button asChild className="rounded-full">
                <Link href="/teams/create">Create team</Link>
              </Button>
            }
          >
            {teams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((membership) => (
                  <div key={membership.id} className="surface-panel rounded-[1.6rem] px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-[1rem] border border-primary/15 bg-primary/10 font-display text-xl font-semibold text-primary">
                            {membership.team?.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <p className="font-display text-2xl font-semibold tracking-tight">
                              {membership.team?.name || "Unknown team"}
                            </p>
                            <p className="text-sm capitalize text-muted-foreground">
                              {membership.team?.sport || "Sport not set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {membership.role}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          >
                            {membership.status}
                          </Badge>
                        </div>
                      </div>
                      {membership.team?.id ? (
                        <Button asChild variant="ghost" className="rounded-full">
                          <Link href={`/teams/${membership.team.id}`}>Open team</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No teams linked yet"
                description="Create a new squad or join one to keep chat, roster, and session prep in the same workspace."
                action={
                  <Button asChild className="rounded-full">
                    <Link href="/teams/create">Create a team</Link>
                  </Button>
                }
              />
            )}
          </SectionShell>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <SectionShell
            title="Profile settings"
            description="Use a single editing flow with clearer labels and mobile-friendly controls."
          >
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    {...register("first_name")}
                    disabled={!isEditing}
                    className="h-12 rounded-2xl"
                  />
                  {errors.first_name ? (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    {...register("last_name")}
                    disabled={!isEditing}
                    className="h-12 rounded-2xl"
                  />
                  {errors.last_name ? (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="full_name">Display name</Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    disabled
                    className="h-12 rounded-2xl bg-accent/22"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is derived from your first and last name.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    disabled={!isEditing}
                    className="h-12 rounded-2xl"
                  />
                  {errors.phone ? (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Keep this current for booking confirmations and team coordination.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="account_email">Email</Label>
                <Input
                  id="account_email"
                  value={user.email || ""}
                  disabled
                  className="h-12 rounded-2xl bg-accent/22"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/70 pt-6">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-full" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <Save data-icon="inline-start" />}
                      Save changes
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Editing is locked until you enter edit mode from the header.
                  </p>
                )}
              </div>
            </form>
          </SectionShell>
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  );
}
