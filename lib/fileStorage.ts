// @ts-nocheck
// lib/fileStorage.ts
// Gestionnaire de fichiers réels avec IndexedDB (Dexie)
// Utilisation : saveFile('DEV-001-pdf', file) puis getFileUrl('DEV-001-pdf')
// Les fichiers sont stockés en binaire (Blob) et peuvent être affichés ou téléchargés comme de vrais fichiers.

import Dexie, { Table } from 'dexie';

interface VitalisStoredFile {
  id?: number;
  reference: string;       // Ex: 'DEV-001-pdf', 'CNI-SCP-001'
  fileName: string;        // Nom d'affichage
  mimeType: string;        // 'application/pdf', 'image/jpeg', ...
  data: Blob;              // Contenu binaire réel
  size: number;            // En octets
  category: 'devis' | 'cni' | 'rccm' | 'dossier' | 'autre';
  entityId?: string;       // ID de la souscription/devis/dossier associé
  createdAt: number;       // timestamp
}

class VitalisFileDatabase extends Dexie {
  files!: Table<VitalisStoredFile, number>;

  constructor() {
    super('VitalisFilesDB_v1');
    this.version(1).stores({
      files: '++id, reference, category, entityId, createdAt',
    });
  }
}

// Instance singleton
const fileDb = new VitalisFileDatabase();

// ============================================================
// API PUBLIQUE
// ============================================================

/**
 * Sauvegarde un fichier réel dans IndexedDB.
 * @param reference - Identifiant unique du fichier (ex: 'DEV-001-pdf')
 * @param file - Le vrai fichier uploadé par l'utilisateur
 * @param category - Catégorie pour filtrer
 * @param entityId - ID de l'entité associée (souscription, devis, etc.)
 */
export async function saveFile(
  reference: string,
  file: File,
  category: VitalisStoredFile['category'] = 'autre',
  entityId?: string
): Promise<void> {
  // Supprimer l'ancien s'il existe
  await fileDb.files.where('reference').equals(reference).delete();

  await fileDb.files.add({
    reference,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    data: file,
    size: file.size,
    category,
    entityId,
    createdAt: Date.now(),
  });
}

/**
 * Crée une URL blob locale pour afficher ou télécharger un fichier.
 * IMPORTANT : Appeler URL.revokeObjectURL(url) après utilisation pour libérer la mémoire.
 * @returns URL locale (blob:http://...) ou null si le fichier n'existe pas
 */
export async function getFileUrl(reference: string): Promise<string | null> {
  const stored = await fileDb.files.where('reference').equals(reference).last();
  if (!stored) return null;
  return URL.createObjectURL(new Blob([stored.data], { type: stored.mimeType }));
}

/**
 * Télécharge directement un fichier.
 */
export async function downloadFile(reference: string, forceFileName?: string): Promise<void> {
  const stored = await fileDb.files.where('reference').equals(reference).last();
  if (!stored) return;

  const url = URL.createObjectURL(new Blob([stored.data], { type: stored.mimeType }));
  const a = document.createElement('a');
  a.href = url;
  a.download = forceFileName || stored.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Vérifie si un fichier existe pour une référence donnée.
 */
export async function fileExists(reference: string): Promise<boolean> {
  const count = await fileDb.files.where('reference').equals(reference).count();
  return count > 0;
}

/**
 * Récupère les métadonnées d'un fichier (sans le Blob pour économiser la mémoire).
 */
export async function getFileMeta(reference: string): Promise<Omit<VitalisStoredFile, 'data'> | null> {
  const stored = await fileDb.files.where('reference').equals(reference).last();
  if (!stored) return null;
  const { data, ...meta } = stored;
  return meta;
}

/**
 * Liste tous les fichiers associés à une entité (ex: tous les docs d'une souscription).
 */
export async function getFilesByEntity(entityId: string): Promise<Array<Omit<VitalisStoredFile, 'data'>>> {
  const stored = await fileDb.files.where('entityId').equals(entityId).toArray();
  return stored.map(({ data, ...meta }) => meta);
}

/**
 * Supprime un fichier.
 */
export async function deleteFile(reference: string): Promise<void> {
  await fileDb.files.where('reference').equals(reference).delete();
}

/**
 * Formate la taille d'un fichier en Ko/Mo.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export type { VitalisStoredFile };
