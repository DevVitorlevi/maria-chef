import type { DishRepository } from "@/repositories/dish-repository";
import type { FindByIdDishOutput, FindByIdDishParams } from "@/repositories/DTOs/dish.dtos";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
export class FindByIdDishUseCase {
  constructor(private dishRepository: DishRepository) { }
  async execute({ dishId }: FindByIdDishParams): Promise<FindByIdDishOutput> {
    const dish = await this.dishRepository.findById({
      dishId
    })

    if (!dish) {
      throw new ResourceNotFoundError()
    }

    return { dish }
  }
}