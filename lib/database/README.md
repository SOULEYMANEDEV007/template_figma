# Base de Données Locale Vitalis (IndexedDB)

## 📋 Vue d'ensemble

Base de données locale **persistante** utilisant **IndexedDB** via **Dexie.js** pour stocker toutes les données Vitalis côté client. Les données survivent aux rechargements de page et sont disponibles hors ligne.

## 🎯 Avantages

- ✅ **Persistance** : Données conservées entre sessions
- ✅ **Performance** : Accès rapide sans latence réseau
- ✅ **Hors ligne** : Fonctionnel sans connexion
- ✅ **CRUD complet** : Créer, lire, modifier, supprimer
- ✅ **Recherche** : Filtrage et recherche avancés
- ✅ **Démo réaliste** : Parfait pour présentation client

## 🗂️ Structure

```
lib/database/
├── db.ts              # Configuration Dexie + schémas
├── seed.ts            # Données initiales (fournisseurs, points relais)
├── operations.ts      # CRUD helpers
└── README.md          # Cette documentation

hooks/
└── useDatabase.ts     # Hook React initialisation

providers/
└── DatabaseProvider.tsx  # Provider global
```

## 📊 Tables

| Table | Description | Clé primaire |
|-------|-------------|--------------|
| `souscripteursPhysiques` | Personnes physiques | `id` |
| `souscripteursMorales` | Personnes morales | `id` |
| `souscriptions` | Souscriptions Vitalis | `id` |
| `fournisseurs` | Fournisseurs agréés | `id` |
| `souscriptionsFournisseurs` | Liaison N:N | `id` |
| `devis` | Devis par fournisseur | `id` |
| `dossiers` | Dossiers consolidés | `id` |
| `paiements` | Paiements multi-fournisseurs | `id` |
| `pointsRelais` | Points relais livraison | `id` |
| `livraisons` | Livraisons | `id` |
| `agencesAFG` | Agences AFG Bank | `id` |

## 🚀 Utilisation

### 1. Initialisation automatique

Le `DatabaseProvider` initialise la DB au démarrage de l'app.

```tsx
// app/layout.tsx
import { DatabaseProvider } from "@/providers/DatabaseProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DatabaseProvider>
          {children}
        </DatabaseProvider>
      </body>
    </html>
  );
}
```

### 2. Utilisation dans les composants

```tsx
import { fournisseursOps } from "@/lib/database/operations";
import { useEffect, useState } from "react";

export default function FournisseursPage() {
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const loadFournisseurs = async () => {
      const data = await fournisseursOps.getAll();
      setFournisseurs(data);
    };
    loadFournisseurs();
  }, []);

  return (
    <div>
      {fournisseurs.map(f => (
        <div key={f.id}>{f.nom}</div>
      ))}
    </div>
  );
}
```

### 3. Opérations CRUD

#### Lire

```tsx
// Tous les fournisseurs
const fournisseurs = await fournisseursOps.getAll();

// Par ID
const fournisseur = await fournisseursOps.getById("FOUR-LDF-001");

// Agréés Vitalis uniquement
const agreesVitalis = await fournisseursOps.getAgreesVitalis();

// Recherche
const results = await fournisseursOps.search("librairie");
```

#### Créer

```tsx
const nouveauFournisseur = {
  id: "FOUR-NEW-001",
  code: "NEWCO",
  nom: "Nouveau Fournisseur",
  email: "contact@nouveau.ci",
  telephone: "+225 27 00 00 00 00",
  ville: "Abidjan",
  agreVitalis: true,
  statut: "actif",
  // ... autres champs
};

await fournisseursOps.create(nouveauFournisseur);
```

#### Modifier

```tsx
await fournisseursOps.update("FOUR-LDF-001", {
  telephone: "+225 27 21 35 75 99",
  agreVitalis: true,
});
```

#### Supprimer

```tsx
await fournisseursOps.delete("FOUR-OLD-001");
```

## 📦 Données Initiales (Seed)

Au premier démarrage, la base est remplie avec :

### Fournisseurs Agréés Vitalis (5)
1. **Librairie de France Groupe** (LDF-CI)
   - Logo : `/logos/ldf-logo.png`
   - Secteur : Fournitures scolaires
   - Contrat AFG : CONT-AFG-LDF-2023-001
   - Partenariat : 24 mois

2. **Drocolor** (DROCO)
   - Secteur : Informatique/Électronique
   - Contrat : CONT-AFG-DRO-2023-002
   - Partenariat : 18 mois

3. **SMART TECHNOLOGIE** (SMART)
   - Secteur : Solutions digitales
   - Contrat : CONT-AFG-SMT-2023-003
   - Partenariat : 12 mois

4. **NASKO** (NASKO)
   - Secteur : Meubles/Équipements bureau
   - Contrat : CONT-AFG-NAS-2023-004
   - Partenariat : 15 mois

5. **CARREFOUR** (CARRF)
   - Secteur : Grande distribution
   - Contrat : CONT-AFG-CAR-2023-005
   - Partenariat : 20 mois

### Points Relais (11)

