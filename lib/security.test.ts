import { describe, it, expect, mock } from 'bun:test';
import { verifyParticipantOwnership, verifyProgressOwnership } from './security';

describe('security utilities', () => {
  describe('verifyParticipantOwnership', () => {
    it('returns true if participant belongs to the profile', async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { profile_id: 'profile-1' }, error: null })
            })
          })
        })
      } as any;

      const result = await verifyParticipantOwnership(mockSupabase, 'part-1', 'profile-1');
      expect(result).toBe(true);
    });

    it('returns false if participant belongs to a different profile', async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { profile_id: 'profile-2' }, error: null })
            })
          })
        })
      } as any;

      const result = await verifyParticipantOwnership(mockSupabase, 'part-1', 'profile-1');
      expect(result).toBe(false);
    });

    it('returns false if participant is not found or error occurs', async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: { message: 'Not found' } })
            })
          })
        })
      } as any;

      const result = await verifyParticipantOwnership(mockSupabase, 'part-1', 'profile-1');
      expect(result).toBe(false);
    });
  });

  describe('verifyProgressOwnership', () => {
    it('returns true if progress record belongs to a participant of the profile', async () => {
      const mockSupabase = {
        from: (table: string) => {
          if (table === 'daily_progress') {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: { participant_id: 'part-1' }, error: null })
                })
              })
            };
          }
          if (table === 'participants') {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: { profile_id: 'profile-1' }, error: null })
                })
              })
            };
          }
          return {};
        }
      } as any;

      const result = await verifyProgressOwnership(mockSupabase, 'prog-1', 'profile-1');
      expect(result).toBe(true);
    });

    it('returns false if progress record belongs to a participant of a different profile', async () => {
      const mockSupabase = {
        from: (table: string) => {
          if (table === 'daily_progress') {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: { participant_id: 'part-1' }, error: null })
                })
              })
            };
          }
          if (table === 'participants') {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: { profile_id: 'profile-2' }, error: null })
                })
              })
            };
          }
          return {};
        }
      } as any;

      const result = await verifyProgressOwnership(mockSupabase, 'prog-1', 'profile-1');
      expect(result).toBe(false);
    });
  });
});
