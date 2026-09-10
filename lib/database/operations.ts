// @ts-nocheck
// lib/database/operations.ts
// Opérations CRUD pour la base de données Vitalis

import type {
  DevisVitalis,
  DossierVitalis,
  Fournisseur,
  PointRelais,
  Souscription,
  SouscriptionFournisseur,
  SouscripteurMorale,
  SouscripteurPhysique,
} from "@/types/vitalis";
import { db } from "./db";

// ============================================================
// SOUSCRIPTEURS PHYSIQUES
// ============================================================
export const souscripteursPhysiquesOps = {
  getAll: () => db.souscripteursPhysiques.toArray(),
  
  getById: (id: string) => db.souscripteursPhysiques.get(id),
  
  search: async (query: string) => {
    const q = query.toLowerCase();
    return await db.souscripteursPhysiques
      .filter(
        (s) =>
          s.nom.toLowerCase().includes(q) ||
          s.prenom.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.cni.toLowerCase().includes(q) ||
          s.telephone.includes(q)
      )
      .toArray();
  },

  create: (data: SouscripteurPhysique) => db.souscripteursPhysiques.add(data),
  
  update: (id: string, data: Partial<SouscripteurPhysique>) =>
    db.souscripteursPhysiques.update(id, data),
  
  delete: (id: string) => db.souscripteursPhysiques.delete(id),
};

// ============================================================
// SOUSCRIPTEURS MORALES
// ============================================================
export const souscripteursMoralesOps = {
  getAll: () => db.souscripteursMorales.toArray(),
  
  getById: (id: string) => db.souscripteursMorales.get(id),
  
  search: async (query: string) => {
    const q = query.toLowerCase();
    return await db.souscripteursMorales
      .filter(
        (s) =>
          s.raisonSociale.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.rccm.toLowerCase().includes(q) ||
          s.numeroContribuable.includes(q) ||
          s.telephone.includes(q)
      )
      .toArray();
  },

  create: (data: SouscripteurMorale) => db.souscripteursMorales.add(data),
  
  update: (id: string, data: Partial<SouscripteurMorale>) =>
    db.souscripteursMorales.update(id, data),
  
  delete: (id: string) => db.souscripteursMorales.delete(id),
};

// ============================================================
// SOUSCRIPTIONS
// ============================================================
export const souscriptionsOps = {
  getAll: () => db.souscriptions.orderBy("dateCreation").reverse().toArray(),
  
  getById: (id: string) => db.souscriptions.get(id),
  
  getByReference: (reference: string) =>
    db.souscriptions.where("reference").equals(reference).first(),
  
  getByStatut: (statut: string) =>
    db.souscriptions.where("statut").equals(statut).toArray(),
  
  create: (data: Souscription) => db.souscriptions.add(data),
  
  update: (id: string, data: Partial<Souscription>) =>
    db.souscriptions.update(id, data),
  
  delete: (id: string) => db.souscriptions.delete(id),
  
  // Stats
  count: () => db.souscriptions.count(),
  
  countByStatut: (statut: string) =>
    db.souscriptions.where("statut").equals(statut).count(),
};

// ============================================================
// FOURNISSEURS
// ============================================================
export const fournisseursOps = {
  getAll: () => db.fournisseurs.toArray(),
  
  getById: (id: string) => db.fournisseurs.get(id),
  
  getActifs: () => db.fournisseurs.where("statut").equals("actif").toArray(),
  
  getAgreesVitalis: () =>
    db.fournisseurs.where("agreVitalis").equals(1).toArray(),
  
  search: async (query: string) => {
    const q = query.toLowerCase();
    return await db.fournisseurs
      .filter(
        (f) =>
          f.nom.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.ville.toLowerCase().includes(q)
      )
      .toArray();
  },

  create: (data: Fournisseur) => db.fournisseurs.add(data),
  
  update: (id: string, data: Partial<Fournisseur>) =>
    db.fournisseurs.update(id, data),
  
  delete: (id: string) => db.fournisseurs.delete(id),
  
  // Stats
  count: () => db.fournisseurs.count(),
  
  countAgreesVitalis: () =>
    db.fournisseurs.where("agreVitalis").equals(1).count(),
};

