// @ts-nocheck
"use client";

/**
 * FORMULAIRE DE SOUSCRIPTION VITALIS — COMPLET
 * 
 * Étapes :
 *  0 — Vérification du souscripteur (CNI / RCCM / Téléphone)
 *  1 — Informations souscripteur (Physique ou Morale)
 *  2 — Détails souscription (fournisseurs, durée, point relais)
 *  3 — Confirmation & Soumission (sauvegarde réelle dans le store)
 */

import { saveFile } from "@/lib/fileStorage";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import {
  ArrowLeft, ArrowRight, Building2, Check, CheckCircle2,
  FileText, Loader2, MapPin, Plus, Search, Trash2,
  Upload, User, Users, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── Constantes ──────────────────────────────────────────────────
const STEPS = [
  { label: "Vérification",   icon: Search },
  { label: "Souscripteur",  icon: User },
  { label: "Souscription",  icon: FileText },
  { label: "Confirmation",  icon: Check },
];

const SITUATIONS_PRO = ["Salarié", "Fonctionnaire"] as const;
const SITUATIONS_MAT = ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf/Veuve"] as const;
const REGIONS_CI = [
  "Abidjan","Agnéby-Tiassa","Bafing","Bagoué","Béré","Bounkani",
  "Cavally","Folon","Gbêkê","Gontougo","Grands Ponts","Guémon",
  "Hambol","Haut-Sassandra","Iffou","Indénié-Djuablin","Kabadougou",
  "La Mé","Lôh-Djiboua","Marahoué","Moronou","N'Zi","Nawa",
  "Poro","San-Pédro","Sud-Comoé","Tonkpi","Worodougou","Yamoussoukro",
];
const FORMES_JURIDIQUES = ["SARL", "SA", "SAS", "EURL", "GIE", "Association", "Autre"];

// ── Types formulaire ─────────────────────────────────────────────
type TypeSouscripteur = "physique" | "morale";

interface FormPhysique {
  type: "physique";
  // Identité
  nom: string; prenom: string; numeroCNI: string;
  dateNaissance: string; lieuNaissance: string;
  // Situation pro
  situationPro: string; secteurActivite: string;
  entrepriseEmployeur: string; poste: string;
  // Situation familiale
  situationMatrimoniale: string;
  attestationMariageFile?: File | null;
  // Géographie
  pays: string; region: string; ville: string; adresse: string;
  // Contact
  telephone: string; email: string;
  // Banque
  numeroCompte: string;
}

interface FormMorale {
  type: "morale";
  // Entreprise
  nomEntreprise: string; formeJuridique: string;
  secteurActivite: string; rccm: string; compteContribuable: string;
  dateCreation: string; capitalSocial: string; nombreEmployes: string;
  // Dirigeant
  nomDG: string; prenomDG: string;
  // Siège
  pays: string; region: string; ville: string; siegeSocial: string;
  // Contact
  telephone: string; email: string;
  // Banque
  numeroCompte: string;
  // Docs
  rccmFile?: File | null;
}

type SouscripteurForm = FormPhysique | FormMorale;

const defaultPhysique = (): FormPhysique => ({
  type: "physique", nom: "", prenom: "", numeroCNI: "",
  dateNaissance: "", lieuNaissance: "", situationPro: "",
  secteurActivite: "", entrepriseEmployeur: "", poste: "",
  situationMatrimoniale: "", pays: "Côte d'Ivoire",
  region: "", ville: "", adresse: "", telephone: "", email: "",
  numeroCompte: "", attestationMariageFile: null,
});

const defaultMorale = (): FormMorale => ({
  type: "morale", nomEntreprise: "", formeJuridique: "",
  secteurActivite: "", rccm: "", compteContribuable: "",
  dateCreation: "", capitalSocial: "", nombreEmployes: "",
  nomDG: "", prenomDG: "", pays: "Côte d'Ivoire",
  region: "", ville: "", siegeSocial: "", telephone: "", email: "",
  numeroCompte: "", rccmFile: null,
});

// ── Indicateur d'étapes ──────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm
                  ${done ? "bg-emerald-500 text-white" : active ? "text-white" : "bg-gray-100 text-gray-400"}`}
                style={active ? { background: "linear-gradient(135deg,#ff6b35,#ff8c42)" } : {}}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-orange-600" : done ? "text-emerald-600" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-4 rounded transition-all ${i < current ? "bg-emerald-300" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section card helper ──────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ── Field helper ─────────────────────────────────────────────────
function Field({ label, required, children, col2 }: { label: string; required?: boolean; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={col2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all";
const sel = inp + " cursor-pointer";

// ── Upload bouton ────────────────────────────────────────────────
function FileUpload({ label, accept, file, onChange }: { label: string; accept?: string; file?: File | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input type="file" accept={accept} className="hidden" ref={ref} onChange={e => onChange(e.target.files?.[0] || null)} />
      <div
        onClick={() => ref.current?.click()}
        className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${file ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"}`}
      >
        <Upload className={`w-4 h-4 flex-shrink-0 ${file ? "text-orange-500" : "text-gray-400"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${file ? "text-orange-700" : "text-gray-500"}`}>
            {file ? file.name : label}
          </p>
          {file && <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} Ko</p>}
        </div>
        {file && (
          <button onClick={e => { e.stopPropagation(); onChange(null); }} className="p-1 rounded hover:bg-red-100">
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
export default function CreerSouscriptionPage() {
  const router = useRouter();
  const { user } = useLDFAuthStore();
  const {
    fournisseurs, pointsRelais, agencesAFG,
    addSouscription, souscriptions, generateRef,
  } = useVitalisDb();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── Étape 0 : Recherche du souscripteur ─────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"cni" | "rccm" | "telephone">("cni");
  const [foundExisting, setFoundExisting] = useState<any>(null);
  const [typeSouscripteur, setTypeSouscripteur] = useState<TypeSouscripteur>("physique");

  // ── Étape 1 : Formulaire souscripteur ───────────────────────
  const [formPhysique, setFormPhysique] = useState<FormPhysique>(defaultPhysique());
  const [formMorale, setFormMorale] = useState<FormMorale>(defaultMorale());

  // ── Étape 2 : Souscription ───────────────────────────────────
  const [selectedFournisseurs, setSelectedFournisseurs] = useState<string[]>(
    user?.role === "fournisseur" && user.organisationId ? [user.organisationId] : []
  );
  const [selectedPointRelais, setSelectedPointRelais] = useState("");
  const [agenceId, setAgenceId] = useState("");
  const [duree, setDuree] = useState(36);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);
  const [observations, setObservations] = useState("");

  // ── Handlers formulaires ─────────────────────────────────────
  const setP = (k: keyof FormPhysique, v: any) => setFormPhysique(f => ({ ...f, [k]: v }));
  const setM = (k: keyof FormMorale, v: any) => setFormMorale(f => ({ ...f, [k]: v }));

  // ── Recherche souscripteur ───────────────────────────────────
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Chercher dans les souscriptions existantes (données du store)
    const found = souscriptions.find(s => {
      const q = searchQuery.toLowerCase();
      if (searchType === "cni") return s.souscripteurId?.toLowerCase().includes(q);
      if (searchType === "telephone") return s.souscripteurTelephone?.includes(searchQuery);
      if (searchType === "rccm") return s.souscripteurEntreprise?.toLowerCase().includes(q);
      return false;
    });
    if (found) {
      setFoundExisting(found);
      toast.success(`Souscripteur trouvé : ${found.souscripteurPrenom || ''} ${found.souscripteurNom}`);
      // Pré-remplir le formulaire
      if (found.typeSouscripteur === "physique") {
        setTypeSouscripteur("physique");
        setFormPhysique(p => ({
          ...p,
          nom: found.souscripteurNom || "",
          prenom: found.souscripteurPrenom || "",
          telephone: found.souscripteurTelephone || "",
          email: found.souscripteurEmail || "",
        }));
      } else {
        setTypeSouscripteur("morale");
        setFormMorale(m => ({
          ...m,
          nomEntreprise: found.souscripteurEntreprise || "",
          telephone: found.souscripteurTelephone || "",
          email: found.souscripteurEmail || "",
        }));
      }
    } else {
      setFoundExisting(null);
      toast.info("Aucun souscripteur trouvé — Nouveau souscripteur");
    }
  };

  // ── Gestion fournisseurs sélectionnés ────────────────────────
  const toggleFournisseur = (id: string) => {
    setSelectedFournisseurs(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // ── Validation par étape ─────────────────────────────────────
  const canNext = () => {
    if (step === 0) return true; // La recherche est optionnelle
    if (step === 1) {
      if (typeSouscripteur === "physique") {
        return formPhysique.nom && formPhysique.prenom && formPhysique.telephone &&
          formPhysique.numeroCNI && formPhysique.situationPro;
      }
      return formMorale.nomEntreprise && formMorale.rccm && formMorale.telephone &&
        formMorale.nomDG && formMorale.formeJuridique;
    }
    if (step === 2) return selectedFournisseurs.length > 0 && dateDebut;
    return true;
  };

  // ── Soumission finale ────────────────────────────────────────
  const handleSubmit = async (asBrouillon = false) => {
    setSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const seq = String(Date.now()).slice(-4);
      const ref = `VF-${year}-${seq}`;

      const agenceChoisie = agencesAFG.find(a => a.id === agenceId);
      const fournisseursChoisis = fournisseurs
        .filter(f => selectedFournisseurs.includes(f.id))
        .map(f => ({ fournisseurId: f.id, fournisseurNom: f.nom, statut: "en_attente" as const }));

      // Données souscripteur communes
      const souscripteurId = typeSouscripteur === "physique"
        ? `SCP-${Date.now()}`
        : `SCE-${Date.now()}`;

      const souscripteurNom = typeSouscripteur === "physique" ? formPhysique.nom : formMorale.nomDG;
      const souscripteurPrenom = typeSouscripteur === "physique" ? formPhysique.prenom : formMorale.prenomDG;
      const souscripteurEmail = typeSouscripteur === "physique" ? formPhysique.email : formMorale.email;
      const souscripteurTelephone = typeSouscripteur === "physique" ? formPhysique.telephone : formMorale.telephone;
      const souscripteurEntreprise = typeSouscripteur === "morale" ? formMorale.nomEntreprise : undefined;

      // Sauvegarder les fichiers uploadés si présents
      if (typeSouscripteur === "physique" && formPhysique.situationMatrimoniale === "Marié(e)" && formPhysique.attestationMariageFile) {
        await saveFile(`MARIAGE-${souscripteurId}`, formPhysique.attestationMariageFile, "cni", souscripteurId);
      }
      if (typeSouscripteur === "morale" && formMorale.rccmFile) {
        await saveFile(`RCCM-${souscripteurId}`, formMorale.rccmFile, "rccm", souscripteurId);
      }

      // Créer la souscription dans le store
      const nouvelle = addSouscription({
        reference: ref,
        souscripteurId,
        souscripteurNom,
        souscripteurPrenom,
        souscripteurEmail,
        souscripteurTelephone,
        souscripteurEntreprise,
        typeSouscripteur,
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        agenceId: agenceId || undefined,
        agenceNom: agenceChoisie?.nom,
        fournisseurs: fournisseursChoisis,
        montantTotal: 0, // Sera mis à jour après création des devis
        duree,
        statut: "en_preparation", // Toujours 'en_preparation' — le bénéficiaire peut ensuite ajouter les devis fournisseurs
        dateCreation: new Date().toISOString().split("T")[0],
        dateMiseAJour: new Date().toISOString().split("T")[0],
        observations,
      });

      toast.success(`Souscription ${ref} créée — En attente des devis fournisseurs`, { duration: 4000 });
      if (!asBrouillon) {
        setTimeout(() => {
          toast("📧 Accès Viflo envoyés", {
            description: "Les accès à l'application cliente Viflo ont été envoyés au client par email.",
            icon: "✅"
          });
        }, 1500);
      }
      router.push(`/dashboard/souscriptions/${nouvelle.id}`);
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Résumé pour l'étape de confirmation ─────────────────────
  const fournisseursChoisis = fournisseurs.filter(f => selectedFournisseurs.includes(f.id));
  const relaisChoisi = pointsRelais.find(r => r.id === selectedPointRelais);
  const agenceChoisie = agencesAFG.find(a => a.id === agenceId);

  // ═══════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">Nouvelle souscription Vitalis</h1>
          <p className="page-subtitle">Programme AFG Bank · Durée {duree} mois</p>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="section-card p-5">
        <StepIndicator current={step} />
      </div>

      {/* ════════════════════════════════════════════════════════
          ÉTAPE 0 — VÉRIFICATION SOUSCRIPTEUR
          ════════════════════════════════════════════════════════ */}
      {step === 0 && (
        <div className="space-y-4">
          <SectionCard title="Vérifier si le souscripteur existe déjà" icon={Search}>
            <p className="text-sm text-gray-500">
              Entrez le CNI, RCCM ou téléphone pour vérifier si le souscripteur est déjà enregistré dans le système.
            </p>

            {/* Type de recherche */}
            <div className="flex gap-2">
              {(["cni", "telephone", "rccm"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setSearchType(t)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all
                    ${searchType === t ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300"}`}
                >
                  {t === "cni" ? "N° CNI" : t === "telephone" ? "Téléphone" : "RCCM"}
                </button>
              ))}
            </div>

            {/* Champ de recherche */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchType === "cni" ? "Ex: CI8503150987654" :
                  searchType === "telephone" ? "Ex: +225 07 00 00 00 00" : "Ex: CI-ABJ-2020-B-11223"
                }
                className={inp}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" /> Rechercher
              </button>
            </div>

            {/* Résultat de recherche */}
            {foundExisting && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Souscripteur existant : {foundExisting.souscripteurPrenom} {foundExisting.souscripteurNom}
                  </p>
                  <p className="text-xs text-emerald-600">Les informations seront pré-remplies à l'étape suivante.</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Choix type de souscripteur */}
          <SectionCard title="Type de souscripteur" icon={Users}>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez le type avant de continuer :</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTypeSouscripteur("physique")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                  ${typeSouscripteur === "physique" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${typeSouscripteur === "physique" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className={`text-sm font-semibold ${typeSouscripteur === "physique" ? "text-orange-700" : "text-gray-600"}`}>
                  Personne Physique
                </span>
                <span className="text-[10px] text-gray-400 text-center">Salarié, Fonctionnaire, Particulier</span>
              </button>

              <button
                onClick={() => setTypeSouscripteur("morale")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                  ${typeSouscripteur === "morale" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${typeSouscripteur === "morale" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <span className={`text-sm font-semibold ${typeSouscripteur === "morale" ? "text-orange-700" : "text-gray-600"}`}>
                  Personne Morale
                </span>
                <span className="text-[10px] text-gray-400 text-center">Entreprise, SARL, SA, GIE, Association</span>
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ÉTAPE 1 — INFORMATIONS SOUSCRIPTEUR
          ════════════════════════════════════════════════════════ */}
      {step === 1 && typeSouscripteur === "physique" && (
        <div className="space-y-4">
          {/* Identité */}
          <SectionCard title="Identité" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom" required>
                <input className={inp} placeholder="KOUASSI" value={formPhysique.nom} onChange={e => setP("nom", e.target.value)} />
              </Field>
              <Field label="Prénom" required>
                <input className={inp} placeholder="Jean-Marc" value={formPhysique.prenom} onChange={e => setP("prenom", e.target.value)} />
              </Field>
              <Field label="Numéro CNI" required>
                <input className={inp} placeholder="CI8503150987654" value={formPhysique.numeroCNI} onChange={e => setP("numeroCNI", e.target.value)} />
              </Field>
              <Field label="Date de naissance">
                <input type="date" className={inp} value={formPhysique.dateNaissance} onChange={e => setP("dateNaissance", e.target.value)} />
              </Field>
              <Field label="Lieu de naissance" col2>
                <input className={inp} placeholder="Abidjan" value={formPhysique.lieuNaissance} onChange={e => setP("lieuNaissance", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* Situation professionnelle */}
          <SectionCard title="Situation professionnelle" icon={FileText}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Situation professionnelle" required>
                <select className={sel} value={formPhysique.situationPro} onChange={e => setP("situationPro", e.target.value)}>
                  <option value="">Sélectionner</option>
                  {SITUATIONS_PRO.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Secteur d'activité">
                <input className={inp} placeholder="Éducation, Santé, Commerce..." value={formPhysique.secteurActivite} onChange={e => setP("secteurActivite", e.target.value)} />
              </Field>
              <Field label="Entreprise / Employeur">
                <input className={inp} placeholder="Orange CI, Ministère de..." value={formPhysique.entrepriseEmployeur} onChange={e => setP("entrepriseEmployeur", e.target.value)} />
              </Field>
              <Field label="Poste occupé">
                <input className={inp} placeholder="Directeur Commercial, Enseignant..." value={formPhysique.poste} onChange={e => setP("poste", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* Situation familiale */}
          <SectionCard title="Situation matrimoniale" icon={Users}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Situation matrimoniale">
                <select className={sel} value={formPhysique.situationMatrimoniale} onChange={e => setP("situationMatrimoniale", e.target.value)}>
                  <option value="">Sélectionner</option>
                  {SITUATIONS_MAT.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              {formPhysique.situationMatrimoniale === "Marié(e)" && (
                <Field label="Attestation de mariage (PDF / Photo)">
                  <FileUpload
                    label="Glisser ou cliquer pour uploader"
                    accept=".pdf,.jpg,.jpeg,.png"
                    file={formPhysique.attestationMariageFile}
                    onChange={f => setP("attestationMariageFile", f)}
                  />
                </Field>
              )}
            </div>
          </SectionCard>

          {/* Géographie */}
          <SectionCard title="Situation géographique" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Pays">
                <input className={inp} value={formPhysique.pays} onChange={e => setP("pays", e.target.value)} />
              </Field>
              <Field label="Région">
                <select className={sel} value={formPhysique.region} onChange={e => setP("region", e.target.value)}>
                  <option value="">Sélectionner une région</option>
                  {REGIONS_CI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Ville">
                <input className={inp} placeholder="Abidjan, Bouaké..." value={formPhysique.ville} onChange={e => setP("ville", e.target.value)} />
              </Field>
              <Field label="Téléphone" required>
                <input className={inp} placeholder="+225 07 00 00 00 00" value={formPhysique.telephone} onChange={e => setP("telephone", e.target.value)} />
              </Field>
              <Field label="Adresse complète" col2>
                <input className={inp} placeholder="Quartier, rue, immeuble..." value={formPhysique.adresse} onChange={e => setP("adresse", e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inp} placeholder="nom@email.ci" value={formPhysique.email} onChange={e => setP("email", e.target.value)} />
              </Field>
              <Field label="Numéro de compte AFG Bank">
                <input className={inp} placeholder="CI93..." value={formPhysique.numeroCompte} onChange={e => setP("numeroCompte", e.target.value)} />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── PERSONNE MORALE ─── */}
      {step === 1 && typeSouscripteur === "morale" && (
        <div className="space-y-4">
          <SectionCard title="Informations entreprise" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom de l'entreprise" required col2>
                <input className={inp} placeholder="DIGITAL SOLUTIONS CI" value={formMorale.nomEntreprise} onChange={e => setM("nomEntreprise", e.target.value)} />
              </Field>
              <Field label="Forme juridique" required>
                <select className={sel} value={formMorale.formeJuridique} onChange={e => setM("formeJuridique", e.target.value)}>
                  <option value="">Sélectionner</option>
                  {FORMES_JURIDIQUES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Secteur d'activité">
                <input className={inp} placeholder="Informatique, BTP, Commerce..." value={formMorale.secteurActivite} onChange={e => setM("secteurActivite", e.target.value)} />
              </Field>
              <Field label="RCCM" required>
                <input className={inp} placeholder="CI-ABJ-2020-B-11223" value={formMorale.rccm} onChange={e => setM("rccm", e.target.value)} />
              </Field>
              <Field label="Compte Contribuable">
                <input className={inp} placeholder="2020112233" value={formMorale.compteContribuable} onChange={e => setM("compteContribuable", e.target.value)} />
              </Field>
              <Field label="Nombre d'employés">
                <input type="number" className={inp} placeholder="15" min={1} value={formMorale.nombreEmployes} onChange={e => setM("nombreEmployes", e.target.value)} />
              </Field>
              <Field label="Capital social (FCFA)">
                <input type="number" className={inp} placeholder="10000000" value={formMorale.capitalSocial} onChange={e => setM("capitalSocial", e.target.value)} />
              </Field>
              <Field label="Date de création">
                <input type="date" className={inp} value={formMorale.dateCreation} onChange={e => setM("dateCreation", e.target.value)} />
              </Field>
              <Field label="Document RCCM (PDF)" col2>
                <FileUpload
                  label="Uploader le document RCCM"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={formMorale.rccmFile}
                  onChange={f => setM("rccmFile", f)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Directeur Général" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom du DG" required>
                <input className={inp} placeholder="KOUASSI" value={formMorale.nomDG} onChange={e => setM("nomDG", e.target.value)} />
              </Field>
              <Field label="Prénom du DG">
                <input className={inp} placeholder="Jean-Marc" value={formMorale.prenomDG} onChange={e => setM("prenomDG", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Situation géographique & Contact" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Pays">
                <input className={inp} value={formMorale.pays} onChange={e => setM("pays", e.target.value)} />
              </Field>
              <Field label="Région">
                <select className={sel} value={formMorale.region} onChange={e => setM("region", e.target.value)}>
                  <option value="">Sélectionner</option>
                  {REGIONS_CI.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Ville">
                <input className={inp} placeholder="Abidjan..." value={formMorale.ville} onChange={e => setM("ville", e.target.value)} />
              </Field>
              <Field label="Téléphone" required>
                <input className={inp} placeholder="+225 27 00 00 00 00" value={formMorale.telephone} onChange={e => setM("telephone", e.target.value)} />
              </Field>
              <Field label="Siège social" col2>
                <input className={inp} placeholder="Cocody II Plateaux, Abidjan" value={formMorale.siegeSocial} onChange={e => setM("siegeSocial", e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inp} placeholder="contact@entreprise.ci" value={formMorale.email} onChange={e => setM("email", e.target.value)} />
              </Field>
              <Field label="N° Compte AFG Bank">
                <input className={inp} placeholder="CI93..." value={formMorale.numeroCompte} onChange={e => setM("numeroCompte", e.target.value)} />
              </Field>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ÉTAPE 2 — DÉTAILS DE LA SOUSCRIPTION
          ════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Programme Vitalis */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-orange-800">Programme Vitalis — AFG Bank</span>
            </div>
            <p className="text-xs text-orange-700">
              Durée standard du programme : <strong>36 mois</strong>. Banque financeuse unique : <strong>AFG Bank</strong>.
            </p>
          </div>

          {/* Agence AFG */}
          <SectionCard title="Agence AFG Bank" icon={Building2}>
            <Field label="Agence de rattachement">
              <select className={sel} value={agenceId} onChange={e => setAgenceId(e.target.value)}>
                <option value="">Sélectionner une agence (optionnel)</option>
                {agencesAFG.map(a => (
                  <option key={a.id} value={a.id}>{a.nom} — {a.ville}</option>
                ))}
              </select>
            </Field>
          </SectionCard>

          {/* Fournisseurs */}
          <SectionCard title="Fournisseurs agréés Vitalis" icon={Building2}>
            <p className="text-xs text-gray-500 mb-3">Sélectionnez un ou plusieurs fournisseurs pour cette souscription :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fournisseurs.filter(f => f.agreVitalis && f.statut === "actif").map(f => {
                const isSelected = selectedFournisseurs.includes(f.id);
                const isDisabled = user?.role === "fournisseur" && user.organisationId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && toggleFournisseur(f.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all
                      ${isSelected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-200 bg-white"}
                      ${isDisabled ? "opacity-80 cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${isSelected ? "text-orange-700" : "text-gray-700"}`}>{f.nom}</p>
                        <p className="text-[10px] text-gray-400 truncate">{f.raisonSociale}</p>
                      </div>
                      {isDisabled && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">Vous</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Durée & Dates */}
          <SectionCard title="Durée et dates" icon={FileText}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Durée du programme (mois)">
                <select className={sel} value={duree} onChange={e => setDuree(Number(e.target.value))}>
                  {[12, 18, 24, 36, 48, 60].map(d => (
                    <option key={d} value={d}>{d} mois{d === 36 ? " (défaut)" : ""}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date de début souhaitée" required>
                <input type="date" className={inp} value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* Points Relais */}
          <SectionCard title="Point de livraison" icon={MapPin}>
            <p className="text-xs text-gray-500 mb-3">
              Le souscripteur peut choisir de récupérer sa commande dans un point relais :
            </p>
            <Field label="Point relais (optionnel)">
              <select className={sel} value={selectedPointRelais} onChange={e => setSelectedPointRelais(e.target.value)}>
                <option value="">Livraison à domicile (adresse fournie)</option>
                <optgroup label="Grand Abidjan">
                  {pointsRelais.filter(r => r.ville === "Abidjan" && r.statut === "actif").map(r => (
                    <option key={r.id} value={r.id}>{r.nom} — {r.quartier}</option>
                  ))}
                </optgroup>
                <optgroup label="Intérieur du pays">
                  {pointsRelais.filter(r => r.ville !== "Abidjan" && r.statut === "actif").map(r => (
                    <option key={r.id} value={r.id}>{r.nom} — {r.ville}</option>
                  ))}
                </optgroup>
              </select>
            </Field>

            {/* Conditions de livraison */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: "Grand Abidjan", value: "7 jours ouvrés", color: "text-blue-700 bg-blue-50 border-blue-200" },
                { label: "Hors Abidjan", value: "15 jours ouvrés", color: "text-amber-700 bg-amber-50 border-amber-200" },
                { label: "Validité devis", value: "30 jours ouvrés", color: "text-green-700 bg-green-50 border-green-200" },
              ].map(c => (
                <div key={c.label} className={`p-2.5 rounded-xl border text-center ${c.color}`}>
                  <p className="text-[10px] font-medium opacity-75">{c.label}</p>
                  <p className="text-xs font-bold mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Observations */}
          <SectionCard title="Observations" icon={FileText}>
            <textarea
              rows={3}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Informations complémentaires, demandes spécifiques, notes importantes..."
              className={inp + " resize-none"}
            />
          </SectionCard>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ÉTAPE 3 — CONFIRMATION
          ════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-base">Récapitulatif de la souscription</h3>
            </div>
            <p className="text-orange-100 text-xs">Vérifiez les informations avant soumission</p>
          </div>

          {/* Bloc souscripteur */}
          <div className="section-card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-800">Souscripteur</h3>
              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full
                ${typeSouscripteur === "physique" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {typeSouscripteur === "physique" ? "Personne Physique" : "Personne Morale"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {typeSouscripteur === "physique" ? (
                <>
                  <div><p className="text-xs text-gray-400">Nom complet</p><p className="font-medium">{formPhysique.prenom} {formPhysique.nom}</p></div>
                  <div><p className="text-xs text-gray-400">N° CNI</p><p className="font-medium font-mono text-xs">{formPhysique.numeroCNI || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Situation pro</p><p className="font-medium">{formPhysique.situationPro || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Téléphone</p><p className="font-medium">{formPhysique.telephone}</p></div>
                  <div><p className="text-xs text-gray-400">Ville</p><p className="font-medium">{formPhysique.ville || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Situation familiale</p><p className="font-medium">{formPhysique.situationMatrimoniale || "—"}</p></div>
                </>
              ) : (
                <>
                  <div><p className="text-xs text-gray-400">Entreprise</p><p className="font-medium">{formMorale.nomEntreprise}</p></div>
                  <div><p className="text-xs text-gray-400">Forme juridique</p><p className="font-medium">{formMorale.formeJuridique || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">RCCM</p><p className="font-medium font-mono text-xs">{formMorale.rccm}</p></div>
                  <div><p className="text-xs text-gray-400">DG</p><p className="font-medium">{formMorale.prenomDG} {formMorale.nomDG}</p></div>
                  <div><p className="text-xs text-gray-400">Employés</p><p className="font-medium">{formMorale.nombreEmployes || "—"}</p></div>
                  <div><p className="text-xs text-gray-400">Téléphone</p><p className="font-medium">{formMorale.telephone}</p></div>
                </>
              )}
            </div>
          </div>

          {/* Bloc souscription */}
          <div className="section-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-800">Détails de la souscription</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><p className="text-xs text-gray-400">Banque financeuse</p><p className="font-bold text-orange-600">AFG Bank</p></div>
              <div><p className="text-xs text-gray-400">Agence</p><p className="font-medium">{agenceChoisie?.nom || "Non spécifiée"}</p></div>
              <div><p className="text-xs text-gray-400">Durée programme</p><p className="font-medium">{duree} mois</p></div>
              <div><p className="text-xs text-gray-400">Date de début</p><p className="font-medium">{dateDebut ? new Date(dateDebut).toLocaleDateString("fr-FR") : "—"}</p></div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Fournisseur(s)</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {fournisseursChoisis.map(f => (
                    <span key={f.id} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">{f.nom}</span>
                  ))}
                </div>
              </div>
              {relaisChoisi && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Point relais</p>
                  <p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-400" /> {relaisChoisi.nom} — {relaisChoisi.ville}</p>
                </div>
              )}
            </div>
          </div>

          {/* Conditions de livraison */}
          <div className="section-card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Conditions de livraison (Programme Vitalis)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <p className="text-[10px] font-medium text-blue-600">Grand Abidjan</p>
                <p className="text-sm font-bold text-blue-700 mt-1">7 jours ouvrés</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-[10px] font-medium text-amber-600">Hors Abidjan</p>
                <p className="text-sm font-bold text-amber-700 mt-1">15 jours ouvrés</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-[10px] font-medium text-green-600">Validité devis</p>
                <p className="text-sm font-bold text-green-700 mt-1">30 jours ouvrés</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          NAVIGATION
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Annuler" : "Précédent"}
        </button>

        <div className="flex items-center gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange-300 text-orange-600 text-sm font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> Brouillon
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg,#ff6b35,#ff8c42)" }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Check className="w-4 h-4" /> Soumettre à AFG Bank</>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: canNext() ? "linear-gradient(135deg,#ff6b35,#ff8c42)" : undefined }}
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
