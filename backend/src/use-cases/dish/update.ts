import type { Ingrediente, Prato } from "@/generated/prisma/client";
import type { CategoriaIngrediente, CategoriaPrato } from "@/generated/prisma/enums";
import type { DishRepository } from "@/repositories/dish-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

interface UpdateDishIngredient {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: CategoriaIngrediente;
}

interface UpdateDishUseCaseRequest {
  id: string;
  nome: string;
  categoria: CategoriaPrato;
  ingredientes?: UpdateDishIngredient[];
}

type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
};

interface UpdateDishUseCaseResponse {
  prato: DishWithIngredients;
}

export class UpdateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({
    id,
    nome,
    categoria,
    ingredientes,
  }: UpdateDishUseCaseRequest): Promise<UpdateDishUseCaseResponse> {

    const dishExists = await this.dishRepository.findById(id);

    if (!dishExists) {
      throw new ResourceNotFoundError();
    }

    const prato = await this.dishRepository.update(id, {
      nome,
      categoria,
      ...(ingredientes && {
        ingredientes: {
          deleteMany: {},
          create: ingredientes.map((ingrediente) => ({
            nome: ingrediente.nome,
            quantidade: ingrediente.quantidade,
            unidade: ingrediente.unidade,
            categoria: ingrediente.categoria,
          })),
        },
      }),
    });

    return { prato };
  }
}
