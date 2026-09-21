/**
 * Données géographiques de Côte d'Ivoire (Régions, Villes, Communes / Quartiers)
 * Programme Vitalis FADES — LDF Groupe & AFG Bank
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
    nom: "District Autonome d'Abidjan",
    villes: [
      {
        nom: "Abidjan",
        communes: [
          "Cocody (Angré, Deux-Plateaux, Riviera, Danga)",
          "Plateau",
          "Marcory (Zone 4, Biétry, Anoumabo)",
          "Treichville",
          "Yopougon (Niangon, Maroc, Toits Rouges, Selmer)",
          "Koumassi",
          "Port-Bouët (Vridi, Derrière-Wharf)",
          "Adjamé",
          "Abobo",
          "Attécoubé",
        ],
      },
      {
        nom: "Bingerville",
        communes: ["Bingerville Centre", "Blokhauss", "Akouai Santai", "Gbagba"],
      },
      {
        nom: "Anyama",
        communes: ["Anyama Centre", "Anyama Akeikoi", "Belle-Ville"],
      },
      {
        nom: "Songon",
        communes: ["Songon Agban", "Songon Dagbé", "Songon Kassemblé"],
      },
    ],
  },
  {
    nom: "Gbêkê",
    villes: [
      {
        nom: "Bouaké",
        communes: ["Bouaké Commerce", "Koko", "Nimbo", "Air France", "Dar-Es-Salam", "Broukro", "Ahougnanssou", "Belleville"],
      },
      {
        nom: "Béoumi",
        communes: ["Béoumi Centre", "Golikro", "Marabadiassa"],
      },
      {
        nom: "Sakassou",
        communes: ["Sakassou Centre", "Walèbo"],
      },
      {
        nom: "Botro",
        communes: ["Botro Centre", "Diabo", "Krofoinsou"],
      },
    ],
  },
  {
    nom: "San-Pédro",
    villes: [
      {
        nom: "San-Pédro",
        communes: ["San-Pédro Centre", "Cité", "Bardot", "Balmer", "Seweke", "Zone Industrielle"],
      },
      {
        nom: "Sassandra",
        communes: ["Sassandra Centre", "Gbaté", "Dapoya"],
      },
      {
        nom: "Tabou",
        communes: ["Tabou Centre", "Grabo"],
      },
    ],
  },
  {
    nom: "Poro",
    villes: [
      {
        nom: "Korhogo",
        communes: ["Korhogo Centre", "Soba", "Koko", "Sinistré", "Tchékélé", "Petit Paris"],
      },
      {
        nom: "Sinématiali",
        communes: ["Sinématiali Centre", "Kagbolodougou"],
      },
      {
        nom: "Ferkessédougou",
        communes: ["Ferké Centre", "Gare", "Bromakoté"],
      },
      {
        nom: "Dikodougou",
        communes: ["Dikodougou Centre", "Guiembé"],
      },
    ],
  },
  {
    nom: "Haut-Sassandra",
    villes: [
      {
        nom: "Daloa",
        communes: ["Daloa Centre", "Tazibouo", "Lobia", "Marais", "Gbeuliville", "Commerce"],
      },
      {
        nom: "Issia",
        communes: ["Issia Centre", "Boguedia"],
      },
      {
        nom: "Vavoua",
        communes: ["Vavoua Centre", "Dania"],
      },
      {
        nom: "Zoukougbeu",
        communes: ["Zoukougbeu Centre", "Grégbeu"],
      },
    ],
  },
  {
    nom: "District Autonome de Yamoussoukro",
    villes: [
      {
        nom: "Yamoussoukro",
        communes: ["Yamoussoukro Centre", "Habitat", "Assabou", "Morofé", "220 Logements", "Dioulakro", "N'Zuessy"],
      },
      {
        nom: "Attiégouakro",
        communes: ["Attiégouakro Centre", "Lolobo"],
      },
      {
        nom: "Toumodi",
        communes: ["Toumodi Centre", "Rombo", "Dimbokro-Route"],
      },
    ],
  },
  {
    nom: "Indénié-Djuablin",
    villes: [
      {
        nom: "Abengourou",
        communes: ["Abengourou Centre", "Plateau", "Agnikro", "Cafétou", "Relais"],
      },
      {
        nom: "Agnibilékrou",
        communes: ["Agnibilékrou Centre", "Dufrebo"],
      },
      {
        nom: "Bettié",
        communes: ["Bettié Centre"],
      },
    ],
  },
  {
    nom: "Tonkpi",
    villes: [
      {
        nom: "Man",
        communes: ["Man Centre", "Grand Gbapleu", "Domoraud", "Libreville", "Air France", "Koko"],
      },
      {
        nom: "Danané",
        communes: ["Danané Centre", "Bleupleu"],
      },
      {
        nom: "Biankouma",
        communes: ["Biankouma Centre", "Gbonné"],
      },
      {
        nom: "Zouan-Hounien",
        communes: ["Zouan-Hounien Centre", "Bin-Houyé"],
      },
    ],
  },
  {
    nom: "Sud-Comoé",
    villes: [
      {
        nom: "Grand-Bassam",
        communes: ["Grand-Bassam (Quartier France)", "Moossou", "Impérial", "Cafop", "Rosiers"],
      },
      {
        nom: "Aboisso",
        communes: ["Aboisso Centre", "Commerce", "TP", "Sokoura"],
      },
      {
        nom: "Bonoua",
        communes: ["Bonoua Centre", "Bégnini", "Bronoukro"],
      },
      {
        nom: "Adiaké",
        communes: ["Adiaké Centre", "Assinie-Mafia"],
      },
    ],
  },
  {
    nom: "Agnéby-Tiassa",
    villes: [
      {
        nom: "Agboville",
        communes: ["Agboville Centre", "Artisanal", "Samba", "Château"],
      },
      {
        nom: "Tiassalé",
        communes: ["Tiassalé Centre", "N'Douci", "Morokro"],
      },
      {
        nom: "Sikensi",
        communes: ["Sikensi Centre", "Gomon"],
      },
      {
        nom: "Taabo",
        communes: ["Taabo Centre", "Taabo Village"],
      },
    ],
  },
  {
    nom: "Grands Ponts",
    villes: [
      {
        nom: "Dabou",
        communes: ["Dabou Centre", "Kpass", "Bopke"],
      },
      {
        nom: "Grand-Lahou",
        communes: ["Grand-Lahou Centre", "Braffedon"],
      },
      {
        nom: "Jacqueville",
        communes: ["Jacqueville Centre", "Sassako"],
      },
    ],
  },
  {
    nom: "Marahoué",
    villes: [
      {
        nom: "Bouaflé",
        communes: ["Bouaflé Centre", "Koblata", "Biaka"],
      },
      {
        nom: "Sinfra",
        communes: ["Sinfra Centre", "Douafla"],
      },
      {
        nom: "Zuénoula",
        communes: ["Zuénoula Centre", "Gohitafla"],
      },
    ],
  },
  {
    nom: "Gontougo",
    villes: [
      {
        nom: "Bondoukou",
        communes: ["Bondoukou Centre", "Mont-Zan", "Donzosso"],
      },
      {
        nom: "Tanda",
        communes: ["Tanda Centre"],
      },
      {
        nom: "Koun-Fao",
        communes: ["Koun-Fao Centre"],
      },
    ],
  },
  {
    nom: "Nawa",
    villes: [
      {
        nom: "Soubré",
        communes: ["Soubré Centre", "Camp Militaire", "Gbakoro"],
      },
      {
        nom: "Méagui",
        communes: ["Méagui Centre", "Gnamagui"],
      },
      {
        nom: "Buyo",
        communes: ["Buyo Centre"],
      },
    ],
  },
  {
    nom: "Lôh-Djiboua",
    villes: [
      {
        nom: "Divo",
        communes: ["Divo Centre", "Bada", "Konankro", "Libreville"],
      },
      {
        nom: "Lakota",
        communes: ["Lakota Centre", "Dahiri"],
      },
      {
        nom: "Guitry",
        communes: ["Guitry Centre"],
      },
    ],
  },
  {
    nom: "La Mé",
    villes: [
      {
        nom: "Adzopé",
        communes: ["Adzopé Centre", "Tsé-Tsé", "Massandji"],
      },
      {
        nom: "Akoupé",
        communes: ["Akoupé Centre", "Afféry"],
      },
      {
        nom: "Alépé",
        communes: ["Alépé Centre", "Monokro"],
      },
    ],
  },
  {
    nom: "Hambol",
    villes: [
      {
        nom: "Katiola",
        communes: ["Katiola Centre", "Koko", "Lafonkaha"],
      },
      {
        nom: "Dabakala",
        communes: ["Dabakala Centre", "Boniérédougou"],
      },
      {
        nom: "Niakaramandougou",
        communes: ["Niakara Centre", "Tafiré"],
      },
    ],
  },
  {
    nom: "Kabadougou",
    villes: [
      {
        nom: "Odienné",
        communes: ["Odienné Centre", "Habitat", "Yankafissa"],
      },
      {
        nom: "Madinani",
        communes: ["Madinani Centre"],
      },
      {
        nom: "Samatiguila",
        communes: ["Samatiguila Centre"],
      },
    ],
  },
  {
    nom: "Bagoué",
    villes: [
      {
        nom: "Boundiali",
        communes: ["Boundiali Centre", "Loworo"],
      },
      {
        nom: "Tingréla",
        communes: ["Tingréla Centre"],
      },
      {
        nom: "Kouto",
        communes: ["Kouto Centre", "Gbon"],
      },
    ],
  },
  {
    nom: "Cavally",
    villes: [
      {
        nom: "Guiglo",
        communes: ["Guiglo Centre", "Yaoudé", "Gare"],
      },
      {
        nom: "Bloléquin",
        communes: ["Bloléquin Centre"],
      },
      {
        nom: "Toulepleu",
        communes: ["Toulepleu Centre"],
      },
    ],
  },
  {
    nom: "Guémon",
    villes: [
      {
        nom: "Duékoué",
        communes: ["Duékoué Centre", "Kokoma", "Guinglo-Gbéhou"],
      },
      {
        nom: "Bangolo",
        communes: ["Bangolo Centre"],
      },
      {
        nom: "Facobly",
        communes: ["Facobly Centre"],
      },
    ],
  },
  {
    nom: "Iffou",
    villes: [
      {
        nom: "Daoukro",
        communes: ["Daoukro Centre", "Baoulékro", "Commerce"],
      },
      {
        nom: "M'Bahiakro",
        communes: ["M'Bahiakro Centre"],
      },
      {
        nom: "Prikro",
        communes: ["Prikro Centre"],
      },
    ],
  },
  {
    nom: "Moronou",
    villes: [
      {
        nom: "Bongouanou",
        communes: ["Bongouanou Centre", "Agni-Koffikro"],
      },
      {
        nom: "Arrah",
        communes: ["Arrah Centre"],
      },
      {
        nom: "M'Batto",
        communes: ["M'Batto Centre", "Anoumaba"],
      },
    ],
  },
  {
    nom: "N'Zi",
    villes: [
      {
        nom: "Dimbokro",
        communes: ["Dimbokro Centre", "Bocabo", "Belleville"],
      },
      {
        nom: "Bocanda",
        communes: ["Bocanda Centre"],
      },
    ],
  },
  {
    nom: "Worodougou",
    villes: [
      {
        nom: "Séguéla",
        communes: ["Séguéla Centre", "Bakayoko", "Soukrougbale"],
      },
      {
        nom: "Kani",
        communes: ["Kani Centre"],
      },
    ],
  },
  {
    nom: "Bafing",
    villes: [
      {
        nom: "Touba",
        communes: ["Touba Centre", "Sokourani"],
      },
      {
        nom: "Koro",
        communes: ["Koro Centre"],
      },
      {
        nom: "Ouaninou",
        communes: ["Ouaninou Centre"],
      },
    ],
  },
  {
    nom: "Bounkani",
    villes: [
      {
        nom: "Bouna",
        communes: ["Bouna Centre", "Bromakoté"],
      },
      {
        nom: "Doropo",
        communes: ["Doropo Centre"],
      },
      {
        nom: "Nassian",
        communes: ["Nassian Centre"],
      },
    ],
  },
  {
    nom: "Béré",
    villes: [
      {
        nom: "Mankono",
        communes: ["Mankono Centre", "Tiéningboué"],
      },
      {
        nom: "Kounahiri",
        communes: ["Kounahiri Centre"],
      },
    ],
  },
  {
    nom: "Folon",
    villes: [
      {
        nom: "Minignan",
        communes: ["Minignan Centre"],
      },
      {
        nom: "Kaniasso",
        communes: ["Kaniasso Centre"],
      },
    ],
  },
];

/**
 * Récupère la liste ordonnée de toutes les régions disponibles
 */
