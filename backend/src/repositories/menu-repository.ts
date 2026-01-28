import type { Cardapio } from "@/generated/prisma/client";
import type { CreateMenuInput, DuplicateMenuOutput, FindAllFiltersParams, FindAllMenusOutput, FindByIdMenuOutput, UpdateMenuInput, UpdateMenuOutput } from "./DTOs/menu.dtos";

export interface MenuRepository {
  create(data: CreateMenuInput): Promise<Cardapio>
  findById(menuId: string): Promise<FindByIdMenuOutput['menu'] | null>
  findAll(params?: FindAllFiltersParams): Promise<FindAllMenusOutput>
  update(id: string, data: UpdateMenuInput): Promise<UpdateMenuOutput>
  duplicate(menuId: string): Promise<DuplicateMenuOutput>
}