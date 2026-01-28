import type { DishRepository } from "@/repositories/dish-repository";
import type { DeleteDishParams } from "@/repositories/DTOs/dish.dtos";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";
export class DeleteDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({ id }: DeleteDishParams) {

    try {
      await this.dishRepository.delete(id)

    } catch {
      throw new ResourceNotFoundError()
    }
  }
}