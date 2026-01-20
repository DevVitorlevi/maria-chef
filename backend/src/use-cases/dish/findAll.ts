import type { DishRepository } from "@/repositories/dish-repository";
import type { FindAllDishesFiltersInput, FindAllDishesOutput } from "@/repositories/DTOs/dish.dtos";

export class FindAllDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({ nome, categoria }: FindAllDishesFiltersInput): Promise<FindAllDishesOutput> {
    const dishes = await this.dishRepository.findAll({
      nome,
      categoria
    })

    return {
      dishes,
    };
  }
}