import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { resetDatabase } from './reset-database'

let isSetup = false
export async function setupE2E() {
  if (!isSetup) {
    await app.ready()
    isSetup = true
  }

  await resetDatabase()
  return app
}


export async function teardownE2E() {
  await prisma.$disconnect()
  await app.close()
}
