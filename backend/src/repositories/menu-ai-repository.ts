import type { DishSuggestions, SuggestDishesInput, SuggestDishesParams } from "./DTOs/ai.dtos"

export interface MenuAiRepository {
  suggests(params: SuggestDishesParams, data: SuggestDishesInput): Promise<DishSuggestions>
}