import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";

// Pas de LayoutProps<'/'> ici : ce layout est posé sur le route group
// (app), qui couvre plusieurs routes ("/", "/mon-personnage", "/mj", …) —
// voir la même remarque dans (auth)/layout.tsx.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="h-[65px] border-b border-border-subtle" />}>
        <SiteHeader />
      </Suspense>
      {children}
    </div>
  );
}
