import type { Meal } from "@/@types/menu"
import type {
  DishSuggestions,
  MenuContext,
  RegenerateSuggestionsInput,
  SuggestDishesInput,
  SuggestVariationsInput,
  VariationSuggestionsResponse
} from "./DTOs/ai.dtos"

export interface MenuAiRepository {
  suggests(
    data: SuggestDishesInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions>

  regenerate(
    data: RegenerateSuggestionsInput,
    context: MenuContext,
    meals: Meal[]
  ): Promise<DishSuggestions>

  variations(
    pratoOriginal: string,
    data: SuggestVariationsInput
  ): Promise<VariationSuggestionsResponse>
}