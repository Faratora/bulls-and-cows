import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The tooling setup commit has no tests yet: an empty suite must pass.
    passWithNoTests: true,
  },
});
