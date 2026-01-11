import type { CategoriaPrato, CategoriaIngrediente } from "@/generated/prisma/enums";
import type { DishRepository } from "@/repositories/dish-repository";
import type { Prato, Ingrediente } from "@/generated/prisma/client";

interface CreateDishIngredient {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: CategoriaIngrediente;
}

interface CreateDishUseCaseRequest {
  nome: string;
  categoria: CategoriaPrato;
  ingredientes: CreateDishIngredient[];
}

type DishWithIngredients = Prato & {
  ingredientes: Ingrediente[];
}

interface CreateDishUseCaseResponse {
  prato: DishWithIngredients;
}

export class CreateDishUseCase {
  constructor(private dishRepository: DishRepository) { }

  async execute({
    nome,
    categoria,
    ingredientes,
  }: CreateDishUseCaseRequest): Promise<CreateDishUseCaseResponse> {
    const prato = await this.dishRepository.create({
      nome,
      categoria,
      ingredientes: {
        create: ingredientes.map((ingrediente) => ({
          nome: ingrediente.nome,
          quantidade: ingrediente.quantidade,
          unidade: ingrediente.unidade,
          categoria: ingrediente.categoria,
        })),
      },
    });

    return {
      prato,
    };
  }
}