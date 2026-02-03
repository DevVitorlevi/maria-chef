import type { Meal } from "@/@types/menu"
import type { DishSuggestions, MenuContext, SuggestDishesInput } from "./DTOs/ai.dtos"
export interface MenuAiRepository {
  suggests(data: SuggestDishesInput, context: MenuContext, meals: Meal[]): Promise<DishSuggestions>
}