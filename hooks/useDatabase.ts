// @ts-nocheck
// hooks/useDatabase.ts
// Hook pour initialiser et utiliser la base de données

import { db, isDatabaseSeeded } from "@/lib/database/db";
import { seedDatabase } from "@/lib/database/seed";
import { useEffect, useState } from "react";

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Ouvrir la connexion
        await db.open();

        // Vérifier si la base est déjà initialisée
        const seeded = await isDatabaseSeeded();

        if (!seeded) {
          console.log("🌱 Première initialisation, ajout des données...");
          await seedDatabase();
        }

        setIsReady(true);
        console.log("✅ Base de données prête");
      } catch (err) {
        console.error("❌ Erreur initialisation base de données:", err);
        setError(err as Error);
      }
    };

    initDatabase();
  }, []);

  return { isReady, error, db };
}
