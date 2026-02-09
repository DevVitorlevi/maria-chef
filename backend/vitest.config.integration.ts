import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: "integration",
    include: ['test/integration/*.spec.ts']
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});