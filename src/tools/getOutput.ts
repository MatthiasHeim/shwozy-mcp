import { supabase } from "../db/supabase.js";
import { GetOutputArgsSchema, OutputDetail } from "../types.js";

export async function getActionOutput(
  args: unknown,
  userId: string
): Promise<OutputDetail> {
  const { output_id } = GetOutputArgsSchema.parse(args);

  // Use SECURITY DEFINER function to bypass RLS
  const { data, error } = await supabase.rpc("get_output_detail", {
    p_user_id: userId,
    p_output_id: output_id,
  });

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Action output not found: ${output_id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data[0] as any;

  return {
    id: row.id,
    recording: {
      id: row.recording_id,
      title: row.recording_title || "Untitled",
      duration_seconds: row.recording_duration,
      created_at: row.recording_created_at,
    },
    action: {
      id: row.action_id,
      name: row.action_name,
      description: "", // Not included in function, can add if needed
    },
    output_data: row.output_data as Record<string, unknown>,
    transcript: row.transcript,
    executed: row.executed,
    executed_at: row.executed_at,
    created_at: row.created_at,
  };
}
