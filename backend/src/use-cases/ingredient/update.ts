import type { Ingrediente } from "@/generated/prisma/client";
import type { CategoriaIngrediente } from "@/generated/prisma/enums";
import type { DishRepository } from "@/repositories/dish-repository";
import type { IngredientRepository } from "@/repositories/ingredient-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

interface UpdateIngredientUseCaseRequest {
  nome: string
  quantidade: number
  unidade: string
  categoria: CategoriaIngrediente
  dishId: string
  ingredientId: string
}
interface UpdateIngredientUseCaseResponse {
  ingredient: Ingrediente | null
}
export class UpdateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository, private dishRepository: DishRepository) { }

  async execute({ nome, quantidade, unidade, categoria, dishId, ingredientId }: UpdateIngredientUseCaseRequest): Promise<UpdateIngredientUseCaseResponse> {
    const dishExists = await this.dishRepository.findById(dishId)

    if (!dishExists) {
      throw new ResourceNotFoundError()
    }
    const ingredient = await this.ingredientRepository.update(
      dishId,
      ingredientId,
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