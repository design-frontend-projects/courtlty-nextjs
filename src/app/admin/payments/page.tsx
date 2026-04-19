import { CreditCard } from "lucide-react";

import { EmptyState, PageHeader, SectionShell } from "@/components/shell/page-shell";

export default function PaymentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8">
      <PageHeader
        eyebrow="Admin payments"
        title="Track settlements and transaction health."
        description="This surface is ready for payout review, refund actions, and revenue monitoring as payment data is connected."
      />

      <SectionShell title="Transactions" description="Recent payment activity and payout status will appear here.">
        <EmptyState
          icon={CreditCard}
          title="No payment records yet"
          description="Once transactions are connected to the operator dashboard, this table will become the main finance review surface."
        />
      </SectionShell>
    </div>
  );
}
