import type { DishRepository } from "@/repositories/dish-repository";
import type { UpdateDishInput } from "@/repositories/DTOs/dish.dtos";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class UpdateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute(dishId: string, data: UpdateDishInput) {

    const dishExists = await this.dishRepository.findById({ dishId });

    if (!dishExists) {
      throw new ResourceNotFoundError();
    }

    const { dish } = await this.dishRepository.update(dishId, data);

    return dish;
  }
}