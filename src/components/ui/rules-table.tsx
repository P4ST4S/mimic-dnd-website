import type { TableHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Table façon manuel des règles. `stack` bascule en cartes empilées sous
 * 40rem (voir .rules-table--stack dans globals.css) — chaque <td> doit
 * alors porter un attribut data-label pour afficher son intitulé.
 */
export function RulesTable({
  className,
  stack = true,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { stack?: boolean }) {
  return (
    <table
      className={cn("rules-table", stack && "rules-table--stack", className)}
      {...props}
    />
  );
}
