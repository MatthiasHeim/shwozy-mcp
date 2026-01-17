import { supabase } from "../db/supabase.js";
import { MarkExecutedArgsSchema, MarkExecutedResult } from "../types.js";

export async function markExecuted(
  args: unknown,
  userId: string
): Promise<MarkExecutedResult> {
  const { output_id } = MarkExecutedArgsSchema.parse(args);

  // Use SECURITY DEFINER function to bypass RLS
  const { data, error } = await supabase.rpc("mark_output_executed", {
    p_user_id: userId,
    p_output_id: output_id,
  });

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Action output not found: ${output_id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data[0] as any;

  return {
    success: true,
    executed_at: row.executed_at,
  };
}
