"use client";
// providers/DatabaseProvider.tsx
// Provider pour initialiser la base de données au démarrage

import { useDatabase } from "@/hooks/useDatabase";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const { isReady, error } = useDatabase();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur d'initialisation
          </h2>
          <p className="text-gray-600 mb-4">
            Impossible de charger la base de données locale
          </p>
          <pre className="text-xs text-red-600 bg-red-50 p-3 rounded">
            {error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Initialisation Vitalis
          </h2>
          <p className="text-gray-600">
            Chargement de la base de données locale...
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Cela peut prendre quelques secondes au premier démarrage
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
