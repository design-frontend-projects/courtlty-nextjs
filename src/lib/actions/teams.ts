"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMemberStatus(
  teamId: string,
  memberId: string,
  status: "approved" | "rejected",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: teamMember, error: memberError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("player_id", user.id)
    .single();

  if (memberError || teamMember?.role !== "owner") {
    throw new Error("Only the team owner can manage members");
  }

  // Update status
  const { error } = await supabase
    .from("team_members")
    .update({ status })
    .eq("team_id", teamId)
    .eq("player_id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}
