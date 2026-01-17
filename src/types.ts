import { z } from "zod";

// ==========================================
// Input Schemas (for tool arguments)
// ==========================================

export const ListPendingArgsSchema = z.object({
  limit: z.number().optional().default(20),
  action_name: z.string().optional()
});

export const GetOutputArgsSchema = z.object({
  output_id: z.string().uuid()
});

export const MarkExecutedArgsSchema = z.object({
  output_id: z.string().uuid()
});

export const SearchRecordingsArgsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
});

// ==========================================
// Output Types (for tool responses)
// ==========================================

export interface PendingOutput {
  id: string;
  recording_title: string;
  recording_date: string;
  action_name: string;
  output_summary: string;
  created_at: string;
}

export interface ListPendingResult {
  outputs: PendingOutput[];
  total_count: number;
}

export interface OutputDetail {
  id: string;
  recording: {
    id: string;
    title: string;
    duration_seconds: number;
    created_at: string;
  };
  action: {
    id: string;
    name: string;
    description: string | null;
  };
  output_data: Record<string, unknown>;
  transcript: string | null;
  executed: boolean;
  executed_at: string | null;
  created_at: string;
}

export interface MarkExecutedResult {
  success: boolean;
  executed_at: string;
}

export interface RecordingSearchResult {
  id: string;
  title: string;
  duration_seconds: number;
  created_at: string;
  output_count?: number;
}

export interface SearchRecordingsResult {
  recordings: RecordingSearchResult[];
}
