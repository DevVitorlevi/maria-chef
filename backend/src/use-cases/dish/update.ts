import type { DishRepository } from "@/repositories/dish-repository";
import type { UpdateDishInput } from "@/repositories/DTOs/dish.dtos";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
export class UpdateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute(dishId: string, {
    nome,
    categoria
  }: UpdateDishInput) {

    const dishExists = await this.dishRepository.findById({ dishId });

    if (!dishExists) {
      throw new ResourceNotFoundError();
    }

    const prato = await this.dishRepository.update(dishId, {
      nome,
      categoria
    });

    return { prato };
  }
}
