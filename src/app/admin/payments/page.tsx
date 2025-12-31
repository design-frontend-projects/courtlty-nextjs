import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Manage and view recent payment activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No payments found.</p>
        </CardContent>
      </Card>
    </div>
  );
}
