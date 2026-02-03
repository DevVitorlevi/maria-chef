import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  GEMINI_API_KEY: z.string(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash-latest'),
  GEMINI_MAX_TOKENS: z.coerce.number().default(2048),
  GEMINI_TEMPERATURE: z.coerce.number().default(0.7),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = _env.data