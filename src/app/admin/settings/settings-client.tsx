"use client";

import { useEffect, useState } from "react";
import { Bell, Eye, Globe, Loader2, Moon, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { SectionShell } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsClientProps {
  userId: string;
  initialPreferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    bookingReminders?: boolean;
    marketingEmails?: boolean;
  };
}

export default function SettingsClient({
  userId,
  initialPreferences,
}: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [emailNotifications, setEmailNotifications] = useState(
    initialPreferences?.emailNotifications ?? true,
  );
  const [pushNotifications, setPushNotifications] = useState(
    initialPreferences?.pushNotifications ?? true,
  );
  const [bookingReminders, setBookingReminders] = useState(
    initialPreferences?.bookingReminders ?? true,
  );
  const [marketingEmails, setMarketingEmails] = useState(
    initialPreferences?.marketingEmails ?? false,
  );
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const savedTheme = sessionStorage.getItem("theme") as "light" | "dark" | "system" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      root.classList.add(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      );
      return;
    }

    root.classList.add(newTheme);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    sessionStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    toast.success("Theme updated");
  };

  const handleSaveNotifications = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("auth.users")
        .update({
          notification_preferences: {
            emailNotifications,
            pushNotifications,
            bookingReminders,
            marketingEmails,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      toast.success("Notification preferences saved");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-[1.5rem] border border-border/70 bg-accent/20 p-2">
        <TabsTrigger value="general" className="rounded-full px-5">
          General
        </TabsTrigger>
        <TabsTrigger value="notifications" className="rounded-full px-5">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="appearance" className="rounded-full px-5">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="security" className="rounded-full px-5">
          Security
        </TabsTrigger>
        <TabsTrigger value="privacy" className="rounded-full px-5">
          Privacy
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-0">
        <SectionShell
          title="Regional defaults"
          description="Set language and timezone defaults for the operator environment."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="admin_language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="admin_language" className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="admin_timezone">Timezone</Label>
              <Select defaultValue="UTC">
                <SelectTrigger id="admin_timezone" className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Africa/Cairo">Cairo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionShell>
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <SectionShell
          title="Notification controls"
          description="Choose which alerts reach the operator account."
          actions={
            <Button onClick={handleSaveNotifications} className="rounded-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Save notifications"}
            </Button>
          }
        >
          <div className="grid gap-5">
            {[
              {
                id: "email_notifications",
                icon: Bell,
                label: "Email notifications",
                description: "Receive approval and booking updates by email.",
                checked: emailNotifications,
                onCheckedChange: setEmailNotifications,
              },
              {
                id: "push_notifications",
                icon: Bell,
                label: "Push notifications",
                description: "Browser-level alerts for urgent operator actions.",
                checked: pushNotifications,
                onCheckedChange: setPushNotifications,
              },
              {
                id: "booking_reminders",
                icon: Bell,
                label: "Booking reminders",
                description: "Upcoming session reminders before the operating window starts.",
                checked: bookingReminders,
                onCheckedChange: setBookingReminders,
              },
              {
                id: "marketing_emails",
                icon: Globe,
                label: "Marketing emails",
                description: "Optional announcements about product changes and platform growth.",
                checked: marketingEmails,
                onCheckedChange: setMarketingEmails,
              },
            ].map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-border/70 bg-accent/14 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-border/70 bg-background/80 p-2 text-primary">
                      <item.icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={item.onCheckedChange}
                  />
                </div>
                {index < 3 ? <Separator className="my-1 opacity-0" /> : null}
              </div>
            ))}
          </div>
        </SectionShell>
      </TabsContent>

      <TabsContent value="appearance" className="mt-0">
        <SectionShell title="Theme control" description="Set the color mode for the operator workspace.">
          <div className="grid gap-3 md:max-w-sm">
            <Label htmlFor="admin_theme">Theme</Label>
            <Select
              value={theme}
              onValueChange={(value: "light" | "dark" | "system") => handleThemeChange(value)}
            >
              <SelectTrigger id="admin_theme" className="h-12 rounded-2xl">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The admin UI respects reduced motion and the system theme when set to automatic.
            </p>
          </div>
        </SectionShell>
      </TabsContent>

      <TabsContent value="security" className="mt-0">
        <SectionShell title="Security controls" description="Reserved actions for password, session, and account hardening.">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Password",
                copy: "Password management will be connected here.",
                action: "Change password",
              },
              {
                icon: Shield,
                title: "Two-factor auth",
                copy: "Add a second factor for operator accounts.",
                action: "Enable 2FA",
              },
              {
                icon: Shield,
                title: "Sessions",
                copy: "Review all active devices and revoke access if needed.",
                action: "View sessions",
              },
            ].map((item) => (
              <div key={item.title} className="operator-panel px-4 py-4">
                <item.icon className="mb-3 size-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                <Button variant="outline" className="mt-5 rounded-full" disabled>
                  {item.action}
                </Button>
              </div>
            ))}
          </div>
        </SectionShell>
      </TabsContent>

      <TabsContent value="privacy" className="mt-0">
        <SectionShell title="Privacy controls" description="Visibility, export, and account lifecycle settings.">
          <div className="grid gap-5">
            <div className="space-y-3">
              <Label htmlFor="admin_visibility">Data visibility</Label>
              <Select defaultValue="public">
                <SelectTrigger id="admin_visibility" className="h-12 rounded-2xl md:max-w-sm">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="operator-panel px-4 py-4">
                <Eye className="mb-3 size-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold tracking-tight">Download data</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Request a portable copy of your operator data.
                </p>
                <Button variant="outline" className="mt-5 rounded-full" disabled>
                  Request export
                </Button>
              </div>
              <div className="operator-panel px-4 py-4">
                <Moon className="mb-3 size-5 text-destructive" />
                <h2 className="font-display text-2xl font-semibold tracking-tight">Delete account</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Permanently remove the operator account and related access.
                </p>
                <Button variant="destructive" className="mt-5 rounded-full" disabled>
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        </SectionShell>
      </TabsContent>
    </Tabs>
  );
}
