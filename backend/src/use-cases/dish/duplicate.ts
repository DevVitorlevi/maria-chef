import type { DishRepository, DishWithIngredients } from "@/repositories/dish-repository";

interface DuplicateDishUseCaseRequest {
  dishId: string;
}

interface DuplicateDishUseCaseResponse {
  dish: DishWithIngredients;
}

export class DuplicateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({
    dishId,
  }: DuplicateDishUseCaseRequest): Promise<DuplicateDishUseCaseResponse> {
    const duplicatedDish = await this.dishRepository.duplicate(dishId, {});

    return {
      dish: duplicatedDish,
    };
  }
}