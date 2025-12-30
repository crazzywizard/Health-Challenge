import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { POST, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = {
  from: mock(() => ({
    select: mock(() => ({
      eq: mock(() => ({
        eq: mock(() => ({
          single: mock(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    insert: mock(() => Promise.resolve({ error: null })),
    delete: mock(() => ({
      eq: mock(() => ({
        eq: mock(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
};

mock.module('@/lib/supabase/server', () => ({
  createClient: mock(() => Promise.resolve(mockSupabase)),
}));

describe('Push Subscription API', () => {
  beforeEach(() => {
    mockSupabase.from.mockClear();
  });

  it('POST saves a new subscription', async () => {
    const req = new NextRequest('http://localhost/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: 'profile-123',
        subscription: { endpoint: 'https://test' }
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('push_subscriptions');
  });

  it('DELETE removes a subscription', async () => {
    const req = new NextRequest('http://localhost/api/notifications/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({
        profile_id: 'profile-123',
        subscription: { endpoint: 'https://test' }
      }),
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('push_subscriptions');
  });

  it('POST returns 400 for missing fields', async () => {
    const req = new NextRequest('http://localhost/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ profile_id: 'profile-123' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
