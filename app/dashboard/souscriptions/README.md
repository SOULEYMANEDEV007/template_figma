# Gestion des Souscriptions Vitalis

## 📋 Vue d'ensemble

Ce module gère les souscriptions dans le cadre du programme **Vitalis** financé par **AFG Bank**, avec support du workflow multi-fournisseurs : **1 souscription → N fournisseurs → N devis**.

## 🗂️ Architecture des fichiers

```
souscriptions/
├── page.tsx                          # Liste originale (existant)
├── page-vitalis.tsx                  # Liste Vitalis avec stats devis ✨ NOUVEAU
├── creer/
│   ├── page.tsx                      # Formulaire création original
│   ├── page-vitalis.tsx              # Formulaire Vitalis multi-étapes ✨
│   └── README.md
├── [id]/
│   ├── page.tsx                      # Détail souscription
│   └── devis/
│       └── page.tsx                  # Gestion devis multiples ✨ NOUVEAU
└── README.md                         # Ce fichier
```

## ✨ Nouvelles fonctionnalités (Tâche #6)

### 1. Liste des souscriptions avec stats (`page-vitalis.tsx`)

**Features :**
- 📊 Affichage nombre fournisseurs / devis par souscription
- 📈 Barre de progression des devis (créés vs attendus)
- 🔍 Recherche par référence ou client
- 🎯 Filtrage par statut
- 🎨 Badge type souscripteur (Physique/Morale)
- 💰 Montant total agrégé de tous les devis
- 🔗 Liens directs vers gestion des devis

**Exemple d'affichage :**
```
VITALIS-SUB-001
Client PHY-001 • Personne Physique
─────────────────────────────────
Fournisseurs: 3
Devis créés: 3 / 3
Devis validés: 2
Durée: 36 mois
Montant total: 8 500 000 F
─────────────────────────────────
[Progression: ████████████ 100%]
[Voir la souscription] [Gérer les devis (3)]
```

### 2. Gestion des devis par souscription (`[id]/devis/page.tsx`)

**Features principales :**
- 📦 Vue consolidée de tous les fournisseurs associés
- 📊 Statistiques globales : total devis, validés, en attente, montant total
- 📄 Pour chaque fournisseur :
  - État du devis (créé ou à créer)
  - Référence et statut
  - Liste des articles avec remises
  - Montants HT/TTC
  - Conditions de livraison Vitalis
  - Actions : voir détail, imprimer
- ➕ Création de devis manquants
- 🖨️ Impression de tous les devis

**Structure d'une carte fournisseur :**
```
┌─────────────────────────────────────────────┐
│ [FO] Fournisseur A       [Validé]           │
├─────────────────────────────────────────────┤
│ Référence: DV-2024-001  Articles: 3         │
│ Montant HT: 2 000 000 F  TTC: 2 360 000 F   │
│                                              │
│ Articles:                                    │
│ • Ordinateur portable (2 × 800 000 F -5%)   │
│ • Imprimante (1 × 150 000 F)                │
│                                              │
│ Conditions livraison:                        │
│ Abidjan: 7j | Intérieur: 15j | Validité: 30j│
│                                              │
│ [Voir le détail] [🖨️]                        │
└─────────────────────────────────────────────┘
```

**Workflow affiché :**
```
💡 Chaque fournisseur doit créer son propre devis
💡 AFG Bank validera le dossier global (tous les devis)
💡 Montant total = somme de tous les devis
💡 Paiement individuel par fournisseur après validation
```

## 🔄 Migration progressive

### État actuel
- `page.tsx` : version originale (non modifiée) ✅
- `page-vitalis.tsx` : nouvelle version Vitalis ✨

### Quand migrer ?
Lorsque le workflow Vitalis est validé et testé :

```bash
# Étape 1: Sauvegarder l'ancien
mv page.tsx page-old.tsx

# Étape 2: Activer le nouveau
mv page-vitalis.tsx page.tsx

# Étape 3: Mettre à jour les liens internes
# Vérifier tous les <Link href="/dashboard/souscriptions">
```

## 📊 Helpers utilisés (depuis `lib/vitalisData.ts`)

```typescript
// Obtenir tous les devis d'une souscription
const devis = getDevisBySOuscription(souscriptionId);

// Obtenir les fournisseurs associés
const fournisseurs = getFournisseursBySouscription(souscriptionId);

// Obtenir une souscription
const souscription = mockSouscriptionsVitalis.find(s => s.id === id);
```

## 🎯 Règles métier implémentées

### Relation 1:N (Souscription → Fournisseurs)
- ✅ Une souscription peut avoir plusieurs fournisseurs
- ✅ Table de liaison `SouscriptionFournisseur` gère les associations
- ✅ Chaque fournisseur crée **1 seul devis** par souscription

