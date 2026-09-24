// @ts-nocheck
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardPath, useLDFAuthStore } from "@/stores/ldfAuth";
import { useVitalisDb } from "@/stores/vitalisDbStore";
import { setCookie } from "cookies-next";
import { Building2, CheckCircle2, Eye, EyeOff, FileText, Lock, Mail, MapPin, Phone, ShieldCheck, Sparkles, Upload, User, X } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { LISTE_REGIONS_CI, getVillesParRegion, getCommunesParVille } from "@/lib/constants/geography";

export default function RegisterPage() {
  const router = useRouter();
  const { pointsRelais } = useVitalisDb();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [typeProfil, setTypeProfil] = useState<"physique" | "morale">("physique");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
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

  const [situationPro, setSituationPro] = useState("");
  const [situationMatri, setSituationMatri] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Documents justificatifs (Attestation de travail, bulletin de salaire)
  const [attestationTravailFile, setAttestationTravailFile] = useState<File | null>(null);
  const [bulletinSalaireFile, setBulletinSalaireFile] = useState<File | null>(null);
  const [cniFile, setCniFile] = useState<File | null>(null);
  const [rccmFile, setRccmFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !email || !telephone || !region || !ville || !commune || !situationPro || !password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (typeProfil === "physique" && !prenom) {
      toast.error("Le prénom est obligatoire pour un particulier.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulation délai réseau
      await new Promise((r) => setTimeout(r, 1200));

      // Création de l'utilisateur mocké
      const newUser = {
        id: `USR-${Date.now()}`,
        email: email.toLowerCase(),
        firstName: prenom || nom, // Si entreprise, firstName = raison sociale
        lastName: typeProfil === "physique" ? nom : "",
        role: "souscripteur",
        telephone,
        region,
        ville,
        commune,
        quartier: commune,
        situationPro,
        situationMatri,
        typeProfil,
        banqueId: "AFG-001",
        banqueNom: "AFG Bank",
        documents: {
          attestationTravail: attestationTravailFile ? attestationTravailFile.name : null,
          bulletinSalaire: bulletinSalaireFile ? bulletinSalaireFile.name : null,
          cni: cniFile ? cniFile.name : null,
          rccm: rccmFile ? rccmFile.name : null,
        },
      };

      // Authentification immédiate (Simulation car pas de vrai backend)
      setCookie("ldf_user", JSON.stringify(newUser), {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: false,
      });

      // Mettre à jour le store auth
      useLDFAuthStore.setState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success("Compte créé avec succès ! Bienvenue sur ViFlo.");
      router.replace(getDashboardPath("souscripteur"));
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche — branding ViFlo ── */}
      <div className="hidden lg:flex lg:w-[45%] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden flex-col justify-between p-12 bg-[#0B2447]">
        {/* Pattern Topographique Décoratif */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23FF7B2E' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }} />

        {/* Cercles de lumière (pour le relief) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF5E00]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Logo ViFlo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2 shadow-lg border border-white/20">
            <Image src={IMAGES.logos.vifloNew} alt="ViFlo" width={160} height={160} className="object-contain w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-2xl leading-none">
              ViFlo
            </p>
            <p className="text-white/80 text-sm mt-1">Plateforme de gestion Vitalis FADES</p>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-medium">Digitalisation des financements.</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              La solution complète pour <br /> vos financements
            </h2>
            <p className="text-blue-100 text-lg opacity-90 max-w-md leading-relaxed">
              Créez votre compte, soumettez votre fiche de souscription et obtenez des devis de nos fournisseurs partenaires.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-orange-400 mb-2" />
              <p className="text-white font-semibold">100% Sécurisé</p>
              <p className="text-white/60 text-xs mt-1">Vos données sont protégées.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <Building2 className="w-6 h-6 text-cyan-400 mb-2" />
              <p className="text-white font-semibold">Partenaires Agréés</p>
              <p className="text-white/60 text-xs mt-1">Réseau de fournisseurs fiables.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} LDF Groupe. Tous droits réservés.</p>
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="flex-1 flex flex-col justify-start px-6 py-8 sm:px-12 lg:px-16 bg-gray-50 min-h-screen lg:h-screen lg:overflow-y-auto">
        <div className="w-full max-w-xl mx-auto py-4">

          {/* Mobile logo ViFlo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-200 p-1">
              <Image src={IMAGES.logos.vifloNew} alt="ViFlo" width={48} height={48} className="object-contain w-full h-full" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">ViFlo <span className="text-orange-500">FADES</span></p>
              <p className="text-xs text-gray-500">Plateforme Vitalis FADES</p>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-1.5">Renseignez vos informations pour commencer vos démarches de financement.</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Type de profil */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Je suis un(e) *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTypeProfil("physique")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${typeProfil === "physique" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <User className="w-4 h-4" /> Particulier
                </button>
                <button
                  type="button"
                  onClick={() => setTypeProfil("morale")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${typeProfil === "morale" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Building2 className="w-4 h-4" /> Entreprise
                </button>
              </div>
            </div>

            {/* 2. Identité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">{typeProfil === "physique" ? "Nom *" : "Raison Sociale *"}</label>
                <Input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder={typeProfil === "physique" ? "Votre nom" : "Nom de l'entreprise"}
                  startIcon={typeProfil === "physique" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                />
              </div>
              {typeProfil === "physique" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Prénom(s) *</label>
                  <Input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Vos prénoms"
                  />
                </div>
              )}
            </div>

            {/* 3. Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  startIcon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Téléphone *</label>
                <Input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+225 00 00 00 00 00"
                  startIcon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* 4. Localisation (Région - Ville - Commune avec filtre dynamique) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Localisation géographique</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Région *</label>
                  <select
                    value={region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all cursor-pointer"
                  >
                    <option value="">Sélectionner une région</option>
                    {LISTE_REGIONS_CI.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Ville *</label>
                  {villesDisponibles.length > 0 ? (
                    <select
                      value={ville}
                      onChange={(e) => handleVilleChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all cursor-pointer"
                    >
                      <option value="">Sélectionner une ville</option>
                      {villesDisponibles.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                      <option value="Autre">Autre ville...</option>
                    </select>
                  ) : (
                    <Input
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      placeholder={region ? "Saisir la ville" : "Sélectionnez une région"}
                      startIcon={<MapPin className="w-4 h-4 text-orange-500" />}
                    />
                  )}
                  {ville === "Autre" && (
                    <Input
                      value=""
                      onChange={(e) => setVille(e.target.value)}
                      placeholder="Précisez le nom de votre ville"
                      className="mt-2"
                      autoFocus
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Commune / Quartier *</label>
                  {communesDisponibles.length > 0 ? (
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all cursor-pointer"
                    >
                      <option value="">Sélectionner une commune / quartier</option>
                      {communesDisponibles.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Autre">Autre commune / quartier...</option>
                    </select>
                  ) : (
                    <Input
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder={region ? "Précisez votre commune ou quartier" : "Sélectionnez une région"}
                    />
                  )}
                  {commune === "Autre" && (
                    <Input
                      value=""
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder="Précisez votre commune / quartier"
                      className="mt-2"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 5. Informations Complémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Situation Professionnelle *</label>
                <select
                  value={situationPro}
                  onChange={(e) => setSituationPro(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all appearance-none"
                >
                  <option value="">Sélectionnez</option>
                  {typeProfil === "physique" ? (
                    <>
                      <option value="Salarie (CDI / CDD)">Salarié (CDI / CDD)</option>
                      <option value="Fonctionnaire">Fonctionnaire Public</option>
                      <option value="Independant / Entrepreneur">Indépendant / Entrepreneur</option>
                      <option value="Commercant / Artisan">Commerçant / Artisan</option>
                      <option value="Autre">Autre</option>
                    </>
                  ) : (
                    <>
                      <option value="TPE / PME">TPE / PME</option>
                      <option value="Association / Mutuelle">Association / Mutuelle / Syndicat</option>
                      <option value="Ordre Professionnel">Ordre Professionnel</option>
                      <option value="Chambre Consulaire">Chambre de Commerce / Consulaire</option>
                      <option value="Autre">Autre</option>
                    </>
                  )}
                </select>
              </div>

              {typeProfil === "physique" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Situation Matrimoniale</label>
                  <select
                    value={situationMatri}
                    onChange={(e) => setSituationMatri(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all appearance-none"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="Celibataire">Célibataire</option>
                    <option value="Marie(e)">Marié(e)</option>
                    <option value="Divorce(e)">Divorcé(e)</option>
                    <option value="Veuf / Veuve">Veuf / Veuve</option>
                  </select>
                </div>
              )}
            </div>

            {/* 6. Pièces justificatives pour constitution du dossier */}
            <div className="space-y-3 p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Pièces justificatives (Constitution du dossier)
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Téléversez vos pièces dès maintenant pour accélérer l'analyse de votre dossier par AFG Bank.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  Fichiers PDF ou Images
                </span>
              </div>

              {typeProfil === "physique" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Attestation de travail */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>Attestation de travail *</span>
                      {attestationTravailFile && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Fichier joint
                        </span>
                      )}
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      attestationTravailFile ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setAttestationTravailFile(f);
                          if (f) toast.success(`Attestation de travail ajoutée : ${f.name}`);
                        }}
                      />
                      {attestationTravailFile ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs text-gray-800 truncate font-medium">{attestationTravailFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setAttestationTravailFile(null);
                            }}
                            className="p-1 hover:bg-red-100 text-red-500 rounded-full"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-xs">Charger l'attestation de travail (PDF/Photo)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Bulletins de salaire */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>3 Derniers bulletins de salaire *</span>
                      {bulletinSalaireFile && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Fichier joint
                        </span>
                      )}
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      bulletinSalaireFile ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setBulletinSalaireFile(f);
                          if (f) toast.success(`Bulletins de salaire ajoutés : ${f.name}`);
                        }}
                      />
                      {bulletinSalaireFile ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs text-gray-800 truncate font-medium">{bulletinSalaireFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setBulletinSalaireFile(null);
                            }}
                            className="p-1 hover:bg-red-100 text-red-500 rounded-full"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-xs">Charger les bulletins de salaire (PDF/Photo)</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* RCCM Entreprise */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Registre du Commerce (RCCM) *</label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      rccmFile ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-orange-300 bg-white"
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setRccmFile(f);
                          if (f) toast.success(`RCCM ajouté : ${f.name}`);
                        }}
                      />
                      {rccmFile ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-gray-800 truncate font-medium">{rccmFile.name}</span>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setRccmFile(null); }} className="p-1 text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-xs">Charger le RCCM (PDF/Photo)</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Mot de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Mot de passe *</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  startIcon={<Lock className="w-4 h-4" />}
                  endIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none hover:text-gray-900 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Confirmer mot de passe *</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  startIcon={<Lock className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Création du compte...
                  </>
                ) : "S'inscrire"}
              </Button>
            </div>

            <div className="text-center mt-6 pb-16">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="text-primary hover:text-orange-600 font-semibold transition-colors">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
