# Guide des types TypeScript - Programme Vitalis

## 📁 Structure des types

### `vitalis.ts` — Types principaux du programme Vitalis
Types métier alignés sur le workflow AFG Bank :
- ✅ 1 Souscription → N Fournisseurs → N Devis
- ✅ AFG Bank unique
- ✅ Type Souscripteur (Physique/Morale)
- ✅ Workflow complet de financement

**Utilisation recommandée pour toutes les nouvelles fonctionnalités.**

### `ldf.ts` — Types existants (compatibilité)
Types conservés pour la compatibilité avec le code existant.
Contient les re-exports des types Vitalis pour faciliter la migration.

### `index.ts` — Point d'entrée
Exports centralisés. Importer depuis `@/types` pour accéder à tous les types.

---

## 🎯 Utilisation des types

### Import recommandé
```typescript
// ✅ Bon - Import depuis @/types
import type { 
  SouscripteurPhysique,
  SouscripteurMorale,
  Souscription,
  VITALIS_CONFIG 
} from "@/types";

// ou depuis vitalis directement
import type { SouscripteurPhysique } from "@/types/vitalis";
```

### Type Souscripteur dynamique

Le souscripteur peut être soit une **Personne Physique**, soit une **Personne Morale**.

```typescript
import type { Souscripteur, TypeSouscripteur } from "@/types";
import { isSouscripteurPhysique, isSouscripteurMorale } from "@/types";

function afficherSouscripteur(souscripteur: Souscripteur) {
  if (isSouscripteurPhysique(souscripteur)) {
    // TypeScript sait maintenant que c'est une Personne Physique
    console.log(souscripteur.nom, souscripteur.prenom);
    console.log(souscripteur.numeroCNI);
  } else if (isSouscripteurMorale(souscripteur)) {
    // TypeScript sait maintenant que c'est une Personne Morale
    console.log(souscripteur.nomEntreprise);
    console.log(souscripteur.rccm);
  }
}
```

### Workflow Souscription → Fournisseurs → Devis

```typescript
import type { 
  Souscription, 
  SouscriptionFournisseur,
  Devis 
} from "@/types";

// 1. Créer une souscription
const souscription: Souscription = {
  id: "SUB-001",
  reference: "SUB-2026-00001",
  souscripteurId: "SCP-001",
  typeSouscripteur: "physique",
  banqueId: "AFG-001", // Toujours AFG Bank
  duree: 36, // 36 mois par défaut
  montantTotal: 0,
  statut: "brouillon",
  // ...
};

// 2. Associer plusieurs fournisseurs
const associations: SouscriptionFournisseur[] = [
  {
    id: "SF-001",
    souscriptionId: "SUB-001",
    fournisseurId: "FRN-001",
    ordre: 1,
    statut: "en_attente",
    dateAssociation: "2026-09-09",
  },
  {
    id: "SF-002",
    souscriptionId: "SUB-001",
    fournisseurId: "FRN-002",
    ordre: 2,
    statut: "en_attente",
    dateAssociation: "2026-09-09",
  },
];

// 3. Chaque fournisseur crée son devis
const devis1: Devis = {
  id: "DEV-001",
  reference: "DEV-2026-00001",
  souscriptionId: "SUB-001",
  fournisseurId: "FRN-001",
  articles: [
    {
      id: "ART-001",
      designation: "Manuel scolaire",
      reference: "MAN-001",
      quantite: 10,
      prixUnitaire: 5000,
      remise: 10,
      montantHT: 45000, // 10 * 5000 * (1 - 0.1)
    },
  ],
  totalHT: 45000,
  tva: 3915,
  totalTTC: 48915,
  statut: "brouillon",
  // ...
};
```

### Constantes Vitalis

```typescript
import { VITALIS_CONFIG } from "@/types";

// Utiliser les constantes dans le code
const dureeParDefaut = VITALIS_CONFIG.DUREE_PAR_DEFAUT; // 36 mois
const delaiAbidjan = VITALIS_CONFIG.DELAI_LIVRAISON_ABIDJAN; // "7 jours ouvrés"
const banqueId = VITALIS_CONFIG.BANQUE_FINANCEUSE; // "AFG-001"
```

---

## 🔄 Migration progressive

