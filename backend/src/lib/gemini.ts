import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/env'

if (!env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não configurada no .env')
}

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const model = genAI.getGenerativeModel({
  model: env.GEMINI_MODEL || 'gemini-pro',
})

export const generationConfig = {
  maxOutputTokens: env.GEMINI_MAX_TOKENS || 2048,
  temperature: env.GEMINI_TEMPERATURE || 0.7,
}