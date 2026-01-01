import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { sendPushToProfiles, sendPushToProfile } from './push-notifications';
import * as webpush from 'web-push';

// Mock web-push
mock.module('web-push', () => ({
  setVapidDetails: mock(() => {}),
  sendNotification: mock(() => Promise.resolve({ statusCode: 201 })),
}));

// Mock supabase
const mockSupabase = {
  from: mock(() => ({
    select: mock(() => ({
      eq: mock(() => Promise.resolve({
        data: [{ 
          subscription: { 
            endpoint: 'https://fcm.googleapis.com/test',
            keys: {
              p256dh: 'BKwPHW1wRll_7Rod6_p8sZrIgIXVWAzNPoa7fbqWu3VAwzHjKY8FZbQggHy079JJ718Jhgf6-NSDpu0OcuNxKu0',
              auth: '8X-9-X-9-X-9-X-9-X-9-X-A'
            }
          } 
        }],
        error: null
      })),
    })),
  })),
};

mock.module('@/lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabase))
}));

describe('Server-side Push Notifications Utility', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BKwPHW1wRll_7Rod6_p8sZrIgIXVWAzNPoa7fbqWu3VAwzHjKY8FZbQggHy079JJ718Jhgf6-NSDpu0OcuNxKu0';
    process.env.VAPID_PRIVATE_KEY = 'gUV2GICNEGav2_QHZfjM5NIzFcAvLD-IaluWTOSgNPk';
  });

  it('sendPushToProfile fetches subscriptions and sends notifications', async () => {
    const result = await sendPushToProfile('profile-1', { title: 'Test', body: 'Body' });
    
    expect(result.profileId).toBe('profile-1');
    expect(result.results).toBeDefined();
    expect(result.results?.length).toBe(1);
    expect(result.results?.[0].success).toBe(true);
    
    expect(webpush.sendNotification).toHaveBeenCalled();
  });

  it('sendPushToProfiles sends to multiple unique profiles', async () => {
    const results = await sendPushToProfiles(['p1', 'p2', 'p1'], { title: 'Multiple', body: 'Body' });
    
    expect(results.length).toBe(2); // Unique profiles
    expect(results[0].profileId).toBe('p1');
    expect(results[1].profileId).toBe('p2');
  });

  it('handles profiles with no subscriptions', async () => {
    // Temporarily mock no data
    mockSupabase.from.mockImplementation(((table?: string) => {
      if (table === 'push_subscriptions') {
        return {
          select: mock(() => ({
            eq: mock(() => Promise.resolve({ data: [], error: null }))
          }))
        } as unknown as ReturnType<typeof mockSupabase.from>;
      }
      return {} as unknown as ReturnType<typeof mockSupabase.from>;
    }));

    const result = await sendPushToProfile('no-sub', { title: 'Test', body: 'Body' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('No subscriptions found');
  });
});
