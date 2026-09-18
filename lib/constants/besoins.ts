/**
 * Référentiel officiel des Natures et Catégories de besoins
 * Programme Vitalis FADES · AFG Bank
 */

export interface BesoinOptionGroup {
  groupe: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

/**
 * Familles de biens et secteurs marchands couverts par les 8 fournisseurs agréés
 */
export const CATEGORIES_BESOIN: BesoinOptionGroup[] = [
  {
    groupe: "Automobile & Mobilité",
    options: [
      { value: "Automobile", label: "Automobile & Deux-roues (Véhicules, Pièces, Pneumatiques)" },
    ],
  },
  {
    groupe: "Construction & Bâtiment",
    options: [
      { value: "Materiaux de construction", label: "Matériaux de construction (Fer, Bois, Tôles, Sanitaire)" },
      { value: "Cimenterie", label: "Cimenterie & Gros œuvre (Ciment, Liants, Agrégats)" },
      { value: "Revetement/Peinture", label: "Revêtement & Peinture (Peintures, Carrelage, Étanchéité)" },
      { value: "Logement", label: "Logement & Second œuvre (Aménagement, Menuiserie)" },
    ],
  },
  {
    groupe: "Équipement de maison & Multimédia",
    options: [
      { value: "Electromenager", label: "Électroménager & Froid (Réfrigérateur, Climatiseur, Cuisinière)" },
      { value: "Image & Son", label: "Image, Son & Multimédia (TV, Vidéo, Home Cinéma)" },
    ],
  },
  {
    groupe: "Informatique & Bureautique",
    options: [
      { value: "Informatique & Multimedia", label: "Informatique & Solutions digitales (PC, Imprimantes, Tablettes)" },
      { value: "Mobilier & Bureau", label: "Mobilier & Bureau (Fauteuils, Bureaux, Armoires)" },
      { value: "Fournitures scolaires", label: "Fournitures scolaires & Papeterie (Livres, Manuels, Rames)" },
    ],
  },
  {
    groupe: "Énergie & Outillage technique",
    options: [
      { value: "Outillage & Technique", label: "Outillage, Quincaillerie & Énergie (Groupes, Solaires, Outillage)" },
    ],
  },
];

/**
 * Natures de besoins (Usage / Finalité du projet pour le souscripteur)
 */
export const NATURES_BESOIN: BesoinOptionGroup[] = [
  {
    groupe: "Mobilité & Véhicules",
    options: [
      { value: "Equipement de voiture", label: "Équipement de voiture / Accessoires auto" },
      { value: "Entretien & Pneumatiques", label: "Entretien, révision, batteries & pneumatiques" },
      { value: "Acquisition vehicule personnel", label: "Acquisition de véhicule personnel (auto, moto, scooter)" },
      { value: "Acquisition utilitaire professionnel", label: "Acquisition de véhicule utilitaire / engin professionnel" },
    ],
  },
  {
    groupe: "Habitat, Construction & Rénovation",
    options: [
      { value: "Construction de logement", label: "Construction de logement / Gros œuvre" },
      { value: "Renovation & Peinture", label: "Rénovation, réhabilitation & travaux de peinture" },
      { value: "Finitions & Revetement", label: "Finitions, pose de carrelage, étanchéité & sanitaire" },
      { value: "Amenagement cuisine & sanitaires", label: "Aménagement cuisine & équipements sanitaires" },
    ],
  },
  {
    groupe: "Cadre de vie & Confort domestique",
    options: [
      { value: "Equipement electromenager", label: "Équipement électroménager du foyer (froid, cuisson, lavage)" },
      { value: "Climatisation & Confort thermique", label: "Confort thermique & climatisation" },
      { value: "Ameublement & Literie", label: "Ameublement du domicile & literie" },
    ],
  },
  {
    groupe: "Activité professionnelle & Entreprise",
    options: [
      { value: "Equipement de bureau & mobilier", label: "Équipement de bureau & mobilier professionnel" },
      { value: "Informatisation & Digitalisation", label: "Informatisation & digitalisation de bureau / entreprise" },
      { value: "Outillage & Materiel professionnel", label: "Outillage & matériel technique pour artisan/chantier" },
      { value: "Renforcement de stock marchand", label: "Constitution ou renforcement de stocks marchands" },
    ],
  },
  {
    groupe: "Scolarité & Formation",
    options: [
      { value: "Rentree scolaire & Manuels", label: "Rentrée scolaire des enfants (manuels, fournitures)" },
      { value: "Etudes superieures & Formation", label: "Équipement pour études supérieures & formation" },
    ],
  },
  {
    groupe: "Autre",
    options: [
      { value: "Autre besoin specifique", label: "Autre besoin spécifique" },
    ],
  },
];
