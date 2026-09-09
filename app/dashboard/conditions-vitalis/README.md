# Page Conditions Vitalis

## 📄 Description

Page complète affichant toutes les conditions générales du programme de financement Vitalis AFG Bank, avec fonctionnalité d'impression optimisée.

## 🎯 Fonctionnalités

### Affichage des conditions
- ✅ 9 sections détaillées
- ✅ Présentation claire et structurée
- ✅ Icônes par section pour meilleure lisibilité
- ✅ Mise en page responsive

### Impression PDF
- ✅ Bouton d'impression dédié
- ✅ Mise en page optimisée pour l'impression
- ✅ En-tête et pied de page automatiques
- ✅ Préservation des couleurs
- ✅ Gestion des sauts de page
- ✅ Date et heure d'impression

### Sections du document

1. **Présentation du Programme Vitalis**
   - Qu'est-ce que Vitalis ?
   - Objectifs du programme

2. **Conditions d'Éligibilité**
   - Personnes Physiques
   - Personnes Morales
   - Documents requis

3. **Montants et Durées de Financement**
   - Montants finançables
   - Durée de remboursement
   - Taux et frais

4. **Processus de Souscription**
   - Étapes du processus
   - Délais de traitement

5. **Fournisseurs Agréés**
   - Critères d'agrément
   - Liste des fournisseurs

6. **Modalités de Remboursement**
   - Mode de remboursement
   - En cas de difficultés

7. **Droits et Obligations**
   - Droits du client
   - Obligations du client

8. **Résiliation et Litiges**
   - Cas de résiliation
   - Résolution des litiges

9. **Contact et Informations**
   - Agences AFG Bank
   - Service Client Vitalis

## 🔧 Utilisation

### Accès direct
```
/dashboard/conditions-vitalis
```

### Intégration dans d'autres pages

#### Résumé compact
```tsx
import { ConditionsVitalisSummary } from "@/components/vitalis";

<ConditionsVitalisSummary variant="compact" />
```

#### Résumé complet
```tsx
import { ConditionsVitalisSummary } from "@/components/vitalis";

<ConditionsVitalisSummary variant="full" showPrintButton={true} />
```

### Exemple : Dashboard fournisseur

```tsx
// app/dashboard/fournisseur/page.tsx
"use client";
import { ConditionsVitalisSummary } from "@/components/vitalis";

export default function DashboardFournisseur() {
  return (
    <div className="space-y-6">
      <h1>Tableau de bord fournisseur</h1>
      
      {/* Afficher les conditions Vitalis */}
      <ConditionsVitalisSummary variant="compact" />
      
      {/* Reste du contenu */}
    </div>
  );
}
```

### Exemple : Formulaire de souscription

```tsx
// Avant de commencer une souscription
<div className="space-y-4">
  <ConditionsVitalisSummary variant="full" />
  
  <button onClick={startSouscription}>
    J'ai lu et j'accepte les conditions
  </button>
</div>
```

## 🖨️ Impression

### Fonctionnement
1. Cliquer sur le bouton "Imprimer"
2. La page se prépare pour l'impression (300ms)
3. La boîte de dialogue d'impression s'ouvre
4. L'utilisateur peut choisir imprimante ou PDF

### Optimisations d'impression

#### Styles appliqués
```css
@media print {
  /* Masquer éléments non nécessaires */
  .print:hidden { display: none; }
  
  /* En-tête document */
  .print:block { display: block; }
  
  /* Gestion des sauts de page */
  .section-card { page-break-inside: avoid; }
  
  /* Marges */
  @page { margin: 2cm; }
}
```

#### Éléments masqués à l'impression
- Header de navigation
- Bouton retour
- Bouton imprimer
- Sidebar (si présent)

#### Éléments ajoutés à l'impression
- En-tête avec logo AFG Bank
- Version et date de publication
- Pied de page avec date/heure d'impression
- Copyright

## 📋 Données des conditions

Les conditions sont stockées dans le composant sous forme de structure de données :

```typescript
const CONDITIONS_VITALIS = {
  version: "2.0",
  datePublication: "1er Janvier 2026",
  sections: [
    {
      id: "presentation",
      titre: "1. Présentation du Programme Vitalis",
      icone: FileText,
      couleur: "blue",
      contenu: [
        {
          titre: "Qu'est-ce que Vitalis ?",
          paragraphes: ["..."],
        },
        {
          titre: "Objectifs du programme",
          liste: ["..."],
        },
      ],
    },
    // ... autres sections
  ],
};
```

### Mise à jour des conditions

Pour modifier les conditions :
1. Éditer la constante `CONDITIONS_VITALIS` dans `page.tsx`
2. Mettre à jour la `version` et `datePublication`
3. Les changements seront immédiatement reflétés

### Centraliser les conditions (recommandé)

Pour réutiliser les données ailleurs :

```typescript
// lib/vitalisConditions.ts
export const CONDITIONS_VITALIS = {
  // ... structure complète
};

// Puis importer où nécessaire
import { CONDITIONS_VITALIS } from "@/lib/vitalisConditions";
```

## 🎨 Personnalisation

### Couleurs par section
```typescript
const couleurClasses = {
  blue: "bg-blue-50 border-blue-200 text-blue-600",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
  amber: "bg-amber-50 border-amber-200 text-amber-600",
  red: "bg-red-50 border-red-200 text-red-600",
};
```

### Icônes
Utilise `lucide-react` pour les icônes. Pour changer :
```typescript
import { NewIcon } from "lucide-react";

sections: [
  {
    icone: NewIcon,
    // ...
  }
]
```

## 🔗 Liens associés

- **Formulaire souscription** : `/dashboard/souscriptions/creer`
- **Liste fournisseurs agréés** : `/dashboard/fournisseurs`
- **Agences AFG Bank** : `/dashboard/agences-afg`
- **Contact** : Intégré dans la page

## 📱 Responsive

- **Mobile** : Colonne unique, lecture optimisée
- **Tablet** : 2 colonnes pour certains blocs
- **Desktop** : Layout complet avec sidebars

## ♿ Accessibilité

- Contraste suffisant pour WCAG AA
- Structure sémantique (h1, h2, h3, etc.)
- Icônes avec rôle décoratif
- Navigation au clavier fonctionnelle

## 🚀 Prochaines améliorations

- [ ] Génération PDF serveur-side (avec puppeteer ou jsPDF)
- [ ] Téléchargement direct PDF sans impression
- [ ] Version multilingue (français, anglais)
- [ ] Recherche dans les conditions
- [ ] Ancres de navigation rapide
- [ ] FAQ intégrée
- [ ] Calculateur de mensualités

## 📚 Ressources

- [Documentation AFG Bank](https://afgbank.ci)
- [Guide Vitalis](https://afgbank.ci/vitalis)
- [Lucide Icons](https://lucide.dev)
- [Tailwind Print Styles](https://tailwindcss.com/docs/customizing-colors#using-css-variables)

---

**Version** : 2.0  
**Dernière mise à jour** : 9 septembre 2026
