import type { FindAllFiltersParams, FindAllMenusOutput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";

export class FindAllMenusUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute(params?: FindAllFiltersParams): Promise<FindAllMenusOutput> {
    const menus = await this.menuRepository.findAll(params)

    return menus
  }
}