### Banque unique
- ✅ AFG Bank (`AFG-001`) seule banque financeuse
- ✅ Sélection d'agence AFG obligatoire
- ✅ Pas de choix de banque dans le formulaire

### Types de souscripteurs
- ✅ Physique : nom, prénom, CNI, situation professionnelle
- ✅ Morale : entreprise, RCCM, n° contribuable, dirigeant

### Durée et conditions
- ✅ Durée par défaut : 36 mois (via `VITALIS_CONFIG`)
- ✅ Délais livraison Abidjan : 7 jours ouvrés
- ✅ Délais livraison Intérieur : 15 jours ouvrés
- ✅ Validité devis : 30 jours

## 🧪 Données mockées utilisables

```typescript
// 4 souscriptions avec fournisseurs multiples
mockSouscriptionsVitalis[0] // 3 fournisseurs, 3 devis
mockSouscriptionsVitalis[1] // 2 fournisseurs, 2 devis
mockSouscriptionsVitalis[2] // 2 fournisseurs, 2 devis
mockSouscriptionsVitalis[3] // 2 fournisseurs, 1 devis (incomplet)

// 5 fournisseurs agréés Vitalis
mockFournisseursVitalis.filter(f => f.agreVitalis === true)

// 9 associations souscription-fournisseur
mockSouscriptionsFournisseurs
```

## 🔗 Navigation

### Depuis la liste
```typescript
// Voir détail souscription
href="/dashboard/souscriptions/[id]"

// Gérer les devis (NOUVEAU)
href="/dashboard/souscriptions/[id]/devis"

// Créer nouvelle souscription
href="/dashboard/souscriptions/creer"
```

### Depuis la page devis
```typescript
// Voir un devis spécifique
href="/dashboard/devis/[devisId]"

// Retour à la souscription
router.back() ou href="/dashboard/souscriptions/[id]"
```

## 🎨 Composants visuels

### Badges de statut
```typescript
<StatutBadge statut="validee" />
// → Badge vert "Validée"

<DevisStatutBadge statut="en_attente_validation" />
// → Badge ambre "En attente"
```

### Icônes type souscripteur
- 👤 `<User />` : Personne Physique
- 🏢 `<Building2 />` : Personne Morale

### Cards interactives
- Hover effect avec `hover:shadow-md`
- Gradient amber pour badges montants
- Barre de progression animée pour devis

## 📈 Statistiques calculées

```typescript
// Dans page-vitalis.tsx
{
  nombreFournisseurs: 3,
  nombreDevis: 3,
  nombreDevisValides: 2,
  progression: 100% // (3/3)
}

// Dans [id]/devis/page.tsx
{
  totalDevis: 3,
  valides: 2,
  enAttente: 1,
  total: 8500000 // Somme TTC
}
```

## 🚀 Prochaines étapes

- [ ] Tâche #7 : Génération PDF souscription
- [ ] Tâche #8 : Génération PDF devis
- [ ] Formulaire création/édition devis par fournisseur
- [ ] Validation AFG Bank (vue consolidée)
- [ ] Notifications workflow (devis créé, validé, etc.)

## 🛠️ Maintenance

### Ajouter un nouveau statut
1. Mettre à jour le `config` dans `StatutBadge`
2. Ajouter l'option dans le filtre de `page-vitalis.tsx`
3. Documenter dans `types/vitalis.ts`

### Modifier les conditions Vitalis
Toutes les constantes sont centralisées dans `types/vitalis.ts` :
```typescript
export const VITALIS_CONFIG = {
  DUREE_PAR_DEFAUT: 36, // mois
  DELAI_LIVRAISON_ABIDJAN: "7 jours ouvrés",
  DELAI_LIVRAISON_INTERIEUR: "15 jours ouvrés",
  VALIDITE_DEVIS: "30 jours",
  BANQUE_FINANCEUSE: "AFG-001"
}
```

## ⚠️ Points d'attention

- **Ne jamais** lier directement un `fournisseurId` à une souscription
- **Toujours** passer par `SouscriptionFournisseur` (table de liaison)
- **Toujours** utiliser `banqueId: "AFG-001"` pour les souscriptions Vitalis
- **Toujours** vérifier `agreVitalis: true` avant d'associer un fournisseur

## 📞 Support

Pour toute question sur l'architecture Vitalis, consulter :
- `ANALYSE_ARCHITECTURE_VITALIS.md` : écarts avec ancien modèle
- `types/README.md` : documentation des types
- `lib/README_VITALIS_DATA.md` : guide des données mockées
