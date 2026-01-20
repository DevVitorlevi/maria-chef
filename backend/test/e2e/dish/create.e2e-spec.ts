import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { CategoriaPrato } from '@/generated/prisma/enums'
import { setupE2E } from '../../utils/setup-e2e'

describe('Create Dish (E2E)', () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it('should create a dish', async () => {
    const response = await request(app.server)
      .post('/dish')
      .send({
        nome: 'Pizza Margherita',
        categoria: CategoriaPrato.LANCHE,
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        nome: 'Pizza Margherita',
        categoria: CategoriaPrato.LANCHE,
      })
    )
  })
})
