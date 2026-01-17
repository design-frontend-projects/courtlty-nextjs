"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, ProfileFormData } from "@/lib/validations/schemas";
import { Profile } from "@/types";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  User as UserIcon,
  Settings,
  Calendar,
  Users,
  MapPin,
  Clock,
  Edit3,
  Camera,
  Mail,
  Phone,
  Shield,
  Star,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

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

const sportIcons: Record<string, string> = {
  basketball: "🏀",
  football: "⚽",
  tennis: "🎾",
  volleyball: "🏐",
  badminton: "🏸",
  padel: "🎾",
};

const statusColors: Record<
  string,
  { bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  confirmed: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: Timer,
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    icon: XCircle,
  },
  completed: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: CheckCircle2,
  },
};

export default function ProfilePageClient({
  user,
  profile,
  teams,
  recentBookings,
}: ProfilePageClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      avatar_url: profile?.avatar_url || "",
      favorite_sports: [],
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
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

  const stats = [
    {
      icon: Calendar,
      label: "Total Bookings",
      value: recentBookings.length,
      color: "text-emerald-500",
    },
    {
      icon: Users,
      label: "Teams Joined",
      value: teams.length,
      color: "text-violet-500",
    },
    {
      icon: Trophy,
      label: "Games Played",
      value: recentBookings.filter((b) => b.status === "completed").length,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 pt-24 pb-16">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Profile Header */}
        <FadeInUp>
          <div className="relative mb-8">
            {/* Cover gradient */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-br from-emerald-500 via-cyan-500 to-violet-500 rounded-3xl" />

            <div className="relative pt-24 px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="relative w-32 h-32 border-4 border-white dark:border-slate-800 shadow-2xl">
                    <AvatarImage
                      src={avatarUrl}
                      alt={profile?.full_name || ""}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white text-4xl font-bold">
                      {profile?.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left pb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {profile?.full_name || "Player"}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    {profile?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {profile.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {profile?.role || "player"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Active Player
                    </Badge>
                  </div>
                </div>

                {/* Edit button */}
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "default"}
                  className={
                    isEditing
                      ? ""
                      : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg"
                  }
                >
                  {isEditing ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg text-center"
                  >
                    <stat.icon
                      className={`w-6 h-6 mx-auto mb-2 ${stat.color}`}
                    />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Main content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="flex w-full max-w-lg mx-auto bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-1 shadow-lg">
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Bookings */}
              <div className="lg:col-span-2">
                <StaggerContainer className="space-y-4">
                  <StaggerItem>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      Recent Bookings
                    </h2>
                  </StaggerItem>

                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => {
                      const status =
                        statusColors[booking.status] || statusColors.pending;
                      const StatusIcon = status.icon;
                      return (
                        <StaggerItem key={booking.id}>
                          <motion.div
                            whileHover={{
                              y: -2,
                              transition: { duration: 0.2 },
                            }}
                            className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl shadow-lg">
                                {sportIcons[booking.sport.toLowerCase()] ||
                                  "🏆"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {booking.court?.name || "Unknown Court"}
                                  </h3>
                                  <Badge
                                    className={`${status.bg} ${status.text} border-0`}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {booking.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3" />
                                  {booking.court?.address || "No address"}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                    {new Date(
                                      booking.booking_date,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-cyan-500" />
                                    {booking.start_time} - {booking.end_time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      );
                    })
                  ) : (
                    <StaggerItem>
                      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          No bookings yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                          Start exploring courts and book your first game!
                        </p>
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                          Find Courts
                        </Button>
                      </div>
                    </StaggerItem>
                  )}
                </StaggerContainer>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-violet-500" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      label: "Book a Court",
                      href: "/courts",
                      icon: MapPin,
                      color: "from-emerald-500 to-cyan-500",
                    },
                    {
                      label: "Join a Team",
                      href: "/teams",
                      icon: Users,
                      color: "from-violet-500 to-purple-500",
                    },
                    {
                      label: "View History",
                      href: "/dashboard",
                      icon: Calendar,
                      color: "from-amber-500 to-orange-500",
                    },
                  ].map((action, index) => (
                    <motion.a
                      key={action.label}
                      href={action.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-4 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {action.label}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.length > 0 ? (
                teams.map((membership) => (
                  <StaggerItem key={membership.id}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl shadow-lg">
                          {membership.team
                            ? sportIcons[membership.team.sport.toLowerCase()] ||
                              "🏆"
                            : "🏆"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {membership.team?.name || "Unknown Team"}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {membership.team?.sport || "Sport"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-0 capitalize">
                          {membership.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                        >
                          View Team
                        </Button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))
              ) : (
                <StaggerItem className="md:col-span-2 lg:col-span-3">
                  <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-200/50 dark:border-slate-700/50 text-center">
                    <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No teams yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                      Join a team to start playing with others or create your
                      own team!
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                        Browse Teams
                      </Button>
                      <Button variant="outline">Create Team</Button>
                    </div>
                  </div>
                </StaggerItem>
              )}
            </StaggerContainer>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-emerald-500" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your profile information and manage your account
                      settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <Avatar className="w-20 h-20 border-4 border-emerald-100 dark:border-emerald-900 shadow-lg">
                          <AvatarImage
                            src={avatarUrl}
                            alt={profile?.full_name || ""}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-white text-2xl font-bold">
                            {profile?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="avatar_url">Avatar URL</Label>
                          <Input
                            id="avatar_url"
                            type="url"
                            placeholder="https://example.com/avatar.jpg"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            disabled={!isEditing}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      {/* Email (Read-only) */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-slate-100 dark:bg-slate-900"
                        />
                        <p className="text-sm text-slate-500">
                          Email cannot be changed here. Contact support if
                          needed.
                        </p>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          {...register("full_name")}
                          placeholder="John Doe"
                          disabled={!isEditing}
                          className="bg-white dark:bg-slate-800"
                        />
                        {errors.full_name && (
                          <p className="text-sm text-red-500">
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
                          disabled={!isEditing}
                          className="bg-white dark:bg-slate-800"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      {/* Role Badge */}
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                            {profile?.role || "player"}
                          </Badge>
                          <p className="text-sm text-slate-500">
                            Your account role
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-end gap-4 pt-4 border-t"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                          >
                            {loading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                          </Button>
                        </motion.div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
