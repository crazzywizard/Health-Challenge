import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import Header from './Header';
import React from 'react';

// Mock next/navigation
mock.module('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: () => {},
    refresh: () => {},
  }),
}));

// Mock next/link
mock.module('next/link', () => {
    return {
      default: ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => {
        return <a href={href} className={className}>{children}</a>;
      }
    };
});

// Mock next/image
mock.module('next/image', () => {
    return {
        default: (props: any) => <img {...props} />
    };
});

describe('Header', () => {
  beforeEach(() => {
    // Clear localStorage and mocks
    localStorage.clear();
    global.fetch = mock(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ authenticated: true }),
    })) as any;
  });

  it('is not visible when not authenticated', async () => {
      global.fetch = mock(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ authenticated: false }),
      })) as any;

      const { container } = render(<Header />);
      
      // Wait for useEffect to run
      await waitFor(() => {
          expect(container.firstChild).toBeNull();
      });
  });

  it('renders title and profile name when authenticated and profile selected', async () => {
      localStorage.setItem('current_profile_id', 'p1');
      localStorage.setItem('current_profile_name', 'Test User');
      
      render(<Header />);
      
      await waitFor(() => {
          expect(screen.getAllByText(/Dashboard/i)).toBeDefined();
          expect(screen.getByText('Test User')).toBeDefined();
      });
  });

  it('shows "Sign Out" button and calls logout on click', async () => {
      localStorage.setItem('current_profile_id', 'p1');
      localStorage.setItem('current_profile_name', 'Test User');
      
      const logoutMock = mock(() => Promise.resolve({ ok: true }));
      global.fetch = mock((url: string) => {
          if (url === '/api/auth/verify') return Promise.resolve({ ok: true, json: () => Promise.resolve({ authenticated: true }) });
          if (url === '/api/auth/logout') return logoutMock();
          return Promise.reject('Unknown URL');
      }) as any;

      render(<Header />);
      
      const signOutButton = await screen.findByText('Sign Out');
      signOutButton.click();
      
      await waitFor(() => {
          expect(logoutMock).toHaveBeenCalled();
          expect(localStorage.getItem('current_profile_id')).toBeNull();
      });
  });
});
