// @ts-nocheck
"use client";

import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, MapPin, Package, Send, Loader2 } from "lucide-react";
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
  const { fournisseurs, agencesAFG, addSouscription } = useVitalisDb();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- Étape 1 : Expression du besoin ---
  const [natureBesoin, setNatureBesoin] = useState("");
  const [categorie, setCategorie] = useState("");
  const [produitRecherche, setProduitRecherche] = useState("");
  const [montantEstimatif, setMontantEstimatif] = useState("");
  const [region, setRegion] = useState("");
  const [ville, setVille] = useState("");

  // --- Étape 2 : Configuration & Fournisseurs ---
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<string[]>([]);
  const [duree, setDuree] = useState(36);
  const [agenceId, setAgenceId] = useState("");
  const [observations, setObservations] = useState("");

  // Fournisseurs filtrés selon l'étape 1
  const filteredFournisseurs = useMemo(() => {
    return fournisseurs.filter(f => f.agreVitalis && f.statut === "actif");
    // Dans une vraie app, on filtrerait ici en fonction de la catégorie, région, ville, etc.
  }, [fournisseurs, categorie, ville]);

  const toggleFournisseur = (id: string) => {
    setSelectedFournisseurs(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (!natureBesoin || !categorie || !produitRecherche || !montantEstimatif || !region || !ville) {
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

      const agenceChoisie = agencesAFG.find(a => a.id === agenceId);
      const fournisseursChoisis = fournisseurs
        .filter(f => selectedFournisseurs.includes(f.id))
        .map(f => ({ fournisseurId: f.id, fournisseurNom: f.nom, statut: "en_attente" as const }));

      const nouvelle = addSouscription({
        reference: ref,
        souscripteurId: user?.id || `SCP-${Date.now()}`,
        souscripteurNom: user?.nom || "Souscripteur",
        souscripteurPrenom: user?.prenom || "Test",
        souscripteurEmail: user?.email || "",
        souscripteurTelephone: user?.telephone || "",
        typeSouscripteur: "physique",
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        agenceId: agenceId || undefined,
        agenceNom: agenceChoisie?.nom,
        fournisseurs: fournisseursChoisis,
        montantTotal: Number(montantEstimatif),
        duree,
        statut: "en_attente",
        dateCreation: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
        observations: `Besoin: ${natureBesoin} | Catégorie: ${categorie} | Produit: ${produitRecherche} | Zone: ${ville}, ${region}\nNotes: ${observations}`,
      });

      toast.success(`Demande ${ref} transmise avec succès !`, {
        description: "Les fournisseurs sélectionnés vont préparer vos devis."
      });
      router.push(`/dashboard/souscriptions/${nouvelle.id}`);
    } catch (err) {
      toast.error("Une erreur est survenue.");
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
                    <option value="">Sélectionnez la nature</option>
                    <option value="Equipement personnel">Équipement personnel</option>
                    <option value="Equipement professionnel">Équipement professionnel</option>
                    <option value="Scolarite / Etudes">Scolarité / Études</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Catégorie *</label>
                  <select className={sel} value={categorie} onChange={e => setCategorie(e.target.value)} required>
                    <option value="">Sélectionnez une catégorie</option>
                    <option value="Informatique & Multimedia">Informatique & Multimédia</option>
                    <option value="Electromenager">Électroménager</option>
                    <option value="Mobilier & Bureau">Mobilier & Bureau</option>
                    <option value="Fournitures scolaires">Fournitures scolaires</option>
                    <option value="Materiel de BTP">Matériel spécialisé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Produit recherché (Description courte) *</label>
                  <input
                    type="text"
                    className={inp}
                    placeholder="Ex: Ordinateur portable HP, Réfrigérateur, etc."
                    value={produitRecherche}
                    onChange={e => setProduitRecherche(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Montant estimatif (FCFA) *</label>
                  <input
                    type="number"
                    className={inp}
                    placeholder="Ex: 500000"
                    value={montantEstimatif}
                    onChange={e => setMontantEstimatif(e.target.value)}
                    min={0}
                    required
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Zone géographique de livraison / achat" icon={MapPin}>
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
            <SectionCard title="Sélection du fournisseur" icon={Building2}>
              <p className="text-sm text-gray-500 mb-4">
                Voici les fournisseurs agréés correspondant à votre besoin en <strong>{categorie || "produits"}</strong> dans la zone <strong>{ville || "choisie"}</strong> :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFournisseurs.map(f => {
                  const isSelected = selectedFournisseurs.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFournisseur(f.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all group relative overflow-hidden
                        ${isSelected ? "border-[#ff6b35] bg-orange-50/50" : "border-gray-200 hover:border-orange-300 bg-white"}`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected ? "bg-[#ff6b35] border-[#ff6b35]" : "border-gray-300 group-hover:border-orange-400"}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? "text-[#ff6b35]" : "text-[#0B2447]"}`}>{f.nom}</p>
                          <p className="text-[10px] text-gray-400 truncate">{f.raisonSociale}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Durée du financement" icon={FileText}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Durée (mois)</label>
                <select className={sel} value={duree} onChange={e => setDuree(Number(e.target.value))}>
                  {[12, 18, 24, 36, 48, 60, 72, 84, 96].map(d => (
                    <option key={d} value={d}>{d} mois {d === 36 ? "(Par défaut)" : d > 60 ? "(Salariés uniquement)" : ""}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-2">Maximum 60 mois (Entreprises) ou 96 mois (Salariés).</p>
              </SectionCard>

              <SectionCard title="Votre Agence AFG Bank" icon={Building2}>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Agence de rattachement</label>
                <select className={sel} value={agenceId} onChange={e => setAgenceId(e.target.value)} required>
                  <option value="">Sélectionner une agence</option>
                  {agencesAFG.map(a => (
                    <option key={a.id} value={a.id}>{a.nom} — {a.ville}</option>
                  ))}
                </select>
              </SectionCard>
            </div>

            <SectionCard title="Observations supplémentaires" icon={FileText}>
              <textarea
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-[#0B2447] focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all min-h-[100px]"
                placeholder="Précisions éventuelles sur votre besoin..."
                value={observations}
                onChange={e => setObservations(e.target.value)}
              />
            </SectionCard>

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
