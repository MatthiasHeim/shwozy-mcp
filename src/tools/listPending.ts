import { supabase } from "../db/supabase.js";
import {
  ListPendingArgsSchema,
  ListPendingResult,
  PendingOutput,
} from "../types.js";

export async function listPendingActions(
  args: unknown,
  userId: string
): Promise<ListPendingResult> {
  const { limit, action_name } = ListPendingArgsSchema.parse(args);

  // Use SECURITY DEFINER function to bypass RLS
  // This is safe because we've already validated the API key and have the correct userId
  const { data, error } = await supabase.rpc("get_pending_outputs", {
    p_user_id: userId,
    p_limit: limit,
    p_action_name: action_name || null,
  });

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputs: PendingOutput[] = (data || []).map((row: any) => ({
    id: row.id,
    recording_title: row.recording_title || "Untitled",
    recording_date: row.recording_created_at || row.created_at,
    action_name: row.action_name || "Unknown",
    output_summary: summarizeOutput(row.output_data),
    created_at: row.created_at,
  }));

  return {
    outputs,
    total_count: outputs.length,
  };
}

function summarizeOutput(data: unknown): string {
  const str = JSON.stringify(data);
  if (str.length <= 200) return str;
  return str.substring(0, 197) + "...";
}
