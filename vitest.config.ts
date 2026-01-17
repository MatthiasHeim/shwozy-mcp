import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    testTimeout: 10000,
    env: {
      // Test environment variables for supabase module initialization
      EXPO_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
});
