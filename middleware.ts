// middleware.ts — LDF Groupe
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les assets statiques
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")  ||
    (pathname.includes(".") && !pathname.startsWith("/api/"))
  ) {
    return NextResponse.next();
  }

  const userCookie   = request.cookies.get("ldf_user")?.value;
  const isAuth       = !!userCookie;
  const publicRoutes = ["/", "/login"];

  // Redirige les utilisateurs authentifiés loin de /login
  if (isAuth && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirige les non-authentifiés vers /login
  if (!isAuth && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // RBAC
  if (isAuth && userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const role: string = user.role ?? "";

      // Profils disposant d'un acces superviseur / observabilite globale (admin et owner)
      const isSuperviseur = role === "admin" || role === "owner";

      // Routes admin (fournisseurs, agences AFG banques, utilisateurs)
      const adminOnly = ["/dashboard/admin"];
      if (adminOnly.some(r => pathname.startsWith(r)) && !isSuperviseur) {
        return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
      }

      // Routes banque
      const banqueOnly = ["/dashboard/banque"];
      if (banqueOnly.some(r => pathname.startsWith(r)) && role !== "banque" && !isSuperviseur) {
        return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
      }

      // Routes fournisseur
      const fournisseurOnly = ["/dashboard/fournisseur"];
      if (fournisseurOnly.some(r => pathname.startsWith(r)) && role !== "fournisseur" && !isSuperviseur) {
        return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
      }

      // Routes souscripteur
      const souscripteurRoutes = ["/dashboard/souscripteur"];
      if (souscripteurRoutes.some(r => pathname.startsWith(r)) && role !== "souscripteur" && !isSuperviseur) {
        return NextResponse.redirect(new URL("/dashboard?error=access-denied", request.url));
      }
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("ldf_user");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
