"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// La page /dashboard/souscripteur redirige vers /dashboard
// car le dashboard est maintenant rendu dynamiquement selon le rôle dans /dashboard/page.tsx
export default function SouscripteurRedirectPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return null;
}
