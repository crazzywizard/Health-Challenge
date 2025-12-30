import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AvatarPicker from './AvatarPicker';
import React from 'react';
import { describe, it, expect, mock, spyOn, afterEach } from 'bun:test';

afterEach(cleanup);

// Mock next/image
mock.module('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; fill?: boolean; className?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  },
}));

describe('AvatarPicker', () => {
  it('renders all predefined icons', () => {
    const onSelect = () => {};
    render(<AvatarPicker onSelect={onSelect} />);
    
    // Check for some predefined icons by alt text
    expect(screen.getByAltText('Kettlebell')).toBeDefined();
    expect(screen.getByAltText('Strength')).toBeDefined();
    expect(screen.getByAltText('Cardio')).toBeDefined();
    expect(screen.getByAltText('Mindfulness')).toBeDefined();
  });

  it('calls onSelect when an icon is clicked', () => {
    const onSelect = mock(() => {});
    render(<AvatarPicker onSelect={onSelect} />);
    
    const kettlebellBtn = screen.getByAltText('Kettlebell').closest('button');
    if (kettlebellBtn) {
      fireEvent.click(kettlebellBtn);
    }
    
    expect(onSelect).toHaveBeenCalledWith('/avatars/kettlebell.png');
  });

  it('highlights the current selection', () => {
    const onSelect = () => {};
    const currentUrl = '/avatars/kettlebell.png';
    render(<AvatarPicker onSelect={onSelect} currentUrl={currentUrl} />);
    
    const kettlebellBtn = screen.getByAltText('Kettlebell').closest('button');
    expect(kettlebellBtn?.className).toContain('border-white');
  });

  it('handles successful file upload', async () => {
    const onSelect = mock(() => {});
    // Mock global fetch
    const mockFetch = spyOn(globalThis, 'fetch').mockImplementation((() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: '/uploads/new-avatar.png' }),
      } as Response)
    ) as unknown as typeof globalThis.fetch);

    const { container } = render(<AvatarPicker onSelect={onSelect} />);
    
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Use hidden input directly
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('/uploads/new-avatar.png');
    });

    mockFetch.mockRestore();
  });

  it('handles failed file upload', async () => {
    const onSelect = mock(() => {});
    // Mock global fetch failure
    const mockFetch = spyOn(globalThis, 'fetch').mockImplementation((() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      } as unknown as Response)
    ) as unknown as typeof globalThis.fetch);
    
    const mockAlert = spyOn(globalThis, 'alert').mockImplementation(() => {});

    const { container } = render(<AvatarPicker onSelect={onSelect} />);
    
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });

    mockFetch.mockRestore();
    mockAlert.mockRestore();
  });
});
