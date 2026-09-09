// lib/database/db.ts
// Configuration de la base de données locale Dexie (IndexedDB)

import Dexie, { Table } from "dexie";
import type {
  AgenceAFG,
  ArticleDevis,
  DevisVitalis,
  DossierVitalis,
  Fournisseur,
  Livraison,
  PaiementVitalis,
  PointRelais,
  Souscription,
  SouscriptionFournisseur,
  SouscripteurMorale,
  SouscripteurPhysique,
} from "@/types/vitalis";

// ============================================================
// CLASSE DATABASE
// ============================================================
export class VitalisDatabase extends Dexie {
  // Tables
  souscripteursPhysiques!: Table<SouscripteurPhysique, string>;
  souscripteursMorales!: Table<SouscripteurMorale, string>;
  souscriptions!: Table<Souscription, string>;
  fournisseurs!: Table<Fournisseur, string>;
  souscriptionsFournisseurs!: Table<SouscriptionFournisseur, string>;
  devis!: Table<DevisVitalis, string>;
  dossiers!: Table<DossierVitalis, string>;
  paiements!: Table<PaiementVitalis, string>;
  pointsRelais!: Table<PointRelais, string>;
  livraisons!: Table<Livraison, string>;
  agencesAFG!: Table<AgenceAFG, string>;

  constructor() {
    super("VitalisDB");

    this.version(1).stores({
      // Souscripteurs
      souscripteursPhysiques: "id, nom, prenom, cni, email, telephone, dateNaissance",
      souscripteursMorales: "id, raisonSociale, rccm, numeroContribuable, email, telephone, secteurActivite",

      // Souscriptions
      souscriptions:
        "id, reference, souscripteurId, typeSouscripteur, banqueId, agenceBanqueId, dateCreation, dateDebut, statut, duree, montantTotal",

      // Fournisseurs
      fournisseurs: "id, code, nom, email, telephone, ville, agreVitalis, statut",

      // Associations souscription-fournisseur
      souscriptionsFournisseurs: "id, souscriptionId, fournisseurId, dateAssociation",

      // Devis
      devis: "id, reference, souscriptionId, fournisseurId, dateCreation, statut, totalHT, totalTTC",

      // Dossiers
      dossiers: "id, reference, souscriptionId, dateCreation, statut, montantTotal",

      // Paiements
      paiements: "id, reference, dossierId, souscriptionId, dateCreation, statut, montantTotal",

      // Points relais
      pointsRelais: "id, nom, ville, quartier, statut, type",

      // Livraisons
      livraisons: "id, reference, souscriptionId, dossierId, datePrevue, statut, type",

      // Agences AFG Bank
      agencesAFG: "id, code, nom, ville, statut",
    });
  }
}

// ============================================================
// INSTANCE GLOBALE
// ============================================================
export const db = new VitalisDatabase();

// ============================================================
// HELPER : RÉINITIALISER LA BASE
// ============================================================
export async function resetDatabase() {
  await db.delete();
  await db.open();
  console.log("✅ Base de données réinitialisée");
}

// ============================================================
// HELPER : VÉRIFIER SI LA BASE EST INITIALISÉE
// ============================================================
export async function isDatabaseSeeded(): Promise<boolean> {
  const count = await db.fournisseurs.count();
  return count > 0;
}
