/**
 * Données géographiques de Côte d'Ivoire (Régions, Villes, Communes / Quartiers)
 * Programme Vitalis FADES – LDF Groupe & AFG Bank (Version MVP)
 */

export interface RegionData {
  nom: string;
  villes: {
    nom: string;
    communes: string[];
  }[];
}

export const COTE_D_IVOIRE_GEOGRAPHY: RegionData[] = [
  {
    nom: "District d'Abidjan",
    villes: [
      {
        nom: "Abidjan",
        communes: [
          "Abobo",
          "Adjamé",
          "Attécoubé",
          "Cocody",
          "Koumassi",
          "Marcory",
          "Plateau",
          "Port-Bouët",
          "Treichville",
          "Yopougon",
          "Anyama",
          "Bingerville",
          "Songon",
        ],
      },
    ],
  },
  {
    nom: "Région de GBEKE",
    villes: [
      {
        nom: "Bouaké",
        communes: [
          "Bouaké Centre",
          "Commerce",
          "Air France",
          "Koko",
          "Nimbo",
          "Ahougnanssou",
          "Broukro",
          "Dar-Es-Salam",
          "Belleville",
        ],
      },
      {
        nom: "Béoumi",
        communes: ["Béoumi Centre", "Golikro", "Marabadiassa"],
      },
      {
        nom: "Sakassou",
        communes: ["Sakassou Centre", "Walèbo", "Assandrè"],
      },
    ],
  },
  {
    nom: "Région des Lacs",
    villes: [
      {
        nom: "Yamoussoukro",
        communes: [
          "Yamoussoukro Centre",
          "Habitat",
          "Morofé",
          "Assabou",
          "220 Logements",
          "Kokrenou",
          "Dioulakro",
        ],
      },
      {
        nom: "Toumodi",
        communes: ["Toumodi Centre", "Rombo", "Zaakro"],
      },
      {
        nom: "Tiébissou",
        communes: ["Tiébissou Centre", "Koffikro", "Minankro"],
      },
    ],
  },
];

/**
 * Récupère la liste ordonnée des régions MVP disponibles
 */
export const LISTE_REGIONS_CI: string[] = COTE_D_IVOIRE_GEOGRAPHY.map((r) => r.nom);

/**
 * Normalise une chaîne pour la comparaison tolérante
 */
function normalizeStr(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Récupère les villes pour une région donnée (gère correspondances partielles et anciens libellés)
 */
export function getVillesParRegion(regionNom: string): string[] {
  if (!regionNom) return [];
  const cleanNom = normalizeStr(regionNom);

  const regionTrouvee = COTE_D_IVOIRE_GEOGRAPHY.find((r) => {
    const rNorm = normalizeStr(r.nom);
    return rNorm === cleanNom || rNorm.includes(cleanNom) || cleanNom.includes(rNorm);
  });

  if (regionTrouvee) {
    return regionTrouvee.villes.map((v) => v.nom);
  }

  // Fallbacks tolérants
  if (cleanNom.includes("abidjan")) {
    return COTE_D_IVOIRE_GEOGRAPHY[0].villes.map((v) => v.nom);
  }
  if (cleanNom.includes("gbeke")) {
    return COTE_D_IVOIRE_GEOGRAPHY[1].villes.map((v) => v.nom);
  }
  if (cleanNom.includes("lac") || cleanNom.includes("yamoussoukro")) {
    return COTE_D_IVOIRE_GEOGRAPHY[2].villes.map((v) => v.nom);
  }

  return [];
}

/**
 * Récupère les communes / quartiers pour une région et ville données
 */
export function getCommunesParVille(regionNom: string, villeNom: string): string[] {
  if (!regionNom && !villeNom) return [];
  const cleanReg = normalizeStr(regionNom);
  const cleanVil = normalizeStr(villeNom);

  const regionTrouvee =
    COTE_D_IVOIRE_GEOGRAPHY.find((r) => {
      const rNorm = normalizeStr(r.nom);
      return rNorm === cleanReg || rNorm.includes(cleanReg) || cleanReg.includes(rNorm);
    }) ||
    (cleanReg.includes("abidjan")
      ? COTE_D_IVOIRE_GEOGRAPHY[0]
      : cleanReg.includes("gbeke")
      ? COTE_D_IVOIRE_GEOGRAPHY[1]
      : cleanReg.includes("lac") || cleanReg.includes("yamoussoukro")
      ? COTE_D_IVOIRE_GEOGRAPHY[2]
      : undefined);

  if (regionTrouvee) {
    if (cleanVil) {
      const villeTrouvee = regionTrouvee.villes.find((v) => {
        const vNorm = normalizeStr(v.nom);
        return vNorm === cleanVil || vNorm.includes(cleanVil) || cleanVil.includes(vNorm);
      });
      if (villeTrouvee && villeTrouvee.communes.length > 0) {
        return villeTrouvee.communes;
      }
    }
    // Si la ville n'est pas encore précisée, renvoyer les communes de la première ville
    return regionTrouvee.villes[0]?.communes || [];
  }

  // Fallback par défaut si ville = Abidjan
  if (cleanVil.includes("abidjan")) {
    return COTE_D_IVOIRE_GEOGRAPHY[0].villes[0].communes;
  }

  return [];
}