// @ts-nocheck
"use client";
import { StatusBadge } from "@/components/ui/ldf-badge";
import { mockPaiements, mockSouscriptions } from "@/lib/ldfData";
import { useLDFAuthStore } from "@/stores/ldfAuth";
import { CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const fmtCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

export default function ArticlesServisPage() {
  const { user } = useLDFAuthStore();

  const servis = useMemo(() =>
    mockPaiements.filter(p => {
      const matchStatut = p.statut === "servi";
      const matchRole = user?.role === "fournisseur" ? p.fournisseurId === user.organisationId :
                        user?.role === "banque" ? p.banqueId === user.organisationId : true;
      return matchStatut && matchRole;
    }), [user]);

  const totalServi = servis.reduce((s, p) => s + p.montant, 0);

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles servis</h1>
          <p className="page-subtitle">{servis.length} livraison{servis.length > 1 ? "s" : ""} confirmée{servis.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-teal-400 p-4 shadow-sm">
          <p className="text-2xl font-bold text-teal-700">{servis.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Articles servis</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-green-400 p-4 shadow-sm">
          <p className="text-xl font-bold text-green-700">{fmtCFA(totalServi)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Montant total servi</p>
        </div>
      </div>

      <div className="section-card">
        <div className="overflow-x-auto">
          <table className="ldf-table">
            <thead>
              <tr>
                <th>Référence paiement</th>
                <th>Souscription</th>
                <th>Souscripteur</th>
                <th>Fournisseur</th>
                <th>Montant</th>
                <th>Date service</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {servis.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucun article servi</p>
                </td></tr>
              ) : servis.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/paiements/${p.id}`}
                      className="font-mono text-xs font-bold text-amber-700 hover:underline">{p.reference}</Link>
                  </td>
                  <td>
                    <Link href={`/dashboard/souscriptions/${p.souscriptionId}`}
                      className="text-xs text-gray-500 hover:text-amber-600">{p.souscriptionRef}</Link>
                  </td>
                  <td className="text-sm font-medium text-gray-800">{p.souscripteurPrenom} {p.souscripteurNom}</td>
                  <td className="text-sm text-gray-600">{p.fournisseurNom}</td>
                  <td className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmtCFA(p.montant)}</td>
                  <td className="text-xs text-gray-500">
                    {p.dateService ? new Date(p.dateService).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-medium text-teal-700">Servi</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
