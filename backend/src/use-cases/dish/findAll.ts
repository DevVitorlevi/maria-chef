import type { Prato } from "@/generated/prisma/client";
import type { DishRepository } from "@/repositories/dish-repository";


interface FindAllDishUseCaseResponse {
  pratos: Prato[];
}

export class FindAllDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute(): Promise<FindAllDishUseCaseResponse> {
    const pratos = await this.dishRepository.findAll()

    return {
      pratos,
    };
  }
}