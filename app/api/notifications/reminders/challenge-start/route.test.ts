import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock push-notifications
mock.module('@/lib/push-notifications', () => ({
  sendPushToProfiles: mock(() => Promise.resolve([
    { profileId: 'p1', results: [{ success: true }] }
  ]))
}));

// Mock supabase
const mockSupabase = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  from: mock((_: string) => ({
    select: mock(() => ({
      eq: mock(() => ({
        not: mock(() => Promise.resolve({
            data: [{ profile_id: 'p1' }],
            error: null
        })),
        // Overload for challenges query
        promise: Promise.resolve({
            data: [{ id: 'c1', name: 'Challenge 1' }],
            error: null
        })
      })),
      // Direct call for challenges
      promiseChallenges: Promise.resolve({
        data: [{ id: 'c1', name: 'Challenge 1' }],
        error: null
      })
    })),
  })),
};

// More specific mock for challenges vs participants
mockSupabase.from.mockImplementation((table: string) => {
    if (table === 'challenges') {
        return {
            select: mock(() => ({
                eq: mock(() => Promise.resolve({
                    data: [{ id: 'c1', name: 'Challenge 1' }],
                    error: null
                }))
            }))
        };
    }
    if (table === 'participants') {
        return {
            select: mock(() => ({
                eq: mock(() => ({
                    not: mock(() => Promise.resolve({
                        data: [{ profile_id: 'p1' }],
                        error: null
                    }))
                }))
            }))
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any;
});

mock.module('@/lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabase))
}));

describe('Challenge Start Reminder API Route', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('returns 401 if secret is incorrect', async () => {
    const req = new NextRequest('http://localhost/api/notifications/reminders/challenge-start', {
      headers: { 'Authorization': 'Bearer wrong' }
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('processes upcoming challenges and returns summary', async () => {
    const req = new NextRequest('http://localhost/api/notifications/reminders/challenge-start', {
      headers: { 'Authorization': 'Bearer test-secret' }
    });
    
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.challengesFound).toBe(1);
    expect(data.totalNotificationsSent).toBe(1);
    expect(data.summary[0].challengeName).toBe('Challenge 1');
  });

  it('handles case with no challenges tomorrow', async () => {
    // Mock no challenges
    mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'challenges') {
            return {
                select: mock(() => ({
                    eq: mock(() => Promise.resolve({ data: [], error: null }))
                }))
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {} as any;
    });

    const req = new NextRequest('http://localhost/api/notifications/reminders/challenge-start', {
      headers: { 'Authorization': 'Bearer test-secret' }
    });
    
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.message).toContain('No challenges starting');
  });
});
