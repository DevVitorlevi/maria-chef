import type { CreateMenuInput, CreateMenuOutput, DuplicateMenuOutput, FindAllFiltersParams, FindAllMenusOutput, FindByIdMenuOutput, UpdateMenuInput, UpdateMenuOutput } from "./DTOs/menu.dtos";

export interface MenuRepository {
  create(data: CreateMenuInput): Promise<CreateMenuOutput>
  findById(menuId: string): Promise<FindByIdMenuOutput | null>
  findAll(params?: FindAllFiltersParams): Promise<FindAllMenusOutput>
  update(
    id: string,
    data: UpdateMenuInput
  ): Promise<UpdateMenuOutput>
  duplicate(menuId: string): Promise<DuplicateMenuOutput>
  delete(id: string): void
}