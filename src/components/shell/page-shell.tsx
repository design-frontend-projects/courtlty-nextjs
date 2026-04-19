import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkspaceShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function WorkspaceShellTight({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("page-shell-tight", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "surface-panel-strong flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {description ? <p className="section-copy">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  );
}

export function MetricTile({
  label,
  value,
  meta,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("surface-panel gap-4 rounded-[1.75rem] py-5", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
        <div className="space-y-1">
          <CardDescription className="section-kicker text-[0.68rem]">{label}</CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight">{value}</CardTitle>
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-border/60 bg-background/80 p-3 text-primary">
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardHeader>
      {meta ? <CardContent className="pt-0 text-sm text-muted-foreground">{meta}</CardContent> : null}
    </Card>
  );
}

export function SectionShell({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("surface-panel gap-5 rounded-[2rem] py-0", className)}>
      <CardHeader className="border-b border-border/70 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("pb-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed border-border/80 bg-accent/20 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="rounded-2xl border border-border/80 bg-background/90 p-4 text-primary">
          <Icon className="size-7" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function FilterBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("surface-panel sticky top-20 z-30 rounded-[1.75rem] px-4 py-4 sm:px-5", className)}>
      {children}
    </div>
  );
}

export function ActionRail({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}
