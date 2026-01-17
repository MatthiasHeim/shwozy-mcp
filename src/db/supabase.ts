import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// For stdio mode, API key comes from env var
const envApiKey = process.env.SHWOZY_API_KEY;

// Check required Supabase config (needed for both modes)
if (!supabaseUrl) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL environment variable");
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable");
  process.exit(1);
}

/**
 * Hash an API key using SHA-256 (matches the mobile app's hashing)
 */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Create Supabase client with anon key (respects RLS)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Validated user ID for stdio mode (set during initialization)
let validatedUserId: string | null = null;

/**
 * Validate an API key and return the associated user ID
 * Used for per-request authentication in HTTP mode
 *
 * @param apiKey - The API key to validate (e.g., "sk_xxx")
 * @returns The user ID associated with the API key
 * @throws Error if the API key is invalid
 */
export async function validateApiKey(apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const keyHash = hashApiKey(apiKey);

  const { data, error } = await supabase.rpc("validate_api_key", {
    api_key_hash: keyHash,
  });

  if (error) {
    throw new Error(`API key validation failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Invalid API key - no matching user found");
  }

  const userId: string = data[0].user_id;
  return userId;
}

/**
 * Validate the API key from environment and cache the user ID
 * Used for stdio mode where auth happens once at startup
 * Must be called before any database operations in stdio mode
 */
export async function validateAndSetUser(): Promise<string> {
  if (!envApiKey) {
    console.error("Missing SHWOZY_API_KEY environment variable");
    process.exit(1);
  }

  try {
    const userId = await validateApiKey(envApiKey);
    validatedUserId = userId;
    console.error(`Authenticated as user: ${userId}`);
    return userId;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Authentication failed");
    process.exit(1);
  }
}

/**
 * Get the cached validated user ID (stdio mode only)
 * Throws if validateAndSetUser() hasn't been called
 */
export function getUserId(): string {
  if (!validatedUserId) {
    throw new Error("User not validated. Call validateAndSetUser() first.");
  }
  return validatedUserId;
}
