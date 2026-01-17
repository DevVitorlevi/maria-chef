import type { Ingrediente } from "@/generated/prisma/client";
import type { CategoriaIngrediente } from "@/generated/prisma/enums";
import type { DishRepository } from "@/repositories/dish-repository";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

interface CreateIngredientUseCaseRequest {
  nome: string
  quantidade: number
  unidade: string
  categoria: CategoriaIngrediente
  dishId: string
}
interface CreateIngredientUseCaseResponse {
  ingredient: Ingrediente
}
export class CreateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository, private dishRepository: DishRepository) { }

  async execute({ nome, quantidade, unidade, categoria, dishId }: CreateIngredientUseCaseRequest): Promise<CreateIngredientUseCaseResponse> {
    const dishExists = await this.dishRepository.findById(dishId)

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }
    const ingredient = await this.ingredientRepository.create(
      dishId,
      {
        nome,
        quantidade,
        unidade,
        categoria,
      }
    )

    return {
      ingredient
    }
  }
}