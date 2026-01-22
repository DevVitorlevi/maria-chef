import type { FindByIdMenuOutput, FindByIdMenuParams } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class FindByIdMenuUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute({ menuId }: FindByIdMenuParams): Promise<FindByIdMenuOutput> {
    const menu = await this.menuRepository.findById(menuId)

    if (!menu) {
      throw new ResourceNotFoundError()
    }
    1
    return { menu }
  }
}