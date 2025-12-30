import { describe, it, expect, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import BottomNav from './BottomNav';
import React from 'react';

// Mock next/navigation
mock.module('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/link
mock.module('next/link', () => {
  return {
    default: ({ children, href, className }: { children: React.ReactNode, href: string, className?: string }) => {
      return <a href={href} className={className}>{children}</a>;
    }
  };
});

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(<BottomNav />);
    
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Challenges')).toBeDefined();
    expect(screen.getByText('History')).toBeDefined();
    expect(screen.getByText('Profile')).toBeDefined();
  });

  it('marks the current path as active', () => {
    // Note: To test different pathnames, we might need a more dynamic mock
    // or to use a helper that allows overriding the mock per test.
    render(<BottomNav />);
    
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink?.className).toContain('active');
  });
});
