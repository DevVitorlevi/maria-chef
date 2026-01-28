import type { DishRepository } from "@/repositories/dish-repository";
import type { FindAllDishesFiltersInput, FindAllDishesOutput } from "@/repositories/DTOs/dish.dtos";

export class FindAllDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute(params: FindAllDishesFiltersInput): Promise<FindAllDishesOutput> {
    const dishes = await this.dishRepository.findAll(params)

    return {
      dishes,
    };
  }
}