/**
 * Référentiel officiel des Natures et Catégories de besoins
 * Programme Vitalis FADES · AFG Bank & LDF Groupe
 * 
 * Ce référentiel associe rigoureusement chaque Nature de besoin à ses Catégories de produits réelles,
 * directement alignées sur les 14 fournisseurs agréés officiels du programme.
 */

export interface CategorieBesoinOption {
  value: string;
  label: string;
  description?: string;
  fournisseursCodes?: string[]; // Codes ou noms des fournisseurs officiels compétents
}

export interface NatureBesoinItem {
  value: string;
  label: string;
  groupe: string;
  description?: string;
  categories: CategorieBesoinOption[];
}

export interface BesoinOptionGroup {
  groupe: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

/**
 * RÉFÉRENTIEL COMPLET NATURES -> CATÉGORIES
 * Chaque nature filtre strictement les catégories disponibles.
 */
export const REFERENTIEL_BESOINS: NatureBesoinItem[] = [
  // ── 0. ACHATS GROUPÉS & BESOINS MULTI-FOURNISSEURS ───────────────
  {
    value: "achats_multi_fournisseurs",
    label: "Achats groupés & Multi-secteurs (Équipement complet, fournitures, travaux...)",
    groupe: "Projet Global & Multi-fournisseurs",
    description: "Financement d'un panier d'équipements et fournitures auprès de plusieurs fournisseurs agréés de différents domaines",
    categories: [
      {
        value: "Équipement global & Pack multi-fournisseurs",
        label: "Équipement global & Pack multi-fournisseurs (Tous secteurs d'activité confondus)",
        description: "Regroupement de plusieurs besoins : fournitures, électroménager, aménagement, matériaux, etc.",
        fournisseursCodes: ["LDF", "DROCOLOR", "SIPPEC", "ATC", "RYMCO", "SOCIDA", "ORIBAT", "INOVIM", "KAYDAN", "BERNABE", "SODISMAD", "TECHNIBAT", "SOCIAM", "LG"],
      },
      {
        value: "Rentrée, Travaux & Cadre de vie",
        label: "Rentrée scolaire & Rénovation / Cadre de vie (LDF + Peinture / Mobilier / Électroménager)",
        description: "Besoins combinés pour la rentrée scolaire et le réaménagement du domicile",
        fournisseursCodes: ["LDF", "DROCOLOR", "SIPPEC", "TECHNIBAT", "SOCIAM", "LG"],
      },
      {
        value: "Projet de construction & Aménagement complet",
        label: "Construction, Matériaux & Aménagement d'intérieur (Matériaux + Peinture + Mobilier)",
        description: "Financement groupé pour la construction, la quincaillerie, les revêtements et l'ameublement",
        fournisseursCodes: ["BERNABE", "SODISMAD", "DROCOLOR", "SIPPEC", "TECHNIBAT"],
      },
      {
        value: "Mobilité, Logistique & Équipement professionnel",
        label: "Véhicule / Mobilité & Matériel professionnel (Auto + Informatique / Climatisation)",
        description: "Pack pour l'acquisition de véhicules utilitaires et équipements de bureau/locaux",
        fournisseursCodes: ["ATC", "RYMCO", "SOCIDA", "LDF", "SOCIAM", "LG"],
      },
    ],
  },

  // ── 1. ÉDUCATION, LIVRES & SCOLARITÉ ─────────────────────────────
  {
    value: "scolarite_etudes",
    label: "Scolarité, Rentrée des classes & Études",
    groupe: "Éducation & Formation",
    description: "Financement des fournitures scolaires, manuels scolaires et matériels d'études",
    categories: [
      {
        value: "Fournitures scolaires & Papeterie",
        label: "Fournitures scolaires & Papeterie (Cahiers, stylos, cartables, classeurs, calculatrices)",
        description: "Fournitures complètes pour la rentrée scolaire primaire et secondaire",
        fournisseursCodes: ["LDF"],
      },
      {
        value: "Manuels scolaires officiels",
        label: "Manuels scolaires officiels (Programmes nationaux CI du Primaire au Secondaire)",
        description: "Manuels homologués par le Ministère de l'Éducation Nationale et annales d'examens",
        fournisseursCodes: ["LDF"],
      },
      {
        value: "Ouvrages universitaires & Manuels techniques",
        label: "Ouvrages universitaires & Enseignement supérieur (Droit, gestion, médecine, dictionnaires)",
        description: "Livres spécialisés et codes juridiques pour étudiants et enseignants",
        fournisseursCodes: ["LDF"],
      },
    ],
  },

  // ── 2. INFORMATIQUE & BUREAUTIQUE ────────────────────────────────
  {
    value: "informatique_bureautique",
    label: "Informatique, Bureautique & Télétravail",
    groupe: "Informatique & Bureautique",
    description: "Équipement numérique et bureautique pour particuliers, étudiants et professionnels",
    categories: [
      {
        value: "Ordinateurs portables & Ordinateurs de bureau",
        label: "Ordinateurs portables & Unités centrales (PC bureautique, PC portables, écrans)",
        description: "Ordinateurs neufs avec garantie pour usage familial, étudiant ou bureautique",
        fournisseursCodes: ["LDF"],
      },
      {
        value: "Imprimantes, Copieurs & Scanners",
        label: "Imprimantes multifonctions & Scanners (Jet d'encre à réservoir, laser)",
        description: "Matériel d'impression économique et multifonction pour domicile ou bureau",
        fournisseursCodes: ["LDF"],
      },
      {
        value: "Consommables & Accessoires informatiques",
        label: "Consommables & Périphériques (Rames de papier, cartouches, toners, disques externes, onduleurs)",
        description: "Papiers reprographie, sauvegardes et protections électriques",
        fournisseursCodes: ["LDF"],
      },
      {
        value: "Mobilier de bureau & Fauteuils ergonomiques",
        label: "Mobilier de bureau & Sièges de travail (Fauteuils ergonomiques, bureaux, caissons)",
        description: "Mobilier professionnel pour espaces de travail et télétravail",
        fournisseursCodes: ["LDF", "TECHNIBAT"],
      },
    ],
  },

  // ── 3. ÉLECTROMÉNAGER & FROID DOMESTIQUE ─────────────────────────
  {
    value: "electromenager_maison",
    label: "Équipement électroménager & Froid domestique",
    groupe: "Électroménager & Confort de la maison",
    description: "Équipement de la cuisine et de la maison pour le quotidien familial",
    categories: [
      {
        value: "Réfrigérateurs, Combinés & Congélateurs",
        label: "Réfrigérateurs, Combinés & Congélateurs coffres (No-frost, grande capacité)",
        description: "Conservation des aliments, combinés double porte et congélateurs bahuts",
        fournisseursCodes: ["SOCIAM", "LG"],
      },
      {
        value: "Cuisinières, Fours & Plaques de cuisson",
        label: "Cuisinières à gaz / électriques & Fours (Cuisinières 4 à 5 feux, micro-ondes)",
        description: "Appareils de cuisson sécurisés pour la cuisine quotidienne",
        fournisseursCodes: ["SOCIAM"],
      },
      {
        value: "Machines à laver le linge & Buanderie",
        label: "Machines à laver le linge & Équipement buanderie (Lave-linge hublot, lave-linge top)",
        description: "Lavage efficace du linge familial",
        fournisseursCodes: ["SOCIAM", "LG"],
      },
      {
        value: "Téléviseurs Smart TV & Multimédia",
        label: "Téléviseurs Smart TV UHD 4K & Barres de son (Téléviseurs LED, home cinéma)",
        description: "Téléviseurs connectés de dernière génération et sonorisation",
        fournisseursCodes: ["SOCIAM", "LG"],
      },
      {
        value: "Petit électroménager culinaire & Entretien",
        label: "Petit électroménager (Mixeurs, robots de cuisine, bouilloires, fers à repasser)",
        description: "Appareils compacts pour la préparation des repas et le repassage",
        fournisseursCodes: ["SOCIAM"],
      },
    ],
  },

  // ── 4. CLIMATISATION & CONFORT THERMIQUE ─────────────────────────
  {
    value: "climatisation_confort",
    label: "Climatisation & Confort thermique",
    groupe: "Électroménager & Confort de la maison",
    description: "Installation de climatiseurs pour domicile, commerce ou bureaux",
    categories: [
      {
        value: "Climatiseurs split muraux (Inverter & Standard)",
        label: "Climatiseurs split muraux (Splits Inverter 1 CV, 1.5 CV, 2 CV, 2.5 CV)",
        description: "Climatisation économique et silencieuse pour chambres et pièces de vie",
        fournisseursCodes: ["LG", "SOCIAM"],
      },
      {
        value: "Climatiseurs armoires & Colonnes grand volume",
        label: "Climatiseurs armoires & Colonnes grand volume (3 CV à 5 CV pour salons et commerces)",
        description: "Puissance frigorifique élevée pour grands volumes et salles de réunion",
        fournisseursCodes: ["LG"],
      },
      {
        value: "Ventilateurs & Brasseurs d'air",
        label: "Ventilateurs & Brasseurs d'air de plafond (Plafonniers silencieux, ventilateurs sur pied)",
        description: "Ventilation continue et brassage d'air économique",
        fournisseursCodes: ["SOCIAM"],
      },
    ],
  },

  // ── 5. MOBILIER & AMÉNAGEMENT D'INTÉRIEUR ────────────────────────
  {
    value: "mobilier_interieur",
    label: "Mobilier de maison, Literie & Aménagement",
    groupe: "Aménagement d'Intérieur & Mobilier",
    description: "Ameublement des pièces de vie, chambres et agencement d'intérieur",
    categories: [
      {
        value: "Salons, Canapés & Tables de séjour",
        label: "Salons complets, Canapés d'angle & Tables de séjour (Salons cuir/tissu, tables basses, meubles TV)",
        description: "Ameublement complet du salon et des espaces d'accueil",
        fournisseursCodes: ["TECHNIBAT"],
      },
      {
        value: "Lits, Sommiers & Matelas orthopédiques",
        label: "Chambres à coucher, Lits & Matelas orthopédiques (Matelas grand confort haute densité)",
        description: "Literie haute qualité pour un repos sain et durable",
        fournisseursCodes: ["TECHNIBAT"],
      },
      {
        value: "Armoires, Dressings & Commodes",
        label: "Armoires de chambre, Dressings & Commodes (Armoires 3 à 6 portes, penderies)",
        description: "Solutions de rangement pour vêtements et linge de maison",
        fournisseursCodes: ["TECHNIBAT"],
      },
      {
        value: "Salles à manger complètes & Buffets",
        label: "Salles à manger & Ensembles de table (Tables avec chaises assorties, buffets vaisseliers)",
        description: "Ensembles conviviaux pour les repas en famille",
        fournisseursCodes: ["TECHNIBAT"],
      },
      {
        value: "Cuisines aménagées & Éléments sanitaires",
        label: "Cuisines aménagées sur mesure & Placards (Meubles hauts/bas, plans de travail)",
        description: "Agencement sur mesure de la cuisine et rangements",
        fournisseursCodes: ["TECHNIBAT"],
      },
    ],
  },

  // ── 6. PEINTURE, FAÇADES & REVÊTEMENTS ────────────────────────────
  {
    value: "peinture_renovation",
    label: "Travaux de peinture, Façades & Étanchéité",
    groupe: "Peinture & Revêtements",
    description: "Travaux de peinture intérieure/extérieure, réhabilitation et étanchéité",
    categories: [
      {
        value: "Peintures intérieures pour murs & plafonds",
        label: "Peintures intérieures (Mates, satinées, glycéro, sous-couches d'impression)",
        description: "Peintures décoratives et lessivables pour l'intérieur de la maison",
        fournisseursCodes: ["DROCOLOR", "SIPPEC"],
      },
      {
        value: "Peintures extérieures & Revêtements de façades",
        label: "Peintures extérieures & Façades (Peintures pliolite, revêtements épais anti-intempéries)",
        description: "Protection longue durée contre la pluie, le soleil et les moisissures",
        fournisseursCodes: ["DROCOLOR", "SIPPEC"],
      },
      {
        value: "Produits d'étanchéité & Traitement toiture / dalle",
        label: "Produits d'étanchéité & Traitement toiture/dalle (Résines hydrofuges, toiles d'étanchéité)",
        description: "Traitement anti-infiltrations pour terrasses, toitures et pièces humides",
        fournisseursCodes: ["DROCOLOR", "SIPPEC"],
      },
      {
        value: "Peintures carrosserie & Revêtements de sol industriels",
        label: "Peintures carrosserie & Sols industriels (Peintures auto, antirouilles, résines époxy)",
        description: "Peintures techniques pour véhicules, ferronneries et sols d'ateliers",
        fournisseursCodes: ["SIPPEC", "DROCOLOR"],
      },
      {
        value: "Outillage du peintre & Enduits de lissage",
        label: "Outillage & Préparation (Rouleaux pro, pinceaux, enduits de rebouchage, bâches)",
        description: "Matériel d'application et produits de préparation de surface",
        fournisseursCodes: ["DROCOLOR", "SIPPEC"],
      },
    ],
  },

  // ── 7. MATÉRIAUX DE CONSTRUCTION & GROS ŒUVRE ────────────────────
  {
    value: "materiaux_construction",
    label: "Matériaux de construction, Gros œuvre & Quincaillerie",
    groupe: "Bâtiment & Gros Œuvre",
    description: "Matériaux indispensables pour chantiers de construction, maçonnerie et rénovation",
    categories: [
      {
        value: "Fers à béton, Ciment & Liants de maçonnerie",
        label: "Fers à béton, Ciment & Liants (Fers torsadés FeE500 tous diamètres, ciment CPJ 32.5/42.5)",
        description: "Matériaux de base pour fondations, dalles, poteaux et maçonnerie",
        fournisseursCodes: ["BERNABE", "SODISMAD"],
      },
      {
        value: "Tôles de toiture, Bac alu & Charpente métallique",
        label: "Tôles de toiture, Bac alu & Profilés métalliques (Tôles ondulées, bac alu, tubes carrés, IPN)",
        description: "Couverture de toiture, charpentes métalliques et profilés de serrurerie",
        fournisseursCodes: ["BERNABE", "SODISMAD"],
      },
      {
        value: "Plomberie sanitaire & Tuyauterie PVC/PPR",
        label: "Plomberie sanitaire & Tuyaux PVC/PPR (Tubes PVC évacuation, tuyaux PPR pression, robinetterie)",
        description: "Réseaux d'alimentation en eau potable et évacuation des eaux usées",
        fournisseursCodes: ["BERNABE"],
      },
      {
        value: "Électricité du bâtiment & Câblage",
        label: "Électricité du bâtiment & Câblage cuivre (Câbles U1000 R2V, coffrets, disjoncteurs, gaines)",
        description: "Installations électriques sécurisées conformes aux normes",
        fournisseursCodes: ["BERNABE"],
      },
      {
        value: "Outillage de chantier, Échafaudage & Quincaillerie",
        label: "Outillage de chantier & Quincaillerie (Brouettes, pelles, outillage électroportatif, serrures)",
        description: "Matériel de chantier pour maçons, artisans et sécurisation des accès",
        fournisseursCodes: ["BERNABE", "SODISMAD"],
      },
    ],
  },

  // ── 8. VÉHICULES AUTOMOBILES & MOBILITÉ ──────────────────────────
  {
    value: "vehicules_mobilite",
    label: "Véhicule particulier neuf, Utilitaire ou Deux-roues",
    groupe: "Automobile & Deux-roues",
    description: "Financement d'un véhicule neuf ou deux-roues auprès des concessionnaires agréés",
    categories: [
      {
        value: "Voitures particulières neuves (Berlines, SUV, Citadines)",
        label: "Voitures particulières neuves (Berlines, SUV familiaux, citadines avec garantie constructeur)",
        description: "Véhicules neufs de concessionnaires agréés pour déplacements personnels ou familiaux",
        fournisseursCodes: ["SOCIDA", "ATC", "RYMCO"],
      },
      {
        value: "Véhicules utilitaires légers, Pick-up & Camionnettes",
        label: "Véhicules utilitaires légers & Pick-up (Pick-up double cabine, camionnettes de livraison)",
        description: "Véhicules professionnels pour le transport de charges et activités d'exploitation",
        fournisseursCodes: ["SOCIDA", "ATC"],
      },
      {
        value: "Motos & Scooters urbains",
        label: "Motos & Scooters urbains (Motos utilitaires de ville, scooters économiques)",
        description: "Deux-roues neufs économiques pour circulation urbaine rapide et travail de proximité",
        fournisseursCodes: ["RYMCO"],
      },
      {
        value: "Tricycles & Triporteurs utilitaires de livraison",
        label: "Tricycles utilitaires & Triporteurs de charge (Engins à 3 roues avec benne de transport)",
        description: "Engins robustes pour la logistique de proximité et livraisons de marchandises",
        fournisseursCodes: ["RYMCO"],
      },
      {
        value: "Pneumatiques neufs & Batteries tropicalisées",
        label: "Pneumatiques neufs, Batteries tropicalisées & Pièces d'usure",
        description: "Trains de pneus neufs certifiés et batteries haute endurance pour climat tropical",
        fournisseursCodes: ["RYMCO", "SOCIDA", "ATC"],
      },
    ],
  },

  // ── 9. LOGEMENT NEUF & PROMOTION IMMOBILIÈRE ─────────────────────
  {
    value: "logement_promotion_immobiliere",
    label: "Logement neuf, Terrain viabilisé & Promotion immobilière",
    groupe: "Logement & Promotion Immobilière",
    description: "Acquisition de logement neuf ou parcelle sécurisée auprès de promoteurs agréés",
    categories: [
      {
        value: "Villas basses & Duplex en programme neuf",
        label: "Villas basses & Duplex neufs en cité résidentielle (Villas 3 à 5 pièces clés en main)",
        description: "Logements neufs viabilisés dans des programmes immobiliers sécurisés",
        fournisseursCodes: ["ORIBAT", "INOVIM", "KAYDAN"],
      },
      {
        value: "Appartements neufs en résidence",
        label: "Appartements résidentiels neufs (Appartements standing 2 à 4 pièces en copropriété)",
        description: "Appartements neufs avec commodités dans des immeubles résidentiels",
        fournisseursCodes: ["KAYDAN", "INOVIM", "ORIBAT"],
      },
      {
        value: "Terrains viabilisés avec ACD",
        label: "Terrains viabilisés avec Arrêté de Concession Définitive (ACD) (Lots constructibles sécurisés)",
        description: "Parcelles sécurisées avec titre foncier définitif, raccordées eau et électricité",
        fournisseursCodes: ["ORIBAT", "INOVIM"],
      },
      {
        value: "Travaux d'agrandissement, Clôture périmétrique & Surélévation",
        label: "Travaux d'agrandissement, Clôture & Surélévation (Extension de villa, clôture sécurisée)",
        description: "Aménagement foncier lourd et travaux structurels sur propriété existante",
        fournisseursCodes: ["ORIBAT", "INOVIM"],
      },
    ],
  },
];

/**
 * Helper : Récupère la liste des catégories de produits strictement associées à une Nature de besoin donnée.
 * (Même principe que getVillesParRegion pour la géographie)
 */
export function getCategoriesParNature(natureValueOrLabel: string): CategorieBesoinOption[] {
  if (!natureValueOrLabel) return [];
  const clean = natureValueOrLabel.trim().toLowerCase();

  const natureTrouvee = REFERENTIEL_BESOINS.find(n => {
    return (
      n.value.toLowerCase() === clean ||
      n.label.toLowerCase() === clean ||
      clean.includes(n.value.toLowerCase()) ||
      n.label.toLowerCase().includes(clean)
    );
  });

  return natureTrouvee ? natureTrouvee.categories : [];
}

/**
 * Helper : Récupère les codes fournisseurs officiels recommandés pour une Nature et/ou une Catégorie.
 */
export function getFournisseursRecommandesParBesoin(
  natureValueOrLabel?: string,
  categorieValueOrLabel?: string
): string[] {
  const codesSet = new Set<string>();

  if (natureValueOrLabel) {
    const cats = getCategoriesParNature(natureValueOrLabel);
    if (categorieValueOrLabel) {
      const catClean = categorieValueOrLabel.trim().toLowerCase();
      const catTrouvee = cats.find(
        c => c.value.toLowerCase() === catClean || c.label.toLowerCase() === catClean
      );
      if (catTrouvee && catTrouvee.fournisseursCodes) {
        catTrouvee.fournisseursCodes.forEach(code => codesSet.add(code));
      }
    }
    // Si la catégorie n'a rien donné, prendre tous les fournisseurs de la nature
    if (codesSet.size === 0) {
      cats.forEach(c => {
        c.fournisseursCodes?.forEach(code => codesSet.add(code));
      });
    }
  }

  return Array.from(codesSet);
}

/**
 * Liste groupée des Natures de besoins pour alimenter les composants <select> (optgroup)
 */
export const NATURES_BESOIN: BesoinOptionGroup[] = (() => {
  const mapGroupes = new Map<string, Array<{ value: string; label: string }>>();

  REFERENTIEL_BESOINS.forEach(n => {
    if (!mapGroupes.has(n.groupe)) {
      mapGroupes.set(n.groupe, []);
    }
    mapGroupes.get(n.groupe)!.push({
      value: n.label, // Libellé clair stocké directement
      label: n.label,
    });
  });

  return Array.from(mapGroupes.entries()).map(([groupe, options]) => ({
    groupe,
    options,
  }));
})();

/**
 * Rétrocompatibilité : Liste complète de toutes les catégories groupées par famille
 */
export const CATEGORIES_BESOIN: BesoinOptionGroup[] = (() => {
  const mapGroupes = new Map<string, Array<{ value: string; label: string }>>();

  REFERENTIEL_BESOINS.forEach(n => {
    if (!mapGroupes.has(n.groupe)) {
      mapGroupes.set(n.groupe, []);
    }
    n.categories.forEach(c => {
      mapGroupes.get(n.groupe)!.push({
        value: c.value,
        label: c.label,
      });
    });
  });

  return Array.from(mapGroupes.entries()).map(([groupe, options]) => ({
    groupe,
    options,
  }));
})();
