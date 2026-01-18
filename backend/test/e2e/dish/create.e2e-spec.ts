import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

import { CategoriaIngrediente, CategoriaPrato } from '@/generated/prisma/enums'
import { setupE2E } from '../../utils/setup-e2e'

describe('Create Dish (E2E)', () => {
  let app: Awaited<ReturnType<typeof setupE2E>>

  beforeEach(async () => {
    app = await setupE2E()
  })

  it('should create a dish with ingredients', async () => {
    const response = await request(app.server)
      .post('/dish')
      .send({
        nome: 'Pizza Margherita',
        categoria: CategoriaPrato.LANCHE,
        ingredientes: [
          {
            nome: 'Farinha',
            quantidade: 1,
            unidade: 'kg',
            categoria: CategoriaIngrediente.OUTROS,
          },
          {
            nome: 'Tomate',
            quantidade: 3,
            unidade: 'un',
            categoria: CategoriaIngrediente.HORTIFRUTI,
          },
        ],
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        nome: 'Pizza Margherita',
        categoria: CategoriaPrato.LANCHE,
        ingredientes: expect.arrayContaining([
          expect.objectContaining({
            nome: 'Farinha',
            quantidade: '1',
            unidade: 'kg',
            categoria: CategoriaIngrediente.OUTROS,
          }),
          expect.objectContaining({
            nome: 'Tomate',
            quantidade: '3',
            unidade: 'un',
            categoria: CategoriaIngrediente.HORTIFRUTI,
          }),
        ]),
      })
    )
  })
})
