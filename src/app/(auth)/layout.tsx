// `LayoutProps<'/login'>` n'est pas généré pour les layouts posés sur un
// route group ((auth)) — next typegen ne les rattache qu'aux segments
// littéraux (voir AppRoutes vs LayoutRoutes dans .next/types/routes.d.ts).
// Typage explicite, ce que la doc Next autorise en repli.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      {children}
    </main>
  );
}
