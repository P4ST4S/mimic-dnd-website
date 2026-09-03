import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Utilisée pour la rareté d'un objet d'inventaire, les tags de statut, etc.
 * Rareté 5e : commun / peu commun / rare / très rare / légendaire / artéfact.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sheet border px-2 py-0.5 text-2xs uppercase tracking-[0.1em]",
  {
    variants: {
      tone: {
        neutral: "border-border-subtle bg-surface-sunken text-text-muted",
        accent: "border-accent-quiet bg-accent/10 text-accent",
        ornament: "border-ornament-quiet bg-ornament/10 text-ornament",
        success: "border-success/40 bg-success/10 text-success",
        warn: "border-warn/40 bg-warn/10 text-warn",
        danger: "border-danger/40 bg-danger/10 text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
