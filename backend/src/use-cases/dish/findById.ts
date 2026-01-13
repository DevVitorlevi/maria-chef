import type { Ingrediente, Prato } from "@/generated/prisma/client";
import type { DishRepository } from "@/repositories/dish-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
}

interface FindByIdDishUseCaseRequest {
  id: string
}

interface FindByIdDishUseCaseResponse {
  prato: DishWithIngredients
}
export class FindByIdDishUseCase {
  constructor(private dishRepository: DishRepository) { }
  async execute({ id }: FindByIdDishUseCaseRequest): Promise<FindByIdDishUseCaseResponse> {
    const prato = await this.dishRepository.findById(id)

    if (!prato) {
      throw new ResourceNotFoundError()
    }

    return { prato }
  }
}