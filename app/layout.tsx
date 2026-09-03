import LDFAuthInitializer from "@/components/providers/LDFAuthInitializer";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LDF Groupe — Plateforme de souscriptions",
  description: "Plateforme de suivi des souscriptions entre LDF, les fournisseurs et les banques partenaires.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={nunito.variable}>
      <body className="antialiased" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
        <ReactQueryProvider>
          <LDFAuthInitializer>
            {children}
          </LDFAuthInitializer>
        </ReactQueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
