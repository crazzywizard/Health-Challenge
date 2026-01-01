import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookie
  response.cookies.delete('app_session');
  response.cookies.delete('current_profile_id');
  
  return response;
}
