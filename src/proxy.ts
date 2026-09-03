import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

/**
 * Vérification OPTIMISTE uniquement : lit le cookie, ne touche jamais la
 * base. La vraie barrière d'autorisation est le DAL (src/lib/dal.ts),
 * appelé depuis chaque fonction de src/data/ — voir ARCHITECTURE.md.
 * `middleware.ts` a été renommé `proxy.ts` en Next 16 ; ce fichier vit à
 * côté de `app/`, donc dans `src/`.
 */
// /design est une page kitchen-sink réservée au développement (elle renvoie
// 404 en production via notFound(), voir src/app/design/page.tsx) : la
// laisser publique ici est sans risque et évite de devoir être connecté
// pour consulter le design system pendant le développement.
const PUBLIC_ROUTES = new Set(["/login", "/design"]);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = !!session?.userId;

  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|webp|ico)$).*)"],
};
