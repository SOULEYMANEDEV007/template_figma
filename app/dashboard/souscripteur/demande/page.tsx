// @ts-nocheck
"use client";

import { emitInAppNotification, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { OFFICIAL_FOURNISSEURS } from "@/lib/constants";
import { LISTE_REGIONS_CI, getVillesParRegion, getCommunesParVille } from "@/lib/constants/geography";
import { BesoinsMultiplesList, type LigneBesoinItem } from "@/components/souscription/BesoinsMultiplesList";
import {
  ArrowLeft, ArrowRight, Building2, Check, FileText, Home, MapPin,
  Package, Send, Loader2, Store, Truck, UserCheck, PhoneCall, ShieldCheck,
  Sparkles, Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

// ── Étapes de progression horizontale ────────────────────────────
const STEPS = [
  { id: 1, label: "Besoins & Fournisseurs Agréés", icon: Package },
  { id: 2, label: "Agence AFG & Modalités de Livraison", icon: MapPin },
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

  // --- Étape 1 : Liste dynamique des Besoins & Fournisseurs associés ---
  const [besoins, setBesoins] = useState<LigneBesoinItem[]>([
    {
      id: `BSN-${Date.now()}-1`,
      nature: "Éducation & Fournitures scolaires",
      categorie: "Livres & Manuels scolaires",
      produitRecherche: "",
      montantEstime: "",
      fournisseurId: "FOUR-LDF-001",
      fournisseurNom: "Librairie de France Groupe",
    },
  ]);

  const [duree, setDuree] = useState(36);
  const [observations, setObservations] = useState("");

  // --- Étape 2 : Agence AFG, Localisation & Modalités de livraison ---
  const [agenceAfgId, setAgenceAfgId] = useState("");

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

  const selectedRelais = useMemo(() => {
    return (pointsRelais || []).find(p => p.id === pointRelaisId);
  }, [pointsRelais, pointRelaisId]);

  const selectedAgence = useMemo(() => {
    return (agencesAFG || []).find(a => a.id === agenceAfgId);
  }, [agencesAFG, agenceAfgId]);

  // Validation étape 1
  const validateStep1 = () => {
    if (!besoins || besoins.length === 0) {
      toast.error("Veuillez renseigner au moins un besoin.");
      return false;
    }

    for (let i = 0; i < besoins.length; i++) {
      const b = besoins[i];
      if (!b.nature) {
        toast.error(`Besoin #${i + 1} : Veuillez sélectionner la nature du besoin.`);
        return false;
      }
      if (!b.produitRecherche || b.produitRecherche.trim().length < 3) {
        toast.error(`Besoin #${i + 1} : Veuillez décrire précisément les articles souhaités.`);
        return false;
      }
      if (!b.fournisseurId) {
        toast.error(`Besoin #${i + 1} : Veuillez sélectionner un fournisseur agréé pour ce besoin.`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (!region || !ville || !commune) {
      toast.error("Veuillez renseigner la région, la ville et la commune de localisation.");
      return;
    }

    if (modeLivraison === "point_relais" && !pointRelaisId) {
      toast.error("Veuillez sélectionner un point relais de récupération.");
      return;
    }

    if (modeLivraison === "domicile" && !adresseLivraison) {
      toast.error("Veuillez préciser l'adresse exacte de livraison.");
      return;
    }

    if (!destinataireTelephone) {
      toast.error("Veuillez renseigner le téléphone du destinataire.");
      return;
    }

    setSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const seq = String(Date.now()).slice(-4);
      const ref = `VF-${year}-${seq}`;

      // Extraire les fournisseurs distincts
      const fournisseursMap = new Map<string, string>();
      besoins.forEach(b => {
        if (b.fournisseurId && b.fournisseurNom) {
          fournisseursMap.set(b.fournisseurId, b.fournisseurNom);
        }
      });

      const fournisseursChoisis = Array.from(fournisseursMap.entries()).map(([fournisseurId, fournisseurNom]) => ({
        fournisseurId,
        fournisseurNom,
        statut: "en_attente" as const,
      }));

      // Calcul du montant total estimatif
      const montantTotalNum = besoins.reduce((acc, b) => {
        const val = typeof b.montantEstime === "string"
          ? parseFloat(b.montantEstime.replace(/\s/g, "")) || 0
          : Number(b.montantEstime) || 0;
        return acc + val;
      }, 0);

      const nomClient = (user?.lastName || user?.nom || "Konan").trim();
      const prenomClient = (user?.firstName || user?.prenom || "Awa").trim();
      const emailClient = user?.email || "client@viflo.ci";
      const telClient = user?.phone || user?.telephone || "+225 07 00 11 22 33";

      // Synthèse détaillée structurée des besoins exprimés
      const resumeBesoins = besoins.map((b, idx) => {
        const montantStr = b.montantEstime ? ` (Budget indicatif: ${fmtCFA(Number(b.montantEstime))})` : "";
        return `[Besoin ${idx + 1}] Secteur: ${b.nature} | Catégorie: ${b.categorie || "Général"} | Fournisseur: ${b.fournisseurNom} | Articles: ${b.produitRecherche}${montantStr}`;
      }).join("\n");

      const livraisonStr = `Livraison: [${modeLivraison === "point_relais" ? "Point Relais: " + (selectedRelais?.nom || pointRelaisId) : "Domicile: " + adresseLivraison}] | Zone: ${commune}, ${ville} (${region}) | Destinataire: ${destinataireNom || (prenomClient + " " + nomClient)} (${destinataireTelephone || telClient})${instructionsLivraison ? ` | Instructions: ${instructionsLivraison}` : ""}`;

      const obsFinale = `${resumeBesoins}\n\n${livraisonStr}${selectedAgence ? `\nAgence AFG Bank: ${selectedAgence.nom}` : ""}${observations ? `\nNotes client: ${observations}` : ""}`;

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
        montantTotal: montantTotalNum || 0,
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
        observations: obsFinale,
      });

      // Notification pour chaque fournisseur concerné (dans son espace isolé)
      fournisseursChoisis.forEach(f => {
        emitInAppNotification({
          titre: `Nouvelle demande de devis — ${ref}`,
          message: `${prenomClient} ${nomClient} sollicite un devis chiffré pour votre enseigne.`,
          categorie: "devis",
          reference: ref,
          lien: `/dashboard/souscriptions/${nouvelle.id}`,
          roles: ["fournisseur"],
        });
      });

      // Notification pour les super-admins et la banque
      emitInAppNotification({
        titre: `Nouvelle demande multi-besoins — ${ref}`,
        message: `${prenomClient} ${nomClient} a initié une demande pour ${fournisseursChoisis.length} fournisseur(s) (${fournisseursChoisis.map(f => f.fournisseurNom).join(", ")}).`,
        categorie: "souscription",
        reference: ref,
        lien: `/dashboard/souscriptions/${nouvelle.id}`,
        roles: ["admin", "banque", "owner"],
      });

      // Notification pour le souscripteur lui-même
      emitInAppNotification({
        titre: `Demande de financement ${ref} transmise`,
        message: `Votre demande pour ${besoins.length} besoin(s) auprès de ${fournisseursChoisis.length} fournisseur(s) a été transmise. Chaque fournisseur établira son devis chiffré.`,
        categorie: "souscription",
        reference: ref,
        lien: `/dashboard/souscriptions/${nouvelle.id}`,
        roles: ["souscripteur"],
      });

      toast.success(`Demande ${ref} transmise avec succès !`, {
        description: `${fournisseursChoisis.length} devis séparé(s) sont en cours d'établissement auprès des fournisseurs sélectionnés.`,
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

      {/* ─── Indicateur de progression horizontale ─── */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
        <StepIndicator
          current={step}
          onStepClick={(s) => {
            if (s === 1) {
              setStep(1);
            } else if (validateStep1()) {
              setStep(2);
            }
          }}
        />
      </div>

      {/* ─── Formulaire principal ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ÉTAPE 1 : EXPRESSION DES BESOINS MULTIPLES & FOURNISSEURS */}
        {step === 1 && (
          <div className="space-y-6 slide-in">
            <BesoinsMultiplesList
              besoins={besoins}
              onChange={setBesoins}
              isBoutique={false}
            />

            {/* Durée du financement */}
            <SectionCard title="Modalités de Financement" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Durée de remboursement souhaitée</label>
                  <select className={sel} value={duree} onChange={e => setDuree(Number(e.target.value))}>
                    <option value={36}>36 mois (Programme standard Vitalis)</option>
                    <option value={48}>48 mois</option>
                    <option value={60}>60 mois</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Taux bonifié Vitalis FADES avec AFG Bank.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Modalités de règlement fournisseurs</label>
                  <div className="px-3.5 py-2.5 text-xs rounded-xl bg-orange-50/70 border border-orange-200/80 text-orange-950 font-medium">
                    AFG Bank effectue le règlement direct à chacun de vos fournisseurs partenaires dès accord de financement.
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Vous ne réalisez aucune avance financière en boutique.</p>
                </div>
              </div>
            </SectionCard>

            {/* Bouton vers Étape 2 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-ldf-primary py-3.5 px-8 text-base shadow-lg hover:shadow-xl group flex items-center gap-2.5 rounded-xl font-bold cursor-pointer"
              >
                Continuer : Agence AFG & Livraison
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : AGENCE AFG, LOCALISATION & MODALITÉS DE LIVRAISON */}
        {step === 2 && (
          <div className="space-y-6 slide-in">

            {/* 2.1 Agence AFG Bank */}
            <SectionCard title="Agence AFG Bank de dépôt" icon={Building2} badge="Banque financeuse unique">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Agence AFG Bank de rattachement <span className="text-gray-400 font-normal">(Optionnel)</span>
                </label>
                <select className={sel} value={agenceAfgId} onChange={e => setAgenceAfgId(e.target.value)}>
                  <option value="">Sélectionnez l'agence AFG Bank la plus proche...</option>
                  {(agencesAFG || []).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nom} — {a.ville} ({a.adresse})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Agence où vous déposerez votre dossier physique consolidé (fiche d'adhésion signée + vos devis).
                </p>
              </div>
            </SectionCard>

            {/* 2.2 Localisation géographique */}
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
                </div>
              </div>
            </SectionCard>

            {/* 2.3 Modalités & Destination de la livraison */}
            <SectionCard title="Modalités & Destination de la livraison" icon={Truck}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Mode de livraison souhaité *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModeLivraison("point_relais")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${modeLivraison === "point_relais"
                        ? "border-orange-500 bg-orange-50/70 shadow-xs ring-1 ring-orange-400/40"
                        : "border-gray-200 hover:border-orange-200 bg-white"
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${modeLivraison === "point_relais" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Point Relais Partenaires Agréés</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Retrait sécurisé dans un point relais de votre zone</p>
                      </div>
                    </button>

                    {/*<button
                      type="button"
                      disabled={true}
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
                    </button>*/}
                  </div>
                </div>

                {modeLivraison === "point_relais" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Sélectionnez votre Point Relais de récupération *
                    </label>
                    <select className={sel} value={pointRelaisId} onChange={e => setPointRelaisId(e.target.value)} required>
                      <option value="">Sélectionnez un point relais partenaire...</option>
                      {(pointsRelais || []).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.ville} — {p.nom} ({p.quartier} - {p.adresse})
                        </option>
                      ))}
                    </select>

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
                      <p className="text-[11px] text-gray-400 mt-1">Numéro contacté lors de la mise à disposition de vos colis.</p>
                    </div>
                  </div>
                </div>

                {/* Consignes particulières */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Consignes particulières ou observations <span className="text-gray-400 font-normal">(Optionnel)</span>
                  </label>
                  <textarea
                    rows={2}
                    className={`${inp} resize-y`}
                    placeholder="Instructions supplémentaires, contraintes horaires, etc."
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Note d'information et confidentialité */}
            <div className="p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 space-y-1">
                <p className="font-bold">Confidentialité & Règle d'Isolation ViFlo</p>
                <p className="leading-relaxed text-blue-900">
                  Votre souscription générera un devis distinct par fournisseur sélectionné.
                  <strong> Chaque fournisseur n'aura accès qu'à son propre devis et ses propres articles</strong>, sans voir les autres fournisseurs intervenant sur votre dossier. Seuls vous, votre agence AFG Bank et la supervision ViFlo bénéficierez de la vue d'ensemble consolidée.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux besoins
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto btn-ldf-primary py-3.5 px-8 text-base shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2.5 rounded-xl font-bold cursor-pointer"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Transmission en cours...</>
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
