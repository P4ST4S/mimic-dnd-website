import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div className="section-heading">
      <h3
        className={cn("heading-smallcaps whitespace-nowrap", className)}
        {...props}
      >
        {children}
      </h3>
    </div>
  );
}
