import type { CreateMenuInput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { InvalidDateError } from "@/utils/errors/invalid-date-error";

export class CreateMenuUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute(
    data: CreateMenuInput
  ) {

    if (data.checkIn > data.checkOut) {
      throw new InvalidDateError()
    }
    const menu = await this.menuRepository.create(data)

    return { menu }
  }
}