import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.test' })

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'e2e',
    include: ['**/*.e2e-spec.ts'],

    environment: 'node',

    isolate: false,
    pool: 'threads',
    fileParallelism: false,

    globals: true,

    testTimeout: 30_000,
    hookTimeout: 30_000,

  },
})
