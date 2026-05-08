"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleGroupVariants = cva("inline-flex items-center justify-center gap-1", {
  variants: {
    variant: {
      default: "rounded-md bg-muted p-1",
      outline: "rounded-md border border-input p-1",
    },
    size: {
      default: "h-9",
      sm: "h-8",
      lg: "h-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs",
  {
    variants: {
      size: {
        default: "h-7",
        sm: "h-6 text-xs",
        lg: "h-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

function ToggleGroup({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleGroupItemVariants({ size }), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
