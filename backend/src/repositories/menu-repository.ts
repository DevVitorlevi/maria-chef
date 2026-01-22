import type { Cardapio } from "@/generated/prisma/client";
import type { CreateMenuInput } from "./DTOs/menu.dtos";

export interface MenuRepository {
  create(data: CreateMenuInput): Promise<Cardapio>
}