import { supabase } from "../db/supabase.js";
import {
  SearchRecordingsArgsSchema,
  SearchRecordingsResult,
  RecordingSearchResult,
} from "../types.js";

export async function searchRecordings(
  args: unknown,
  userId: string
): Promise<SearchRecordingsResult> {
  const { query, limit } = SearchRecordingsArgsSchema.parse(args);

  // Use SECURITY DEFINER function to bypass RLS
  const { data, error } = await supabase.rpc("search_user_recordings", {
    p_user_id: userId,
    p_query: query,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordings: RecordingSearchResult[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || "Untitled",
    duration_seconds: row.duration,
    created_at: row.created_at,
    output_count: Number(row.output_count),
  }));

  return { recordings };
}
