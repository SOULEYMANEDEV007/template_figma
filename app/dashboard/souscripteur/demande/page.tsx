// @ts-nocheck
"use client";

import { emitInAppNotification, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { OFFICIAL_FOURNISSEURS, getPartnerLogo, CATEGORIES_BESOIN, NATURES_BESOIN } from "@/lib/constants";
import { LISTE_REGIONS_CI, getVillesParRegion, getCommunesParVille } from "@/lib/constants/geography";
import {
  ArrowLeft, ArrowRight, Building2, Check, FileText, Home, MapPin,
  Package, Send, Loader2, Store, Truck, UserCheck, PhoneCall
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

// ── Étapes de progression horizontale ────────────────────────────
const STEPS = [
  { id: 1, label: "Expression du besoin & Localisation", icon: Package },
  { id: 2, label: "Sélection des Fournisseurs & Devis", icon: Building2 },
];

function StepIndicator({ current, onStepClick }: { current: number; onStepClick: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-0 py-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.label} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick(s.id)}
              className="flex items-center gap-3 group cursor-pointer focus:outline-none"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs
                  ${done ? "bg-emerald-500 text-white" : active ? "text-white shadow-md shadow-orange-500/25" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}
                style={active ? { background: "linear-gradient(135deg,#ff6b35,#ff8c42)" } : {}}
              >
                {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Étape {s.id}</span>
                <span className={`text-xs font-bold transition-colors ${active ? "text-[#ff6b35]" : done ? "text-emerald-700" : "text-gray-500"}`}>
                  {s.label}
                </span>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-28 mx-3 sm:mx-6 rounded-full transition-all ${s.id < current ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, icon: Icon, badge, children }: { title: string; icon: any; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs hover:border-orange-200 transition-colors">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100/80 flex items-center justify-center text-orange-600">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0B2447]">{title}</h3>
        </div>
        {badge && (
          <span className="text-[11px] font-semibold text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

const sel = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all cursor-pointer";
const inp = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all placeholder:text-gray-400";
const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function NouvelleDemandeSouscripteur() {
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const { fournisseurs, agencesAFG, pointsRelais, addSouscription } = useVitalisDb();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- Étape 1 : Expression du besoin, Localisation & Détails de livraison ---
  const [natureBesoin, setNatureBesoin] = useState("");
  const [categorie, setCategorie] = useState("");
  const [montantEstime, setMontantEstime] = useState<string>("");
  const [agenceAfgId, setAgenceAfgId] = useState("");
  const [produitRecherche, setProduitRecherche] = useState("");

  // Séparation stricte : Région - Ville - Commune (avec filtrage dynamique)
  const [region, setRegion] = useState("District d'Abidjan");
  const [ville, setVille] = useState("Abidjan");
  const [commune, setCommune] = useState("");

  const villesDisponibles = useMemo(() => getVillesParRegion(region), [region]);
  const communesDisponibles = useMemo(() => getCommunesParVille(region, ville), [region, ville]);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    const villes = getVillesParRegion(newRegion);
    const premiereVille = villes[0] || "";
    setVille(premiereVille);
    const communes = getCommunesParVille(newRegion, premiereVille);
    setCommune(communes[0] || "");
  };

  const handleVilleChange = (newVille: string) => {
    setVille(newVille);
    const communes = getCommunesParVille(region, newVille);
    setCommune(communes[0] || "");
  };

  // Détails de livraison client
  const [modeLivraison, setModeLivraison] = useState<"point_relais" | "domicile">("point_relais");
  const [pointRelaisId, setPointRelaisId] = useState("");
  const [adresseLivraison, setAdresseLivraison] = useState("");
  const [destinataireNom, setDestinataireNom] = useState("");
  const [destinataireTelephone, setDestinataireTelephone] = useState("");
  const [instructionsLivraison, setInstructionsLivraison] = useState("");

  // Pré-remplissage avec le profil de l'utilisateur connecté
  useEffect(() => {
    if (user) {
      const full = `${user.firstName || user.prenom || ""} ${user.lastName || user.nom || ""}`.trim();
      if (full && !destinataireNom) setDestinataireNom(full);
      const tel = user.telephone || user.phone || "";
      if (tel && !destinataireTelephone) setDestinataireTelephone(tel);
      if (user.ville && ville === "Abidjan") setVille(user.ville);
      if (user.commune || user.quartier) setCommune(user.commune || user.quartier || "");
      if (user.region) setRegion(user.region);
    }
  }, [user]);

  // --- Étape 2 : Configuration & Fournisseurs ---
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<string[]>([]);
  const [duree, setDuree] = useState(36);
  const [observations, setObservations] = useState("");

  // Fournisseurs agréés officiels Vitalis (10 partenaires)
  const filteredFournisseurs = useMemo(() => {
    const list = (fournisseurs && fournisseurs.length >= 8) ? fournisseurs : OFFICIAL_FOURNISSEURS;
    return list.filter(f => f.statut === "actif").map(f => {
      // Drocolor est le spécialiste historique de la peinture et des revêtements
      if (f.id === "FOUR-DRO-002" || f.nom?.toLowerCase().includes("drocolor")) {
        return {
          ...f,
          secteurActivite: "Peinture bâtiment & carrosserie, revêtements & étanchéité",
        };
      }
      return f;
    });
  }, [fournisseurs]);

  const toggleFournisseur = (id: string) => {
    setSelectedFournisseurs(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const selectedRelais = useMemo(() => {
    return (pointsRelais || []).find(p => p.id === pointRelaisId);
  }, [pointsRelais, pointRelaisId]);

  const selectedAgence = useMemo(() => {
    return (agencesAFG || []).find(a => a.id === agenceAfgId);
  }, [agencesAFG, agenceAfgId]);

  const handleNextStep = () => {
    if (!natureBesoin || !categorie || !produitRecherche || !region || !ville || !commune) {
      toast.error("Veuillez renseigner tous les champs obligatoires (*) : Nature, Catégorie, Produit, Région, Ville et Commune.");
      return;
    }
    if (modeLivraison === "point_relais" && !pointRelaisId) {
      toast.error("Veuillez sélectionner un point relais Vitalis pour la récupération.");
      return;
    }
    if (modeLivraison === "domicile" && !adresseLivraison) {
      toast.error("Veuillez préciser l'adresse de livraison à domicile.");
      return;
    }
    if (!destinataireTelephone) {
      toast.error("Veuillez renseigner le numéro de téléphone du destinataire pour la livraison.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFournisseurs.length === 0) {
      toast.error("Veuillez sélectionner au moins un fournisseur correspondant à votre besoin.");
      return;
    }

    setSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const seq = String(Date.now()).slice(-4);
      const ref = `VF-${year}-${seq}`;

      const allFournisseursList = (fournisseurs && fournisseurs.length >= 8) ? fournisseurs : OFFICIAL_FOURNISSEURS;
      const fournisseursChoisis = allFournisseursList
        .filter(f => selectedFournisseurs.includes(f.id))
        .map(f => ({ fournisseurId: f.id, fournisseurNom: f.nom, statut: "en_attente" as const }));

      const nomClient = (user?.lastName || user?.nom || "Konan").trim();
      const prenomClient = (user?.firstName || user?.prenom || "Awa").trim();
      const emailClient = user?.email || "client@viflo.ci";
      const telClient = user?.phone || user?.telephone || "+225 07 00 11 22 33";

      const montantNum = montantEstime ? parseFloat(montantEstime.replace(/\s/g, "")) : 0;

      const nouvelle = addSouscription({
        reference: ref,
        souscripteurId: user?.id || `SCP-${Date.now()}`,
        souscripteurNom: nomClient,
        souscripteurPrenom: prenomClient,
        souscripteurEmail: emailClient,
        souscripteurTelephone: telClient,
        typeSouscripteur: "physique",
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        agenceId: agenceAfgId || undefined,
        agenceNom: selectedAgence?.nom || undefined,
        fournisseurs: fournisseursChoisis,
        fournisseurNom: fournisseursChoisis.map(f => f.fournisseurNom).join(", "),
        montantTotal: montantNum || 0,
        duree,
        statut: "en_attente",
        dateCreation: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
        detailsLivraison: {
          mode: modeLivraison,
          region,
          ville,
          commune,
          adresse: modeLivraison === "domicile" ? adresseLivraison : (selectedRelais ? selectedRelais.adresse : commune),
          pointRelaisId: modeLivraison === "point_relais" ? pointRelaisId : undefined,
          pointRelaisNom: modeLivraison === "point_relais" ? selectedRelais?.nom : undefined,
          destinataireNom: destinataireNom || `${prenomClient} ${nomClient}`,
          destinataireTelephone: destinataireTelephone || telClient,
          instructions: instructionsLivraison,
        },
        observations: `Besoin: ${natureBesoin} | Catégorie: ${categorie} | Produit: ${produitRecherche}\nLivraison: [${modeLivraison === "point_relais" ? "Point Relais: " + (selectedRelais?.nom || pointRelaisId) : "Domicile: " + adresseLivraison}] | Zone: ${commune}, ${ville} (${region}) | Destinataire: ${destinataireNom || (prenomClient + ' ' + nomClient)} (${destinataireTelephone || telClient})${instructionsLivraison ? ` | Instructions: ${instructionsLivraison}` : ""}${montantNum > 0 ? `\nBudget indicatif: ${fmtCFA(montantNum)}` : ""}${selectedAgence ? ` | Agence AFG: ${selectedAgence.nom}` : ""}${observations ? `\nNotes: ${observations}` : ""}`,
      });

      // Notification pour les fournisseurs et admins
      emitInAppNotification({
        titre: `Nouvelle demande client — ${ref}`,
        message: `${prenomClient} ${nomClient} a exprimé un besoin pour "${produitRecherche}". Établissez votre devis chiffré.`,
        categorie: "devis",
        reference: ref,
        lien: `/dashboard/souscriptions/${nouvelle.id}`,
        roles: ["admin", "fournisseur"],
      });

      // Notification pour le souscripteur lui-même
      emitInAppNotification({
        titre: `Demande de financement ${ref} transmise`,
        message: `Votre demande pour "${produitRecherche}" a été transmise aux ${fournisseursChoisis.length} fournisseur(s) sélectionné(s). Vous recevrez une alerte dès qu'un devis sera chiffré.`,
        categorie: "souscription",
        reference: ref,
        lien: `/dashboard/souscriptions/${nouvelle.id}`,
        roles: ["souscripteur"],
      });

      toast.success(`Demande ${ref} transmise avec succès !`, {
        description: "Les fournisseurs agréés sélectionnés ont été notifiés pour établir votre devis."
      });
      router.push(`/dashboard/souscriptions/${nouvelle.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de l'enregistrement de votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-12">

      {/* ─── Header Navigation ─── */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => {
            if (step === 2) setStep(1);
            else router.back();
          }}
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#0B2447] transition-all shadow-xs"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B2447]">Demander un financement</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Programme Vitalis FADES · En partenariat avec <strong>AFG Bank Atlantic</strong>
          </p>
        </div>
      </div>

      {/* ─── Indicateur de progression horizontale au-dessus du formulaire (comme avant) ─── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
        <StepIndicator
          current={step}
          onStepClick={(s) => {
            if (s === 1) {
              setStep(1);
            } else if (natureBesoin && categorie && produitRecherche && region && ville && pointRelaisId) {
              setStep(2);
            } else {
              toast.error("Veuillez d'abord remplir les champs obligatoires de l'étape 1.");
            }
          }}
        />
      </div>

      {/* ─── Formulaire principal ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ÉTAPE 1 : EXPRESSION DU BESOIN & LOCALISATION */}
        {step === 1 && (
          <div className="space-y-6 slide-in">

            {/* 1.1 Expression du besoin */}
            <SectionCard title="Identification du besoin" icon={Package} badge="Étape 1 sur 2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nature du besoin *</label>
                  <select className={sel} value={natureBesoin} onChange={e => setNatureBesoin(e.target.value)} required>
                    <option value="">Sélectionnez la nature du besoin</option>
                    {NATURES_BESOIN.map(grp => (
                      <optgroup key={grp.groupe} label={grp.groupe}>
                        {grp.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catégorie de produit *</label>
                  <select className={sel} value={categorie} onChange={e => setCategorie(e.target.value)} required>
                    <option value="">Sélectionnez une catégorie de produit</option>
                    {CATEGORIES_BESOIN.map(grp => (
                      <optgroup key={grp.groupe} label={grp.groupe}>
                        {grp.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Budget estimatif indicatif (FCFA) <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className={inp}
                      placeholder="Ex: 1 500 000"
                      value={montantEstime}
                      onChange={e => setMontantEstime(e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      FCFA
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Fourchette indicative pour calibrer les propositions des fournisseurs.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Agence AFG Bank de rattachement <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <select className={sel} value={agenceAfgId} onChange={e => setAgenceAfgId(e.target.value)}>
                    <option value="">Sélectionnez une agence AFG Bank</option>
                    {(agencesAFG || []).map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nom} ({a.ville})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Agence bancaire où sera déposé votre dossier physique de crédit.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description précise des articles recherchés *</label>
                  <textarea
                    className={`${inp} min-h-[110px] resize-y`}
                    placeholder="Précisez les marques, modèles, quantités, dimensions ou finitions recherchées (ex: 1 Véhicule utilitaire plateau, 5 Climatiseurs split 1.5 CV Inverter, 20 sacs de ciment CPJ 42.5, etc.)..."
                    value={produitRecherche}
                    onChange={e => setProduitRecherche(e.target.value)}
                    required
                  />
                </div>
              </div>
            </SectionCard>

            {/* 1.2 Localisation géographique (Région - Ville - Commune) */}
            <SectionCard title="Localisation géographique (Région - Ville - Commune)" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Région *</label>
                  <select className={sel} value={region} onChange={e => handleRegionChange(e.target.value)} required>
                    <option value="">Sélectionner une région</option>
                    {LISTE_REGIONS_CI.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ville *</label>
                  {villesDisponibles.length > 0 ? (
                    <select className={sel} value={ville} onChange={e => handleVilleChange(e.target.value)} required>
                      <option value="">Sélectionner une ville</option>
                      {villesDisponibles.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                      <option value="Autre">Autre ville...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={inp}
                      placeholder={region ? "Saisir la ville" : "Sélectionnez d'abord une région"}
                      value={ville}
                      onChange={e => setVille(e.target.value)}
                      required
                    />
                  )}
                  {ville === "Autre" && (
                    <input
                      type="text"
                      className={`${inp} mt-2`}
                      placeholder="Précisez le nom de votre ville"
                      onChange={e => setVille(e.target.value)}
                      autoFocus
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Commune / Quartier *</label>
                  {communesDisponibles.length > 0 ? (
                    <select className={sel} value={commune} onChange={e => setCommune(e.target.value)} required>
                      <option value="">Sélectionner une commune / quartier</option>
                      {communesDisponibles.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Autre">Autre commune / quartier...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className={inp}
                      placeholder={region ? "Précisez la commune ou quartier" : "Sélectionnez d'abord une région"}
                      value={commune}
                      onChange={e => setCommune(e.target.value)}
                      required
                    />
                  )}
                  {commune === "Autre" && (
                    <input
                      type="text"
                      className={`${inp} mt-2`}
                      placeholder="Précisez votre commune / quartier"
                      onChange={e => setCommune(e.target.value)}
                      autoFocus
                      required
                    />
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 1.3 Modalités & Coordonnées de livraison */}
            <SectionCard title="Modalités & Destination de la livraison" icon={Truck}>
              <div className="space-y-4">
                {/* Choix du mode de livraison */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Mode de livraison souhaité *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModeLivraison("point_relais")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        modeLivraison === "point_relais"
                          ? "border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-400/40"
                          : "border-gray-200 hover:border-orange-200 bg-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        modeLivraison === "point_relais" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Point Relais Vitalis (Gratuit)</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Retrait sécurisé dans l'un de nos points relais agréés</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModeLivraison("domicile")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        modeLivraison === "domicile"
                          ? "border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-400/40"
                          : "border-gray-200 hover:border-orange-200 bg-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        modeLivraison === "domicile" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Livraison à domicile / Site</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Livraison directe à votre domicile ou adresse d'entreprise</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Champ conditionnel selon le mode */}
                {modeLivraison === "point_relais" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Sélectionnez votre Point Relais de récupération *
                    </label>
                    <select className={sel} value={pointRelaisId} onChange={e => setPointRelaisId(e.target.value)} required>
                      <option value="">Sélectionnez un point relais partenaire</option>
                      {(pointsRelais || []).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.ville} — {p.nom} ({p.quartier} - {p.adresse})
                        </option>
                      ))}
                    </select>

                    {/* Aperçu du point relais sélectionné */}
                    {selectedRelais && (
                      <div className="mt-3 p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-start gap-3">
                        <Store className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-orange-950 space-y-0.5">
                          <p className="font-bold">{selectedRelais.nom} · {selectedRelais.ville}</p>
                          <p className="text-orange-800">{selectedRelais.adresse}</p>
                          <p className="text-[11px] text-orange-700/80">Horaires : {selectedRelais.horaires || "Lun-Ven: 8h-18h, Sam: 8h-13h"} · Contact : {selectedRelais.telephone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Adresse précise de livraison à domicile / site *
                    </label>
                    <input
                      type="text"
                      className={inp}
                      placeholder="Ex: Cocody Angré 8ème tranche, Rue L14, Villa 124, en face de la pharmacie"
                      value={adresseLivraison}
                      onChange={e => setAdresseLivraison(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Coordonnées du destinataire */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-orange-500" />
                    Destinataire désigné pour la réception
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom & Prénom du destinataire *</label>
                      <input
                        type="text"
                        className={inp}
                        placeholder="Ex: Jean-Marc KOUASSI"
                        value={destinataireNom}
                        onChange={e => setDestinataireNom(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Téléphone direct du destinataire *</label>
                      <input
                        type="tel"
                        className={inp}
                        placeholder="+225 07 00 00 00 00"
                        value={destinataireTelephone}
                        onChange={e => setDestinataireTelephone(e.target.value)}
                        required
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Numéro appelé par le transporteur ou point relais pour le retrait.</p>
                    </div>
                  </div>
                </div>

                {/* Instructions spécifiques */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Consignes particulières ou créneau souhaité <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    className={inp}
                    placeholder="Ex: Prévenir 30 min avant, livraison souhaitée en matinée..."
                    value={instructionsLivraison}
                    onChange={e => setInstructionsLivraison(e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Bouton vers Étape 2 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-ldf-primary py-3.5 px-8 text-base shadow-lg hover:shadow-xl group flex items-center gap-2.5 rounded-xl font-bold"
              >
                Continuer : Sélection des fournisseurs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        )}

        {/* ÉTAPE 2 : SÉLECTION DES FOURNISSEURS & CONFIGURATION */}
        {step === 2 && (
          <div className="space-y-6 slide-in">

            {/* 2.1 Sélection des fournisseurs agréés */}
            <SectionCard
              title="Sélection des fournisseurs agréés Vitalis"
              icon={Building2}
              badge={`${selectedFournisseurs.length} sélectionné${selectedFournisseurs.length > 1 ? "s" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Cochez le ou les partenaires auprès desquels vous souhaitez solliciter un devis chiffré (1 devis établi par fournisseur sélectionné) :
                </p>
              </div>

              {/* Grille des 10 fournisseurs agréés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {filteredFournisseurs.map(f => {
                  const isSelected = selectedFournisseurs.includes(f.id);
                  const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);

                  // Logique de recommandation par catégorie
                  const cat = (categorie || "").toLowerCase();
                  const s = (f.nom || "").toLowerCase();
                  const isRecommended =
                    (cat.includes("auto") && (s.includes("socida") || s.includes("rymco") || s.includes("rimco") || s.includes("atc") || s.includes("comafrique"))) ||
                    (cat.includes("logement") && (s.includes("oribat") || s.includes("inovim") || s.includes("kaydan") || s.includes("sodimac") || s.includes("sodismad"))) ||
                    ((cat.includes("ciment") || cat.includes("materia") || cat.includes("batiment")) && (s.includes("bernabe") || s.includes("sodimac") || s.includes("sodismad") || s.includes("kaydan"))) ||
                    ((cat.includes("peinture") || cat.includes("revetement")) && (s.includes("drocolor") || s.includes("sippec"))) ||
                    (cat.includes("electro") && (s.includes("lg") || s.includes("sociam"))) ||
                    (cat.includes("image") && (s.includes("lg") || s.includes("sociam") || s.includes("comafrique") || s.includes("atc"))) ||
                    (cat.includes("informatique") && (s.includes("comafrique") || s.includes("atc"))) ||
                    (cat.includes("fourniture") && (s.includes("librairie") || s.includes("ldf"))) ||
                    ((cat.includes("mobilier") || cat.includes("interieur")) && (s.includes("technibat") || s.includes("inovim") || s.includes("librairie"))) ||
                    (cat.includes("outil") && (s.includes("bernabe") || s.includes("sodimac") || s.includes("sodismad") || s.includes("rymco")));

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFournisseur(f.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all group relative overflow-hidden flex items-start gap-3.5
                        ${isSelected
                          ? "border-[#ff6b35] bg-orange-50/70 shadow-sm ring-1 ring-[#ff6b35]/30"
                          : isRecommended
                            ? "border-orange-200 bg-orange-50/20 hover:border-orange-300"
                            : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                        ${isSelected ? "bg-[#ff6b35] border-[#ff6b35]" : "border-gray-300 group-hover:border-orange-400 bg-white"}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      {/* Logo officiel du fournisseur */}
                      <div className="w-13 h-13 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center flex-shrink-0 shadow-xs">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt={f.nom}
                            width={46}
                            height={46}
                            className="object-contain max-w-full max-h-full rounded"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-[#ff6b35]" : "text-[#0B2447]"}`}>
                            {f.nom}
                          </p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 border border-emerald-200 rounded font-medium">
                            Agréé
                          </span>
                          {isRecommended && (
                            <span className="text-[9px] bg-orange-100 text-orange-800 px-1.5 py-0.2 border border-orange-200 rounded font-bold">
                              Recommandé
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                          {f.secteurActivite || f.raisonSociale}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {f.ville}{f.quartier ? ` · ${f.quartier}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* 2.2 Modalités de financement & Précisions */}
            <SectionCard title="Modalités de Financement & Précisions" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Durée de financement</label>
                  <select className={sel} value={duree} disabled={false}>
                    <option value={36}>36 mois</option>
                    <option value={60}>60 mois</option>
                    <option value={96}>96 mois</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Échéances mensuelles prélevées sur votre compte bancaire AFG.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mode de règlement des articles</label>
                  <div className="px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-medium">
                    Règlement direct des fournisseurs par AFG Bank après accord de crédit.
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Vous n'avancez aucun fond directement au fournisseur.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Remarques ou instructions particulières <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <textarea
                    className={`${inp} min-h-[90px] resize-y`}
                    placeholder="Avez-vous déjà un numéro de proforma, un contact en magasin ou un besoin de livraison urgente ?"
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Boutons Étape 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'étape 1
              </button>

              <button
                type="submit"
                disabled={submitting || selectedFournisseurs.length === 0}
                className="w-full sm:w-auto btn-ldf-primary py-3.5 px-8 text-base shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2.5 rounded-xl font-bold"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="w-5 h-5" /> Soumettre ma demande de financement</>
                )}
              </button>
            </div>

          </div>
        )}

      </form>

    </div>
  );
}
