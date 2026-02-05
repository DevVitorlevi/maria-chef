import Groq from "groq-sdk"
import { env } from "@/env"

export const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
})

export const GROQ_CONFIG = {
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
  max_tokens: 600,
}
