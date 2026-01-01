import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if a participant belongs to a specific profile.
 */
export async function verifyParticipantOwnership(
  supabase: SupabaseClient,
  participantId: string,
  profileId: string
): Promise<boolean> {
  const { data: participant, error } = await supabase
    .from('participants')
    .select('profile_id')
    .eq('id', participantId)
    .single();

  if (error || !participant) return false;
  return participant.profile_id === profileId;
}

/**
 * Checks if a progress record belongs to a participant of a specific profile.
 */
export async function verifyProgressOwnership(
  supabase: SupabaseClient,
  progressId: string,
  profileId: string
): Promise<boolean> {
  const { data: progress, error: prError } = await supabase
    .from('daily_progress')
    .select('participant_id')
    .eq('id', progressId)
    .single();

  if (prError || !progress) return false;

  return verifyParticipantOwnership(supabase, progress.participant_id, profileId);
}
