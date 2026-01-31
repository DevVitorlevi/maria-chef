import type { DeleteMenuParams } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class DeleteMenuUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute({ id }: DeleteMenuParams) {
    const menuExist = await this.menuRepository.findById(id)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    return await this.menuRepository.delete(id)
  }
}