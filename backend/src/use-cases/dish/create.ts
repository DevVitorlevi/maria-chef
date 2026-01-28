import type { DishRepository } from "@/repositories/dish-repository";
import type { CreateDishInput, CreateDishOutput } from "@/repositories/DTOs/dish.dtos";

export class CreateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute(data: CreateDishInput): Promise<CreateDishOutput> {
    const dish = await this.dishRepository.create(data);

    return {
      dish,
    };
  }
}