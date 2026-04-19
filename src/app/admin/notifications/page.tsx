import { PageHeader } from "@/components/shell/page-shell";
import NotificationManager from "@/components/admin/NotificationManager";

export default function AdminNotificationsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin notifications"
        title="Control platform communications."
        description="Manage broadcast and targeted alerts from the same operator shell used for bookings, courts, and payouts."
      />
      <NotificationManager />
    </div>
  );
}
