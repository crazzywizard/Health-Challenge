'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileName, setProfileName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't show header on specific pages or if not authenticated
      if (pathname === '/select-profile' || pathname === '/login') {
        setIsVisible(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          // setIsAuthenticated(true);
          const currentProfileId = localStorage.getItem('current_profile_id');
          const currentName = localStorage.getItem('current_profile_name');
          
          if (currentProfileId) {
            setProfileName(currentName || 'User');
            setAvatarUrl(localStorage.getItem('current_profile_avatar') || '');
            setAvatarColor(localStorage.getItem('current_profile_color') || 'gradient-primary');
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        } else {
          // setIsAuthenticated(false);
          setIsVisible(false);
        }
      } catch {
        setIsVisible(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('current_profile_id');
      localStorage.removeItem('current_profile_name');
      localStorage.removeItem('current_profile_avatar');
      localStorage.removeItem('current_profile_color');
      // setIsAuthenticated(false);
      setIsVisible(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isVisible) return null;

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/challenges')) return 'Challenges';
    if (pathname === '/history') return 'History';
    if (pathname === '/profile') return 'Profile';
    return 'Dashboard';
  };

  return (
    <>
      {/* Header - Desktop Only */}
      <header className="glass sticky top-0 z-[var(--z-sticky)] border-b border-border desktop-only">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-8">
             <Link href="/" className="flex items-center gap-3">
               <h1 className="text-xl font-bold gradient-text">Health Challenge</h1>
             </Link>
             <nav className="flex items-center gap-2">
               <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                 <span>Home</span>
               </Link>
               <Link href="/challenges" className={`nav-link ${pathname.startsWith('/challenges') ? 'active' : ''}`}>
                 <span>Challenges</span>
               </Link>
               <Link href="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>
                 <span>History</span>
               </Link>
             </nav>
           </div>
           <div className="flex items-center gap-4">
             <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className={`w-8 h-8 rounded-full ${avatarColor || 'gradient-primary'} flex items-center justify-center text-xs text-white font-bold overflow-hidden relative`}>
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={profileName} fill className="object-cover" />
                  ) : (
                    profileName.charAt(0).toUpperCase()
                  )}
                </div>
               <span className="text-sm font-medium">{profileName}</span>
             </Link>
             <button 
               onClick={handleLogout}
               className="btn btn-secondary text-sm py-2 px-4 text-red-500 border-red-200 dark:border-red-900/30"
             >
               Sign Out
             </button>
           </div>
        </div>
      </header>
       
       {/* Mobile Header */}
      <header className="glass sticky top-0 z-[var(--z-sticky)] border-b border-border mobile-only pt-[var(--safe-area-top)]">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">{getPageTitle()}</h1>
           <Link href="/profile" className={`w-8 h-8 rounded-full ${avatarColor || 'gradient-primary'} flex items-center justify-center text-xs text-white font-bold overflow-hidden relative`}>
              {avatarUrl ? (
                    <Image src={avatarUrl} alt={profileName} fill className="object-cover" />
                  ) : (
                    profileName.charAt(0).toUpperCase()
                  )}
           </Link>
        </div>
      </header>
    </>
  );
}
