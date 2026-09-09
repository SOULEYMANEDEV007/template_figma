"use client";
import { AFG_BANK, mockAgencesAFG, mockFournisseursVitalis, mockSouscripteursPhysiques, mockSouscripteursMorales } from "@/lib/vitalisData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { VITALIS_CONFIG, type SituationMatrimoniale, type SituationProfessionnelle, type TypeSouscripteur } from "@/types/vitalis";
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Check, Info, Plus, Save, Search, Trash2, User, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ============================================================
// ÉTAPES DU FORMULAIRE
// ============================================================
const STEPS = [
  "Recherche client",
  "Type & Identité",
  "Fournisseurs",
  "Configuration",
  "Confirmation"
];

// ============================================================
// COMPOSANT INDICATEUR D'ÉTAPES
// ============================================================
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5 min-w-fit">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < current ? "bg-emerald-500 text-white" :
                i === current ? "text-amber-900 shadow-md" :
                "bg-gray-100 text-gray-400"
              }`}
              style={i === current ? { background: "linear-gradient(135deg,#f6c90e,#f0a500)" } : {}}
            >
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium text-center max-w-[80px] ${
              i === current ? "text-amber-700" :
              i < current ? "text-emerald-600" :
              "text-gray-400"
            }`}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-16 mx-1 mb-5 transition-all ${
              i < current ? "bg-emerald-300" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function CreerSouscriptionVitalisPage() {
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ─── État : Recherche client ──────────────────────────────
  const [rechercheClient, setRechercheClient] = useState("");
  const [clientExistant, setClientExistant] = useState<any>(null);
  const [creerNouveauClient, setCreerNouveauClient] = useState(false);

  // ─── État : Type souscripteur ─────────────────────────────
  const [typeSouscripteur, setTypeSouscripteur] = useState<TypeSouscripteur | "">("");

  // ─── État : Personne Physique ─────────────────────────────
  const [formPhysique, setFormPhysique] = useState({
    nom: "", prenom: "", numeroCNI: "",
    dateNaissance: "", lieuNaissance: "",
    situationProfessionnelle: "" as SituationProfessionnelle | "",
    secteurActivite: "",
    situationMatrimoniale: "" as SituationMatrimoniale | "",
    entrepriseEmployeur: "",
    telephone: "", email: "",
    pays: "Côte d'Ivoire", region: "", ville: "", adresse: "",
    numeroCompte: "",
  });

  // ─── État : Personne Morale ───────────────────────────────
  const [formMorale, setFormMorale] = useState({
    nomEntreprise: "", secteurActivite: "",
    rccm: "", compteContribuable: "",
    nomDirecteurGeneral: "", prenomDirecteurGeneral: "",
    nombreEmployes: 0, dateCreationEntreprise: "",
    capitalSocial: 0,
    telephone: "", email: "",
    pays: "Côte d'Ivoire", region: "", ville: "", siegeSocial: "",
    numeroCompte: "",
  });

  // ─── État : Fournisseurs ──────────────────────────────────
  const [fournisseursSelectionnes, setFournisseursSelectionnes] = useState<string[]>([]);

  // ─── État : Configuration ─────────────────────────────────
  const [agenceAFGId, setAgenceAFGId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [duree, setDuree] = useState(VITALIS_CONFIG.DUREE_PAR_DEFAUT);
  const [observations, setObservations] = useState("");

  // ============================================================
  // HANDLERS
  // ============================================================

  // ─── Recherche client ─────────────────────────────────────
  const handleRechercheClient = () => {
    if (!rechercheClient.trim()) {
      toast.error("Veuillez saisir un critère de recherche");
      return;
    }

    const search = rechercheClient.toLowerCase();
    
    // Recherche parmi physiques
    const physique = mockSouscripteursPhysiques.find(s =>
      s.nom.toLowerCase().includes(search) ||
      s.prenom.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.numeroCNI.toLowerCase().includes(search) ||
      s.telephone.includes(search)
    );

    if (physique) {
      setClientExistant(physique);
      setTypeSouscripteur("physique");
      toast.success(`Client trouvé : ${physique.prenom} ${physique.nom}`);
      return;
    }

    // Recherche parmi morales
    const morale = mockSouscripteursMorales.find(s =>
      s.nomEntreprise.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.rccm.toLowerCase().includes(search) ||
      s.telephone.includes(search)
    );

    if (morale) {
      setClientExistant(morale);
      setTypeSouscripteur("morale");
      toast.success(`Entreprise trouvée : ${morale.nomEntreprise}`);
      return;
    }

    toast.info("Aucun client trouvé. Vous pouvez en créer un nouveau.");
    setCreerNouveauClient(true);
  };

  // ─── Toggle fournisseur ───────────────────────────────────
  const toggleFournisseur = (fournisseurId: string) => {
    setFournisseursSelectionnes(prev =>
      prev.includes(fournisseurId)
        ? prev.filter(id => id !== fournisseurId)
        : [...prev, fournisseurId]
    );
  };

  // ─── Validation étape ─────────────────────────────────────
  const canNext = () => {
    if (step === 0) {
      return clientExistant || creerNouveauClient;
    }
    if (step === 1) {
      if (!typeSouscripteur) return false;
      if (typeSouscripteur === "physique") {
        return formPhysique.nom && formPhysique.prenom && formPhysique.numeroCNI && formPhysique.telephone;
      } else {
        return formMorale.nomEntreprise && formMorale.rccm && formMorale.telephone;
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

  // ─── Soumission ───────────────────────────────────────────
  const handleSubmit = async (asBrouillon = false) => {
    setSubmitting(true);
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

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">Nouvelle souscription Vitalis</h1>
          <p className="page-subtitle">Programme de financement AFG Bank — 36 mois</p>
        </div>
      </div>

      {/* Info Vitalis */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900 mb-1">Programme Vitalis — AFG Bank</p>
          <p className="text-amber-700">
            Financement sur {VITALIS_CONFIG.DUREE_PAR_DEFAUT} mois. Une souscription peut inclure plusieurs fournisseurs. 
            Consultez les <button className="underline font-medium hover:text-amber-900">conditions du programme</button>.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="section-card p-5">
        <StepIndicator current={step} />
      </div>

      {/* Form */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            {step === 0 && <Search className="w-4 h-4 text-amber-500" />}
            {step === 1 && (typeSouscripteur === "physique" ? <User className="w-4 h-4 text-amber-500" /> : <Building2 className="w-4 h-4 text-amber-500" />)}
            {step === 2 && <Users className="w-4 h-4 text-amber-500" />}
            {step === 3 && <Info className="w-4 h-4 text-amber-500" />}
            {step === 4 && <Check className="w-4 h-4 text-emerald-500" />}
            <h2 className="text-sm font-semibold text-gray-800">{STEPS[step]}</h2>
          </div>
          <span className="text-xs text-gray-400">Étape {step + 1}/{STEPS.length}</span>
        </div>

        <div className="section-card-body space-y-5">
          {/* ═══════════════════════════════════════════════════
              ÉTAPE 0 — Recherche client
          ═══════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Vérification obligatoire</p>
                  <p>Avant de créer une nouvelle souscription, vérifiez si le client existe déjà dans la base de données pour éviter les doublons.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={rechercheClient}
                  onChange={e => setRechercheClient(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRechercheClient()}
                  placeholder="Nom, prénom, email, CNI, RCCM, téléphone..."
                  className="ldf-input flex-1"
                />
                <button
                  onClick={handleRechercheClient}
                  className="btn-ldf-primary px-6"
                >
                  <Search className="w-4 h-4" /> Rechercher
                </button>
              </div>

              {clientExistant && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        {clientExistant.typeSouscripteur === "physique" ? (
                          <User className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Building2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {clientExistant.typeSouscripteur === "physique"
                            ? `${clientExistant.prenom} ${clientExistant.nom}`
                            : clientExistant.nomEntreprise}
                        </p>
                        <p className="text-xs text-gray-500">
                          {clientExistant.typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setClientExistant(null); setTypeSouscripteur(""); }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-emerald-600">Téléphone</p>
                      <p className="font-medium text-gray-800">{clientExistant.telephone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600">Email</p>
                      <p className="font-medium text-gray-800">{clientExistant.email}</p>
                    </div>
                    {clientExistant.typeSouscripteur === "physique" && (
                      <div>
                        <p className="text-xs text-emerald-600">N° CNI</p>
                        <p className="font-medium text-gray-800">{clientExistant.numeroCNI}</p>
                      </div>
                    )}
                    {clientExistant.typeSouscripteur === "morale" && (
                      <div>
                        <p className="text-xs text-emerald-600">RCCM</p>
                        <p className="font-medium text-gray-800">{clientExistant.rccm}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-emerald-600">Ville</p>
                      <p className="font-medium text-gray-800">{clientExistant.ville}</p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mt-3 font-medium">
                    ✓ Ce client sera utilisé pour la souscription
                  </p>
                </div>
              )}

              {!clientExistant && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {creerNouveauClient
                      ? "Aucun client trouvé. Vous allez créer un nouveau client."
                      : "Recherchez un client existant avant de continuer"}
                  </p>
                  {!creerNouveauClient && (
                    <button
                      onClick={() => setCreerNouveauClient(true)}
                      className="btn-ldf-outline text-sm"
                    >
                      <Plus className="w-4 h-4" /> Créer un nouveau client
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              ÉTAPE 1 — Type & Identité
          ═══════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Sélection type (si nouveau client) */}
              {!clientExistant && (
                <div>
                  <label className="ldf-label">Type de souscripteur *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTypeSouscripteur("physique")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        typeSouscripteur === "physique"
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <User className={`w-6 h-6 mx-auto mb-2 ${typeSouscripteur === "physique" ? "text-amber-600" : "text-gray-400"}`} />
                      <p className="font-semibold text-sm text-gray-900">Personne Physique</p>
                      <p className="text-xs text-gray-500 mt-1">Individu, Salarié, Fonctionnaire</p>
                    </button>
                    <button
                      onClick={() => setTypeSouscripteur("morale")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        typeSouscripteur === "morale"
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building2 className={`w-6 h-6 mx-auto mb-2 ${typeSouscripteur === "morale" ? "text-amber-600" : "text-gray-400"}`} />
                      <p className="font-semibold text-sm text-gray-900">Personne Morale</p>
                      <p className="text-xs text-gray-500 mt-1">Entreprise, Association, ONG</p>
                    </button>
                  </div>
                </div>
              )}

              {/* FORMULAIRE PERSONNE PHYSIQUE */}
              {typeSouscripteur === "physique" && !clientExistant && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="ldf-label">Nom *</label>
                    <input
                      type="text"
                      value={formPhysique.nom}
                      onChange={e => setFormPhysique(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Coulibaly"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Prénom *</label>
                    <input
                      type="text"
                      value={formPhysique.prenom}
                      onChange={e => setFormPhysique(f => ({ ...f, prenom: e.target.value }))}
                      placeholder="Mamadou"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">N° CNI *</label>
                    <input
                      type="text"
                      value={formPhysique.numeroCNI}
                      onChange={e => setFormPhysique(f => ({ ...f, numeroCNI: e.target.value }))}
                      placeholder="CI0012026001234"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Date de naissance</label>
                    <input
                      type="date"
                      value={formPhysique.dateNaissance}
                      onChange={e => setFormPhysique(f => ({ ...f, dateNaissance: e.target.value }))}
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Lieu de naissance</label>
                    <input
                      type="text"
                      value={formPhysique.lieuNaissance}
                      onChange={e => setFormPhysique(f => ({ ...f, lieuNaissance: e.target.value }))}
                      placeholder="Abidjan"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Situation professionnelle</label>
                    <select
                      value={formPhysique.situationProfessionnelle}
                      onChange={e => setFormPhysique(f => ({ ...f, situationProfessionnelle: e.target.value as any }))}
                      className="ldf-select"
                    >
                      <option value="">Sélectionner</option>
                      <option value="salarie">Salarié</option>
                      <option value="fonctionnaire">Fonctionnaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="ldf-label">Secteur d'activité</label>
                    <input
                      type="text"
                      value={formPhysique.secteurActivite}
                      onChange={e => setFormPhysique(f => ({ ...f, secteurActivite: e.target.value }))}
                      placeholder="Banque et Assurance"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Situation matrimoniale</label>
                    <select
                      value={formPhysique.situationMatrimoniale}
                      onChange={e => setFormPhysique(f => ({ ...f, situationMatrimoniale: e.target.value as any }))}
                      className="ldf-select"
                    >
                      <option value="">Sélectionner</option>
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf/Veuve</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">Entreprise employeur</label>
                    <input
                      type="text"
                      value={formPhysique.entrepriseEmployeur}
                      onChange={e => setFormPhysique(f => ({ ...f, entrepriseEmployeur: e.target.value }))}
                      placeholder="Société Générale CI"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Téléphone *</label>
                    <input
                      type="tel"
                      value={formPhysique.telephone}
                      onChange={e => setFormPhysique(f => ({ ...f, telephone: e.target.value }))}
                      placeholder="+225 07 00 00 00 00"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Email</label>
                    <input
                      type="email"
                      value={formPhysique.email}
                      onChange={e => setFormPhysique(f => ({ ...f, email: e.target.value }))}
                      placeholder="nom@email.ci"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Région</label>
                    <input
                      type="text"
                      value={formPhysique.region}
                      onChange={e => setFormPhysique(f => ({ ...f, region: e.target.value }))}
                      placeholder="Abidjan"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Ville</label>
                    <input
                      type="text"
                      value={formPhysique.ville}
                      onChange={e => setFormPhysique(f => ({ ...f, ville: e.target.value }))}
                      placeholder="Abidjan"
                      className="ldf-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">Adresse</label>
                    <input
                      type="text"
                      value={formPhysique.adresse}
                      onChange={e => setFormPhysique(f => ({ ...f, adresse: e.target.value }))}
                      placeholder="Lot 45 Résidence Les Flamboyants, Cocody"
                      className="ldf-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">N° de compte bancaire</label>
                    <input
                      type="text"
                      value={formPhysique.numeroCompte}
                      onChange={e => setFormPhysique(f => ({ ...f, numeroCompte: e.target.value }))}
                      placeholder="CI93AFG..."
                      className="ldf-input"
                    />
                  </div>
                </div>
              )}

              {/* FORMULAIRE PERSONNE MORALE */}
              {typeSouscripteur === "morale" && !clientExistant && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="ldf-label">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={formMorale.nomEntreprise}
                      onChange={e => setFormMorale(f => ({ ...f, nomEntreprise: e.target.value }))}
                      placeholder="Tech Solutions CI SARL"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">RCCM *</label>
                    <input
                      type="text"
                      value={formMorale.rccm}
                      onChange={e => setFormMorale(f => ({ ...f, rccm: e.target.value }))}
                      placeholder="CI-ABJ-2022-B-99999"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Compte contribuable</label>
                    <input
                      type="text"
                      value={formMorale.compteContribuable}
                      onChange={e => setFormMorale(f => ({ ...f, compteContribuable: e.target.value }))}
                      placeholder="1122334455"
                      className="ldf-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">Secteur d'activité</label>
                    <input
                      type="text"
                      value={formMorale.secteurActivite}
                      onChange={e => setFormMorale(f => ({ ...f, secteurActivite: e.target.value }))}
                      placeholder="Technologie et Informatique"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Nom du Directeur Général</label>
                    <input
                      type="text"
                      value={formMorale.nomDirecteurGeneral}
                      onChange={e => setFormMorale(f => ({ ...f, nomDirecteurGeneral: e.target.value }))}
                      placeholder="Touré"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Prénom du Directeur Général</label>
                    <input
                      type="text"
                      value={formMorale.prenomDirecteurGeneral}
                      onChange={e => setFormMorale(f => ({ ...f, prenomDirecteurGeneral: e.target.value }))}
                      placeholder="Aminata"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Nombre d'employés</label>
                    <input
                      type="number"
                      value={formMorale.nombreEmployes}
                      onChange={e => setFormMorale(f => ({ ...f, nombreEmployes: parseInt(e.target.value) || 0 }))}
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Date de création</label>
                    <input
                      type="date"
                      value={formMorale.dateCreationEntreprise}
                      onChange={e => setFormMorale(f => ({ ...f, dateCreationEntreprise: e.target.value }))}
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Capital social (FCFA)</label>
                    <input
                      type="number"
                      value={formMorale.capitalSocial}
                      onChange={e => setFormMorale(f => ({ ...f, capitalSocial: parseFloat(e.target.value) || 0 }))}
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Téléphone *</label>
                    <input
                      type="tel"
                      value={formMorale.telephone}
                      onChange={e => setFormMorale(f => ({ ...f, telephone: e.target.value }))}
                      placeholder="+225 07 00 00 00 00"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Email</label>
                    <input
                      type="email"
                      value={formMorale.email}
                      onChange={e => setFormMorale(f => ({ ...f, email: e.target.value }))}
                      placeholder="contact@entreprise.ci"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Région</label>
                    <input
                      type="text"
                      value={formMorale.region}
                      onChange={e => setFormMorale(f => ({ ...f, region: e.target.value }))}
                      placeholder="Abidjan"
                      className="ldf-input"
                    />
                  </div>
                  <div>
                    <label className="ldf-label">Ville</label>
                    <input
                      type="text"
                      value={formMorale.ville}
                      onChange={e => setFormMorale(f => ({ ...f, ville: e.target.value }))}
                      placeholder="Abidjan"
                      className="ldf-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">Siège social</label>
                    <input
                      type="text"
                      value={formMorale.siegeSocial}
                      onChange={e => setFormMorale(f => ({ ...f, siegeSocial: e.target.value }))}
                      placeholder="Immeuble Alpha 2000, 7ème étage, Plateau"
                      className="ldf-input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="ldf-label">N° de compte bancaire</label>
                    <input
                      type="text"
                      value={formMorale.numeroCompte}
                      onChange={e => setFormMorale(f => ({ ...f, numeroCompte: e.target.value }))}
                      placeholder="CI93AFG..."
                      className="ldf-input"
                    />
                  </div>
                </div>
              )}

              {/* CLIENT EXISTANT - Info seulement */}
              {clientExistant && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Les informations ci-dessous seront utilisées pour la souscription :</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {clientExistant.typeSouscripteur === "physique" ? (
                      <>
                        <div><span className="text-gray-500">Nom complet :</span> <span className="font-medium">{clientExistant.prenom} {clientExistant.nom}</span></div>
                        <div><span className="text-gray-500">CNI :</span> <span className="font-medium">{clientExistant.numeroCNI}</span></div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-gray-500">Entreprise :</span> <span className="font-medium">{clientExistant.nomEntreprise}</span></div>
                        <div><span className="text-gray-500">RCCM :</span> <span className="font-medium">{clientExistant.rccm}</span></div>
                      </>
                    )}
                    <div><span className="text-gray-500">Téléphone :</span> <span className="font-medium">{clientExistant.telephone}</span></div>
                    <div><span className="text-gray-500">Ville :</span> <span className="font-medium">{clientExistant.ville}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              ÉTAPE 2 — Fournisseurs
          ═══════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p><strong>Sélection multiple :</strong> Vous pouvez associer plusieurs fournisseurs à cette souscription. Chaque fournisseur créera son propre devis.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockFournisseursVitalis.filter(f => f.statut === "actif" && f.agreVitalis).map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggleFournisseur(f.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      fournisseursSelectionnes.includes(f.id)
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          fournisseursSelectionnes.includes(f.id) ? "bg-amber-200 text-amber-700" : "bg-gray-200 text-gray-600"
                        }`}>
                          {f.code.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{f.nom}</p>
                          <p className="text-xs text-gray-500">{f.ville}</p>
                        </div>
                      </div>
                      {fournisseursSelectionnes.includes(f.id) && (
                        <Check className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Agréé Vitalis
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {fournisseursSelectionnes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    {fournisseursSelectionnes.length} fournisseur(s) sélectionné(s) :
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {fournisseursSelectionnes.map(id => {
                      const f = mockFournisseursVitalis.find(fr => fr.id === id);
                      return <li key={id}>• {f?.nom}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              ÉTAPE 3 — Configuration
          ═══════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">
              {/* AFG Bank (info seulement) */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    AFG
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{AFG_BANK.nom}</p>
                    <p className="text-xs text-gray-500">Banque financeuse unique du programme Vitalis</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="ldf-label">Agence AFG Bank *</label>
                  <select
                    value={agenceAFGId}
                    onChange={e => setAgenceAFGId(e.target.value)}
                    className="ldf-select"
                  >
                    <option value="">Sélectionner une agence</option>
                    {mockAgencesAFG.filter(a => a.statut === "active").map(a => (
                      <option key={a.id} value={a.id}>{a.nom} — {a.ville}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ldf-label">Date de début souhaitée *</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="ldf-input"
                  />
                </div>
                <div>
                  <label className="ldf-label">Durée du programme (mois) *</label>
                  <select
                    value={duree}
                    onChange={e => setDuree(parseInt(e.target.value))}
                    className="ldf-select"
                  >
                    <option value="12">12 mois</option>
                    <option value="24">24 mois</option>
                    <option value="36">36 mois (recommandé)</option>
                    <option value="48">48 mois</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Durée par défaut : {VITALIS_CONFIG.DUREE_PAR_DEFAUT} mois</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="ldf-label">Observations</label>
                  <textarea
                    rows={3}
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                    placeholder="Informations complémentaires, demandes spécifiques..."
                    className="ldf-input resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              ÉTAPE 4 — Confirmation
          ═══════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-amber-800 mb-4">Récapitulatif de la souscription Vitalis</h3>
                
                {/* Client */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-amber-600 mb-2">CLIENT</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-amber-600">Type</p>
                      <p className="font-medium text-gray-800">
                        {typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Identité</p>
                      <p className="font-medium text-gray-800">
                        {clientExistant
                          ? (clientExistant.typeSouscripteur === "physique"
                              ? `${clientExistant.prenom} ${clientExistant.nom}`
                              : clientExistant.nomEntreprise)
                          : (typeSouscripteur === "physique"
                              ? `${formPhysique.prenom} ${formPhysique.nom}`
                              : formMorale.nomEntreprise)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banque */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-amber-600 mb-2">FINANCEMENT</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-amber-600">Banque</p>
                      <p className="font-medium text-gray-800">{AFG_BANK.nom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Agence</p>
                      <p className="font-medium text-gray-800">
                        {mockAgencesAFG.find(a => a.id === agenceAFGId)?.nom || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Date de début</p>
                      <p className="font-medium text-gray-800">
                        {dateDebut ? new Date(dateDebut).toLocaleDateString("fr-FR") : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Durée</p>
                      <p className="font-medium text-gray-800">{duree} mois</p>
                    </div>
                  </div>
                </div>

                {/* Fournisseurs */}
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2">FOURNISSEURS ASSOCIÉS ({fournisseursSelectionnes.length})</p>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {fournisseursSelectionnes.map(id => {
                      const f = mockFournisseursVitalis.find(fr => fr.id === id);
                      return <li key={id} className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-600" /> {f?.nom}</li>;
                    })}
                  </ul>
                  <p className="text-xs text-amber-600 mt-2 italic">Chaque fournisseur créera son propre devis</p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Vérifiez les informations ci-dessus avant de soumettre la souscription. Les fournisseurs sélectionnés seront notifiés pour créer leurs devis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="btn-ldf-outline text-sm py-2.5 px-5"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Annuler" : "Précédent"}
        </button>
        
        <div className="flex items-center gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="btn-ldf-outline text-sm py-2.5 px-5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Brouillon
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-ldf-primary text-sm py-2.5 px-6 disabled:opacity-50"
              >
                {submitting ? "Envoi..." : <><Check className="w-4 h-4" /> Soumettre</>}
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="btn-ldf-primary text-sm py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