**Abidjan (5 quartiers) :**
- Plateau Centre
- Cocody Angré
- Marcory Zone 4
- Yopougon Maroc
- Adjamé 220 logements

**Intérieur (6 villes) :**
- Bouaké
- Yamoussoukro
- San-Pedro
- Korhogo
- Daloa

### Agences AFG Bank (4)
- Plateau (Abidjan)
- Cocody (Abidjan)
- Bouaké
- Yamoussoukro

## 🔧 Opérations Avancées

### Recherche multi-critères

```tsx
// Recherche souscripteurs physiques
const results = await souscripteursPhysiquesOps.search("kouassi");
// Cherche dans : nom, prenom, email, CNI, telephone

// Recherche points relais par ville
const abidjan = await pointsRelaisOps.getByVille("Abidjan");
const interieur = await pointsRelaisOps.getInterieur();
```

### Statistiques

```tsx
// Nombre total de souscriptions
const total = await souscriptionsOps.count();

// Nombre par statut
const enAttente = await souscriptionsOps.countByStatut("en_attente");
const validees = await souscriptionsOps.countByStatut("validee");

// Fournisseurs agréés Vitalis
const nbAgrees = await fournisseursOps.countAgreesVitalis();
```

### Relations

```tsx
// Fournisseurs d'une souscription
const fournisseurs = await souscriptionsFournisseursOps.getFournisseursBySouscription(
  "VITALIS-SUB-001"
);

// Devis d'une souscription
const devis = await devisOps.getBySouscription("VITALIS-SUB-001");

// Dossier d'une souscription
const dossier = await dossiersOps.getBySouscription("VITALIS-SUB-001");
```

## 🔄 Workflow Complet Exemple

```tsx
// 1. Créer un souscripteur physique
const souscripteurId = await souscripteursPhysiquesOps.create({
  id: crypto.randomUUID(),
  nom: "DIALLO",
  prenom: "Ibrahim",
  // ... autres champs
});

// 2. Créer une souscription
const souscriptionId = await souscriptionsOps.create({
  id: crypto.randomUUID(),
  reference: "VITALIS-SUB-NEW",
  souscripteurId,
  typeSouscripteur: "physique",
  banqueId: "AFG-001",
  // ... autres champs
});

// 3. Associer des fournisseurs
const fournisseurIds = ["FOUR-LDF-001", "FOUR-DRO-002"];
for (const fournisseurId of fournisseurIds) {
  await souscriptionsFournisseursOps.create({
    id: crypto.randomUUID(),
    souscriptionId,
    fournisseurId,
    dateAssociation: new Date().toISOString(),
  });
}

// 4. Créer des devis
for (const fournisseurId of fournisseurIds) {
  await devisOps.create({
    id: crypto.randomUUID(),
    reference: `DV-${Date.now()}`,
    souscriptionId,
    fournisseurId,
    articles: [],
    totalHT: 0,
    totalTTC: 0,
    statut: "brouillon",
    // ... autres champs
  });
}

// 5. Créer un dossier global
await dossiersOps.create({
  id: crypto.randomUUID(),
  reference: `DOSS-VIT-${Date.now()}`,
  souscriptionId,
  devisIds: [], // IDs des devis créés
  statut: "en_attente",
  // ... autres champs
});
```

## 🧹 Maintenance

### Réinitialiser la base

```tsx
import { resetDatabase } from "@/lib/database/db";
import { seedDatabase } from "@/lib/database/seed";

// Supprimer toutes les données
await resetDatabase();

// Réinjecter les données initiales
await seedDatabase();
```

### Exporter les données

```tsx
import { db } from "@/lib/database/db";

const exportData = async () => {
  const data = {
    souscriptions: await db.souscriptions.toArray(),
    fournisseurs: await db.fournisseurs.toArray(),
    devis: await db.devis.toArray(),
    // ... autres tables
  };
  
  const json = JSON.stringify(data, null, 2);
  
  // Télécharger le fichier
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vitalis-export-${Date.now()}.json`;
  a.click();
};
```

### Importer des données

```tsx
const importData = async (jsonData) => {
  const data = JSON.parse(jsonData);
  
  await db.souscriptions.bulkAdd(data.souscriptions);
  await db.fournisseurs.bulkAdd(data.fournisseurs);
  // ... autres tables
};
```

## 🐛 Debugging

### Inspecter la base dans Chrome DevTools

1. Ouvrir DevTools (F12)
2. Onglet "Application"
3. Section "Storage" → "IndexedDB"
4. Base "VitalisDB"

### Logs

```tsx
// Activer les logs Dexie
import Dexie from "dexie";
Dexie.debug = true;
```

## ⚠️ Limitations

- **Taille max** : ~50 MB (dépend du navigateur)
- **Synchronisation** : Pas de sync backend automatique
- **Sécurité** : Données stockées en clair côté client
- **Concurrent** : Pas de gestion conflits multi-onglets

## 🚀 Prochaines étapes

- [ ] Génération PDFs réels (jsPDF)
- [ ] Export/Import JSON complet
- [ ] Sync backend optionnel (API REST)
- [ ] Gestion conflits multi-onglets
- [ ] Chiffrement données sensibles
- [ ] Notifications changements temps réel
