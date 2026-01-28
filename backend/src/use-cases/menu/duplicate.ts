import type { DuplicateMenuOutput, DuplicateMenuParams } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class DuplicateMenuUseCase {
  constructor(
    private menuRepository: MenuRepository
  ) { }

  async execute({ menuId }: DuplicateMenuParams): Promise<DuplicateMenuOutput> {
    const menuExist = await this.menuRepository.findById(menuId)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    const cardapio = await this.menuRepository.duplicate(menuId)

    return cardapio
  }
}