### Étape 1 : Identifier le code à migrer
Chercher les utilisations de l'ancien modèle :
- `fournisseurId` dans `Souscription`
- Sélection de banques multiples
- Absence de type souscripteur

### Étape 2 : Utiliser les nouveaux types
```typescript
// ❌ Ancien (1 souscription = 1 fournisseur)
const souscription = {
  fournisseurId: "FRN-001",
  banqueId: "BNQ-002", // Plusieurs banques
};

// ✅ Nouveau (1 souscription → N fournisseurs)
const souscription: Souscription = {
  banqueId: "AFG-001", // Toujours AFG
  // Pas de fournisseurId ici
};

const associations: SouscriptionFournisseur[] = [
  { souscriptionId: "SUB-001", fournisseurId: "FRN-001", ordre: 1 },
  { souscriptionId: "SUB-001", fournisseurId: "FRN-002", ordre: 2 },
];
```

### Étape 3 : Adapter les composants
```typescript
// Dans un composant
import type { Souscription, SouscriptionFournisseur } from "@/types";

function SouscriptionDetail({ 
  souscription, 
  fournisseurs 
}: { 
  souscription: Souscription;
  fournisseurs: SouscriptionFournisseur[];
}) {
  return (
    <div>
      <h2>Souscription {souscription.reference}</h2>
      <p>Banque : AFG Bank</p>
      <h3>Fournisseurs associés :</h3>
      <ul>
        {fournisseurs.map(f => (
          <li key={f.id}>Fournisseur {f.fournisseurId}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 Référence rapide

### Types principaux

| Type | Description | Fichier |
|------|-------------|---------|
| `Souscripteur` | Union Physique \| Morale | `vitalis.ts` |
| `SouscripteurPhysique` | Personne physique | `vitalis.ts` |
| `SouscripteurMorale` | Personne morale | `vitalis.ts` |
| `Souscription` | Souscription Vitalis | `vitalis.ts` |
| `SouscriptionFournisseur` | Liaison souscription-fournisseur | `vitalis.ts` |
| `FournisseurVitalis` | Fournisseur agréé | `vitalis.ts` |
| `Devis` | Devis par fournisseur | `vitalis.ts` |
| `Dossier` | Dossier global AFG | `vitalis.ts` |
| `Paiement` | Financement AFG | `vitalis.ts` |
| `Livraison` | Préparation et livraison | `vitalis.ts` |
| `PointRelais` | Point de retrait | `vitalis.ts` |
| `AgenceAFG` | Agence AFG Bank | `vitalis.ts` |

### Statuts

| Entité | Statuts possibles |
|--------|-------------------|
| Souscription | `brouillon` `soumise` `en_traitement` `validee` `rejetee` `financee` `en_preparation` `livree` `terminee` |
| Devis | `brouillon` `envoye` `en_attente_validation` `valide` `refuse` `expire` |
| Dossier | `recu` `en_analyse` `informations_demandees` `valide` `rejete` |
| Paiement | `en_attente` `valide_afg` `en_cours_transfert` `transfert_client_effectue` `transfert_fournisseur_effectue` `termine` |
| Préparation | `en_attente` `en_preparation` `prete` `expediee` `livree` `probleme` |

---

## ⚠️ Règles importantes

1. **AFG Bank unique** : Ne jamais permettre la sélection d'une autre banque
2. **Type souscripteur obligatoire** : Toujours spécifier `physique` ou `morale`
3. **Plusieurs fournisseurs** : Utiliser `SouscriptionFournisseur` pour les associations
4. **Durée 36 mois** : Valeur par défaut via `VITALIS_CONFIG.DUREE_PAR_DEFAUT`
5. **Remises détaillées** : Toujours documenter les remises dans les devis

---

## 🛠️ Outils de développement

### Validation TypeScript
```bash
# Vérifier les types
npm run typecheck

# Ou avec tsc directement
npx tsc --noEmit
```

### Génération de types depuis API
Si vous avez une API backend, utilisez des outils comme :
- `openapi-typescript` pour OpenAPI/Swagger
- `quicktype` pour JSON Schema

---

## 📖 Ressources

- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

**Dernière mise à jour** : 9 septembre 2026  
**Version** : 2.0 (Modèle Vitalis AFG Bank)
