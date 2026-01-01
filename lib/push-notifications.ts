import * as webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-side utility for sending Web Push Notifications
 */

// Configure web-push with VAPID keys
export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured in environment');
  }

  webpush.setVapidDetails(
    'mailto:crazzywizard@gmail.com', // Base email from existing code
    publicKey,
    privateKey
  );
}

/**
 * Sends a push notification to all subscriptions of a specific profile
 */
export async function sendPushToProfile(profileId: string, payload: { title: string; body: string; url?: string }) {
  configureWebPush();
  
  const supabase = await createClient();
  
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('profile_id', profileId);

  if (error) {
    console.error(`Error fetching subscriptions for profile ${profileId}:`, error);
    return { profileId, success: false, error: error.message };
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { profileId, success: false, error: 'No subscriptions found' };
  }

  const results = await Promise.all(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify(payload));
        return { success: true };
      } catch (error) {
        console.error(`Error sending push to endpoint ${row.subscription.endpoint}:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    })
  );

  return { profileId, results };
}

/**
 * Sends a push notification to multiple profiles
 */
export async function sendPushToProfiles(profileIds: string[], payload: { title: string; body: string; url?: string }) {
  // Filter unique profile IDs
  const uniqueProfileIds = Array.from(new Set(profileIds)).filter(Boolean);
  
  const results = await Promise.all(
    uniqueProfileIds.map(profileId => sendPushToProfile(profileId, payload))
  );

  return results;
}
