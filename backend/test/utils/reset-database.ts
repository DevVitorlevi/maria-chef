import { prisma } from '@/lib/prisma.js'

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE
      "listas_compras",
      "ingredientes",
      "pratos",
      "refeicoes",
      "cardapios"
    RESTART IDENTITY CASCADE;
  `)
}