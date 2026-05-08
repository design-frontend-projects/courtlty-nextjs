import * as React from "react";

import { cn } from "@/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex w-full items-stretch rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
      {...props}
    />
  );
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 border-l border-input px-3 text-muted-foreground first:border-l-0",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground min-h-24 w-full min-w-0 flex-1 resize-y bg-transparent px-3 py-2 text-sm outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea };
