import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileIO } from '../hooks/useFileIO';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFileIO', () => {
  const mockOnContentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFileIO('', mockOnContentChange));

    expect(result.current.fileName).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.lastSaved).toBeNull();
  });

  it('should track dirty state when content changes', () => {
    const { result, rerender } = renderHook(
      ({ content }) => useFileIO(content, mockOnContentChange),
      { initialProps: { content: 'initial content' } }
    );

    expect(result.current.isDirty).toBe(false);

    rerender({ content: 'modified content' });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should provide file operations', () => {
    const { result } = renderHook(() =>
      useFileIO('test content', mockOnContentChange)
    );

    expect(typeof result.current.openFile).toBe('function');
    expect(typeof result.current.saveFile).toBe('function');
    expect(typeof result.current.saveAsFile).toBe('function');
    expect(typeof result.current.exportHTML).toBe('function');
    expect(typeof result.current.resetFile).toBe('function');
  });
});
