// @ts-nocheck
"use client";
import { useDatabase } from "@/hooks/useDatabase";
import { db, isDatabaseSeeded } from "@/lib/database/db";
import { seedDatabase } from "@/lib/database/seed";
import { AlertCircle, CheckCircle2, Database, Download, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================
interface DatabaseStats {
  souscripteursPhysiques: number;
  souscripteursMorales: number;
  souscriptions: number;
  fournisseurs: number;
  devis: number;
  dossiers: number;
  pointsRelais: number;
  agencesAFG: number;
}

// ============================================================
// COMPOSANT PAGE
// ============================================================
export default function DatabaseAdminPage() {
  const { isReady, error: dbError } = useDatabase();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  // ─── Charger statistiques ─────────────────────────────────
  const loadStats = async () => {
    if (!isReady) return;
    
    try {
      const [
        souscripteursPhysiques,
        souscripteursMorales,
        souscriptions,
        fournisseurs,
        devis,
        dossiers,
        pointsRelais,
        agencesAFG,
        seeded,
      ] = await Promise.all([
        db.souscripteursPhysiques.count(),
        db.souscripteursMorales.count(),
        db.souscriptions.count(),
        db.fournisseurs.count(),
        db.devis.count(),
        db.dossiers.count(),
        db.pointsRelais.count(),
        db.agencesAFG.count(),
        isDatabaseSeeded(),
      ]);

      setStats({
        souscripteursPhysiques,
        souscripteursMorales,
        souscriptions,
        fournisseurs,
        devis,
        dossiers,
        pointsRelais,
        agencesAFG,
      });
      
      setIsSeeded(seeded);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    }
  };

  useEffect(() => {
    loadStats();
  }, [isReady]);

  // ─── Handler réinitialisation ─────────────────────────────
  const handleReset = async () => {
    if (!confirm("⚠️ Réinitialiser la base de données ? Toutes les données seront perdues !")) {
      return;
    }

    setLoading(true);
    try {
      // Vider toutes les tables
      await db.transaction("rw", db.tables, async () => {
        for (const table of db.tables) {
          await table.clear();
        }
      });

      // Re-seeder
      await seedDatabase();
      
      toast.success("Base de données réinitialisée");
      await loadStats();
    } catch (error) {
      console.error("Erreur réinitialisation:", error);
      toast.error("Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handler export ───────────────────────────────────────
  const handleExport = async () => {
    setLoading(true);
    try {
      const data: any = {};
      
      for (const table of db.tables) {
        data[table.name] = await table.toArray();
      }

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vitalis-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Données exportées avec succès");
    } catch (error) {
      console.error("Erreur export:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handler import ───────────────────────────────────────
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        await db.transaction("rw", db.tables, async () => {
          for (const table of db.tables) {
            if (data[table.name]) {
              await table.clear();
              await table.bulkAdd(data[table.name]);
            }
          }
        });

        toast.success("Données importées avec succès");
        await loadStats();
      } catch (error) {
        console.error("Erreur import:", error);
        toast.error("Erreur lors de l'import");
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  // ─── Loading ──────────────────────────────────────────────
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de la base de données...</p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur Base de Données</h1>
          <p className="text-gray-600 mb-6">{dbError.message}</p>
        </div>
      </div>
    );
  }

  // ─── Rendu ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration Base de Données</h1>
              <p className="text-gray-600">Gestion et monitoring de la base IndexedDB</p>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Statut</h2>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Base de données opérationnelle</p>
              <p className="text-sm text-gray-600">
                {isSeeded ? "Données initiales chargées" : "Base vide"}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Statistiques</h2>
              <button
                onClick={loadStats}
                disabled={loading}
                className="btn-ldf-secondary text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Souscripteurs Physiques" value={stats.souscripteursPhysiques} color="blue" />
              <StatCard label="Souscripteurs Morales" value={stats.souscripteursMorales} color="indigo" />
              <StatCard label="Souscriptions" value={stats.souscriptions} color="amber" />
              <StatCard label="Fournisseurs" value={stats.fournisseurs} color="green" />
              <StatCard label="Devis" value={stats.devis} color="cyan" />
              <StatCard label="Dossiers" value={stats.dossiers} color="purple" />
              <StatCard label="Points Relais" value={stats.pointsRelais} color="pink" />
              <StatCard label="Agences AFG" value={stats.agencesAFG} color="orange" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="btn-ldf-secondary justify-center"
            >
              <Download className="w-5 h-5" />
              Exporter (JSON)
            </button>

            <button
              onClick={handleImport}
              disabled={loading}
              className="btn-ldf-secondary justify-center"
            >
              <Upload className="w-5 h-5" />
              Importer (JSON)
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="btn-ldf-danger justify-center"
            >
              <Trash2 className="w-5 h-5" />
              Réinitialiser
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Conseil :</strong> Exportez régulièrement vos données avant la présentation client.
              Les données sont stockées localement dans le navigateur (IndexedDB).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT STAT CARD
// ============================================================
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
}
