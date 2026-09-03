import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { Role } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Server Component asynchrone, monté sous <Suspense> par (app)/layout.tsx —
 * jamais `await`é directement dans le layout, ce qui retiendrait tout
 * {children} derrière la requête de session (voir authentication.md).
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border-subtle">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="font-display-ornate text-2xl text-accent">
          Mimic
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-accent">
            Le groupe
          </Link>
          <Link href="/mon-personnage" className="hover:text-accent">
            Ma fiche
          </Link>
          {user.role === Role.DM && (
            <Link href="/mj" className="hover:text-accent">
              Panneau MJ
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden text-xs text-text-muted sm:inline">{user.displayName}</span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Déconnexion
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
