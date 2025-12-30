// Database types matching Supabase schema

export type ChallengeStatus = 'upcoming' | 'active' | 'completed';
export type RuleType = 'boolean' | 'numeric' | 'text';

export interface Profile {
  id: string;
  name: string;
  avatar_color: string;
  avatar_url?: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  status: ChallengeStatus;
  created_at: string;
  updated_at: string;
}

export interface Rule {
  id: string;
  challenge_id: string;
  description: string;
  rule_type: RuleType;
  target_value: string | null;
  order_index: number;
  created_at: string;
}

export interface Participant {
  id: string;
  challenge_id: string;
  name: string;
  email: string | null;
  profile_id?: string;
  profile?: {
    id: string;
    avatar_url: string | null;
    avatar_color: string;
  };
  joined_at: string;
}

export interface DailyProgress {
  id: string;
  participant_id: string;
  rule_id: string;
  date: string; // ISO date string
  completed: boolean;
  value: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations for UI
export interface ChallengeWithDetails extends Challenge {
  rules: Rule[];
  participants: ParticipantWithProgress[];
}

export interface ParticipantWithProgress extends Participant {
  progress: DailyProgress[];
  completion_percentage?: number;
  current_streak?: number;
}

// Form types for creating/updating
export interface CreateChallengeInput {
  name: string;
  description?: string;
  duration_days: number;
  start_date: string;
  rules: CreateRuleInput[];
}

export interface CreateRuleInput {
  description: string;
  rule_type: RuleType;
  target_value?: string;
  order_index: number;
}

export interface CreateParticipantInput {
  challenge_id: string;
  name: string;
  email?: string;
  profile_id?: string;
}

export interface UpdateProgressInput {
  participant_id: string;
  rule_id: string;
  date: string;
  completed: boolean;
  value?: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