export const LISTE_REGIONS_CI: string[] = COTE_D_IVOIRE_GEOGRAPHY.map(r => r.nom);

/**
 * Récupère les villes pour une région donnée (gère les correspondances partielles / synonymes)
 */
export function getVillesParRegion(regionNom: string): string[] {
  if (!regionNom) return [];
  const cleanNom = regionNom.trim().toLowerCase();

  const regionTrouvee = COTE_D_IVOIRE_GEOGRAPHY.find(r => {
    const rLower = r.nom.toLowerCase();
    return rLower === cleanNom || rLower.includes(cleanNom) || cleanNom.includes(rLower);
  });

  if (regionTrouvee) {
    return regionTrouvee.villes.map(v => v.nom);
  }

  // Fallback si "Abidjan" est sélectionné sans le préfixe District
  if (cleanNom.includes("abidjan")) {
    return COTE_D_IVOIRE_GEOGRAPHY[0].villes.map(v => v.nom);
  }
  if (cleanNom.includes("yamoussoukro")) {
    const yk = COTE_D_IVOIRE_GEOGRAPHY.find(r => r.nom.includes("Yamoussoukro"));
    return yk ? yk.villes.map(v => v.nom) : ["Yamoussoukro"];
  }

  return [];
}

/**
 * Récupère les communes / quartiers pour une région et ville données
 */
