import type { Cardapio } from "@/generated/prisma/client";
import type { CreateMenuInput, FindAllFiltersParams, FindAllMenusOutput } from "./DTOs/menu.dtos";

export interface MenuRepository {
  create(data: CreateMenuInput): Promise<Cardapio>
  findById(menuId: string): Promise<Cardapio | null>
  findAll(params?: FindAllFiltersParams): Promise<FindAllMenusOutput>
}