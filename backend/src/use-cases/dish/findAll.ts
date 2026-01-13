import type { CategoriaPrato, Prato } from "@/generated/prisma/client";
import type { DishRepository } from "@/repositories/dish-repository";


interface FindAllDishUseCaseRequest {
  nome?: string | undefined
  categoria?: CategoriaPrato | undefined
}
interface FindAllDishUseCaseResponse {
  pratos: Prato[];
}

export class FindAllDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({ nome, categoria }: FindAllDishUseCaseRequest): Promise<FindAllDishUseCaseResponse> {
    const pratos = await this.dishRepository.findAll({
      nome,
      categoria
    })

    return {
      pratos,
    };
  }
}