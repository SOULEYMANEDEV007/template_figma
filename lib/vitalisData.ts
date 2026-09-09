// lib/vitalisData.ts
// Wrapper vers la base de données (lib/database)
// Conservé temporairement pour compatibilité

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
} from "./database/operations";

// ============================================================
// CONSTANTES
// ============================================================
export { VITALIS_CONFIG } from "@/types/vitalis";

// Banque AFG (constante)
export const AFG_BANK = {
  id: "AFG-001",
  code: "AFG",
  nom: "AFG Bank",
  siege: "Plateau, Abidjan",
  telephone: "+225 27 20 31 58 00",
  email: "contact@afgbank.ci",
  siteWeb: "https://afgbank.ci",
  logo: "/logos/afg-logo.png",
  agences: [] as any[],
};

// ============================================================
// HELPERS
// ============================================================

export async function loadAFGAgences() {
  AFG_BANK.agences = await agencesAFGOps.getAll();
}

export async function getDevisBySOuscription(souscriptionId: string) {
  return await devisOps.getBySouscription(souscriptionId);
}

export async function getFournisseursBySouscription(souscriptionId: string) {
  return await souscriptionsFournisseursOps.getFournisseursBySouscription(souscriptionId);
}

export async function getDossierBySouscription(souscriptionId: string) {
  return await dossiersOps.getBySouscription(souscriptionId);
}

// ============================================================
// EXPORTS COMPATIBILITÉ (avec await)
// ============================================================

export async function getMockData() {
  return {
    mockSouscripteursPhysiques: await souscripteursPhysiquesOps.getAll(),
    mockSouscripteursMorales: await souscripteursMoralesOps.getAll(),
    mockSouscriptionsVitalis: await souscriptionsOps.getAll(),
    mockFournisseursVitalis: await fournisseursOps.getAll(),
    mockSouscriptionsFournisseurs: await souscriptionsFournisseursOps.getAll(),
    mockDevisVitalis: await devisOps.getAll(),
    mockDossiersVitalis: await dossiersOps.getAll(),
    mockPointsRelais: await pointsRelaisOps.getAll(),
    mockAgencesAFG: await agencesAFGOps.getAll(),
  };
}

// Exports synchrones (promises)
export const mockSouscripteursPhysiques = souscripteursPhysiquesOps.getAll();
export const mockSouscripteursMorales = souscripteursMoralesOps.getAll();
export const mockSouscriptionsVitalis = souscriptionsOps.getAll();
export const mockFournisseursVitalis = fournisseursOps.getAll();
export const mockSouscriptionsFournisseurs = souscriptionsFournisseursOps.getAll();
export const mockDevisVitalis = devisOps.getAll();
export const mockDossiersVitalis = dossiersOps.getAll();
export const mockPointsRelais = pointsRelaisOps.getAll();
export const mockAgencesAFG = agencesAFGOps.getAll();
