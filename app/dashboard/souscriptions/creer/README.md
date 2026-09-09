# Formulaire de création de souscription Vitalis

## 📁 Fichiers

- `page.tsx` : Ancien formulaire (conservé pour compatibilité)
- `page-vitalis.tsx` : Nouveau formulaire Vitalis ✅ **RECOMMANDÉ**

## 🔄 Migration

Pour activer le nouveau formulaire Vitalis :

```bash
# Renommer l'ancien
mv page.tsx page-old.tsx

# Activer le nouveau
mv page-vitalis.tsx page.tsx
```

## ✨ Fonctionnalités du formulaire Vitalis

### Étape 1 : Recherche client
- ✅ Recherche multi-critères (nom, email, CNI, RCCM, téléphone)
- ✅ Évite les doublons
- ✅ Affiche les informations du client trouvé
- ✅ Permet la création d'un nouveau client si non trouvé

### Étape 2 : Type & Identité
- ✅ Sélection type : Personne Physique / Personne Morale
- ✅ Formulaires dynamiques selon le type
- ✅ Champs spécifiques à chaque type

#### Personne Physique
- Nom, prénom, CNI
- Date et lieu de naissance
- Situation professionnelle (Salarié/Fonctionnaire)
- Secteur d'activité
- Situation matrimoniale
- Entreprise employeur
- Coordonnées complètes

#### Personne Morale
- Nom entreprise
- RCCM, compte contribuable
- Secteur d'activité
- Directeur Général
- Nombre d'employés, capital social
- Date de création
- Coordonnées complètes

### Étape 3 : Fournisseurs
- ✅ **Sélection multiple** de fournisseurs
- ✅ Affiche uniquement les fournisseurs agréés Vitalis
- ✅ Interface visuelle avec badges
- ✅ Récapitulatif des fournisseurs sélectionnés

### Étape 4 : Configuration
- ✅ **AFG Bank unique** (pas de sélection, info seulement)
- ✅ Sélection agence AFG Bank
- ✅ Date de début
- ✅ **Durée 36 mois par défaut**
- ✅ Observations

### Étape 5 : Confirmation
- ✅ Récapitulatif complet
- ✅ Affiche tous les fournisseurs
- ✅ Validation finale

## 🎯 Points clés

### AFG Bank unique
```typescript
// Pas de sélection de banque
// AFG Bank est hardcodée
const banqueId = "AFG-001"; // Toujours
```

### Multiple fournisseurs
```typescript
// État : array de fournisseurIds
const [fournisseursSelectionnes, setFournisseursSelectionnes] = useState<string[]>([]);

// Toggle selection
const toggleFournisseur = (fournisseurId: string) => {
  setFournisseursSelectionnes(prev =>
    prev.includes(fournisseurId)
      ? prev.filter(id => id !== fournisseurId)
      : [...prev, fournisseurId]
  );
};
```

### Type souscripteur dynamique
```typescript
// État
const [typeSouscripteur, setTypeSouscripteur] = useState<TypeSouscripteur | "">("");

// Affichage conditionnel
{typeSouscripteur === "physique" && (
  <FormulairePersonnePhysique />
)}

{typeSouscripteur === "morale" && (
  <FormulairePersonneMorale />
)}
```

### Durée par défaut
```typescript
import { VITALIS_CONFIG } from "@/types/vitalis";

const [duree, setDuree] = useState(VITALIS_CONFIG.DUREE_PAR_DEFAUT); // 36
```

## 🔍 Recherche client

La recherche vérifie :
1. **Personnes physiques** : nom, prénom, email, CNI, téléphone
2. **Personnes morales** : nom entreprise, email, RCCM, téléphone

```typescript
const handleRechercheClient = () => {
  const search = rechercheClient.toLowerCase();
  
  // Recherche physique
  const physique = mockSouscripteursPhysiques.find(s =>
    s.nom.toLowerCase().includes(search) ||
    s.prenom.toLowerCase().includes(search) ||
    // ...
  );

  // Recherche morale
  const morale = mockSouscripteursMorales.find(s =>
    s.nomEntreprise.toLowerCase().includes(search) ||
    // ...
  );
};
```

## 📋 Validation des étapes

```typescript
const canNext = () => {
  if (step === 0) {
    return clientExistant || creerNouveauClient;
  }
  if (step === 1) {
    if (!typeSouscripteur) return false;
    if (typeSouscripteur === "physique") {
      return formPhysique.nom && formPhysique.prenom && 
             formPhysique.numeroCNI && formPhysique.telephone;
    } else {
      return formMorale.nomEntreprise && formMorale.rccm && 
             formMorale.telephone;
    }
  }
  if (step === 2) {
    return fournisseursSelectionnes.length > 0;
  }
  if (step === 3) {
    return agenceAFGId && dateDebut && duree > 0;
  }
  return true;
};
```

## 💾 Soumission

```typescript
const handleSubmit = async (asBrouillon = false) => {
  setSubmitting(true);
  
  // Simuler appel API
  await new Promise(r => setTimeout(r, 1200));
  
  const ref = `SUB-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  
  toast.success(
    asBrouillon
      ? `Brouillon enregistré — ${ref}`
      : `Souscription ${ref} créée avec succès ! ${fournisseursSelectionnes.length} fournisseur(s) associé(s).`,
    { duration: 5000 }
  );
  
  router.push("/dashboard/souscriptions");
};
```

## 🎨 Design

- Utilise les composants UI existants (`btn-ldf-primary`, `ldf-input`, etc.)
- Design cohérent avec le reste de l'application
- Responsive mobile-first
- Indicateur de progression visuel
- Messages d'aide contextuels

## 🚀 Prochaines étapes

1. ✅ Remplacer `page.tsx` par `page-vitalis.tsx`
2. ⏳ Intégrer avec l'API backend
3. ⏳ Ajouter validation Zod
4. ⏳ Implémenter upload documents (attestation mariage, etc.)
5. ⏳ Générer PDF de souscription après création

## 📚 Documentation liée

- Types : `/types/vitalis.ts`
- Données mockées : `/lib/vitalisData.ts`
- Documentation types : `/types/README.md`

---

**Version** : 2.0 (Modèle Vitalis)  
**Dernière mise à jour** : 9 septembre 2026