// ============================================================
// SOUSCRIPTIONS-FOURNISSEURS (TABLE LIAISON)
// ============================================================
export const souscriptionsFournisseursOps = {
  getAll: () => db.souscriptionsFournisseurs.toArray(),
  
  getBySouscription: (souscriptionId: string) =>
    db.souscriptionsFournisseurs
      .where("souscriptionId")
      .equals(souscriptionId)
      .toArray(),
  
  getByFournisseur: (fournisseurId: string) =>
    db.souscriptionsFournisseurs
      .where("fournisseurId")
      .equals(fournisseurId)
      .toArray(),
  
  create: (data: SouscriptionFournisseur) =>
    db.souscriptionsFournisseurs.add(data),
  
  delete: (id: string) => db.souscriptionsFournisseurs.delete(id),
  
  // Helpers
  getFournisseursBySouscription: async (souscriptionId: string) => {
    const associations = await souscriptionsFournisseursOps.getBySouscription(
      souscriptionId
    );
    const fournisseurIds = associations.map((a) => a.fournisseurId);
    return await db.fournisseurs.where("id").anyOf(fournisseurIds).toArray();
  },
};

// ============================================================
// DEVIS
// ============================================================
export const devisOps = {
  getAll: () => db.devis.orderBy("dateCreation").reverse().toArray(),
  
  getById: (id: string) => db.devis.get(id),
  
  getBySouscription: (souscriptionId: string) =>
    db.devis.where("souscriptionId").equals(souscriptionId).toArray(),
  
  getByFournisseur: (fournisseurId: string) =>
    db.devis.where("fournisseurId").equals(fournisseurId).toArray(),
  
  getByStatut: (statut: string) =>
    db.devis.where("statut").equals(statut).toArray(),
  
  create: (data: DevisVitalis) => db.devis.add(data),
  
  update: (id: string, data: Partial<DevisVitalis>) =>
    db.devis.update(id, data),
  
  delete: (id: string) => db.devis.delete(id),
  
  // Stats
  count: () => db.devis.count(),
  
  countByStatut: (statut: string) =>
    db.devis.where("statut").equals(statut).count(),
};

// ============================================================
// DOSSIERS
// ============================================================
export const dossiersOps = {
  getAll: () => db.dossiers.orderBy("dateCreation").reverse().toArray(),
  
  getById: (id: string) => db.dossiers.get(id),
  
  getBySouscription: (souscriptionId: string) =>
    db.dossiers.where("souscriptionId").equals(souscriptionId).first(),
  
  getByStatut: (statut: string) =>
    db.dossiers.where("statut").equals(statut).toArray(),
  
  create: (data: DossierVitalis) => db.dossiers.add(data),
  
  update: (id: string, data: Partial<DossierVitalis>) =>
    db.dossiers.update(id, data),
  
  delete: (id: string) => db.dossiers.delete(id),
  
  // Stats
  count: () => db.dossiers.count(),
  
  countByStatut: (statut: string) =>
    db.dossiers.where("statut").equals(statut).count(),
};

// ============================================================
// POINTS RELAIS
// ============================================================
export const pointsRelaisOps = {
  getAll: () => db.pointsRelais.toArray(),
  
  getById: (id: string) => db.pointsRelais.get(id),
  
  getByVille: (ville: string) =>
    db.pointsRelais.where("ville").equals(ville).toArray(),
  
  getActifs: () => db.pointsRelais.where("statut").equals("actif").toArray(),
  
  getAbidjan: () => db.pointsRelais.where("ville").equals("Abidjan").toArray(),
  
  getInterieur: () =>
    db.pointsRelais.where("ville").notEqual("Abidjan").toArray(),
  
  create: (data: PointRelais) => db.pointsRelais.add(data),
  
  update: (id: string, data: Partial<PointRelais>) =>
    db.pointsRelais.update(id, data),
  
  delete: (id: string) => db.pointsRelais.delete(id),
  
  // Stats
  count: () => db.pointsRelais.count(),
  
  countByVille: (ville: string) =>
    db.pointsRelais.where("ville").equals(ville).count(),
};

// ============================================================
// AGENCES AFG BANK
// ============================================================
export const agencesAFGOps = {
  getAll: () => db.agencesAFG.toArray(),
  
  getById: (id: string) => db.agencesAFG.get(id),
  
  getActives: () => db.agencesAFG.where("statut").equals("actif").toArray(),
  
  getByVille: (ville: string) =>
    db.agencesAFG.where("ville").equals(ville).toArray(),
  
  create: (data: AgenceAFG) => db.agencesAFG.add(data),
  
  update: (id: string, data: Partial<AgenceAFG>) =>
    db.agencesAFG.update(id, data),
  
  delete: (id: string) => db.agencesAFG.delete(id),
};
