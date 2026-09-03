import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en résolvant les conflits (ex. deux
 * classes `bg-*`). Indispensable dès qu'un composant accepte `className`
 * en prop, ce qui est le cas de tous les composants de `components/ui`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
