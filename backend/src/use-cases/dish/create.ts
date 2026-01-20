import type { DishRepository } from "@/repositories/dish-repository";
import type { CreateDishInput } from "@/repositories/DTOs/dish/create-dish-input";
import type { CreateDishOutput } from "@/repositories/DTOs/dish/create-dish-output";

export class CreateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({
    nome,
    categoria,
  }: CreateDishInput): Promise<CreateDishOutput> {
    const dish = await this.dishRepository.create({
      nome,
      categoria,
    });

    return {
      dish,
    };
  }
}