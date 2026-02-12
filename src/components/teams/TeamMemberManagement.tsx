"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateMemberStatus } from "@/lib/actions/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

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
  const handleAction = async (
    memberId: string,
    action: "approved" | "rejected",
  ) => {
    try {
      await updateMemberStatus(teamId, memberId, action);
      toast.success(`Member ${action}`);
      setPendingMembers((prev) => prev.filter((m) => m.player_id !== memberId));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to ${action} member`;
      toast.error(errorMessage);
    }
  };

  if (pendingMembers.length === 0)
    return (
      <div className="text-muted-foreground text-sm">No pending requests.</div>
    );

  return (
    <div className="space-y-4">
      {pendingMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
              <AvatarFallback>
                {member.profiles?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {member.profiles?.first_name ||
                  member.profiles?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">Requested to join</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => handleAction(member.player_id, "approved")}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => handleAction(member.player_id, "rejected")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
