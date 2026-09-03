import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Panneau ornemental à coins gravés — la brique de base de la plupart
 * des cartes du site (fiche, roster, section de l'inventaire).
 * Les coins sont des masques SVG (voir globals.css --mask-corner) : ils
 * suivent la couleur --color-ornament et donc le thème, sans asset dupliqué.
 */
export function OrnateCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ornate-frame", className)} {...props}>
      <span className="ornate-frame__corner" aria-hidden="true" />
      <span className="ornate-frame__corner" aria-hidden="true" />
      <span className="ornate-frame__corner" aria-hidden="true" />
      <span className="ornate-frame__corner" aria-hidden="true" />
      {children}
    </div>
  );
}
