import type { CreateMenuInput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { InvalidDateError } from "@/utils/errors/invalid-date-error";

export class CreateMenuUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute(
    { title, checkIn, checkOut, adults, kids, restricoes, preferencias }: CreateMenuInput
  ) {

    if (checkIn > checkOut) {
      throw new InvalidDateError()
    }
    const menu = await this.menuRepository.create({
      title,
      checkIn,
      checkOut,
      adults,
      kids: kids ?? 0,
      restricoes: restricoes ?? [],
      preferencias: preferencias ?? undefined
    })

    return { menu }
  }
}