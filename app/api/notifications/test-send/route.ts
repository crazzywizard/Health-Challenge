import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

export async function POST(request: NextRequest) {
  try {
    const { profile_id, title = 'Test Notification', body = 'This is a test notification from 75 Hard!' } = await request.json();

    if (!profile_id) {
      return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 });
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'VAPID keys not configured in environment' }, { status: 500 });
    }

    webpush.setVapidDetails(
      'mailto:crazzywizard@gmail.com', // Replace with your actual email in production
      publicKey,
      privateKey
    );

    const supabase = await createClient();

    // Fetch all subscriptions for this profile
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('profile_id', profile_id);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found for this profile' }, { status: 404 });
    }

    const results = await Promise.all(
      subscriptions.map(async (row) => {
        try {
          const subscription = row.subscription;
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title,
              body,
              url: '/challenges',
            })
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error('Error sending push:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          return { success: false, endpoint: row.subscription.endpoint, error: errorMessage };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in test-send:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
