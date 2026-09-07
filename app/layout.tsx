import LDFAuthInitializer from "@/components/providers/LDFAuthInitializer";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ViFlow — Simplifier le financement, fluidifier les achats",
  description: "Plateforme de gestion et de suivi des financements Vitalis. Gérez vos souscriptions, devis, validations bancaires et paiements.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={plusJakartaSans.variable}>
      <body className="antialiased font-sans">
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
