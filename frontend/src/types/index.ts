/**
 * Type definitions for AdaptEd frontend
 * Matches backend models from backend/models.py
 */

export type HintType = 'direction' | 'question' | 'observation';
export type SandboxMode = 'code' | 'text';

export interface LessonSource {
  title: string;
  url: string;
}

export interface Lesson {
  title: string;
  content: string;
  sources: LessonSource[];
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface CurriculumContent {
  goal: string;
  modules: Module[];
  key_takeaways: string[];
}

export interface LessonResponse {
  id: string;
  goal_raw: string;
  content: CurriculumContent;
  notes: string | null;
  sources: LessonSource[];
  created_at: string;
  sandbox_mode: SandboxMode | null;
  sandbox_language: string | null;
}

export interface Hint {
  hint: string;
  hint_type: HintType;
  attempt_count: number;
  reflect: boolean;
}

export interface ProgressEntry {
  lesson_id: string;
  goal: string;
  completion_pct: number;
  last_accessed: string;
}

export interface CurriculumGenerateRequest {
  goal: string;
  session_id: string;
}

export interface CurriculumGenerateResponse {
  generation_id: string;
  cached: boolean;
}

export interface SandboxHintRequest {
  lesson_id: string;
  module_index: number;
  lesson_index: number;
  user_content: string;
  mode: SandboxMode;
  language: string | null;
  attempt_count: number;
}

export interface ProgressUpdateRequest {
  lesson_id: string;
  module_index: number;
  lesson_index: number;
  viewed: boolean;
}

export interface SSEStatusEvent {
  message: string;
  step: number;
  total_steps: number;
}

export interface SSEChunkEvent {
  content: string;
  module_index: number;
}

export interface SSECompleteEvent {
  lesson_id: string;
  cached: boolean;
}

export interface SSEErrorEvent {
  message: string;
  fatal?: boolean;
}
