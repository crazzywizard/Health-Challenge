import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('app_session');
  const isAuthenticated = session?.value === 'authenticated';
  
  return NextResponse.json({ authenticated: isAuthenticated });
}
