import { app } from '@/app.js'

import { resetDatabase } from './reset-database'
import type { FastifyInstance } from 'fastify'

export async function setupE2ETest(): Promise<FastifyInstance> {
  await app.ready()
  await resetDatabase()
  return app
}

export async function teardownE2ETest() {
  await app.close()
}