import { GoogleGenAI } from "@google/genai"
import { env } from "@/env"

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY
})

export const GEMINI_CONFIG = {
  model: env.GEMINI_MODEL,
  config: {
    temperature: env.GEMINI_TEMPERATURE,
    maxOutputTokens: env.GEMINI_MAX_TOKENS,
    responseMimeType: "application/json",
  }
}