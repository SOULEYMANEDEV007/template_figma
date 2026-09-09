// lib/pdf/generator.ts
// Génération de PDFs réels avec jsPDF
// NOTE: Installer jspdf et html2canvas avec: npm install jspdf html2canvas

/**
 * Génère un PDF depuis un élément HTML
 * @param elementId - ID de l'élément HTML à convertir
 * @param filename - Nom du fichier PDF
 * @returns Blob du PDF généré
 */
export async function generatePDFFromHTML(
  elementId: string,
  filename: string
): Promise<Blob> {
  // Import dynamique pour éviter erreur si modules pas installés
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Élément #${elementId} introuvable`);
  }

  console.log(`📄 Génération PDF: ${filename}`);

  // Capturer l'élément HTML en canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Créer le PDF
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Dimensions A4
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Calculer la hauteur de l'image pour s'adapter à la largeur
  const imgWidth = pdfWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  // Ajouter l'image (avec pagination si nécessaire)
  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight - 20;

  // Si contenu dépasse une page, ajouter des pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;
  }

  // Convertir en Blob
  const pdfBlob = pdf.output("blob");
  
  console.log(`✅ PDF généré: ${filename} (${(pdfBlob.size / 1024).toFixed(2)} KB)`);
  
  return pdfBlob;
}

/**
 * Génère et télécharge un PDF depuis un élément HTML
 * @param elementId - ID de l'élément HTML
 * @param filename - Nom du fichier
 */
export async function downloadPDFFromHTML(
  elementId: string,
  filename: string
): Promise<void> {
  try {
    const blob = await generatePDFFromHTML(elementId, filename);
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`⬇️ PDF téléchargé: ${link.download}`);
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    // Fallback: impression navigateur
    console.log("Fallback vers impression navigateur");
    window.print();
  }
}

/**
 * Génère un PDF programmatiquement (sans HTML)
 * @param content - Configuration du contenu
 * @param filename - Nom du fichier
 */
export async function generatePDFProgrammatic(
  content: {
    title: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  },
  filename: string
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  
  let yPosition = 20;
  
  // Titre principal
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(content.title, 20, yPosition);
  yPosition += 15;
  
  // Sections
  pdf.setFontSize(12);
  for (const section of content.sections) {
    // Titre section
    pdf.setFont("helvetica", "bold");
    pdf.text(section.title, 20, yPosition);
    yPosition += 8;
    
    // Contenu section
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(section.content, 170);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 6 + 10;
    
    // Nouvelle page si nécessaire
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
  }
  
  return pdf.output("blob");
}

/**
 * Sauvegarde un PDF dans le stockage local
 * @param pdfBlob - Blob du PDF
 * @param metadata - Métadonnées du PDF
 */
export async function savePDFToStorage(
  pdfBlob: Blob,
  metadata: {
    id: string;
    name: string;
    type: "souscription" | "devis" | "dossier";
    relatedId: string;
    createdAt: string;
  }
): Promise<void> {
  // Convertir le blob en base64
  const base64 = await blobToBase64(pdfBlob);
  
  // Sauvegarder dans localStorage
  const key = `pdf_${metadata.id}`;
  localStorage.setItem(
    key,
    JSON.stringify({
      ...metadata,
      data: base64,
    })
  );
  
  console.log(`💾 PDF sauvegardé: ${metadata.name}`);
}

/**
 * Récupère un PDF depuis le stockage local
 * @param id - ID du PDF
 */
export async function getPDFFromStorage(id: string): Promise<Blob | null> {
  const key = `pdf_${id}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  return base64ToBlob(parsed.data, "application/pdf");
}

/**
 * Liste tous les PDFs stockés
 */
export function listStoredPDFs(): Array<{
  id: string;
  name: string;
  type: string;
  relatedId: string;
  createdAt: string;
}> {
  const pdfs: any[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("pdf_")) {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        pdfs.push({
          id: parsed.id,
          name: parsed.name,
          type: parsed.type,
          relatedId: parsed.relatedId,
          createdAt: parsed.createdAt,
        });
      }
    }
  }
  
  return pdfs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Supprime un PDF du stockage
 * @param id - ID du PDF
 */
export function deletePDFFromStorage(id: string): void {
  const key = `pdf_${id}`;
  localStorage.removeItem(key);
  console.log(`🗑️ PDF supprimé: ${id}`);
}

// ============================================================
// HELPERS
// ============================================================

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
