import { PrismaClient } from "@prisma/client";

/**
 * GlobalThis verwijst naar het globale object, in Node is dit de global variabele, in de browser is dit window.
 * We casten het globale object hier naar een object dat een prisma property bevat om TypeScript errors te vermijden.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Gebruik de globale prismaClient als deze al bestaat, maak anders een nieuwe PrismaClient aan.
 */
export const prismaClient = globalForPrisma.prisma || new PrismaClient();

/**
 * Als we niet in productie zijn, voegen we de prismaClient toe aan het globale object zodat we het kunnen gebruiken als
 * singleton in de applicatie.
 * Omdat een er tijdens development gebruik gemaakt wordt van hot module reloading, wordt de prismaClient anders
 * verschillende keren opnieuw geïnstantieerd.
 *
 * In een productieomgeving is dit geen probleem omdat daar geen hot reloading toegepast wordt, de applicatie start
 * één keer en blijft draaien.
 * De geëxporteerde constante wordt dan gebruikt voor elke file die de prismaClient importeert.
 */
if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prismaClient;
