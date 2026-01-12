import { prisma } from '@/lib/prisma.js'

export async function resetDatabase() {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "cardapios" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "refeicoes" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "pratos" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "ingredientes" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "listas_compras" RESTART IDENTITY CASCADE;`

    await new Promise(resolve => setTimeout(resolve, 50))
  } catch (error) {
    console.error('Error resetting database:', error)
    throw error
  }
}

export async function closeDatabase() {
  await prisma.$disconnect()
}