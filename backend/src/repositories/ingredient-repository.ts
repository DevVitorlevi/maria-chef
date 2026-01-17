import { type CategoriaIngrediente, type Ingrediente } from "@/generated/prisma/client"

export interface CreateIngredientDTO {
  nome: string
  quantidade: number
  unidade: string
  categoria: CategoriaIngrediente
}
export interface IngredientRepository {
  create(dishId: string, ingredient: CreateIngredientDTO): Promise<Ingrediente>
}