export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'APP_PASSWORD_HASH',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Please check your production settings.`
    );
  }

  // Check for localhost in production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')
  ) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is set to localhost in production. Please update it to your actual Supabase project URL.'
    );
  }
}
