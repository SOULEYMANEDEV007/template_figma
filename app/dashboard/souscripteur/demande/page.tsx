// @ts-nocheck
"use client";

import { emitInAppNotification, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { OFFICIAL_FOURNISSEURS, getPartnerLogo, CATEGORIES_BESOIN, NATURES_BESOIN } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, MapPin, Package, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-[#0B2447]">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

const sel = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all cursor-pointer";
const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all";

export default function NouvelleDemandeSouscripteur() {
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const { fournisseurs, agencesAFG, pointsRelais, addSouscription } = useVitalisDb();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- Étape 1 : Expression du besoin ---
  const [natureBesoin, setNatureBesoin] = useState("");
  const [categorie, setCategorie] = useState("");
  const [produitRecherche, setProduitRecherche] = useState("");
  const [region, setRegion] = useState("");
  const [ville, setVille] = useState("");
  const [pointRelaisId, setPointRelaisId] = useState("");

  // --- Étape 2 : Configuration & Fournisseurs ---
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<string[]>([]);
  const [duree, setDuree] = useState(36);
  const [observations, setObservations] = useState("");

  // Fournisseurs agréés officiels Vitalis
  const filteredFournisseurs = useMemo(() => {
    const list = (fournisseurs && fournisseurs.length >= 8) ? fournisseurs : OFFICIAL_FOURNISSEURS;
    return list.filter(f => f.statut === "actif");
  }, [fournisseurs]);

  const toggleFournisseur = (id: string) => {
    setSelectedFournisseurs(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (!natureBesoin || !categorie || !produitRecherche || !region || !ville || !pointRelaisId) {
      toast.error("Veuillez remplir tous les champs obligatoires de l'étape 1.");
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
        fournisseurs: fournisseursChoisis,
        fournisseurNom: fournisseursChoisis.map(f => f.fournisseurNom).join(", "),
        montantTotal: 0,
        duree,
        statut: "en_attente",
        dateCreation: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
        observations: `Besoin: ${natureBesoin} | Catégorie: ${categorie} | Produit: ${produitRecherche} | Zone: ${ville}, ${region} | Relais: ${pointsRelais?.find(p => p.id === pointRelaisId)?.nom || pointRelaisId}${observations ? `\nNotes: ${observations}` : ""}`,
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
        message: `Votre demande pour "${produitRecherche}" a été envoyée aux fournisseurs agréés. Vous recevrez une alerte dès qu'un devis sera établi.`,
        categorie: "souscription",
        reference: ref,
        lien: `/dashboard/souscriptions/${nouvelle.id}`,
        roles: ["souscripteur"],
      });

      toast.success(`Demande ${ref} transmise avec succès !`, {
        description: "Les fournisseurs sélectionnés ont été notifiés pour établir votre devis."
      });
      router.push(`/dashboard/souscriptions/${nouvelle.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else router.back();
          }}
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0B2447]">Demander un financement</h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? "Étape 1/2 : Identification du besoin" : "Étape 2/2 : Sélection du fournisseur et configuration"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {step === 1 && (
          <div className="space-y-6 slide-in">
            <SectionCard title="Détails du besoin" icon={Package}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Nature du besoin *</label>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Catégorie *</label>
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Description détaillée du besoin *</label>
                  <textarea
                    className={`${inp} min-h-[120px] resize-y`}
                    placeholder="Décrivez précisément votre besoin (ex: Ordinateur portable HP Core i7 avec sacoche, Réfrigérateur double battant de marque X, etc.)..."
                    value={produitRecherche}
                    onChange={e => setProduitRecherche(e.target.value)}
                    required
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Zone géographique" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Région *</label>
                  <select className={sel} value={region} onChange={e => setRegion(e.target.value)} required>
                    <option value="">Sélectionnez la région</option>
                    <option value="Abidjan">District d'Abidjan</option>
                    <option value="Gbeke">Gbêkê (Bouaké)</option>
                    <option value="San Pedro">San Pedro</option>
                    <option value="Poro">Poro (Korhogo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Ville / Commune *</label>
                  <input
                    type="text"
                    className={inp}
                    placeholder="Ex: Cocody, Bouaké, etc."
                    value={ville}
                    onChange={e => setVille(e.target.value)}
                    required
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Point de vente fournisseur" icon={Package}>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Point Relais (Lieu de récupération souhaité) *</label>
                <select className={sel} value={pointRelaisId} onChange={e => setPointRelaisId(e.target.value)} required>
                  <option value="">Sélectionnez un point relais de livraison</option>
                  {(pointsRelais || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.ville} - {p.nom} ({p.quartier})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Vous pourrez récupérer vos articles commandés dans ce point relais si le financement est accordé.</p>
              </div>
            </SectionCard>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-ldf-primary py-3 px-8 text-base shadow-lg hover:shadow-xl group"
              >
                Suivant : Sélection du fournisseur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 slide-in">
            <SectionCard title="Sélection des fournisseurs agréés" icon={Building2}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <p className="text-sm text-gray-600">
                  Sélectionnez le ou les fournisseurs agréés partenaires pour l'établissement de vos devis (plusieurs choix possibles) :
                </p>
                <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold w-fit">
                  {selectedFournisseurs.length} sélectionné{selectedFournisseurs.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredFournisseurs.map(f => {
                  const isSelected = selectedFournisseurs.includes(f.id);
                  const logoSrc = f.logo || getPartnerLogo(f.nom, f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFournisseur(f.id)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all group relative overflow-hidden flex items-center gap-3.5
                        ${isSelected ? "border-[#ff6b35] bg-orange-50/60 shadow-sm ring-1 ring-[#ff6b35]/30" : "border-gray-200 hover:border-orange-300 bg-white"}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected ? "bg-[#ff6b35] border-[#ff6b35]" : "border-gray-300 group-hover:border-orange-400"}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      {/* Logo du fournisseur */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt={f.nom}
                            width={42}
                            height={42}
                            className="object-contain max-w-full max-h-full rounded"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-[#ff6b35]" : "text-[#0B2447]"}`}>{f.nom}</p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 border border-emerald-200 rounded-md font-medium">Agréé</span>
                          {(() => {
                            const cat = (categorie || "").toLowerCase();
                            const s = f.nom.toLowerCase();
                            const match =
                              (cat.includes("auto") && s.includes("rymco")) ||
                              ((cat.includes("ciment") || cat.includes("materia") || cat.includes("logement")) && s.includes("sodimac")) ||
                              (cat.includes("peinture") && (s.includes("drocolor") || s.includes("sodimac"))) ||
                              (cat.includes("electro") && (s.includes("nasco") || s.includes("lg") || s.includes("sociam"))) ||
                              (cat.includes("image") && (s.includes("lg") || s.includes("sociam") || s.includes("smart"))) ||
                              (cat.includes("informatique") && s.includes("smart")) ||
                              (cat.includes("fourniture") && s.includes("librairie")) ||
                              (cat.includes("mobilier") && (s.includes("nasco") || s.includes("librairie"))) ||
                              (cat.includes("outil") && (s.includes("sodimac") || s.includes("rymco")));
                            return match ? (
                              <span className="text-[9px] bg-orange-100 text-orange-800 px-1.5 py-0.5 border border-orange-200 rounded-md font-semibold">
                                Recommandé
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{f.secteurActivite || f.raisonSociale}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Durée du financement" icon={FileText}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Durée (mois)</label>
                <select className={sel} value={duree} disabled={true}>
                  {[36].map(d => (
                    <option key={d} value={d}>{d} mois {d === 36 ? "(Par défaut)" : d > 60 ? "(Salariés uniquement)" : ""}</option>
                  ))}
                </select>
                {/*<p className="text-[10px] text-gray-400 mt-2">Maximum 60 mois (Entreprises) ou 96 mois (Salariés).</p>*/}
              </SectionCard>
            </div>

            {/*<SectionCard title="Observations supplémentaires" icon={FileText}>
              <textarea
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all min-h-[100px]"
                placeholder="Précisions éventuelles sur votre besoin..."
                value={observations}
                onChange={e => setObservations(e.target.value)}
              />
            </SectionCard>*/}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-ldf-primary py-3 px-8 text-base shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="w-5 h-5" /> Soumettre ma demande</>
                )}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
