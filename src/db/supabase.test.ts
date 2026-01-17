import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashApiKey } from "./supabase.js";

// Note: We test hashApiKey directly since it's a pure function.
// validateApiKey requires mocking Supabase which is complex with ESM.
// Integration tests would cover the full auth flow.

describe("hashApiKey", () => {
  it("should produce consistent SHA-256 hash", () => {
    const testKey = "sk_test_key_12345";
    const hash1 = hashApiKey(testKey);
    const hash2 = hashApiKey(testKey);

    expect(hash1).toBe(hash2);
  });

  it("should produce 64-character hex string", () => {
    const hash = hashApiKey("any_key");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it("should produce different hashes for different keys", () => {
    const hash1 = hashApiKey("key1");
    const hash2 = hashApiKey("key2");

    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty string", () => {
    const hash = hashApiKey("");

    // SHA-256 of empty string is known
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("should handle special characters", () => {
    const hash = hashApiKey("sk_test_!@#$%^&*()");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
