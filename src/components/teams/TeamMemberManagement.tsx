"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { updateMemberStatus } from "@/lib/actions/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type TeamMember = {
  id: string;
  player_id: string;
  profiles: {
    avatar_url: string | null;
    email: string | null;
    first_name: string | null;
  } | null;
};

export function TeamMemberManagement({
  initialPendingMembers,
  teamId,
}: {
  initialPendingMembers: TeamMember[];
  teamId: string;
}) {
  const [pendingMembers, setPendingMembers] = useState(initialPendingMembers);

  const handleAction = async (memberId: string, action: "approved" | "rejected") => {
    try {
      await updateMemberStatus(teamId, memberId, action);
      toast.success(`Member ${action}.`);
      setPendingMembers((current) => current.filter((member) => member.player_id !== memberId));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} member`);
    }
  };

  if (!pendingMembers.length) {
    return <p className="text-sm text-muted-foreground">No pending requests.</p>;
  }

  return (
    <div className="grid gap-3">
      {pendingMembers.map((member) => (
        <div
          key={member.id}
          className="flex flex-col gap-4 rounded-[1.45rem] border border-border/70 bg-accent/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar className="size-11 border border-border/70">
              <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
              <AvatarFallback>{member.profiles?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {member.profiles?.first_name || member.profiles?.email?.split("@")[0]}
              </p>
              <p className="text-sm text-muted-foreground">Requested to join</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-emerald-500/25 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
              onClick={() => handleAction(member.player_id, "approved")}
            >
              <Check data-icon="inline-start" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-destructive/25 text-destructive hover:bg-destructive/10"
              onClick={() => handleAction(member.player_id, "rejected")}
            >
              <X data-icon="inline-start" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
