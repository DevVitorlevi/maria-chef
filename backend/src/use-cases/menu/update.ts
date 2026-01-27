import type { UpdateMenuInput, UpdateMenuOutput } from "@/repositories/DTOs/menu.dtos";
import type { MenuRepository } from "@/repositories/menu-repository";
import { ResourceNotFoundError } from "@/utils/errors/resource-not-found-error";

export class UpdateMenuUseCase {
  constructor(private menuRepository: MenuRepository) { }

  async execute(id: string, data: UpdateMenuInput): Promise<UpdateMenuOutput> {
    const menuExist = await this.menuRepository.findById(id)

    if (!menuExist) {
      throw new ResourceNotFoundError()
    }

    if (data.checkIn && data.checkOut && data.checkOut <= data.checkIn) {
      throw new Error('Checkout deve ser posterior ao checkin')
    }

    if (data.adults !== undefined && data.adults < 1) {
      throw new Error('Deve ter pelo menos 1 adulto')
    }

    if (data.checkIn && data.checkOut) {
      const diffInDays = Math.ceil(
        (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffInDays > 30) {
        throw new Error('Período máximo de 30 dias')
      }
    }

    if (data.checkIn || data.checkOut) {
      const newCheckIn = data.checkIn ?? menuExist.checkin
      const newCheckOut = data.checkOut ?? menuExist.checkout

      const mealsOutsidePeriod = menuExist.refeicoes?.filter((meal: { data: string | number | Date; }) => {
        const mealDate = new Date(meal.data)
        return mealDate < newCheckIn || mealDate > newCheckOut
      }) ?? []

      if (mealsOutsidePeriod.length > 0) {
        throw new Error(
          `Não é possível alterar o período pois existem ${mealsOutsidePeriod.length} refeições fora do novo intervalo`
        )
      }
    }

    const updatedMenu = await this.menuRepository.update(id, data)

    return updatedMenu
  }
}