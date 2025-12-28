'use client';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh(); // Refresh to update auth state in root layout/page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-white">
            U
          </div>
          <div>
            <h2 className="text-xl font-bold">User</h2>
            <p className="text-text-secondary">Welcome back!</p>
          </div>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full btn btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="text-center text-sm text-text-secondary">
        <p>Version 0.1.0</p>
      </div>
    </div>
  );
}
