import NotificationManager from "@/components/admin/NotificationManager";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Manage and send system-wide or targeted notifications.
        </p>
      </div>
      <NotificationManager />
    </div>
  );
}
