import type { DishRepository } from "@/repositories/dish-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

interface DeleteDishUseCaseRequest {
  id: string
}
export class DeleteDishUseCase {
  constructor(private dishRepository: DishRepository) { }
  async execute({ id }: DeleteDishUseCaseRequest) {

    try {
      await this.dishRepository.delete(id)
    } catch {
      throw new ResourceNotFoundError()
    }
  }
}