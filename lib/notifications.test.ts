import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush,
  getPushSubscription
} from './notifications';

// Mock Notification API
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: mock(() => Promise.resolve('granted' as NotificationPermission)),
};

// Mock Navigator/ServiceWorker API
const mockSubscription = {
  toJSON: () => ({ endpoint: 'https://mock.endpoint', keys: { auth: 'mock', p256dh: 'mock' } }),
  unsubscribe: mock(() => Promise.resolve(true)),
};

const mockPushManager = {
  subscribe: mock(() => Promise.resolve(mockSubscription)),
  getSubscription: mock(() => Promise.resolve(mockSubscription)),
};

const mockRegistration = {
  pushManager: mockPushManager,
};

const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve(mockRegistration),
  },
};

describe('notifications logic', () => {
  let originalNotification: typeof Notification | undefined;
  let originalNavigator: typeof navigator | undefined;
  let originalWindow: typeof window | undefined;
  let originalAtob: typeof atob | undefined;

  beforeEach(() => {
    originalNotification = global.Notification;
    originalNavigator = global.navigator;
    originalWindow = global.window;
    
    // @ts-expect-error - Mocking global Notification
    global.Notification = mockNotification;
    // @ts-expect-error - Mocking global navigator
    global.navigator = mockNavigator;
    
    if (global.window) {
      originalAtob = global.window.atob;
      // @ts-expect-error - Mocking Notification on window
      global.window.Notification = mockNotification;
      global.window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
    }

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BIy_6gIjjRTPHYW3DCY-KFoiY_eXiv462Ko2ZYkS6TqvazGrfLKaRhVKhvsXJnyKGYThE8FMJ7-szaZDdMdOVKc';
    
    // Clear mocks
    mockNotification.requestPermission.mockClear();
    mockPushManager.subscribe.mockClear();
    mockPushManager.getSubscription.mockClear();
    mockSubscription.unsubscribe.mockClear();
  });

  afterEach(() => {
    // @ts-expect-error - Restoring global Notification
    global.Notification = originalNotification;
    // @ts-expect-error - Restoring global navigator
    global.navigator = originalNavigator;
    // @ts-expect-error - Restoring global window
    global.window = originalWindow;
    
    if (global.window && originalAtob) {
      global.window.atob = originalAtob;
    }
  });

  it('checkNotificationPermission returns permission status', async () => {
    mockNotification.permission = 'granted';
    expect(await checkNotificationPermission()).toBe('granted');
  });

  it('requestNotificationPermission requests permission', async () => {
    const permission = await requestNotificationPermission();
    expect(permission).toBe('granted');
    expect(mockNotification.requestPermission).toHaveBeenCalled();
  });

  it('subscribeToPush subscribes and sends to backend', async () => {
    // Mock fetch
    global.fetch = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })) as unknown as typeof fetch;

    const subscription = await subscribeToPush('profile-123');
    
    expect(subscription).toBeDefined();
    expect(mockPushManager.subscribe).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/notifications/subscribe', expect.any(Object));
  });

  it('unsubscribeFromPush unsubscribes and notifies backend', async () => {
    // Mock fetch
    global.fetch = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })) as unknown as typeof fetch;

    await unsubscribeFromPush('profile-123');
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/notifications/subscribe', expect.objectContaining({
      method: 'DELETE'
    }));
  });

  it('getPushSubscription returns current subscription', async () => {
    const subscription = await getPushSubscription();
    expect(subscription).toBeDefined();
    expect(mockPushManager.getSubscription).toHaveBeenCalled();
  });
});
