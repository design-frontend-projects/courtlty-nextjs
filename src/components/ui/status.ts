import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";

export type StatusTone =
  | "success"
  | "pending"
  | "warning"
  | "destructive"
  | "info";

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const statusToBadgeVariant: Record<StatusTone, BadgeVariant> = {
  success: "success",
  pending: "pending",
  warning: "warning",
  destructive: "destructive",
  info: "info",
};
