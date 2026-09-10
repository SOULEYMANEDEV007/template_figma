// @ts-nocheck
// hooks/useVitalisData.ts
// Hooks personnalisés pour accéder facilement aux données Vitalis

import {
  agencesAFGOps,
  devisOps,
  dossiersOps,
  fournisseursOps,
  pointsRelaisOps,
  souscriptionsFournisseursOps,
  souscriptionsOps,
  souscripteursMoralesOps,
  souscripteursPhysiquesOps,
} from "@/lib/database/operations";
import type {
  AgenceAFG,
  DevisVitalis,
  DossierVitalis,
  Fournisseur,
  PointRelais,
  Souscription,
  SouscriptionFournisseur,
  SouscripteurMorale,
  SouscripteurPhysique,
} from "@/types/vitalis";
import { useEffect, useState } from "react";

// ============================================================
// HOOK GÉNÉRIQUE
// ============================================================
function useData<T>(
  fetcher: () => Promise<T[]>,
  deps: any[] = []
): {
  data: T[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, deps);

  return { data, loading, error, refresh };
}

// ============================================================
// HOOKS SPÉCIFIQUES
// ============================================================

export function useSouscripteursPhysiques() {
  return useData<SouscripteurPhysique>(souscripteursPhysiquesOps.getAll);
}

export function useSouscripteursMorales() {
  return useData<SouscripteurMorale>(souscripteursMoralesOps.getAll);
}

export function useSouscriptions() {
  return useData<Souscription>(souscriptionsOps.getAll);
}

export function useFournisseurs() {
  return useData<Fournisseur>(fournisseursOps.getAll);
}

export function useFournisseursAgrees() {
  return useData<Fournisseur>(fournisseursOps.getAgreesVitalis);
}

export function useDevis() {
  return useData<DevisVitalis>(devisOps.getAll);
}

export function useDevisBySouscription(souscriptionId: string) {
  return useData<DevisVitalis>(
    () => devisOps.getBySouscription(souscriptionId),
    [souscriptionId]
  );
}

export function useDossiers() {
  return useData<DossierVitalis>(dossiersOps.getAll);
}

export function usePointsRelais() {
  return useData<PointRelais>(pointsRelaisOps.getAll);
}

export function usePointsRelaisAbidjan() {
  return useData<PointRelais>(pointsRelaisOps.getAbidjan);
}

export function usePointsRelaisInterieur() {
  return useData<PointRelais>(pointsRelaisOps.getInterieur);
}

export function useAgencesAFG() {
  return useData<AgenceAFG>(agencesAFGOps.getAll);
}

export function useSouscriptionsFournisseurs(souscriptionId: string) {
  return useData<SouscriptionFournisseur>(
    () => souscriptionsFournisseursOps.getBySouscription(souscriptionId),
    [souscriptionId]
  );
}

// ============================================================
// HOOK SINGLE ITEM
// ============================================================
function useSingleData<T>(
  fetcher: () => Promise<T | undefined>,
  deps: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result || null);
    } catch (err) {
      setError(err as Error);
      console.error("Erreur chargement donnée:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, deps);

  return { data, loading, error, refresh };
}

export function useSouscription(id: string) {
  return useSingleData<Souscription>(
    () => souscriptionsOps.getById(id),
    [id]
  );
}

export function useFournisseur(id: string) {
  return useSingleData<Fournisseur>(
    () => fournisseursOps.getById(id),
    [id]
  );
}

export function useDevisById(id: string) {
  return useSingleData<DevisVitalis>(
    () => devisOps.getById(id),
    [id]
  );
}

export function useDossier(id: string) {
  return useSingleData<DossierVitalis>(
    () => dossiersOps.getById(id),
    [id]
  );
}
