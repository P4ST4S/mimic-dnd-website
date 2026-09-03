import Image from "next/image";
import { cn } from "@/lib/cn";

interface PortraitFrameProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Cadre de portrait — ratio fixe 832×1216 (le ratio natif des générateurs
 * d'image IA les plus courants). Sans portrait, un dégradé parchemin/or
 * tient lieu de silhouette plutôt qu'un blurDataURL généré par sharp
 * (bloqué en pnpm build-script sur ce projet, voir docs/RUNBOOK.md).
 */
export function PortraitFrame({
  src,
  alt,
  priority,
  sizes = "(max-width: 768px) 40vw, 220px",
  className,
}: PortraitFrameProps) {
  return (
    <div
      className={cn(
        "relative aspect-[832/1216] overflow-hidden rounded-card border border-border bg-surface-sunken shadow-[var(--shadow-vellum)]",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,var(--color-parchment-400),var(--color-parchment-600))]"
          aria-hidden="true"
        >
          <span className="font-display-ornate text-4xl text-parchment-50/70">?</span>
        </div>
      )}
    </div>
  );
}
