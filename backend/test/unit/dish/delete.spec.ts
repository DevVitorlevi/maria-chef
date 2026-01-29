import { beforeEach, describe, expect, it } from "vitest";
import { CategoriaIngrediente, CategoriaPrato } from "../../../src/generated/prisma/enums";
import { DeleteDishUseCase } from "../../../src/use-cases/dish/delete";
import { ResourceNotFoundError } from "../../../src/utils/errors/resource-not-found-error";
import { InMemoryDishRepository } from "../../in-memory/in-memory-dish-repository";
describe("Delete Dish Use Case", () => {
  let dishRepository: InMemoryDishRepository;
  let sut: DeleteDishUseCase;

  beforeEach(() => {
    dishRepository = new InMemoryDishRepository();
    sut = new DeleteDishUseCase(dishRepository);
  });

  it("should be able to delete a dish and yours all ingredients", async () => {
    const prato = await dishRepository.create({
      nome: "Macarrão à Bolonhesa",
      categoria: CategoriaPrato.ALMOCO,
    });

    await sut.execute({ id: prato.id })

    const dishAfterDelete = await dishRepository.findById(prato.id)

    expect(dishAfterDelete).toBeNull()
  });

  it("should not be able delete dish that not exist", async () => {
    await expect(
      sut.execute({ id: "dish-not-exists" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

})