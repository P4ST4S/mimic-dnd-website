import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 select-none",
    "font-display text-xs tracking-[0.1em] uppercase font-semibold",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "rounded-card",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-on-accent shadow-[var(--shadow-vellum)] hover:bg-accent-hover",
        secondary:
          "border border-border bg-surface-raised text-text hover:bg-surface-sunken",
        ghost: "text-accent hover:bg-accent/10",
        ornate:
          "border border-ornament text-ornament hover:bg-ornament/10",
      },
      size: {
        sm: "h-8 px-3 text-2xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
