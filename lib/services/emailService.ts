// @ts-nocheck
// lib/services/emailService.ts — Service d'email simulé ViFlo

export interface EmailSouscription {
  to: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  souscriptionRef: string;
  lienConnexion: string;
}

/**
 * Simule l'envoi des identifiants de connexion au souscripteur.
 * En production, remplacer par un vrai appel API (SendGrid, Mailjet, etc.)
 */
export async function envoyerIdentifiantsSouscripteur(
  data: EmailSouscription
): Promise<{ success: boolean; message: string }> {
  // Simulation délai réseau
  await new Promise((r) => setTimeout(r, 300));

  console.log("📧 ===== ENVOI D'EMAIL =====");
  console.log(`À : ${data.to}`);
  console.log(`Sujet : Bienvenue sur ViFlo - Vos identifiants de connexion`);
  console.log(`---`);
  console.log(`Bonjour ${data.prenom} ${data.nom},`);
  console.log(``);
  console.log(`Votre souscription ${data.souscriptionRef} a été créée.`);
  console.log(``);
  console.log(`🔑 Vos identifiants de connexion :`);
  console.log(`   📧 Email    : ${data.email}`);
  console.log(`   🔒 Mot de passe : ${data.motDePasse}`);
  console.log(``);
  console.log(`🔗 Lien de connexion : ${data.lienConnexion}`);
  console.log(``);
  console.log(`⚠️  Nous vous recommandons de changer votre mot de passe`);
  console.log(`   lors de votre première connexion.`);
  console.log(``);
  console.log(`L'équipe ViFlo`);
  console.log("=============================");

  return { success: true, message: "Email envoyé avec succès" };
}
