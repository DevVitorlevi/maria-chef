import type { DishRepository } from "@/repositories/dish-repository";
import type { DuplicateDishOutput, DuplicateDishParams } from "@/repositories/DTOs/dish.dtos";
export class DuplicateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({
    dishId
  }: DuplicateDishParams): Promise<DuplicateDishOutput> {
    const duplicatedDish = await this.dishRepository.duplicate(dishId);

    return {
      dish: duplicatedDish,
    };
  }
}