// @ts-nocheck
"use client";
import { AFG_BANK } from "@/lib/vitalisData";
import { VITALIS_CONFIG } from "@/types/vitalis";
import { AlertCircle, ArrowLeft, CheckCircle, FileText, Info, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// DONNÉES DES CONDITIONS VITALIS
// ============================================================
const CONDITIONS_VITALIS = {
  version: "2.0",
  datePublication: "1er Janvier 2026",
  sections: [
    {
      id: "presentation",
      titre: "1. Présentation du Programme Vitalis",
      icone: FileText,
      couleur: "blue",
      contenu: [
        {
          titre: "Qu'est-ce que Vitalis ?",
          paragraphes: [
            "Le Programme Vitalis est un dispositif de financement mis en place par AFG Bank pour faciliter l'accès à l'équipement scolaire, éducatif et professionnel pour les particuliers et les entreprises en Côte d'Ivoire.",
            "Ce programme permet aux bénéficiaires de financer leurs achats auprès de fournisseurs agréés, avec un remboursement échelonné sur une durée pouvant aller jusqu'à 48 mois.",
          ],
        },
        {
          titre: "Objectifs du programme",
          liste: [
            "Faciliter l'accès au financement pour l'éducation et la formation",
            "Soutenir les familles et les entreprises dans leurs projets d'équipement",
            "Développer un partenariat tripartite gagnant-gagnant (Client - Fournisseur - AFG Bank)",
            "Stimuler l'économie locale en favorisant l'activité des fournisseurs agréés",
          ],
        },
      ],
    },
    {
      id: "eligibilite",
      titre: "2. Conditions d'Éligibilité",
      icone: CheckCircle,
      couleur: "emerald",
      contenu: [
        {
          titre: "Personnes Physiques",
          liste: [
            "Être âgé de 21 ans minimum et 65 ans maximum",
            "Être salarié ou fonctionnaire avec un revenu stable et justifiable",
            "Justifier d'une ancienneté professionnelle d'au moins 6 mois",
            "Disposer d'un compte bancaire actif chez AFG Bank ou accepter d'en ouvrir un",
            "Résider en Côte d'Ivoire de manière permanente",
            "Ne pas être inscrit au fichier des incidents de paiement",
          ],
        },
        {
          titre: "Personnes Morales",
          liste: [
            "Être une entreprise légalement constituée et enregistrée au RCCM",
            "Disposer d'un compte contribuable valide",
            "Justifier d'au moins 12 mois d'activité",
            "Présenter des états financiers certifiés des 2 derniers exercices",
            "Disposer d'un compte professionnel chez AFG Bank",
            "Ne pas être en situation de contentieux bancaire",
          ],
        },
        {
          titre: "Documents requis",
          sous_titre: "Personne Physique :",
          liste: [
            "Carte Nationale d'Identité (CNI) en cours de validité",
            "3 derniers bulletins de salaire ou attestation de travail pour les fonctionnaires",
            "Relevé d'Identité Bancaire (RIB) AFG Bank",
            "Justificatif de domicile de moins de 3 mois",
            "Attestation de mariage (si marié)",
            "Attestation d'emploi certifiée par l'employeur",
          ],
        },
        {
          sous_titre: "Personne Morale :",
          liste: [
            "RCCM de l'entreprise",
            "Compte contribuable",
            "Statuts de l'entreprise certifiés conformes",
            "États financiers des 2 derniers exercices",
            "CNI du Directeur Général",
            "Attestation bancaire AFG Bank",
          ],
        },
      ],
    },
    {
      id: "montants",
      titre: "3. Montants et Durées de Financement",
      icone: Info,
      couleur: "amber",
      contenu: [
        {
          titre: "Montants finançables",
          liste: [
            "Montant minimum : 500 000 FCFA",
            "Montant maximum Personne Physique : 10 000 000 FCFA",
            "Montant maximum Personne Morale : 50 000 000 FCFA",
            "Le montant est calculé sur la base des devis validés par les fournisseurs agréés",
          ],
        },
        {
          titre: "Durée de remboursement",
          liste: [
            `Durée standard : ${VITALIS_CONFIG.DUREE_PAR_DEFAUT} mois (recommandée)`,
            "Durée minimale : 12 mois",
            "Durée maximale : 48 mois",
            "Remboursement par prélèvement mensuel automatique sur le compte AFG Bank",
          ],
        },
        {
          titre: "Taux et Frais",
          liste: [
            "Taux d'intérêt préférentiel Vitalis : 6,5% annuel",
            "Frais de dossier : 1% du montant financé (minimum 25 000 FCFA)",
            "Assurance emprunteur : 0,5% du capital emprunté",
            "Aucun frais de remboursement anticipé",
          ],
        },
      ],
    },
    {
      id: "processus",
      titre: "4. Processus de Souscription",
      icone: CheckCircle,
      couleur: "blue",
      contenu: [
        {
          titre: "Étapes du processus",
          liste: [
            "1. Le client se rapproche d'un fournisseur agréé Vitalis",
            "2. Le fournisseur établit un devis détaillé et crée la souscription",
            "3. Le client vérifie et valide les informations de sa souscription",
            "4. Le fournisseur soumet le dossier complet à AFG Bank",
            "5. AFG Bank étudie le dossier sous 5 à 7 jours ouvrés maximum",
            "6. En cas d'acceptation, AFG Bank procède au financement",
            "7. Le fournisseur prépare et livre les articles commandés",
            "8. Le client commence le remboursement selon l'échéancier convenu",
          ],
        },
        {
          titre: "Délais de traitement",
          liste: [
            "Étude du dossier : 5 à 7 jours ouvrés",
            "Déblocage des fonds : 48 heures après validation",
            `Livraison Grand Abidjan : ${VITALIS_CONFIG.DELAI_LIVRAISON_ABIDJAN}`,
            `Livraison Intérieur : ${VITALIS_CONFIG.DELAI_LIVRAISON_INTERIEUR}`,
          ],
        },
      ],
    },
    {
      id: "fournisseurs",
      titre: "5. Fournisseurs Agréés",
      icone: CheckCircle,
      couleur: "emerald",
      contenu: [
        {
          titre: "Critères d'agrément",
          paragraphes: [
            "Les fournisseurs partenaires du programme Vitalis sont rigoureusement sélectionnés par AFG Bank selon des critères stricts de qualité, de fiabilité et de conformité.",
          ],
          liste: [
            "Entreprise légalement constituée avec RCCM valide",
            "Minimum 2 ans d'activité commerciale avérée",
            "Pas de contentieux commercial majeur",
            "Capacité à honorer les délais de livraison",
            "Service après-vente opérationnel",
            "Engagement sur la qualité des produits fournis",
          ],
        },
        {
          titre: "Liste des fournisseurs agréés",
          paragraphes: [
            "La liste complète et actualisée des fournisseurs agréés Vitalis est disponible sur demande auprès de votre agence AFG Bank ou sur le portail en ligne.",
          ],
        },
      ],
    },
    {
      id: "modalites",
      titre: "6. Modalités de Remboursement",
      icone: Info,
      couleur: "amber",
      contenu: [
        {
          titre: "Mode de remboursement",
          liste: [
            "Prélèvement automatique mensuel sur compte AFG Bank",
            "Date de prélèvement : Le 5 de chaque mois",
            "Première échéance : Un mois après le déblocage des fonds",
            "Possibilité de remboursement anticipé total ou partiel sans pénalité",
          ],
        },
        {
          titre: "En cas de difficultés",
          liste: [
            "Contacter immédiatement votre conseiller AFG Bank",
            "Possibilité de report d'échéance (sous conditions, maximum 2 fois)",
            "Proposition de réaménagement du crédit si situation justifiée",
            "Éviter les incidents de paiement pour préserver votre historique bancaire",
          ],
        },
      ],
    },
    {
      id: "droits",
      titre: "7. Droits et Obligations",
      icone: AlertCircle,
      couleur: "red",
      contenu: [
        {
          titre: "Droits du client",
          liste: [
            "Recevoir une information claire et complète sur les conditions du financement",
            "Disposer d'un délai de rétractation de 14 jours après signature",
            "Obtenir un échéancier détaillé de remboursement",
            "Être informé de tout changement affectant son contrat",
            "Effectuer un remboursement anticipé sans pénalité",
            "Recevoir les articles conformes au devis validé",
          ],
        },
        {
          titre: "Obligations du client",
          liste: [
            "Fournir des informations exactes et sincères lors de la souscription",
            "Honorer les échéances de remboursement aux dates convenues",
            "Informer AFG Bank de tout changement de situation (adresse, emploi, etc.)",
            "Maintenir un compte actif chez AFG Bank pendant toute la durée du crédit",
            "Souscrire et maintenir l'assurance emprunteur",
            "Vérifier la conformité des articles livrés",
          ],
        },
      ],
    },
    {
      id: "resiliation",
      titre: "8. Résiliation et Litiges",
      icone: AlertCircle,
      couleur: "red",
      contenu: [
        {
          titre: "Cas de résiliation",
          liste: [
            "Non-respect des conditions de remboursement après mise en demeure",
            "Fourniture de fausses informations lors de la souscription",
            "Décès de l'emprunteur (prise en charge par l'assurance)",
            "Faillite ou liquidation judiciaire pour les personnes morales",
          ],
        },
        {
          titre: "Résolution des litiges",
          paragraphes: [
            "En cas de litige concernant la qualité des articles, le client doit d'abord contacter le fournisseur.",
            "Si le litige persiste, AFG Bank peut intervenir comme médiateur.",
            "Tout litige non résolu à l'amiable relève de la compétence exclusive des tribunaux d'Abidjan.",
          ],
        },
      ],
    },
    {
      id: "contact",
      titre: "9. Contact et Informations",
      icone: Info,
      couleur: "blue",
      contenu: [
        {
          titre: "Agences AFG Bank",
          paragraphes: [
            "Pour toute information complémentaire ou assistance, contactez l'une de nos agences AFG Bank réparties sur l'ensemble du territoire national.",
          ],
        },
        {
          titre: "Service Client Vitalis",
          liste: [
            `Téléphone : ${AFG_BANK.telephone}`,
            `Email : ${AFG_BANK.email}`,
            "Horaires : Lundi - Vendredi : 8h00 - 17h00, Samedi : 8h30 - 12h30",
            "Site web : www.afgbank.ci/vitalis",
          ],
        },
        {
          titre: "Documentation",
          liste: [
            "Grille tarifaire complète disponible en agence",
            "Simulateur de crédit en ligne sur notre portail",
            "FAQ détaillée sur www.afgbank.ci/vitalis/faq",
            "Guides pratiques téléchargeables",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ConditionsVitalisPage() {
  const router = useRouter();

  // ─── Impression ───────────────────────────────────────────
  const handlePrint = () => {
    toast.info("Préparation de l'impression...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ─── Télécharger PDF ──────────────────────────────────────
  const handleDownloadPDF = () => {
    toast.info("Génération du PDF en cours...");
    // TODO: Implémenter la génération PDF réelle
    setTimeout(() => {
      toast.success("Le PDF sera disponible prochainement");
    }, 1000);
  };

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="page-title">Conditions du Programme Vitalis</h1>
            <p className="page-subtitle">
              Version {CONDITIONS_VITALIS.version} — Mise à jour le {CONDITIONS_VITALIS.datePublication}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-ldf-outline text-sm py-2 px-4"
          >
            <Printer className="w-4 h-4" /> Imprimer
          </button>
        </div>
      </div>

      {/* En-tête document imprimé */}
      <div className="hidden print:flex items-center justify-between p-8 border-b-2 border-gray-100 bg-white mb-6">
        <div className="flex-1">
          <img src="/logos/logo-fades.PNG" alt="FADES" className="h-16 object-contain" />
        </div>
        <div className="flex-1 flex flex-col items-center border-l border-r border-gray-200 px-4">
          <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-2">Programme</p>
          <img src="/logos/new_logo-viflo.JPG" alt="Vitalis" className="h-12 object-contain mix-blend-multiply rounded-xl" />
        </div>
        <div className="flex-1 flex flex-col items-end pl-4">
          <p className="text-[10px] font-bold text-[#0B2447] tracking-[0.2em] uppercase mb-2 mr-2">Financement</p>
          <img src="/logos/LOGO-AFG-Bank.jpg" alt="AFG Bank" className="h-10 object-contain" />
        </div>
      </div>
      
      {/* Titre document imprimé */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Programme Vitalis — Conditions Générales
        </h1>
        <p className="text-sm text-gray-600">
          Version {CONDITIONS_VITALIS.version} | {CONDITIONS_VITALIS.datePublication}
        </p>
      </div>

      {/* Intro */}
      <div className="section-card print:shadow-none">
        <div className="section-card-body">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 print:hidden">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Bienvenue dans le Programme Vitalis
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Ce document présente les conditions générales du programme de financement Vitalis proposé par{" "}
                <strong>{AFG_BANK.nom}</strong>. Nous vous recommandons de lire attentivement ces conditions avant de procéder à votre souscription.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg print:border-2">
                <p className="text-sm text-amber-800">
                  <strong>Important :</strong> Ce document a une valeur contractuelle. Votre souscription au programme Vitalis implique l'acceptation de l'ensemble de ces conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections principales */}
      {CONDITIONS_VITALIS.sections.map((section, idx) => {
        const IconComponent = section.icone;
        const couleurClasses = {
          blue: "bg-blue-50 border-blue-200 text-blue-600",
          emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
          amber: "bg-amber-50 border-amber-200 text-amber-600",
          red: "bg-red-50 border-red-200 text-red-600",
        }[section.couleur];

        return (
          <div key={section.id} className="section-card print:shadow-none print:break-inside-avoid">
            <div className="section-card-header print:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${couleurClasses} border flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{section.titre}</h3>
              </div>
            </div>

            <div className="section-card-body space-y-4">
              {section.contenu.map((bloc, bIdx) => (
                <div key={bIdx} className="space-y-2">
                  {bloc.titre && (
                    <h4 className="font-semibold text-gray-900 text-sm">{bloc.titre}</h4>
                  )}
                  {bloc.sous_titre && (
                    <p className="font-medium text-gray-700 text-sm mt-2">{bloc.sous_titre}</p>
                  )}
                  {bloc.paragraphes?.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm text-gray-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {bloc.liste && (
                    <ul className="space-y-1.5 ml-1">
                      {bloc.liste.map((item, lIdx) => (
                        <li key={lIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="section-card bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 print:bg-gray-50">
        <div className="section-card-body">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Besoin d'aide ?</h4>
              <p className="text-sm text-gray-700 mb-3">
                Notre équipe est à votre disposition pour répondre à toutes vos questions concernant le programme Vitalis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Téléphone :</span>{" "}
                  <span className="font-medium text-gray-900">{AFG_BANK.telephone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email :</span>{" "}
                  <span className="font-medium text-gray-900">{AFG_BANK.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note légale imprimée */}
      <div className="hidden print:block text-xs text-gray-500 text-center border-t pt-4 mt-8">
        <p>
          © {new Date().getFullYear()} {AFG_BANK.nom} — Tous droits réservés
        </p>
        <p className="mt-1">
          Document imprimé le {new Date().toLocaleDateString("fr-FR")} à{" "}
          {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .print\\:border-2 {
            border-width: 2px !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          
          .section-card {
            page-break-inside: avoid;
            margin-bottom: 1rem;
          }
          
          h1, h2, h3, h4 {
            page-break-after: avoid;
          }
          
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
}
