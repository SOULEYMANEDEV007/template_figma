// lib/database/index.ts
// Export centralisé de la base de données

export { db, isDatabaseSeeded, resetDatabase, VitalisDatabase } from "./db";
export * from "./operations";
export { seedDatabase } from "./seed";