export function getCommunesParVille(regionNom: string, villeNom: string): string[] {
  if (!regionNom && !villeNom) return [];
  const cleanReg = (regionNom || "").trim().toLowerCase();
  const cleanVil = (villeNom || "").trim().toLowerCase();

  const regionTrouvee = COTE_D_IVOIRE_GEOGRAPHY.find(r => {
    const rLower = r.nom.toLowerCase();
    return rLower === cleanReg || rLower.includes(cleanReg) || cleanReg.includes(rLower);
  }) || (cleanReg.includes("abidjan") ? COTE_D_IVOIRE_GEOGRAPHY[0] : undefined);

  if (regionTrouvee) {
    if (cleanVil) {
      const villeTrouvee = regionTrouvee.villes.find(v => {
        const vLower = v.nom.toLowerCase();
        return vLower === cleanVil || vLower.includes(cleanVil) || cleanVil.includes(vLower);
      });
      if (villeTrouvee && villeTrouvee.communes.length > 0) {
        return villeTrouvee.communes;
      }
    }
    // Si la ville n'est pas encore précisée ou trouvée, regrouper les communes de la région
    const allCommunes = regionTrouvee.villes.flatMap(v => v.communes);
    if (allCommunes.length > 0) return allCommunes;
  }

  // Fallback par défaut si ville = Abidjan
  if (cleanVil.includes("abidjan")) {
    return COTE_D_IVOIRE_GEOGRAPHY[0].villes[0].communes;
  }

  return [];
}
